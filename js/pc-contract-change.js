
        let currentPcRole = 'initiator';
        let isSequential = false;
        let newStageCounter = 100;
        let currentEditTaskType = 'new';
        let currentEditTaskId = null;
        let selectedConfirmers = [];
        let selectedExecutor = null;
        let currentStageId = null;
        let newTaskCounter = 1000;
        let contractAttachments = [
            { id: '1', name: '变更附件-新增点位图纸.pdf', size: 1024000, type: 'pdf', ext: 'pdf' },
            { id: '2', name: '变更确认单.docx', size: 256000, type: 'word', ext: 'docx' }
        ];

        function switchPcRole(role, evt) {
            currentPcRole = role;
            
            document.querySelectorAll('.pc-role-switcher .pc-role-btn').forEach(btn => btn.classList.remove('active'));
            evt.target.classList.add('active');
            
            const sidebar = document.querySelector('.pc-sidebar');
            const main = document.getElementById('pcMain');
            const breadcrumb = document.querySelector('.pc-breadcrumb');
            const contractOperationNav = document.getElementById('contractOperationNav');
            
            if (role === 'initiator') {
                sidebar.classList.add('hidden');
                main.classList.add('full-width');
                breadcrumb.innerHTML = `<span class="item current">变更合同</span>`;
                document.getElementById('userAvatar').textContent = '发';
                document.getElementById('userName').textContent = '合同发起方';
                if (contractOperationNav) contractOperationNav.style.display = 'block';
            } else {
                sidebar.classList.remove('hidden');
                main.classList.remove('full-width');
                breadcrumb.innerHTML = `
                    <a href="pc-contract-list.html" class="item">合同审核管理</a>
                    <span class="separator">/</span>
                    <span class="item current">变更合同</span>
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
            isSequential = false;
            document.getElementById('addStageModal').classList.add('show');
            document.getElementById('newStageName').value = '';
            document.getElementById('sequentialSwitch').classList.remove('on');
        }

        function closeAddStageModal() {
            document.getElementById('addStageModal').classList.remove('show');
        }

        function toggleSequential() {
            isSequential = !isSequential;
            document.getElementById('sequentialSwitch').classList.toggle('on', isSequential);
        }

        function saveNewStage() {
            const stageName = document.getElementById('newStageName').value.trim();
            if (!stageName) {
                showToast('请输入阶段名称');
                return;
            }
            
            const stageId = newStageCounter++;
            const stageList = document.getElementById('stageList');
            const newStageHtml = `
                <div class="stage-item stage-added" data-stage-id="${stageId}">
                    <div class="stage-header" onclick="toggleStage(this)">
                        <div class="stage-info">
                            <span class="stage-name">${stageName}</span>
                            ${isSequential ? '<span class="stage-sequential">按序执行</span>' : ''}
                            <span class="change-badge added">新增</span>
                        </div>
                        <div class="stage-actions">
                            <button class="pc-btn pc-btn-text pc-btn-sm" onclick="event.stopPropagation(); editStage(${stageId})">编辑</button>
                            <button class="pc-btn pc-btn-text pc-btn-sm" onclick="event.stopPropagation(); deleteNewStage(${stageId})">删除</button>
                            <span style="color: var(--text-tertiary);">▼</span>
                        </div>
                    </div>
                    <div class="stage-body" style="display: block;">
                        <button class="pc-btn pc-btn-default pc-btn-sm mt-8" onclick="addTask(${stageId})">+ 添加任务</button>
                    </div>
                </div>
            `;
            
            const addBtn = stageList.querySelector('.add-stage-btn');
            addBtn.insertAdjacentHTML('beforebegin', newStageHtml);
            
            closeAddStageModal();
            showToast('阶段已添加');
        }

        function deleteNewStage(stageId) {
            if (confirm('确定要删除此阶段吗？')) {
                const stageItem = document.querySelector(`.stage-item[data-stage-id="${stageId}"]`);
                if (stageItem) {
                    stageItem.style.transition = 'all 0.3s';
                    stageItem.style.opacity = '0';
                    stageItem.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        stageItem.remove();
                        showToast('阶段已删除');
                    }, 300);
                }
            }
        }

        function editStage(id) {
            showToast('编辑阶段：' + id);
        }

        function deleteStage(id) {
            if (confirm('确定要删除此阶段吗？')) {
                showToast('已删除阶段：' + id);
            }
        }

        function restoreStage(id) {
            showToast('已恢复阶段：' + id);
        }

        function addTask(stageId) {
            currentStageId = stageId;
            currentEditTaskId = null;
            currentEditTaskType = 'new';
            document.getElementById('editTaskModalTitle').textContent = '添加新任务';
            document.getElementById('taskChangeDiff').style.display = 'none';
            
            document.getElementById('editTaskName').value = '';
            document.getElementById('executorInput').value = '';
            document.getElementById('confirmerTags').innerHTML = '';
            selectedConfirmers = [];
            document.getElementById('editExecuteStandard').value = '';
            document.getElementById('editConfirmStandard').value = '';
            document.getElementById('editResponsibleStandard').value = '';
            
            document.getElementById('editTaskModal').classList.add('show');
        }

        function closeEditTaskModal() {
            document.getElementById('editTaskModal').classList.remove('show');
            document.querySelectorAll('.highlight-input').forEach(el => el.classList.remove('highlight-input'));
        }

        function editTask(taskId) {
            currentEditTaskId = taskId;
            const allTaskItems = document.querySelectorAll('.task-item');
            let taskItem = null;
            
            for (let item of allTaskItems) {
                const buttons = item.querySelectorAll('button');
                for (let btn of buttons) {
                    const onclickAttr = btn.getAttribute('onclick');
                    if (onclickAttr && onclickAttr.includes(`editTask(${taskId})`)) {
                        taskItem = item;
                        break;
                    }
                }
                if (taskItem) break;
            }
            
            if (!taskItem) {
                showToast('未找到任务');
                return;
            }
            
            if (taskItem.classList.contains('disabled')) {
                showToast('此任务不支持编辑');
                return;
            }
            
            if (taskItem.classList.contains('task-added')) {
                currentEditTaskType = 'new';
                document.getElementById('editTaskModalTitle').textContent = '编辑新增任务';
                document.getElementById('taskChangeDiff').style.display = 'none';
                
                const taskName = taskItem.querySelector('.task-name').textContent;
                const taskMeta = taskItem.querySelector('.task-meta').textContent;
                
                document.getElementById('editTaskName').value = taskName;
                
                const metaMatch = taskMeta.match(/执行人：(.+?) \| 确认人：(.+)/);
                if (metaMatch) {
                    document.getElementById('executorInput').value = metaMatch[1];
                    const confirmers = metaMatch[2].split('、');
                    selectedConfirmers = confirmers.map(c => ({ name: c.trim(), role: '' }));
                    renderConfirmerTags();
                }
                
                document.getElementById('editExecuteStandard').value = '按照规范进行布线施工，确保线路走向合理、固定牢固';
                document.getElementById('editConfirmStandard').value = '检查布线是否符合设计要求，线路是否通畅';
                document.getElementById('editResponsibleStandard').value = '因施工质量问题导致的返工由执行人承担';
            } else if (taskItem.classList.contains('task-modified')) {
                currentEditTaskType = 'modified';
                document.getElementById('editTaskModalTitle').textContent = '编辑已修改任务';
                document.getElementById('taskChangeDiff').style.display = 'block';
                
                document.getElementById('taskDiffContent').innerHTML = `
                    <div class="change-diff-row">
                        <span class="change-diff-label">执行人：</span>
                        <span class="change-diff-old">电工组</span>
                        <span>→</span>
                        <span class="change-diff-new">电工组（已调整）</span>
                    </div>
                    <div class="change-diff-row">
                        <span class="change-diff-label">确认人：</span>
                        <span class="change-diff-old">项目经理</span>
                        <span>→</span>
                        <span class="change-diff-new">项目经理、业主</span>
                    </div>
                    <div class="change-diff-row">
                        <span class="change-diff-label">执行标准：</span>
                        <span class="change-diff-old">按规范施工</span>
                        <span>→</span>
                        <span class="change-diff-new">按最新规范施工，增加验收环节</span>
                    </div>
                `;
                
                const taskName = taskItem.querySelector('.task-name').textContent;
                const taskMeta = taskItem.querySelector('.task-meta').textContent;
                
                document.getElementById('editTaskName').value = taskName;
                document.getElementById('editTaskName').classList.add('highlight-input');
                
                const metaMatch = taskMeta.match(/执行人：(.+?) \| 确认人：(.+)/);
                if (metaMatch) {
                    document.getElementById('executorInput').value = metaMatch[1];
                    const confirmers = metaMatch[2].split('、');
                    selectedConfirmers = confirmers.map(c => ({ name: c.trim(), role: '' }));
                    renderConfirmerTags();
                }
                
                document.getElementById('editExecuteStandard').value = '按最新规范施工，增加验收环节';
                document.getElementById('editExecuteStandard').classList.add('highlight-input');
                document.getElementById('editConfirmStandard').value = '检查布线是否符合设计要求，线路是否通畅，业主现场确认';
                document.getElementById('editConfirmStandard').classList.add('highlight-input');
                document.getElementById('editResponsibleStandard').value = '因施工质量问题导致的返工由执行人承担';
            } else {
                showToast('此任务不支持编辑');
                return;
            }
            
            document.getElementById('editTaskModal').classList.add('show');
        }

        function toggleExecutorDropdown() {
            const dropdown = document.getElementById('executorDropdown');
            const confirmerDropdown = document.getElementById('confirmerDropdown');
            confirmerDropdown.classList.remove('show');
            dropdown.classList.toggle('show');
        }

        function selectExecutor(name, role) {
            selectedExecutor = { name, role };
            document.getElementById('executorInput').value = `${name}（${role}）`;
            document.getElementById('executorDropdown').classList.remove('show');
        }

        function toggleConfirmerDropdown() {
            const dropdown = document.getElementById('confirmerDropdown');
            const executorDropdown = document.getElementById('executorDropdown');
            executorDropdown.classList.remove('show');
            dropdown.classList.toggle('show');
        }

        function toggleConfirmer(name, role) {
            const existing = selectedConfirmers.find(c => c.name === name);
            if (existing) {
                selectedConfirmers = selectedConfirmers.filter(c => c.name !== name);
            } else {
                if (selectedConfirmers.length >= 5) {
                    showToast('确认人最多选择5人');
                    return;
                }
                selectedConfirmers.push({ name, role });
            }
            renderConfirmerTags();
            updateConfirmerOptions();
        }

        function renderConfirmerTags() {
            const container = document.getElementById('confirmerTags');
            container.innerHTML = selectedConfirmers.map(c => `
                <div class="person-tag">
                    <span>${c.name}（${c.role}）</span>
                    <span class="remove" onclick="removeConfirmer('${c.name}')">×</span>
                </div>
            `).join('');
        }

        function removeConfirmer(name) {
            selectedConfirmers = selectedConfirmers.filter(c => c.name !== name);
            renderConfirmerTags();
            updateConfirmerOptions();
        }

        function updateConfirmerOptions() {
            const options = document.querySelectorAll('#confirmerDropdown .person-select-option');
            options.forEach(opt => {
                const name = opt.querySelector('span:last-child').textContent.split('（')[0];
                if (selectedConfirmers.find(c => c.name === name)) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });
        }

        function saveTask() {
            const taskName = document.getElementById('editTaskName').value.trim();
            const executeStandard = document.getElementById('editExecuteStandard').value.trim();
            const confirmStandard = document.getElementById('editConfirmStandard').value.trim();
            const responsibleStandard = document.getElementById('editResponsibleStandard').value.trim();
            const executor = document.getElementById('executorInput').value || '未指定';
            const confirmerNames = selectedConfirmers.map(c => c.name).join('、') || '未指定';
            
            if (!taskName) {
                showToast('请输入任务名称');
                return;
            }
            if (!executeStandard) {
                showToast('请输入执行标准');
                return;
            }
            if (!confirmStandard) {
                showToast('请输入确认标准');
                return;
            }
            if (!responsibleStandard) {
                showToast('请输入担责标准');
                return;
            }
            
            if (currentEditTaskType === 'new' && !currentEditTaskId) {
                const newTaskId = newTaskCounter++;
                const newTaskHtml = `
                    <div class="task-item task-added" data-task-id="${newTaskId}">
                        <div class="task-info">
                            <span class="task-name">${taskName}</span>
                            <span class="task-meta">执行人：${executor} | 确认人：${confirmerNames}</span>
                            <span class="change-badge added">新增</span>
                        </div>
                        <div class="flex gap-8">
                            <button class="pc-btn pc-btn-text pc-btn-sm" onclick="editTask(${newTaskId})">编辑</button>
                            <button class="pc-btn pc-btn-text pc-btn-sm" onclick="deleteTask(${newTaskId})">删除</button>
                        </div>
                    </div>
                `;
                
                const addBtn = document.querySelector(`button[onclick="addTask(${currentStageId})"]`);
                if (addBtn) {
                    addBtn.insertAdjacentHTML('beforebegin', newTaskHtml);
                }
            } else if (currentEditTaskId) {
                const allTaskItems = document.querySelectorAll('.task-item');
                for (let item of allTaskItems) {
                    const buttons = item.querySelectorAll('button');
                    let found = false;
                    for (let btn of buttons) {
                        const onclickAttr = btn.getAttribute('onclick');
                        if (onclickAttr && (onclickAttr.includes(`editTask(${currentEditTaskId})`) || onclickAttr.includes(`deleteTask(${currentEditTaskId})`))) {
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        item.querySelector('.task-name').textContent = taskName;
                        item.querySelector('.task-meta').textContent = `执行人：${executor} | 确认人：${confirmerNames}`;
                        item.setAttribute('data-task-id', currentEditTaskId);
                        break;
                    }
                }
            }
            
            closeEditTaskModal();
            showToast('任务已保存');
        }

        function deleteTask(taskId) {
            const allTaskItems = document.querySelectorAll('.task-item');
            let taskItem = null;
            
            for (let item of allTaskItems) {
                const buttons = item.querySelectorAll('button');
                for (let btn of buttons) {
                    const onclickAttr = btn.getAttribute('onclick');
                    if (onclickAttr && onclickAttr.includes(`deleteTask(${taskId})`)) {
                        taskItem = item;
                        break;
                    }
                }
                if (taskItem) break;
            }
            
            if (!taskItem) {
                showToast('未找到任务');
                return;
            }
            
            if (taskItem.classList.contains('disabled')) {
                showToast('已完成或进行中的任务不支持删除');
                return;
            }
            
            if (confirm('确定要删除此任务吗？')) {
                taskItem.classList.add('task-deleting');
                setTimeout(() => {
                    taskItem.remove();
                    showToast('任务已删除');
                }, 300);
            }
        }

        function showTemplateModal() {
            showToast('选择合同文本模板');
        }

        function showStageTemplateModal() {
            showToast('选择阶段任务模板');
        }

        function clearContent() {
            if (confirm('确定要清空合同正文内容吗？')) {
                document.getElementById('contractContent').innerHTML = '';
            }
        }

        function viewOriginal() {
            showToast('查看原合同');
        }

        function viewHistory() {
            showToast('查看变更记录');
        }

        function cancelChange() {
            if (confirm('确定要取消变更吗？\n\n取消后将返回合同详情页面，变更内容将不会保存。')) {
                window.location.href = 'pc-contract-detail.html?id=1&status=signed';
            }
        }

        function submitChange() {
            const reason = document.getElementById('changeReason').value.trim();
            if (!reason) {
                showToast('请填写变更原因');
                return;
            }
            
            if (confirm('确定要提交变更申请吗？\n\n提交后将发送给合同另一方确认。')) {
                const now = new Date();
                const timeStr = now.getFullYear() + '-' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(now.getDate()).padStart(2, '0') + ' ' + 
                    String(now.getHours()).padStart(2, '0') + ':' + 
                    String(now.getMinutes()).padStart(2, '0');
                document.getElementById('submitTime').textContent = timeStr;
                
                document.getElementById('waitingPage').classList.add('show');
            }
        }

        function backToDetail() {
            window.location.href = 'pc-contract-detail.html?id=1&status=changing';
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
            
            const sections = ['basicInfo', 'contractContentSection', 'stageSection', 'attachmentSection'];
            
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

        document.addEventListener('click', function(e) {
            const dropdown = document.querySelector('.pc-user-dropdown');
            const menu = document.getElementById('userDropdownMenu');
            if (dropdown && menu && !dropdown.contains(e.target)) {
                menu.classList.remove('show');
            }
            
            const executorSelect = document.getElementById('executorSelect');
            const executorDropdown = document.getElementById('executorDropdown');
            if (executorSelect && executorDropdown && !executorSelect.contains(e.target)) {
                executorDropdown.classList.remove('show');
            }
            
            const confirmerSelect = document.getElementById('confirmerSelect');
            const confirmerDropdown = document.getElementById('confirmerDropdown');
            if (confirmerSelect && confirmerDropdown && !confirmerSelect.contains(e.target)) {
                confirmerDropdown.classList.remove('show');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeEditTaskModal();
                closeAddStageModal();
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        const contractId = urlParams.get('contractId');

        if (role === 'operator') {
            document.querySelector('.pc-role-switcher .pc-role-btn:first-child').click();
        }

        initQuickNav();
        renderAttachmentList();
    