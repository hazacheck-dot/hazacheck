#!/usr/bin/env node

/**
 * 하자체크 관리자 API 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-admin-api.js [baseUrl] [adminToken]
 * 
 * 예시:
 * node scripts/test-admin-api.js https://hazacheck.vercel.app your-admin-token
 * node scripts/test-admin-api.js http://localhost:3000 your-admin-token
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';
const adminToken = process.argv[3];

if (!adminToken) {
  console.log('❌ 관리자 토큰이 필요합니다.');
  console.log('사용법: node scripts/test-admin-api.js [baseUrl] [adminToken]');
  process.exit(1);
}

console.log(`🔧 하자체크 관리자 API 테스트 시작`);
console.log(`📍 테스트 URL: ${baseUrl}`);
console.log(`🔑 관리자 토큰: ${adminToken.substring(0, 8)}...\n`);

async function testAdminAPI() {
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

  // 1. 관리자 문의 목록 조회 테스트
  console.log('📋 관리자 문의 목록 조회 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/admin/inquiries?limit=10`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();

    test('관리자 문의 조회 성공', () => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message}`);
      }
      if (!result.success) {
        throw new Error(result.message);
      }
    });

    test('응답 데이터 구조 확인', () => {
      if (!result.data || !result.data.inquiries) {
        throw new Error('응답에 inquiries 데이터가 없습니다');
      }
      if (!result.data.pagination) {
        throw new Error('응답에 pagination 데이터가 없습니다');
      }
    });

    console.log(`   조회된 문의 수: ${result.data.inquiries.length}`);
    console.log(`   총 페이지 수: ${result.data.pagination.totalPages}\n`);

  } catch (error) {
    console.log(`❌ 관리자 문의 조회 실패: ${error.message}\n`);
  }

  // 2. 상태 필터 테스트
  console.log('🔍 상태 필터 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/admin/inquiries?status=pending&limit=5`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();

    test('상태 필터 조회 성공', () => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message}`);
      }
    });

    test('필터링된 결과 확인', () => {
      if (result.data.inquiries.length > 0) {
        const allPending = result.data.inquiries.every(inquiry => inquiry.status === 'pending');
        if (!allPending) {
          throw new Error('일부 문의가 pending 상태가 아닙니다');
        }
      }
    });

    console.log(`   pending 상태 문의 수: ${result.data.inquiries.length}\n`);

  } catch (error) {
    console.log(`❌ 상태 필터 테스트 실패: ${error.message}\n`);
  }

  // 3. 검색 기능 테스트
  console.log('🔍 검색 기능 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/admin/inquiries?search=테스트&limit=5`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();

    test('검색 조회 성공', () => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message}`);
      }
    });

    console.log(`   검색 결과 수: ${result.data.inquiries.length}\n`);

  } catch (error) {
    console.log(`❌ 검색 기능 테스트 실패: ${error.message}\n`);
  }

  // 4. 문의 상태 변경 테스트
  console.log('✏️ 문의 상태 변경 테스트');
  try {
    // 먼저 문의 목록을 가져와서 첫 번째 문의의 ID를 사용
    const listResponse = await fetch(`${baseUrl}/api/admin/inquiries?limit=1`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const listResult = await listResponse.json();
    
    if (listResult.data.inquiries.length === 0) {
      console.log('   테스트할 문의가 없습니다. 문의를 먼저 생성해주세요.\n');
    } else {
      const inquiryId = listResult.data.inquiries[0].id;
      const originalStatus = listResult.data.inquiries[0].status;

      // 상태 변경
      const updateResponse = await fetch(`${baseUrl}/api/admin/inquiries`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: inquiryId,
          status: 'answered',
          adminNote: 'API 테스트를 통한 상태 변경'
        })
      });

      const updateResult = await updateResponse.json();

      test('문의 상태 변경 성공', () => {
        if (!updateResponse.ok) {
          throw new Error(`HTTP ${updateResponse.status}: ${updateResult.message}`);
        }
        if (!updateResult.success) {
          throw new Error(updateResult.message);
        }
      });

      test('상태 변경 확인', () => {
        if (updateResult.data.status !== 'answered') {
          throw new Error('상태가 올바르게 변경되지 않았습니다');
        }
      });

      console.log(`   문의 ID ${inquiryId} 상태 변경: ${originalStatus} → answered`);

      // 원래 상태로 복원
      await fetch(`${baseUrl}/api/admin/inquiries`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: inquiryId,
          status: originalStatus,
          adminNote: '테스트 후 원래 상태로 복원'
        })
      });

      console.log(`   원래 상태(${originalStatus})로 복원 완료\n`);
    }

  } catch (error) {
    console.log(`❌ 문의 상태 변경 테스트 실패: ${error.message}\n`);
  }

  // 5. 잘못된 토큰 테스트
  console.log('🚫 잘못된 토큰 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/admin/inquiries?limit=1`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    test('잘못된 토큰으로 401 오류', () => {
      if (response.status !== 401) {
        throw new Error(`예상: 401, 실제: ${response.status}`);
      }
    });

    console.log('   잘못된 토큰 처리가 올바르게 작동합니다\n');

  } catch (error) {
    console.log(`❌ 잘못된 토큰 테스트 실패: ${error.message}\n`);
  }

  // 6. 권한 없는 메서드 테스트
  console.log('🚫 권한 없는 메서드 테스트');
  try {
    const response = await fetch(`${baseUrl}/api/admin/inquiries`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    test('지원하지 않는 메서드로 405 오류', () => {
      if (response.status !== 405) {
        throw new Error(`예상: 405, 실제: ${response.status}`);
      }
    });

    console.log('   지원하지 않는 메서드 처리가 올바르게 작동합니다\n');

  } catch (error) {
    console.log(`❌ 권한 없는 메서드 테스트 실패: ${error.message}\n`);
  }

  // 결과 요약
  console.log('📊 관리자 API 테스트 결과 요약');
  console.log(`✅ 통과: ${passedTests}/${totalTests}`);
  console.log(`❌ 실패: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 모든 관리자 API 테스트가 통과했습니다!');
    console.log('관리자 기능이 올바르게 작동하고 있습니다.');
  } else {
    console.log('\n⚠️  일부 테스트가 실패했습니다.');
    console.log('관리자 토큰과 설정을 다시 확인해주세요.');
  }

  console.log('\n📋 다음 단계:');
  console.log('1. 관리자 페이지에서 실제 문의 관리 테스트');
  console.log('2. 텔레그램 알림 기능 확인');
  console.log('3. 프로덕션 환경에서 최종 테스트');
}

// 스크립트 실행
testAdminAPI().catch(console.error);