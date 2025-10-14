// ===================================
// Agreement Checkbox Handling
// ===================================

// 전체 동의 체크박스
document.addEventListener('DOMContentLoaded', function() {
    const agreeAll = document.getElementById('agreeAll');
    const agreeCheckboxes = document.querySelectorAll('.agree-checkbox');

    if (agreeAll) {
        agreeAll.addEventListener('change', function() {
            agreeCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // 개별 체크박스 변경 시 전체 동의 업데이트
    agreeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(agreeCheckboxes).every(cb => cb.checked);
            if (agreeAll) {
                agreeAll.checked = allChecked;
            }
        });
    });

    // 비밀번호 입력 제한 (숫자만)
    const passwordInput = document.getElementById('modalPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4);
        });
    }
});

// ===================================
// Privacy Policy Modal
// ===================================
function showPrivacyPolicy(e) {
    if (e) e.preventDefault();

    const modal = document.createElement('div');
    modal.id = 'policyModal';
    modal.innerHTML = `
        <div class="modal" style="display: flex; position: fixed; z-index: 10002; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; overflow: auto; padding: 20px;">
            <div class="modal-content" style="background-color: white; margin: auto; padding: 0; border-radius: 12px; width: 90%; max-width: 700px; max-height: 80vh; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
                <div class="modal-header" style="background: #2563eb; color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.3rem;">개인정보 수집 및 이용 동의</h3>
                    <span onclick="closePolicyModal()" style="font-size: 1.8rem; font-weight: bold; cursor: pointer; color: white;">&times;</span>
                </div>
                <div style="padding: 30px; overflow-y: auto; flex: 1;">
                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">1. 개인정보 수집 및 이용 목적</h4>
                    <p style="margin: 8px 0; line-height: 1.6; color: #334155;">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>

                    <h5 style="font-size: 1rem; font-weight: 600; margin: 15px 0 8px 0; color: #475569;">(1) 문의하기를 통한 문의 접수</h5>
                    <ul style="margin: 8px 0 8px 20px; padding: 0; line-height: 1.8; color: #475569;">
                        <li>아파트 사전점검 문의사항 접수</li>
                        <li>이용자 식별 및 인증</li>
                        <li>서비스 부정 이용 기록 및 방지</li>
                        <li>고객 관리 및 요청 사항 접수 및 대응</li>
                    </ul>

                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">2. 개인정보 수집 항목 (필수)</h4>
                    <h5 style="font-size: 1rem; font-weight: 600; margin: 15px 0 8px 0; color: #475569;">아파트 사전점검 문의</h5>
                    <p style="margin: 8px 0; line-height: 1.6; color: #475569;">이름, 연락처, 입주예정 아파트 명칭, 희망 점검일</p>

                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">3. 보유 및 이용 기간</h4>
                    <p style="margin: 8px 0; line-height: 1.6; color: #475569;">(1) 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>

                    <h5 style="font-size: 1rem; font-weight: 600; margin: 15px 0 8px 0; color: #475569;">(2) 개인정보 처리 및 보유 기간</h5>
                    <ul style="margin: 8px 0 8px 20px; padding: 0; line-height: 1.8; color: #475569;">
                        <li>문의일로부터 3년 (소비자 불만 및 분쟁처리 기록)</li>
                        <li>다만 만료일 이전에 고객이 직접 삭제, 탈퇴 요청 시에는 요청 이후로 1달 이내에 처리</li>
                    </ul>

                    <p style="margin: 16px 0 8px 0; line-height: 1.6; color: #475569;">(3) 회사는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체없이 파기합니다. 다만, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령의 규정에 의하여 보존할 필요가 있는 경우에 회사는 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다:</p>

                    <ul style="margin: 8px 0 8px 20px; padding: 0; line-height: 1.8; color: #475569;">
                        <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                        <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                        <li>표시/광고에 관한 기록: 6개월</li>
                        <li>웹사이트 방문에 관한 기록: 3개월 (통신비밀보호법)</li>
                    </ul>

                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">4. 동의를 거부할 권리 및 동의 거부에 따른 불이익</h4>
                    <p style="margin: 8px 0; line-height: 1.6; color: #475569;">이용자는 개인정보 수집 및 이용에 거부할 권리가 있습니다. 다만, 동의하지 않는 경우, 서비스 신청 및 사용에 제한이 있을 수 있습니다.</p>
                </div>
                <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: right;">
                    <button onclick="closePolicyModal()" style="padding: 10px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">확인</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ===================================
// Marketing Policy Modal
// ===================================
function showMarketingPolicy(e) {
    if (e) e.preventDefault();

    const modal = document.createElement('div');
    modal.id = 'policyModal';
    modal.innerHTML = `
        <div class="modal" style="display: flex; position: fixed; z-index: 10002; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; overflow: auto; padding: 20px;">
            <div class="modal-content" style="background-color: white; margin: auto; padding: 0; border-radius: 12px; width: 90%; max-width: 700px; max-height: 80vh; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
                <div class="modal-header" style="background: #2563eb; color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.3rem;">마케팅 활용 동의 및 광고 수신 동의</h3>
                    <span onclick="closePolicyModal()" style="font-size: 1.8rem; font-weight: bold; cursor: pointer; color: white;">&times;</span>
                </div>
                <div style="padding: 30px; overflow-y: auto; flex: 1;">
                    <p style="margin: 8px 0 16px 0; line-height: 1.6; color: #475569;">개인정보보호법 제22조 제4항에 의해 선택정보 사항에 대해서는 기재하지 않으셔도 서비스를 이용하실 수 있습니다.</p>

                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">1. 마케팅 및 광고에의 활용</h4>
                    <p style="margin: 8px 0; line-height: 1.6; color: #475569;">신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계 등을 목적으로 개인정보를 처리합니다.</p>

                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">2. 광고성 정보 제공 방법</h4>
                    <p style="margin: 8px 0; line-height: 1.6; color: #475569;">하자체크는 서비스를 운용함에 있어 각종 정보를 서비스 화면, 전화, e-mail, SMS, 우편물 등의 방법으로 회원에게 제공할 수 있습니다.</p>

                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">3. 철회 안내</h4>
                    <p style="margin: 8px 0; line-height: 1.6; color: #475569;">마케팅 정보 수신에 동의하신 경우에도 언제든지 수신을 거부하실 수 있습니다.</p>
                </div>
                <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: right;">
                    <button onclick="closePolicyModal()" style="padding: 10px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">확인</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closePolicyModal() {
    const modal = document.getElementById('policyModal');
    if (modal) {
        modal.remove();
    }
}

// Global functions
window.showPrivacyPolicy = showPrivacyPolicy;
window.showMarketingPolicy = showMarketingPolicy;
window.closePolicyModal = closePolicyModal;
