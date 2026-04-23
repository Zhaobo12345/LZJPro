
        let currentPcRole = 'initiator';
        let contractAttachments = [
            { id: '1', name: '合同附件-设计图纸.pdf', size: 2048000, type: 'pdf', ext: 'pdf' },
            { id: '2', name: '施工现场照片.jpg', size: 1536000, type: 'image', ext: 'jpg' },
            { id: '3', name: '工程量清单.xlsx', size: 512000, type: 'excel', ext: 'xlsx' }
        ];

        function switchPcRole(role) {
            window.location.href = role === 'initiator' ? 'pc-contract-edit.html' : 'pc-contract-list.html';
        }

        function switchPcRoleWithoutRedirect(role) {
            currentPcRole = role;
            
            document.querySelectorAll('.pc-role-switcher .pc-role-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            const sidebar = document.querySelector('.pc-sidebar');
            const main = document.getElementById('pcMain');
            const breadcrumb = document.querySelector('.pc-breadcrumb');
            const contractOperationNav = document.getElementById('contractOperationNav');
            
            if (role === 'initiator') {
                sidebar.classList.add('hidden');
                main.classList.add('full-width');
                breadcrumb.innerHTML = `<span class="item current">编辑合同</span>`;
                document.getElementById('userAvatar').textContent = '发';
                document.getElementById('userName').textContent = '合同发起方';
                if (contractOperationNav) contractOperationNav.style.display = 'block';
            } else {
                sidebar.classList.remove('hidden');
                main.classList.remove('full-width');
                breadcrumb.innerHTML = `
                    <a href="pc-contract-list.html" class="item">合同审核管理</a>
                    <span class="separator">/</span>
                    <span class="item current">编辑合同</span>
                `;
                document.getElementById('userAvatar').textContent = '运';
                document.getElementById('userName').textContent = '运营人员';
                if (contractOperationNav) contractOperationNav.style.display = 'none';
            }
        }

        function toggleStage(header) {
            const body = header.nextElementSibling;
            if (body.style.display === 'none') {
                body.style.display = 'block';
            } else {
                body.style.display = 'none';
            }
        }

        function addStage() {
            showToast('添加阶段功能');
        }

        function editStage(id) {
            showToast('编辑阶段：' + id);
        }

        function deleteStage(id) {
            if (confirm('确定要删除此阶段吗？')) {
                showToast('已删除阶段：' + id);
            }
        }

        function addTask(stageId) {
            showToast('为阶段 ' + stageId + ' 添加任务');
        }

        function showTemplateModal() {
            showToast('选择合同文本模板');
        }

        function showStageTemplateModal() {
            showToast('选择阶段任务模板');
        }

        function clearContent() {
            if (confirm('确定要清空合同正文内容吗？')) {
                document.getElementById('contractContentEditor').innerHTML = '';
            }
        }

        function submitContract() {
            document.getElementById('submitConfirmModal').classList.add('show');
        }

        let submitAction = 'save';

        function selectSubmitOption(element, action) {
            document.querySelectorAll('.submit-option').forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');
            submitAction = action;
        }

        function closeSubmitModal() {
            document.getElementById('submitConfirmModal').classList.remove('show');
        }

        function confirmSubmit() {
            if (submitAction === 'save') {
                showToast('合同已保存');
                closeSubmitModal();
            } else {
                const contractName = document.getElementById('contractName').value.trim();
                if (!contractName) {
                    showToast('请输入合同名称');
                    return;
                }
                
                const now = new Date();
                const timeStr = now.getFullYear() + '-' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(now.getDate()).padStart(2, '0') + ' ' + 
                    String(now.getHours()).padStart(2, '0') + ':' + 
                    String(now.getMinutes()).padStart(2, '0');
                document.getElementById('submitTime').textContent = timeStr;
                
                closeSubmitModal();
                document.getElementById('waitingPage').classList.add('show');
            }
        }

        function backToList() {
            window.location.href = 'pc-contract-list.html';
        }

        function triggerAttachmentUpload() {
            document.getElementById('attachmentInput').click();
        }

        function handleAttachmentUpload(files) {
            if (!files || files.length === 0) return;
            
            const maxSize = 20 * 1024 * 1024;
            
            for (let file of files) {
                if (file.size > maxSize) {
                    showToast(`文件"${file.name}"超过20MB限制`);
                    continue;
                }
                
                const fileExt = file.name.split('.').pop().toLowerCase();
                const extMap = {
                    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image',
                    'pdf': 'pdf',
                    'doc': 'word', 'docx': 'word',
                    'xls': 'excel', 'xlsx': 'excel',
                    'ppt': 'other', 'pptx': 'other'
                };
                
                const attachment = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    type: extMap[fileExt] || 'other',
                    ext: fileExt
                };
                
                contractAttachments.push(attachment);
            }
            
            renderAttachmentList();
            document.getElementById('attachmentInput').value = '';
            showToast(`已添加 ${files.length} 个附件`);
        }

        function renderAttachmentList() {
            const container = document.getElementById('attachmentList');
            
            if (contractAttachments.length === 0) {
                container.innerHTML = '';
                return;
            }
            
            const iconMap = {
                'image': '🖼️',
                'pdf': '📄',
                'word': '📝',
                'excel': '📊',
                'other': '📁'
            };
            
            container.innerHTML = contractAttachments.map(att => `
                <div class="attachment-item" data-id="${att.id}">
                    <div class="file-icon ${att.type}">${iconMap[att.type]}</div>
                    <div class="file-info">
                        <div class="file-name">${att.name}</div>
                        <div class="file-meta">${formatFileSize(att.size)} · ${att.ext.toUpperCase()}</div>
                    </div>
                    <div class="file-actions">
                        <button class="btn-preview" onclick="previewAttachment('${att.id}')">预览</button>
                        <button class="btn-delete" onclick="deleteAttachment('${att.id}')">删除</button>
                    </div>
                </div>
            `).join('');
        }

        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        function previewAttachment(id) {
            const att = contractAttachments.find(a => a.id === id);
            if (att) {
                showToast(`预览文件：${att.name}`);
            }
        }

        function deleteAttachment(id) {
            if (confirm('确定要删除此附件吗？')) {
                contractAttachments = contractAttachments.filter(a => a.id !== id);
                renderAttachmentList();
                showToast('附件已删除');
            }
        }

        function initQuickNav() {
            const navItems = document.querySelectorAll('.quick-nav-item');
            
            navItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const sectionId = this.getAttribute('data-section');
                    const section = document.getElementById(sectionId);
                    
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        navItems.forEach(nav => nav.classList.remove('active'));
                        this.classList.add('active');
                    }
                });
            });
            
            const sections = ['basicInfo', 'contractContent', 'stageSection', 'attachmentSection'];
            
            window.addEventListener('scroll', function() {
                let currentSection = 'basicInfo';
                
                sections.forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const rect = section.getBoundingClientRect();
                        if (rect.top <= 150) {
                            currentSection = sectionId;
                        }
                    }
                });
                
                navItems.forEach(item => {
                    if (item.getAttribute('data-section') === currentSection) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            });
        }

        function togglePageNav() {
            const wrapper = document.getElementById('pageNavWrapper');
            const nav = document.getElementById('pageNav');
            const toggle = wrapper.querySelector('.pc-page-nav-toggle');
            nav.classList.toggle('collapsed');
            wrapper.classList.toggle('collapsed');
            if (nav.classList.contains('collapsed')) {
                toggle.textContent = '▶';
            } else {
                toggle.textContent = '◀';
            }
        }

        function toggleUserDropdown() {
            document.getElementById('userDropdownMenu').classList.toggle('show');
        }

        function logout() {
            if (confirm('确定要退出登录吗？')) {
                window.location.href = 'pc-login.html';
            }
        }

        function goToProfile() {
            window.location.href = 'pc-profile.html';
        }

        function goToAccountSettings() {
            window.location.href = 'pc-account-settings.html';
        }

        function showToast(message) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.75);
                color: #fff;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

        document.addEventListener('click', function(e) {
            const dropdown = document.querySelector('.pc-user-dropdown');
            const menu = document.getElementById('userDropdownMenu');
            if (dropdown && menu && !dropdown.contains(e.target)) {
                menu.classList.remove('show');
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        const contractId = urlParams.get('contractId');
        const status = urlParams.get('status');

        if (role === 'operator') {
            document.querySelector('.pc-role-switcher .pc-role-btn:first-child').click();
        }

        if (status) {
            updateStatusBanner(status);
        }

        function updateStatusBanner(status) {
            const banner = document.getElementById('statusBanner');
            const title = document.getElementById('statusTitle');
            const desc = document.getElementById('statusDesc');
            const actions = document.getElementById('statusActions');

            const statusConfig = {
                'draft': {
                    class: 'draft',
                    title: '📝 合同拟定中',
                    desc: '合同编号：HT-2024-001 | 创建时间：2024-01-10 15:00',
                    actions: '<button class="btn btn-primary" onclick="submitContract()">提交审核</button>'
                },
                'draft_submittable': {
                    class: 'draft',
                    title: '📝 合同拟定中（可提交）',
                    desc: '合同编号：HT-2024-001 | 已完成编辑，可提交审核',
                    actions: '<button class="btn btn-primary" onclick="submitContract()">提交审核</button>'
                },
                'platform_reviewing': {
                    class: 'confirmed',
                    title: '⏳ 待平台审核',
                    desc: '合同编号：HT-2024-001 | 提交时间：2024-01-10 16:00',
                    actions: '<button class="btn" onclick="showDetail()">查看详情</button>'
                },
                'platform_rejected': {
                    class: 'rejected',
                    title: '❌ 平台审核驳回',
                    desc: '合同编号：HT-2024-001 | 驳回时间：2024-01-10 17:00',
                    actions: '<button class="btn btn-primary" onclick="submitContract()">重新提交</button><button class="btn" onclick="showRejectReason()">查看驳回原因</button>'
                }
            };

            const config = statusConfig[status] || statusConfig['draft'];
            banner.className = 'contract-status-banner ' + config.class;
            title.textContent = config.title;
            desc.textContent = config.desc;
            actions.innerHTML = config.actions;
        }

        initQuickNav();
        renderAttachmentList();
    