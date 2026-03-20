// Telegram notification utility
// Path: /api/telegram-notify.js

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatKoreanDateTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const koreanTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

  const year = koreanTime.getFullYear();
  const month = String(koreanTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreanTime.getDate()).padStart(2, '0');
  const minutes = String(koreanTime.getMinutes()).padStart(2, '0');

  const ampm = koreanTime.getHours() >= 12 ? '오후' : '오전';
  const displayHour = koreanTime.getHours() % 12 || 12;

  return `${year}. ${month}. ${day}. ${ampm} ${displayHour}:${minutes}`;
}

function normalizeOptions(options) {
  if (!options) return [];
  if (Array.isArray(options)) return options;

  if (typeof options === 'string') {
    const trimmed = options.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('옵션 파싱 오류:', error);
      return [];
    }
  }

  return [];
}

async function sendTelegramMessage(botToken, chatId, message) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`텔레그램 API 오류: ${response.status} - ${errorText}`);
  }

  return response.json();
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
    preferred_time,
    options,
    message,
    created_at,
  } = inquiry;

  const optionsArray = normalizeOptions(options);
  const optionsText = optionsArray.length > 0
    ? `\n📦 <b>추가 옵션:</b>\n${optionsArray.map((opt) => `• ${escapeHtml(opt)}`).join('\n')}`
    : '';

  const safeMessage = escapeHtml(message || '문의 내용 없음');
  const messagePreview = safeMessage.length > 100 ? `${safeMessage.substring(0, 100)}...` : safeMessage;

  return `
✨ <b>새로운 문의가 접수되었습니다</b>

🆔 <b>문의 ID:</b> #${id}
👤 <b>이름:</b> ${escapeHtml(name)}
📞 <b>연락처:</b> ${escapeHtml(phone)}
${email ? `✉️ <b>이메일:</b> ${escapeHtml(email)}\n` : ''}🏢 <b>아파트:</b> ${escapeHtml(apartment)}
📐 <b>평형/타입:</b> ${escapeHtml(size)}
📅 <b>희망 점검일:</b> ${escapeHtml(formatDate(move_in_date))}${preferred_time ? ` ${escapeHtml(preferred_time)}` : ''}
⏰ <b>접수 시간:</b> ${escapeHtml(formatKoreanDateTime(created_at))}${optionsText}

💬 <b>문의 내용:</b>
${messagePreview}

🔗 <b>관리자 페이지:</b> https://www.hazacheck.com/admin.html
  `.trim();
}

async function sendTelegramNotification(inquiryData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.log('텔레그램 설정이 없습니다. 알림을 건너뜁니다.');
      return null;
    }

    const message = formatInquiryMessage(inquiryData);
    const result = await sendTelegramMessage(botToken, chatId, message);
    console.log('텔레그램 알림 발송 성공:', result.message_id);
    return result;
  } catch (error) {
    console.error('텔레그램 알림 발송 실패:', error);
    return null;
  }
}

async function sendStatusChangeNotification(inquiryId, oldStatus, newStatus, adminNote = '') {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return null;
    }

    const statusEmoji = {
      pending: '⏳',
      answered: '✅',
      completed: '🎉',
      cancelled: '❌',
    };

    const statusText = {
      pending: '답변 대기',
      answered: '답변 완료',
      completed: '처리 완료',
      cancelled: '취소됨',
    };

    const message = `
📝 <b>문의 상태가 변경되었습니다</b>

🆔 <b>문의 ID:</b> #${escapeHtml(inquiryId)}
📊 <b>상태 변경:</b> ${statusEmoji[oldStatus] || ''} ${escapeHtml(statusText[oldStatus] || oldStatus)} -> ${statusEmoji[newStatus] || ''} ${escapeHtml(statusText[newStatus] || newStatus)}
${adminNote ? `🗒 <b>관리자 메모:</b> ${escapeHtml(adminNote)}\n` : ''}⏰ <b>변경 시간:</b> ${escapeHtml(formatKoreanDateTime(new Date().toISOString()))}

🔗 <b>관리자 페이지:</b> https://www.hazacheck.com/admin.html
    `.trim();

    return await sendTelegramMessage(botToken, chatId, message);
  } catch (error) {
    console.error('텔레그램 상태 변경 알림 실패:', error);
    return null;
  }
}

module.exports = {
  sendTelegramNotification,
  sendStatusChangeNotification,
};
