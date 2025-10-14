// ===================================
// Inquiry Form Handling
// ===================================

const inquiryForm = document.getElementById('inquiryForm');
const formSuccess = document.getElementById('formSuccess');
const phoneInput = document.getElementById('phone');

// ===================================
// Price Information Integration
// ===================================

// Load price information from localStorage
function loadPriceInformation() {
    const priceData = localStorage.getItem('hazacheck_calculation');
    
    if (priceData) {
        try {
            const data = JSON.parse(priceData);
            displayPriceInfo(data);
            applyPriceToForm(data);
            
            // Clear localStorage after use
            localStorage.removeItem('hazacheck_calculation');
        } catch (error) {
            console.error('Error parsing price data:', error);
        }
    }
}

// Display price information card
function displayPriceInfo(data) {
    const priceInfoCard = document.getElementById('priceInfoCard');
    const priceSize = document.getElementById('priceSize');
    const priceBase = document.getElementById('priceBase');
    const priceTotal = document.getElementById('priceTotal');
    const priceOptionsContainer = document.getElementById('priceOptionsContainer');
    const priceOptions = document.getElementById('priceOptions');
    
    if (!priceInfoCard) return;
    
    // Show the card
    priceInfoCard.style.display = 'block';
    
    // Update size
    priceSize.textContent = `${data.size}타입`;
    
    // Update base price
    priceBase.textContent = `₩${data.basePrice.toLocaleString()}`;
    
    // Update options if any
    if (data.options && data.options.length > 0) {
        priceOptionsContainer.style.display = 'block';
        priceOptions.innerHTML = '';
        
        data.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'price-option';
            optionDiv.textContent = `${option.name} (+₩${option.price.toLocaleString()})`;
            priceOptions.appendChild(optionDiv);
        });
    } else {
        priceOptionsContainer.style.display = 'none';
    }
    
    // Update total
    priceTotal.textContent = `₩${data.totalPrice.toLocaleString()}`;
}

// Apply price information to form
function applyPriceToForm(data) {
    // Set size
    const sizeSelect = document.getElementById('size');
    if (sizeSelect) {
        sizeSelect.value = data.size;
    }
    
    // Set options
    const optionCheckboxes = document.querySelectorAll('input[name="options"]');
    optionCheckboxes.forEach(checkbox => {
        checkbox.checked = false; // Reset first
        
        if (data.options && data.options.length > 0) {
            data.options.forEach(option => {
                if (checkbox.value === option.name) {
                    checkbox.checked = true;
                }
            });
        }
    });
    
    // Add price information to message
    const messageTextarea = document.getElementById('message');
    if (messageTextarea && !messageTextarea.value.trim()) {
        let priceMessage = `\n\n=== 견적 정보 ===\n`;
        priceMessage += `세대 크기: ${data.size}타입\n`;
        priceMessage += `기본 점검 비용: ₩${data.basePrice.toLocaleString()}\n`;
        
        if (data.options && data.options.length > 0) {
            priceMessage += `추가 옵션:\n`;
            data.options.forEach(option => {
                priceMessage += `- ${option.name}: ₩${option.price.toLocaleString()}\n`;
            });
        }
        
        priceMessage += `총 예상 비용: ₩${data.totalPrice.toLocaleString()}\n`;
        priceMessage += `\n위 견적으로 문의드립니다.`;
        
        messageTextarea.value = priceMessage;
    }
}

// Close price info card
const closePriceInfoBtn = document.getElementById('closePriceInfo');
if (closePriceInfoBtn) {
    closePriceInfoBtn.addEventListener('click', () => {
        const priceInfoCard = document.getElementById('priceInfoCard');
        if (priceInfoCard) {
            priceInfoCard.style.display = 'none';
        }
    });
}

// Load price information on page load
document.addEventListener('DOMContentLoaded', loadPriceInformation);

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

// Set minimum date for moveInDate (today)
const moveInDateInput = document.getElementById('moveInDate');
if (moveInDateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    moveInDateInput.min = `${year}-${month}-${day}`;
}

