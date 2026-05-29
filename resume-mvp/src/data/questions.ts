import type { Question } from '../types/questionnaire'

export const questions: Question[] = [
  {
    id: 'q1',
    dimension: 'dailyWork',
    type: 'multiChoice',
    text: '在实习期间，你的日常主要工作包括哪些？',
    hint: '放心选，没有标准答案，只是帮你梳理~',
    options: [
      { label: '需求分析与PRD文档撰写', value: 'req-analysis' },
      { label: '产品原型设计与交互评审', value: 'prototype' },
      { label: '数据埋点与效果分析', value: 'data-analysis' },
      { label: '用户调研与深度访谈', value: 'user-research' },
      { label: '项目管理与排期协调', value: 'pm-coordination' },
    ],
  },
  {
    id: 'q2',
    dimension: 'collaboration',
    type: 'choice',
    text: '你与外部团队的协作程度如何？',
    hint: '了解你的协作半径，这往往是被忽略的亮点',
    options: [
      { label: '主要独立完成工作', value: 'solo' },
      { label: '与设计+研发日常对接', value: 'design-dev' },
      { label: '跨多部门深度协作（运营/市场/数据等）', value: 'cross-dept' },
      { label: '主导跨部门项目，推动多方共识', value: 'lead-cross' },
    ],
  },
  {
    id: 'q3',
    dimension: 'results',
    type: 'multiChoice',
    text: '实习期间你参与或主导了哪些类型的项目？',
    hint: '可以多选，每一类项目背后是不同的能力',
    options: [
      { label: '从0到1的新功能/新产品孵化', value: 'from-zero' },
      { label: '已有产品的体验优化与迭代', value: 'optimization' },
      { label: '数据驱动的增长实验', value: 'growth-exp' },
      { label: '内部效率工具的搭建', value: 'internal-tool' },
      { label: '用户反馈驱动的体验修复', value: 'user-feedback' },
    ],
  },
  {
    id: 'q4',
    dimension: 'softSkills',
    type: 'multiChoice',
    text: '这段经历带给你最大的成长是什么？',
    hint: '有时候我们低估了自己的收获',
    options: [
      { label: '产品方法论与思维框架', value: 'methodology' },
      { label: '跨团队沟通与推动能力', value: 'cross-team-comm' },
      { label: '技术理解与工程素养', value: 'tech-understanding' },
      { label: '商业sense与数据敏感度', value: 'biz-sense' },
      { label: '执行力与抗压能力', value: 'execution' },
    ],
  },
  {
    id: 'q5',
    dimension: 'softSkills',
    type: 'multiChoice',
    text: '有没有特别让你有成就感的时刻？',
    hint: '这些高光时刻，往往就是简历里最打动人的部分',
    options: [
      { label: '完成了一个从你主导的需求并成功上线', value: 'own-launch' },
      { label: '解决了长期存在的用户体验痛点', value: 'solve-pain' },
      { label: '通过数据分析发现了关键洞察', value: 'data-insight' },
      { label: '成功推动了一个跨部门共识', value: 'cross-consensus' },
      { label: '获得了mentor或leader的明确认可', value: 'recognition' },
    ],
  },
  {
    id: 'q6',
    dimension: 'tools',
    type: 'choice',
    text: '用一个词来形容这段经历给你留下的最深感受？',
    hint: '最后一题了，选一个最贴近你内心的词吧',
    options: [
      { label: '突破 —— 打破了舒适圈', value: 'breakthrough' },
      { label: '沉淀 —— 扎实积累方法论', value: 'accumulation' },
      { label: '连接 —— 建立了人与人的链接', value: 'connection' },
      { label: '创造 —— 做出了看得见的东西', value: 'creation' },
      { label: '探索 —— 虽然迷茫但在成长', value: 'exploration' },
    ],
  },
]

export const encourageMessages = [
  '你做得很好，每一段经历都值得被认真对待 ✨',
  '慢慢来，像整理一本旧相册一样 📸',
  '这些问题没有对错，只是帮你重新认识自己 🌿',
  '回忆本身，就是一种力量 💪',
  '快完成了，你的"成长树"就要长出来了 🌳',
]

export const categoryLabels: Record<string, string> = {
  dailyWork: '日常工作',
  collaboration: '协作模式',
  results: '项目经历',
  softSkills: '能力成长',
  tools: '内心感受',
}
