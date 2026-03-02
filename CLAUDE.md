# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI算力管理平台 - An embedded web application for managing AI computing resources in semiconductor/IT departments. Default runs in admin mode without login.

## Technology Stack

- Pure HTML + JavaScript (ES6+)
- Tailwind CSS via CDN
- Chart.js via CDN
- No build tools - runs directly in browser

## Common Commands

```bash
# Open directly in browser
open dashboard.html      # macOS
start dashboard.html     # Windows

# Serve locally
npx serve .
python -m http.server 8000
```

## File Structure

```
├── dashboard.html      # Main SPA framework (all pages embedded, JS navigation)
├── css/
│   └── styles.css     # Custom styles (animations, transitions)
└── js/
    ├── dashboard.js   # Page interactions, navigation, chart rendering
    └── data-models.js # Data models and demo data
```

## Architecture

### Single Page Application

All pages are in `dashboard.html` and switched via JavaScript navigation:

1. **我的算力** - Token usage, project affiliation, token management
2. **额度管理** - Collapsible menu:
   - 我的申请 (My Applications)
   - 配额审批 (Quota Approval - admin only)
   - 用户额度 (User Quota - admin only)
3. **运营看板** - Operations dashboard with dimension switching
4. **项目管理** - Project management (admin only)

### Data Layer (data-models.js)

Contains all demo data and model functions:
- `models` - 10 AI models (GLM4.7, GPT-4, Claude3, LLaMA-70B, etc.)
- `departments` - 10 departments
- `gpuServers` - 200 GPUs across 20 servers
- `users`, `projects`, `tokens`, `quotas` - Business entities

### UI Components

- **Toast**: 4 types (success/error/warning/info), auto-dismiss 3s
- **Modal**: Unified modal for forms/confirmations
- **Charts**: Line charts (trends), donut charts (distribution)
- **Role Control**: Admin menus hidden for regular users via localStorage

## Key Patterns

- Tailwind CSS for styling + custom CSS for animations
- ES6+ features (arrow functions, template literals, destructuring)
- Chart.js for data visualization
- localStorage for role persistence