// Form submission
if (inquiryForm) {
    inquiryForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (!validateInquiryForm()) {
            return;
        }

        // Get form data
        const formData = new FormData(inquiryForm);
        const data = {};

        formData.forEach((value, key) => {
            if (key === 'options') {
                if (!data.options) {
                    data.options = [];
                }
                data.options.push(value);
            } else {
                data[key] = value;
            }
        });

        // Send data to API
        sendInquiryToServer(data);
    });
}

function validateInquiryForm() {
    let isValid = true;
    const requiredFields = inquiryForm.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');

            // Show error message
            if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.style.color = 'var(--severity-high)';
                errorMsg.style.fontSize = '0.875rem';
                errorMsg.style.marginTop = '4px';
                errorMsg.textContent = '필수 항목입니다.';
                field.parentNode.appendChild(errorMsg);
            }
        } else {
            field.classList.remove('error');

            // Remove error message
            const errorMsg = field.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    });

    // Validate email format if provided
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            isValid = false;
            emailInput.classList.add('error');

            if (!emailInput.nextElementSibling || !emailInput.nextElementSibling.classList.contains('error-message')) {
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.style.color = 'var(--severity-high)';
                errorMsg.style.fontSize = '0.875rem';
                errorMsg.style.marginTop = '4px';
                errorMsg.textContent = '올바른 이메일 형식이 아닙니다.';
                emailInput.parentNode.appendChild(errorMsg);
            }
        }
    }

    // Validate phone number format
    const phone = phoneInput.value.replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 11) {
        isValid = false;
        phoneInput.classList.add('error');

        if (!phoneInput.nextElementSibling || !phoneInput.nextElementSibling.classList.contains('error-message')) {
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.style.color = 'var(--severity-high)';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '4px';
            errorMsg.textContent = '올바른 전화번호 형식이 아닙니다.';
            phoneInput.parentNode.appendChild(errorMsg);
        }
    }

    if (!isValid) {
        // Scroll to first error
        const firstError = inquiryForm.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

function showSuccessMessage() {
    // Hide form
    inquiryForm.style.display = 'none';

    // Show success message
    formSuccess.classList.add('active');

    // Scroll to success message
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Send inquiry data to API
async function sendInquiryToServer(data) {
    try {
        const response = await fetch('/api/inquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Success:', result);
            showSuccessMessage();
            
            // 최근 문의 내역 새로고침
            loadRecentInquiries();
        } else {
            throw new Error(result.message || '문의 접수에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// Remove error styling on input
const allInputs = document.querySelectorAll('input, select, textarea');
allInputs.forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
        const errorMsg = this.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    });
});

// ===================================
// Inquiry List Toggle (Optional)
// ===================================
const inquiryItems = document.querySelectorAll('.inquiry-item');

inquiryItems.forEach(item => {
    const preview = item.querySelector('.inquiry-preview');

    // Check if preview has answer (both Q and A)
    if (preview && preview.querySelectorAll('p').length > 1) {
        // Item is expandable - do nothing for now
        // You can add expand/collapse functionality here if needed
    }
});

// ===================================
// Load Recent Inquiries from API (with Pagination)
// ===================================
let currentPage = 1;
const itemsPerPage = 10;
let allInquiries = [];

async function loadRecentInquiries(page = 1) {
    try {
        const response = await fetch('/api/inquiries?limit=100');
        const result = await response.json();

        if (response.ok && result.success) {
            allInquiries = result.data;
            currentPage = page;
            displayRecentInquiries(allInquiries, page);
            renderPagination(allInquiries.length, page);
        }
    } catch (error) {
        console.error('최근 문의 내역 로드 오류:', error);
        // 오류 시 기존 정적 데이터 유지
    }
}

function displayRecentInquiries(inquiries, page = 1) {
    const inquiryTableBody = document.getElementById('inquiryTableBody');
    if (!inquiryTableBody) return;

    // 페이지에 해당하는 데이터만 추출
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageInquiries = inquiries.slice(startIndex, endIndex);

    if (pageInquiries.length === 0) {
        inquiryTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 60px 20px; text-align: center; color: #6b7280;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📭</div>
                    <div style="font-size: 1.1rem; font-weight: 500;">문의 내역이 없습니다</div>
                </td>
            </tr>
        `;
        return;
    }

    const statusText = {
        'pending': '상담문의',
        'answered': '상담완료',
        'completed': '상담완료',
        'cancelled': '취소'
    };

    const statusColor = {
        'pending': '#2563eb',
        'answered': '#10b981',
        'completed': '#10b981',
        'cancelled': '#6b7280'
    };

    // 이름 마스킹 함수
    function maskName(name) {
        if (!name || name.length === 0) return '**';
        if (name.length === 1) return name + '*';
        return name.charAt(0) + '**';
    }

    // 날짜 포맷팅 함수 (YYYY-MM-DD 또는 ISO 형식 → YYYY. MM. DD.)
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}.`;
    }

    const html = pageInquiries.map(inquiry => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 16px; text-align: center;">${inquiry.id}</td>
            <td style="padding: 16px; text-align: left; font-weight: 500; max-width: 300px; word-wrap: break-word; word-break: keep-all; line-height: 1.4;">${inquiry.apartment}</td>
            <td style="padding: 16px; text-align: center;">${maskName(inquiry.name)}</td>
            <td style="padding: 16px; text-align: center; white-space: nowrap;">${formatDate(inquiry.created_at)}</td>
            <td style="padding: 16px; text-align: center;">
                <button onclick="viewInquiry(${inquiry.id})" class="btn-status" style="padding: 6px 16px; background: ${statusColor[inquiry.status] || '#2563eb'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; white-space: nowrap;">${statusText[inquiry.status] || '상담문의'}</button>
            </td>
        </tr>
    `).join('');

    inquiryTableBody.innerHTML = html;
    console.log(`문의 목록 업데이트 완료: 페이지 ${page}, ${pageInquiries.length}개 표시 (전체 ${inquiries.length}개)`);
}

// 페이지네이션 렌더링
function renderPagination(totalItems, currentPage) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';

    // 이전 버튼
    if (currentPage > 1) {
        html += `<button onclick="changePage(${currentPage - 1})" style="padding: 8px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">이전</button>`;
    } else {
        html += `<button disabled style="padding: 8px 12px; border: 1px solid #e5e7eb; background: #f9fafb; color: #9ca3af; border-radius: 6px; cursor: not-allowed; font-size: 0.95rem;">이전</button>`;
    }

    // 페이지 번호 버튼
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // 첫 페이지
    if (startPage > 1) {
        html += `<button onclick="changePage(1)" style="padding: 8px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">1</button>`;
        if (startPage > 2) {
            html += `<span style="padding: 8px 4px; color: #6b7280;">...</span>`;
        }
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button style="padding: 8px 12px; border: 1px solid #2563eb; background: #2563eb; color: white; border-radius: 6px; cursor: default; font-size: 0.95rem; font-weight: 600;">${i}</button>`;
        } else {
            html += `<button onclick="changePage(${i})" style="padding: 8px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">${i}</button>`;
        }
    }

    // 마지막 페이지
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span style="padding: 8px 4px; color: #6b7280;">...</span>`;
        }
        html += `<button onclick="changePage(${totalPages})" style="padding: 8px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">${totalPages}</button>`;
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<button onclick="changePage(${currentPage + 1})" style="padding: 8px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">다음</button>`;
    } else {
        html += `<button disabled style="padding: 8px 12px; border: 1px solid #e5e7eb; background: #f9fafb; color: #9ca3af; border-radius: 6px; cursor: not-allowed; font-size: 0.95rem;">다음</button>`;
    }

    paginationContainer.innerHTML = html;
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    displayRecentInquiries(allInquiries, page);
    renderPagination(allInquiries.length, page);

    // 테이블 상단으로 스크롤
    const tableSection = document.querySelector('.inquiry-table-section');
    if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Global function
