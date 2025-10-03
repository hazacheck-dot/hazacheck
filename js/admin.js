// ===================================
// Admin Page JavaScript
// ===================================

// Global variables
let currentAdminToken = null;
let currentPage = 1;
let currentStatusFilter = 'all';
let currentInquiries = [];

// DOM elements
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminTokenInput = document.getElementById('adminToken');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');
const inquiriesTableBody = document.getElementById('inquiriesTableBody');
const pagination = document.getElementById('pagination');
const inquiryModal = document.getElementById('inquiryModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalSave = document.getElementById('modalSave');
const modalBody = document.getElementById('modalBody');
const loadingOverlay = document.getElementById('loadingOverlay');

// Stats elements
const totalInquiriesEl = document.getElementById('totalInquiries');
const pendingInquiriesEl = document.getElementById('pendingInquiries');
const answeredInquiriesEl = document.getElementById('answeredInquiries');
const completionRateEl = document.getElementById('completionRate');

// ===================================
// Authentication
// ===================================

// Check if user is already logged in
function checkAuthStatus() {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
        currentAdminToken = savedToken;
        showAdminPanel();
        loadInquiries();
    }
}

// Login form submission
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = adminTokenInput.value.trim();
    if (!token) {
        alert('관리자 토큰을 입력해주세요.');
        return;
    }

    showLoading(true);
    
    try {
        // Test the token by making a request
        const response = await fetch('/api/admin/inquiries?limit=1', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            currentAdminToken = token;
            localStorage.setItem('admin_token', token);
            showAdminPanel();
            loadInquiries();
            adminTokenInput.value = '';
        } else {
            alert('잘못된 관리자 토큰입니다.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('로그인 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    currentAdminToken = null;
    localStorage.removeItem('admin_token');
    showLoginForm();
});

// ===================================
// UI Management
// ===================================

function showLoginForm() {
    loginSection.style.display = 'flex';
    adminPanel.style.display = 'none';
}

function showAdminPanel() {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

// ===================================
// Data Loading
// ===================================

async function loadInquiries() {
    if (!currentAdminToken) return;

    showLoading(true);
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20,
            status: currentStatusFilter === 'all' ? '' : currentStatusFilter
        });

        const response = await fetch(`/api/admin/inquiries?${params}`, {
            headers: {
                'Authorization': `Bearer ${currentAdminToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentInquiries = data.data;
            updateStats(data.data);
            renderInquiriesTable(data.data);
            renderPagination(data.pagination);
        } else {
            throw new Error('Failed to load inquiries');
        }
    } catch (error) {
        console.error('Error loading inquiries:', error);
        alert('문의 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

function updateStats(inquiries) {
    const total = inquiries.length;
    const pending = inquiries.filter(i => i.status === 'pending').length;
    const answered = inquiries.filter(i => i.status === 'answered').length;
    const completed = inquiries.filter(i => i.status === 'completed').length;
    const completionRate = total > 0 ? Math.round(((answered + completed) / total) * 100) : 0;

    totalInquiriesEl.textContent = total;
    pendingInquiriesEl.textContent = pending;
    answeredInquiriesEl.textContent = answered + completed;
    completionRateEl.textContent = `${completionRate}%`;
}

// ===================================
// Table Rendering
// ===================================

function renderInquiriesTable(inquiries) {
    if (!inquiries || inquiries.length === 0) {
        inquiriesTableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    문의 내역이 없습니다.
                </td>
            </tr>
        `;
        return;
    }

    inquiriesTableBody.innerHTML = inquiries.map(inquiry => `
        <tr>
            <td>${inquiry.id}</td>
            <td>${inquiry.name}</td>
            <td>${inquiry.phone}</td>
            <td>${inquiry.email || '-'}</td>
            <td>${inquiry.apartment}</td>
            <td>${inquiry.size}타입</td>
            <td>${inquiry.move_in_date}</td>
            <td><span class="status-badge status-${inquiry.status}">${getStatusText(inquiry.status)}</span></td>
            <td>${formatDate(inquiry.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-view" onclick="viewInquiry(${inquiry.id})">보기</button>
                    <button class="btn btn-sm btn-edit" onclick="editInquiry(${inquiry.id})">수정</button>
                    <button class="btn btn-sm btn-delete" onclick="deleteInquiry(${inquiry.id})">삭제</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderPagination(paginationData) {
    if (!paginationData || paginationData.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const { page, totalPages } = paginationData;
    let html = '';

    // Previous button
    html += `<button ${page <= 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">이전</button>`;

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    // Next button
    html += `<button ${page >= totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">다음</button>`;

    pagination.innerHTML = html;
}

// ===================================
// Event Handlers
// ===================================

// Filter change
statusFilter.addEventListener('change', (e) => {
    currentStatusFilter = e.target.value;
    currentPage = 1;
    loadInquiries();
});

// Refresh button
refreshBtn.addEventListener('click', () => {
    loadInquiries();
});

// Pagination
function changePage(page) {
    currentPage = page;
    loadInquiries();
}

// ===================================
// Inquiry Management
// ===================================

function viewInquiry(id) {
    const inquiry = currentInquiries.find(i => i.id === id);
    if (!inquiry) return;

    showInquiryModal(inquiry, false);
}

function editInquiry(id) {
    const inquiry = currentInquiries.find(i => i.id === id);
    if (!inquiry) return;

    showInquiryModal(inquiry, true);
}

function showInquiryModal(inquiry, isEdit = false) {
    modalBody.innerHTML = `
        <div class="inquiry-detail">
            <div class="detail-section">
                <h4>기본 정보</h4>
                <div class="detail-row">
                    <div class="detail-label">ID</div>
                    <div class="detail-value">${inquiry.id}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">이름</div>
                    <div class="detail-value">${isEdit ? `<input type="text" value="${inquiry.name}" id="editName">` : inquiry.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">연락처</div>
                    <div class="detail-value">${isEdit ? `<input type="text" value="${inquiry.phone}" id="editPhone">` : inquiry.phone}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">이메일</div>
                    <div class="detail-value">${isEdit ? `<input type="email" value="${inquiry.email || ''}" id="editEmail">` : (inquiry.email || '-')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">아파트명</div>
                    <div class="detail-value">${isEdit ? `<input type="text" value="${inquiry.apartment}" id="editApartment">` : inquiry.apartment}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">세대 크기</div>
                    <div class="detail-value">${isEdit ? `<select id="editSize"><option value="58" ${inquiry.size === '58' ? 'selected' : ''}>58타입</option><option value="74" ${inquiry.size === '74' ? 'selected' : ''}>74타입</option><option value="84" ${inquiry.size === '84' ? 'selected' : ''}>84타입</option><option value="104" ${inquiry.size === '104' ? 'selected' : ''}>104타입</option><option value="over" ${inquiry.size === 'over' ? 'selected' : ''}>104타입 이상</option></select>` : `${inquiry.size}타입`}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">희망 점검일</div>
                    <div class="detail-value">${isEdit ? `<input type="date" value="${inquiry.move_in_date}" id="editMoveInDate">` : inquiry.move_in_date}</div>
                </div>
            </div>

            <div class="detail-section">
                <h4>문의 내용</h4>
                <div class="detail-row">
                    <div class="detail-label">추가 옵션</div>
                    <div class="detail-value">${inquiry.options ? JSON.parse(inquiry.options).join(', ') : '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">문의 내용</div>
                    <div class="detail-value">${inquiry.message || '-'}</div>
                </div>
            </div>

            <div class="detail-section">
                <h4>관리 정보</h4>
                <div class="detail-row">
                    <div class="detail-label">상태</div>
                    <div class="detail-value">${isEdit ? `<select id="editStatus"><option value="pending" ${inquiry.status === 'pending' ? 'selected' : ''}>답변 대기</option><option value="answered" ${inquiry.status === 'answered' ? 'selected' : ''}>답변 완료</option><option value="completed" ${inquiry.status === 'completed' ? 'selected' : ''}>처리 완료</option><option value="cancelled" ${inquiry.status === 'cancelled' ? 'selected' : ''}>취소됨</option></select>` : getStatusText(inquiry.status)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">관리자 메모</div>
                    <div class="detail-value">${isEdit ? `<textarea id="editAdminNote" placeholder="관리자 메모를 입력하세요">${inquiry.admin_note || ''}</textarea>` : (inquiry.admin_note || '-')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">등록일</div>
                    <div class="detail-value">${formatDate(inquiry.created_at)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">수정일</div>
                    <div class="detail-value">${formatDate(inquiry.updated_at)}</div>
                </div>
            </div>
        </div>
    `;

    modalSave.style.display = isEdit ? 'block' : 'none';
    modalSave.onclick = isEdit ? () => saveInquiry(inquiry.id) : null;
    
    inquiryModal.classList.add('show');
}

async function saveInquiry(id) {
    if (!currentAdminToken) return;

    const status = document.getElementById('editStatus').value;
    const adminNote = document.getElementById('editAdminNote').value;

    showLoading(true);

    try {
        const response = await fetch('/api/admin/inquiries', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentAdminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                status: status,
                adminNote: adminNote
            })
        });

        if (response.ok) {
            alert('문의가 성공적으로 업데이트되었습니다.');
            closeModal();
            loadInquiries();
        } else {
            throw new Error('Failed to update inquiry');
        }
    } catch (error) {
        console.error('Error updating inquiry:', error);
        alert('문의 업데이트 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

async function deleteInquiry(id) {
    if (!currentAdminToken) return;
    
    if (!confirm('정말로 이 문의를 삭제하시겠습니까?')) {
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`/api/admin/inquiries?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentAdminToken}`
            }
        });

        if (response.ok) {
            alert('문의가 성공적으로 삭제되었습니다.');
            loadInquiries();
        } else {
            throw new Error('Failed to delete inquiry');
        }
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        alert('문의 삭제 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// ===================================
// Modal Management
// ===================================

function closeModal() {
    inquiryModal.classList.remove('show');
}

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);

// Close modal when clicking outside
inquiryModal.addEventListener('click', (e) => {
    if (e.target === inquiryModal) {
        closeModal();
    }
});

// ===================================
// Utility Functions
// ===================================

function getStatusText(status) {
    const statusMap = {
        'pending': '답변 대기',
        'answered': '답변 완료',
        'completed': '처리 완료',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});