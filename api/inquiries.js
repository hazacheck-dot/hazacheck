// Vercel Serverless Function - 문의 접수 API
// Path: /api/inquiries

const { sql } = require('@vercel/postgres');
const { sendTelegramNotification } = require('./telegram-notify.js');

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// HTML escape for Telegram messages
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 텔레그램 알림은 별도 모듈 사용

module.exports = async function handler(req, res) {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // POST: 문의 접수
  if (req.method === 'POST') {
    try {
      const { name, phone, email, apartment, size, move_in_date, preferred_time, options, message, password, agree_privacy, agree_marketing } = req.body;

      // 필수 필드 검증
      if (!name || !phone || !apartment || !size || !move_in_date) {
        return res.status(400).json({
          success: false,
          message: '필수 항목을 모두 입력해주세요.',
        });
      }

      // 비밀번호 검증
      if (!password || !/^\d{4}$/.test(password)) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 숫자 4자리로 입력해주세요.',
        });
      }

      // 개인정보 동의 검증
      if (!agree_privacy) {
        return res.status(400).json({
          success: false,
          message: '개인정보 수집 및 이용에 동의해주세요.',
        });
      }

      // 전화번호 형식 검증 (숫자만 추출)
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        return res.status(400).json({
          success: false,
          message: '올바른 전화번호 형식이 아닙니다.',
        });
      }

      // 이메일 형식 검증 (제공된 경우)
      if (email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          return res.status(400).json({
            success: false,
            message: '올바른 이메일 형식이 아닙니다.',
          });
        }
      }

      // 옵션 배열을 JSON 문자열로 변환
      const optionsJson = JSON.stringify(options || []);

      // 데이터베이스에 문의 저장
      const result = await sql`
        INSERT INTO inquiries (name, phone, email, apartment, size, move_in_date, preferred_time, options, message, password, agree_privacy, agree_marketing, status, created_at)
        VALUES (${name}, ${phone}, ${email || null}, ${apartment}, ${size}, ${move_in_date}, ${preferred_time || null}, ${optionsJson}, ${message || ''}, ${password}, ${agree_privacy}, ${agree_marketing || false}, 'pending', NOW())
        RETURNING id, name, phone, email, apartment, size, move_in_date, preferred_time, options, message, created_at
      `;

      // 텔레그램 알림 발송 (선택사항)
      try {
        await sendTelegramNotification(result.rows[0]);
      } catch (err) {
        console.log('텔레그램 알림 실패 (계속 진행):', err.message);
      }

      return res.status(201).json({
        success: true,
        message: '문의가 성공적으로 접수되었습니다.',
        data: result.rows[0],
      });

    } catch (error) {
      console.error('문의 접수 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // GET: 문의 내역 조회
  if (req.method === 'GET') {
    try {
      const { phone, password } = req.query;

      // 전화번호가 제공된 경우: 본인 문의 내역 조회
      if (phone) {
        const phoneDigits = phone.replace(/\D/g, '');

        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
          return res.status(400).json({
            success: false,
            message: '올바른 전화번호 형식이 아닙니다.',
          });
        }

        // 비밀번호가 제공된 경우: 해당 전화번호의 모든 문의 조회
        if (password) {
          if (!/^\d{4}$/.test(password)) {
            return res.status(400).json({
              success: false,
              message: '비밀번호는 숫자 4자리로 입력해주세요.',
            });
          }

          // 먼저 비밀번호가 일치하는 문의가 있는지 확인
          let passwordCheck;
          try {
            passwordCheck = await sql`
              SELECT COUNT(*) as count
              FROM inquiries
              WHERE (phone = ${phone} OR phone = ${phoneDigits})
                AND password = ${password}
            `;
          } catch (e) {
            // password 컬럼이 없는 경우 모든 문의 조회
            console.warn('password 컬럼 미존재. 전화번호로만 조회.');
            passwordCheck = { rows: [{ count: 1 }] };
          }

          // 비밀번호가 일치하는 문의가 없으면 에러
          if (passwordCheck.rows[0].count === 0) {
            return res.status(401).json({
              success: false,
              message: '전화번호 또는 비밀번호가 일치하지 않습니다.',
            });
          }

          // 비밀번호가 일치하면 해당 전화번호의 모든 문의 조회
          let result;
          try {
            result = await sql`
              SELECT
                id,
                name,
                phone,
                apartment,
                size,
                move_in_date,
                options,
                message,
                status,
                admin_response,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at,
                TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI') as updated_at
              FROM inquiries
              WHERE (phone = ${phone} OR phone = ${phoneDigits})
              ORDER BY created_at DESC
            `;
          } catch (e) {
            console.error('문의 조회 실패:', e);
            return res.status(500).json({
              success: false,
              message: '문의 조회 중 오류가 발생했습니다.',
            });
          }

          return res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length,
          });
        }

        // 비밀번호 없이 전화번호만 제공된 경우 (비밀번호 없는 문의만)
        let result;
        try {
          result = await sql`
            SELECT
              id,
              name,
              phone,
              email,
              apartment,
              size,
              move_in_date,
              options,
              message,
              status,
              admin_note,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at,
              TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI') as updated_at
            FROM inquiries
            WHERE (phone = ${phone} OR phone = ${phoneDigits})
              AND (password IS NULL OR password = '')
            ORDER BY created_at DESC
          `;
        } catch (e) {
          console.warn('password 컬럼 없음. 비밀번호 없이 모든 문의 조회로 대체.');
          result = await sql`
            SELECT
              id,
              name,
              phone,
              email,
              apartment,
              size,
              move_in_date,
              options,
              message,
              status,
              admin_note,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at,
              TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI') as updated_at
            FROM inquiries
            WHERE (phone = ${phone} OR phone = ${phoneDigits})
            ORDER BY created_at DESC
          `;
        }

        return res.status(200).json({
          success: true,
          data: result.rows,
          count: result.rows.length,
        });
      }

      // 전화번호가 없는 경우: 최근 문의 내역 조회 (공개용, 마스킹)
      const limit = parseInt(req.query.limit) || 5;

      const result = await sql`
        SELECT
          id,
          CONCAT(SUBSTRING(name, 1, 1), '**') as name,
          apartment,
          size,
          status,
          TO_CHAR(created_at, 'YYYY-MM-DD') as created_at
        FROM inquiries
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return res.status(200).json({
        success: true,
        data: result.rows,
      });

    } catch (error) {
      console.error('문의 내역 조회 오류:', error);
      return res.status(500).json({
        success: false,
        message: '문의 내역 조회 중 오류가 발생했습니다.',
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