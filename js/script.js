// ===================================
// Navigation Menu Toggle (Mobile)
// ===================================
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===================================
// Navbar Scroll Effect with Auto-Hide (Mobile)
// ===================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow when scrolled
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Auto-hide navbar on mobile when scrolling down
    if (window.innerWidth <= 768) {
        if (currentScroll > lastScroll && currentScroll > 150) {
            // Scrolling down - hide navbar
            navbar.classList.add('hidden');
        } else if (currentScroll < lastScroll) {
            // Scrolling up - show navbar
            navbar.classList.remove('hidden');
        }
    } else {
        // Always show on desktop
        navbar.classList.remove('hidden');
    }

    lastScroll = currentScroll;
});

// ===================================
// Smooth Scroll for Navigation Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Pricing Calculator
// ===================================
const sizeOptions = document.querySelectorAll('.size-option');
const calculatorResult = document.getElementById('calculatorResult');
const optionCheckboxes = document.querySelectorAll('.option-checkbox');

let selectedSize = null;
let basePrice = 0;
let selectedOptions = [];

// Size selection
sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all options
        sizeOptions.forEach(opt => opt.classList.remove('active'));

        // Add active class to clicked option
        option.classList.add('active');

        // Get selected size data
        selectedSize = option.dataset.size;
        basePrice = parseInt(option.dataset.price);

        // Check if "104m² 이상" is selected
        if (selectedSize === 'over') {
            // Show alert for custom quote
            alert('104m² 이상은 별도 견적이 필요합니다.\n문의하기를 통해 정확한 견적을 받아보세요.');
            // Still show output but with special message
        }

        // Calculate and display result
        updatePriceCalculation();
    });
});

// Premium options selection
optionCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updatePriceCalculation();
    });
});

function updatePriceCalculation() {
    if (!selectedSize) return;

    // Calculate premium options total
    let optionsTotal = 0;
    selectedOptions = [];

    optionCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const price = parseInt(checkbox.dataset.price);
            optionsTotal += price;
            const optionName = checkbox.dataset.name;
            selectedOptions.push({ name: optionName, price: price });
        }
    });

    const totalPrice = basePrice + optionsTotal;

    // Display output
    displayPriceOutput(totalPrice);
}

function displayPriceOutput(total) {
    const output = document.getElementById('calculatorOutput');
    const outputSize = document.getElementById('outputSize');
    const outputBasePrice = document.getElementById('outputBasePrice');
    const outputTotalPrice = document.getElementById('outputTotalPrice');
    const outputOptionsContainer = document.getElementById('outputOptions');

    // Show output
    output.style.display = 'block';

    // Update size
    if (selectedSize === 'over') {
        outputSize.textContent = '104m² 이상 (별도 견적)';
    } else {
        outputSize.textContent = `${selectedSize}타입`;
    }

    // Update base price
    if (selectedSize === 'over') {
        outputBasePrice.textContent = '별도 문의';
    } else {
        outputBasePrice.textContent = `₩${basePrice.toLocaleString()}`;
    }

    // Update options
    let optionsHtml = '';
    if (selectedOptions.length > 0) {
        selectedOptions.forEach(opt => {
            optionsHtml += `
                <div class="output-row">
                    <span class="output-label">+ ${opt.name}</span>
                    <span class="output-value">₩${opt.price.toLocaleString()}</span>
                </div>
            `;
        });
    }
    outputOptionsContainer.innerHTML = optionsHtml;

    // Update total
    if (selectedSize === 'over') {
        outputTotalPrice.textContent = '별도 문의';
    } else {
        outputTotalPrice.textContent = `₩${total.toLocaleString()}`;
    }

    // Smooth scroll to output
    setTimeout(() => {
        output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Save calculation data and redirect to inquiry page
function saveCalculationAndInquire() {
    console.log('saveCalculationAndInquire 호출됨');
    console.log('selectedSize:', selectedSize);
    console.log('basePrice:', basePrice);
    console.log('selectedOptions:', selectedOptions);

    if (!selectedSize) {
        alert('타입을 먼저 선택해주세요.');
        return;
    }

    const totalPrice = basePrice + selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const optionNames = selectedOptions.map(opt => opt.name);

    let sizeText, basePriceText, totalPriceText;

    if (selectedSize === 'over') {
        sizeText = '104m² 이상 (별도 견적)';
        basePriceText = '별도 문의';
        totalPriceText = '별도 문의';
    } else {
        sizeText = `${selectedSize}타입`;
        basePriceText = `₩${basePrice.toLocaleString()}`;
        totalPriceText = `₩${totalPrice.toLocaleString()}`;
    }

    const calculationData = {
        size: sizeText,
        sizeValue: selectedSize,
        basePrice: basePrice,
        basePriceFormatted: basePriceText,
        options: selectedOptions,
        optionNames: optionNames,
        totalPrice: totalPrice,
        totalPriceFormatted: totalPriceText,
        timestamp: new Date().toISOString()
    };

    console.log('저장할 데이터:', calculationData);

    // Save to localStorage
    try {
        localStorage.setItem('hazacheck_calculation', JSON.stringify(calculationData));
        console.log('localStorage 저장 완료');

        // 저장 확인
        const saved = localStorage.getItem('hazacheck_calculation');
        console.log('저장된 데이터 확인:', saved);
    } catch (e) {
        console.error('localStorage 저장 실패:', e);
    }

    // Redirect to inquiry page with auto-open modal parameter
    console.log('문의 페이지로 이동...');
    window.location.href = 'inquiries.html?calculation=true';
}

// Inquiry with price button - DOMContentLoaded 후에 실행
document.addEventListener('DOMContentLoaded', function() {
    const inquiryWithPriceBtn = document.getElementById('inquiryWithPrice');
    console.log('inquiryWithPrice 버튼:', inquiryWithPriceBtn);
    if (inquiryWithPriceBtn) {
        inquiryWithPriceBtn.addEventListener('click', function(e) {
            console.log('문의하기 버튼 클릭됨');
            e.preventDefault(); // 기본 동작 방지
            saveCalculationAndInquire();
        });
    } else {
        console.log('inquiryWithPrice 버튼을 찾을 수 없습니다 (이 페이지에 없을 수 있음)');
    }
});

// ===================================
// FAQ Accordion
// ===================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all FAQ items
        faqItems.forEach(faq => {
            faq.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ===================================
// Scroll to Top Button
// ===================================
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // CSS 클래스를 추가하여 애니메이션 트리거
            entry.target.classList.add('animate-in');
            // 한 번 애니메이션이 실행되면 관찰을 중단
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Process steps animation is now handled in initializeProcessSteps()

// Other animated elements
const otherAnimatedElements = document.querySelectorAll('.trust-card, .case-card, .equipment-card');
otherAnimatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===================================
// Form Validation (for future inquiries page)
// ===================================
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    return isValid;
}

// ===================================
// Phone Number Formatting
// ===================================
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
    }

    input.value = value;
}

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('HazaCheck website loaded successfully!');

    // Add animation delay to hero elements
    const heroElements = document.querySelectorAll('.fade-in-up');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });

    // Initialize process steps animation
    initializeProcessSteps();
});

