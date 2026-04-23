# prototype-contract-detail.html 重构优化计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 重构 prototype-contract-detail.html（6616行），拆分为 HTML + CSS + JS 三层结构，模块化封装 JavaScript，同时保持现有功能逻辑交互不变。

**架构：** 将单文件拆分为 HTML（约500行）、CSS（约3200行）、JS（约1800行）三层结构，使用 IIFE 模块模式封装 JavaScript 状态和方法，CSS 变量统一管理样式，事件委托替代内联事件。

**技术栈：** HTML5, CSS3 (CSS Variables), JavaScript ES6+

---

## 文件结构

| 文件 | 职责 | 状态 |
|------|------|------|
| `prototype-contract-detail.html` | HTML 结构，引入 CSS 和 JS | 修改 |
| `css/contract-detail.css` | 页面专属样式，使用 CSS 变量 | 新建 |
| `js/contract-detail.js` | 页面逻辑，模块化封装 | 新建 |

---

### 任务 1：创建 CSS 文件并抽离样式

**文件：**
- 创建：`css/contract-detail.css`
- 修改：`prototype-contract-detail.html`（删除内联样式，添加 link 引用）

- [ ] **步骤 1：创建 CSS 文件**

创建 `css/contract-detail.css`，在文件顶部定义 CSS 变量：

```css
/* 合同详情页 CSS 变量 */
:root {
    /* 布局变量 */
    --page-nav-height: 44px;
    --icon-size-md: 40px;
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 10px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    
    /* 颜色变量 */
    --color-draft: #8C8C8C;
    --color-draft-light: #BFBFBF;
    --color-reviewing: #13C2C2;
    --color-reviewing-light: #36CFC9;
    --color-confirming: #FA8C16;
    --color-confirming-light: #FFA940;
    --color-success: #52C41A;
    --color-success-light: #73D13D;
    --color-signing: #722ED1;
    --color-signing-light: #9254DE;
    --color-warning: #FAAD14;
    --color-warning-light: #FFC53D;
    --color-error: #FF4D4F;
    --color-error-light: #FF7875;
    --color-primary: #1890FF;
    --color-primary-light: #40A9FF;
    
    /* 渐变变量 */
    --gradient-draft: linear-gradient(135deg, #8C8C8C 0%, #BFBFBF 100%);
    --gradient-reviewing: linear-gradient(135deg, #13C2C2 0%, #36CFC9 100%);
    --gradient-confirming: linear-gradient(135deg, #FA8C16 0%, #FFA940 100%);
    --gradient-success: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
    --gradient-signing: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
    --gradient-warning: linear-gradient(135deg, #FAAD14 0%, #FFC53D 100%);
    --gradient-error: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
    --gradient-primary: linear-gradient(135deg, #1890FF 0%, #40A9FF 100%);
}
```

- [ ] **步骤 2：迁移所有样式到 CSS 文件**

将 `prototype-contract-detail.html` 中 `<style>` 标签内的所有样式（第 8-3177 行）迁移到 `css/contract-detail.css`。

关键替换：
- 状态 banner 渐变使用变量
- 硬编码颜色值替换为变量
- 魔术数字替换为变量

- [ ] **步骤 3：修改 HTML 文件引用外部 CSS**

修改 `prototype-contract-detail.html`：
- 删除 `<style>` 标签及其内容（第 8-3177 行）
- 在 `<head>` 中确认已有 `<link rel="stylesheet" href="common.css">`，在其后添加：
```html
<link rel="stylesheet" href="css/contract-detail.css">
```

- [ ] **步骤 4：验证页面样式正常**

在浏览器中打开页面，确认样式显示正常。

---

### 任务 2：创建 JavaScript 文件并模块化封装

**文件：**
- 创建：`js/contract-detail.js`
- 修改：`prototype-contract-detail.html`（删除内联脚本，添加 script 引用）

- [ ] **步骤 1：创建 JavaScript 模块文件**

创建 `js/contract-detail.js`，使用 IIFE 模块模式封装：

