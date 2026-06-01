## Context

项目 `resume-mvp` 已有完整的简历生成链路：
- **前端**：Vue 3 + Vite + Pinia + vue-router，包含 QA 问卷对话（`QAView`）、经历仓库（`experience store`）、简历输入与模板选择（`ResumeInputView`）、简历预览与 PDF 下载（`ResumePreviewView`，使用 jspdf + html2canvas）
- **后端**：FastAPI + aiosqlite，提供经历 CRUD API
- **对话数据**：用户通过 QA 流程填写经历，数据存储在 `experiences` 表，包含 `itemAnswers`（按物品的回答）和 `roomPlacements`（房间布局）

本次变更在此基础上增加 AI 内容生成层：用户上传已有简历（PDF/Word），系统解析内容后，结合 QA 对话上下文，由 LLM 自动生成指定模块的文案，用户确认后可预览并下载。

## Goals / Non-Goals

**Goals:**
- 支持用户上传 PDF/Word 简历，解析提取已有内容
- 提供模块选择 UI，让用户勾选需要 AI 生成的模块（实习经历、自我评价、项目经历等）
- 基于 QA 对话上下文 + 已有简历内容，调用 LLM 生成各模块文案
- 生成后用户可实时预览效果，支持编辑微调
- 最终可导出为 PDF

**Non-Goals:**
- 不做简历评分或 ATS 优化（后续迭代）
- 不支持多人协作编辑
- 不实现完整的在线文档编辑器（仅支持生成内容的简单修改）
- **不做 Word 导出**（MVP 仅支持 PDF，Word 导出作为后续迭代，需引入独立技术路径如 docx npm 包）

## Decisions

### 决策 1：简历文件解析方案

**选择**：前端解析（pdf.js + mammoth.js）

**理由**：
- 避免上传大文件到后端，降低服务端负载
- pdf.js 可在浏览器端提取 PDF 文本；mammoth.js 可将 Word 转为 HTML/纯文本
- 解析结果仅用于提供上下文，不要求 100% 格式保真

**备选**：后端解析（python-docx + PyPDF2）——需处理文件上传和临时存储，增加复杂度

### 决策 2：AI 生成的调用位置

**选择**：后端代理调用 LLM API

**理由**：
- API Key 不暴露给前端
- 后端可统一管理请求频率、错误处理和日志
- 便于未来切换模型供应商

**备选**：前端直接调用——简单但不安全，API Key 需前端持有

### 决策 3：LLM 供应商

**选择**：通过环境变量配置，首期支持 OpenAI 兼容接口（包括 OpenAI、Claude、国产大模型）

**理由**：
- OpenAI Chat Completions API 格式已成为事实标准，多数国产模型兼容
- 用户可自行配置 API Key 和 base_url
- 后端通过统一抽象层调用，未来切换模型无需改业务代码

### 决策 4：多模块生成的接口模式

**选择**：后端 SSE（Server-Sent Events）流式接口，逐模块推送结果

**理由**：
- 4 个模块串行调用 LLM 总耗时 30-60 秒，同步 HTTP 请求必然超时或前端体验极差
- SSE 允许后端每完成一个模块立即推送 `module_done` 事件，前端即时更新对应模块状态
- 单模块失败仅推送 `module_error`，不影响其他已完成模块，结果不丢失
- SSE 是浏览器原生 API（`EventSource`），无需额外依赖，比 WebSocket 更轻量

**备选**：
- 同步请求——简单但多模块场景下必然超时
- WebSocket——双向通信过重，本场景只需服务端向客户端单向推送
- 轮询——浪费资源，增加延迟

**接口设计**：
```
POST /api/generate
Content-Type: text/event-stream

事件格式：
event: module_done
data: {"module": "internship", "content": "..."}

event: module_error
data: {"module": "self_intro", "error": "LLM timeout"}

event: all_done
data: {}
```

### 决策 5：QA 数据与简历模块的映射方案

**选择**：后端维护静态映射表，将 QA 房间/物品关联到简历模块

**理由**：
- QA 数据结构是房间（room）→ 物品（item）→ 问题（prop: val）三级，与简历模块名称无直接对应
- 需要明确的映射关系，后端才能从 QA 数据中正确抽取上下文并组装 prompt
- 静态映射表可独立维护，新增/调整模块无需改业务逻辑

**映射关系**（基于现有 5 个房间语义）：

```python
MODULE_CONTEXT_MAP = {
    "internship": {
        "label": "实习经历",
        "source_rooms": ["kitchen"],  # 厨房·执行与产出
        "prompt_template": "internship",
    },
    "project": {
        "label": "项目经历",
        "source_rooms": ["kitchen", "balcony"],  # 执行与产出 + 成果与影响
        "prompt_template": "project",
    },
    "self_intro": {
        "label": "自我评价",
        "source_rooms": [],  # 使用全部房间的汇总上下文
        "prompt_template": "self_intro",
    },
    "skills": {
        "label": "技能特长",
        "source_rooms": ["study"],  # 书房·专业与学习
        "prompt_template": "skills",
    },
}
```

后端接收到 `modules` 列表后，按映射从 QA 数据中抽取相关房间的物品回答，转为自然语言描述后拼装进 prompt。