// Process steps animation initialization
function initializeProcessSteps() {
    const processSteps = document.querySelectorAll('.process-step');

    // 모든 process-step에 js-loading 클래스 추가 (fallback 방지)
    processSteps.forEach((step, index) => {
        step.classList.add('js-loading');

        // 인라인 스타일 제거 (CSS가 우선되도록)
        step.style.opacity = '';
        step.style.transform = '';
        step.style.transition = '';

        // transition delay만 설정 (거의 즉시 표시)
        step.style.transitionDelay = `${index * 0.05}s`;

        // 관찰 시작
        observer.observe(step);
    });
}

// ===================================
// Performance: Lazy Loading Videos
// ===================================
const videos = document.querySelectorAll('video');
videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
        video.classList.add('loaded');
    });
});

// ===================================
// Utility: Debounce Function
// ===================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// Handle Window Resize
// ===================================
const handleResize = debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
    }
}, 250);

window.addEventListener('resize', handleResize);


// ===================================
// Inquiry Modal Functions
// ===================================

// 모달 열기
function openInquiryModal() {
    console.log('openInquiryModal 호출됨');
    const modal = document.getElementById('inquiryModal');
    console.log('inquiryModal 요소:', modal);

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지

        // localStorage에서 가격 정보 가져오기 (항상 체크)
        const savedData = localStorage.getItem('hazacheck_calculation');
        console.log('localStorage 데이터:', savedData);

        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                console.log('파싱된 가격 정보:', data);

                // DOM이 준비될 때까지 약간 대기
                setTimeout(() => {
                    displayModalPriceInfo(data);
                }, 200);
            } catch (e) {
                console.error('가격 정보 파싱 실패:', e);
            }
        } else {
            console.log('저장된 가격 정보 없음 - localStorage가 비어있습니다');
        }
    } else {
        console.error('inquiryModal 요소를 찾을 수 없습니다!');
    }
}

// 페이지 로드시 자동으로 모달 열기 (메인에서 넘어온 경우)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calculation') === 'true') {
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
        // 모달 열기
        setTimeout(() => openInquiryModal(), 300);
    }
});

