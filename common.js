/**
 * common.js - 家装平台小程序原型 · 公共脚本
 * 适用于所有 prototype-*.html 页面
 */

(function() {
    'use strict';

    // 初始化导航收起/展开功能
    function initPageNav() {
        const pageNav = document.querySelector('.page-nav');
        if (!pageNav) return;

        // 检查是否已经初始化
        if (pageNav.querySelector('.page-nav-toggle')) return;

        // 获取第一个标题作为主标题
        const firstTitle = pageNav.querySelector('.page-nav-title');
        const titleText = firstTitle ? firstTitle.textContent : '导航';

        // 创建toggle容器
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'page-nav-toggle';
        toggleContainer.innerHTML = `
            <span class="page-nav-toggle-title">${titleText}</span>
            <span class="page-nav-toggle-icon">◀</span>
        `;

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'page-nav-content';

        // 获取所有子节点（包括文本节点、元素节点等）
        const childNodes = Array.from(pageNav.childNodes);

        // 将所有内容移动到内容容器中
        childNodes.forEach(node => {
            // 跳过空白文本节点
            if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                return;
            }
            contentContainer.appendChild(node);
        });

        // 清空导航面板并添加新结构
        pageNav.innerHTML = '';
        pageNav.appendChild(toggleContainer);
        pageNav.appendChild(contentContainer);

        // 绑定点击事件
        toggleContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            pageNav.classList.toggle('collapsed');
            
            // 保存状态到localStorage
            const isCollapsed = pageNav.classList.contains('collapsed');
            localStorage.setItem('pageNavCollapsed', isCollapsed);
        });

        // 恢复之前的收起状态
        const savedState = localStorage.getItem('pageNavCollapsed');
        if (savedState === 'true') {
            pageNav.classList.add('collapsed');
        }
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageNav);
    } else {
        initPageNav();
    }

    // 暴露到全局（如果需要手动调用）
    window.initPageNav = initPageNav;

})();
