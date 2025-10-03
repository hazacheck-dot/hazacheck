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
// Load Recent Inquiries from API
// ===================================
async function loadRecentInquiries() {
    try {
        const response = await fetch('/api/inquiries?limit=5');
        const result = await response.json();

        if (response.ok && result.success) {
            displayRecentInquiries(result.data);
        }
    } catch (error) {
        console.error('최근 문의 내역 로드 오류:', error);
        // 오류 시 기존 정적 데이터 유지
    }
}

function displayRecentInquiries(inquiries) {
    const inquiryList = document.querySelector('.inquiry-list');
    if (!inquiryList || inquiries.length === 0) return;

    const statusText = {
        'pending': '대기중',
        'answered': '답변완료',
        'completed': '완료',
        'cancelled': '취소'
    };

    const statusClass = {
        'pending': 'status-pending',
        'answered': 'status-answered',
        'completed': 'status-answered',
        'cancelled': 'status-cancelled'
    };

    const sizeText = {
        '58': '58타입',
        '74': '74타입',
        '84': '84타입',
        '104': '104타입',
        'over': '104타입 이상'
    };

    const html = inquiries.map(inquiry => `
        <div class="inquiry-item">
            <div class="inquiry-header">
                <div class="inquiry-info">
                    <span class="inquiry-status ${statusClass[inquiry.status] || 'status-pending'}">${statusText[inquiry.status] || '대기중'}</span>
                    <h3 class="inquiry-title">${inquiry.name}님 - ${inquiry.apartment} ${sizeText[inquiry.size] || inquiry.size} 점검 문의</h3>
                </div>
                <span class="inquiry-date">${inquiry.created_at}</span>
            </div>
        </div>
    `).join('');

    inquiryList.innerHTML = html;
}

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
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inquiries page loaded successfully!');
    
    // Load recent inquiries from API
    loadRecentInquiries();
    
    // Load calculation data from price calculator
    loadCalculationData();
});
