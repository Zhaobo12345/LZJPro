# prototype-project-detail.html 重构优化计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 重构 prototype-project-detail.html，拆分代码结构、封装 JavaScript、优化 CSS 变量、添加错误处理，同时保持现有功能逻辑交互不变。

**架构：** 将单文件拆分为 HTML + CSS + JS 三层结构，使用模块模式封装 JavaScript 状态和方法，CSS 变量统一管理样式，事件委托替代内联事件。

**技术栈：** HTML5, CSS3 (CSS Variables), JavaScript ES6+

---

## 文件结构

| 文件 | 职责 | 状态 |
|------|------|------|
| `prototype-project-detail.html` | HTML 结构，引入 CSS 和 JS | 修改 |
| `css/project-detail.css` | 页面专属样式，使用 CSS 变量 | 新建 |
| `js/project-detail.js` | 页面逻辑，模块化封装 | 新建 |

---

### 任务 1：创建 CSS 文件并抽离样式

**文件：**
- 创建：`css/project-detail.css`
- 修改：`prototype-project-detail.html`（删除内联样式，添加 link 引用）

- [ ] **步骤 1：创建 css 目录**

运行：`mkdir -p css`
预期：创建 css 目录

- [ ] **步骤 2：创建 CSS 文件并添加 CSS 变量**

创建 `css/project-detail.css`，在文件顶部定义 CSS 变量：

```css
/* 项目详情页 CSS 变量 */
:root {
    --page-nav-height: 44px;
    --icon-size-md: 44px;
    --icon-size-sm: 32px;
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 20px;
    --activity-list-max-height: 180px;
    --activity-list-expanded-height: 400px;
    --quick-nav-max-height: 100px;
}
```

- [ ] **步骤 3：迁移所有样式到 CSS 文件**

将 `prototype-project-detail.html` 中 `<style>` 标签内的所有样式（第 8-1164 行）迁移到 `css/project-detail.css`，并将硬编码数值替换为 CSS 变量。

关键替换：
- `44px` → `var(--page-nav-height)`
- `width: 44px; height: 44px;` → `width: var(--icon-size-md); height: var(--icon-size-md);`
- `border-radius: 12px` → `border-radius: var(--border-radius-lg)`
- `padding: 16px` → `padding: var(--spacing-lg)`

- [ ] **步骤 4：修改 HTML 文件引用外部 CSS**

修改 `prototype-project-detail.html`：
- 删除 `<style>` 标签及其内容
- 在 `<head>` 中添加：
```html
<link rel="stylesheet" href="common.css">
<link rel="stylesheet" href="css/project-detail.css">
```

- [ ] **步骤 5：验证页面样式正常**

在浏览器中打开页面，确认样式显示正常。

---

### 任务 2：创建 JavaScript 文件并模块化封装

**文件：**
- 创建：`js/project-detail.js`
- 修改：`prototype-project-detail.html`（删除内联脚本，添加 script 引用）

- [ ] **步骤 1：创建 js 目录**

运行：`mkdir -p js`
预期：创建 js 目录

- [ ] **步骤 2：创建 JavaScript 模块结构**

创建 `js/project-detail.js`，使用模块模式封装：

