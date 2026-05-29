import type { Dimension, Experience } from './experience'

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  icon: string
  priorityDimensions: Dimension[]
  sectionLabels: Record<Dimension, string>
  bulletStyle: 'impact' | 'skill' | 'narrative'
}

export interface ResumeSection {
  title: string
  bullets: string[]
}

export interface ResumeOutput {
  templateId: string
  experiences: Experience[]
  sections: ResumeSection[]
  jobDescription: string
}
