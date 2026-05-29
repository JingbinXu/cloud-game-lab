# 记忆树 — 经历工坊

一个帮助求职者系统化梳理工作经历、自动生成定制简历的 Web 应用。

通过引导式问卷收集你的项目经历，再根据目标岗位 JD 智能匹配并生成专业简历，支持 PDF 导出。

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)

## 功能

- **引导式问卷** — 结构化问题帮你梳理日常工作、协作方式、项目成果、个人成长等维度
- **经历档案柜** — 集中管理所有经历条目，随时增删改查
- **3D 可视化** — Three.js 渲染经历关系图谱，直观查看能力全景
- **JD 匹配生成** — 粘贴目标岗位 JD，选择模板，自动生成匹配度最高的简历
- **4 套简历模板** — 经典专业 / 现代简洁 / 双栏布局 / 创意设计
- **PDF 导出** — 一键预览并导出为 PDF 文件

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 6 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 3D 渲染 | Three.js |
| PDF | jsPDF + html2canvas |
| 后端框架 | FastAPI |
| 数据库 | SQLite (aiosqlite) |

## 项目结构

```
cloud-game-lab/
└── resume-mvp/
    ├── src/
    │   ├── views/            # 7 个页面视图
    │   ├── components/       # 公共组件
    │   ├── stores/           # Pinia store（经历 & 简历）
    │   ├── data/             # 问卷题目 & 简历模板定义
    │   ├── utils/            # 答案映射、数据持久化
    │   ├── types/            # TypeScript 类型
    │   └── router/           # 路由配置
    ├── backend/
    │   ├── main.py           # FastAPI 入口 + RESTful API
    │   ├── database.py       # SQLite 数据层
    │   └── requirements.txt
    └── index.html
```

## 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.10

### 启动前端

```bash
cd resume-mvp
npm install
npm run dev
```

访问 http://localhost:5173

### 启动后端

```bash
cd resume-mvp/backend
pip install -r requirements.txt
python main.py
```

后端运行在 http://localhost:8000，前端开发服务器已配置 `/api` 代理。

## 使用流程

1. 进入首页，选择「记录我的经历」
2. 完成引导式问卷，保存经历
3. 在档案柜中管理和回顾所有经历
4. 选择「生成定制简历」，粘贴目标 JD
5. 挑选模板和经历条目，生成并导出简历

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/experiences` | 获取所有经历 |
| GET | `/api/experiences/{id}` | 获取单个经历 |
| POST | `/api/experiences` | 创建经历 |
| PUT | `/api/experiences/{id}` | 更新经历 |
| DELETE | `/api/experiences/{id}` | 删除经历 |

## License

MIT