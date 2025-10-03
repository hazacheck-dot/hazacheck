# 🚀 하자체크 배포 단계별 가이드

## 📋 배포 체크리스트

### 1️⃣ Git 저장소 연결 및 푸시

```bash
# 현재 디렉토리에서 Git 초기화 (이미 되어있다면 생략)
git init

# 원격 저장소 추가
git remote add origin https://github.com/hazacheck-dot/hazacheck_home.git

# 모든 파일 추가
git add .

# 커밋
git commit -m "하자체크 홈페이지 v2.0 - 텔레그램 알림 추가"

# 메인 브랜치로 푸시
git push -u origin main
```

### 2️⃣ Vercel 프로젝트 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "New Project" 클릭
   - GitHub 저장소 `hazacheck-dot/hazacheck_home` 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: "Other"
   - Root Directory: `./` (기본값)
   - Build Command: (비워둠)
   - Output Directory: (비워둠)

### 3️⃣ Postgres 데이터베이스 생성

1. **Vercel 대시보드에서**
   - 프로젝트 선택
   - "Storage" 탭 클릭
   - "Create Database" → "Postgres" 선택

2. **데이터베이스 설정**
   - Name: `hazacheck-db`
   - Region: `Seoul (icn1)` 또는 가장 가까운 지역
   - "Create" 클릭

3. **프로젝트 연결**
   - 생성된 데이터베이스 선택
   - "Connect Project" 클릭
   - 환경 변수가 자동으로 추가됨

### 4️⃣ 데이터베이스 초기화

1. **Vercel 대시보드에서**
   - Storage → `hazacheck-db` → "Query" 탭

2. **SQL 실행**
   ```sql
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
       status VARCHAR(20) DEFAULT 'pending',
       admin_note TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE INDEX idx_inquiries_status ON inquiries(status);
   CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
   CREATE INDEX idx_inquiries_phone ON inquiries(phone);

   -- 테스트 데이터 삽입
   INSERT INTO inquiries (name, phone, apartment, size, move_in_date, status, created_at) VALUES
   ('김철수', '010-1234-5678', '평택 고덕 센트럴 푸르지오', '84', '2025-10-15', 'answered', '2025-09-28'),
   ('이영희', '010-2345-6789', '시흥 은계 센트럴 아이파크', '74', '2025-10-20', 'answered', '2025-09-26'),
   ('박민수', '010-3456-7890', '수원 영통 힐스테이트', '58', '2025-10-10', 'answered', '2025-09-24'),
   ('최지훈', '010-4567-8901', '안산 센트럴 푸르지오', '104', '2025-10-18', 'pending', '2025-09-30'),
   ('정수연', '010-5678-9012', '화성 동탄 센트럴파크 푸르지오', '84', '2025-10-25', 'pending', '2025-10-01');
   ```

3. **"Run Query" 클릭**

### 5️⃣ 환경 변수 설정

1. **Vercel 대시보드에서**
   - 프로젝트 → "Settings" → "Environment Variables"

2. **추가할 환경 변수들**
   ```
   ADMIN_TOKEN = your-secure-admin-token-here
   TELEGRAM_BOT_TOKEN = 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID = 123456789
   NODE_ENV = production
   ```

3. **각 환경에 적용**
   - Production: ✅
   - Preview: ✅
   - Development: ✅

### 6️⃣ 텔레그램 봇 설정

1. **텔레그램 봇 생성**
   - 텔레그램에서 @BotFather 검색
   - `/newbot` 명령어 입력
   - 봇 이름: `하자체크 알림봇`
   - 봇 사용자명: `hazacheck_notify_bot` (고유해야 함)

2. **봇 토큰 받기**
   - BotFather가 제공하는 토큰 복사
   - Vercel 환경 변수 `TELEGRAM_BOT_TOKEN`에 설정

3. **채팅 ID 확인**
   - 생성한 봇과 대화 시작
   - `/start` 명령어 입력
   - 브라우저에서 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` 접속
   - 응답에서 `chat.id` 값 복사
   - Vercel 환경 변수 `TELEGRAM_CHAT_ID`에 설정

### 7️⃣ 도메인 연결

1. **Vercel 대시보드에서**
   - 프로젝트 → "Settings" → "Domains"

2. **커스텀 도메인 추가**
   - "Add Domain" 클릭
   - 도메인 입력: `www.hazacheck.com`
   - "Add" 클릭

3. **DNS 설정**
   - 도메인 제공업체에서 DNS 설정
   - CNAME 레코드 추가:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     TTL: 300
     ```

4. **SSL 인증서**
   - Vercel이 자동으로 SSL 인증서 발급
   - 몇 분 후 `https://www.hazacheck.com` 접속 가능

### 8️⃣ 배포 확인

1. **자동 배포 확인**
   - GitHub에 푸시하면 Vercel이 자동 배포
   - "Deployments" 탭에서 진행 상황 확인

2. **기능 테스트**
   - https://www.hazacheck.com 접속
   - 문의 폼 테스트
   - 텔레그램 알림 확인
   - 관리자 페이지 테스트

## 🔧 문제 해결

### Git 관련 문제
```bash
# 원격 저장소 확인
git remote -v

# 원격 저장소 변경
git remote set-url origin https://github.com/hazacheck-dot/hazacheck_home.git

# 강제 푸시 (필요시)
git push -f origin main
```

### Vercel 배포 문제
- Functions 탭에서 오류 로그 확인
- Environment Variables 확인
- 데이터베이스 연결 상태 확인

### 텔레그램 알림 문제
- 봇 토큰 확인
- 채팅 ID 확인
- 봇과 대화 시작 여부 확인

## 📞 지원

문제 발생 시:
1. Vercel 로그 확인
2. 브라우저 개발자 도구 확인
3. 텔레그램 봇 설정 확인

---

**배포 완료 후 확인사항:**
- ✅ 웹사이트 정상 접속
- ✅ 문의 폼 작동
- ✅ 텔레그램 알림 발송
- ✅ 관리자 페이지 접속
- ✅ 데이터베이스 저장 확인