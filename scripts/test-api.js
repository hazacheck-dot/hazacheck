#!/usr/bin/env node

/**
 * 하자체크 API 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-api.js [baseUrl]
 * 
 * 예시:
 * node scripts/test-api.js https://hazacheck.vercel.app
 * node scripts/test-api.js http://localhost:3000
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🧪 하자체크 API 테스트 시작`);
console.log(`📍 테스트 URL: ${baseUrl}\n`);

// 테스트 데이터
const testInquiry = {
  name: '테스트 사용자',
  phone: '010-1234-5678',
  email: 'test@example.com',
  apartment: '테스트 아파트',
  size: '84',
  moveInDate: '2025-12-01',
  options: ['하자 접수 대행', 'VR 360° 촬영'],
  message: 'API 테스트를 위한 문의입니다.'
};

async function testAPI() {
  let passedTests = 0;
  let totalTests = 0;

  // 테스트 헬퍼 함수
  function test(name, testFn) {
    totalTests++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  // 1. 문의 접수 테스트
  console.log('📝 문의 접수 API 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInquiry)
    });

    const result = await response.json();

    test('문의 접수 성공', () => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message}`);
      }
      if (!result.success) {
        throw new Error(result.message);
      }
    });

    test('응답 데이터 구조 확인', () => {
      if (!result.data || !result.data.id) {
        throw new Error('응답에 데이터가 없습니다');
      }
    });

    console.log(`   문의 ID: ${result.data.id}\n`);

  } catch (error) {
    console.log(`❌ 문의 접수 실패: ${error.message}\n`);
  }

  // 2. 최근 문의 조회 테스트
  console.log('📋 최근 문의 조회 API 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/inquiries?limit=5`);
    const result = await response.json();

    test('문의 조회 성공', () => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message}`);
      }
      if (!result.success) {
        throw new Error(result.message);
      }
    });

    test('응답 데이터 배열 확인', () => {
      if (!Array.isArray(result.data)) {
        throw new Error('응답 데이터가 배열이 아닙니다');
      }
    });

    console.log(`   조회된 문의 수: ${result.data.length}\n`);

  } catch (error) {
    console.log(`❌ 문의 조회 실패: ${error.message}\n`);
  }

  // 3. 관리자 API 테스트 (토큰 없이)
  console.log('🔒 관리자 API 인증 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/admin/inquiries?limit=1`);
    
    test('인증 없이 접근 시 401 오류', () => {
      if (response.status !== 401) {
        throw new Error(`예상: 401, 실제: ${response.status}`);
      }
    });

    console.log('   인증이 올바르게 작동합니다\n');

  } catch (error) {
    console.log(`❌ 관리자 API 인증 테스트 실패: ${error.message}\n`);
  }

  // 4. CORS 테스트
  console.log('🌐 CORS 설정 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    test('CORS preflight 요청 성공', () => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    });

    test('CORS 헤더 확인', () => {
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (!corsHeader) {
        throw new Error('CORS 헤더가 없습니다');
      }
    });

    console.log('   CORS가 올바르게 설정되었습니다\n');

  } catch (error) {
    console.log(`❌ CORS 테스트 실패: ${error.message}\n`);
  }

  // 5. 잘못된 데이터 테스트
  console.log('🚫 잘못된 데이터 처리 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 필수 필드 누락
        name: '테스트'
      })
    });

    const result = await response.json();

    test('잘못된 데이터로 400 오류', () => {
      if (response.status !== 400) {
        throw new Error(`예상: 400, 실제: ${response.status}`);
      }
      if (result.success !== false) {
        throw new Error('성공 응답이 아닙니다');
      }
    });

    console.log('   잘못된 데이터 처리가 올바르게 작동합니다\n');

  } catch (error) {
    console.log(`❌ 잘못된 데이터 테스트 실패: ${error.message}\n`);
  }

  // 결과 요약
  console.log('📊 테스트 결과 요약');
  console.log(`✅ 통과: ${passedTests}/${totalTests}`);
  console.log(`❌ 실패: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 모든 테스트가 통과했습니다!');
    console.log('API가 올바르게 작동하고 있습니다.');
  } else {
    console.log('\n⚠️  일부 테스트가 실패했습니다.');
    console.log('설정을 다시 확인해주세요.');
  }

  console.log('\n📋 다음 단계:');
  console.log('1. 관리자 토큰으로 관리자 API 테스트');
  console.log('2. 텔레그램 알림 설정 확인');
  console.log('3. 프로덕션 환경에서 최종 테스트');
}

// 스크립트 실행
testAPI().catch(console.error);