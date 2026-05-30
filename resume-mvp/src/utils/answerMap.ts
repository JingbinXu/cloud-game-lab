import type { CabinExperience, RoomId } from '../types/cabin'
import { describeItem } from '../types/cabin'
import { itemDefs, ITEMS_BY_ROOM } from '../data/itemDefs'

/** 房间 ID → 简历维度 key */
const ROOM_TO_DIM: Record<RoomId, string> = {
  living: 'collaboration',
  study: 'professional',
  kitchen: 'execution',
  bedroom: 'innerDrive',
  balcony: 'achievements',
}

/** 房间中文名 */
export const ROOM_CN: Record<string, string> = {
  living: '沟通与协作',
  study: '专业与学习',
  kitchen: '执行与产出',
  bedroom: '内驱与韧性',
  balcony: '成果与影响',
  collaboration: '协作方式',
  professional: '专业能力',
  execution: '执行产出',
  innerDrive: '内驱韧性',
  achievements: '成果影响',
}

/** 把一段 cabin 经历的所有物品描述转成 bullet 列表 */
export function cabinExperienceToBullets(exp: CabinExperience): string[] {
  const bullets: string[] = []
  for (const item of itemDefs) {
    const answers = exp.itemAnswers[item.id]
    if (!answers) continue
    const answered = item.questions.some(q => !!answers[q.prop])
    if (!answered) continue
    const info = describeItem(item, answers)
    if (info.work) bullets.push(info.work)
  }
  return bullets
}

/** 把经历按房间分组，返回 { roomKey: [bullet, ...] } */
export function cabinExperienceToRoomBullets(exp: CabinExperience): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const item of itemDefs) {
    const answers = exp.itemAnswers[item.id]
    if (!answers) continue
    const answered = item.questions.some(q => !!answers[q.prop])
    if (!answered) continue
    const dim = ROOM_TO_DIM[item.room] || item.room
    if (!result[dim]) result[dim] = []
    const info = describeItem(item, answers)
    if (info.work) result[dim].push(info.work)
  }
  return result
}

/** 从经历的所有物品中提取描述摘要（用于卡片展示） */
export function getCabinExperienceSummary(exp: CabinExperience): string[] {
  const tags: string[] = []
  for (const item of itemDefs) {
    const answers = exp.itemAnswers[item.id]
    if (!answers) continue
    const answered = item.questions.some(q => !!answers[q.prop])
    if (!answered) continue
    const info = describeItem(item, answers)
    // 取短描述（去掉前缀"一座"）
    const short = info.desc.replace(/^一座/, '').slice(0, 20)
    if (short) tags.push(short)
  }
  return tags
}

/** 获取房间完成度 */
export function getRoomCompletion(exp: CabinExperience): Record<string, { answered: number; total: number }> {
  const result: Record<string, { answered: number; total: number }> = {}
  for (const room of ['living', 'study', 'kitchen', 'bedroom', 'balcony']) {
    const items = ITEMS_BY_ROOM[room] || []
    const answered = items.filter(item => {
      const answers = exp.itemAnswers[item.id]
      if (!answers) return false
      return item.questions.some(q => !!answers[q.prop])
    }).length
    result[room] = { answered, total: items.length }
  }
  return result
}

// ============================================================
// 兼容旧接口（供 resume store 使用）
// ============================================================

/** 兼容旧 Experience 接口的 bullets 生成 */
export function experienceToBullets(experience: CabinExperience): string[] {
  return cabinExperienceToBullets(experience)
}

/** 兼容旧接口：按维度分组 */
export function experienceToDimensionBullets(experience: CabinExperience): Record<string, string[]> {
  return cabinExperienceToRoomBullets(experience)
}

/** 兼容旧接口：摘要 */
export function getExperienceSummary(experience: CabinExperience): string[] {
  return getCabinExperienceSummary(experience)
}

/** 维度中文映射（兼容） */
export const DIM_CN: Record<string, string> = {
  ...ROOM_CN,
  dailyWork: '日常工作',
  collaboration: '协作方式',
  results: '项目经历',
  softSkills: '能力成长',
  tools: '内心感受',
}