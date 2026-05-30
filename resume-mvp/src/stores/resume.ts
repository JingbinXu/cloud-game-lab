import { defineStore } from 'pinia'
import type { CabinExperience } from '../types/cabin'
import type { ResumeTemplate, ResumeSection, ResumeOutput } from '../types/resume'
import { templates } from '../data/templates'
import { experienceToDimensionBullets } from '../utils/answerMap'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    jobDescription: '',
    selectedTemplateId: 'classic' as string,
    selectedExperienceIds: [] as string[],
    resumeOutput: null as ResumeOutput | null,
  }),

  getters: {
    selectedTemplate(): ResumeTemplate | undefined {
      return templates.find(t => t.id === this.selectedTemplateId)
    },
  },

  actions: {
    setJobDescription(jd: string) {
      this.jobDescription = jd
    },

    setTemplate(templateId: string) {
      this.selectedTemplateId = templateId
    },

    toggleExperience(id: string) {
      const index = this.selectedExperienceIds.indexOf(id)
      if (index === -1) {
        this.selectedExperienceIds.push(id)
      } else {
        this.selectedExperienceIds.splice(index, 1)
      }
    },

    generateResume(experiences: CabinExperience[]) {
      const template = this.selectedTemplate
      if (!template) return

      const selectedExperiences = experiences.filter(e =>
        this.selectedExperienceIds.includes(e.id)
      )

      const sections: ResumeSection[] = []

      for (const dim of template.priorityDimensions) {
        const bullets: string[] = []

        for (const exp of selectedExperiences) {
          const dimBullets = experienceToDimensionBullets(exp)
          if (dimBullets[dim]) {
            bullets.push(...dimBullets[dim])
          }
        }

        if (bullets.length > 0) {
          sections.push({
            title: template.sectionLabels[dim] || dim,
            bullets,
          })
        }
      }

      this.resumeOutput = {
        templateId: template.id,
        experiences: selectedExperiences as any,
        sections,
        jobDescription: this.jobDescription,
      }
    },

    reset() {
      this.jobDescription = ''
      this.selectedTemplateId = 'classic'
      this.selectedExperienceIds = []
      this.resumeOutput = null
    },
  },
})