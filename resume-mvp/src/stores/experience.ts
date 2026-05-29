import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { Experience, Answer } from '../types/experience'
import { addExperience, getExperiences, deleteExperience as deleteFromStorage } from '../utils/storage'

export const useExperienceStore = defineStore('experience', {
  state: () => ({
    experiences: [] as Experience[],
    currentAnswers: {} as Record<string, Answer>,
    experienceTitle: '',
    experienceDirection: '',
  }),

  actions: {
    async loadExperiences() {
      this.experiences = await getExperiences()
    },

    startNew(title: string, direction?: string) {
      this.experienceTitle = title
      this.experienceDirection = direction || ''
      this.currentAnswers = {}
    },

    saveAnswer(questionId: string, answer: Answer) {
      this.currentAnswers[questionId] = answer
    },

    async finalizeExperience(): Promise<Experience> {
      const now = new Date().toISOString()
      const experience: Experience = {
        id: uuidv4(),
        title: this.experienceTitle,
        direction: this.experienceDirection || undefined,
        createdAt: now,
        updatedAt: now,
        answers: { ...this.currentAnswers },
      }
      await addExperience(experience)
      await this.loadExperiences()
      return experience
    },

    async deleteExperience(id: string) {
      await deleteFromStorage(id)
      await this.loadExperiences()
    },
  },
})