```javascript
/**
 * 项目详情页模块
 * 负责层级切换、动态加载、交互处理
 */
const ProjectDetailPage = (function() {
    'use strict';
    
    // ==================== 状态管理 ====================
    const state = {
        currentLevel: '项目部',
        currentLevelPath: ['项目部'],
        activityExpanded: false,
        quickNavExpanded: true,
        userManualExpand: false,
        lastScrollTop: 0
    };
    
    // ==================== 配置数据 ====================
    const levelData = {
        '项目部': {
            level: 0,
            type: 'project',
            typeName: '项目部',
            desc: '水电工作组、泥瓦工作组等5个工作组',
            parent: null,
            children: ['水电工作组', '泥瓦工作组', '木工工作组', '油漆工作组'],
            tasks: { total: 24, accept: { current: 3, total: 8 }, contract: { current: 18, total: 20 }, temp: { current: 2, total: 4 } },
            myTasks: { total: 8, accept: { current: 2, total: 3 }, contract: { current: 4, total: 5 }, temp: { current: 1, total: 2 } },
            contract: { signed: { current: 6, total: 8 }, days: { used: 58, total: 90 }, remain: 32, progress: 65 },
            todo: { count: 5, tempCount: 3 }
        },
        // ... 其他层级数据（完整迁移）
    };
    
    // ==================== DOM 元素缓存 ====================
    const elements = {};
    
    function cacheElements() {
        elements.pageContent = document.getElementById('pageContent');
        elements.stickyHeader = document.getElementById('stickyHeader');
        elements.quickNav = document.getElementById('quickNav');
        elements.quickNavToggle = document.getElementById('quickNavToggle');
        elements.levelSelector = document.getElementById('levelSelector');
        elements.levelOptions = document.getElementById('levelOptions');
        elements.levelArrow = document.getElementById('levelArrow');
        elements.levelIcon = document.getElementById('levelIcon');
        elements.levelText = document.getElementById('levelText');
        elements.levelType = document.getElementById('levelType');
        elements.breadcrumbInline = document.getElementById('breadcrumbInline');
        elements.activityList = document.getElementById('activityList');
        elements.contractList = document.getElementById('contractList');
        elements.actionMenu = document.getElementById('actionMenu');
        elements.customToastModal = document.getElementById('customToastModal');
        elements.customToastMessage = document.getElementById('customToastMessage');
    }
    
    // ==================== 工具函数 ====================
    function getLevelIcon(type) {
        const icons = {
            'project': '🏢',
            'workgroup': '⚡',
            'team': '👷',
            'task': '📦'
        };
        return icons[type] || '📋';
    }
    
    function showCustomToast(message) {
        if (elements.customToastMessage && elements.customToastModal) {
            elements.customToastMessage.innerHTML = message.replace(/\n/g, '<br>');
            elements.customToastModal.classList.add('show');
        }
    }
    
    function closeCustomToast() {
        if (elements.customToastModal) {
            elements.customToastModal.classList.remove('show');
        }
    }
    
    // ==================== 核心功能函数 ====================
    
    function updateBreadcrumb(level) {
        if (!elements.breadcrumbInline) return;
        
        const parts = [];
        let current = level;
        
        while (current) {
            parts.unshift(current);
            const data = levelData[current];
            if (!data) break;
            current = data.parent;
        }
        
        elements.breadcrumbInline.innerHTML = parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const separator = isLast ? '' : '<span class="separator">›</span>';
            return `<span class="breadcrumb-item ${isLast ? 'active' : ''}" data-level="${part}">${part}</span>${separator}`;
        }).join('');
    }
    
    function navigateToLevel(level) {
        if (level === state.currentLevel) return;
        
        const data = levelData[level];
        if (!data) {
            console.error('Level data not found:', level);
            return;
        }
        
        if (elements.levelIcon) elements.levelIcon.textContent = getLevelIcon(data.type);
        if (elements.levelText) elements.levelText.textContent = level;
        
        if (elements.levelType) {
            elements.levelType.textContent = data.typeName;
            elements.levelType.className = 'type-badge ' + data.type;
        }
        
        showPartialLoading();
        
        setTimeout(() => {
            updatePageData(level);
            updateBreadcrumb(level);
            state.currentLevel = level;
            hidePartialLoading();
        }, 200);
    }
    
    function updatePageData(level) {
        const data = levelData[level];
        
        if (!data) {
            console.error('Level data not found:', level);
            return;
        }
        
        const overallTotal = document.getElementById('overallTotal');
        if (overallTotal) overallTotal.textContent = data.tasks.total;
        
        const overallAccept = document.getElementById('overallAccept');
        if (overallAccept) overallAccept.textContent = data.tasks.accept.current;
        
        const overallAcceptTotal = document.getElementById('overallAcceptTotal');
        if (overallAcceptTotal) overallAcceptTotal.textContent = data.tasks.accept.total;
        
        const overallContract = document.getElementById('overallContract');
        if (overallContract) overallContract.textContent = data.tasks.contract.current;
        
        const overallContractTotal = document.getElementById('overallContractTotal');
        if (overallContractTotal) overallContractTotal.textContent = data.tasks.contract.total;
        
        const contractSummary = document.querySelector('.contract-summary');
        if (contractSummary) {
            contractSummary.innerHTML = `
                <div class="contract-stat">
                    <div class="value"><span class="current">${data.contract.signed.current}</span><span class="separator">/</span><span class="total">${data.contract.signed.total}</span></div>
                    <div class="label">合同签约</div>
                </div>
                <div class="contract-stat">
                    <div class="value"><span class="current">${data.contract.progress}</span><span class="total">%</span></div>
                    <div class="label">总进度</div>
                </div>
            `;
        }
        
        const todoBadge = document.getElementById('todoBadge');
        if (todoBadge) todoBadge.textContent = data.todo.count;
    }
    
    // ... 其他功能函数（完整迁移）
    
    // ==================== 加载状态 ====================
    
    function showPartialLoading() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (!card.querySelector('.partial-loading')) {
                const loading = document.createElement('div');
                loading.className = 'partial-loading show';
                loading.innerHTML = '<div class="loading-spinner"></div>';
                card.style.position = 'relative';
                card.appendChild(loading);
            } else {
                card.querySelector('.partial-loading').classList.add('show');
            }
        });
    }
    
    function hidePartialLoading() {
        document.querySelectorAll('.partial-loading').forEach(loading => {
            loading.classList.remove('show');
        });
    }
    
    // ==================== 事件处理 ====================
    
    function handleLevelDropdownClick() {
        if (!elements.levelOptions || !elements.levelArrow || !elements.pageContent) return;
        
        if (elements.levelOptions.classList.contains('show')) {
            elements.levelOptions.classList.remove('show');
            elements.levelArrow.classList.remove('open');
            elements.pageContent.style.overflow = 'auto';
        } else {
            updateLevelOptions();
            elements.levelOptions.classList.add('show');
            elements.levelArrow.classList.add('open');
            elements.pageContent.style.overflow = 'hidden';
        }
    }
    
    function handleScroll() {
        if (!elements.pageContent) return;
        
        const scrollTop = elements.pageContent.scrollTop;
        
        if (scrollTop > 50) {
            if (state.quickNavExpanded && !state.userManualExpand) {
                if (elements.quickNav) elements.quickNav.classList.add('collapsed');
                if (elements.quickNavToggle) elements.quickNavToggle.classList.add('show');
                state.quickNavExpanded = false;
                const toggleText = document.getElementById('toggleText');
                const toggleArrow = document.getElementById('toggleArrow');
                if (toggleText) toggleText.textContent = '展开快捷入口';
                if (toggleArrow) toggleArrow.classList.remove('expanded');
            }
            if (elements.stickyHeader) elements.stickyHeader.classList.add('with-shadow');
            if (elements.levelSelector) elements.levelSelector.classList.add('sticky');
        } else {
            if (!state.quickNavExpanded) {
                if (elements.quickNav) elements.quickNav.classList.remove('collapsed');
                if (elements.quickNavToggle) elements.quickNavToggle.classList.remove('show');
                state.quickNavExpanded = true;
                const toggleText = document.getElementById('toggleText');
                const toggleArrow = document.getElementById('toggleArrow');
                if (toggleText) toggleText.textContent = '收起快捷入口';
                if (toggleArrow) toggleArrow.classList.add('expanded');
                state.userManualExpand = false;
            }
            if (elements.stickyHeader) elements.stickyHeader.classList.remove('with-shadow');
            if (elements.levelSelector) elements.levelSelector.classList.remove('sticky');
        }
        
        state.lastScrollTop = scrollTop;
    }
    
    // ==================== 事件绑定（使用事件委托） ====================
    
    function bindEvents() {
        // 滚动事件
        if (elements.pageContent) {
            elements.pageContent.addEventListener('scroll', handleScroll);
        }
        
        // 层级选择器点击
        const levelDropdown = document.querySelector('.level-dropdown');
        if (levelDropdown) {
            levelDropdown.addEventListener('click', handleLevelDropdownClick);
        }
        
        // 面包屑点击（事件委托）
        if (elements.breadcrumbInline) {
            elements.breadcrumbInline.addEventListener('click', function(e) {
                const item = e.target.closest('.breadcrumb-item');
                if (item) {
                    const level = item.dataset.level;
                    if (level) navigateToLevel(level);
                }
            });
        }
        
        // 层级选项点击（事件委托）
        if (elements.levelOptions) {
            elements.levelOptions.addEventListener('click', function(e) {
                const option = e.target.closest('.level-option');
                if (option) {
                    const level = option.dataset.level;
                    if (level) selectLevel(level);
                }
            });
        }
        
        // 快捷入口点击（事件委托）
        const quickNav = document.getElementById('quickNav');
        if (quickNav) {
            quickNav.addEventListener('click', function(e) {
                const item = e.target.closest('.quick-nav-item');
                if (item) {
                    const href = item.dataset.href;
                    if (href) location.href = href;
                }
                
                // 固定按钮
                const pinBtn = e.target.closest('.pin-btn');
                if (pinBtn) {
                    e.stopPropagation();
                    togglePinQuickNav();
                }
            });
        }
        
        // 快捷入口展开/收起
        const quickNavToggle = document.getElementById('quickNavToggle');
        if (quickNavToggle) {
            quickNavToggle.addEventListener('click', toggleQuickNav);
        }
        
        // 右上角菜单
        const actionBtn = document.querySelector('.action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', toggleActionMenu);
        }
        
        // 合同列表展开
        const contractMore = document.querySelector('.card-title .more');
        if (contractMore) {
            contractMore.addEventListener('click', function() {
                toggleContractList(this);
            });
        }
        
        // 动态展开
        const activityMoreBtn = document.getElementById('activityMoreBtn');
        if (activityMoreBtn) {
            activityMoreBtn.addEventListener('click', toggleActivityList);
        }
        
        // Toast 关闭
        const modalBtn = document.querySelector('.custom-toast-modal .modal-btn');
        if (modalBtn) {
            modalBtn.addEventListener('click', closeCustomToast);
        }
        
        // 全局点击关闭下拉菜单
        document.addEventListener('click', function(e) {
            const selector = document.querySelector('.level-selector');
            if (selector && !selector.contains(e.target)) {
                if (elements.levelOptions) elements.levelOptions.classList.remove('show');
                if (elements.levelArrow) elements.levelArrow.classList.remove('open');
            }
            
            const actions = document.querySelector('.actions');
            if (actions && !actions.contains(e.target)) {
                if (elements.actionMenu) elements.actionMenu.classList.remove('show');
            }
        });
        
        // 待办事项点击（事件委托）
        const todoContent = document.getElementById('todoContent');
        if (todoContent) {
            todoContent.addEventListener('click', function(e) {
                const item = e.target.closest('.todo-item');
                if (item) {
                    const href = item.dataset.href;
                    if (href) location.href = href;
                }
            });
        }
        
        // 动态列表点击（事件委托）
        if (elements.activityList) {
            elements.activityList.addEventListener('click', function(e) {
                const item = e.target.closest('.activity-item');
                if (item) {
                    const href = item.dataset.href;
                    if (href) location.href = href;
                }
            });
        }
        
        // 合同列表点击（事件委托）
        if (elements.contractList) {
            elements.contractList.addEventListener('click', function(e) {
                const item = e.target.closest('.contract-item');
                if (item) {
                    const href = item.dataset.href;
                    if (href) location.href = href;
                }
            });
        }
    }
    
    // ==================== 其他功能函数 ====================
    
    function updateLevelOptions() {
        if (!elements.levelOptions) return;
        
        const currentData = levelData[state.currentLevel];
        if (!currentData) return;
        
        const currentLevelNum = currentData.level;
        let html = '';
        
        if (currentLevelNum > 0) {
            let parent = currentData.parent;
            while (parent) {
                const parentData = levelData[parent];
                if (parentData) {
                    html = createLevelOption(parent, parentData, false) + html;
                    parent = parentData.parent;
                } else {
                    break;
                }
            }
        }
        
        html += createLevelOption(state.currentLevel, currentData, true);
        
        if (currentData.children && currentData.children.length > 0) {
            currentData.children.forEach(child => {
                const childData = levelData[child];
                if (childData) {
                    html += createLevelOption(child, childData, false);
                }
            });
        }
        
        elements.levelOptions.innerHTML = html;
    }
    
    function createLevelOption(name, data, isSelected) {
        const icon = getLevelIcon(data.type);
        const childrenCount = data.children ? data.children.length : 0;
        let countText = '';
        
        if (data.type === 'project') {
            countText = `${childrenCount}个工作组 · ${data.contract.signed.total}份合同`;
        } else if (data.type === 'workgroup') {
            countText = `${childrenCount}个施工组 · ${data.contract.signed.total}份合同`;
        } else if (data.type === 'team') {
            countText = `${childrenCount}个任务包 · ${data.tasks.total}个任务`;
        }
        
        return `
            <div class="level-option ${isSelected ? 'selected' : ''}" data-level="${name}">
                <div class="icon">${icon}</div>
                <div class="info">
                    <div class="name">${name}</div>
                    <div class="count">${countText}</div>
                </div>
                <div class="check" style="visibility: ${isSelected ? 'visible' : 'hidden'};">✓</div>
            </div>
        `;
    }
    
    function selectLevel(level) {
        if (level === state.currentLevel) {
            handleLevelDropdownClick();
            return;
        }
        
        const data = levelData[level];
        if (!data) {
            console.error('Level data not found:', level);
            return;
        }
        
        if (elements.levelIcon) elements.levelIcon.textContent = getLevelIcon(data.type);
        if (elements.levelText) elements.levelText.textContent = level;
        
        if (elements.levelType) {
            elements.levelType.textContent = data.typeName;
            elements.levelType.className = 'type-badge ' + data.type;
        }
        
        handleLevelDropdownClick();
        showPartialLoading();
        
        setTimeout(() => {
            updatePageData(level);
            updateBreadcrumb(level);
            state.currentLevel = level;
            hidePartialLoading();
        }, 200);
    }
    
    function toggleContractList(element) {
        if (!element) return;
        const arrow = element.querySelector('.arrow');
        const list = document.getElementById('contractList');
        
        if (list) {
            if (list.classList.contains('show')) {
                list.classList.remove('show');
                if (arrow) arrow.classList.remove('expanded');
            } else {
                list.classList.add('show');
                if (arrow) arrow.classList.add('expanded');
            }
        }
    }
    
    function toggleActivityList() {
        const moreText = document.getElementById('activityMoreText');
        const moreArrow = document.getElementById('activityMoreArrow');
        const hiddenItems = document.querySelectorAll('.activity-item.hidden');
        
        if (state.activityExpanded) {
            hiddenItems.forEach(item => item.classList.add('hidden'));
            if (elements.activityList) elements.activityList.classList.remove('expanded');
            if (moreText) moreText.textContent = '展开更多';
            if (moreArrow) moreArrow.classList.remove('expanded');
            state.activityExpanded = false;
        } else {
            document.querySelectorAll('.activity-item').forEach(item => item.classList.remove('hidden'));
            if (elements.activityList) elements.activityList.classList.add('expanded');
            if (moreText) moreText.textContent = '收起';
            if (moreArrow) moreArrow.classList.add('expanded');
            state.activityExpanded = true;
        }
    }
    
    function toggleQuickNav() {
        const toggleText = document.getElementById('toggleText');
        const toggleArrow = document.getElementById('toggleArrow');
        
        if (state.quickNavExpanded) {
            if (elements.quickNav) elements.quickNav.classList.add('collapsed');
            if (toggleText) toggleText.textContent = '展开快捷入口';
            if (toggleArrow) toggleArrow.classList.remove('expanded');
            state.quickNavExpanded = false;
            state.userManualExpand = false;
        } else {
            if (elements.quickNav) elements.quickNav.classList.remove('collapsed');
            if (toggleText) toggleText.textContent = '收起快捷入口';
            if (toggleArrow) toggleArrow.classList.add('expanded');
            state.quickNavExpanded = true;
            state.userManualExpand = true;
        }
    }
    
    function toggleActionMenu() {
        if (elements.actionMenu) {
            elements.actionMenu.classList.toggle('show');
        }
    }
    
    function togglePinQuickNav() {
        if (!elements.quickNav) return;
        
        const pinBtn = document.getElementById('pinBtn');
        
        if (elements.quickNav.classList.contains('pinned')) {
            elements.quickNav.classList.remove('pinned');
            if (pinBtn) pinBtn.textContent = '📌 固定';
            localStorage.setItem('quickNavPinned', 'false');
        } else {
            elements.quickNav.classList.add('pinned');
            if (pinBtn) pinBtn.textContent = '📌 取消固定';
            localStorage.setItem('quickNavPinned', 'true');
        }
    }
    
    function initQuickNavPinState() {
        const isPinned = localStorage.getItem('quickNavPinned') === 'true';
        const pinBtn = document.getElementById('pinBtn');
        
        if (isPinned && elements.quickNav && pinBtn) {
            elements.quickNav.classList.add('pinned');
            pinBtn.textContent = '📌 取消固定';
        }
    }
    
    function initLevelDisplay() {
        const data = levelData[state.currentLevel];
        if (elements.levelType && data) {
            elements.levelType.textContent = data.typeName;
            elements.levelType.className = 'type-badge ' + data.type;
        }
    }
    
    // ==================== 初始化 ====================
    
    function init() {
        cacheElements();
        bindEvents();
        initQuickNavPinState();
        initLevelDisplay();
    }
    
    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 暴露公共方法（供外部调用）
    return {
        showCustomToast: showCustomToast,
        closeCustomToast: closeCustomToast,
        navigateToLevel: navigateToLevel,
        getCurrentLevel: () => state.currentLevel
    };
})();
```

