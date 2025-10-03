-- 하자체크 데이터베이스 초기화 스크립트
-- Vercel Postgres 대시보드의 SQL Editor에서 실행하세요

-- inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    apartment VARCHAR(255) NOT NULL,
    size VARCHAR(50) NOT NULL,
    move_in_date DATE NOT NULL,
    options JSONB DEFAULT '[]',
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'completed', 'cancelled')),
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_phone ON inquiries(phone);

-- 테스트 데이터 삽입 (선택사항)
INSERT INTO inquiries (name, phone, apartment, size, move_in_date, status, created_at) VALUES
('김철수', '010-1234-5678', '평택 고덕 센트럴 푸르지오', '84', '2025-10-15', 'answered', '2025-09-28'),
('이영희', '010-2345-6789', '시흥 은계 센트럴 아이파크', '74', '2025-10-20', 'answered', '2025-09-26'),
('박민수', '010-3456-7890', '수원 영통 힐스테이트', '58', '2025-10-10', 'answered', '2025-09-24'),
('최지훈', '010-4567-8901', '안산 센트럴 푸르지오', '104', '2025-10-18', 'pending', '2025-09-30'),
('정수연', '010-5678-9012', '화성 동탄 센트럴파크 푸르지오', '84', '2025-10-25', 'pending', '2025-10-01');

-- 확인
SELECT * FROM inquiries ORDER BY created_at DESC;