window.changePage = changePage;

// ===================================
// Load Calculation Data from Main Page
// ===================================
function loadCalculationData() {
    const calculationData = localStorage.getItem('hazacheck_calculation');
    
    if (calculationData) {
        try {
            const data = JSON.parse(calculationData);
            
            // Auto-fill size select
            const sizeSelect = document.getElementById('size');
            if (sizeSelect && data.size) {
                sizeSelect.value = data.size;
                
                // Highlight the select field
                sizeSelect.style.backgroundColor = '#e0f2fe';
                setTimeout(() => {
                    sizeSelect.style.backgroundColor = '';
                }, 2000);
            }
            
            // Auto-check options
            if (data.options && data.options.length > 0) {
                const optionCheckboxes = document.querySelectorAll('input[name="options"]');
                optionCheckboxes.forEach(checkbox => {
                    const optionText = checkbox.value;
                    const isSelected = data.options.some(opt => 
                        optionText.includes(opt.name.split(' ')[0])
                    );
                    if (isSelected) {
                        checkbox.checked = true;
                        // Highlight
                        checkbox.parentElement.style.backgroundColor = '#e0f2fe';
                        setTimeout(() => {
                            checkbox.parentElement.style.backgroundColor = '';
                        }, 2000);
                    }
                });
            }
            
            // Show notification
            showCalculationNotification(data);
            
            // Clear localStorage after 5 minutes
            setTimeout(() => {
                localStorage.removeItem('hazacheck_calculation');
            }, 5 * 60 * 1000);
            
        } catch (error) {
            console.error('Failed to load calculation data:', error);
        }
    }
}

