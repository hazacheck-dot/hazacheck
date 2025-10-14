-- 데모 데이터 정리 스크립트
-- 기존 데이터를 모두 삭제하고 12345번 샘플 데이터만 남김

-- Step 1: 먼저 현재 데이터 확인
SELECT id, name, apartment, created_at, status
FROM inquiries
ORDER BY id;

-- Step 2: 기존 모든 데이터 삭제
DELETE FROM inquiries;

-- Step 3: 12345번 샘플 데이터 삽입
INSERT INTO inquiries (
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
    admin_response,
    created_at,
    updated_at
) VALUES (
    12345,
    '홍길동',
    '010-1234-5678',
    'sample@example.com',
    '안산 센트럴 푸르지오',
    '84',
    '2025-11-01',
    '["하자 접수 대행", "사후관리 재점검"]',
    '84타입 아파트 사전점검을 원합니다. 입주 전 꼼꼼한 점검 부탁드립니다.',
    'answered',
    '문의 주셔서 감사합니다. 11월 1일 오전 10시에 방문 가능합니다. 자세한 사항은 전화로 안내드리겠습니다.',
    '2025-10-14 10:00:00',
    '2025-10-14 14:30:00'
);

-- Step 4: AUTO_INCREMENT 값 재설정 (PostgreSQL)
-- 다음 ID를 12346부터 시작하도록 설정
SELECT setval('inquiries_id_seq', 12345, true);

-- Step 5: 결과 확인
SELECT id, name, apartment, phone, email, size, move_in_date, status, created_at
FROM inquiries
ORDER BY id;

-- Step 6: 테이블 정보 확인
SELECT COUNT(*) as total_inquiries FROM inquiries;

-- 참고: 이 스크립트는 Vercel Postgres Dashboard나 psql에서 실행하세요.
-- URL: https://vercel.com/your-project/storage
