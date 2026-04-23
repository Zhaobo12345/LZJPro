
        let currentRole = 'operator';
        let currentStatus = 'draft';
        let pendingAction = null;
        let currentPcRole = 'operator';

        function switchPcRole(role) {
            currentPcRole = role;
            
            document.querySelectorAll('.pc-role-switcher .pc-role-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            const sidebar = document.querySelector('.pc-sidebar');
            const main = document.getElementById('pcMain');
            const breadcrumb = document.querySelector('.pc-breadcrumb');
            
            if (role === 'initiator') {
                sidebar.classList.add('hidden');
                main.classList.add('full-width');
                breadcrumb.innerHTML = `
                    <span class="item current">合同详情</span>
                `;
                document.getElementById('userAvatar').textContent = '发';
                document.getElementById('userName').textContent = '合同发起方';
                
                currentRole = 'creator';
                updateUI();
            } else {
                sidebar.classList.remove('hidden');
                main.classList.remove('full-width');
                breadcrumb.innerHTML = `
                    <a href="pc-contract-list.html" class="item">合同审核管理</a>
                    <span class="separator">/</span>
                    <span class="item current">合同详情</span>
                `;
                document.getElementById('userAvatar').textContent = '运';
                document.getElementById('userName').textContent = '运营人员';
                
                currentRole = 'operator';
                updateUI();
            }
        }

        const statusConfig = {
            draft: {
                title: '📝 拟定中',
                desc: '合同正在编辑中，编辑完成后可提交确认 | 合同编号：HT-2024-001',
                class: 'draft'
            },
            draft_submittable: {
                title: '📝 拟定中',
                desc: '合同内容已完善，可以提交确认 | 合同编号：HT-2024-001',
                class: 'draft-submittable'
            },
            platform_reviewing: {
                title: '⏳ 待平台审核',
                desc: '已提交确认申请，平台运营人员正在审核中 | 合同编号：HT-2024-001',
                class: 'platform-reviewing'
            },
            platform_rejected: {
                title: '❌ 平台审核驳回',
                desc: '平台审核未通过，请根据驳回原因修改合同内容后重新提交 | 合同编号：HT-2024-001',
                class: 'platform-rejected'
            },
            platform_rejected_modified: {
                title: '❌ 平台审核驳回',
                desc: '合同内容已修改，可以重新提交审核 | 合同编号：HT-2024-001',
                class: 'platform-rejected-modified'
            },
            confirming: {
                getTitle: (role) => role === 'creator' ? '📤 待对方确认' : '📥 待我方确认',
                getDesc: (role) => role === 'creator' 
                    ? '已发送确认申请，等待对方确认合同内容 | 合同编号：HT-2024-001'
                    : '对方已发送确认申请，请确认或驳回修改 | 合同编号：HT-2024-001',
                class: 'confirming'
            },
            confirmed: {
                title: '✅ 双方已确认',
                desc: '双方已确认，请上传签约后的合同附件 | 合同编号：HT-2024-001',
                class: 'confirmed'
            },
            signing: {
                getTitle: (role) => role === 'creator' ? '⏳ 待对方确认签约' : '📝 待确认签约',
                getDesc: (role) => role === 'creator'
                    ? '签约文件已上传，等待对方确认后合同正式生效 | 合同编号：HT-2024-001'
                    : '对方已上传签约文件，请确认后合同正式生效 | 合同编号：HT-2024-001',
                class: 'signing'
            },
            signed: {
                title: '✅ 合同已签约',
                desc: '签约时间：2024-01-15 10:30 | 合同编号：HT-2024-001',
                class: 'signed'
            },
            changing: {
                title: '🔄 变更中',
                desc: '变更申请时间：2024-02-01 14:00 | 合同编号：HT-2024-001',
                class: 'changing'
            },
            change_reviewing: {
                title: '⏳ 变更待平台审核',
                desc: '变更申请已提交，平台运营人员正在审核中 | 合同编号：HT-2024-001',
                class: 'changing'
            },
            change_confirming: {
                title: '📋 待确认变更',
                desc: '变更申请时间：2024-02-01 14:00 | 合同编号：HT-2024-001',
                class: 'change-confirming'
            },
            confirming_receiver: {
                title: '📥 待我方确认',
                desc: '对方已发送确认申请，请确认或驳回修改 | 合同编号：HT-2024-001',
                class: 'confirming'
            },
            review_rejected: {
                title: '❌ 审核驳回',
                desc: '平台审核未通过，请根据驳回原因修改合同内容后重新提交 | 合同编号：HT-2024-001',
                class: 'platform-rejected',
                showRejectReason: true
            },
            reviewed_pass: {
                title: '✅ 审核已通过',
                desc: '合同审核已通过，等待双方确认签约 | 合同编号：HT-2024-001',
                class: 'confirmed'
            },
            reviewed_reject: {
                title: '❌ 审核已驳回',
                desc: '合同审核未通过，请根据驳回原因修改后重新提交 | 合同编号：HT-2024-001',
                class: 'platform-rejected',
                showRejectReason: true
            },
            change_reviewed_pass: {
                title: '✅ 变更已通过',
                desc: '变更申请已通过审核 | 合同编号：HT-2024-001',
                class: 'signed'
            },
            change_reviewed_reject: {
                title: '❌ 变更已驳回',
                desc: '变更申请未通过审核，请根据驳回原因修改后重新提交 | 合同编号：HT-2024-001',
                class: 'platform-rejected',
                showRejectReason: true
            }
        };

        function switchRole(role) {
            currentRole = role;
            document.querySelectorAll('.nav-role-item').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            
            const roleNames = {
                operator: '运营人员',
                creator: '合同创建方',
                receiver: '合同确认方'
            };
            
            document.getElementById('userName').textContent = roleNames[role];
            document.getElementById('userAvatar').textContent = roleNames[role].charAt(0);
            
            updateUI();
        }

        function switchStatus(status) {
            currentStatus = status;
            updateUI();
        }

        function updateUI() {
            const config = statusConfig[currentStatus];
            
            const title = typeof config.getTitle === 'function' 
                ? config.getTitle(currentRole) 
                : config.title;
            const desc = typeof config.getDesc === 'function' 
                ? config.getDesc(currentRole) 
                : config.desc;
            
            document.getElementById('statusTitle').textContent = title;
            document.getElementById('statusDesc').textContent = desc;
            document.getElementById('statusBanner').className = 'status-banner ' + config.class;
            
            updateRoleSwitcher();
            updateStatusSelector();
            updateReviewPanel();
            updateStatusActions();
            updateEditButton();
            updateChangesContent();
            updateRejectReasonBanner();
            updateOperationLog();
            updateStagesContent();
        }

        function updateRoleSwitcher() {
            const creatorItem = document.getElementById('creatorRoleItem');
            const receiverItem = document.getElementById('receiverRoleItem');
            const roleSwitchGroup = document.getElementById('roleSwitchGroup');
            const statusSelectorGroup = document.getElementById('statusSelectorGroup');
            const contractOperationNav = document.getElementById('contractOperationNav');
            const pageNavGroup = document.getElementById('pageNavGroup');
            const loginNavGroup = document.getElementById('loginNavGroup');
            const miniProgramNavGroup = document.getElementById('miniProgramNavGroup');
            
            if (currentPcRole === 'operator') {
                if (creatorItem) creatorItem.style.display = 'none';
                if (receiverItem) receiverItem.style.display = 'none';
                if (statusSelectorGroup) statusSelectorGroup.style.display = 'block';
                if (contractOperationNav) contractOperationNav.style.display = 'none';
                if (pageNavGroup) pageNavGroup.style.display = 'none';
                if (loginNavGroup) loginNavGroup.style.display = 'none';
                if (miniProgramNavGroup) miniProgramNavGroup.style.display = 'none';
            } else {
                if (creatorItem) creatorItem.style.display = 'flex';
                if (receiverItem) receiverItem.style.display = 'flex';
                if (roleSwitchGroup) roleSwitchGroup.style.display = 'none';
                if (statusSelectorGroup) statusSelectorGroup.style.display = 'block';
                if (contractOperationNav) contractOperationNav.style.display = 'none';
                if (pageNavGroup) pageNavGroup.style.display = 'none';
                if (loginNavGroup) loginNavGroup.style.display = 'none';
                if (miniProgramNavGroup) miniProgramNavGroup.style.display = 'none';
            }
        }

        function updateStatusSelector() {
            const selector = document.getElementById('statusSelector');
            const statusSelectorGroup = document.getElementById('statusSelectorGroup');
            const statusSelectorTitle = document.getElementById('statusSelectorTitle');
            
            if (currentPcRole === 'operator') {
                if (statusSelectorGroup) statusSelectorGroup.style.display = 'block';
                if (statusSelectorTitle) statusSelectorTitle.textContent = '页面导航';
                selector.innerHTML = `
                    <option value="contract_template">合同文本模板</option>
                    <option value="stage_template">阶段任务模板</option>
                    <option value="contract_list">合同审核管理</option>
                    <option value="contract_detail" selected>合同详情</option>
                    <option value="qr_login">扫码登录</option>
                    <option value="mini_program">小程序首页</option>
                `;
            } else {
                if (statusSelectorGroup) statusSelectorGroup.style.display = 'block';
                if (statusSelectorTitle) statusSelectorTitle.textContent = '页面导航';
                selector.innerHTML = `
                    <option value="edit_contract">编辑合同</option>
                    <option value="change_contract">变更合同</option>
                    <option value="qr_login">扫码登录</option>
                    <option value="mini_program">小程序首页</option>
                `;
            }
        }

        function handlePageChange(value) {
            switch(value) {
                case 'contract_template':
                    window.location.href = 'pc-contract-template.html';
                    break;
                case 'stage_template':
                    window.location.href = 'pc-stage-template.html';
                    break;
                case 'contract_list':
                    window.location.href = 'pc-contract-list.html';
                    break;
                case 'contract_detail':
                    break;
                case 'edit_contract':
                    window.location.href = 'pc-contract-edit.html';
                    break;
                case 'change_contract':
                    window.location.href = 'pc-contract-change.html';
                    break;
                case 'qr_login':
                    window.location.href = 'pc-login.html';
                    break;
                case 'mini_program':
                    showToast('正在打开小程序首页...');
                    break;
            }
        }

        function updateRejectReasonBanner() {
            const banner = document.getElementById('rejectReasonBanner');
            const rejectedStatuses = ['platform_rejected', 'platform_rejected_modified', 'review_rejected', 'reviewed_reject', 'change_reviewed_reject'];
            
            if (rejectedStatuses.includes(currentStatus)) {
                banner.classList.add('show');
            } else {
                banner.classList.remove('show');
            }
        }

        function updateStagesContent() {
            const changeSummaryCard = document.getElementById('changeSummaryCard');
            const stage2Section = document.getElementById('stage2Section');
            const stage2ChangeBadge = document.getElementById('stage2ChangeBadge');
            const taskWaterPipe = document.getElementById('taskWaterPipe');
            const taskWaterPipeBadge = document.getElementById('taskWaterPipeBadge');
            const stage3NewSection = document.getElementById('stage3NewSection');
            const stage3OriginalSection = document.getElementById('stage3OriginalSection');
            
            if (currentStatus === 'change_reviewing') {
                if (changeSummaryCard) changeSummaryCard.style.display = 'block';
                if (stage2ChangeBadge) stage2ChangeBadge.style.display = 'inline';
                if (taskWaterPipeBadge) taskWaterPipeBadge.style.display = 'inline';
                if (stage3NewSection) stage3NewSection.style.display = 'block';
                if (stage3OriginalSection) stage3OriginalSection.style.display = 'none';
            } else {
                if (changeSummaryCard) changeSummaryCard.style.display = 'none';
                if (stage2ChangeBadge) stage2ChangeBadge.style.display = 'none';
                if (taskWaterPipeBadge) taskWaterPipeBadge.style.display = 'none';
                if (stage3NewSection) stage3NewSection.style.display = 'none';
                if (stage3OriginalSection) stage3OriginalSection.style.display = 'block';
                
                if (stage2Section) {
                    stage2Section.classList.remove('stage-modified');
                }
                if (taskWaterPipe) {
                    taskWaterPipe.classList.remove('task-modified');
                }
            }
        }

        function updateOperationLog() {
            const logContainer = document.getElementById('operationLog');
            let logs = [];
            
            logs.push({ time: '01-10 15:00', content: '创建合同', user: '张三' });
            
            if (currentStatus !== 'draft' && currentStatus !== 'draft_submittable') {
                logs.push({ time: '01-10 15:30', content: '提交合同审核', user: '张三' });
            }
            
            if (currentStatus === 'platform_reviewing') {
                logs.push({ time: '01-10 15:30', content: '进入平台审核', user: '系统' });
            }
            
            if (currentStatus === 'platform_rejected' || currentStatus === 'platform_rejected_modified') {
                logs.push({ time: '01-10 16:00', content: '平台审核驳回', user: '运营人员', detail: '合同金额填写有误，请核实后重新提交' });
            }
            
            if (currentStatus === 'platform_rejected_modified') {
                logs.push({ time: '01-10 17:00', content: '修改合同内容', user: '张三' });
            }
            
            if (currentStatus === 'confirming' || currentStatus === 'confirmed' || 
                currentStatus === 'signing' || currentStatus === 'signed') {
                logs.push({ time: '01-10 16:30', content: '平台审核通过', user: '运营人员' });
            }
            
            if (currentStatus === 'confirming' || currentStatus === 'confirmed' || 
                currentStatus === 'signing' || currentStatus === 'signed') {
                logs.push({ time: '01-11 10:00', content: '发送确认申请', user: '张三' });
            }
            
            if (currentStatus === 'confirmed' || currentStatus === 'signing' || currentStatus === 'signed') {
                logs.push({ time: '01-11 14:00', content: '确认合同', user: '李四' });
            }
            
            if (currentStatus === 'confirmed' || currentStatus === 'signing' || currentStatus === 'signed') {
                logs.push({ time: '01-11 14:30', content: '双方确认完成', user: '系统' });
            }
            
            if (currentStatus === 'signing' || currentStatus === 'signed') {
                logs.push({ time: '01-12 09:00', content: '上传签约文件', user: '张三' });
            }
            
            if (currentStatus === 'signed') {
                logs.push({ time: '01-15 10:30', content: '确认签约', user: '李四' });
                logs.push({ time: '01-15 10:30', content: '合同签约完成', user: '系统' });
            }
            
            let html = '';
            logs.reverse().forEach(log => {
                html += `
                    <div class="log-item">
                        <span class="log-time">${log.time}</span>
                        <span class="log-content">${log.content}${log.detail ? '<br><span style="color: var(--text-tertiary); font-size: 12px;">' + log.detail + '</span>' : ''}</span>
                        <span class="log-user">${log.user}</span>
                    </div>
                `;
            });
            
            logContainer.innerHTML = html;
        }

        function updateReviewPanel() {
            const panel = document.getElementById('reviewPanel');
            const rejectInput = document.getElementById('rejectReasonInput');
            const panelTitle = panel.querySelector('.review-panel-title span:first-child');
            const statusBanner = document.getElementById('statusBanner');
            const changeReasonBanner = document.getElementById('changeReasonBanner');
            const contractPriceChange = document.getElementById('contractPriceChange');
            const contractAdditionChange = document.getElementById('contractAdditionChange');
            
            if ((currentStatus === 'platform_reviewing' || currentStatus === 'change_reviewing') && currentRole === 'operator') {
                panel.style.display = 'block';
                statusBanner.style.display = 'none';
                rejectInput.style.display = 'none';
                document.getElementById('rejectReason').value = '';
                
                if (panelTitle) {
                    panelTitle.textContent = currentStatus === 'change_reviewing' ? '🔍 变更审核' : '🔍 合同审核';
                }
                
                if (currentStatus === 'change_reviewing') {
                    changeReasonBanner.style.display = 'block';
                    if (contractPriceChange) contractPriceChange.style.display = 'block';
                    if (contractAdditionChange) contractAdditionChange.style.display = 'block';
                } else {
                    changeReasonBanner.style.display = 'none';
                    if (contractPriceChange) contractPriceChange.style.display = 'none';
                    if (contractAdditionChange) contractAdditionChange.style.display = 'none';
                }
            } else {
                panel.style.display = 'none';
                statusBanner.style.display = 'flex';
                changeReasonBanner.style.display = 'none';
                if (contractPriceChange) contractPriceChange.style.display = 'none';
                if (contractAdditionChange) contractAdditionChange.style.display = 'none';
            }
        }

        function showTaskDetail(name, executor, confirmers, executeStandard, confirmStandard, responsibleStandard) {
            document.getElementById('taskDetailTitle').textContent = name;
            document.getElementById('taskDetailExecutor').textContent = executor;
            
            const confirmerList = confirmers.split('、').map(c => {
                return `<span class="task-detail-person">
                    <span>👤</span>
                    <span>${c}</span>
                </span>`;
            }).join('');
            document.getElementById('taskDetailConfirmers').innerHTML = confirmerList;
            
            document.getElementById('taskDetailExecuteStandard').textContent = executeStandard;
            document.getElementById('taskDetailConfirmStandard').textContent = confirmStandard;
            document.getElementById('taskDetailResponsibleStandard').textContent = responsibleStandard;
            
            document.getElementById('taskDetailModal').classList.add('show');
        }

        function closeTaskDetail() {
            document.getElementById('taskDetailModal').classList.remove('show');
        }

        function updateStatusActions() {
            const actionsContainer = document.getElementById('statusActions');
            let actionsHtml = '';
            
            if (currentRole === 'operator') {
                switch (currentStatus) {
                    case 'platform_reviewing':
                    case 'change_reviewing':
                        actionsHtml = '';
                        break;
                    case 'signed':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="initiateChange()">发起变更</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                }
            } else if (currentRole === 'creator') {
                switch (currentStatus) {
                    case 'draft':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="editContract()">编辑合同</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'draft_submittable':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="submitContract()">提交确认</button>
                            <button class="pc-btn btn" onclick="editContract()">编辑合同</button>
                        `;
                        break;
                    case 'platform_reviewing':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="withdrawReview()">撤回申请</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'platform_rejected':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="editContract()">修改合同</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'platform_rejected_modified':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="resubmitContract()">重新提交</button>
                            <button class="pc-btn btn" onclick="editContract()">编辑合同</button>
                        `;
                        break;
                    case 'confirming':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="withdrawConfirm()">撤回确认</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'confirmed':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="uploadSignFile()">上传签约文件</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'signing':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="withdrawSignFile()">撤回签约文件</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'signed':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="initiateChange()">发起变更</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'changing':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="withdrawChange()">撤回变更</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'change_confirming':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="confirmChange()">确认变更</button>
                            <button class="pc-btn btn" onclick="rejectChange()">驳回变更</button>
                        `;
                        break;
                }
            } else if (currentRole === 'receiver') {
                switch (currentStatus) {
                    case 'confirming':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="confirmContract()">确认合同</button>
                            <button class="pc-btn btn" onclick="rejectContract()">驳回修改</button>
                        `;
                        break;
                    case 'signing':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="confirmSign()">确认签约</button>
                            <button class="pc-btn btn" onclick="rejectSign()">驳回</button>
                        `;
                        break;
                    case 'signed':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="initiateChange()">发起变更</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'changing':
                        actionsHtml = `
                            <button class="pc-btn btn" onclick="withdrawChange()">撤回变更</button>
                            <button class="pc-btn btn" onclick="exportContract()">导出合同</button>
                        `;
                        break;
                    case 'change_confirming':
                        actionsHtml = `
                            <button class="pc-btn btn-primary-action" onclick="confirmChange()">确认变更</button>
                            <button class="pc-btn btn" onclick="rejectChange()">驳回变更</button>
                        `;
                        break;
                }
            }
            
            actionsContainer.innerHTML = actionsHtml;
        }

        function updateEditButton() {
            const editBtn = document.getElementById('editBtn');
            if (currentStatus === 'draft' || currentStatus === 'draft_submittable' || currentStatus === 'platform_rejected' || currentStatus === 'platform_rejected_modified') {
                if (currentRole === 'creator') {
                    editBtn.style.display = 'inline-block';
                } else {
                    editBtn.style.display = 'none';
                }
            } else {
                editBtn.style.display = 'none';
            }
        }

        function updateChangesContent() {
            const changeRecord1 = document.getElementById('changeRecord1');
            const changeRecord2 = document.getElementById('changeRecord2');
            const changeRecord3 = document.getElementById('changeRecord3');
            const noChangeRecord = document.getElementById('noChangeRecord');
            
            if (currentStatus === 'change_reviewing') {
                if (changeRecord1) changeRecord1.style.display = 'block';
                if (changeRecord2) changeRecord2.style.display = 'none';
                if (changeRecord3) changeRecord3.style.display = 'none';
                if (noChangeRecord) noChangeRecord.style.display = 'none';
            } else if (currentStatus === 'signed') {
                if (changeRecord1) changeRecord1.style.display = 'none';
                if (changeRecord2) changeRecord2.style.display = 'block';
                if (changeRecord3) changeRecord3.style.display = 'block';
                if (noChangeRecord) noChangeRecord.style.display = 'none';
            } else {
                if (changeRecord1) changeRecord1.style.display = 'none';
                if (changeRecord2) changeRecord2.style.display = 'none';
                if (changeRecord3) changeRecord3.style.display = 'none';
                if (noChangeRecord) noChangeRecord.style.display = 'block';
            }
        }

        function showRejectInput() {
            const rejectInput = document.getElementById('rejectReasonInput');
            const showBtn = document.getElementById('showRejectBtn');
            
            if (rejectInput.style.display === 'none') {
                rejectInput.style.display = 'block';
                showBtn.textContent = '取消驳回';
            } else {
                rejectInput.style.display = 'none';
                showBtn.textContent = '驳回';
            }
        }

        function approveContract() {
            showToast('审核通过，合同已进入待确认状态');
            document.getElementById('statusSelector').value = 'confirming_sender';
            switchStatus('confirming_sender');
        }

        function rejectContract() {
            const reason = document.getElementById('rejectReason').value.trim();
            if (!reason) {
                showToast('请输入驳回原因');
                return;
            }
            showToast('已驳回，合同退回拟定中状态');
            document.getElementById('statusSelector').value = 'review_rejected';
            switchStatus('review_rejected');
        }

        function confirmContract() {
            showConfirmModal('确认合同', '确定要确认此合同吗？确认后将进入签约阶段。', () => {
                showToast('合同已确认');
                document.getElementById('statusSelector').value = 'confirmed';
                switchStatus('confirmed');
            });
        }

        function rejectContractModify() {
            showConfirmModal('驳回修改', '确定要驳回此合同吗？合同将退回创建方重新编辑。', () => {
                showToast('已驳回，合同退回修改');
                document.getElementById('statusSelector').value = 'review_rejected';
                switchStatus('review_rejected');
            });
        }

        function withdrawConfirm() {
            showConfirmModal('撤回确认', '确定要撤回确认申请吗？', () => {
                showToast('已撤回确认');
                document.getElementById('statusSelector').value = 'pending_review';
                switchStatus('pending_review');
            });
        }

        function uploadSignFile() {
            showToast('请选择签约文件上传');
        }

        function confirmSign() {
            showConfirmModal('确认签约', '确定要确认签约吗？签约后合同正式生效。', () => {
                showToast('签约成功，合同已生效');
                document.getElementById('statusSelector').value = 'signed';
                switchStatus('signed');
            });
        }

        function rejectSign() {
            showConfirmModal('驳回签约', '确定要驳回签约文件吗？', () => {
                showToast('已驳回签约文件');
                document.getElementById('statusSelector').value = 'confirmed';
                switchStatus('confirmed');
            });
        }

        function withdrawSignFile() {
            showConfirmModal('撤回签约文件', '确定要撤回签约文件吗？', () => {
                showToast('已撤回签约文件');
                document.getElementById('statusSelector').value = 'confirmed';
                switchStatus('confirmed');
            });
        }

        function initiateChange() {
            showConfirmModal('发起变更', '确定要发起变更申请吗？发起后阶段任务将暂停流转。', () => {
                showToast('变更申请已发起');
                document.getElementById('statusSelector').value = 'changing';
                switchStatus('changing');
            });
        }

        function confirmChange() {
            showConfirmModal('确认变更', '确定要确认此变更吗？变更生效后将更新合同内容。', () => {
                showToast('变更已确认');
                document.getElementById('statusSelector').value = 'signed';
                switchStatus('signed');
            });
        }

        function rejectChange() {
            showConfirmModal('驳回变更', '确定要驳回此变更申请吗？', () => {
                showToast('变更已驳回');
                document.getElementById('statusSelector').value = 'signed';
                switchStatus('signed');
            });
        }

        function withdrawChange() {
            showConfirmModal('撤回变更', '确定要撤回变更申请吗？', () => {
                showToast('变更已撤回');
                document.getElementById('statusSelector').value = 'signed';
                switchStatus('signed');
            });
        }

        function resubmitContract() {
            showToast('合同已重新提交审核');
            document.getElementById('statusSelector').value = 'platform_reviewing';
            switchStatus('platform_reviewing');
        }

        function submitContract() {
            showConfirmModal('提交确认', '确定要提交合同进行确认吗？', () => {
                showToast('合同已提交，等待平台审核');
                document.getElementById('statusSelector').value = 'platform_reviewing';
                switchStatus('platform_reviewing');
            });
        }

        function withdrawReview() {
            showConfirmModal('撤回申请', '确定要撤回审核申请吗？', () => {
                showToast('申请已撤回');
                document.getElementById('statusSelector').value = 'draft_submittable';
                switchStatus('draft_submittable');
            });
        }

        function approveContract() {
            const title = currentStatus === 'change_reviewing' ? '审核通过变更' : '审核通过';
            const message = currentStatus === 'change_reviewing' ? '确定审核通过该变更申请吗？' : '确定审核通过该合同吗？';
            showConfirmModal(title, message, () => {
                showToast('审核已通过');
                if (currentStatus === 'change_reviewing') {
                    document.getElementById('statusSelector').value = 'signed';
                    switchStatus('signed');
                } else {
                    document.getElementById('statusSelector').value = 'confirming_sender';
                    switchStatus('confirming_sender');
                }
            });
        }

        function rejectContract() {
            const panel = document.getElementById('reviewPanel');
            const rejectInput = document.getElementById('rejectReasonInput');
            panel.style.display = 'block';
            rejectInput.style.display = 'block';
        }

        function confirmReject() {
            const reason = document.getElementById('rejectReason').value.trim();
            if (!reason) {
                showToast('请输入驳回原因');
                return;
            }
            showToast('已驳回');
            if (currentStatus === 'change_reviewing') {
                document.getElementById('statusSelector').value = 'signed';
                switchStatus('signed');
            } else {
                document.getElementById('statusSelector').value = 'platform_rejected';
                switchStatus('platform_rejected');
            }
            document.getElementById('reviewPanel').style.display = 'none';
        }

        function exportContract() {
            showToast('合同导出功能开发中...');
        }

        function editContract() {
            window.location.href = 'pc-contract-edit.html?contractId=HT-2024-001&role=initiator';
        }

        function showConfirmModal(title, content, callback) {
            document.getElementById('confirmModalTitle').textContent = title;
            document.getElementById('confirmModalContent').textContent = content;
            pendingAction = callback;
            document.getElementById('confirmModal').classList.add('show');
        }

        function closeConfirmModal() {
            document.getElementById('confirmModal').classList.remove('show');
            pendingAction = null;
        }

        function confirmAction() {
            if (pendingAction) {
                pendingAction();
            }
            closeConfirmModal();
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

        document.addEventListener('click', function(e) {
            const dropdown = document.querySelector('.pc-user-dropdown');
            const menu = document.getElementById('userDropdownMenu');
            if (dropdown && menu && !dropdown.contains(e.target)) {
                menu.classList.remove('show');
            }
            
            const taskDetailModal = document.getElementById('taskDetailModal');
            if (taskDetailModal && e.target === taskDetailModal) {
                closeTaskDetail();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeTaskDetail();
            }
        });

        function switchTab(tabName, evt) {
            document.querySelectorAll('.detail-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            evt.target.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
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

        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const role = urlParams.get('role');
        const rejectReason = urlParams.get('rejectReason');
        
        if (status) {
            currentStatus = status;
        }
        
        if (rejectReason) {
            document.getElementById('rejectReasonContent').textContent = decodeURIComponent(rejectReason);
        }
        
        if (role === 'initiator') {
            switchPcRoleOnInit('initiator');
        } else if (role === 'operator') {
            currentPcRole = 'operator';
            currentRole = 'operator';
            document.querySelectorAll('.nav-role-item').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.includes('运营')) {
                    btn.classList.add('active');
                }
            });
            document.getElementById('userName').textContent = '运营人员';
            document.getElementById('userAvatar').textContent = '运';
        }

        updateUI();

        function switchPcRoleOnInit(role) {
            currentPcRole = role;
            
            document.querySelectorAll('.pc-role-switcher .pc-role-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent === '合同发起方') {
                    btn.classList.add('active');
                }
            });
            
            const sidebar = document.querySelector('.pc-sidebar');
            const main = document.getElementById('pcMain');
            const breadcrumb = document.querySelector('.pc-breadcrumb');
            
            if (role === 'initiator') {
                sidebar.classList.add('hidden');
                main.classList.add('full-width');
                breadcrumb.innerHTML = `
                    <span class="item current">合同详情</span>
                `;
                document.getElementById('userAvatar').textContent = '发';
                document.getElementById('userName').textContent = '合同发起方';
                
                currentRole = 'creator';
                updateUI();
            }
        }

        const contractOperationNav = document.getElementById('contractOperationNav');
        if (contractOperationNav && currentPcRole === 'operator') {
            contractOperationNav.style.display = 'none';
        }
    