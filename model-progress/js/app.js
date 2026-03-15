// 阶段定义
const STAGES = [
    { id: 'collection', name: '需求提交', sla: 1 },
    { id: 'review', name: '需求评审', sla: 3 },
    { id: 'deployment', name: '模型部署', sla: 5 },
    { id: 'evaluation', name: '性能评测', sla: 7 },
    { id: 'launch', name: '正式上线', sla: 2 },
    { id: 'acceptance', name: '验收确认', sla: 3 }
];

// 示例数据
const modelRequests = [
    {
        id: 1, name: '智能客服对话模型', description: '基于GLM4的智能客服对话系统，支持多轮对话和意图识别', requester: '张三', department: '产品运营部', targetModel: 'GLM4-9B', priority: 'high', currentStage: 'evaluation', createdAt: '2026-02-01',
        stages: {
            collection: { completed: true, date: '2026-02-01' },
            review: { completed: true, date: '2026-02-03' },
            deployment: { completed: true, date: '2026-02-08' },
            evaluation: { completed: false, date: '' },
            launch: { completed: false, date: '' },
            acceptance: { completed: false, date: '' }
        }
    },
    {
        id: 2, name: '代码审查助手', description: '基于LLaMA的代码审查AI，辅助开发人员自动审查代码质量', requester: '李四', department: '技术研发部', targetModel: 'LLaMA-70B', priority: 'medium', currentStage: 'deployment', createdAt: '2026-01-20',
        stages: {
            collection: { completed: true, date: '2026-01-20' },
            review: { completed: true, date: '2026-01-23' },
            deployment: { completed: false, date: '' },
            evaluation: { completed: false, date: '' },
            launch: { completed: false, date: '' },
            acceptance: { completed: false, date: '' }
        }
    },
    {
        id: 3, name: '数据预测模型', description: '基于历史数据的时间序列预测，用于业务趋势分析', requester: '王五', department: '财务部', targetModel: 'GPT-4', priority: 'high', currentStage: 'acceptance', createdAt: '2026-01-05',
        stages: {
            collection: { completed: true, date: '2026-01-05' },
            review: { completed: true, date: '2026-01-08' },
            deployment: { completed: true, date: '2026-01-15' },
            evaluation: { completed: true, date: '2026-01-25' },
            launch: { completed: true, date: '2026-01-28' },
            acceptance: { completed: false, date: '' }
        }
    },
    {
        id: 4, name: '文档摘要生成器', description: '自动提取长文档关键信息，生成结构化摘要', requester: '赵六', department: '行政管理部', targetModel: 'Claude-3', priority: 'low', currentStage: 'review', createdAt: '2026-02-15',
        stages: {
            collection: { completed: true, date: '2026-02-15' },
            review: { completed: false, date: '' },
            deployment: { completed: false, date: '' },
            evaluation: { completed: false, date: '' },
            launch: { completed: false, date: '' },
            acceptance: { completed: false, date: '' }
        }
    }
];

function getToday() { return new Date().toISOString().split('T')[0]; }
function formatDate(d) { if (!d) return '-'; return d.substring(5); }

function getStats() {
    const stats = { total: modelRequests.length, avgTime: {} };
    STAGES.forEach(s => {
        stats[s.id] = 0;
        stats.avgTime[s.id] = { total: 0, count: 0 };
    });
    modelRequests.forEach(r => {
        stats[r.currentStage]++;
        // 计算每个阶段的平均用时
        STAGES.forEach((stage, idx) => {
            if (r.stages[stage.id].completed && r.stages[stage.id].date) {
                const prevDate = idx === 0 ? r.createdAt : (r.stages[STAGES[idx-1].id].date || r.createdAt);
                const currDate = r.stages[stage.id].date;
                if (prevDate && currDate) {
                    const days = Math.floor((new Date(currDate) - new Date(prevDate)) / (1000*60*60*24));
                    stats.avgTime[stage.id].total += days;
                    stats.avgTime[stage.id].count++;
                }
            }
        });
    });
    // 计算平均用时
    STAGES.forEach(s => {
        const data = stats.avgTime[s.id];
        stats.avgTime[s.id] = data.count > 0 ? Math.round(data.total / data.count * 10) / 10 : 0;
    });
    return stats;
}

function renderPage() {
    const stats = getStats();
    const app = document.getElementById('app');

    let html = '<div class="stats-grid"><div class="stat-card"><div class="stat-value">' + stats.total + '</div><div class="stat-label">总需求</div></div>';
    STAGES.forEach(s => {
        const avg = stats.avgTime[s.id];
        html += '<div class="stat-card"><div class="stat-value">' + stats[s.id] + '</div><div class="stat-label">' + s.name + '</div><div class="stat-avg">平均' + avg + '天</div></div>';
    });
    html += '</div>';

    html += '<div class="submit-card"><div><h3>提交新的模型需求</h3><p>如果您需要AI模型能力，请提交需求申请</p></div><button class="btn btn-primary" onclick="window.location.href=\'submit.html\'">+ 提交需求</button></div>';

    if (modelRequests.length === 0) {
        html += '<div class="empty-state"><p>暂无需求</p></div>';
    } else {
        modelRequests.forEach(req => {
            html += renderRequestCard(req);
        });
    }

    app.innerHTML = html;
}

function renderRequestCard(req) {
    const currentIndex = STAGES.findIndex(s => s.id === req.currentStage);
    const priorityBadge = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }[req.priority];
    const priorityText = { high: '高优先', medium: '中优先', low: '低优先' }[req.priority];

    let stepsHtml = '<div class="progress-steps">';
    STAGES.forEach((stage, index) => {
        let status = index < currentIndex ? 'completed' : (index === currentIndex ? 'active' : 'pending');
        let actualDays = '';
        let timeClass = '';
        if (req.stages[stage.id].completed && req.stages[stage.id].date) {
            const prevDate = index === 0 ? req.createdAt : (req.stages[STAGES[index-1].id].date || req.createdAt);
            const currDate = req.stages[stage.id].date;
            if (prevDate && currDate) {
                actualDays = Math.floor((new Date(currDate) - new Date(prevDate)) / (1000*60*60*24));
                timeClass = actualDays > stage.sla ? 'overdue' : '';
            }
        }

        stepsHtml += '<div class="step-item ' + status + '"><div class="step-circle">' + (status==='completed'?'✓':(index+1)) + '</div><div class="step-label">' + stage.name + '</div><div class="step-info"><span class="step-sla">SLA:' + stage.sla + '天</span>' + (actualDays ? '<span class="step-time ' + timeClass + '">' + actualDays + '天</span>' : '') + '</div></div>';
    });
    stepsHtml += '</div>';

    return '<div class="request-card"><div class="request-header"><div><div class="request-name">' + req.name + '</div><div class="request-meta">申请人: ' + req.requester + ' · ' + req.department + ' · 目标: ' + req.targetModel + ' · ' + formatDate(req.createdAt) + '</div></div><div class="request-actions"><span class="badge ' + priorityBadge + '">' + priorityText + '</span><button class="btn btn-secondary" onclick="alert(\'编辑功能\')">编辑</button><button class="btn btn-danger" onclick="alert(\'删除功能\')">删除</button></div></div><div class="request-body"><div class="request-desc">' + req.description + '</div>' + stepsHtml + '</div></div>';
}

renderPage();
