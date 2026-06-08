import type { RoomId } from './cabin'

// ============================================================
// 模块类型定义
// ============================================================

export type ModuleType = 'internship' | 'project' | 'self_intro' | 'skills'

/** 模块元信息（用于 UI 展示） */
export interface ModuleMeta {
  type: ModuleType
  label: string
  description: string
  /** 关联的 QA 房间，用于检测是否有数据 */
  sourceRooms: RoomId[]
}

/** 所有可选模块 */
export const MODULE_LIST: ModuleMeta[] = [
  {
    type: 'internship',
    label: '实习经历',
    description: '基于厨房·执行与产出数据，生成润色后的实习经历描述',
    sourceRooms: ['kitchen'],
  },
  {
    type: 'project',
    label: '项目经历',
    description: '基于执行与产出 + 成果与影响数据，生成项目经历描述',
    sourceRooms: ['kitchen', 'balcony'],
  },
  {
    type: 'self_intro',
    label: '自我评价',
    description: '综合全部房间数据，生成个性化自我评价',
    sourceRooms: ['living', 'study', 'kitchen', 'bedroom', 'balcony'],
  },
  {
    type: 'skills',
    label: '技能特长',
    description: '基于书房·专业与学习数据，生成技能特长描述',
    sourceRooms: ['study'],
  },
]

// ============================================================
// 各模块 LLM 输出结构（与 prompts/ 下各模板的 JSON schema 对应）
// ============================================================

export interface InternshipContent {
  company: string
  role: string
  period: string
  bullets: string[]
}

export interface ProjectContent {
  projectName: string
  role: string
  period: string
  description: string
  bullets: string[]
}

export interface SelfIntroContent {
  summary: string
  highlights: string[]
}

export interface SkillsContent {
  categories: Array<{
    name: string
    items: string[]
  }>
  summary: string
}

/** 模块类型 → 输出内容类型的映射 */
export interface ModuleContentMap {
  internship: InternshipContent
  project: ProjectContent
  self_intro: SelfIntroContent
  skills: SkillsContent
}

/** 联合类型，任意模块的输出 */
export type ModuleContent =
  | InternshipContent
  | ProjectContent
  | SelfIntroContent
  | SkillsContent

// ============================================================
// 模块状态（用于 Pinia store）
// ============================================================

export type ModuleStatus = 'pending' | 'generating' | 'done' | 'error'

export interface ModuleState {
  type: ModuleType
  status: ModuleStatus
  content: ModuleContent | null
  error?: string
}

// ============================================================
// SSE 事件类型
// ============================================================

export interface ModuleDoneEvent {
  module: ModuleType
  content: ModuleContent
}

export interface ModuleErrorEvent {
  module: ModuleType
  error: string
}
