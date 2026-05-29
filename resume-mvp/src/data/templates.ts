import type { ResumeTemplate } from '../types/resume'

export const templates: ResumeTemplate[] = [
  {
    id: 'classic',
    name: '经典专业',
    description: '适合传统行业、国企、咨询',
    icon: '📄',
    priorityDimensions: ['dailyWork', 'results', 'collaboration', 'softSkills', 'tools'],
    sectionLabels: {
      dailyWork: '实习经历',
      results: '项目成果',
      collaboration: '团队协作',
      softSkills: '个人优势',
      tools: '技能与工具',
    },
    bulletStyle: 'narrative',
  },
  {
    id: 'modern',
    name: '现代简洁',
    description: '适合互联网、科技公司',
    icon: '💻',
    priorityDimensions: ['results', 'dailyWork', 'tools', 'collaboration', 'softSkills'],
    sectionLabels: {
      results: '核心成果',
      dailyWork: '项目经历',
      tools: '技术栈',
      collaboration: '协作经验',
      softSkills: '能力素质',
    },
    bulletStyle: 'impact',
  },
  {
    id: 'dual',
    name: '双栏布局',
    description: '信息密度高，适合经历丰富者',
    icon: '📋',
    priorityDimensions: ['dailyWork', 'collaboration', 'results', 'softSkills', 'tools'],
    sectionLabels: {
      dailyWork: '工作经历',
      collaboration: '协作经验',
      results: '工作成果',
      softSkills: '能力素质',
      tools: '工具技能',
    },
    bulletStyle: 'skill',
  },
  {
    id: 'creative',
    name: '创意设计',
    description: '适合设计、市场、品牌岗',
    icon: '🎨',
    priorityDimensions: ['softSkills', 'dailyWork', 'collaboration', 'results', 'tools'],
    sectionLabels: {
      softSkills: '核心能力',
      dailyWork: '项目经历',
      collaboration: '团队协作',
      results: '项目成果',
      tools: '工具使用',
    },
    bulletStyle: 'narrative',
  },
]
