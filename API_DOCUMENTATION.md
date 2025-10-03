# 하자체크 API 문서

하자체크 홈페이지의 백엔드 API 상세 문서입니다.

## 📌 Base URL

- **Production**: `https://www.hazacheck.com/api`
- **Development**: `http://localhost:3000/api`

---

## 🔓 공개 API (Public)

### 1. 문의 접수

새로운 문의를 접수합니다.

**Endpoint**: `POST /inquiries`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "홍길동",                    // 필수
  "phone": "010-1234-5678",           // 필수 (10-11자리 숫자)
  "email": "test@example.com",        // 선택
  "apartment": "안산 센트럴 푸르지오",  // 필수
  "size": "84",                       // 필수 (58, 74, 84, 104, over)
  "moveInDate": "2025-11-01",         // 필수 (YYYY-MM-DD)
  "options": [                        // 선택 (배열)
    "하자 접수 대행 (+5만원)",
    "VR 360° 촬영 (+5만원)"
  ],
  "message": "문의 내용입니다."        // 선택
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "문의가 성공적으로 접수되었습니다.",
  "data": {
    "id": 6,
    "name": "홍길동",
    "apartment": "안산 센트럴 푸르지오",
    "size": "84",
    "created_at": "2025-10-01T12:00:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "필수 항목을 모두 입력해주세요."
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "success": false,
  "message": "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```

---

### 2. 최근 문의 내역 조회

최근 문의 내역을 조회합니다. (개인정보는 마스킹됨)

**Endpoint**: `GET /inquiries`

**Query Parameters**:
- `limit` (선택): 조회할 문의 개수 (기본값: 5)

**Example**:
```
GET /inquiries?limit=10
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "정**",                    // 첫 글자만 표시
      "apartment": "화성 동탄...",       // 일부만 표시
      "size": "84",
      "status": "pending",              // pending, answered, completed, cancelled
      "created_at": "2025-10-01"
    },
    {
      "id": 4,
      "name": "최**",
      "apartment": "안산 센트럴...",
      "size": "104",
      "status": "pending",
      "created_at": "2025-09-30"
    }
  ]
}
```

---

## 🔐 관리자 API (Admin)

모든 관리자 API는 인증 토큰이 필요합니다.

**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

---

### 3. 모든 문의 조회 (관리자)

전체 문의 내역을 조회합니다. (개인정보 포함)

**Endpoint**: `GET /admin/inquiries`

**Query Parameters**:
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지당 항목 수 (기본값: 20)
- `status` (선택): 필터링할 상태 (pending, answered, completed, cancelled, all)

**Example**:
```
GET /admin/inquiries?page=1&limit=20&status=pending
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "정수연",
      "phone": "010-5678-9012",
      "email": "test@example.com",
      "apartment": "화성 동탄 센트럴파크 푸르지오",
      "size": "84",
      "move_in_date": "2025-10-25",
      "options": ["VR 360° 촬영 (+5만원)"],
      "message": "처음 아파트 구매라 하자 점검이 꼭 필요할지 고민됩니다.",
      "status": "pending",
      "admin_note": null,
      "created_at": "2025-10-01T10:30:00.000Z",
      "updated_at": "2025-10-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "인증이 필요합니다."
}
```

---

### 4. 문의 상태 업데이트

문의의 상태를 변경하고 관리자 메모를 추가합니다.

**Endpoint**: `PATCH /admin/inquiries`

**Request Body**:
```json
{
  "id": 5,                              // 필수
  "status": "answered",                 // 필수 (pending, answered, completed, cancelled)
  "adminNote": "전화 상담 완료. 10월 15일 예약 확정"  // 선택
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "문의 상태가 업데이트되었습니다.",
  "data": {
    "id": 5,
    "name": "정수연",
    "phone": "010-5678-9012",
    "status": "answered",
    "admin_note": "전화 상담 완료. 10월 15일 예약 확정",
    "updated_at": "2025-10-01T15:20:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "해당 문의를 찾을 수 없습니다."
}
```

---

### 5. 문의 삭제

문의를 삭제합니다.

**Endpoint**: `DELETE /admin/inquiries?id=5`

**Query Parameters**:
- `id` (필수): 삭제할 문의 ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "문의가 삭제되었습니다."
}
```

---

## 📊 데이터 모델

### Inquiry (문의)

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|------|
| id | INTEGER | 문의 ID (자동 생성) | - |
| name | VARCHAR(100) | 문의자 이름 | ✓ |
| phone | VARCHAR(20) | 연락처 | ✓ |
| email | VARCHAR(255) | 이메일 | |
| apartment | VARCHAR(255) | 아파트명 | ✓ |
| size | VARCHAR(50) | 전용면적 타입 | ✓ |
| move_in_date | DATE | 희망 점검일 | ✓ |
| options | JSONB | 추가 옵션 배열 | |
| message | TEXT | 문의 내용 | |
| status | VARCHAR(20) | 상태 (pending/answered/completed/cancelled) | ✓ |
| admin_note | TEXT | 관리자 메모 | |
| created_at | TIMESTAMP | 생성 시간 | ✓ |
| updated_at | TIMESTAMP | 수정 시간 | ✓ |

---

## 🧪 테스트 예제

### cURL 사용

#### 문의 접수
```bash
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

#### 문의 조회
```bash
curl https://www.hazacheck.com/api/inquiries?limit=5
```

#### 관리자: 모든 문의 조회
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://www.hazacheck.com/api/admin/inquiries
```

#### 관리자: 상태 업데이트
```bash
curl -X PATCH https://www.hazacheck.com/api/admin/inquiries \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": "answered",
    "adminNote": "처리 완료"
  }'
```

### JavaScript (Fetch API)

```javascript
// 문의 접수
async function submitInquiry(data) {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  return result;
}

// 최근 문의 조회
async function getRecentInquiries() {
  const response = await fetch('/api/inquiries?limit=5');
  const result = await response.json();
  return result.data;
}

// 관리자: 문의 상태 업데이트
async function updateInquiryStatus(id, status, adminNote) {
  const response = await fetch('/api/admin/inquiries', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, status, adminNote })
  });
  
  const result = await response.json();
  return result;
}
```

---

## 🔒 보안

### 인증

- 공개 API는 인증이 필요하지 않습니다.
- 관리자 API는 `Authorization: Bearer {token}` 헤더가 필요합니다.
- 관리자 토큰은 Vercel 환경 변수에 저장됩니다.

### CORS

- 모든 도메인에서 API 접근 가능 (`Access-Control-Allow-Origin: *`)
- 프로덕션에서는 특정 도메인으로 제한 권장

### Rate Limiting

- Vercel 기본 제한 적용
- 필요 시 추가 Rate Limiting 구현 권장

### 데이터 보호

- 공개 API는 개인정보를 마스킹하여 반환
- 관리자 API는 전체 정보 반환 (인증 필요)

---

## 📝 변경 이력

### v2.0.0 (2025-10-01)
- ✨ Vercel Serverless Functions 기반 백엔드 추가
- ✨ Postgres 데이터베이스 연동
- ✨ 문의 접수/조회 API
- ✨ 관리자 API (CRUD)
- ✨ 프론트엔드 API 연동

### v1.0.0 (2025-10-01)
- 🎉 초기 프론트엔드 웹사이트 출시

---

**문의**: hazacheck@gmail.com  
**웹사이트**: https://www.hazacheck.com