function showCalculationNotification(data) {
    const notification = document.createElement('div');
    notification.className = 'calculation-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">✓</div>
            <div class="notification-text">
                <strong>계산 정보가 자동으로 입력되었습니다</strong>
                <p>${data.size}타입 • 총 ₩${data.totalPrice.toLocaleString()}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===================================
// My Inquiry Lookup
// ===================================
function showMyInquiriesModal() {
    const modal = document.createElement('div');
    modal.id = 'myInquiriesModal';
    modal.innerHTML = `
        <div class="modal" style="display: flex; position: fixed; z-index: 10001; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; overflow: auto;">
            <div class="modal-content" style="background-color: white; margin: 20px; padding: 0; border-radius: 16px; width: 90%; max-width: 500px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: slideIn 0.3s ease-out;">
                <div class="modal-header" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 24px; border-radius: 16px 16px 0 0;">
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.8rem;">📱</span>
                        내 문의 조회
                    </h2>
                    <p style="margin: 10px 0 0 0; font-size: 0.95rem; opacity: 0.9;">등록하신 전화번호로 문의 내역을 확인하세요</p>
                </div>
                <div class="modal-body" style="padding: 32px;">
                    <div id="phoneInputSection">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #374151; font-size: 1.05rem;">전화번호</label>
                        <input type="tel" id="lookupPhone" placeholder="010-0000-0000"
                            style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 10px; font-size: 1.1rem; transition: all 0.2s;"
                            onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                            onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                        <p style="margin-top: 12px; font-size: 0.9rem; color: #6b7280; line-height: 1.5;">
                            <span style="color: #2563eb; font-weight: 600;">💡 TIP:</span> 문의 시 입력하신 전화번호를 정확히 입력해주세요.
                        </p>
                        <div style="margin-top: 24px; display: flex; gap: 10px;">
                            <button onclick="searchMyInquiries()" style="flex: 1; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                🔍 조회하기
                            </button>
                            <button onclick="closeMyInquiriesModal()" style="padding: 14px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                취소
                            </button>
                        </div>
                    </div>
                    <div id="myInquiriesResult" style="display: none;"></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
    `;

    document.body.appendChild(modal);

    // Phone input formatting
    const phoneInput = document.getElementById('lookupPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
        }
        e.target.value = value;
    });

    // Enter key to search
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMyInquiries();
        }
    });

    // Focus on input
    setTimeout(() => phoneInput.focus(), 100);
}

function closeMyInquiriesModal() {
    const modal = document.getElementById('myInquiriesModal');
    if (modal) {
        modal.remove();
    }
}

