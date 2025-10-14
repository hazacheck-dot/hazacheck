-- 데이터베이스 스키마 업데이트 스크립트
-- inquiries 테이블에 password 및 동의 필드 추가

-- Step 1: 기존 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inquiries'
ORDER BY ordinal_position;

-- Step 2: password 컬럼 추가 (4자리 숫자)
ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS password VARCHAR(4);

-- Step 3: 동의 필드 추가
ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS agree_privacy BOOLEAN DEFAULT TRUE;

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS agree_marketing BOOLEAN DEFAULT FALSE;

-- Step 4: 기존 데이터에 기본값 설정 (기존 문의는 비밀번호 없음)
UPDATE inquiries
SET agree_privacy = TRUE
WHERE agree_privacy IS NULL;

UPDATE inquiries
SET agree_marketing = FALSE
WHERE agree_marketing IS NULL;

-- Step 5: 업데이트 확인
SELECT id, name, apartment, password, agree_privacy, agree_marketing, created_at
FROM inquiries
ORDER BY created_at DESC
LIMIT 10;

-- Step 6: 테이블 구조 최종 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'inquiries'
ORDER BY ordinal_position;

-- 참고: 이 스크립트는 Vercel Postgres Dashboard나 psql에서 실행하세요.
-- URL: https://vercel.com/your-project/storage
