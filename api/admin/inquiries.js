// Vercel Serverless Function - 관리자용 문의 관리 API
// Path: /api/admin/inquiries

import { sql } from '@vercel/postgres';
import { sendStatusChangeNotification } from '../telegram-notify.js';

// 간단한 인증 미들웨어 (실제 운영시에는 JWT 등 사용)
function authenticate(req) {
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  // 인증 확인
  if (!authenticate(req)) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
    });
  }

  // GET: 모든 문의 조회 (관리자용)
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status; // 'pending', 'answered', 'all'
      const offset = (page - 1) * limit;

      let query;
      if (status && status !== 'all') {
        query = sql`
          SELECT * FROM inquiries
          WHERE status = ${status}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        query = sql`
          SELECT * FROM inquiries
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      const result = await query;

      // 전체 개수 조회
      const countResult = status && status !== 'all'
        ? await sql`SELECT COUNT(*) FROM inquiries WHERE status = ${status}`
        : await sql`SELECT COUNT(*) FROM inquiries`;

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });

    } catch (error) {
      console.error('문의 조회 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 조회 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }

  // PATCH: 문의 상태 업데이트
  if (req.method === 'PATCH') {
    try {
      const { id, status, adminNote } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'ID와 상태는 필수입니다.',
        });
      }

      // 기존 상태 조회
      const existingInquiry = await sql`
        SELECT status FROM inquiries WHERE id = ${id}
      `;

      if (existingInquiry.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '해당 문의를 찾을 수 없습니다.',
        });
      }

      const oldStatus = existingInquiry.rows[0].status;

      const result = await sql`
        UPDATE inquiries
        SET status = ${status},
            admin_note = ${adminNote || null},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      // 텔레그램 상태 변경 알림 발송
      await sendStatusChangeNotification(id, oldStatus, status, adminNote);

      return res.status(200).json({
        success: true,
        message: '문의 상태가 업데이트되었습니다.',
        data: result.rows[0],
      });

    } catch (error) {
      console.error('문의 업데이트 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 업데이트 중 오류가 발생했습니다.',
        error: error.message,
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
          message: 'ID는 필수입니다.',
        });
      }

      const result = await sql`
        DELETE FROM inquiries
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '해당 문의를 찾을 수 없습니다.',
        });
      }

      return res.status(200).json({
        success: true,
        message: '문의가 삭제되었습니다.',
      });

    } catch (error) {
      console.error('문의 삭제 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 삭제 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}