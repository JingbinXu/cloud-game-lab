import type { CabinExperience } from './cabin'

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  icon: string
  priorityDimensions: string[]
  sectionLabels: Record<string, string>
  bulletStyle: 'impact' | 'skill' | 'narrative'
}

export interface ResumeSection {
  title: string
  bullets: string[]
}

export interface ResumeOutput {
  templateId: string
  experiences: CabinExperience[]
  sections: ResumeSection[]
  jobDescription: string
}
