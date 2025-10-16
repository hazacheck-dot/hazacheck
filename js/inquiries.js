// ===================================
// Inquiry Form Handling
// ===================================

const inquiryForm = document.getElementById('inquiryForm');
const phoneInput = document.getElementById('phone');

// ===================================
// Load Price Simulation Data from localStorage
// ===================================

function loadPriceSimulationData() {
    const priceData = localStorage.getItem('hazacheck_calculation');

    if (priceData) {
        try {
            const data = JSON.parse(priceData);

            // 평형/타입 자동 입력
            if (data.size) {
                const sizeInput = document.getElementById('size');
                if (sizeInput) {
                    // size 값을 m² 형식으로 변환
                    const sizeMap = {
                        '58': '~58m²',
                        '74': '59~74m²',
                        '84': '75~84m²',
                        '104': '85~104m²',
                        'over': '104m² 이상'
                    };
                    sizeInput.value = sizeMap[data.size] || data.size;
                }
            }

            // 옵션 자동 체크는 제거 (옵션 필드가 없으므로)

            // localStorage 데이터 삭제
            localStorage.removeItem('hazacheck_calculation');

            console.log('가격 시뮬레이션 데이터 자동 입력 완료:', data);
        } catch (error) {
            console.error('가격 시뮬레이션 데이터 파싱 오류:', error);
        }
    }
}

// Phone number formatting
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
        }

        e.target.value = value;
    });
}

// 전체 동의 체크박스
const agreeAll = document.getElementById('agreeAll');
if (agreeAll) {
    agreeAll.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.agree-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });
}

// 개별 체크박스 변경 시 전체 동의 상태 업데이트
document.querySelectorAll('.agree-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
        const allChecked = Array.from(document.querySelectorAll('.agree-checkbox'))
            .every(checkbox => checkbox.checked);
        if (agreeAll) agreeAll.checked = allChecked;
    });
});

// Form submission
if (inquiryForm) {
    inquiryForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            apartment: document.getElementById('apartment').value.trim(),
            size: document.getElementById('size').value.trim(),
            apartment_unit: document.getElementById('apartment_unit').value.trim(),
            move_in_date: document.getElementById('move_in_date').value,
            preferred_time: document.getElementById('preferred_time').value,
            message: document.getElementById('message').value.trim(),
            password: document.getElementById('password').value.trim(),
            agree_privacy: document.getElementById('agree_privacy').checked,
            agree_marketing: document.getElementById('agree_marketing').checked
        };

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('✅ 상담 신청이 완료되었습니다!\n\n빠른 시일 내에 연락드리겠습니다.');
                inquiryForm.reset();
                loadLiveInquiries(); // 목록 새로고침
            } else {
                alert('❌ ' + (result.message || '문의 접수에 실패했습니다.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ 문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
}

// ===================================
// Live Inquiry List (Right Sidebar)
// ===================================

async function loadLiveInquiries() {
    try {
        const response = await fetch('/api/inquiries?limit=10');
        const result = await response.json();

        if (response.ok && result.success) {
            displayLiveInquiries(result.data);
        }
    } catch (error) {
        console.error('실시간 목록 로드 오류:', error);
    }
}

function displayLiveInquiries(inquiries) {
    const container = document.getElementById('liveInquiryList');
    if (!container) return;

    if (inquiries.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
                <div style="font-size: 3rem; margin-bottom: 12px;">📭</div>
                <p style="margin: 0; font-size: 0.95rem;">문의 내역이 없습니다</p>
            </div>
        `;
        return;
    }

    const statusIcons = {
        'pending': '🔵',
        'answered': '✅',
        'completed': '✅',
        'cancelled': '❌'
    };

    const statusText = {
        'pending': '상담문의',
        'answered': '상담완료',
        'completed': '예약완료',
        'cancelled': '취소'
    };

    const statusColors = {
        'pending': '#2563eb',
        'answered': '#10b981',
        'completed': '#10b981',
        'cancelled': '#6b7280'
    };

    const html = inquiries.map(inquiry => `
        <div class="inquiry-live-item" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db';" onmouseout="this.style.background='#f9fafb'; this.style.borderColor='#e5e7eb';">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.95rem; font-weight: 600; color: #111827; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inquiry.apartment}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${inquiry.name} · ${inquiry.size}</div>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: ${statusColors[inquiry.status]}15; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: ${statusColors[inquiry.status]}; white-space: nowrap;">
                    ${statusIcons[inquiry.status]} ${statusText[inquiry.status]}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    // 자동 스크롤 시작
    startAutoScroll();
}

// ===================================
// Auto Scroll for Live Inquiry List
// ===================================

let scrollInterval;
let isPaused = false;

function startAutoScroll() {
    const container = document.getElementById('liveInquiryList');
    if (!container) return;

    // 기존 interval 정리
    if (scrollInterval) {
        clearInterval(scrollInterval);
    }

    // 마우스 오버 시 일시정지
    container.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    container.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    // 자동 스크롤 시작 (3초마다 아래로 이동)
    scrollInterval = setInterval(() => {
        if (isPaused) return;

        const items = container.querySelectorAll('.inquiry-live-item');
        if (items.length === 0) return;

        // 부드러운 스크롤
        container.scrollBy({
            top: items[0].offsetHeight + 12, // 아이템 높이 + gap
            behavior: 'smooth'
        });

        // 끝에 도달하면 처음으로
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
            setTimeout(() => {
                container.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 2000); // 2초 대기 후 처음으로
        }
    }, 3000); // 3초마다
}

// ===================================
// Lookup Modal
// ===================================

function openLookupModal() {
    document.getElementById('lookupModal').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('lookupPhone').focus();
    }, 100);
}

function closeLookupModal() {
    document.getElementById('lookupModal').style.display = 'none';
    document.getElementById('lookupForm').reset();
    document.getElementById('lookupResult').style.display = 'none';
}

window.openLookupModal = openLookupModal;
window.closeLookupModal = closeLookupModal;

// Lookup phone formatting
const lookupPhone = document.getElementById('lookupPhone');
if (lookupPhone) {
    lookupPhone.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
        }
        e.target.value = value;
    });
}

