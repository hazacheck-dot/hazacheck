// Vercel Serverless Function - 문의 접수 API
// Path: /api/inquiries

import { sql } from '@vercel/postgres';
import { sendTelegramNotification } from './telegram-notify.js';

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // POST: 문의 접수
  if (req.method === 'POST') {
    try {
      const { name, phone, email, apartment, size, moveInDate, options, message } = req.body;

      // 필수 필드 검증
      if (!name || !phone || !apartment || !size || !moveInDate) {
        return res.status(400).json({
          success: false,
          message: '필수 항목을 모두 입력해주세요.',
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
        INSERT INTO inquiries (name, phone, email, apartment, size, move_in_date, options, message, status, created_at)
        VALUES (${name}, ${phone}, ${email || null}, ${apartment}, ${size}, ${moveInDate}, ${optionsJson}, ${message || ''}, 'pending', NOW())
        RETURNING id, name, apartment, size, created_at
      `;

      // 텔레그램 알림 발송
      await sendTelegramNotification(result.rows[0]);

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

  // GET: 최근 문의 내역 조회 (공개용)
  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit) || 5;

      // 개인정보 보호를 위해 이름과 아파트명 마스킹
      const result = await sql`
        SELECT 
          id,
          CONCAT(SUBSTRING(name, 1, 1), '**') as name,
          CONCAT(
            SUBSTRING(apartment, 1, LEAST(LENGTH(apartment), 4)),
            CASE WHEN LENGTH(apartment) > 4 THEN '...' ELSE '' END
          ) as apartment,
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