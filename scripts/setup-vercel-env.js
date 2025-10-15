// Vercel 환경변수 설정 스크립트
const { execSync } = require('child_process');
const fs = require('fs');

// .env.local 파일 읽기
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};

// 환경변수 파싱
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      // 따옴표 제거
      value = value.replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  }
});

console.log('📋 발견된 환경변수:');
Object.keys(envVars).forEach(key => {
  console.log(`  - ${key}`);
});

// 중요한 환경변수들
const importantVars = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'ADMIN_TOKEN',
  'POSTGRES_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_USER',
  'POSTGRES_HOST',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE'
];

console.log('\n🚀 Vercel 환경변수 추가 시작...\n');

importantVars.forEach(varName => {
  if (envVars[varName]) {
    try {
      console.log(`📝 ${varName} 추가 중...`);
      
      // 환경변수 값을 임시 파일에 저장
      const tempFile = `.temp_${varName}`;
      fs.writeFileSync(tempFile, envVars[varName]);
      
      // Vercel CLI로 환경변수 추가 (production, preview, development)
      const cmd = `type ${tempFile} | vercel env add ${varName} production`;
      execSync(cmd, { stdio: 'inherit' });
      
      // 임시 파일 삭제
      fs.unlinkSync(tempFile);
      
      console.log(`✅ ${varName} 추가 완료\n`);
    } catch (error) {
      console.error(`❌ ${varName} 추가 실패:`, error.message);
    }
  }
});

console.log('\n✅ 환경변수 설정 완료!');
console.log('\n다음 단계:');
console.log('1. Vercel 대시보드에서 환경변수 확인');
console.log('2. 프로젝트 재배포 (Deployments > Redeploy)');

