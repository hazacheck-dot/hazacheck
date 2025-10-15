// 텔레그램 봇 토큰 테스트 스크립트
// 사용법: node scripts/test-telegram.js

// .env.local 파일 로드
require('dotenv').config({ path: '.env.local' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function testTelegramBot() {
  console.log('🤖 텔레그램 봇 테스트 시작...\n');
  
  // 1. 봇 정보 확인
  console.log('1. 봇 정보 확인 중...');
  try {
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    if (botInfo.ok) {
      console.log('✅ 봇 토큰 유효');
      console.log(`   봇 이름: ${botInfo.result.first_name}`);
      console.log(`   봇 사용자명: @${botInfo.result.username}`);
    } else {
      console.log('❌ 봇 토큰 오류:', botInfo.description);
      return;
    }
  } catch (error) {
    console.log('❌ 봇 정보 확인 실패:', error.message);
    return;
  }

  // 2. 채팅 ID 확인
  console.log('\n2. 채팅 ID 확인 중...');
  try {
    const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
    const updates = await updatesResponse.json();
    
    if (updates.ok) {
      console.log('✅ 봇 업데이트 수신 가능');
      if (updates.result.length > 0) {
        console.log(`   최근 메시지 수: ${updates.result.length}`);
        const lastMessage = updates.result[updates.result.length - 1];
        console.log(`   마지막 채팅 ID: ${lastMessage.message.chat.id}`);
        console.log(`   마지막 메시지: ${lastMessage.message.text}`);
      } else {
        console.log('   ⚠️  아직 봇과 대화한 메시지가 없습니다.');
        console.log('   봇을 찾아서 /start 명령을 보내주세요.');
      }
    } else {
      console.log('❌ 업데이트 확인 실패:', updates.description);
    }
  } catch (error) {
    console.log('❌ 채팅 ID 확인 실패:', error.message);
  }

  // 3. 테스트 메시지 전송
  console.log('\n3. 테스트 메시지 전송 중...');
  try {
    const testMessage = `🧪 테스트 메시지
시간: ${new Date().toLocaleString('ko-KR')}
봇이 정상적으로 작동합니다!`;

    const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML'
      })
    });

    const sendResult = await sendResponse.json();
    
    if (sendResult.ok) {
      console.log('✅ 테스트 메시지 전송 성공');
      console.log(`   메시지 ID: ${sendResult.result.message_id}`);
    } else {
      console.log('❌ 테스트 메시지 전송 실패:', sendResult.description);
    }
  } catch (error) {
    console.log('❌ 메시지 전송 실패:', error.message);
  }

  console.log('\n📋 설정 확인사항:');
  console.log(`   봇 토큰: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
  console.log(`   채팅 ID: ${TELEGRAM_CHAT_ID}`);
  console.log('\n💡 문제 해결 방법:');
  console.log('   1. 봇 토큰이 올바른지 확인');
  console.log('   2. 봇과 대화를 시작했는지 확인 (/start 명령)');
  console.log('   3. 채팅 ID가 올바른지 확인');
  console.log('   4. Vercel 환경변수에 올바르게 설정되었는지 확인');
}

// 환경변수 확인
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log('❌ .env.local 파일에 텔레그램 환경변수가 설정되지 않았습니다.');
  console.log('\n📝 .env.local 파일에 다음 내용을 추가하세요:');
  console.log('TELEGRAM_BOT_TOKEN="your_bot_token_here"');
  console.log('TELEGRAM_CHAT_ID="your_chat_id_here"');
  console.log('\n💡 텔레그램 봇 토큰 얻는 방법:');
  console.log('1. @BotFather에게 /newbot 명령으로 봇 생성');
  console.log('2. 봇 토큰을 받아서 TELEGRAM_BOT_TOKEN에 설정');
  console.log('3. 봇과 대화 시작: /start 명령 전송');
  console.log('4. https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates 에서 chat.id 확인');
  console.log('5. chat.id를 TELEGRAM_CHAT_ID에 설정');
} else {
  testTelegramBot();
}
