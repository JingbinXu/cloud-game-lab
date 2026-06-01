# OpenSpec 使用指南

本项目使用 OpenSpec 管理功能变更的全生命周期：提案 → 规格 → 设计 → 任务 → 实施 → 归档。

## 项目背景

**项目名**：cloud-game-lab（经历小屋）

通过"经历小屋"将工作经历具象化：选择一个方向，走进你的小屋，用 5 个房间 × 6 件物品 × 3 道问答，系统化梳理每一段经历，并自动生成简历。

| 层 | 技术 |
|---|------|
| 前端 | Vue 3 + TypeScript + Vite 6 + Pinia + Canvas 2D |
| 后端 | FastAPI + SQLite (aiosqlite) |
| PDF | jsPDF + html2canvas |
| 3D 渲染 | Three.js（可选） |

## 目录结构

```
openspec/
├── OPENSPEC.md          ← 本文件
├── config.yaml          ← 项目级配置
├── changes/             ← 活跃变更
│   └── <change-name>/
│       ├── .openspec.yaml
│       ├── proposal.md  ← 为什么做
│       ├── design.md    ← 怎么做
│       ├── specs/       ← 做什么（需求规格）
│       │   └── <capability>/
│       │       └── spec.md
│       └── tasks.md     ← 实施任务清单
└── specs/               ← 已归档的能力规格（归档后生成）
```

## 常用命令

### 探索想法（不写代码，只思考）
```
/openspec-explore
```
用于头脑风暴、调查问题、对比方案。探索模式下不会写任何实现代码。

### 提出变更（一步到位生成所有产出物）
```
/openspec-propose
```
描述你想构建的功能，自动生成 proposal.md、design.md、specs/、tasks.md。

### 查看变更状态
```bash
openspec list --json
openspec status --change "<name>"
```

### 实施变更
```
/openspec-apply-change
```
按 tasks.md 中的任务清单逐步实施，每完成一个任务自动勾选。

### 归档变更
```
/openspec-archive-change
```
实施完成后归档，变更移入 `changes/archive/`，规格合并到 `specs/`。

## 工作流程

```
   想法
    │
    ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│  探索       │───▶│  提案       │───▶│  实施       │
│ /openspec-  │    │ /openspec-  │    │ /openspec-  │
│  explore    │    │  propose    │    │  apply      │
└────────────┘    └────────────┘    └─────┬──────┘
                                          │
                                          ▼
                                   ┌────────────┐
                                   │  归档       │
                                   │ /openspec-  │
                                   │  archive    │
                                   └────────────┘
```

## 产出物说明

| 产出物 | 作用 | 写给谁 |
|--------|------|--------|
| `proposal.md` | 为什么要做这个变更，影响范围 | 所有人 |
| `design.md` | 技术方案、关键决策、风险权衡 | 开发者 |
| `specs/<name>/spec.md` | 可测试的需求规格（WHEN/THEN 场景） | 开发者 + QA |
| `tasks.md` | 实施任务清单，带复选框跟踪进度 | 开发者 |

## 写好 Spec 的要点

每个需求规格使用以下格式：

```markdown
### Requirement: 需求名称
系统 SHALL 做某事（用 SHALL/MUST 表示强制要求）。

#### Scenario: 场景名称
- **WHEN** 某个条件
- **THEN** 预期结果
```

- 一个需求至少一个场景
- 场景标题必须用 `####`（4个#）
- 场景应可直接转化为测试用例

## 当前活跃变更

```bash
openspec list --json
```

> 运行上述命令查看当前有哪些进行中的变更。

## 配置文件说明（config.yaml）

```yaml
schema: spec-driven          # 使用 spec-driven 模式（提案→规格→设计→任务）
context: |                   # 项目上下文（AI 创建产出物时参考）
  Tech stack, conventions...
rules:                       # 各产出物的自定义规则
  proposal:
    - ...
  tasks:
    - ...
```

可在 `config.yaml` 中添加项目特有的约束，AI 在生成产出物时会自动遵循。
