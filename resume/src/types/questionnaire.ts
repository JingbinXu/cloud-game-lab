import type { Dimension } from './experience'

export type QuestionType = 'choice' | 'multiChoice' | 'slider' | 'text'

export interface QuestionOption {
  label: string
  value: string
}

export interface Question {
  id: string
  dimension: Dimension
  type: QuestionType
  text: string
  hint?: string
  options?: QuestionOption[]
  placeholder?: string
  maxLength?: number
  sliderMin?: number
  sliderMax?: number
  sliderLabels?: [string, string]
  maxSelect?: number
}
