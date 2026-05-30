export type Dimension = 'dailyWork' | 'collaboration' | 'results' | 'softSkills' | 'tools'

export interface Answer {
  questionId: string
  type: 'choice' | 'multiChoice' | 'slider' | 'text'
  value: string | string[] | number
  dimension: Dimension
}

export interface Experience {
  id: string
  title: string
  direction?: string
  createdAt: string
  updatedAt: string
  answers: Record<string, Answer>
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  dailyWork: '日常工作',
  collaboration: '协作方式',
  results: '量化成果',
  softSkills: '软技能',
  tools: '工具技术',
}

export const DIMENSION_COLORS: Record<Dimension, string> = {
  dailyWork: 'var(--color-accent-1)',
  collaboration: 'var(--color-accent-2)',
  results: 'var(--color-accent-3)',
  softSkills: 'var(--color-accent-4)',
  tools: 'var(--color-accent-5)',
}

export const DIMENSION_ORDER: Dimension[] = ['dailyWork', 'collaboration', 'results', 'softSkills', 'tools']
