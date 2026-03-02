/**
 * AI算力管理平台 - 交互逻辑层
 * 包含页面渲染、事件处理、图表初始化等
 */

// 全局变量
let currentPage = 'my-computing';
let charts = {};
let quotaSubPage = 'apply'; // 'apply' | 'approve' | 'batch'

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    initDataModels();
    initNavigation();
    initModals();
    initRoleToggle();
    updateUIBasedOnRole();
    renderCurrentPage();
});

// ==================== 导航系统 ====================

function initNavigation() {
    // 导航项点击
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    // 折叠菜单切换
    document.querySelectorAll('.nav-group-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const group = this.closest('.nav-group');
            group.classList.toggle('open');
        });
    });
}

function navigateTo(page) {
    currentPage = page;
    updateNavActive();
    updatePageTitle();
    renderCurrentPage();
}

function updateNavActive() {
    // 移除所有active状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // 添加当前页面active状态
    const activeItem = document.querySelector(`.nav-item[data-page="${currentPage}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    // 处理子菜单激活状态
    if (currentPage.startsWith('quota')) {
        document.querySelector('.nav-group')?.classList.add('open');
    }
}

function updatePageTitle() {
    const titles = {
        'my-computing': '我的算力',
        'quota': '额度管理',
        'dashboard': '运营看板',
        'projects': '项目管理',
        'models': '模型管理',
        'logs': '使用日志'
    };
    document.getElementById('pageTitle').textContent = titles[currentPage] || 'AI算力管理平台';
}

function renderCurrentPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '';

    // 销毁现有图表
    Object.values(charts).forEach(chart => chart?.destroy());
    charts = {};

    switch(currentPage) {
        case 'my-computing':
            renderMyComputing(mainContent);
            break;
        case 'quota':
            renderQuota(mainContent);
            break;
        case 'dashboard':
            renderDashboard(mainContent);
            break;
        case 'projects':
            renderProjects(mainContent);
            break;
        case 'models':
            renderModelManagement(mainContent);
            break;
        case 'logs':
            renderUseLogs(mainContent);
            break;
    }

    // 添加页面进入动画
    mainContent.classList.add('page-enter');
    setTimeout(() => mainContent.classList.remove('page-enter'), 300);
}

// ==================== 我的算力页面 ====================

function renderMyComputing(container) {
    const remaining = currentUser.quota - currentUser.used;
    const usageRate = calculateUsageRate(currentUser.used, currentUser.quota);
    const status = getUsageStatus(usageRate);

    container.innerHTML = `
        <!-- 三个卡片并列 -->
        <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- 额度卡片（合并额度概览+剩余额度） -->
            <div class="card">
                <div class="card-body">
                    <!-- 剩余额度突出显示 -->
                    <div class="text-center mb-6">
                        <div class="text-sm text-slate-500 mb-2">剩余额度</div>
                        <div class="text-5xl font-bold ${status === 'danger' ? 'text-error' : status === 'warning' ? 'text-warning' : 'text-success'}">${formatNumber(remaining)}</div>
                        <div class="text-sm text-slate-400">Token</div>
                    </div>
                    <!-- 进度条显示总Token和已使用 -->
                    <div class="mb-4">
                        <div class="progress-bar h-4">
                            <div class="progress-fill ${status}" style="width: ${usageRate}%"></div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div>
                            <span class="text-slate-500">总Token: </span>
                            <span class="font-medium">${formatNumber(currentUser.quota)}</span>
                        </div>
                        <div>
                            <span class="text-slate-500">已使用: </span>
                            <span class="font-medium text-primary-600">${formatNumber(currentUser.used)}</span>
                            <span class="text-slate-400"> (${usageRate}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 项目挂靠卡片 -->
            <div class="card">
                <div class="card-header flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-600">项目挂靠</span>
                    <button class="btn btn-sm btn-ghost" onclick="showProjectHistory()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </button>
                </div>
                <div class="card-body">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-800">${currentUser.project}</h3>
                            <p class="text-sm text-slate-500">已挂靠 ${getDaysDiff(currentUser.projectStartDate, new Date().toISOString())} 天</p>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm w-full" onclick="showSwitchProjectModal()">
                        切换项目
                    </button>
                </div>
            </div>
        </div>

        <!-- 令牌管理表格 -->
        <div class="card">
            <div class="card-header flex items-center justify-between">
                <span>令牌管理</span>
                <button class="btn btn-primary btn-sm" onclick="showCreateTokenModal()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    新建令牌
                </button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>令牌名称</th>
                            <th>状态</th>
                            <th>已用额度</th>
                            <th>剩余额度</th>
                            <th>秘钥</th>
                            <th>可用模型</th>
                            <th>创建时间</th>
                            <th>过期时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="tokenTableBody">
                        ${renderTokenTable()}
                    </tbody>
                </table>
            </div>
        </div>
    `;

}

function renderTokenTable() {
    return tokens.map(token => {
        const status = getTokenStatus(token);
        const remaining = token.quota - token.used;
        const isDisabled = token.status === 'revoked';
        return `
            <tr class="${isDisabled ? 'opacity-50' : ''}">
                <td class="font-medium">${token.name}</td>
                <td>
                    <span class="badge ${status.class}">${status.text}</span>
                </td>
                <td>${formatNumber(token.used)}</td>
                <td>${formatNumber(remaining)}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm text-slate-500">${token.key.substring(0, 12)}...</span>
                        <button class="btn btn-sm btn-ghost" onclick="copyToClipboard('${token.key}', '秘钥')">复制</button>
                    </div>
                </td>
                <td>${token.availableModels}</td>
                <td>${formatDate(token.createdAt)}</td>
                <td>${formatDate(token.expiresAt)}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-sm btn-ghost" onclick="editToken('${token.id}')">编辑</button>
                        <button class="btn btn-sm btn-ghost" onclick="toggleTokenStatus('${token.id}')">${isDisabled ? '启用' : '禁用'}</button>
                        <button class="btn btn-sm btn-ghost text-error" onclick="deleteToken('${token.id}')">删除</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== 额度管理页面（包含三个tab） ====================

function renderQuota(container) {
    container.innerHTML = `
        <!-- Tab页签 -->
        <div class="tabs mb-6">
            <button class="tab ${quotaSubPage === 'apply' ? 'active' : ''}" data-tab="apply" onclick="switchQuotaTab('apply')">我的申请</button>
            <button class="tab ${quotaSubPage === 'approve' ? 'active' : ''}" data-tab="approve" onclick="switchQuotaTab('approve')">配额审批</button>
            <button class="tab ${quotaSubPage === 'batch' ? 'active' : ''}" data-tab="batch" onclick="switchQuotaTab('batch')">批量管理</button>
        </div>

        <!-- 内容区域 -->
        <div id="quotaContent"></div>
    `;

    // 渲染当前tab的内容
    renderQuotaContent();
}

function switchQuotaTab(tab) {
    quotaSubPage = tab;
    renderQuotaContent();

    // 更新tab激活状态
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tabs .tab[data-tab="${tab}"]`).classList.add('active');
}

function renderQuotaContent() {
    const content = document.getElementById('quotaContent');
    switch(quotaSubPage) {
        case 'apply':
            renderQuotaManage(content);
            break;
        case 'approve':
            renderQuotaRequests(content);
            break;
        case 'batch':
            renderUserManagement(content);
            break;
    }
}

// ==================== 额度申请页面 ====================

function renderQuotaManage(container) {
    const myRequests = quotaRequests.filter(r => r.userId === currentUser.id);

    container.innerHTML = `
        <div class="card">
            <div class="card-header flex items-center justify-between">
                <span>我的申请记录</span>
                <button class="btn btn-primary btn-sm" onclick="showApplyQuotaModal()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    申请额度
                </button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>申请时间</th>
                            <th>申请额度</th>
                            <th>申请原因</th>
                            <th>状态</th>
                            <th>处理时间</th>
                            <th>处理备注</th>
                            <th>审批链接</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myRequests.length > 0 ? myRequests.map(req => {
                            const approvalLink = `https://ai-management.example.com/approve?id=${req.id}&token=${btoa(req.id)}`;
                            return `
                                <tr>
                                    <td>${formatDate(req.createdAt)}</td>
                                    <td>${formatNumber(req.amount)} Token</td>
                                    <td>${req.reason}</td>
                                    <td>
                                        <span class="badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-error' : 'badge-warning'}">
                                            ${req.status === 'approved' ? '已批准' : req.status === 'rejected' ? '已拒绝' : '待审批'}
                                        </span>
                                    </td>
                                    <td>${req.processedAt ? formatDate(req.processedAt) : '-'}</td>
                                    <td>${req.rejectReason || '-'}</td>
                                    <td>
                                        ${req.status === 'pending' ? `
                                            <button class="btn btn-sm btn-ghost" onclick="copyApprovalLink('${approvalLink}', '${req.id}')">
                                                复制链接
                                            </button>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `;
                        }).join('') : `
                            <tr>
                                <td colspan="7" class="text-center py-8 text-slate-400">暂无申请记录</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function copyApprovalLink(link, reqId) {
    copyToClipboard(link, '审批链接');
}

// ==================== 配额审批页面 ====================

function renderQuotaRequests(container) {
    const pendingRequests = quotaRequests.filter(r => r.status === 'pending');

    container.innerHTML = `
        <div class="card">
            <div class="card-header flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span>待审批申请</span>
                    <span class="badge badge-warning">${pendingRequests.length} 条待审批</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="btn btn-sm btn-success" onclick="batchApprove()" id="batchApproveBtn" style="display: none;">
                        批量批准
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="batchReject()" id="batchRejectBtn" style="display: none;">
                        批量拒绝
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">
                                <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll()">
                            </th>
                            <th>申请人</th>
                            <th>申请时间</th>
                            <th>申请额度</th>
                            <th>申请原因</th>
                            <th>当前额度</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingRequests.length > 0 ? pendingRequests.map(req => {
                            const user = USERS.find(u => u.id === req.userId);
                            return `
                                <tr>
                                    <td>
                                        <input type="checkbox" class="request-checkbox" value="${req.id}" onchange="updateBatchButtons()">
                                    </td>
                                    <td class="font-medium">${req.userName}</td>
                                    <td>${formatDate(req.createdAt)}</td>
                                    <td>${formatNumber(req.amount)} Token</td>
                                    <td>${req.reason}</td>
                                    <td>${user ? formatNumber(user.quota) : '-'}</td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <button class="btn btn-sm btn-success" onclick="approveRequest('${req.id}')">批准</button>
                                            <button class="btn btn-sm btn-danger" onclick="rejectRequest('${req.id}')">拒绝</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('') : `
                            <tr>
                                <td colspan="7" class="text-center py-8 text-slate-400">暂无待审批申请</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card mt-6">
            <div class="card-header">已处理记录</div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>申请人</th>
                            <th>申请时间</th>
                            <th>申请额度</th>
                            <th>状态</th>
                            <th>处理时间</th>
                            <th>处理人</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotaRequests.filter(r => r.status !== 'pending').map(req => `
                            <tr>
                                <td class="font-medium">${req.userName}</td>
                                <td>${formatDate(req.createdAt)}</td>
                                <td>${formatNumber(req.amount)} Token</td>
                                <td>
                                    <span class="badge ${req.status === 'approved' ? 'badge-success' : 'badge-error'}">
                                        ${req.status === 'approved' ? '已批准' : '已拒绝'}
                                    </span>
                                </td>
                                <td>${req.processedAt ? formatDate(req.processedAt) : '-'}</td>
                                <td>${req.processedBy || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== 用户额度管理页面 ====================

function renderUserManagement(container) {
    container.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <button class="btn btn-secondary" onclick="importUsers()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    批量导入
                </button>
                <button class="btn btn-secondary" onclick="exportUsers()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    批量导出
                </button>
            </div>
            <button class="btn btn-primary" onclick="showAddUserModal()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                添加用户
            </button>
        </div>

        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>用户姓名</th>
                            <th>所属部门</th>
                            <th>所属项目</th>
                            <th>剩余额度</th>
                            <th>已用额度</th>
                            <th>总额度</th>
                            <th>使用率</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${USERS.map(user => {
                            const remaining = user.quota - user.used;
                            const rate = calculateUsageRate(user.used, user.quota);
                            const status = getUsageStatus(rate);
                            return `
                                <tr>
                                    <td class="font-medium">${user.name}</td>
                                    <td>${user.department}</td>
                                    <td>${user.project || '-'}</td>
                                    <td>${formatNumber(remaining)}</td>
                                    <td>${formatNumber(user.used)}</td>
                                    <td>${formatNumber(user.quota)}</td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <div class="progress-bar w-20">
                                                <div class="progress-fill ${status}" style="width: ${rate}%"></div>
                                            </div>
                                            <span class="text-sm">${rate}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge ${status === 'danger' ? 'badge-error' : status === 'warning' ? 'badge-warning' : 'badge-success'}">
                                            ${status === 'danger' ? '已耗尽' : status === 'warning' ? '即将耗尽' : '正常'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <button class="btn btn-sm btn-secondary" onclick="editUserQuota('${user.id}')">编辑</button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">删除</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== 运营看板页面 ====================

let dashboardTab = 'person';
let dashboardView = 'overview'; // 'overview' 或 'detail'
let dashboardTimeRange = '30';
let customDateRange = { start: '', end: '' };
let detailPage = 1;
let detailPageSize = 10;
let logsPage = 1;
let logsPageSize = 10;
let modelVendorFilter = '';
let modelChartView = 'usage'; // 'usage' or 'requests'
let modelDisplayMode = 'distribution'; // 'distribution' or 'trend'
let dashboardProjectFilter = '';
let dashboardModelFilter = '';
let dashboardPersonFilter = '';

function renderDashboard(container) {
    if (dashboardView === 'detail') {
        container.innerHTML = renderDashboardDetail();
        return;
    }

    // 根据时间范围获取核心指标数据
    const overview = getDashboardOverview(dashboardTimeRange, customDateRange);

    container.innerHTML = `
        <!-- 看板切换 -->
        <div class="flex items-center justify-between mb-6">
            <div class="tabs">
                <button class="tab ${dashboardView === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchDashboardTab('overview')">算力使用全景看板</button>
                <button class="tab ${dashboardView === 'detail' ? 'active' : ''}" data-tab="detail" onclick="switchDashboardTab('detail')">用户算力使用明细</button>
            </div>
            <div class="flex items-center gap-4">
                <!-- 项目筛选 -->
                <select class="filter-select text-sm" id="dashboardProjectFilter" onchange="setDashboardFilter('project', this.value)">
                    <option value="">全部项目</option>
                    ${projectUsage.map(p => `<option value="${p.name}" ${dashboardProjectFilter === p.name ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
                <!-- 模型筛选 -->
                <select class="filter-select text-sm" id="dashboardModelFilter" onchange="setDashboardFilter('model', this.value)">
                    <option value="">全部模型</option>
                    ${modelDistribution.map(m => `<option value="${m.model}" ${dashboardModelFilter === m.model ? 'selected' : ''}>${m.model}</option>`).join('')}
                </select>
                <!-- 人员筛选 -->
                <select class="filter-select text-sm" id="dashboardPersonFilter" onchange="setDashboardFilter('person', this.value)">
                    <option value="">全部人员</option>
                    ${userUsage.map(u => `<option value="${u.name}" ${dashboardPersonFilter === u.name ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
                <!-- 时间筛选 -->
                <div class="flex items-center gap-1">
                    <input type="date" class="input text-sm py-1" id="customStartDate" value="${customDateRange.start || ''}" onchange="updateCustomDateRange()">
                    <span class="text-slate-400">至</span>
                    <input type="date" class="input text-sm py-1" id="customEndDate" value="${customDateRange.end || ''}" onchange="updateCustomDateRange()">
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-sm ${dashboardTimeRange === '1' ? 'btn-primary' : 'btn-secondary'}" onclick="setQuickRange(1)">近1个月</button>
                    <button class="btn btn-sm ${dashboardTimeRange === '3' ? 'btn-primary' : 'btn-secondary'}" onclick="setQuickRange(3)">近3个月</button>
                    <button class="btn btn-sm ${dashboardTimeRange === '6' ? 'btn-primary' : 'btn-secondary'}" onclick="setQuickRange(6)">近6个月</button>
                </div>
            </div>
        </div>

        <!-- 核心指标 -->
        <div class="grid grid-cols-5 gap-4 mb-6">
            <div class="metric-card">
                <div class="metric-label">总Token使用量</div>
                <div class="metric-value text-lg">${formatNumber(overview.totalUsage)}</div>
                <div class="metric-change positive">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                    </svg>
                    ${overview.usageChange}%
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">总请求次数</div>
                <div class="metric-value text-lg">${formatNumber(overview.totalRequests)}</div>
                <div class="metric-change positive">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                    </svg>
                    ${overview.requestsChange}%
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">活跃用户数</div>
                <div class="metric-value text-lg">${overview.activeUsers}</div>
                <div class="metric-change positive">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                    </svg>
                    ${overview.usersChange}%
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">TOP1使用项目</div>
                <div class="metric-value text-lg">${overview.topProject.name}</div>
                <div class="text-xs text-slate-500">占比 ${overview.topProject.percentage}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">TOP1使用模型</div>
                <div class="metric-value text-lg">${overview.topModel.name}</div>
                <div class="text-xs text-slate-500">占比 ${overview.topModel.percentage}%</div>
            </div>
        </div>

        <!-- 综合看板（所有维度合并） -->
        <div id="dashboardContent">
            ${renderIntegratedDashboard()}
        </div>
    `;

    // 初始化综合看板的图表
    setTimeout(() => initIntegratedDashboardCharts(), 0);
}

function renderDashboardContent() {
    switch(dashboardTab) {
        case 'person':
            return renderPersonDashboard();
        case 'department':
            return renderDepartmentDashboard();
        case 'model':
            return renderModelDashboard();
        case 'project':
            return renderProjectDashboard();
        default:
            return '';
    }
}

function renderPersonDashboard() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div class="card">
                <div class="card-header">人员Token使用排行 (TOP10)</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="personRankChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">使用明细</div>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>姓名</th>
                                <th>所属部门</th>
                                <th>所属项目</th>
                                <th>Token使用量</th>
                                <th>占比</th>
                                <th>环比变化</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userUsage.map(u => `
                                <tr>
                                    <td>${u.rank}</td>
                                    <td>${u.name}</td>
                                    <td>${u.department}</td>
                                    <td>${u.project}</td>
                                    <td>${formatNumber(u.usage)}</td>
                                    <td>${u.percentage}%</td>
                                    <td>
                                        <span class="${u.change >= 0 ? 'text-success' : 'text-error'}">
                                            ${u.change >= 0 ? '+' : ''}${u.change}%
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderDepartmentDashboard() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div class="card">
                <div class="card-header">部门Token使用排行 (TOP10)</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="deptRankChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">使用明细</div>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>部门名称</th>
                                <th>Token使用量</th>
                                <th>占比</th>
                                <th>环比变化</th>
                                <th>活跃用户数</th>
                                <th>人均使用量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${departmentUsage.map((d, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${d.name}</td>
                                    <td>${formatNumber(d.usage)}</td>
                                    <td>${d.percentage}%</td>
                                    <td>
                                        <span class="${d.change >= 0 ? 'text-success' : 'text-error'}">
                                            ${d.change >= 0 ? '+' : ''}${d.change}%
                                        </span>
                                    </td>
                                    <td>${d.users}</td>
                                    <td>${formatNumber(Math.round(d.usage / d.users))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderModelDashboard() {
    return `
        <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="card">
                <div class="card-header">模型Token消耗统计</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="modelUsageChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">模型请求次数统计</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="modelReqChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">使用明细</div>
            <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>模型名称</th>
                            <th>Token使用量</th>
                            <th>占比</th>
                            <th>调用次数</th>
                            <th>平均响应时长</th>
                            <th>环比变化</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${modelUsage.map((m, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${m.name}</td>
                                <td>${formatNumber(m.usage)}</td>
                                <td>${m.percentage}%</td>
                                <td>${formatNumber(m.requests)}</td>
                                <td>${m.avgResponseTime}s</td>
                                <td>
                                    <span class="${m.change >= 0 ? 'text-success' : 'text-error'}">
                                        ${m.change >= 0 ? '+' : ''}${m.change}%
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== 综合看板（合并所有维度） ====================

function renderIntegratedDashboard() {
    return `
        <!-- 按人员统计 -->
        <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="card">
                <div class="card-header">人员Token使用排行 (TOP10)</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="personRankChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header flex items-center justify-between">
                    <span>人员Token使用明细</span>
                    <button class="btn btn-sm btn-ghost" onclick="exportPersonUsageDetail()" title="导出">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                    </button>
                </div>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>姓名</th>
                                <th>部门</th>
                                <th>所属项目</th>
                                <th>Token使用量</th>
                                <th>占比</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userUsage.slice(0, 10).map((u, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${u.name}</td>
                                    <td>${u.department}</td>
                                    <td>${u.project || '-'}</td>
                                    <td>${formatNumber(u.usage)}</td>
                                    <td>${u.percentage}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 按项目统计 -->
        <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="card">
                <div class="card-header">项目Token使用排行 (TOP10)</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="projRankChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header flex items-center justify-between">
                    <span>项目Token使用明细</span>
                    <button class="btn btn-sm btn-ghost" onclick="exportProjectUsageDetail()" title="导出">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                    </button>
                </div>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>项目名称</th>
                                <th>Token使用量</th>
                                <th>占比</th>
                                <th>活跃用户数</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${projectUsage.slice(0, 10).map((p, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${p.name}</td>
                                    <td>${formatNumber(p.usage)}</td>
                                    <td>${p.percentage}%</td>
                                    <td>${p.users}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 按模型统计 -->
        <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="card">
                <div class="card-header flex items-center justify-between">
                    <span>模型使用统计</span>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-sm ${modelDisplayMode === 'distribution' ? 'btn-primary' : 'btn-secondary'}" onclick="switchModelDisplayMode('distribution')">分布</button>
                        <button class="btn btn-sm ${modelDisplayMode === 'trend' ? 'btn-primary' : 'btn-secondary'}" onclick="switchModelDisplayMode('trend')">趋势</button>
                        <span class="text-slate-300">|</span>
                        <button class="btn btn-sm ${modelChartView === 'usage' ? 'btn-primary' : 'btn-secondary'}" onclick="switchModelChartView('usage')">Token</button>
                        <button class="btn btn-sm ${modelChartView === 'requests' ? 'btn-primary' : 'btn-secondary'}" onclick="switchModelChartView('requests')">次数</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="modelChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header flex items-center justify-between">
                    <span>模型使用明细</span>
                    <button class="btn btn-sm btn-ghost" onclick="exportModelUsageDetail()" title="导出">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                    </button>
                </div>
                <div class="table-container" style="max-height: 340px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>模型名称</th>
                                <th>模型厂商</th>
                                <th>Token使用量</th>
                                <th>占比</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${modelDistribution.slice(0, 10).map((m, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${m.model}</td>
                                    <td>${m.vendor || '-'}</td>
                                    <td>${formatNumber(m.usage)}</td>
                                    <td>${m.percentage}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function initIntegratedDashboardCharts() {
    const chartColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#1e40af'];

    // 人员排行图表
    const personCtx = document.getElementById('personRankChart');
    if (personCtx) {
        charts.personRank = new Chart(personCtx, {
            type: 'bar',
            data: {
                labels: userUsage.slice(0, 10).map(u => u.name),
                datasets: [{
                    label: 'Token使用量',
                    data: userUsage.slice(0, 10).map(u => u.usage),
                    backgroundColor: chartColors[0],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    }

    // 项目排行图表
    const projCtx = document.getElementById('projRankChart');
    if (projCtx) {
        charts.projRank = new Chart(projCtx, {
            type: 'bar',
            data: {
                labels: projectUsage.slice(0, 10).map(p => p.name),
                datasets: [{
                    label: 'Token使用量',
                    data: projectUsage.slice(0, 10).map(p => p.usage),
                    backgroundColor: chartColors[1],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    }

    // 模型统一图表（支持切换）
    initModelChart();
}

function initModelChart() {
    const ctx = document.getElementById('modelChart');
    if (!ctx) return;

    const chartColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8'];

    if (charts.modelChart) {
        charts.modelChart.destroy();
    }

    // 趋势模式
    if (modelDisplayMode === 'trend') {
        const trendData = modelChartView === 'usage' ? modelTrendData.usage : modelTrendData.requests;
        const yLabel = modelChartView === 'usage' ? 'Token使用量' : '请求次数';

        charts.modelChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: modelTrendData.labels,
                datasets: trendData.map((ds, i) => ({
                    label: ds.model,
                    data: ds.data,
                    borderColor: chartColors[i],
                    backgroundColor: chartColors[i] + '20',
                    fill: false,
                    tension: 0.4
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 10 } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: yLabel }
                    }
                }
            }
        });
        return;
    }

    // 分布模式
    const isUsage = modelChartView === 'usage';

    if (isUsage) {
        // Token消耗 - 饼图
        charts.modelChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: modelDistribution.map(m => m.model),
                datasets: [{
                    data: modelDistribution.map(m => m.usage),
                    backgroundColor: chartColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, padding: 15 } }
                }
            }
        });
    } else {
        // 请求次数 - 柱状图
        charts.modelChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: modelDistribution.map(m => m.model),
                datasets: [{
                    label: '请求次数',
                    data: modelDistribution.map(m => m.requests),
                    backgroundColor: chartColors[0],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function switchModelChartView(view) {
    modelChartView = view;
    initModelChart();
    renderCurrentPage();
}

function switchModelDisplayMode(mode) {
    modelDisplayMode = mode;
    initModelChart();
    renderCurrentPage();
}

function renderProjectDashboard() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div class="card">
                <div class="card-header">项目Token使用排行 (TOP10)</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="projRankChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">使用明细</div>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>项目名称</th>
                                <th>Token使用量</th>
                                <th>占比</th>
                                <th>环比变化</th>
                                <th>活跃用户数</th>
                                <th>人均使用量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${projectUsage.map((p, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${p.name}</td>
                                    <td>${formatNumber(p.usage)}</td>
                                    <td>${p.percentage}%</td>
                                    <td>
                                        <span class="${p.change >= 0 ? 'text-success' : 'text-error'}">
                                            ${p.change >= 0 ? '+' : ''}${p.change}%
                                        </span>
                                    </td>
                                    <td>${p.users}</td>
                                    <td>${formatNumber(Math.round(p.usage / p.users))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 项目算力使用明细
function renderDashboardDetail() {
    // 获取筛选后的数据（当前默认显示全部用户）
    const currentData = userUsage;
    const totalItems = currentData.length;
    const totalPages = Math.ceil(totalItems / detailPageSize);
    const startIndex = (detailPage - 1) * detailPageSize;
    const endIndex = Math.min(startIndex + detailPageSize, totalItems);
    const paginatedData = currentData.slice(startIndex, endIndex);

    return `
        <!-- 标题和筛选器 -->
        <div class="flex items-center justify-between mb-6">
            <div class="tabs">
                <button class="tab ${dashboardView === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchDashboardTab('overview')">算力使用全景看板</button>
                <button class="tab ${dashboardView === 'detail' ? 'active' : ''}" data-tab="detail" onclick="switchDashboardTab('detail')">项目算力使用明细</button>
            </div>
            <div class="flex items-center gap-4">
                <!-- 项目筛选器 -->
                <div class="flex items-center gap-2">
                    <span class="text-sm text-slate-500">项目:</span>
                    <select class="filter-select text-sm" id="detailProjectFilter" onchange="filterDetailByProject(this.value)">
                        <option value="">全部项目</option>
                        ${projectUsage.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                    </select>
                </div>
                <!-- 时间筛选器 -->
                <div class="flex items-center gap-1">
                    <input type="date" class="input text-sm py-1" id="detailStartDate" value="${customDateRange.start || ''}" onchange="updateDetailDateRange()">
                    <span class="text-slate-400">至</span>
                    <input type="date" class="input text-sm py-1" id="detailEndDate" value="${customDateRange.end || ''}" onchange="updateDetailDateRange()">
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-sm ${dashboardTimeRange === '1' ? 'btn-primary' : 'btn-secondary'}" onclick="setDetailQuickRange(1)">近1个月</button>
                    <button class="btn btn-sm ${dashboardTimeRange === '3' ? 'btn-primary' : 'btn-secondary'}" onclick="setDetailQuickRange(3)">近3个月</button>
                    <button class="btn btn-sm ${dashboardTimeRange === '6' ? 'btn-primary' : 'btn-secondary'}" onclick="setDetailQuickRange(6)">近6个月</button>
                </div>
            </div>
        </div>

        <!-- 用户使用明细 -->
        <div class="card">
            <div class="card-header flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span>用户算力使用明细</span>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="exportUserUsageDetail()">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    导出
                </button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>姓名</th>
                            <th>所属部门</th>
                            <th>所属项目</th>
                            <th>Token使用量</th>
                            <th>占比</th>
                            <th>环比变化</th>
                        </tr>
                    </thead>
                    <tbody id="detailTableBody">
                        ${renderDetailTable(paginatedData, startIndex + 1)}
                    </tbody>
                </table>
            </div>
            <!-- 分页 -->
            <div class="card-body flex items-center justify-between">
                <div class="text-sm text-slate-500">
                    显示 ${startIndex + 1}-${endIndex} 条，共 ${totalItems} 条
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-sm btn-secondary ${detailPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                        onclick="changeDetailPage(${detailPage - 1})" ${detailPage === 1 ? 'disabled' : ''}>
                        上一页
                    </button>
                    ${renderDetailPagination(totalPages)}
                    <button class="btn btn-sm btn-secondary ${detailPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                        onclick="changeDetailPage(${detailPage + 1})" ${detailPage === totalPages ? 'disabled' : ''}>
                        下一页
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderDetailPagination(totalPages) {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }
    return pages.map(page => `
        <button class="btn btn-sm ${detailPage === page ? 'btn-primary' : 'btn-secondary'}" onclick="changeDetailPage(${page})">
            ${page}
        </button>
    `).join('');
}

function changeDetailPage(page) {
    const totalPages = Math.ceil(userUsage.length / detailPageSize);
    if (page < 1 || page > totalPages) return;
    detailPage = page;
    renderCurrentPage();
}

function renderDetailTable(data, startIndex = 1) {
    // 判断是用户数据还是项目数据
    const isUserData = data[0] && 'department' in data[0];
    return data.map((item, i) => `
        <tr>
            <td>${item.rank || startIndex + i}</td>
            <td class="font-medium">${item.name}</td>
            <td>${isUserData ? item.department : '-'}</td>
            <td>${isUserData ? item.project : item.name}</td>
            <td>${formatNumber(item.usage)}</td>
            <td>${item.percentage}%</td>
            <td>
                <span class="${item.change >= 0 ? 'text-success' : 'text-error'}">
                    ${item.change >= 0 ? '+' : ''}${item.change}%
                </span>
            </td>
        </tr>
    `).join('');
}

function filterDetailByProject(projectName) {
    detailPage = 1; // 重置到第一页
    renderCurrentPage();
}

function updateDetailDateRange() {
    const startDate = document.getElementById('detailStartDate').value;
    const endDate = document.getElementById('detailEndDate').value;

    if (startDate && endDate) {
        customDateRange = { start: startDate, end: endDate };
        dashboardTimeRange = 'custom';
        detailPage = 1; // 重置到第一页
        showToast('info', '时间范围已切换', `${startDate} 至 ${endDate}`);
        renderCurrentPage();
    }
}

function setDetailQuickRange(months) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    customDateRange = {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
    dashboardTimeRange = String(months);
    detailPage = 1; // 重置到第一页
    showToast('info', '时间范围已切换', `近${months}个月`);
    renderCurrentPage();
}

// 导出用户算力使用明细
function exportUserUsageDetail() {
    // 获取当前筛选后的数据（所有数据，非分页）
    const data = userUsage;

    // 表头
    const headers = ['排名', '姓名', '所属部门', '所属项目', 'Token使用量', '占比', '环比变化'];

    // 数据行
    const rows = data.map(item => [
        item.rank || '-',
        item.name,
        item.department,
        item.project,
        item.usage,
        item.percentage + '%',
        (item.change >= 0 ? '+' : '') + item.change + '%'
    ]);

    // 合并所有数据
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // 设置文件名（包含日期）
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `用户算力使用明细_${date}.csv`);
    link.style.visibility = 'hidden';

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', '导出成功', `已导出 ${data.length} 条数据`);
}

// 导出人员Token使用明细
function exportPersonUsageDetail() {
    const data = userUsage;
    const headers = ['排名', '姓名', '部门', '所属项目', 'Token使用量', '占比'];
    const rows = data.map((item, i) => [
        i + 1,
        item.name,
        item.department,
        item.project || '-',
        item.usage,
        item.percentage + '%'
    ]);
    exportToCSV(headers, rows, '人员Token使用明细');
}

// 导出项目Token使用明细
function exportProjectUsageDetail() {
    const data = projectUsage;
    const headers = ['排名', '项目名称', 'Token使用量', '占比', '活跃用户数'];
    const rows = data.map((item, i) => [
        i + 1,
        item.name,
        item.usage,
        item.percentage + '%',
        item.users
    ]);
    exportToCSV(headers, rows, '项目Token使用明细');
}

// 导出模型使用明细
function exportModelUsageDetail() {
    const data = modelDistribution;
    const headers = ['排名', '模型名称', '模型厂商', 'Token使用量', '占比'];
    const rows = data.map((item, i) => [
        i + 1,
        item.model,
        item.vendor || '-',
        item.usage,
        item.percentage + '%'
    ]);
    exportToCSV(headers, rows, '模型使用明细');
}

// 通用导出函数
function exportToCSV(headers, rows, filename) {
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${date}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', '导出成功', `已导出 ${rows.length} 条数据`);
}

function showProjectDetail(projectName) {
    const project = projectUsage.find(p => p.name === projectName);
    if (!project) return;

    // 获取该项目下的用户使用数据
    const projectUsers = userUsage.filter(u => u.project === projectName);

    const modalContent = `
        <div class="text-center mb-6">
            <h3 class="text-xl font-semibold">${projectName}</h3>
            <p class="text-slate-500">项目算力使用详情</p>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-slate-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">${formatNumber(project.usage)}</div>
                <div class="text-sm text-slate-500">Token使用量</div>
            </div>
            <div class="text-center p-4 bg-slate-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">${project.percentage}%</div>
                <div class="text-sm text-slate-500">占比</div>
            </div>
            <div class="text-center p-4 bg-slate-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">${project.users}</div>
                <div class="text-sm text-slate-500">活跃用户数</div>
            </div>
        </div>
        <div class="mb-4">
            <h4 class="font-medium mb-2">项目成员使用情况</h4>
            <table class="table text-sm">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>部门</th>
                        <th>使用量</th>
                    </tr>
                </thead>
                <tbody>
                    ${projectUsers.length > 0 ? projectUsers.map(u => `
                        <tr>
                            <td>${u.name}</td>
                            <td>${u.department}</td>
                            <td>${formatNumber(u.usage)}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="3" class="text-center text-slate-400">暂无数据</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    showModal('项目详情', modalContent, '');
}

function switchDashboardTab(tab) {
    dashboardView = tab;
    document.querySelectorAll('.tabs .tab[data-tab]').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tabs .tab[data-tab="${tab}"]`).classList.add('active');
    renderCurrentPage();
}

function switchDimension(dim) {
    dashboardTab = dim;
    document.querySelectorAll('.tabs .tab[data-dim]').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tabs .tab[data-dim="${dim}"]`).classList.add('active');

    const content = document.getElementById('dashboardContent');
    content.innerHTML = renderDashboardContent();

    // 初始化对应的图表
    setTimeout(() => initDashboardCharts(dim), 0);
}

function setDashboardFilter(type, value) {
    switch(type) {
        case 'project':
            dashboardProjectFilter = value;
            break;
        case 'model':
            dashboardModelFilter = value;
            break;
        case 'person':
            dashboardPersonFilter = value;
            break;
    }
    renderCurrentPage();
}

function changeTimeRange(range) {
    dashboardTimeRange = range;
    const label = range === 'custom'
        ? `${customDateRange.start} 至 ${customDateRange.end}`
        : `近${range}个月`;
    showToast('info', '时间范围已切换', `已切换为${label}`);
    renderCurrentPage();
}

function updateCustomDateRange() {
    const startDate = document.getElementById('customStartDate').value;
    const endDate = document.getElementById('customEndDate').value;

    if (startDate && endDate) {
        customDateRange = { start: startDate, end: endDate };
        dashboardTimeRange = 'custom';
        changeTimeRange(dashboardTimeRange);
    }
}

function setQuickRange(months) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    customDateRange = {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
    dashboardTimeRange = String(months);
    changeTimeRange(dashboardTimeRange);
}

function initDashboardCharts(tab) {
    const chartColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#1e40af'];

    switch(tab) {
        case 'person':
            const personCtx = document.getElementById('personRankChart');
            if (personCtx) {
                charts.personRank = new Chart(personCtx, {
                    type: 'bar',
                    data: {
                        labels: userUsage.slice(0, 10).map(u => u.name),
                        datasets: [{
                            label: 'Token使用量',
                            data: userUsage.slice(0, 10).map(u => u.usage),
                            backgroundColor: chartColors,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: { legend: { display: false } }
                    }
                });
            }
            break;

        case 'department':
            const deptCtx = document.getElementById('deptRankChart');
            if (deptCtx) {
                charts.deptRank = new Chart(deptCtx, {
                    type: 'bar',
                    data: {
                        labels: departmentUsage.map(d => d.name),
                        datasets: [{
                            label: 'Token使用量',
                            data: departmentUsage.map(d => d.usage),
                            backgroundColor: chartColors,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                    }
                });
            }
            break;

        case 'model':
            const modelReqCtx = document.getElementById('modelReqChart');
            if (modelReqCtx) {
                charts.modelReq = new Chart(modelReqCtx, {
                    type: 'bar',
                    data: {
                        labels: modelUsage.map(m => m.name),
                        datasets: [{
                            label: '请求次数',
                            data: modelUsage.map(m => m.requests),
                            backgroundColor: chartColors,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                    }
                });
            }

            const modelUsageCtx = document.getElementById('modelUsageChart');
            if (modelUsageCtx) {
                charts.modelUsage = new Chart(modelUsageCtx, {
                    type: 'bar',
                    data: {
                        labels: modelUsage.map(m => m.name),
                        datasets: [{
                            label: 'Token消耗',
                            data: modelUsage.map(m => m.usage),
                            backgroundColor: chartColors,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                    }
                });
            }
            break;

        case 'project':
            const projCtx = document.getElementById('projRankChart');
            if (projCtx) {
                charts.projRank = new Chart(projCtx, {
                    type: 'bar',
                    data: {
                        labels: projectUsage.map(p => p.name),
                        datasets: [{
                            label: 'Token使用量',
                            data: projectUsage.map(p => p.usage),
                            backgroundColor: chartColors,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                    }
                });
            }
            break;
    }
}

// ==================== 项目管理页面 ====================

function renderProjects(container) {
    container.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div></div>
            <button class="btn btn-primary" onclick="showAddProjectModal()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                添加项目
            </button>
        </div>

        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>项目名称</th>
                            <th>所属部门</th>
                            <th>配额</th>
                            <th>已使用</th>
                            <th>剩余</th>
                            <th>成员数</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${PROJECTS.map(proj => {
                            const remaining = proj.quota - proj.used;
                            const rate = calculateUsageRate(proj.used, proj.quota);
                            const statusClass = proj.status === 'active' ? 'badge-success' : proj.status === 'paused' ? 'badge-warning' : 'badge-info';
                            const statusText = proj.status === 'active' ? '进行中' : proj.status === 'paused' ? '已暂停' : '已完成';
                            return `
                                <tr>
                                    <td class="font-medium">${proj.name}</td>
                                    <td>${proj.department}</td>
                                    <td>${formatNumber(proj.quota)}</td>
                                    <td>${formatNumber(proj.used)}</td>
                                    <td>${formatNumber(remaining)}</td>
                                    <td>${proj.members}</td>
                                    <td>
                                        <span class="badge ${statusClass}">${statusText}</span>
                                    </td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <button class="btn btn-sm btn-secondary" onclick="editProject('${proj.id}')">编辑</button>
                                            <button class="btn btn-sm btn-secondary" onclick="manageMembers('${proj.id}')">管理成员</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== Toast通知系统 ====================

function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const id = 'toast-' + Date.now();

    const icons = {
        success: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        error: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
        info: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast('${id}')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => removeToast(id), 3000);
}

function removeToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }
}

// ==================== Modal模态框系统 ====================

// ==================== 模型管理页面 ====================

// 获取模型厂商列表
function getVendorList() {
    const vendors = [...new Set(MODELS.map(m => m.vendor))];
    return vendors;
}

function renderModelManagement(container) {
    const vendors = getVendorList();
    const categoryFilter = document.getElementById('modelCategoryFilter')?.value || '';

    // 筛选模型
    let filteredModels = MODELS;
    if (modelVendorFilter) {
        filteredModels = filteredModels.filter(m => m.vendor === modelVendorFilter);
    }
    if (categoryFilter) {
        filteredModels = filteredModels.filter(m => m.category === categoryFilter);
    }

    container.innerHTML = `
        <div class="card">
            <div class="card-body pb-0">
                <!-- 厂商筛选按钮组 -->
                <div class="flex items-center gap-2 mb-4">
                    <span class="text-sm text-slate-500">厂商:</span>
                    <div class="flex items-center gap-1">
                        <button class="btn btn-sm ${modelVendorFilter === '' ? 'btn-primary' : 'btn-secondary'}"
                            onclick="setModelVendorFilter('')">全部</button>
                        ${vendors.map(v => `
                            <button class="btn btn-sm ${modelVendorFilter === v ? 'btn-primary' : 'btn-secondary'}"
                                onclick="setModelVendorFilter('${v}')">${v}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="card-header flex items-center justify-between">
                <span>可用模型清单</span>
                <select class="filter-select text-sm" id="modelCategoryFilter" onchange="filterModels()">
                    <option value="">全部类型</option>
                    <option value="大语言模型" ${categoryFilter === '大语言模型' ? 'selected' : ''}>大语言模型</option>
                    <option value="图像生成" ${categoryFilter === '图像生成' ? 'selected' : ''}>图像生成</option>
                    <option value="语音识别" ${categoryFilter === '语音识别' ? 'selected' : ''}>语音识别</option>
                </select>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>模型名称</th>
                            <th>模型类型</th>
                            <th>模型厂商</th>
                            <th>API地址</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="modelTableBody">
                        ${renderModelTable(filteredModels)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderModelTable(models) {
    return models.map(model => `
        <tr>
            <td class="font-medium">${model.name}</td>
            <td><span class="badge bg-slate-100 text-slate-600">${model.category}</span></td>
            <td>${model.vendor}</td>
            <td class="font-mono text-sm text-slate-500">${model.apiUrl}</td>
            <td>
                <span class="badge ${model.status === 'active' ? 'badge-success' : 'badge-error'}">
                    ${model.status === 'active' ? '可用' : '不可用'}
                </span>
            </td>
            <td>
                <div class="flex items-center gap-1">
                    <button class="btn btn-sm btn-ghost" onclick="copyToClipboard('${model.apiUrl}', 'API地址')" title="复制API地址">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="showModelTestModal('${model.id}')">测试</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterModels() {
    renderCurrentPage();
}

function setModelVendorFilter(vendor) {
    modelVendorFilter = vendor;
    renderCurrentPage();
}

// ==================== 使用日志页面 ====================

function renderUseLogs(container) {
    // 分页计算
    const totalItems = useLogs.length;
    const totalPages = Math.ceil(totalItems / logsPageSize);
    const startIndex = (logsPage - 1) * logsPageSize;
    const endIndex = Math.min(startIndex + logsPageSize, totalItems);
    const paginatedLogs = useLogs.slice(startIndex, endIndex);

    container.innerHTML = `
        <div class="card">
            <div class="card-header flex items-center justify-between">
                <span>使用日志</span>
                <div class="flex items-center gap-2">
                    <select class="filter-select text-sm">
                        <option value="">全部模型</option>
                        ${MODELS.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
                    </select>
                    <select class="filter-select text-sm">
                        <option value="">全部状态</option>
                        <option value="success">成功</option>
                        <option value="failed">失败</option>
                    </select>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>令牌</th>
                            <th>所属项目</th>
                            <th>用户</th>
                            <th>模型</th>
                            <th>用时</th>
                            <th>消耗TOKEN</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedLogs.map(log => `
                            <tr>
                                <td class="text-sm text-slate-500">${log.time}</td>
                                <td>${log.id}</td>
                                <td>${log.project}</td>
                                <td>${log.user}</td>
                                <td><span class="badge bg-slate-100 text-slate-600">${log.model}</span></td>
                                <td>${log.duration}</td>
                                <td>${formatNumber(log.tokens)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="card-body flex items-center justify-between">
                <div class="text-sm text-slate-500">
                    显示 ${startIndex + 1}-${endIndex} 条，共 ${totalItems} 条
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-sm btn-secondary ${logsPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                        onclick="changeLogsPage(${logsPage - 1})" ${logsPage === 1 ? 'disabled' : ''}>
                        上一页
                    </button>
                    ${renderLogsPagination(totalPages)}
                    <button class="btn btn-sm btn-secondary ${logsPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                        onclick="changeLogsPage(${logsPage + 1})" ${logsPage === totalPages ? 'disabled' : ''}>
                        下一页
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderLogsPagination(totalPages) {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }
    return pages.map(page => `
        <button class="btn btn-sm ${logsPage === page ? 'btn-primary' : 'btn-secondary'}" onclick="changeLogsPage(${page})">
            ${page}
        </button>
    `).join('');
}

function changeLogsPage(page) {
    const totalPages = Math.ceil(useLogs.length / logsPageSize);
    if (page < 1 || page > totalPages) return;
    logsPage = page;
    renderCurrentPage();
}

// 复制到剪贴板
function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', '复制成功', `${label}已复制到剪贴板`);
    }).catch(() => {
        showToast('error', '复制失败', '无法复制到剪贴板');
    });
}

// 模型测试弹窗
function showModelTestModal(modelId) {
    const model = MODELS.find(m => m.id === modelId);
    if (!model) return;

    const modalContent = `
        <div class="mb-4">
            <div class="flex items-center justify-between mb-4">
                <span class="font-medium">测试模型: ${model.name}</span>
                <span class="badge bg-slate-100 text-slate-600">${model.category}</span>
            </div>
            <div class="mb-3">
                <label class="block text-sm text-slate-600 mb-1">API地址</label>
                <input type="text" class="input font-mono text-sm" value="${model.apiUrl}" readonly>
            </div>
            <div class="mb-4">
                <label class="block text-sm text-slate-600 mb-1">测试输入</label>
                <textarea class="input" rows="4" placeholder="请输入测试内容..."></textarea>
            </div>
        </div>
    `;

    const modalFooter = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="testModel('${modelId}')">发送测试</button>
    `;

    showModal('模型测试', modalContent, modalFooter);
}

// 测试模型
function testModel(modelId) {
    const model = MODELS.find(m => m.id === modelId);
    if (!model) return;

    // 模拟测试请求
    showToast('info', '测试中', `正在请求 ${model.name} API...`);

    setTimeout(() => {
        closeModal();
        showToast('success', '测试成功', `${model.name} 接口调用正常`);
    }, 1500);
}

function initModals() {
    const overlay = document.getElementById('modalOverlay');
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
}

function showModal(title, content, footer = '') {
    const modal = document.getElementById('modalContent');
    modal.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="closeModal()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;

    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
}

// ==================== 令牌操作 ====================

function showCreateTokenModal() {
    const content = `
        <form id="createTokenForm">
            <div class="form-group">
                <label class="form-label">令牌名称</label>
                <input type="text" class="form-input" id="tokenName" placeholder="请输入令牌名称" required>
            </div>
            <div class="form-group">
                <label class="form-label">过期时间</label>
                <input type="date" class="form-input" id="tokenExpires" required>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="createToken()">创建</button>
    `;

    showModal('新建令牌', content, footer);

    // 设置默认过期时间为6个月后
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 6);
    document.getElementById('tokenExpires').value = defaultDate.toISOString().split('T')[0];
}

function createToken() {
    const name = document.getElementById('tokenName').value.trim();
    const expires = document.getElementById('tokenExpires').value;

    if (!name || !expires) {
        showToast('error', '创建失败', '请填写完整信息');
        return;
    }

    const newToken = {
        id: generateId('tok'),
        name: name,
        key: 'sk-****...****' + Math.random().toString(16).substr(2, 4),
        createdAt: new Date().toISOString().split('T')[0],
        expiresAt: expires,
        status: 'active'
    };

    tokens.unshift(newToken);
    closeModal();
    renderCurrentPage();
    showToast('success', '创建成功', '令牌已创建');
}

function viewToken(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    showModal('令牌详情', `
        <div class="space-y-4">
            <div>
                <label class="text-sm text-slate-500">令牌名称</label>
                <p class="font-medium">${token.name}</p>
            </div>
            <div>
                <label class="text-sm text-slate-500">令牌ID</label>
                <p class="font-mono text-sm">${token.id}</p>
            </div>
            <div>
                <label class="text-sm text-slate-500">令牌Key</label>
                <p class="font-mono text-sm">${token.key}</p>
            </div>
            <div>
                <label class="text-sm text-slate-500">创建时间</label>
                <p>${formatDate(token.createdAt)}</p>
            </div>
            <div>
                <label class="text-sm text-slate-500">过期时间</label>
                <p>${formatDate(token.expiresAt)}</p>
            </div>
        </div>
    `);
}

function editToken(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    showModal('编辑令牌', `
        <form id="editTokenForm">
            <div class="form-group">
                <label class="form-label">令牌名称</label>
                <input type="text" class="form-input" id="editTokenName" value="${token.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">额度</label>
                <input type="number" class="form-input" id="editTokenQuota" value="${token.quota}" required>
            </div>
            <div class="form-group">
                <label class="form-label">可用模型</label>
                <input type="text" class="form-input" id="editTokenModels" value="${token.availableModels}" placeholder="多个模型用逗号分隔">
            </div>
        </form>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="confirmEditToken('${id}')">保存</button>
    `);
}

function confirmEditToken(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    const name = document.getElementById('editTokenName').value.trim();
    const quota = parseInt(document.getElementById('editTokenQuota').value);
    const models = document.getElementById('editTokenModels').value.trim();

    if (!name || !quota) {
        showToast('error', '保存失败', '请填写完整信息');
        return;
    }

    token.name = name;
    token.quota = quota;
    token.availableModels = models;

    closeModal();
    renderCurrentPage();
    showToast('success', '保存成功', '令牌信息已更新');
}

function toggleTokenStatus(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    const isDisabled = token.status === 'revoked';
    const action = isDisabled ? '启用' : '禁用';

    showModal(`确认${action}`, `
        <p>确定要${action}令牌 "<strong>${token.name}</strong>" 吗？</p>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="confirmToggleTokenStatus('${id}')">确认${action}</button>
    `);
}

function confirmToggleTokenStatus(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    token.status = token.status === 'revoked' ? 'active' : 'revoked';

    closeModal();
    renderCurrentPage();
    showToast('success', '操作成功', `令牌已${token.status === 'revoked' ? '禁用' : '启用'}`);
}

function deleteToken(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    showModal('确认删除', `
        <p>确定要删除令牌 "<strong>${token.name}</strong>" 吗？此操作不可恢复。</p>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-danger" onclick="confirmDeleteToken('${id}')">确认删除</button>
    `);
}

function confirmDeleteToken(id) {
    const index = tokens.findIndex(t => t.id === id);
    if (index !== -1) {
        tokens.splice(index, 1);
        closeModal();
        renderCurrentPage();
        showToast('success', '删除成功', '令牌已删除');
    }
}

function revokeToken(id) {
    const token = tokens.find(t => t.id === id);
    if (!token) return;

    showModal('确认吊销', `
        <p>确定要吊销令牌 "<strong>${token.name}</strong>" 吗？吊销后该令牌将立即失效。</p>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-danger" onclick="confirmRevokeToken('${id}')">确认吊销</button>
    `);
}

function confirmRevokeToken(id) {
    const token = tokens.find(t => t.id === id);
    if (token) {
        token.status = 'revoked';
        closeModal();
        renderCurrentPage();
        showToast('success', '吊销成功', '令牌已吊销');
    }
}

// ==================== 项目操作 ====================

function showSwitchProjectModal() {
    const projectsWithQuota = PROJECTS.filter(p => p.status === 'active' && (p.quota - p.used) > 0);

    const content = `
        <form id="switchProjectForm">
            <div class="form-group">
                <label class="form-label">选择项目</label>
                <select class="form-input" id="switchProject" required>
                    ${projectsWithQuota.map(p => `
                        <option value="${p.id}">${p.name} (剩余: ${formatNumber(p.quota - p.used)} Token)</option>
                    `).join('')}
                </select>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="switchProject()">确认切换</button>
    `;

    showModal('切换项目', content, footer);
}

function switchProject() {
    const projectId = document.getElementById('switchProject').value;
    const project = PROJECTS.find(p => p.id === projectId);

    if (project) {
        // 记录历史
        projectHistory.unshift({
            project: currentUser.project,
            startDate: currentUser.projectStartDate,
            endDate: new Date().toISOString().split('T')[0],
            status: 'completed'
        });

        currentUser.project = project.name;
        currentUser.projectStartDate = new Date().toISOString().split('T')[0];

        closeModal();
        renderCurrentPage();
        showToast('success', '切换成功', `已切换到项目: ${project.name}`);
    }
}

function showProjectHistory() {
    const content = `
        <div class="space-y-3">
            ${projectHistory.map(h => `
                <div class="p-3 bg-slate-50 rounded-lg ${h.status === 'current' ? 'border-l-4 border-primary-500' : ''}">
                    <div class="font-medium">${h.project}</div>
                    <div class="text-sm text-slate-500">
                        ${formatDate(h.startDate)} - ${h.status === 'current' ? '至今' : formatDate(h.endDate)}
                    </div>
                    <span class="badge ${h.status === 'current' ? 'badge-success' : 'badge-info'}">
                        ${h.status === 'current' ? '当前' : '历史'}
                    </span>
                </div>
            `).join('')}
        </div>
    `;

    showModal('项目挂靠历史', content);
}

function showAddProjectModal() {
    const content = `
        <form id="addProjectForm">
            <div class="form-group">
                <label class="form-label">项目名称</label>
                <input type="text" class="form-input" id="projectName" placeholder="请输入项目名称" required>
            </div>
            <div class="form-group">
                <label class="form-label">所属部门</label>
                <select class="form-input" id="projectDept" required>
                    ${DEPARTMENTS.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">配额</label>
                <input type="number" class="form-input" id="projectQuota" placeholder="请输入配额" required>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="addProject()">添加</button>
    `;

    showModal('添加项目', content, footer);
}

function addProject() {
    const name = document.getElementById('projectName').value.trim();
    const dept = document.getElementById('projectDept').value;
    const quota = parseInt(document.getElementById('projectQuota').value);

    if (!name || !quota) {
        showToast('error', '添加失败', '请填写完整信息');
        return;
    }

    const newProject = {
        id: generateId('proj'),
        name: name,
        department: dept,
        quota: quota,
        used: 0,
        members: 0,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0]
    };

    PROJECTS.unshift(newProject);
    closeModal();
    renderCurrentPage();
    showToast('success', '添加成功', '项目已添加');
}

function editProject(id) {
    const project = PROJECTS.find(p => p.id === id);
    if (!project) return;

    const content = `
        <form id="editProjectForm">
            <div class="form-group">
                <label class="form-label">项目名称</label>
                <input type="text" class="form-input" id="editProjectName" value="${project.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" id="editProjectStatus" required>
                    <option value="active" ${project.status === 'active' ? 'selected' : ''}>进行中</option>
                    <option value="paused" ${project.status === 'paused' ? 'selected' : ''}>已暂停</option>
                    <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>已完成</option>
                </select>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveProject('${id}')">保存</button>
    `;

    showModal('编辑项目', content, footer);
}

function saveProject(id) {
    const project = PROJECTS.find(p => p.id === id);
    if (project) {
        project.name = document.getElementById('editProjectName').value;
        project.status = document.getElementById('editProjectStatus').value;
        closeModal();
        renderCurrentPage();
        showToast('success', '保存成功', '项目信息已更新');
    }
}

function manageMembers(id) {
    const project = PROJECTS.find(p => p.id === id);
    if (!project) return;

    const projectUsers = USERS.filter(u => u.project === project.name);

    showModal(`管理成员 - ${project.name}`, `
        <div class="mb-4">
            <button class="btn btn-sm btn-primary" onclick="addMemberToProject('${id}')">添加成员</button>
        </div>
        <div class="table-container" style="max-height: 300px;">
            <table class="table">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>部门</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${projectUsers.length > 0 ? projectUsers.map(u => `
                        <tr>
                            <td>${u.name}</td>
                            <td>${u.department}</td>
                            <td><button class="btn btn-sm btn-danger" onclick="removeMember('${id}', '${u.id}')">移除</button></td>
                        </tr>
                    `).join('') : '<tr><td colspan="3" class="text-center py-4">暂无成员</td></tr>'}
                </tbody>
            </table>
        </div>
    `);
}

function addMemberToProject(projectId) {
    showToast('info', '提示', '该功能演示中暂未开放');
}

function removeMember(projectId, userId) {
    showToast('info', '提示', '该功能演示中暂未开放');
}

// ==================== 额度申请 ====================

function showApplyQuotaModal() {
    const content = `
        <form id="applyQuotaForm">
            <div class="form-group">
                <label class="form-label">选择项目</label>
                <select class="form-input" id="applyProject" onchange="onProjectChange()" required>
                    <option value="">请选择项目</option>
                    ${PROJECTS.filter(p => p.status === 'active').map(p => `
                        <option value="${p.id}" data-leader="${p.leader}">${p.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">项目负责人</label>
                <input type="text" class="form-input" id="applyProjectLeader" placeholder="选择项目后自动带出" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">申请额度</label>
                <input type="number" class="form-input" id="applyAmount" placeholder="请输入Token额度">
            </div>
            <div class="form-group">
                <label class="form-label">申请原因</label>
                <textarea class="form-input" id="applyReason" rows="3" placeholder="请说明申请原因" required></textarea>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="submitQuotaApply()">提交申请</button>
    `;

    showModal('申请额度', content, footer);
}

function onProjectChange() {
    const projectSelect = document.getElementById('applyProject');
    const leaderInput = document.getElementById('applyProjectLeader');
    const selectedOption = projectSelect.options[projectSelect.selectedIndex];

    if (selectedOption && selectedOption.value) {
        leaderInput.value = selectedOption.dataset.leader || '';
    } else {
        leaderInput.value = '';
    }
}

function submitQuotaApply() {
    const projectSelect = document.getElementById('applyProject');
    const projectId = projectSelect.value;
    const projectName = projectSelect.options[projectSelect.selectedIndex].text;
    const leader = document.getElementById('applyProjectLeader').value;
    const amount = parseInt(document.getElementById('applyAmount').value);
    const reason = document.getElementById('applyReason').value.trim();

    if (!projectId || !reason) {
        showToast('error', '提交失败', '请填写完整信息');
        return;
    }

    const newRequest = {
        id: generateId('req'),
        userId: currentUser.id,
        userName: currentUser.name,
        projectId: projectId,
        projectName: projectName,
        projectLeader: leader,
        amount: amount,
        reason: reason,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        processedAt: null,
        processedBy: null
    };

    quotaRequests.unshift(newRequest);
    closeModal();
    renderCurrentPage();
    showToast('success', '提交成功', '额度申请已提交，等待审批');
}

// ==================== 审批操作 ====================

function approveRequest(id) {
    const request = quotaRequests.find(r => r.id === id);
    if (request) {
        request.status = 'approved';
        request.processedAt = new Date().toISOString().split('T')[0];
        request.processedBy = '管理员';

        // 更新用户额度
        const user = USERS.find(u => u.id === request.userId);
        if (user) {
            user.quota += request.amount;
        }

        renderCurrentPage();
        showToast('success', '审批通过', `已批准用户 ${request.userName} 的额度申请`);
    }
}

function rejectRequest(id) {
    const request = quotaRequests.find(r => r.id === id);
    if (!request) return;

    showModal('拒绝申请', `
        <div class="form-group">
            <label class="form-label">拒绝原因</label>
            <textarea class="form-input" id="rejectReason" rows="3" placeholder="请说明拒绝原因"></textarea>
        </div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-danger" onclick="confirmReject('${id}')">确认拒绝</button>
    `);
}

function confirmReject(id) {
    const request = quotaRequests.find(r => r.id === id);
    const reason = document.getElementById('rejectReason').value;

    if (request) {
        request.status = 'rejected';
        request.processedAt = new Date().toISOString().split('T')[0];
        request.processedBy = '管理员';
        request.rejectReason = reason || '管理员拒绝';

        closeModal();
        renderCurrentPage();
        showToast('success', '已拒绝', `已拒绝用户 ${request.userName} 的额度申请`);
    }
}

// ==================== 批量审批功能 ====================

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.request-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateBatchButtons();
}

function updateBatchButtons() {
    const checkboxes = document.querySelectorAll('.request-checkbox:checked');
    const batchApproveBtn = document.getElementById('batchApproveBtn');
    const batchRejectBtn = document.getElementById('batchRejectBtn');

    if (checkboxes.length > 0) {
        batchApproveBtn.style.display = 'inline-flex';
        batchRejectBtn.style.display = 'inline-flex';
    } else {
        batchApproveBtn.style.display = 'none';
        batchRejectBtn.style.display = 'none';
    }
}

function getSelectedRequestIds() {
    const checkboxes = document.querySelectorAll('.request-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function batchApprove() {
    const selectedIds = getSelectedRequestIds();
    if (selectedIds.length === 0) return;

    showModal('批量批准', `
        <p>确定要批准选中的 <strong>${selectedIds.length}</strong> 条申请吗？</p>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-success" onclick="confirmBatchApprove()">确认批准</button>
    `);
}

function confirmBatchApprove() {
    const selectedIds = getSelectedRequestIds();
    let approvedCount = 0;

    selectedIds.forEach(id => {
        const request = quotaRequests.find(r => r.id === id);
        if (request && request.status === 'pending') {
            request.status = 'approved';
            request.processedAt = new Date().toISOString().split('T')[0];
            request.processedBy = '管理员';

            // 更新用户额度
            const user = USERS.find(u => u.id === request.userId);
            if (user) {
                user.quota += request.amount;
            }
            approvedCount++;
        }
    });

    closeModal();
    renderCurrentPage();
    showToast('success', '批量审批完成', `已批准 ${approvedCount} 条申请`);
}

function batchReject() {
    const selectedIds = getSelectedRequestIds();
    if (selectedIds.length === 0) return;

    showModal('批量拒绝', `
        <div class="form-group">
            <label class="form-label">拒绝原因</label>
            <textarea class="form-input" id="batchRejectReason" rows="3" placeholder="请说明拒绝原因"></textarea>
        </div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-danger" onclick="confirmBatchReject()">确认拒绝</button>
    `);
}

function confirmBatchReject() {
    const selectedIds = getSelectedRequestIds();
    const reason = document.getElementById('batchRejectReason').value || '管理员批量拒绝';
    let rejectedCount = 0;

    selectedIds.forEach(id => {
        const request = quotaRequests.find(r => r.id === id);
        if (request && request.status === 'pending') {
            request.status = 'rejected';
            request.processedAt = new Date().toISOString().split('T')[0];
            request.processedBy = '管理员';
            request.rejectReason = reason;
            rejectedCount++;
        }
    });

    closeModal();
    renderCurrentPage();
    showToast('success', '批量审批完成', `已拒绝 ${rejectedCount} 条申请`);
}

// ==================== 用户管理 ====================

function showAddUserModal() {
    const content = `
        <form id="addUserForm">
            <div class="form-group">
                <label class="form-label">姓名</label>
                <input type="text" class="form-input" id="newUserName" placeholder="请输入姓名" required>
            </div>
            <div class="form-group">
                <label class="form-label">部门</label>
                <select class="form-input" id="newUserDept" required>
                    ${DEPARTMENTS.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">额度</label>
                <input type="number" class="form-input" id="newUserQuota" placeholder="请输入额度" required>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="addUser()">添加</button>
    `;

    showModal('添加用户', content, footer);
}

function addUser() {
    const name = document.getElementById('newUserName').value.trim();
    const dept = document.getElementById('newUserDept').value;
    const quota = parseInt(document.getElementById('newUserQuota').value);

    if (!name || !quota) {
        showToast('error', '添加失败', '请填写完整信息');
        return;
    }

    const newUser = {
        id: generateId('user'),
        name: name,
        department: dept,
        quota: quota,
        used: 0,
        project: '-',
        email: `${name.toLowerCase()}@company.com`
    };

    USERS.unshift(newUser);
    closeModal();
    renderCurrentPage();
    showToast('success', '添加成功', `用户 ${name} 已添加`);
}

function editUserQuota(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return;

    const content = `
        <form id="editUserForm">
            <div class="form-group">
                <label class="form-label">用户</label>
                <input type="text" class="form-input" value="${user.name}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">新额度</label>
                <input type="number" class="form-input" id="editQuota" value="${user.quota}" required>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveUserQuota('${userId}')">保存</button>
    `;

    showModal('编辑额度', content, footer);
}

function saveUserQuota(userId) {
    const user = USERS.find(u => u.id === userId);
    const newQuota = parseInt(document.getElementById('editQuota').value);

    if (user && newQuota) {
        user.quota = newQuota;
        closeModal();
        renderCurrentPage();
        showToast('success', '保存成功', '用户额度已更新');
    }
}

function deleteUser(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return;

    showModal('确认删除', `
        <p>确定要删除用户 <strong>${user.name}</strong> 吗？此操作不可撤销。</p>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-danger" onclick="confirmDeleteUser('${userId}')">确认删除</button>
    `);
}

function confirmDeleteUser(userId) {
    const index = USERS.findIndex(u => u.id === userId);
    if (index > -1) {
        USERS.splice(index, 1);
        closeModal();
        renderCurrentPage();
        showToast('success', '删除成功', '用户已删除');
    }
}

function importUsers() {
    showToast('info', '提示', '批量导入功能演示中');
}

function exportUsers() {
    showToast('info', '提示', '批量导出功能演示中');
}

// ==================== 角色切换 ====================

function initRoleToggle() {
    const toggle = document.getElementById('roleToggle');
    if (toggle) {
        toggle.addEventListener('click', toggleRole);
    }
}
