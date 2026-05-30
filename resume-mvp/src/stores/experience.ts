import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { CabinExperience, ItemAnswers, GridPos } from '../types/cabin'
import { itemDefs, ITEMS_BY_ROOM } from '../data/itemDefs'
import { addExperience, getExperiences, deleteExperience as deleteFromStorage } from '../utils/storage'

export const useExperienceStore = defineStore('experience', {
  state: () => ({
    experiences: [] as CabinExperience[],
    /** 当前正在编辑的物品回答: itemId -> { prop: val } */
    currentItemAnswers: {} as Record<string, ItemAnswers>,
    /** 当前正在编辑的物品位置: itemId -> { tx, ty } */
    currentRoomPlacements: {} as Record<string, GridPos>,
    experienceTitle: '',
    experienceDirection: '',
    /** 当前激活的物品 ID（用于问答面板） */
    activeItemId: null as string | null,
  }),

  getters: {
    /** 物品是否全部作答 */
    isItemComplete: (state) => (itemId: string): boolean => {
      const def = itemDefs.find(d => d.id === itemId)
      if (!def) return false
      return def.questions.every(q => !!state.currentItemAnswers[itemId]?.[q.prop])
    },

    /** 某个房间的进度 */
    getRoomProgress: (state) => (roomId: string): { answered: number; total: number } => {
      const items = ITEMS_BY_ROOM[roomId] || []
      const answered = items.filter(item =>
        item.questions.every(q => !!state.currentItemAnswers[item.id]?.[q.prop])
      ).length
      return { answered, total: items.length }
    },

    /** 总进度 */
    getTotalProgress: (state): { answered: number; total: number } => {
      const answered = itemDefs.filter(item =>
        item.questions.every(q => !!state.currentItemAnswers[item.id]?.[q.prop])
      ).length
      return { answered, total: itemDefs.length }
    },

    /** 获取某个物品的回答 */
    getItemAnswers: (state) => (itemId: string): ItemAnswers => {
      return state.currentItemAnswers[itemId] || {}
    },
  },

  actions: {
    async loadExperiences() {
      this.experiences = await getExperiences()
    },

    startNew(title: string, direction?: string) {
      this.experienceTitle = title
      this.experienceDirection = direction || ''
      this.currentItemAnswers = {}
      this.currentRoomPlacements = {}
      this.activeItemId = null
    },

    /** 回答物品的某一道题 */
    answerItemQuestion(itemId: string, prop: string, val: string) {
      if (!this.currentItemAnswers[itemId]) {
        this.currentItemAnswers[itemId] = {} as ItemAnswers
      }
      (this.currentItemAnswers[itemId] as Record<string, string>)[prop] = val
    },

    /** 设置物品在小屋中的位置 */
    setItemPlacement(itemId: string, pos: GridPos) {
      this.currentRoomPlacements[itemId] = pos
    },

    /** 设置当前激活的物品 */
    setActiveItem(itemId: string | null) {
      this.activeItemId = itemId
    },

    /** 完成建造，保存经历 */
    async finalizeExperience(): Promise<CabinExperience> {
      const now = new Date().toISOString()
      const experience: CabinExperience = {
        id: uuidv4(),
        title: this.experienceTitle,
        direction: this.experienceDirection || undefined,
        createdAt: now,
        updatedAt: now,
        itemAnswers: { ...this.currentItemAnswers },
        roomPlacements: { ...this.currentRoomPlacements },
      }
      await addExperience(experience)
      await this.loadExperiences()
      return experience
    },

    async deleteExperience(id: string) {
      await deleteFromStorage(id)
      await this.loadExperiences()
    },

    /** 从已有经历加载到当前编辑状态 */
    loadForEdit(exp: CabinExperience) {
      this.experienceTitle = exp.title
      this.experienceDirection = exp.direction || ''
      this.currentItemAnswers = { ...exp.itemAnswers }
      this.currentRoomPlacements = { ...exp.roomPlacements }
      this.activeItemId = null
    },
  },
})
