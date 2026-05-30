# 经历仓库 — 经历小屋

通过"经历小屋"将工作经历具象化：选择一个方向，走进你的小屋，用 5 个房间 × 6 件物品 × 3 道问答，系统化梳理每一段经历。

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)

## 功能

- **经历小屋** — 5 个房间（客厅/书房/厨房/卧室/阳台），每个房间 6 件物品，每件物品 3 道属性问答
- **等距视角渲染** — Canvas 2D 等距投影，物品外观随问答实时变化
- **拖拽摆放** — 在小屋中拖动物品到任意位置，网格吸附
- **街区视图** — 所有经历按方向排列为街道建筑
- **背包视图** — 汇总查看每个经历中的所有物品与描述
- **能力图谱** — 雷达图展示各维度能力画像
- **简历生成** — 根据经历自动生成简历，支持 PDF 导出

## 技术栈

| 层 | 技术 |
|---|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 6 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 渲染 | Canvas 2D 等距投影 |
| PDF | jsPDF + html2canvas |
| 后端框架 | FastAPI |
| 数据库 | SQLite (aiosqlite) |

## 环境要求

- **Node.js** ≥ 18
- **Python** ≥ 3.11

## 快速启动

### 1. 克隆仓库

```bash
git clone <仓库地址>
cd resume-mvp
```

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境（首次）
python -m venv venv

# 激活虚拟环境
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# 安装依赖（首次）
pip install fastapi uvicorn aiosqlite

# 启动
python main.py
```

后端运行在 `http://localhost:8000`，API 文档：`http://localhost:8000/docs`。

### 3. 启动前端

```bash
# 回到项目根目录
cd ..

# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev
```

前端运行在 `http://localhost:5173`，API 请求自动代理到后端。

## 常用命令

```bash
npm run dev        # 启动前端开发服务器
npm run build      # 构建生产版本（输出到 dist/）
npm run preview    # 预览生产构建

python main.py     # 启动后端（在 backend/ 目录下）
```

## 项目结构

```
resume-mvp/
├── backend/
│   ├── main.py              # FastAPI 入口，REST API
│   └── database.py          # SQLite 异步初始化
├── src/
│   ├── views/
│   │   ├── CabinView.vue            # 经历小屋主页面
│   │   ├── HomeView.vue             # 首页
│   │   ├── BrainMapView.vue         # 能力图谱
│   │   ├── ExperienceDetailView.vue # 经历详情
│   │   └── ResumePreviewView.vue    # 简历预览
│   ├── components/cabin/
│   │   ├── CabinCanvas.vue          # 2D 等距小屋渲染
│   │   ├── itemDrawers.ts           # 30 种物品绘制函数
│   │   ├── ItemQuizPanel.vue        # 物品问答面板
│   │   ├── CommunityView.vue        # 街区视图
│   │   └── BackpackView.vue         # 背包/物品栏视图
│   ├── stores/
│   │   ├── experience.ts            # 经历状态管理
│   │   └── resume.ts                # 简历状态管理
│   ├── data/
│   │   ├── itemDefs.ts              # 30 件物品 × 3 题 = 90 题数据
│   │   └── templates.ts             # 简历模板
│   ├── types/
│   │   ├── cabin.ts                 # Cabin 领域类型
│   │   └── resume.ts                # 简历类型
│   ├── utils/
│   │   ├── answerMap.ts             # 答案→描述映射
│   │   └── storage.ts               # 本地存储 & API
│   └── router/
│       └── index.ts                 # 路由配置
├── package.json
├── vite.config.ts
└── README.md
```

## 数据规模

| 维度 | 数量 |
|------|------|
| 房间 | 5 个（客厅、书房、厨房、卧室、阳台） |
| 物品 | 30 件（每房间 6 件） |
| 问答 | 90 道（每件物品 3 道属性题） |
| 属性维度 | 形态、大小、色调、状态、密度、纹样 |

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 经历卡片列表 |
| `/cabin` | 经历小屋 | 选择方向 → 探索房间 → 问答 → 完成 |
| `/brain` | 能力图谱 | 雷达图展示能力画像 |
| `/experiences/:id` | 经历详情 | 查看房间与物品 |
| `/resume` | 简历预览 | 生成并导出 PDF |

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
