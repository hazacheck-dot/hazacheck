# 하자체크 백엔드 설정 가이드

## 📋 개요

하자체크 웹사이트의 백엔드는 Vercel Serverless Functions를 사용하여 구현되었습니다. 이 가이드는 백엔드 설정과 배포 과정을 단계별로 안내합니다.

## 🏗️ 백엔드 구조

```
api/
├── inquiries.js          # 문의 접수 API (공개)
├── admin/
│   └── inquiries.js      # 관리자 문의 관리 API
└── telegram-notify.js    # 텔레그램 알림 유틸리티
```

## 🚀 배포 단계

### 1단계: Vercel 계정 생성 및 프로젝트 연결

1. **Vercel 계정 생성**
   - [vercel.com](https://vercel.com)에서 계정 생성
   - GitHub 계정으로 로그인 권장

2. **프로젝트 연결**
   ```bash
   # Vercel CLI 설치
   npm install -g vercel
   
   # 프로젝트 디렉토리에서 실행
   vercel login
   vercel
   ```

3. **GitHub 연동 (권장)**
   - Vercel 대시보드에서 GitHub 저장소 연결
   - 자동 배포 설정

### 2단계: 데이터베이스 설정

1. **Vercel Postgres 추가**
   - Vercel 대시보드 → 프로젝트 → Storage 탭
   - "Create Database" → "Postgres" 선택
   - 데이터베이스 이름: `hazacheck-db`

2. **데이터베이스 초기화**
   - Vercel 대시보드 → Storage → Postgres → SQL Editor
   - `scripts/init-db.sql` 파일 내용 복사하여 실행

### 3단계: 환경변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 다음 변수들을 추가:

#### 필수 환경변수

```bash
# 데이터베이스 연결 (Vercel에서 자동 생성됨)
POSTGRES_URL=postgres://username:password@host:5432/database
POSTGRES_PRISMA_URL=postgres://username:password@host:5432/database?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://username:password@host:5432/database
POSTGRES_USER=username
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database

# 관리자 인증 토큰 (보안을 위해 강력한 토큰 사용)
ADMIN_TOKEN=your-super-secure-admin-token-here
```

#### 선택적 환경변수 (텔레그램 알림)

```bash
# 텔레그램 봇 설정
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### 4단계: 텔레그램 봇 설정 (선택사항)

1. **텔레그램 봇 생성**
   - 텔레그램에서 [@BotFather](https://t.me/botfather) 검색
   - `/newbot` 명령어로 새 봇 생성
   - 봇 이름과 사용자명 설정
   - 받은 토큰을 `TELEGRAM_BOT_TOKEN`에 설정

2. **채팅 ID 확인**
   - 생성한 봇과 대화 시작
   - `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` 접속
   - `chat.id` 값을 `TELEGRAM_CHAT_ID`에 설정

### 5단계: 배포 확인

1. **자동 배포 확인**
   - GitHub에 코드 푸시 시 자동 배포
   - Vercel 대시보드에서 배포 상태 확인

2. **API 테스트**
   ```bash
   # 문의 접수 테스트
   curl -X POST https://your-domain.vercel.app/api/inquiries \
     -H "Content-Type: application/json" \
     -d '{
       "name": "테스트",
       "phone": "010-1234-5678",
       "apartment": "테스트 아파트",
       "size": "84",
       "moveInDate": "2025-12-01"
     }'
   ```

## 🔧 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 파일 생성

`.env.local` 파일 생성:

```bash
# .env.local
POSTGRES_URL=your-postgres-url
ADMIN_TOKEN=your-admin-token
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 3. 로컬 서버 실행

```bash
# Vercel CLI로 로컬 개발 서버 실행
vercel dev

# 또는 npm 스크립트 사용
npm run dev
```

## 📊 API 엔드포인트

### 공개 API

#### 문의 접수
- **POST** `/api/inquiries`
- **GET** `/api/inquiries?limit=5` (최근 문의 조회)

### 관리자 API

#### 문의 관리
- **GET** `/api/admin/inquiries` (문의 목록 조회)
- **PATCH** `/api/admin/inquiries` (문의 상태 변경)
- **DELETE** `/api/admin/inquiries?id={id}` (문의 삭제)

**인증**: `Authorization: Bearer {ADMIN_TOKEN}` 헤더 필요

## 🛡️ 보안 설정

### 1. 관리자 토큰 생성

```bash
# 강력한 랜덤 토큰 생성
openssl rand -hex 32
```

### 2. CORS 설정

`vercel.json`에서 CORS 헤더가 이미 설정되어 있습니다.

### 3. 환경변수 보안

- 프로덕션 환경변수는 Vercel 대시보드에서만 설정
- `.env.local` 파일은 `.gitignore`에 포함
- 민감한 정보는 절대 코드에 하드코딩하지 않음

## 🔍 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 오류**
   - 환경변수가 올바르게 설정되었는지 확인
   - Vercel Postgres가 활성화되어 있는지 확인

2. **API 401 오류 (관리자)**
   - `ADMIN_TOKEN`이 올바르게 설정되었는지 확인
   - Authorization 헤더 형식 확인

3. **텔레그램 알림이 작동하지 않음**
   - 봇 토큰과 채팅 ID 확인
   - 봇과 대화를 시작했는지 확인

### 로그 확인

```bash
# Vercel CLI로 로그 확인
vercel logs

# 특정 함수 로그 확인
vercel logs --function=inquiries
```

## 📈 모니터링

### Vercel 대시보드
- 함수 실행 횟수 및 응답 시간
- 오류 로그 및 성능 메트릭
- 데이터베이스 사용량

### 알림 설정
- 텔레그램 봇을 통한 실시간 알림
- Vercel에서 오류 알림 설정 가능

## 🚀 추가 기능 구현

### 이메일 알림 추가
```javascript
// api/email-notify.js 생성
export async function sendEmailNotification(inquiryData) {
  // 이메일 발송 로직
}
```

### 데이터 분석
- Vercel Analytics 활성화
- 사용자 행동 추적
- 문의 통계 대시보드

## 📞 지원

문제가 발생하면:
1. Vercel 문서 확인
2. GitHub Issues에 문제 보고
3. 개발팀에 문의

---

**주의사항**: 이 가이드는 초보자를 위한 상세한 설명입니다. 실제 운영 환경에서는 추가적인 보안 설정과 모니터링이 필요할 수 있습니다.