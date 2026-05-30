import type { ResumeTemplate } from '../types/resume'

export const templates: ResumeTemplate[] = [
  {
    id: 'classic',
    name: '经典专业',
    description: '适合传统行业、国企、咨询',
    icon: '📄',
    priorityDimensions: ['collaboration', 'execution', 'professional', 'innerDrive', 'achievements'],
    sectionLabels: {
      collaboration: '沟通与协作',
      execution: '执行与产出',
      professional: '专业与学习',
      innerDrive: '内驱与韧性',
      achievements: '成果与影响',
    },
    bulletStyle: 'narrative',
  },
  {
    id: 'modern',
    name: '现代简洁',
    description: '适合互联网、科技公司',
    icon: '💻',
    priorityDimensions: ['achievements', 'execution', 'professional', 'collaboration', 'innerDrive'],
    sectionLabels: {
      achievements: '核心成果',
      execution: '项目经历',
      professional: '专业能力',
      collaboration: '协作经验',
      innerDrive: '能力素质',
    },
    bulletStyle: 'impact',
  },
  {
    id: 'dual',
    name: '双栏布局',
    description: '信息密度高，适合经历丰富者',
    icon: '📋',
    priorityDimensions: ['collaboration', 'professional', 'execution', 'innerDrive', 'achievements'],
    sectionLabels: {
      collaboration: '沟通协作',
      professional: '专业能力',
      execution: '项目执行',
      innerDrive: '个人素质',
      achievements: '成果展示',
    },
    bulletStyle: 'skill',
  },
  {
    id: 'creative',
    name: '创意设计',
    description: '适合设计、市场、品牌岗',
    icon: '🎨',
    priorityDimensions: ['innerDrive', 'collaboration', 'achievements', 'execution', 'professional'],
    sectionLabels: {
      innerDrive: '核心能力',
      collaboration: '团队协作',
      achievements: '项目成果',
      execution: '项目经历',
      professional: '专业技能',
    },
    bulletStyle: 'narrative',
  },
]