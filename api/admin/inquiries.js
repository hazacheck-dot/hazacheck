// Vercel Serverless Function - 관리자 문의 관리 API
// Path: /api/admin/inquiries

const { sql } = require('@vercel/postgres');

// Minimal Telegram notifier (HTML mode)
async function sendStatusChangeNotification(inquiryId, oldStatus, newStatus, adminNote = '') {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return null;

    const statusEmoji = { pending: '⏳', answered: '✅', completed: '🎉', cancelled: '❌' };
    const statusText = { pending: '답변 대기', answered: '답변 완료', completed: '처리 완료', cancelled: '취소됨' };

    const message = `
📝 <b>문의 상태가 변경되었습니다</b>

🆔 <b>문의 ID:</b> #${inquiryId}
📊 <b>상태 변경:</b> ${statusEmoji[oldStatus] || ''} ${statusText[oldStatus] || oldStatus} → ${statusEmoji[newStatus] || ''} ${statusText[newStatus] || newStatus}
${adminNote ? `📝 <b>관리자 메모:</b> ${adminNote}` : ''}
⏰ <b>변경 시간:</b> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

🔗 <b>관리자 페이지:</b> https://www.hazacheck.com/admin
    `.trim();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML', disable_web_page_preview: true })
    });
  } catch (e) {
    console.log('Telegram notify failed (continue):', e.message);
  }
}

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 관리자 인증 미들웨어
function authenticateAdmin(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}

module.exports = async function handler(req, res) {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // 관리자 인증 확인
  if (!authenticateAdmin(req)) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
    });
  }

  // GET: 문의 목록 조회 (관리자용)
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;
      const search = req.query.search;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let params = [];
      let paramIndex = 1;

      // 상태 필터
      if (status && status !== 'all') {
        whereClause += ` WHERE status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      // 검색 필터
      if (search) {
        const searchCondition = ` AND (name ILIKE $${paramIndex} OR apartment ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
        if (whereClause) {
          whereClause += searchCondition;
        } else {
          whereClause = ` WHERE (name ILIKE $${paramIndex} OR apartment ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
        }
        params.push(`%${search}%`);
        paramIndex++;
      }

      // 전체 개수 조회
      const countQuery = `SELECT COUNT(*) as total FROM inquiries${whereClause}`;
      const countResult = await sql.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // 문의 목록 조회
      const query = `
        SELECT 
          id,
          name,
          phone,
          email,
          apartment,
          size,
          move_in_date,
          preferred_time,
          options,
          message,
          status,
          admin_note,
          created_at,
          updated_at
        FROM inquiries
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      params.push(limit, offset);
      const result = await sql.query(query, params);

      // 페이지네이션 정보
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return res.status(200).json({
        success: true,
        data: {
          inquiries: result.rows || [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext,
            hasPrev
          }
        }
      });

    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 목록 조회 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // PATCH: 문의 상태 변경
  if (req.method === 'PATCH') {
    try {
      const { id, status, adminNote } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: '문의 ID와 상태가 필요합니다.',
        });
      }

      // 유효한 상태인지 확인
      const validStatuses = ['pending', 'answered', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 상태입니다.',
        });
      }

      // 기존 상태 조회
      const existingInquiry = await sql`
        SELECT status FROM inquiries WHERE id = ${id}
      `;

      if (existingInquiry.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '문의를 찾을 수 없습니다.',
        });
      }

      const oldStatus = existingInquiry.rows[0].status;

      // 상태 업데이트
      const result = await sql`
        UPDATE inquiries 
        SET 
          status = ${status},
          admin_note = ${adminNote || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, apartment, status, admin_note, updated_at
      `;

      // 텔레그램 알림 발송
      if (oldStatus !== status) {
        await sendStatusChangeNotification(id, oldStatus, status, adminNote);
      }

      return res.status(200).json({
        success: true,
        message: '문의 상태가 업데이트되었습니다.',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('문의 상태 변경 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 상태 변경 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // DELETE: 문의 삭제
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '문의 ID가 필요합니다.',
        });
      }

      // 문의 존재 확인
      const existingInquiry = await sql`
        SELECT id FROM inquiries WHERE id = ${id}
      `;

      if (existingInquiry.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '문의를 찾을 수 없습니다.',
        });
      }

      // 문의 삭제
      await sql`
        DELETE FROM inquiries WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: '문의가 삭제되었습니다.',
      });

    } catch (error) {
      console.error('문의 삭제 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 삭제 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}