**val→中文的转换在前端完成**：前端 `src/utils/contextBuilder.ts` 利用已有的 `itemDefs.ts`，将用户的 `itemAnswers`（prop: val）转为中文描述字符串（如 `"会议负载：每周参加3-5个固定会议，占工作时间20%-40%"`），按房间分组后作为纯文本发给后端。后端无需维护 val 映射，前端新增物品时自动从 `itemDefs` 读取，零同步成本。

**多段经历的合并策略**：每段经历以 `【经历：{title}】` 开头作为分段标注，其下各房间数据作为子段落依次拼接。这样 LLM 能清晰区分不同经历的上下文，避免混淆两家公司的信息。示例：
```
【经历：字节跳动产品实习】
厨房·执行与产出：同时跟进3个需求，文档产出量中等...
书房·专业与学习：新接触2个专业知识领域...

【经历：腾讯项目实践】
厨房·执行与产出：主导1个完整项目，独立撰写PRD...
```

### 决策 6：生成内容的传递方式

**选择**：后端 SSE 逐模块返回，前端写入 Pinia store，与现有 `resumeStore` 对接

**理由**：
- 复用现有简历预览流程，无需重建数据管道
- store 中的内容可直接驱动模板渲染和 PDF 导出
- 用户编辑后也走同一路径，保持一致性

### 决策 7：简历文件上传存储

**选择**：前端读取后不持久化上传文件，仅将解析文本存入 store

**理由**：
- 简历文件仅作为一次性上下文使用
- 减少后端存储和隐私风险
- 如需后续参考，用户可再次上传

### 决策 8：LLM 输出结构契约与 prompt 模板管理

**选择**：后端 `prompts/` 目录存放模块级 prompt 模板文件，prompt 中指定 JSON 输出格式；前端定义对应的 TypeScript 接口承接

**理由**：
- 简历模板渲染需要结构化数据（如 `{ bullets: string[] }`），LLM 返回纯文本无法直接对接
- prompt 模板与 TS 接口一一对应，确保输出契约清晰可验证
- prompt 文件独立于业务代码，调优 prompt 不需要改 Python 逻辑

**实现方案**：
- 后端：每个模块一个文件（`prompts/internship.txt`、`prompts/self_intro.txt` 等），内容含 system prompt + 输出 JSON schema 描述 + 占位符 `{context}` 和 `{resume_text}`
- 前端：`src/types/aiGenerate.ts` 定义每个模块的输出接口（如 `InternshipContent { company, role, period, bullets: string[] }`）
- `resumeStore` 新增 `aiGenerated: Record<ModuleType, ModuleContent>` 字段，类型化承接 AI 输出
- LLM 调用时设置 `response_format: { type: "json_object" }`（OpenAI 兼容接口支持），后端做 JSON parse 校验，格式不符则重试一次

### 决策 9：AI 生成结果持久化

**选择**：新增 `ai_results` 表，SSE 每个模块完成后前端立即调用 `POST /api/ai-results` 持久化

**理由**：
- 纯内存 store 刷新即丢失，用户已完成的生成和编辑结果会全部消失
- 持久化后页面刷新可从 `GET /api/ai-results` 恢复，无需重新调 LLM
- 为未来"查看历史生成版本"留下数据基础

**表结构**：
```sql
CREATE TABLE ai_results (
    id TEXT PRIMARY KEY,
    module_type TEXT NOT NULL,        -- internship / self_intro / project / skills
    content_json TEXT NOT NULL,       -- LLM 返回的结构化 JSON
    source_experience_ids TEXT NOT NULL, -- JSON 数组，来源经历 ID 列表
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## Risks / Trade-offs

- **[解析质量]** PDF/Word 格式多样，解析可能丢失结构 → 前端解析仅作辅助上下文，核心素材仍以 QA 对话数据为主；提供手动编辑兜底
- **[LLM 生成质量]** 单次生成可能不够理想 → 提供重新生成和手动编辑能力
- **[API Key 管理]** 用户自行配置 Key 增加使用门槛 → 提供清晰的配置引导界面，支持环境变量预设
- **[延迟]** LLM 生成多模块内容耗时较长 → SSE 逐模块推送，前端实时展示进度
- **[连接中断]** 用户关闭页面时后端 LLM 调用仍在进行，浪费 API 额度 → 前端用 `AbortController` + `onUnmounted` 断开连接；后端用 `request.is_disconnected()` 检测客户端断连，立即终止生成循环
- **[并发限流]** 多用户同时生成会触发 LLM API RPM 限制 → 后端用 `asyncio.Semaphore(3)` 限制并发 LLM 请求数，超出排队等待
- **[隐私]** 简历内容发送至第三方 LLM → 明确告知用户数据流向，支持本地模型（通过自定义 base_url）

## Migration Plan

无数据迁移需求。本次为纯新增功能，不影响现有 API 和数据结构。

新增依赖：
- 后端：`openai`（Python SDK，兼容多供应商）
- 前端：`pdfjs-dist`、`mammoth`

## Open Questions

- 是否需要支持用户自行选择 LLM 供应商，还是统一由管理员配置？（当前方案：管理员通过环境变量配置）
