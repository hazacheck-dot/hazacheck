#!/usr/bin/env node

/**
 * 하자체크 환경변수 설정 도우미 스크립트
 * 
 * 사용법:
 * node scripts/setup-env.js
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('🚀 하자체크 환경변수 설정 도우미\n');
  
  console.log('이 스크립트는 다음 환경변수들을 설정하는데 도움을 줍니다:');
  console.log('1. ADMIN_TOKEN (관리자 인증 토큰)');
  console.log('2. TELEGRAM_BOT_TOKEN (텔레그램 봇 토큰)');
  console.log('3. TELEGRAM_CHAT_ID (텔레그램 채팅 ID)\n');

  // 관리자 토큰 생성
  const adminToken = generateSecureToken();
  console.log(`✅ 관리자 토큰이 생성되었습니다: ${adminToken}\n`);

  // 텔레그램 설정
  console.log('📱 텔레그램 봇 설정 (선택사항)');
  console.log('텔레그램 알림을 사용하시려면 다음 단계를 따라주세요:');
  console.log('1. 텔레그램에서 @BotFather 검색');
  console.log('2. /newbot 명령어로 새 봇 생성');
  console.log('3. 봇 이름과 사용자명 설정');
  console.log('4. 받은 토큰을 아래에 입력\n');

  const useTelegram = await question('텔레그램 알림을 사용하시겠습니까? (y/N): ');
  
  let telegramBotToken = '';
  let telegramChatId = '';
  
  if (useTelegram.toLowerCase() === 'y' || useTelegram.toLowerCase() === 'yes') {
    telegramBotToken = await question('텔레그램 봇 토큰을 입력하세요: ');
    
    console.log('\n채팅 ID 확인 방법:');
    console.log('1. 생성한 봇과 대화를 시작하세요');
    console.log('2. https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates 에 접속');
    console.log('3. "chat":{"id": 숫자} 부분의 숫자를 찾아서 입력하세요\n');
    
    telegramChatId = await question('텔레그램 채팅 ID를 입력하세요: ');
  }

  // .env.local 파일 생성
  const envContent = `# 하자체크 환경변수 설정
# 이 파일은 로컬 개발용입니다. 프로덕션에서는 Vercel 대시보드에서 설정하세요.

# 관리자 인증 토큰
ADMIN_TOKEN=${adminToken}

# 텔레그램 알림 설정 (선택사항)
${telegramBotToken ? `TELEGRAM_BOT_TOKEN=${telegramBotToken}` : '# TELEGRAM_BOT_TOKEN=your-bot-token'}
${telegramChatId ? `TELEGRAM_CHAT_ID=${telegramChatId}` : '# TELEGRAM_CHAT_ID=your-chat-id'}

# 데이터베이스 설정 (Vercel Postgres 사용 시 자동 설정됨)
# POSTGRES_URL=postgres://username:password@host:5432/database
# POSTGRES_PRISMA_URL=postgres://username:password@host:5432/database?pgbouncer=true
# POSTGRES_URL_NON_POOLING=postgres://username:password@host:5432/database
# POSTGRES_USER=username
# POSTGRES_HOST=host
# POSTGRES_PASSWORD=password
# POSTGRES_DATABASE=database
`;

  const fs = require('fs');
  fs.writeFileSync('.env.local', envContent);
  
  console.log('\n✅ .env.local 파일이 생성되었습니다!');
  console.log('\n📋 다음 단계:');
  console.log('1. Vercel에 프로젝트 배포');
  console.log('2. Vercel 대시보드에서 환경변수 설정');
  console.log('3. 데이터베이스 초기화 (scripts/init-db.sql 실행)');
  console.log('4. API 테스트');
  
  console.log('\n🔗 유용한 링크:');
  console.log('- Vercel 대시보드: https://vercel.com/dashboard');
  console.log('- 텔레그램 봇 생성: https://t.me/botfather');
  console.log('- 설정 가이드: BACKEND_SETUP_GUIDE.md');
  
  rl.close();
}

main().catch(console.error);