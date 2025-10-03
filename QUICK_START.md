# 🚀 빠른 시작 가이드

www.hazacheck.com에 백엔드를 배포하는 가장 빠른 방법입니다.

## ⚡ 5분 안에 배포하기

### 1️⃣ GitHub에 푸시 (1분)

```bash
cd hazacheck_home_ver5
git add .
git commit -m "백엔드 API 추가 - Vercel Serverless Functions"
git push origin main
```

### 2️⃣ Vercel에서 Postgres 추가 (2분)

1. https://vercel.com/dashboard 접속
2. 프로젝트 `hazacheck` 클릭
3. **Storage** 탭 클릭
4. **Create Database** → **Postgres** 선택
5. 이름: `hazacheck-db`, Region: `Seoul`
6. **Create** 클릭
7. **Connect Project** 클릭 (환경 변수 자동 추가됨)

### 3️⃣ 데이터베이스 초기화 (1분)

Vercel 대시보드에서:

1. **Storage** → `hazacheck-db` → **Query** 탭
2. 아래 SQL 복사해서 붙여넣기:

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
```

3. **Run Query** 클릭

### 4️⃣ 관리자 토큰 설정 (1분)

1. Vercel 대시보드 → **Settings** → **Environment Variables**
2. 새 변수 추가:
   - **Name**: `ADMIN_TOKEN`
   - **Value**: 아무 긴 문자열 (예: `my-super-secret-admin-token-12345`)
   - **Environment**: Production, Preview, Development 모두 선택
3. **Save** 클릭

### 5️⃣ 재배포 (자동, 약 1분)

GitHub에 푸시하면 Vercel이 자동으로 배포합니다.

**Deployments** 탭에서 진행 상황 확인 → ✅ Ready 표시 나올 때까지 대기

---

## ✅ 배포 확인

### 웹사이트 테스트

1. https://www.hazacheck.com/inquiries.html 접속
2. 문의 폼 작성 후 제출
3. ✅ "문의가 접수되었습니다!" 메시지 확인
4. 페이지 하단 "최근 문의 내역"에 방금 작성한 문의가 표시됨

### API 테스트

터미널에서:

```bash
# 최근 문의 조회
curl https://www.hazacheck.com/api/inquiries

# 문의 접수
curl -X POST https://www.hazacheck.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트",
    "phone": "010-1234-5678",
    "apartment": "테스트 아파트",
    "size": "84",
    "moveInDate": "2025-11-01"
  }'
```

---

## 🎯 다음 단계

### 관리자 API 사용하기

Postman이나 cURL로:

```bash
# 모든 문의 조회
curl -H "Authorization: Bearer my-super-secret-admin-token-12345" \
  https://www.hazacheck.com/api/admin/inquiries

# 문의 상태 업데이트
curl -X PATCH https://www.hazacheck.com/api/admin/inquiries \
  -H "Authorization: Bearer my-super-secret-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": "answered",
    "adminNote": "전화 상담 완료"
  }'
```

### 로컬 개발 환경

```bash
npm install
npx vercel login
npx vercel link
npx vercel env pull .env.local
npm run dev
```

---

## 📚 자세한 문서

- **배포 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **API 문서**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **README**: [README.md](./README.md)

---

## 🆘 문제 발생 시

### API가 404 오류

→ Vercel 대시보드 → **Deployments** → 최신 배포 클릭 → 다시 배포

```bash
git commit --allow-empty -m "redeploy"
git push
```

### 데이터베이스 연결 오류

→ Vercel 대시보드 → **Settings** → **Environment Variables** → `POSTGRES_URL` 확인

### 문의 폼이 작동 안 함

→ 브라우저 F12 → Console 탭에서 에러 확인

---

**완료! 🎉**

이제 www.hazacheck.com이 완전히 작동하는 백엔드와 함께 배포되었습니다!