- [ ] **步骤 3：迁移完整的 levelData 数据**

将原文件中的 `levelData` 对象完整迁移到 `js/project-detail.js` 中。

- [ ] **步骤 4：修改 HTML 文件**

修改 `prototype-project-detail.html`：
- 删除 `<script>` 标签及其内容
- 在 `</body>` 前添加：
```html
<script src="js/project-detail.js"></script>
```

- [ ] **步骤 5：修改 HTML 元素，移除内联事件**

将所有 `onclick` 内联事件改为 `data-*` 属性：

```html
<!-- 快捷入口 -->
<div class="quick-nav-item" data-href="prototype-project-info.html">
    <div class="icon info">📋</div>
    <div class="label">项目信息</div>
</div>

<!-- 待办事项 -->
<div class="todo-item" data-href="prototype-task-detail.html">
    ...
</div>

<!-- 动态列表 -->
<div class="activity-item" data-href="prototype-task-detail.html">
    ...
</div>

<!-- 合同列表 -->
<div class="contract-item" data-href="prototype-contract-detail.html?status=draft">
    ...
</div>
```

- [ ] **步骤 6：验证页面功能正常**

在浏览器中打开页面，测试以下功能：
1. 层级切换
2. 快捷入口点击跳转
3. 待办事项点击跳转
4. 动态展开/收起
5. 合同列表展开/收起
6. 快捷入口固定/取消固定
7. 右上角菜单

