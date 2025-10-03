# 하자체크 (HazaCheck) 홈페이지

## 📋 프로젝트 개요

(주)우주체크의 아파트 하자 점검 서비스 브랜드 "하자체크"의 공식 홈페이지입니다.
모바일과 PC에서 모두 최적화된 반응형 Single Page Application으로 제작되었습니다.

## 🎯 주요 기능

### 메인 페이지 (index.html)
- **히어로 섹션**: 배경 영상과 함께 메인 메시지 전달
- **신뢰 증명**: 6가지 차별화된 서비스 특징 소개
- **인터랙티브 가격 계산기**: 타입별 가격 선택 및 옵션 추가 기능
- **하자 발견 사례**: 실제 점검에서 발견된 6가지 하자 사례
- **점검 과정**: 5단계 점검 프로세스 (영상 포함)
- **전문 장비**: 사용하는 전문 점검 장비 소개
- **대표 소개**: 대표의 경력 및 점검 철학
- **FAQ**: 자주 묻는 질문 8개 (아코디언 형식)
- **최종 CTA**: 연락처 정보 및 카카오톡 QR 코드

### 문의 페이지 (inquiries.html)
- **빠른 연락 카드**: 전화, 카카오톡, 이메일 3가지 방법
- **온라인 문의 폼**:
  - 이름, 연락처, 이메일, 아파트명, 전용면적, 희망 점검일
  - 추가 옵션 선택 (4가지)
  - 문의 내용 작성
  - 개인정보 동의
- **문의 내역**: 최근 문의 5건 공개 (답변완료/대기중 상태 표시)
- **문의 안내**: 답변 소요 시간 및 예약 관련 안내

## 🎨 디자인 특징

### 색상 팔레트
- Primary: #2563eb (파란색)
- Secondary: #10b981 (초록색)
- Accent: #f59e0b (주황색)
- 심각도 표시: 빨강(심각), 주황(주의), 파랑(경미)

### 타이포그래피
- 한글: Noto Sans KR
- 영문: Poppins

### UI/UX
- 부드러운 애니메이션 (Fade in up, Hover effects)
- 스크롤 인터랙션 (Intersection Observer)
- 반응형 네비게이션 (모바일 햄버거 메뉴)
- Scroll to Top 버튼
- 카드 기반 레이아웃

## 📱 반응형 디자인

- **Desktop**: 1200px+ (풀 레이아웃)
- **Tablet**: 768px - 1024px (2단 그리드)
- **Mobile**: ~767px (1단 레이아웃, 햄버거 메뉴)

## 🗂️ 파일 구조

```
hazacheck_home_ver5/
├── index.html              # 메인 페이지
├── inquiries.html          # 문의 페이지
├── css/
│   ├── style.css          # 메인 스타일
│   └── inquiries.css      # 문의 페이지 스타일
├── js/
│   ├── script.js          # 메인 JavaScript
│   └── inquiries.js       # 문의 폼 JavaScript
├── images/
│   ├── logo/              # 로고 파일 (4종)
│   ├── defects/           # 하자 사례 이미지 (6개)
│   └── kakao-qr-code.jpg  # 카카오톡 QR 코드
├── videos/
│   ├── hero-background.mp4              # 히어로 배경 영상
│   ├── ceo-inspection-action.mp4        # 대표 점검 영상
│   ├── inspection-floor-corner.mp4      # 바닥 코너 점검
│   ├── inspection-level-measurement.mp4 # 수평 측정
│   └── inspection-thermal-camera.mp4    # 열화상 카메라
└── README.md               # 프로젝트 설명서
```

## 🚀 사용 방법

### 1. 로컬 개발 환경 설정

```bash
# 패키지 설치
npm install

# Vercel CLI 설치 및 로그인 (처음 한 번만)
npx vercel login

# 프로젝트 연결
npx vercel link

# 환경 변수 다운로드
npx vercel env pull .env.local

# 로컬 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 2. Vercel 배포

```bash
# GitHub에 푸시하면 자동 배포됨
git add .
git commit -m "Update"
git push origin main

# 또는 수동 배포
npx vercel --prod
```

**상세 배포 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 참조

## ⚙️ 주요 기능 설명

### 가격 계산기
- 타입 선택 시 기본 가격 표시
- 프리미엄 옵션 체크 시 실시간 가격 계산
- 총 비용 자동 계산 및 표시

### 문의 폼
- 실시간 유효성 검증
- 전화번호 자동 포맷팅 (010-0000-0000)
- 이메일 형식 검증
- 필수 항목 체크
- 제출 성공 시 성공 메시지 표시

### FAQ 아코디언
- 질문 클릭 시 답변 펼침/접기
- 한 번에 하나의 항목만 열림

### 스크롤 애니메이션
- Intersection Observer API 사용
- 요소가 화면에 나타날 때 Fade-in 효과

## 🔧 커스터마이징

### 색상 변경
`css/style.css` 파일의 `:root` 섹션에서 CSS 변수 수정:

```css
:root {
    --primary-color: #2563eb;  /* 원하는 색상으로 변경 */
    --secondary-color: #10b981;
    --accent-color: #f59e0b;
}
```

### 콘텐츠 수정
- 텍스트: HTML 파일에서 직접 수정
- 이미지: `images/` 폴더의 파일 교체
- 영상: `videos/` 폴더의 파일 교체

### 가격 변경
`index.html`의 가격 계산기 섹션에서 `data-price` 속성 수정:

```html
<div class="size-option" data-size="58" data-price="189000">
```

## 📞 연락처 정보

- **전화**: 010-2900-5200
- **이메일**: hazacheck@gmail.com
- **카카오톡**: @hazacheck
- **주소**: 경기도 안산시 단원구 동산로 63, 4층 31호

## 📄 라이센스

© 2025 (주)우주체크. All rights reserved.

---

## 📝 개발 노트

### 사용된 기술
- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript (ES6+)
- Intersection Observer API
- Google Fonts

### 브라우저 지원
- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

### 성능 최적화
- 이미지 최적화 권장 (WebP 포맷)
- 비디오 압축 권장 (H.264 코덱)
- Lazy loading 적용 (비디오)
- CSS/JS 최소화 권장 (프로덕션)

### 백엔드 API ✅ (v2.0.0에서 추가됨)
- ✅ Vercel Serverless Functions
- ✅ Postgres 데이터베이스 연동
- ✅ 문의 접수/조회 API
- ✅ 관리자 API (문의 관리)

### 향후 개선 사항
- 이메일 알림 시스템
- 카카오톡 비즈니스 메시지 연동
- 관리자 대시보드 웹 페이지
- 예약 시스템 (캘린더 통합)
- 결제 시스템 연동
- SEO 최적화 (메타 태그, 구조화된 데이터)
- 다국어 지원 (영어)

---

## 📚 추가 문서

- **[배포 가이드](./DEPLOYMENT_GUIDE.md)**: Vercel 배포 상세 가이드
- **[API 문서](./API_DOCUMENTATION.md)**: 백엔드 API 사용법

---

**제작일**: 2025년 10월 1일  
**버전**: 2.0.0 (백엔드 추가)  
**최종 업데이트**: 2025년 10월 1일