// 모달 닫기
function closeInquiryModal() {
    const modal = document.getElementById('inquiryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    }
}

// 모달 가격 정보 표시
function displayModalPriceInfo(data) {
    console.log('displayModalPriceInfo 호출됨, 데이터:', data);

    const priceInfo = document.getElementById('modalPriceInfo');
    const priceDetails = document.getElementById('modalPriceDetails');

    console.log('priceInfo 요소:', priceInfo);
    console.log('priceDetails 요소:', priceDetails);

    if (!priceInfo || !priceDetails) {
        console.error('가격 정보 표시 요소를 찾을 수 없습니다!');
        return;
    }

    // 가격 정보 표시
    let html = '<div style="line-height: 1.8;">';
    html += '<p style="margin: 8px 0;"><strong>📏 세대 크기:</strong> ' + data.size + '</p>';
    html += '<p style="margin: 8px 0;"><strong>💵 기본 비용:</strong> ' + data.basePriceFormatted + '</p>';

    if (data.options && data.options.length > 0) {
        html += '<p style="margin: 8px 0;"><strong>⭐ 추가 옵션:</strong></p>';
        html += '<ul style="margin: 4px 0 8px 20px; padding-left: 0;">';
        data.options.forEach(opt => {
            html += '<li style="margin: 4px 0;">• ' + opt.name + ' (+₩' + opt.price.toLocaleString() + ')</li>';
        });
        html += '</ul>';
    }

    html += '<div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #2563eb;">';
    html += '<p style="font-size: 1.3rem; font-weight: 700; color: #2563eb; margin: 0;"><strong>💰 총 예상 비용: ' + data.totalPriceFormatted + '</strong></p>';
    html += '</div>';
    html += '</div>';

    priceDetails.innerHTML = html;
    priceInfo.style.display = 'block';
    console.log('가격 정보 표시 완료');

    // 약간의 딜레이를 주고 폼 입력
    setTimeout(() => {
        // 폼에 자동 입력 - 세대 크기
        const sizeSelect = document.getElementById('modalSize');
        console.log('modalSize 요소:', sizeSelect, '값 설정:', data.sizeValue);
        if (sizeSelect) {
            sizeSelect.value = data.sizeValue || '';
            console.log('세대 크기 설정됨:', sizeSelect.value);
        }

        // 폼에 자동 입력 - 옵션 체크박스
        console.log('옵션 이름들:', data.optionNames);
        if (data.optionNames && data.optionNames.length > 0) {
            data.optionNames.forEach(optionName => {
                console.log('옵션 처리:', optionName);
                if (optionName === '하자 접수 대행') {
                    const checkbox = document.getElementById('modalOption1');
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log('modalOption1 체크됨');
                    }
                } else if (optionName === '사후관리 재점검') {
                    const checkbox = document.getElementById('modalOption2');
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log('modalOption2 체크됨');
                    }
                } else if (optionName === 'VR 360° 촬영') {
                    const checkbox = document.getElementById('modalOption3');
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log('modalOption3 체크됨');
                    }
                } else if (optionName === '실측 서비스') {
                    const checkbox = document.getElementById('modalOption4');
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log('modalOption4 체크됨');
                    }
                }
            });
        }

        // 문의 내용에 가격 정보 자동 추가
        const messageTextarea = document.getElementById('modalMessage');
        console.log('modalMessage 요소:', messageTextarea);
        if (messageTextarea && !messageTextarea.value) {
            let message = `[가격 시뮬레이션을 통한 문의]\n`;
            message += `세대 크기: ${data.size}\n`;
            message += `기본 비용: ${data.basePriceFormatted}\n`;
            if (data.optionNames && data.optionNames.length > 0) {
                message += `추가 옵션: ${data.optionNames.join(', ')}\n`;
            }
            message += `총 예상 비용: ${data.totalPriceFormatted}\n\n`;
            messageTextarea.value = message;
            console.log('문의 내용 설정됨');
        }
    }, 100);
}

// 문의 상세 보기
function viewInquiry(id) {
    alert('문의 ID: ' + id + '\n\n문의 상세 정보를 표시합니다.\n(구현 예정)');
}

// 문의 목록 새로고침
function refreshInquiries() {
    location.reload();
}

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('inquiryModal');
    if (event.target == modal) {
        closeInquiryModal();
    }
}

// 모달 폼 제출 처리
const modalForm = document.getElementById('inquiryModalForm');
if (modalForm) {
    modalForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 선택된 옵션 수집
        const selectedOptions = [];
        const optionCheckboxes = [
            document.getElementById('modalOption1'),
            document.getElementById('modalOption2'),
            document.getElementById('modalOption3'),
            document.getElementById('modalOption4')
        ];

        optionCheckboxes.forEach(checkbox => {
            if (checkbox && checkbox.checked) {
                selectedOptions.push(checkbox.value);
            }
        });

        const formData = {
            name: document.getElementById('modalName').value,
            phone: document.getElementById('modalPhone').value,
            apartment: document.getElementById('modalApartment').value,
            size: document.getElementById('modalSize').value,
            moveInDate: document.getElementById('modalDate').value,
            message: document.getElementById('modalMessage').value,
            options: selectedOptions
        };

        console.log('제출 데이터:', formData);

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // localStorage 정리
                localStorage.removeItem('hazacheck_calculation');

                alert('상담 신청이 완료되었습니다!\n빠른 시일 내에 연락드리겠습니다.');
                closeInquiryModal();
                modalForm.reset();
                location.reload();
            } else {
                alert('오류: ' + result.message);
            }
        } catch (error) {
            console.error('제출 오류:', error);
            alert('상담 신청 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
        }
    });
}

