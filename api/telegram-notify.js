// 텔레그램 알림 유틸리티 함수
// Path: /api/telegram-notify.js

export async function sendTelegramNotification(inquiryData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('텔레그램 설정이 없습니다. 알림을 건너뜁니다.');
      return;
    }

    // 문의 정보를 포맷팅
    const message = formatInquiryMessage(inquiryData);
    
    // 텔레그램 API 호출
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      throw new Error(`텔레그램 API 오류: ${response.status}`);
    }

    const result = await response.json();
    console.log('텔레그램 알림 발송 성공:', result.message_id);
    
    return result;
  } catch (error) {
    console.error('텔레그램 알림 발송 실패:', error);
    // 알림 실패해도 문의 접수는 성공으로 처리
    return null;
  }
}

function formatInquiryMessage(inquiry) {
  const {
    id,
    name,
    phone,
    email,
    apartment,
    size,
    move_in_date,
    options,
    message,
    created_at
  } = inquiry;

  // 옵션 파싱
  let optionsText = '';
  if (options) {
    try {
      const optionsArray = JSON.parse(options);
      if (optionsArray.length > 0) {
        optionsText = `\n📋 <b>추가 옵션:</b>\n${optionsArray.map(opt => `• ${opt}`).join('\n')}`;
      }
    } catch (e) {
      console.error('옵션 파싱 오류:', e);
    }
  }

  // 문의 내용 요약 (100자 제한)
  const messagePreview = message ? 
    (message.length > 100 ? message.substring(0, 100) + '...' : message) : 
    '문의 내용 없음';

  const formattedMessage = `
🚨 <b>새로운 문의가 접수되었습니다!</b>

🆔 <b>문의 ID:</b> #${id}
👤 <b>이름:</b> ${name}
📞 <b>연락처:</b> ${phone}
${email ? `📧 <b>이메일:</b> ${email}` : ''}
🏠 <b>아파트:</b> ${apartment}
📐 <b>세대 크기:</b> ${size}타입
📅 <b>희망 점검일:</b> ${move_in_date}
⏰ <b>접수 시간:</b> ${new Date(created_at).toLocaleString('ko-KR')}
${optionsText}

💬 <b>문의 내용:</b>
${messagePreview}

🔗 <b>관리자 페이지:</b> https://www.hazacheck.com/admin.html
  `.trim();

  return formattedMessage;
}

// 상태 변경 알림
export async function sendStatusChangeNotification(inquiryId, oldStatus, newStatus, adminNote = '') {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      return;
    }

    const statusEmoji = {
      'pending': '⏳',
      'answered': '✅',
      'completed': '🎉',
      'cancelled': '❌'
    };

    const statusText = {
      'pending': '답변 대기',
      'answered': '답변 완료',
      'completed': '처리 완료',
      'cancelled': '취소됨'
    };

    const message = `
📝 <b>문의 상태가 변경되었습니다</b>

🆔 <b>문의 ID:</b> #${inquiryId}
📊 <b>상태 변경:</b> ${statusEmoji[oldStatus]} ${statusText[oldStatus]} → ${statusEmoji[newStatus]} ${statusText[newStatus]}
${adminNote ? `📝 <b>관리자 메모:</b> ${adminNote}` : ''}
⏰ <b>변경 시간:</b> ${new Date().toLocaleString('ko-KR')}

🔗 <b>관리자 페이지:</b> https://www.hazacheck.com/admin.html
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      throw new Error(`텔레그램 API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('텔레그램 상태 변경 알림 실패:', error);
    return null;
  }
}