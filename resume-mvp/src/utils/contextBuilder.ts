import type { CabinExperience, RoomId, ItemAnswers } from '../types/cabin'
import { ROOM_DEFS, describeItem } from '../types/cabin'
import { itemDefs, ITEMS_BY_ROOM } from '../data/itemDefs'

/** 房间 ID 到中文标签（用于 LLM 上下文） */
const ROOM_LABELS: Record<RoomId, string> = {
  living: '客厅·沟通与协作',
  study: '书房·专业与学习',
  kitchen: '厨房·执行与产出',
  bedroom: '卧室·内驱与韧性',
  balcony: '阳台·成果与影响',
}

/**
 * 将单个物品的回答转为中文描述行。
 * 复用 describeItem 的 makeRecord 逻辑（types/cabin.ts）。
 */
function itemToDescription(itemId: string, answers: ItemAnswers): string | null {
  const def = itemDefs.find(d => d.id === itemId)
  if (!def) return null
  const hasAnyAnswer = def.questions.some(q => !!answers[q.prop])
  if (!hasAnyAnswer) return null
  const { work } = describeItem(def, answers)
  return work || null
}

/**
 * 将一段经历按房间聚合为中文描述文本。
 */
function experienceToRoomTexts(exp: CabinExperience): Record<RoomId, string[]> {
  const result: Record<RoomId, string[]> = {} as Record<RoomId, string[]>

  for (const room of ROOM_DEFS) {
    const items = ITEMS_BY_ROOM[room.id] || []
    const lines: string[] = []
    for (const item of items) {
      const answers = exp.itemAnswers[item.id]
      if (!answers) continue
      const desc = itemToDescription(item.id, answers)
      if (desc) lines.push(desc)
    }
    if (lines.length > 0) {
      result[room.id] = lines
    }
  }

  return result
}

/**
 * 将多段经历合并为 LLM 上下文文本。
 *
 * 多段经历以 `【经历：{title}】` 分段标注，避免 LLM 混淆不同经历。
 * 输出格式：
 * ```
 * 【经历：字节跳动产品实习】
 * 客厅·沟通与协作：
 *   每周参加几个固定会议：3-5个；会议占工作时间：20%-40%...
 *
 * 【经历：腾讯项目实践】
 * 厨房·执行与产出：
 *   项目按时交付率：>90%...
 * ```
 */
export function buildContextTexts(
  experiences: CabinExperience[],
): Record<RoomId, string> {
  const merged: Record<RoomId, string[]> = {} as Record<RoomId, string[]>

  for (const exp of experiences) {
    const roomTexts = experienceToRoomTexts(exp)

    for (const room of ROOM_DEFS) {
      const lines = roomTexts[room.id]
      if (!lines || lines.length === 0) continue

      if (!merged[room.id]) merged[room.id] = []

      // 多段经历时加分段标注
      if (experiences.length > 1) {
        merged[room.id].push(`【经历：${exp.title}】`)
      }
      merged[room.id].push(...lines)
    }
  }

  // 转为最终字符串
  const result: Record<RoomId, string> = {} as Record<RoomId, string>
  for (const room of ROOM_DEFS) {
    const lines = merged[room.id]
    if (lines && lines.length > 0) {
      result[room.id] = `${ROOM_LABELS[room.id]}：\n${lines.join('\n')}`
    }
  }

  return result
}

/**
 * 获取某段经历在某个房间下是否有已回答数据。
 * 用于前端模块推荐：有数据的模块高亮。
 */
export function hasRoomData(experience: CabinExperience, roomId: RoomId): boolean {
  const items = ITEMS_BY_ROOM[roomId] || []
  return items.some(item => {
    const answers = experience.itemAnswers[item.id]
    if (!answers) return false
    return item.questions.some(q => !!answers[q.prop])
  })
}