```javascript
/**
 * 合同详情页模块
 * 负责合同状态管理、交互处理、变更操作
 */
const ContractDetailPage = (function() {
    'use strict';
    
    // ==================== 状态管理 ====================
    const state = {
        isNewContract: false,
        newContractData: {},
        currentStatus: 'signed',
        isReadonly: false,
        hasChangeContent: false,
        changeType: 'stage_only',
        changeReason: '',
        currentStageItem: null,
        newTaskConfirmPersonList: [],
        currentEditTaskItem: null,
        editTaskConfirmPersonList: [],
        customConfirmCallback: null,
        customConfirmDanger: false
    };
    
    // ==================== DOM 元素缓存 ====================
    const elements = {};
    
    function cacheElements() {
        elements.statusBanner = document.getElementById('statusBanner');
        elements.statusText = document.getElementById('statusText');
        elements.statusDesc = document.getElementById('statusDesc');
        elements.rejectReasonBox = document.getElementById('rejectReasonBox');
        elements.pcEditGuide = document.getElementById('pcEditGuide');
        elements.sectionTabs = document.querySelector('.section-tabs');
        elements.contentSection = document.getElementById('contentSection');
        elements.stagesSection = document.getElementById('stagesSection');
        elements.attachmentsSection = document.getElementById('attachmentsSection');
        elements.actionMenu = document.getElementById('actionMenu');
        elements.toast = document.getElementById('toast');
        // ... 其他元素
    }
    
    // ==================== 合同状态配置 ====================
    const contractStatus = {
        draft: {
            text: '拟定中',
            desc: '合同正在编辑中，编辑完成后可提交确认',
            bannerClass: 'draft',
            showPcGuide: true,
            isNew: false,
            hideTabs: true,
            actions: [
                { text: '提交确认', type: 'success', action: 'submit', disabled: true, disabledReason: '请在电脑端完善合同详细内容后再提交' }
            ]
        },
        // ... 其他状态配置（完整迁移）
    };
    
    // ==================== 工具函数 ====================
    function getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    function showToast(message, duration = 2000) {
        if (elements.toast) {
            elements.toast.textContent = message;
            elements.toast.classList.add('show');
            setTimeout(() => {
                elements.toast.classList.remove('show');
            }, duration);
        }
    }
    
    // ==================== 核心功能函数 ====================
    
    function updateContractStatus(status) {
        state.currentStatus = status;
        const config = contractStatus[status];
        
        if (!config) {
            console.error('Invalid contract status:', status);
            return;
        }
        
        state.isReadonly = config.readonly || false;
        
        // 更新 banner
        if (elements.statusBanner) {
            elements.statusBanner.className = 'card status-banner ' + config.bannerClass;
        }
        if (elements.statusText) {
            elements.statusText.textContent = config.text;
        }
        if (elements.statusDesc) {
            elements.statusDesc.textContent = config.desc;
        }
        
        // 更新其他 UI 元素
        updateRejectReason(config);
        updateEditGuide(config);
        updatePcGuide(config);
        updateChangeDisplay(status);
        updateTabs(config);
        updateActionButtons(config);
    }
    
    // ... 其他功能函数（完整迁移）
    
    // ==================== 事件绑定 ====================
    
    function bindEvents() {
        // 使用事件委托绑定所有事件
        document.addEventListener('click', handleDocumentClick);
        
        // 滚动事件（节流处理）
        if (elements.pageContent) {
            elements.pageContent.addEventListener('scroll', throttle(handleScroll, 100));
        }
        
        // ... 其他事件绑定
    }
    
    function handleDocumentClick(e) {
        // 处理各种点击事件
        const target = e.target;
        
        // 关闭下拉菜单
        if (!target.closest('.action-btn') && !target.closest('.action-menu')) {
            closeActionMenu();
        }
        
        // ... 其他点击处理
    }
    
    // ==================== 初始化 ====================
    
    function init() {
        cacheElements();
        initFromUrl();
        bindEvents();
        updateNewContractDisplay();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ==================== 公开 API ====================
    return {
        showToast: showToast,
        updateContractStatus: updateContractStatus,
        getCurrentStatus: () => state.currentStatus,
        showStatusModal: showStatusModal,
        closeModal: closeModal,
        confirmAction: confirmAction,
        showVersionModal: showVersionModal,
        closeVersionModal: closeVersionModal,
        exportContract: exportContract,
        showExportModal: showExportModal,
        closeExportModal: closeExportModal,
        showChangeRecordModal: showChangeRecordModal,
        closeChangeRecordModal: closeChangeRecordModal,
        viewChangeVersion: viewChangeVersion,
        exportToPDF: exportToPDF,
        shareToWechat: shareToWechat
    };
})();
```

