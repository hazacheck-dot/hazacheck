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
// Navbar Scroll Effect
// ===================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
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
            const optionName = checkbox.parentElement.querySelector('.option-name').textContent;
            selectedOptions.push({ name: optionName, price: price });
        }
    });

    const totalPrice = basePrice + optionsTotal;

    // Display result
    displayPriceResult(totalPrice, optionsTotal);
    
    // Display summary
    displayPriceSummary(totalPrice, optionsTotal);
}

function displayPriceResult(total, optionsTotal) {
    const sizeTypeName = `${selectedSize}타입`;

    let html = `
        <div class="result-content active">
            <div class="result-row">
                <span class="result-label">선택한 타입</span>
                <span class="result-value">${sizeTypeName}</span>
            </div>
            <div class="result-row">
                <span class="result-label">기본 점검 비용</span>
                <span class="result-value">₩${basePrice.toLocaleString()}</span>
            </div>
    `;

    if (selectedOptions.length > 0) {
        selectedOptions.forEach(opt => {
            html += `
                <div class="result-row">
                    <span class="result-label">${opt.name}</span>
                    <span class="result-value">₩${opt.price.toLocaleString()}</span>
                </div>
            `;
        });
    }

    html += `
            <div class="result-row">
                <span class="result-label">총 비용</span>
                <span class="result-value">₩${total.toLocaleString()}</span>
            </div>
        </div>
    `;

    calculatorResult.innerHTML = html;
}

function displayPriceSummary(total, optionsTotal) {
    const summary = document.getElementById('calculatorSummary');
    const summaryBasePrice = document.getElementById('summaryBasePrice');
    const summaryTotalPrice = document.getElementById('summaryTotalPrice');
    const summaryOptionsContainer = document.getElementById('summaryOptions');
    
    // Show summary
    summary.style.display = 'block';
    
    // Update base price
    summaryBasePrice.textContent = `₩${basePrice.toLocaleString()}`;
    
    // Update options
    let optionsHtml = '';
    if (selectedOptions.length > 0) {
        selectedOptions.forEach(opt => {
            optionsHtml += `
                <div class="summary-row summary-option">
                    <span class="summary-label">+ ${opt.name}</span>
                    <span class="summary-value">₩${opt.price.toLocaleString()}</span>
                </div>
            `;
        });
    }
    summaryOptionsContainer.innerHTML = optionsHtml;
    
    // Update total
    summaryTotalPrice.textContent = `₩${total.toLocaleString()}`;
    
    // Smooth scroll to summary
    setTimeout(() => {
        summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Save calculation data and redirect to inquiry page
function saveCalculationAndInquire() {
    if (!selectedSize) {
        alert('타입을 먼저 선택해주세요.');
        return;
    }
    
    const calculationData = {
        size: selectedSize,
        basePrice: basePrice,
        options: selectedOptions,
        totalPrice: basePrice + selectedOptions.reduce((sum, opt) => sum + opt.price, 0),
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('hazacheck_calculation', JSON.stringify(calculationData));
    
    // Redirect to inquiry page
    window.location.href = 'inquiries.html';
}

// Inquiry with price button
const inquiryWithPriceBtn = document.getElementById('inquiryWithPrice');
if (inquiryWithPriceBtn) {
    inquiryWithPriceBtn.addEventListener('click', saveCalculationAndInquire);
}

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
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements with animation classes
const animatedElements = document.querySelectorAll('.trust-card, .case-card, .equipment-card, .process-step');
animatedElements.forEach(el => {
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
});

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