// Lookup password - numbers only
const lookupPassword = document.getElementById('lookupPassword');
if (lookupPassword) {
    lookupPassword.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4);
    });
}

async function handleLookup(e) {
    e.preventDefault();

    const phone = document.getElementById('lookupPhone').value.trim();
    const password = document.getElementById('lookupPassword').value.trim();

    if (!phone || !password) {
        alert('전화번호와 비밀번호를 모두 입력해주세요.');
        return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        alert('올바른 전화번호 형식이 아닙니다.');
        return;
    }

    if (!/^\d{4}$/.test(password)) {
        alert('비밀번호는 숫자 4자리입니다.');
        return;
    }

    try {
        const response = await fetch(`/api/inquiries?phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`);
        const result = await response.json();

        if (response.ok && result.success) {
            displayLookupResult(result.data);
        } else {
            alert(result.message || '전화번호 또는 비밀번호가 일치하지 않습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('조회 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

window.handleLookup = handleLookup;

function displayLookupResult(inquiries) {
    const resultDiv = document.getElementById('lookupResult');
    resultDiv.style.display = 'block';

    if (inquiries.length === 0) {
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; margin-bottom: 12px;">📭</div>
                <h4 style="margin: 0 0 8px 0; color: #374151;">문의 내역이 없습니다</h4>
                <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">입력하신 정보로 등록된 문의가 없습니다.</p>
            </div>
        `;
        return;
    }

    const statusIcons = {
        'pending': '🔵',
        'answered': '✅',
        'completed': '✅',
        'cancelled': '❌'
    };

    const statusText = {
        'pending': '상담 대기중',
        'answered': '상담 완료',
        'completed': '예약 완료',
        'cancelled': '취소됨'
    };

    const statusColors = {
        'pending': '#2563eb',
        'answered': '#10b981',
        'completed': '#10b981',
        'cancelled': '#6b7280'
    };

    const html = `
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
            <h4 style="margin: 0; color: #111827; font-size: 1.1rem;">📋 내 문의 내역 (${inquiries.length}건)</h4>
        </div>
        ${inquiries.map(inquiry => `
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div>
                        <div style="display: inline-block; background: ${statusColors[inquiry.status]}; color: white; padding: 5px 12px; border-radius: 16px; font-size: 0.8rem; font-weight: 600; margin-bottom: 8px;">
                            ${statusIcons[inquiry.status]} ${statusText[inquiry.status]}
                        </div>
                        <div style="font-size: 0.85rem; color: #6b7280;">등록일: ${inquiry.created_at}</div>
                    </div>
                </div>

                <div style="display: grid; gap: 8px; font-size: 0.95rem;">
                    <div><strong style="color: #6b7280; min-width: 80px; display: inline-block;">아파트:</strong> <span style="color: #111827; font-weight: 500;">${inquiry.apartment}</span></div>
                    <div><strong style="color: #6b7280; min-width: 80px; display: inline-block;">평형:</strong> ${inquiry.size}</div>
                    <div><strong style="color: #6b7280; min-width: 80px; display: inline-block;">희망일:</strong> ${inquiry.move_in_date || '-'}</div>
                    ${inquiry.message ? `<div style="padding-top: 8px; border-top: 1px solid #e5e7eb;"><strong style="color: #6b7280;">문의내용:</strong><br><span style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</span></div>` : ''}
                    ${inquiry.admin_response ? `
                        <div style="margin-top: 8px; padding: 12px; background: #ecfdf5; border-left: 3px solid #10b981; border-radius: 6px;">
                            <div style="font-weight: 600; color: #059669; margin-bottom: 6px;">💬 관리자 답변</div>
                            <div style="color: #065f46; line-height: 1.6; white-space: pre-wrap;">${inquiry.admin_response}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    `;

    resultDiv.innerHTML = html;
}

// ===================================
// Input Focus Effects
// ===================================

document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', function() {
        if (this.style.borderColor !== '#dc2626') {
            this.style.borderColor = '#2563eb';
            this.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
        }
    });

    input.addEventListener('blur', function() {
        if (this.style.borderColor !== '#dc2626') {
            this.style.borderColor = '#e5e7eb';
            this.style.boxShadow = 'none';
        }
    });
});

// ===================================
// Pulse Animation for Live Indicator
// ===================================

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inquiries page loaded!');

    // 가격 시뮬레이션 데이터 자동 입력
    loadPriceSimulationData();

    // 실시간 목록 로드
    loadLiveInquiries();

    // Auto refresh every 30 seconds
    setInterval(loadLiveInquiries, 30000);
});
