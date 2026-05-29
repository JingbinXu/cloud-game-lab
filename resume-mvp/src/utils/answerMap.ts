import type { Experience } from '../types/experience'

// 每个选项值 → 简历 bullet 文案
const BULLET_MAP: Record<string, Record<string, string>> = {
  q1: {
    'req-analysis': '独立完成产品需求分析，撰写 PRD 文档',
    'prototype': '负责产品原型设计与交互方案评审',
    'data-analysis': '通过数据埋点与效果分析驱动产品决策',
    'user-research': '主导用户调研与深度访谈，输出洞察报告',
    'pm-coordination': '负责项目管理与跨团队排期协调',
  },
  q2: {
    'solo': '具备独立负责模块的自驱能力',
    'design-dev': '与设计、研发团队保持高效日常协作',
    'cross-dept': '深度参与跨部门协作（运营/市场/数据等）',
    'lead-cross': '主导跨部门项目，推动多方达成共识',
  },
  q3: {
    'from-zero': '参与从 0 到 1 的新功能/新产品孵化',
    'optimization': '负责已有产品的体验优化与迭代',
    'growth-exp': '参与数据驱动的增长实验',
    'internal-tool': '搭建内部效率工具，提升团队产出',
    'user-feedback': '基于用户反馈驱动产品体验修复',
  },
  q4: {
    'methodology': '系统掌握产品方法论与思维框架',
    'cross-team-comm': '显著提升跨团队沟通与推动能力',
    'tech-understanding': '加深技术理解与工程素养',
    'biz-sense': '培养商业 sense 与数据敏感度',
    'execution': '高强度执行下锻炼出的抗压能力',
  },
  q5: {
    'own-launch': '独立主导需求并成功推动上线',
    'solve-pain': '发现并解决长期存在的用户体验痛点',
    'data-insight': '通过数据分析发现关键业务洞察',
    'cross-consensus': '成功推动跨部门达成共识',
    'recognition': '获得 mentor / leader 的明确认可',
  },
  q6: {
    'breakthrough': '突破舒适圈，主动承担有挑战的任务',
    'accumulation': '沉淀了一套可复用的工作方法论',
    'connection': '建立了良好的跨团队协作关系',
    'creation': '产出了可见的落地成果',
    'exploration': '在探索中持续成长',
  },
}

// 每个选项值 → 柜子卡片的摘要短语
const SUMMARY_MAP: Record<string, Record<string, string>> = {
  q1: BULLET_MAP.q1,
  q2: BULLET_MAP.q2,
  q3: BULLET_MAP.q3,
  q4: BULLET_MAP.q4,
  q5: BULLET_MAP.q5,
  q6: BULLET_MAP.q6,
}

/** 把一段经历的答案转成简历 bullet 列表 */
export function experienceToBullets(experience: Experience): string[] {
  const bullets: string[] = []
  for (const answer of Object.values(experience.answers)) {
    const map = BULLET_MAP[answer.questionId]
    if (!map) continue

    if (Array.isArray(answer.value)) {
      for (const v of answer.value) {
        if (map[v]) bullets.push(map[v])
      }
    } else if (typeof answer.value === 'string' && map[answer.value]) {
      bullets.push(map[answer.value])
    }
  }
  return bullets
}

/** 从经历的所有答案中提取关键词摘要（用于柜子卡片展示） */
export function getExperienceSummary(experience: Experience): string[] {
  const tags: string[] = []
  for (const answer of Object.values(experience.answers)) {
    const map = SUMMARY_MAP[answer.questionId]
    if (!map) continue

    if (Array.isArray(answer.value)) {
      for (const v of answer.value) {
        if (map[v]) tags.push(map[v])
      }
    } else if (typeof answer.value === 'string' && map[answer.value]) {
      tags.push(map[answer.value])
    }
  }
  return tags
}

/** 把经历答案按维度分组，返回 { 维度名: [bullet, ...] } */
export function experienceToDimensionBullets(experience: Experience): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const answer of Object.values(experience.answers)) {
    const dim = answer.dimension
    if (!result[dim]) result[dim] = []
    const map = BULLET_MAP[answer.questionId]
    if (!map) continue

    if (Array.isArray(answer.value)) {
      for (const v of answer.value) {
        if (map[v]) result[dim].push(map[v])
      }
    } else if (typeof answer.value === 'string' && map[answer.value]) {
      result[dim].push(map[answer.value])
    }
  }
  return result
}

/** 维度名中文映射 */
export const DIM_CN: Record<string, string> = {
  dailyWork: '日常工作',
  collaboration: '协作方式',
  results: '项目经历',
  softSkills: '能力成长',
  tools: '内心感受',
}