---

### 任务 3：验证和清理

**文件：**
- 验证：`prototype-project-detail.html`
- 验证：`css/project-detail.css`
- 验证：`js/project-detail.js`

- [ ] **步骤 1：完整功能测试**

测试清单：
- [ ] 页面加载正常，样式无缺失
- [ ] 层级选择器展开/收起
- [ ] 层级切换数据更新
- [ ] 面包屑导航
- [ ] 快捷入口跳转
- [ ] 快捷入口固定/取消固定
- [ ] 快捷入口滚动自动收起
- [ ] 合同概览展开/收起
- [ ] 今日动态展开/收起
- [ ] 任务统计数据正确
- [ ] 待办事项点击跳转
- [ ] 右上角菜单展开/收起
- [ ] Toast 提示正常显示

- [ ] **步骤 2：代码格式检查**

确保代码格式规范，无语法错误。

- [ ] **步骤 3：提交代码**

```bash
git add prototype-project-detail.html css/project-detail.css js/project-detail.js
git commit -m "refactor(项目详情): 重构代码结构，拆分 CSS/JS，模块化封装 JavaScript"
```

---

## 注意事项

1. **保持功能不变**：所有重构必须确保现有交互逻辑完全一致
2. **渐进式重构**：每个任务独立完成，可单独验证
3. **错误处理**：所有数据访问前添加空值检查
4. **事件委托**：使用 `data-*` 属性和事件委托替代内联事件
5. **CSS 变量**：统一管理魔术数字，便于后续维护