- [ ] **步骤 2：迁移完整的 contractStatus 配置**

将原文件中的 `contractStatus` 对象（第 4845-5040 行）完整迁移到 `js/contract-detail.js` 中。

- [ ] **步骤 3：迁移所有函数**

将原文件中的所有函数（约 50 个）迁移到 `js/contract-detail.js` 中，包括：
- 状态管理函数：`updateContractStatus`, `initFromUrl`, `updateNewContractDisplay`
- UI 更新函数：`switchSection`, `toggleStage`, `showFullText`, `closeFullText`
- 弹窗函数：`showStatusModal`, `closeModal`, `confirmAction`, `showVersionModal`
- 导出函数：`exportContract`, `showExportModal`, `exportToPDF`, `shareToWechat`
- 变更函数：`checkChangeReason`, `selectChangeType`, `checkChangeContent`, `showChangeModal`
- 任务编辑函数：`addTaskToStage`, `editTaskDetail`, `deleteTask`, `toggleStageSequential`
- 工具函数：`getUrlParam`, `showToast`, `throttle`

- [ ] **步骤 4：修改 HTML 文件**

修改 `prototype-contract-detail.html`：
- 删除 `<script>` 标签及其内容（第 4824-6614 行）
- 在 `</body>` 前添加：
```html
<script src="js/contract-detail.js"></script>
```

- [ ] **步骤 5：修改 HTML 元素，移除内联事件**

将所有 `onclick` 内联事件改为 `data-*` 属性：

```html
<!-- 示例：阶段展开/收起 -->
<div class="stage-header" data-action="toggle-stage">

<!-- 示例：任务操作 -->
<div class="task-action-btn" data-action="edit-task">

<!-- 示例：弹窗按钮 -->
<div class="modal-btn" data-action="close-modal">
```

- [ ] **步骤 6：验证页面功能正常**

在浏览器中打开页面，测试以下功能：
1. 状态切换（通过 URL 参数）
2. 阶段展开/收起
3. 弹窗显示/关闭
4. 导出功能
5. 变更记录查看
6. 任务编辑

---

### 任务 3：验证和清理

**文件：**
- 验证：`prototype-contract-detail.html`
- 验证：`css/contract-detail.css`
- 验证：`js/contract-detail.js`

- [ ] **步骤 1：完整功能测试**

测试清单：
- [ ] 页面加载正常，样式无缺失
- [ ] 状态切换功能正常
- [ ] 阶段展开/收起
- [ ] Tab 切换（合同内容/阶段任务/附件）
- [ ] 弹窗显示/关闭
- [ ] 导出功能
- [ ] 变更记录查看
- [ ] 版本历史查看
- [ ] 右上角菜单
- [ ] Toast 提示
- [ ] 签约文件上传
- [ ] 变更申请流程

- [ ] **步骤 2：代码格式检查**

确保代码格式规范，无语法错误。

- [ ] **步骤 3：提交代码**

```bash
git add prototype-contract-detail.html css/contract-detail.css js/contract-detail.js
git commit -m "refactor(合同详情): 重构代码结构，拆分 CSS/JS，模块化封装 JavaScript"
```

---

## 注意事项

1. **保持功能不变**：所有重构必须确保现有交互逻辑完全一致
2. **渐进式重构**：每个任务独立完成，可单独验证
3. **错误处理**：所有数据访问前添加空值检查
4. **事件委托**：使用 `data-*` 属性和事件委托替代内联事件
5. **CSS 变量**：统一管理魔术数字，便于后续维护
6. **节流处理**：滚动等高频事件添加节流

---

## 风险提示

由于原文件超过 6600 行，重构过程中需要特别注意：

1. **状态配置完整性**：`contractStatus` 对象包含 20+ 个状态，迁移时确保不遗漏
2. **函数依赖关系**：部分函数存在相互调用，迁移时保持顺序正确
3. **DOM 元素引用**：确保所有 DOM 元素在 `cacheElements` 中正确缓存
4. **事件绑定顺序**：确保事件绑定在 DOM 加载完成后执行
