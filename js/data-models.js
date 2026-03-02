/**
 * AI算力管理平台 - 数据模型层
 * 包含所有演示数据和数据操作函数
 */

// 模型列表
const MODELS = [
    { id: 'glm47', name: 'GLM4.7', category: '大语言模型', vendor: '智谱AI', apiUrl: 'https://api.zhipuai.cn/v1/chat/completions', apiKey: 'zm-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 18520 },
    { id: 'gpt4', name: 'GPT-4', category: '大语言模型', vendor: 'OpenAI', apiUrl: 'https://api.openai.com/v1/chat/completions', apiKey: 'sk-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 12450 },
    { id: 'claude3', name: 'Claude3', category: '大语言模型', vendor: 'Anthropic', apiUrl: 'https://api.anthropic.com/v1/messages', apiKey: 'sk-ant-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 8920 },
    { id: 'llama70b', name: 'LLaMA-70B', category: '大语言模型', vendor: 'Meta', apiUrl: 'https://api.llama.com/v1/chat/completions', apiKey: 'llama-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 6780 },
    { id: 'qwenmax', name: 'Qwen-Max', category: '大语言模型', vendor: '通义千问', apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', apiKey: 'sk-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 5430 },
    { id: 'baichuan2', name: 'Baichuan2', category: '大语言模型', vendor: '百川智能', apiUrl: 'https://api.baichuan-ai.com/v1/chat/completions', apiKey: 'xxxxxxxxxxxxxxxx', status: 'inactive', requestCount: 2100 },
    { id: 'internlm', name: 'InternLM', category: '大语言模型', vendor: '上海AI Lab', apiUrl: 'https://api.sensel.com/v1/chat/completions', apiKey: 'intern-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 3250 },
    { id: 'stablediffusion', name: 'StableDiffusion', category: '图像生成', vendor: 'Stability AI', apiUrl: 'https://api.stability.ai/v1/generation/text-to-image', apiKey: 'sk-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 4560 },
    { id: 'whisper', name: 'Whisper', category: '语音识别', vendor: 'OpenAI', apiUrl: 'https://api.openai.com/v1/audio/transcriptions', apiKey: 'sk-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 2890 },
    { id: 'mistral', name: 'Mistral', category: '大语言模型', vendor: 'Mistral AI', apiUrl: 'https://api.mistral.ai/v1/chat/completions', apiKey: 'mistral-xxxxxxxxxxxxxxxx', status: 'active', requestCount: 1680 }
];

// 部门列表
const DEPARTMENTS = [
    { id: 'chip-design', name: '芯片设计部' },
    { id: 'verification', name: '验证部' },
    { id: 'rd', name: '研发部' },
    { id: 'packaging', name: '封装部' },
    { id: 'testing', name: '测试部' },
    { id: 'production', name: '生产部' },
    { id: 'product', name: '产品部' },
    { id: 'quality', name: '质量部' },
    { id: 'procurement', name: '采购部' },
    { id: 'finance', name: '财务部' }
];

// 项目列表
const PROJECTS = [
    { id: 'proj-001', name: 'AI4DESIGN', department: '芯片设计部', quota: 5000000, used: 1520000, members: 25, status: 'active', startDate: '2024-01-15', leader: '张伟' },
    { id: 'proj-002', name: '智能验证引擎', department: '验证部', quota: 3000000, used: 890000, members: 15, status: 'active', startDate: '2024-02-01', leader: '李娜' },
    { id: 'proj-003', name: '芯片自动化设计', department: '研发部', quota: 4000000, used: 2100000, members: 20, status: 'active', startDate: '2024-01-20', leader: '王强' },
    { id: 'proj-004', name: '封装AI优化', department: '封装部', quota: 2000000, used: 450000, members: 8, status: 'active', startDate: '2024-03-01', leader: '刘洋' },
    { id: 'proj-005', name: '智能测试系统', department: '测试部', quota: 1500000, used: 980000, members: 12, status: 'paused', startDate: '2024-02-15', leader: '陈静' },
    { id: 'proj-006', name: '生产预测模型', department: '生产部', quota: 1000000, used: 320000, members: 6, status: 'active', startDate: '2024-04-01', leader: '赵磊' },
    { id: 'proj-007', name: '产品需求分析', department: '产品部', quota: 800000, used: 150000, members: 5, status: 'completed', startDate: '2024-03-10', leader: '孙莉' }
];

// 用户列表
const USERS = [
    { id: 'user-001', name: '张伟', department: '芯片设计部', quota: 1000000, used: 325680, project: 'AI4DESIGN', email: 'zhangwei@company.com' },
    { id: 'user-002', name: '李娜', department: '验证部', quota: 800000, used: 512400, project: '智能验证引擎', email: 'lina@company.com' },
    { id: 'user-003', name: '王强', department: '研发部', quota: 1200000, used: 890000, project: '芯片自动化设计', email: 'wangqiang@company.com' },
    { id: 'user-004', name: '刘洋', department: '封装部', quota: 600000, used: 234500, project: '封装AI优化', email: 'liuyang@company.com' },
    { id: 'user-005', name: '陈静', department: '测试部', quota: 500000, used: 456000, project: '智能测试系统', email: 'chenjing@company.com' },
    { id: 'user-006', name: '赵磊', department: '生产部', quota: 400000, used: 128000, project: '生产预测模型', email: 'zhaolei@company.com' },
    { id: 'user-007', name: '孙莉', department: '产品部', quota: 350000, used: 89000, project: '产品需求分析', email: 'sunli@company.com' },
    { id: 'user-008', name: '周涛', department: '芯片设计部', quota: 900000, used: 678000, project: 'AI4DESIGN', email: 'zhoutao@company.com' },
    { id: 'user-009', name: '吴敏', department: '验证部', quota: 700000, used: 321000, project: '智能验证引擎', email: 'wumin@company.com' },
    { id: 'user-010', name: '郑浩', department: '研发部', quota: 1000000, used: 756000, project: '芯片自动化设计', email: 'zhenghao@company.com' }
];

// 当前登录用户
let currentUser = {
    id: 'user-001',
    name: '张伟',
    role: 'admin', // admin 或 user
    department: '芯片设计部',
    quota: 1000000,
    used: 325680,
    project: 'AI4DESIGN',
    projectStartDate: '2024-01-15',
    email: 'zhangwei@company.com'
};

// 令牌列表
let tokens = [
    { id: 'tok-001', name: '开发环境API', key: 'sk-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz', used: 325000, quota: 500000, availableModels: 'GPT-4,Claude3,GLM4.7', createdAt: '2024-06-01', expiresAt: '2024-12-31', status: 'active' },
    { id: 'tok-002', name: '测试环境API', key: 'sk-xyz987wvu654tsr321qpo098nml765kji432gfe109hdc876b', used: 125000, quota: 300000, availableModels: 'GPT-4,GLM4.7', createdAt: '2024-07-15', expiresAt: '2025-01-15', status: 'active' },
    { id: 'tok-003', name: '生产环境主KEY', key: 'sk-prod789xyz456abc123def012ghi678jkl901mno345pqr678', used: 450000, quota: 450000, availableModels: '全部模型', createdAt: '2024-03-10', expiresAt: '2024-09-10', status: 'revoked' },
    { id: 'tok-004', name: '临时测试KEY', key: 'sk-test123abc456def789ghi012jkl345mno678pqr901stu234vwx', used: 50000, quota: 100000, availableModels: 'GLM4.7,Qwen-Max', createdAt: '2024-08-01', expiresAt: '2024-08-31', status: 'expiring' }
];

// 额度申请记录
let quotaRequests = [
    { id: 'req-001', userId: 'user-001', userName: '张伟', amount: 500000, reason: '新项目启动需要更多算力', status: 'approved', createdAt: '2024-06-15', processedAt: '2024-06-16', processedBy: '管理员' },
    { id: 'req-002', userId: 'user-002', userName: '李娜', amount: 300000, reason: '模型训练需要额外资源', status: 'pending', createdAt: '2024-08-10', processedAt: null, processedBy: null },
    { id: 'req-003', userId: 'user-003', userName: '王强', amount: 200000, reason: '临时增加算力需求', status: 'pending', createdAt: '2024-08-12', processedAt: null, processedBy: null },
    { id: 'req-004', userId: 'user-004', userName: '刘洋', amount: 150000, reason: '验证任务增加', status: 'rejected', createdAt: '2024-07-20', processedAt: '2024-07-21', processedBy: '管理员', rejectReason: '额度充足，暂不批准' }
];

// Token使用趋势数据（按月）
const monthlyUsageData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    data: [125000, 156000, 189000, 210000, 245000, 298000, 325680]
};

// 模型使用分布
const modelDistribution = [
    { model: 'GLM4.7', vendor: '智谱AI', usage: 116000, percentage: 35.6, requests: 4500 },
    { model: 'GPT-4', vendor: 'OpenAI', usage: 78000, percentage: 24.0, requests: 3200 },
    { model: 'Claude3', vendor: 'Anthropic', usage: 52000, percentage: 16.0, requests: 2100 },
    { model: 'LLaMA-70B', vendor: 'Meta', usage: 39000, percentage: 12.0, requests: 1800 },
    { model: 'Qwen-Max', vendor: '通义千问', usage: 28000, percentage: 8.6, requests: 1200 },
    { model: '其他', vendor: '-', usage: 12680, percentage: 3.8, requests: 500 }
];

// 模型使用趋势数据
const modelTrendData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    usage: [
        { model: 'GLM4.7', data: [85000, 92000, 98000, 105000, 110000, 116000] },
        { model: 'GPT-4', data: [52000, 58000, 62000, 68000, 72000, 78000] },
        { model: 'Claude3', data: [35000, 38000, 42000, 45000, 48000, 52000] },
        { model: 'LLaMA-70B', data: [28000, 30000, 32000, 34000, 36000, 39000] },
        { model: 'Qwen-Max', data: [15000, 18000, 20000, 22000, 25000, 28000] }
    ],
    requests: [
        { model: 'GLM4.7', data: [3200, 3500, 3800, 4000, 4200, 4500] },
        { model: 'GPT-4', data: [2400, 2600, 2800, 2900, 3000, 3200] },
        { model: 'Claude3', data: [1600, 1700, 1800, 1900, 2000, 2100] },
        { model: 'LLaMA-70B', data: [1400, 1500, 1550, 1600, 1700, 1800] },
        { model: 'Qwen-Max', data: [800, 900, 950, 1000, 1100, 1200] }
    ]
};

// 运营看板 - 总览数据
const dashboardOverview = {
    totalUsage: 52000000,
    totalRequests: 181000,
    activeUsers: 128,
    topProject: { name: 'AI4DESIGN', percentage: 30.4 },
    topModel: { name: 'GLM4.7', percentage: 35.6 },
    usageChange: 12.5,
    requestsChange: 8.3,
    usersChange: 1.5
};

// 根据时间范围获取核心指标
function getDashboardOverview(timeRange, customRange = null) {
    const baseData = {
        '7': { usage: 5200000, requests: 18100, users: 89 },
        '30': { usage: 52000000, requests: 181000, users: 128 },
        '90': { usage: 156000000, requests: 543000, users: 156 }
    };

    let data;
    let days;

    if (timeRange === 'custom' && customRange && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        // 按天数比例计算
        const ratio = days / 30;
        data = {
            usage: Math.round(52000000 * ratio),
            requests: Math.round(181000 * ratio),
            users: Math.round(128 * ratio * 0.8)
        };
    } else {
        data = baseData[timeRange] || baseData['30'];
        days = parseInt(timeRange) || 30;
    }

    return {
        totalUsage: data.usage,
        totalRequests: data.requests,
        activeUsers: data.users,
        topProject: { name: 'AI4DESIGN', percentage: 30.4 },
        topModel: { name: 'GLM4.7', percentage: 35.6 },
        usageChange: days === 7 ? 5.2 : days === 30 ? 12.5 : days === 90 ? 18.3 : 10,
        requestsChange: days === 7 ? 3.1 : days === 30 ? 8.3 : days === 90 ? 15.2 : 8,
        usersChange: days === 7 ? -2.3 : days === 30 ? 1.5 : days === 90 ? 5.8 : 2
    };
}

// 运营看板 - 按部门数据
const departmentUsage = [
    { name: '芯片设计部', usage: 15800000, percentage: 30.4, users: 45, change: 15.2 },
    { name: '验证部', usage: 10200000, percentage: 19.6, users: 28, change: 8.7 },
    { name: '研发部', usage: 8900000, percentage: 17.1, users: 22, change: 12.3 },
    { name: '封装部', usage: 5200000, percentage: 10.0, users: 12, change: -3.5 },
    { name: '测试部', usage: 4500000, percentage: 8.7, users: 10, change: 5.8 },
    { name: '生产部', usage: 3200000, percentage: 6.2, users: 8, change: 22.1 },
    { name: '产品部', usage: 2100000, percentage: 4.0, users: 6, change: -8.2 },
    { name: '质量部', usage: 1300000, percentage: 2.5, users: 4, change: 10.5 },
    { name: '采购部', usage: 600000, percentage: 1.2, users: 2, change: 5.0 },
    { name: '财务部', usage: 200000, percentage: 0.3, users: 1, change: 2.0 }
];

// 运营看板 - 按项目数据
const projectUsage = [
    { name: 'AI4DESIGN', usage: 15800000, percentage: 30.4, users: 25, change: 15.2 },
    { name: '智能验证引擎', usage: 10200000, percentage: 19.6, users: 15, change: 8.7 },
    { name: '芯片自动化设计', usage: 8900000, percentage: 17.1, users: 20, change: 12.3 },
    { name: '封装AI优化', usage: 5200000, percentage: 10.0, users: 8, change: -3.5 },
    { name: '智能测试系统', usage: 4500000, percentage: 8.7, users: 12, change: 5.8 },
    { name: '生产预测模型', usage: 3200000, percentage: 6.2, users: 6, change: 22.1 },
    { name: '产品需求分析', usage: 2100000, percentage: 4.0, users: 5, change: -8.2 },
    { name: '质量检测系统', usage: 1300000, percentage: 2.5, users: 4, change: 10.5 },
    { name: '采购优化平台', usage: 600000, percentage: 1.2, users: 2, change: 5.0 },
    { name: '财务分析工具', usage: 200000, percentage: 0.3, users: 1, change: 2.0 }
];

// 运营看板 - 按模型数据
const modelUsage = [
    { name: 'GLM4.7', requests: 65000, usage: 18500000, percentage: 35.6, avgResponseTime: 1.2, change: 18.5 },
    { name: 'GPT-4', requests: 42000, usage: 14500000, percentage: 27.9, avgResponseTime: 1.8, change: 10.2 },
    { name: 'Claude3', requests: 28000, usage: 8200000, percentage: 15.8, avgResponseTime: 1.5, change: 5.8 },
    { name: 'LLaMA-70B', requests: 18000, usage: 5200000, percentage: 10.0, avgResponseTime: 2.1, change: -2.3 },
    { name: 'Qwen-Max', requests: 12000, usage: 3200000, percentage: 6.2, avgResponseTime: 1.3, change: 25.0 },
    { name: 'Baichuan2', requests: 6000, usage: 1200000, percentage: 2.3, avgResponseTime: 1.1, change: 8.5 },
    { name: 'InternLM', requests: 3000, usage: 600000, percentage: 1.2, avgResponseTime: 1.4, change: -5.2 },
    { name: 'StableDiffusion', requests: 2000, usage: 400000, percentage: 0.8, avgResponseTime: 3.5, change: 12.0 },
    { name: 'Whisper', requests: 500, usage: 50000, percentage: 0.1, avgResponseTime: 0.8, change: 3.0 },
    { name: 'Mistral', requests: 500, usage: 50000, percentage: 0.1, avgResponseTime: 1.2, change: 15.0 }
];

// 运营看板 - 按人员数据
const userUsage = [
    { rank: 1, name: '张伟', deptLevel1: '研发体系', deptLevel2: '芯片研发部', deptLevel3: '前端设计组', deptLevel4: 'AI算法组', deptLevel5: '芯片设计部', project: 'AI4DESIGN', usage: 325680, percentage: 6.3, change: 15.2, topModel: 'GLM4.7', requestCount: 1250 },
    { rank: 2, name: '李娜', deptLevel1: '研发体系', deptLevel2: '验证部', deptLevel3: '功能验证组', deptLevel4: '', deptLevel5: '验证部', project: '智能验证引擎', usage: 312400, percentage: 6.0, change: 8.7, topModel: 'GPT-4', requestCount: 980 },
    { rank: 3, name: '王强', deptLevel1: '研发体系', deptLevel2: '研发部', deptLevel3: '后端设计组', deptLevel4: '', deptLevel5: '研发部', project: '芯片自动化设计', usage: 289000, percentage: 5.6, change: 12.3, topModel: 'Claude3', requestCount: 856 },
    { rank: 4, name: '周涛', deptLevel1: '研发体系', deptLevel2: '芯片研发部', deptLevel3: '前端设计组', deptLevel4: 'AI算法组', deptLevel5: '芯片设计部', project: 'AI4DESIGN', usage: 278000, percentage: 5.3, change: 18.5, topModel: 'GLM4.7', requestCount: 820 },
    { rank: 5, name: '郑浩', deptLevel1: '研发体系', deptLevel2: '研发部', deptLevel3: '后端设计组', deptLevel4: '', deptLevel5: '研发部', project: '芯片自动化设计', usage: 256000, percentage: 4.9, change: 10.2, topModel: 'LLaMA-70B', requestCount: 745 },
    { rank: 6, name: '赵磊', deptLevel1: '生产体系', deptLevel2: '生产部', deptLevel3: '制造组', deptLevel4: '', deptLevel5: '生产部', project: '生产预测模型', usage: 228000, percentage: 4.4, change: 22.1, topModel: 'Whisper', requestCount: 680 },
    { rank: 7, name: '刘洋', deptLevel1: '研发体系', deptLevel2: '封装部', deptLevel3: '封装设计组', deptLevel4: '', deptLevel5: '封装部', project: '封装AI优化', usage: 212000, percentage: 4.1, change: -3.5, topModel: 'StableDiffusion', requestCount: 620 },
    { rank: 8, name: '吴敏', deptLevel1: '研发体系', deptLevel2: '验证部', deptLevel3: '功能验证组', deptLevel4: '', deptLevel5: '验证部', project: '智能验证引擎', usage: 198000, percentage: 3.8, change: 5.8, topModel: 'GPT-4', requestCount: 580 },
    { rank: 9, name: '陈静', deptLevel1: '研发体系', deptLevel2: '测试部', deptLevel3: '测试一组', deptLevel4: '', deptLevel5: '测试部', project: '智能测试系统', usage: 185000, percentage: 3.6, change: 12.5, topModel: 'Qwen-Max', requestCount: 520 },
    { rank: 10, name: '孙莉', deptLevel1: '产品体系', deptLevel2: '产品部', deptLevel3: '需求分析组', deptLevel4: '', deptLevel5: '产品部', project: '产品需求分析', usage: 156000, percentage: 3.0, change: -8.2, topModel: 'GLM4.7', requestCount: 450 }
];

// 项目挂靠历史
const projectHistory = [
    { project: 'AI4DESIGN', startDate: '2024-01-15', endDate: null, status: 'current' },
    { project: '芯片自动化设计', startDate: '2023-06-01', endDate: '2024-01-14', status: 'completed' },
    { project: '智能验证引擎', startDate: '2023-01-01', endDate: '2023-05-31', status: 'completed' }
];

// 使用日志
const useLogs = [
    { id: 'log-001', time: '2025-02-27 14:30:25', user: '张伟', project: 'AI4DESIGN', model: 'GLM4.7', duration: '2.5s', promptTokens: 8500, completionTokens: 4000, tokens: 12500, status: 'success' },
    { id: 'log-002', time: '2025-02-27 14:25:10', user: '李娜', project: '智能验证引擎', model: 'GPT-4', duration: '1.8s', promptTokens: 5200, completionTokens: 3000, tokens: 8200, status: 'success' },
    { id: 'log-003', time: '2025-02-27 14:20:55', user: '王强', project: '芯片自动化设计', model: 'Claude3', duration: '3.2s', promptTokens: 2000, completionTokens: 1500, tokens: 3500, status: 'success' },
    { id: 'log-004', time: '2025-02-27 14:15:30', user: '周涛', project: '封装AI优化', model: 'StableDiffusion', duration: '8.5s', promptTokens: 12000, completionTokens: 3000, tokens: 15000, status: 'success' },
    { id: 'log-005', time: '2025-02-27 14:10:18', user: '郑浩', project: 'AI4DESIGN', model: 'GLM4.7', duration: '1.2s', promptTokens: 4500, completionTokens: 2300, tokens: 6800, status: 'success' },
    { id: 'log-006', time: '2025-02-27 14:05:42', user: '赵磊', project: '生产预测模型', model: 'Whisper', duration: '5.0s', promptTokens: 800, completionTokens: 400, tokens: 1200, status: 'success' },
    { id: 'log-007', time: '2025-02-27 14:00:15', user: '刘洋', project: '智能测试系统', model: 'LLaMA-70B', duration: '4.1s', promptTokens: 6000, completionTokens: 3200, tokens: 9200, status: 'success' },
    { id: 'log-008', time: '2025-02-27 13:55:30', user: '吴敏', project: '芯片自动化设计', model: 'GPT-4', duration: '2.9s', promptTokens: 10000, completionTokens: 5000, tokens: 15000, status: 'success' },
    { id: 'log-009', time: '2025-02-27 13:50:22', user: '陈静', project: '产品需求分析', model: 'Qwen-Max', duration: '1.5s', promptTokens: 2800, completionTokens: 1400, tokens: 4200, status: 'failed' },
    { id: 'log-010', time: '2025-02-27 13:45:08', user: '孙莉', project: 'AI4DESIGN', model: 'GLM4.7', duration: '2.0s', promptTokens: 5000, completionTokens: 2800, tokens: 7800, status: 'success' }
];

// ==================== 工具函数 ====================

// 格式化数字（千分位）
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 计算使用率
function calculateUsageRate(used, quota) {
    if (quota === 0) return 0;
    return Math.round((used / quota) * 100);
}

// 获取使用率状态
function getUsageStatus(rate) {
    if (rate >= 90) return 'danger';
    if (rate >= 70) return 'warning';
    return 'normal';
}

// 获取令牌状态
function getTokenStatus(token) {
    if (token.status === 'revoked') return { text: '已吊销', class: 'badge-error' };
    const now = new Date();
    const expires = new Date(token.expiresAt);
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { text: '已过期', class: 'badge-error' };
    if (daysLeft <= 7) return { text: '即将过期', class: 'badge-warning' };
    return { text: '正常', class: 'badge-success' };
}

// 切换用户角色
function toggleRole() {
    currentUser.role = currentUser.role === 'admin' ? 'user' : 'admin';
    localStorage.setItem('userRole', currentUser.role);

    // 更新UI
    updateUIBasedOnRole();
    showToast('success', '角色切换', `已切换为${currentUser.role === 'admin' ? '管理员' : '普通用户'}身份`);

    // 刷新当前页面
    renderCurrentPage();
}

// 根据角色更新UI
function updateUIBasedOnRole() {
    const adminElements = document.querySelectorAll('.admin-only');
    if (currentUser.role === 'admin') {
        adminElements.forEach(el => el.classList.remove('hidden'));
    } else {
        adminElements.forEach(el => el.classList.add('hidden'));
    }
}

// 生成唯一ID
function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 计算日期差（天数）
function getDaysDiff(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

// 初始化
function initDataModels() {
    // 从localStorage读取角色
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
        currentUser.role = savedRole;
    }
}
