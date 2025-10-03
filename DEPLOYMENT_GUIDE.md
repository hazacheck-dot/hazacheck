# 하자체크 백엔드 배포 가이드

이 가이드는 Vercel에 하자체크 홈페이지와 백엔드 API를 배포하는 전체 과정을 설명합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [데이터베이스 설정](#데이터베이스-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [로컬 개발 환경](#로컬-개발-환경)
5. [Vercel 배포](#vercel-배포)
6. [API 테스트](#api-테스트)
7. [관리자 페이지](#관리자-페이지)
8. [문제 해결](#문제-해결)

---

## 🔧 사전 준비

### 필요한 항목

1. **Vercel 계정** (https://vercel.com)
2. **GitHub 계정** (이미 있음)
3. **Node.js** 18.x 이상 설치

### 프로젝트 파일 확인

```
hazacheck_home_ver5/
├── api/                    # Serverless Functions (새로 추가됨)
│   ├── inquiries.js       # 문의 접수/조회 API
│   └── admin/
│       └── inquiries.js   # 관리자용 API
├── package.json           # 의존성 패키지
├── vercel.json            # Vercel 설정
└── scripts/
    └── init-db.sql        # 데이터베이스 초기화 스크립트
```

---

## 💾 데이터베이스 설정

### 1. Vercel Postgres 추가

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택 (hazacheck)

2. **Storage 탭 클릭**
   - "Create Database" 버튼 클릭
   - "Postgres" 선택
   - Database 이름: `hazacheck-db` (원하는 이름)
   - Region: `Seoul (icn1)` 또는 가장 가까운 지역
   - "Create" 클릭

3. **프로젝트에 연결**
   - 생성된 데이터베이스 선택
   - "Connect Project" 클릭
   - 환경 변수가 자동으로 추가됨

### 2. 데이터베이스 초기화

Vercel 대시보드에서:

1. **Storage → 생성한 DB 클릭 → "Query" 탭**
2. `scripts/init-db.sql` 파일 내용 복사
3. Query Editor에 붙여넣기
4. "Run Query" 실행

또는 로컬에서:

```bash
# Vercel CLI로 데이터베이스 연결
npx vercel env pull .env.local

# psql 사용 (선택사항)
psql $POSTGRES_URL_NON_POOLING < scripts/init-db.sql
```

### 3. 테이블 확인

Query Editor에서 실행:

```sql
SELECT * FROM inquiries;
```

5개의 테스트 데이터가 보이면 성공!

---

## 🔐 환경 변수 설정

### 1. 관리자 토큰 생성

터미널에서 실행:

```bash
# Mac/Linux
openssl rand -hex 32

# Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

생성된 토큰을 복사하세요.

### 2. Vercel 환경 변수 추가

Vercel 대시보드에서:

1. **Settings → Environment Variables**
2. 다음 변수 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `ADMIN_TOKEN` | (위에서 생성한 토큰) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

> **참고**: `POSTGRES_*` 변수는 데이터베이스 생성 시 자동으로 추가됩니다.

---

## 💻 로컬 개발 환경

### 1. 패키지 설치

```bash
cd hazacheck_home_ver5
npm install
```

### 2. 환경 변수 다운로드

```bash
# Vercel CLI 로그인 (처음 한 번만)
npx vercel login

# 프로젝트 연결
npx vercel link

# 환경 변수 다운로드
npx vercel env pull .env.local
```

`.env.local` 파일이 생성됩니다.

### 3. 로컬 개발 서버 실행

```bash
npm run dev
```

브라우저에서 열기:
- **홈페이지**: http://localhost:3000
- **API 테스트**: http://localhost:3000/api/inquiries

---

## 🚀 Vercel 배포

### 1. GitHub에 푸시

```bash
git add .
git commit -m "백엔드 API 추가 - Vercel Serverless Functions"
git push origin main
```

### 2. Vercel 자동 배포

GitHub에 푸시하면 Vercel이 자동으로 감지하고 배포합니다.

Vercel 대시보드에서 배포 상태 확인:
- **Deployments** 탭에서 진행 상황 보기
- 배포 완료까지 약 1-2분 소요

### 3. 배포 확인

배포가 완료되면:

```
✅ Production: https://www.hazacheck.com
```

브라우저에서 확인:
- https://www.hazacheck.com
- https://www.hazacheck.com/api/inquiries

---

## 🧪 API 테스트

### 1. 문의 내역 조회 (GET)

```bash
curl https://www.hazacheck.com/api/inquiries
```

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "김**",
      "apartment": "평택 고덕...",
      "size": "84",
      "status": "answered",
      "created_at": "2025-09-28"
    }
  ]
}
```

### 2. 문의 접수 (POST)

```bash
curl -X POST https://www.hazacheck.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "test@example.com",
    "apartment": "테스트 아파트",
    "size": "84",
    "moveInDate": "2025-11-01",
    "options": ["하자 접수 대행 (+5만원)"],
    "message": "테스트 문의입니다."
  }'
```

**응답 예시:**

```json
{
  "success": true,
  "message": "문의가 성공적으로 접수되었습니다.",
  "data": {
    "id": 6,
    "name": "홍길동",
    "apartment": "테스트 아파트",
    "size": "84",
    "created_at": "2025-10-01T..."
  }
}
```

### 3. 웹사이트에서 직접 테스트

1. https://www.hazacheck.com/inquiries.html 접속
2. 문의 폼 작성 후 제출
3. "문의가 접수되었습니다!" 메시지 확인
4. 페이지 하단 "최근 문의 내역"에 자동 업데이트

---

## 👨‍💼 관리자 페이지 (선택사항)

관리자 API를 사용하여 문의를 관리할 수 있습니다.

### Postman/Insomnia 사용

#### 1. 모든 문의 조회

```
GET https://www.hazacheck.com/api/admin/inquiries
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### 2. 문의 상태 업데이트

```
PATCH https://www.hazacheck.com/api/admin/inquiries
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "id": 1,
  "status": "answered",
  "adminNote": "전화 상담 완료"
}
```

#### 3. 문의 삭제

```
DELETE https://www.hazacheck.com/api/admin/inquiries?id=1
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 간단한 관리자 웹 페이지 (추후 구현 가능)

필요 시 별도로 관리자 대시보드 페이지를 제작할 수 있습니다.

---

## 🔍 문제 해결

### 문제 1: API가 404 에러

**원인**: Vercel이 API 경로를 인식하지 못함

**해결**:
1. `vercel.json` 파일이 프로젝트 루트에 있는지 확인
2. Vercel 대시보드 → Settings → Functions 확인
3. 재배포: `git commit --allow-empty -m "redeploy" && git push`

### 문제 2: 데이터베이스 연결 오류

**원인**: 환경 변수 누락

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `POSTGRES_URL` 등이 있는지 확인
3. 없으면 Storage에서 데이터베이스를 프로젝트에 다시 연결

### 문제 3: CORS 에러

**원인**: API 헤더 설정 문제

**해결**:
`vercel.json`의 `headers` 섹션이 올바른지 확인하고 재배포

### 문제 4: 문의 폼 제출 후 오류

**브라우저 개발자 도구 (F12) → Console 탭 확인**

- `fetch failed`: 네트워크 문제 또는 API 경로 오류
- `400 Bad Request`: 필수 필드 누락 확인
- `500 Internal Server Error`: Vercel 로그 확인

**Vercel 로그 확인**:
1. Vercel 대시보드 → Deployments → 최신 배포 클릭
2. "Functions" 탭 → 오류 로그 확인

---

## 📊 모니터링 및 관리

### Vercel Analytics (선택사항)

1. Vercel 대시보드 → Analytics 탭
2. "Enable Analytics" 클릭
3. 방문자 수, 페이지 뷰 등 확인

### 데이터베이스 백업

Vercel 대시보드 → Storage → 해당 DB → "Backups" 탭에서 자동 백업 설정

---

## 🎉 완료!

이제 하자체크 홈페이지가 완전히 작동하는 백엔드와 함께 배포되었습니다!

### 확인 사항

- ✅ https://www.hazacheck.com 접속 가능
- ✅ 문의 폼 제출 작동
- ✅ 최근 문의 내역 표시
- ✅ 데이터베이스 저장 확인

### 다음 단계 (선택사항)

1. **이메일 알림**: 문의 접수 시 이메일 발송 (Nodemailer, SendGrid 등)
2. **관리자 대시보드**: 웹 기반 문의 관리 페이지
3. **카카오톡 알림**: 카카오 비즈니스 메시지 API 연동
4. **결제 연동**: 예약 시 결제 기능 (Toss Payments, PortOne 등)
5. **SEO 최적화**: 메타 태그, 구조화된 데이터
6. **Google Analytics**: 방문자 분석

---

## 📞 지원

문제가 발생하면:

1. Vercel 공식 문서: https://vercel.com/docs
2. Vercel Support: support@vercel.com
3. GitHub Issues: 프로젝트에 이슈 등록

---

**제작일**: 2025년 10월 1일  
**버전**: 2.0.0 (백엔드 추가)


