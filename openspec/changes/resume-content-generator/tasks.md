## 1. 后端基础与 LLM 接入

- [x] 1.1 在 `requirements.txt` 中添加 `openai` 依赖，安装并验证
- [x] 1.2 创建 `llm_service.py` 封装 LLM 调用逻辑：读取环境变量 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`，提供统一的 `generate_resume_content(module_type, prompt)` 方法；使用 `asyncio.Semaphore(3)` 限制并发 LLM 请求数；设置 `response_format: { type: "json_object" }` 强制 JSON 输出，解析失败自动重试一次
- [x] 1.3 创建 `module_mapping.py`：定义 `MODULE_CONTEXT_MAP` 映射表，将简历模块（internship/project/self_intro/skills）关联到 prompt 模板文件名
- [x] 1.4 创建 `prompts/` 目录，为每个模块编写 prompt 模板文件（`internship.txt`、`project.txt`、`self_intro.txt`、`skills.txt`），每个文件含 system prompt + 输出 JSON schema 描述 + `{context}` 和 `{resume_text}` 占位符
- [x] 1.5 在 `main.py` 中新增 `POST /api/generate` SSE 端点：接收 `{ modules: string[], contextTexts: { [roomId]: string }, resumeText?: string }`，逐模块读取 prompt 模板 → 填充占位符 → 调用 `llm_service`，用 `request.is_disconnected()` 检测客户端断连并及时终止；每完成一个模块推送 `module_done`（含 module + 结构化 JSON），失败推送 `module_error`，全部完成推送 `all_done`
- [x] 1.6 在 `database.py` 中新增 `ai_results` 表：`id TEXT PK, module_type TEXT, content_json TEXT, source_experience_ids TEXT, created_at TEXT, updated_at TEXT`
- [x] 1.7 在 `main.py` 中新增 `POST /api/ai-results` 和 `GET /api/ai-results` 端点：支持按 module_type 写入/更新和查询历史生成结果
- [x] 1.8 添加 `GET /api/llm/status` 端点：检查 `LLM_API_KEY` 是否已配置，返回 `{ configured: boolean }`

## 2. 前端简历文件解析与上下文构建

- [x] 2.1 安装前端依赖 `pdfjs-dist` 和 `mammoth`
- [x] 2.2 创建 `src/utils/fileParser.ts`：实现 `parsePDF(file: File): Promise<string>` 和 `parseWord(file: File): Promise<string>`，统一返回纯文本
- [x] 2.3 处理解析异常：文件损坏、加密、格式不支持等情况，返回明确错误信息
- [x] 2.4 创建 `src/utils/contextBuilder.ts`：遍历用户选定经历的 `itemAnswers`，利用 `itemDefs.ts` 将每个 prop:val 对转为中文描述（如 `form: loveseat` → "协作涉及1-2个职能角色"），按房间（RoomId）分组聚合；多段经历以 `【经历：{title}】` 开头分段标注，避免 LLM 混淆不同经历信息；输出 `Record<RoomId, string>`
- [x] 2.5 创建 `src/types/aiGenerate.ts`：为每个模块定义输出接口（`InternshipContent { company, role, period, bullets: string[] }`、`SelfIntroContent { summary, highlights: string[] }` 等），与 `prompts/` 中各模板的 JSON schema 一一对应；扩展 `resumeStore` 新增 `aiGenerated: Record<ModuleType, ModuleContent>` 字段

## 3. 模块选择 UI

- [x] 3.1 创建 `src/views/AIGenerateView.vue`：实现三步向导——① 选经历 → ② 选模块 + 上传简历 → ③ 生成预览
- [x] 3.2 实现经历选择组件（第一步）：从 `experienceStore` 加载所有经历，默认全选，支持用户勾选/取消；无经历时提示引导跳转 QA 页面
- [x] 3.3 定义可选模块列表配置（实习经历、自我评价、项目经历、技能特长），每个模块关联对应的 QA 房间 ID
- [x] 3.4 实现 QA 数据检测逻辑：遍历已选经历，检查每个模块关联房间下是否有已回答的物品数据，有数据的模块默认勾选并高亮推荐
- [x] 3.5 添加文件上传组件：支持拖拽和点击上传，校验文件类型（PDF/.docx），展示解析后的文本摘要
- [x] 3.6 在 `router/index.ts` 中注册 `/resume/ai-generate` 路由

## 4. AI 生成流程与状态管理

- [x] 4.1 创建 `src/stores/aiGenerate.ts`（Pinia store）：管理 `{ selectedExperienceIds: string[], modules: ModuleState[] }`，每个模块包含 `status: pending/generating/done/error`、`content: ModuleContent | null`、`error?: string`；实现 `loadHistory()` action 从 `GET /api/ai-results` 恢复历史结果
- [x] 4.2 实现 `generateModules(selectedModules: string[])` action：用 `contextBuilder` 将已选经历转为中文描述，通过 `AbortController` + `fetch` 连接 `/api/generate` SSE 端点，监听 `module_done`/`module_error`/`all_done` 事件；收到 `module_done` 后立即解析 JSON 并调用 `POST /api/ai-results` 持久化；在组件 `onUnmounted` 和 `beforeunload` 中调用 `abort()` 断开连接
- [x] 4.3 在 `AIGenerateView.vue` 中集成 store：页面 `onMounted` 调用 `loadHistory()` 恢复历史结果；展示各模块实时状态（待生成/生成中加载动画/已完成/失败重试按钮）
- [x] 4.4 实现单模块重新生成功能：调用同一 SSE 端点仅传单个模块，收到结果后覆盖 `POST /api/ai-results` 中该模块旧记录，更新 store

## 5. 生成内容编辑与预览

- [x] 5.1 扩展 `src/views/ResumePreviewView.vue`：在预览页增加"AI 生成内容"区域，从 `resumeStore.aiGenerated` 读取结构化数据展示各模块生成结果
- [x] 5.2 实现模块内联编辑：每个生成模块支持点击进入编辑模式（根据模块类型展示对应表单字段），修改后实时更新预览并同步持久化
- [x] 5.3 实现"确认并写入"逻辑：将 AI 生成内容（含编辑后）写入 `resumeStore` 对应字段，供简历模板渲染
- [x] 5.4 确保现有 PDF 导出流程（jspdf + html2canvas）正确包含 `resumeStore.aiGenerated` 中的内容

## 6. 集成与配置

- [x] 6.1 在 `.env.example` 中添加 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL` 配置示例
- [x] 6.2 在前端首页或导航中添加"AI 生成简历"入口，调用 `/api/llm/status` 判断是否显示
- [x] 6.3 端到端测试：选经历 → 上传 PDF → 选择模块 → 生成 → 预览编辑 → 刷新页面验证恢复 → 下载 PDF 完整流程验证
