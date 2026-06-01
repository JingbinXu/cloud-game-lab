## ADDED Requirements

### Requirement: 用户上传简历文件
系统 SHALL 支持用户上传 PDF 或 Word（.docx）格式的简历文件，前端解析提取文本内容作为 AI 生成的上下文。

#### Scenario: 上传 PDF 简历
- **WHEN** 用户选择并上传一个 PDF 文件
- **THEN** 系统使用 pdf.js 解析文件内容，提取纯文本，并在 UI 中展示解析结果摘要

#### Scenario: 上传 Word 简历
- **WHEN** 用户选择并上传一个 .docx 文件
- **THEN** 系统使用 mammoth.js 解析文件内容，提取纯文本，并在 UI 中展示解析结果摘要

#### Scenario: 上传不支持的文件格式
- **WHEN** 用户尝试上传非 PDF/非 .docx 格式的文件
- **THEN** 系统提示"仅支持 PDF 和 Word (.docx) 格式"，拒绝解析

#### Scenario: 解析失败
- **WHEN** 文件解析过程出错（文件损坏、加密等）
- **THEN** 系统提示解析失败，允许用户重新上传或跳过上传直接使用 QA 数据

---

### Requirement: AI 生成简历模块内容
系统 SHALL 基于 QA 对话上下文和已有简历内容，调用 LLM 生成用户选定的简历模块文案。前端使用 `contextBuilder` 将已选经历的 QA 数据转为中文描述文本（`contextTexts`），后端收到后直接填入 prompt 模板发送给 LLM。

#### Scenario: 生成实习经历模块
- **WHEN** 用户选定"实习经历"模块并触发生成
- **THEN** 前端将已选经历中 `kitchen`（执行与产出）房间的回答转为中文描述（多段经历以"【经历：{title}】"分段标注），后端填入 `internship.txt` prompt 模板，调用 LLM 生成，通过 SSE 推送结构化 JSON 结果

#### Scenario: 生成自我评价模块
- **WHEN** 用户选定"自我评价"模块并触发生成
- **THEN** 前端将全部 5 个房间的 QA 数据转为中文描述（多段经历分段标注），后端填入 `self_intro.txt` prompt 模板，调用 LLM 生成，通过 SSE 推送结果

#### Scenario: 同时生成多个模块
- **WHEN** 用户同时选定多个模块触发生成
- **THEN** 后端通过 SSE 逐模块调用 LLM，每完成一个模块立即推送 `module_done` 事件（含 module 名称和生成内容），前端实时更新对应模块状态

#### Scenario: LLM 调用失败
- **WHEN** LLM API 返回错误或超时
- **THEN** 后端推送 `module_error` 事件（含 module 名称和错误信息），前端提示该模块失败并显示重试按钮，已成功的模块结果保留

#### Scenario: LLM 返回格式不符
- **WHEN** LLM 返回内容无法按预期 JSON schema 解析
- **THEN** 后端自动重试一次；仍失败则推送 `module_error`，错误信息为"生成内容格式异常，请重试"

---

### Requirement: 生成内容可重新生成
系统 SHALL 允许用户对已生成的任意模块重新生成，覆盖原有结果。

#### Scenario: 重新生成单个模块
- **WHEN** 用户对某个已生成模块点击"重新生成"
- **THEN** 系统重新调用 LLM 生成该模块内容，生成完成后替换原有内容，保留其他模块不变

---

### Requirement: 生成内容可编辑
系统 SHALL 允许用户在预览前对 AI 生成的内容进行手动编辑修改。

#### Scenario: 编辑生成的文案
- **WHEN** 用户在预览界面对某个模块的生成内容进行修改
- **THEN** 修改立即反映在预览中，最终导出的 PDF 使用修改后的版本

---

### Requirement: LLM 服务配置
系统 SHALL 支持通过环境变量配置 LLM API 的接入信息。

#### Scenario: 配置 OpenAI API
- **WHEN** 管理员设置环境变量 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`
- **THEN** 后端使用该配置调用 LLM API，无需修改代码

#### Scenario: 未配置 API Key
- **WHEN** 环境变量 `LLM_API_KEY` 未设置
- **THEN** AI 生成功能禁用，前端隐藏生成入口或提示配置

---

### Requirement: 生成内容写入简历数据
系统 SHALL 将 AI 生成的模块内容写入现有简历数据结构，与现有预览和导出流程无缝对接。

#### Scenario: 生成内容写入 store
- **WHEN** 用户确认某个模块的生成结果
- **THEN** 该内容写入 `resumeStore` 对应字段，预览视图立即更新显示

#### Scenario: 导出包含 AI 内容的 PDF
- **WHEN** 用户在预览页面点击下载
- **THEN** 导出的 PDF 包含所有 AI 生成内容（含用户编辑后的版本）

---

### Requirement: AI 生成结果持久化
系统 SHALL 将每个模块的 AI 生成结果持久化存储，用户刷新页面后可恢复，无需重新生成。

#### Scenario: 生成完成后立即持久化
- **WHEN** 前端收到 SSE `module_done` 事件
- **THEN** 前端立即调用 `POST /api/ai-results` 将该模块的结构化内容存入 `ai_results` 表

#### Scenario: 页面加载时恢复历史结果
- **WHEN** 用户进入 AI 生成页面且 `ai_results` 表中存在历史记录
- **THEN** 前端从 `GET /api/ai-results` 加载历史结果，写入 `aiGenerate` store，各模块状态直接显示为"已完成"，用户可继续编辑

#### Scenario: 重新生成覆盖旧结果
- **WHEN** 用户对某个模块触发重新生成
- **THEN** 新结果写入时覆盖 `ai_results` 表中该模块的旧记录（按 module_type 唯一），前端 store 同步更新

---

### Requirement: Prompt 模板与输出结构定义
系统 SHALL 为每个简历模块定义独立的 prompt 模板文件和对应的输出 JSON schema。

#### Scenario: prompt 模板存放与加载
- **WHEN** 后端处理生成请求
- **THEN** 从 `prompts/` 目录读取对应模块的 `.txt` 文件，填充 `{context}`（中文 QA 描述）和 `{resume_text}`（上传简历文本）占位符后发送给 LLM

#### Scenario: 结构化输出写入 resumeStore
- **WHEN** 前端收到 LLM 返回的 JSON 内容
- **THEN** 按 `src/types/aiGenerate.ts` 中定义的接口解析后写入 `resumeStore.aiGenerated[moduleType]`，简历模板渲染时从该字段读取
