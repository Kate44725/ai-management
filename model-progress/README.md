# 模型需求进展可视化页面

## 概述

模型需求进展可视化页面用于展示模型需求从提交到验收的完整生命周期，包含6个阶段的进度追踪、SLA管理和统计功能。

## 流程阶段

| 阶段 | 名称 | SLA (天) | 说明 |
|------|------|----------|------|
| 1 | 需求提交 | 1 | 收集业务方提出的模型需求 |
| 2 | 需求评审 | 3 | 技术团队评审需求可行性 |
| 3 | 模型部署 | 5 | 部署模型到测试环境 |
| 4 | 性能评测 | 7 | 评测模型性能指标 |
| 5 | 正式上线 | 2 | 部署到生产环境 |
| 6 | 验收确认 | 3 | 业务方验收确认 |

**总SLA**: 21天

## 功能特性

### 1. 统计概览
- 显示总需求数量
- 显示各阶段的需求数量

### 2. 提交需求
- 点击顶部"提交需求"卡片弹出表单
- 填写需求名称、描述、申请人、部门、目标模型、优先级

### 3. 需求列表
- 展示所有模型需求
- 每个需求显示：名称、描述、申请人、部门、目标模型、优先级、创建时间
- 6阶段步骤条显示当前进度

### 4. 阶段进度
- 点击步骤条可快速推进到指定阶段
- 步骤下方显示：
  - SLA: X天（标准时长）
  - 实际用时（绿色=按时，红色=超时）

### 5. CRUD操作
- 新建需求
- 编辑需求（可修改当前阶段）
- 删除需求

## 数据结构

```javascript
{
    id: number,
    name: string,           // 需求名称
    description: string,   // 需求描述
    requester: string,     // 申请人
    department: string,     // 所属部门
    targetModel: string,   // 目标模型
    priority: string,      // 优先级: high/medium/low
    currentStage: string,   // 当前阶段
    createdAt: string,     // 创建日期
    stages: {
        collection: { completed: boolean, date: string, note: string },
        review: { completed: boolean, date: string, note: string },
        deployment: { completed: boolean, date: string, note: string },
        evaluation: { completed: boolean, date: string, note: string },
        launch: { completed: boolean, date: string, note: string },
        acceptance: { completed: boolean, date: string, note: string }
    },
    status: string         // 状态: in_progress/completed/cancelled
}
```

## 文件结构

```
model-progress/
├── index.html        # 主页面
├── css/
│   └── styles.css   # 样式文件
└── js/
    └── app.js      # 页面逻辑
```

## 技术栈

- HTML5 + CSS3
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6+)
- 无后端依赖，数据仅内存存储

## 使用说明

1. 直接在浏览器中打开 `index.html`
2. 点击"提交需求"按钮添加新需求
3. 点击需求卡片中的步骤条推进进度
4. 点击"编辑"修改需求信息
5. 点击"删除"移除需求