async function searchMyInquiries() {
    const phoneInput = document.getElementById('lookupPhone');
    const phone = phoneInput.value.trim();

    if (!phone) {
        alert('전화번호를 입력해주세요.');
        phoneInput.focus();
        return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        alert('올바른 전화번호 형식이 아닙니다.');
        phoneInput.focus();
        return;
    }

    try {
        const response = await fetch(`/api/inquiries?phone=${encodeURIComponent(phone)}`);
        const result = await response.json();

        if (response.ok && result.success) {
            displayMyInquiries(result.data);
        } else {
            alert(result.message || '문의 내역 조회에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('문의 내역 조회 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

function displayMyInquiries(inquiries) {
    const phoneInputSection = document.getElementById('phoneInputSection');
    const resultSection = document.getElementById('myInquiriesResult');

    phoneInputSection.style.display = 'none';
    resultSection.style.display = 'block';

    if (inquiries.length === 0) {
        resultSection.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 1.3rem;">문의 내역이 없습니다</h3>
                <p style="margin: 0; color: #6b7280; line-height: 1.6;">
                    입력하신 전화번호로 등록된 문의가 없습니다.<br>
                    전화번호를 확인하시거나 새로운 문의를 남겨주세요.
                </p>
                <button onclick="closeMyInquiriesModal()" style="margin-top: 24px; padding: 12px 32px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                    확인
                </button>
            </div>
        `;
        return;
    }

    const statusText = {
        'pending': '상담문의',
        'answered': '상담완료',
        'completed': '상담완료',
        'cancelled': '취소'
    };

    const statusColor = {
        'pending': '#2563eb',
        'answered': '#10b981',
        'completed': '#10b981',
        'cancelled': '#6b7280'
    };

    const inquiriesHtml = inquiries.map(inquiry => {
        const options = inquiry.options ? JSON.parse(inquiry.options) : [];
        const optionsText = options.length > 0 ? options.join(', ') : '없음';

        return `
            <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <div style="display: inline-block; background: ${statusColor[inquiry.status]}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
                            ${statusText[inquiry.status] || '상담문의'}
                        </div>
                        <h3 style="margin: 0; font-size: 1.15rem; color: #111827;">문의 #${inquiry.id}</h3>
                    </div>
                    <span style="font-size: 0.9rem; color: #6b7280; white-space: nowrap;">${inquiry.created_at}</span>
                </div>

                <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; gap: 12px;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">이름:</span>
                            <span style="color: #111827;">${inquiry.name}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">연락처:</span>
                            <span style="color: #111827;">${inquiry.phone}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">아파트:</span>
                            <span style="color: #111827; font-weight: 500;">${inquiry.apartment}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">평형:</span>
                            <span style="color: #111827;">${inquiry.size}타입</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">희망일:</span>
                            <span style="color: #111827;">${inquiry.move_in_date || '-'}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">추가옵션:</span>
                            <span style="color: #111827;">${optionsText}</span>
                        </div>
                        ${inquiry.message ? `
                        <div style="display: flex; gap: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                            <span style="min-width: 80px; font-weight: 600; color: #6b7280;">문의내용:</span>
                            <span style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                ${inquiry.admin_response ? `
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px;">
                    <div style="font-weight: 600; color: #059669; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 1.2rem;">💬</span>
                        관리자 답변
                    </div>
                    <p style="margin: 0; color: #065f46; line-height: 1.6; white-space: pre-wrap;">${inquiry.admin_response}</p>
                    ${inquiry.updated_at ? `<p style="margin: 8px 0 0 0; font-size: 0.85rem; color: #059669;">답변일: ${inquiry.updated_at}</p>` : ''}
                </div>
                ` : `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 8px;">
                    <p style="margin: 0; color: #92400e; font-size: 0.95rem;">
                        ⏳ 답변 대기 중입니다. 빠른 시일 내에 연락드리겠습니다.
                    </p>
                </div>
                `}
            </div>
        `;
    }).join('');

    resultSection.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #111827; font-size: 1.3rem;">내 문의 내역 (${inquiries.length}건)</h3>
            <button onclick="closeMyInquiriesModal()" style="padding: 8px 16px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer;">
                닫기
            </button>
        </div>
        <div style="max-height: 60vh; overflow-y: auto;">
            ${inquiriesHtml}
        </div>
    `;
}

// Global function for refresh button
window.refreshInquiries = function() {
    showMyInquiriesModal();
};

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inquiries page loaded successfully!');

    // Load recent inquiries from API
    loadRecentInquiries();

    // Load calculation data from price calculator
    loadCalculationData();
});
