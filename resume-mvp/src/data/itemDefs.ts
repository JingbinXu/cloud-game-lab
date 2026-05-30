import type { CabinItemDef } from '../types/cabin'
import { ROOM_DEFS } from '../types/cabin'

export const itemDefs: CabinItemDef[] = [
  // ==================== 客厅 · 沟通与协作 ====================
  {
    id: 'clock', room: 'living', name: '时钟', why: '会议负载与工作节奏',
    questions: [
      { text: '你每周参加几个固定会议？', prop: 'form', opts: [
        { text: '0-2个', val: 'grandfather' }, { text: '3-5个', val: 'round' },
        { text: '6-10个', val: 'digital' }, { text: '10个以上', val: 'busy' },
      ]},
      { text: '会议占每周工作时间的比例？', prop: 'size', opts: [
        { text: '<20%', val: 's' }, { text: '20%-40%', val: 'm' },
        { text: '40%-60%', val: 'l' }, { text: '>60%', val: 'xl' },
      ]},
      { text: '需要你发言/决策的会议占比？', prop: 'condition', opts: [
        { text: '>70%', val: 'new' }, { text: '30%-70%', val: 'used' },
        { text: '<30%', val: 'dusty' }, { text: '几乎不用发言', val: 'stopped' },
      ]},
    ],
  },
  {
    id: 'sofa', room: 'living', name: '沙发', why: '协作规模与复杂度',
    questions: [
      { text: '日常协作涉及几个职能角色？', prop: 'form', opts: [
        { text: '1-2个', val: 'loveseat' }, { text: '3-4个', val: 'lshape' },
        { text: '5-6个', val: 'ushape' }, { text: '7个以上', val: 'sectional' },
      ]},
      { text: '协作方式是？', prop: 'tone', opts: [
        { text: '流程明确串行', val: 'cool' }, { text: '灵活紧密互cover', val: 'warm' },
        { text: '以我为中心', val: 'neutral' }, { text: '被多方推着走', val: 'dark' },
      ]},
      { text: '协作中最大消耗？', prop: 'pattern', opts: [
        { text: '信息不对齐', val: 'stripe' }, { text: '优先级冲突', val: 'grid' },
        { text: '响应太慢', val: 'dot' }, { text: '没什么消耗', val: 'solid' },
      ]},
    ],
  },
  {
    id: 'phone', room: 'living', name: '电话', why: '沟通渠道与响应效率',
    questions: [
      { text: '使用最多的沟通方式？', prop: 'form', opts: [
        { text: '即时消息', val: 'smart' }, { text: '邮件', val: 'rotary' },
        { text: '面对面/视频', val: 'deskphone' }, { text: '文档异步', val: 'walkie' },
      ]},
      { text: '日均处理工作消息数？', prop: 'size', opts: [
        { text: '<20条', val: 's' }, { text: '20-50条', val: 'm' },
        { text: '50-100条', val: 'l' }, { text: '>100条', val: 'xl' },
      ]},
      { text: '需求评审一次性通过率？', prop: 'condition', opts: [
        { text: '>80%', val: 'new' }, { text: '50%-80%', val: 'used' },
        { text: '30%-50%', val: 'worn' }, { text: '<30%', val: 'repaired' },
      ]},
    ],
  },
  {
    id: 'coffeetable', room: 'living', name: '茶几', why: '会议参与模式',
    questions: [
      { text: '会议中最常扮演的角色？', prop: 'form', opts: [
        { text: '主讲/汇报人', val: 'mic' }, { text: '核心提问者', val: 'coasters' },
        { text: '记录/旁听', val: 'notebook' }, { text: '不固定', val: 'mixed' },
      ]},
      { text: '参与过最大会议规模？', prop: 'size', opts: [
        { text: '<5人', val: 's' }, { text: '5-10人', val: 'm' },
        { text: '10-30人', val: 'l' }, { text: '>30人', val: 'xl' },
      ]},
      { text: '每周主持/主讲几次？', prop: 'condition', opts: [
        { text: '3次以上', val: 'heavy' }, { text: '1-2次', val: 'used' },
        { text: '一月一两次', val: 'light' }, { text: '从未主持', val: 'new' },
      ]},
    ],
  },
  {
    id: 'doormat', room: 'living', name: '门垫', why: '跨部门跨度',
    questions: [
      { text: '对接的外部团队/部门数？', prop: 'form', opts: [
        { text: '1个以内', val: 's' }, { text: '2-3个', val: 'm' },
        { text: '4-6个', val: 'l' }, { text: '7个以上', val: 'xl' },
      ]},
      { text: '跨部门中的角色？', prop: 'pattern', opts: [
        { text: '我提需求给别人', val: 'outward' }, { text: '别人提需求给我', val: 'inward' },
        { text: '我协调多方', val: 'bidirectional' }, { text: '位置不固定', val: 'wave' },
      ]},
      { text: '跨部门最大摩擦？', prop: 'condition', opts: [
        { text: '基本顺畅', val: 'new' }, { text: '有小的反复', val: 'used' },
        { text: '有过一次大冲突', val: 'curled' }, { text: '持续有摩擦', val: 'worn' },
      ]},
    ],
  },
  {
    id: 'pictureframe', room: 'living', name: '画框', why: '团队连接深度',
    questions: [
      { text: '在团队中的定位？', prop: 'form', opts: [
        { text: '核心贡献者', val: 'wide' }, { text: '有稳定搭子', val: 'double' },
        { text: '相对独立', val: 'tall' }, { text: '远程为主', val: 'desk' },
      ]},
      { text: '下班后和同事社交？', prop: 'tone', opts: [
        { text: '经常一起', val: 'warm' }, { text: '偶尔', val: 'neutral' },
        { text: '仅团建', val: 'cool' }, { text: '几乎没有', val: 'none' },
      ]},
      { text: '离职后保持联系？', prop: 'density', opts: [
        { text: '5人以上活跃', val: 'dense' }, { text: '2-4人偶尔', val: 'mid' },
        { text: '1人', val: 'sparse' }, { text: '基本不联系', val: 'dusty' },
      ]},
    ],
  },

  // ==================== 书房 · 专业与学习 ====================
  {
    id: 'bookshelf', room: 'study', name: '书架', why: '知识覆盖面',
    questions: [
      { text: '新接触几个专业知识领域？', prop: 'form', opts: [
        { text: '1个钻得深', val: 'tallnarrow' }, { text: '2-3个', val: 'standard' },
        { text: '4-5个', val: 'wide' }, { text: '6个以上', val: 'wall' },
      ]},
      { text: '掌握程度？', prop: 'density', opts: [
        { text: '3+能独立应用', val: 'full' }, { text: '1-2能独立', val: 'mostly' },
        { text: '都在学', val: 'half' }, { text: '只是了解概念', val: 'empty' },
      ]},
      { text: '学习主要途径？', prop: 'pattern', opts: [
        { text: '自学文档/课程', val: 'neat' }, { text: '跟同事/Leader学', val: 'stacked' },
        { text: '项目驱动边做边学', val: 'scattered' }, { text: '公司统一培训', val: 'uniform' },
      ]},
    ],
  },
  {
    id: 'monitor', room: 'study', name: '显示器', why: '工具链复杂度',
    questions: [
      { text: '使用最多的工具类型？', prop: 'form', opts: [
        { text: '原型/设计', val: 'bigscreen' }, { text: '数据/BI', val: 'dual' },
        { text: '文档/协作', val: 'laptop' }, { text: '项目管理', val: 'triple' },
      ]},
      { text: '同时打开几个工具？', prop: 'size', opts: [
        { text: '1-2个', val: 's' }, { text: '3-4个', val: 'm' },
        { text: '5-6个', val: 'l' }, { text: '7个以上', val: 'xl' },
      ]},
      { text: '核心工具掌握水平？', prop: 'condition', opts: [
        { text: '可以指导他人', val: 'worn' }, { text: '独立使用无障碍', val: 'used' },
        { text: '还需查文档', val: 'new' }, { text: '还在学', val: 'clean' },
      ]},
    ],
  },
  {
    id: 'whiteboard', room: 'study', name: '白板', why: '分析框架与决策方式',
    questions: [
      { text: '遇问题先做什么？', prop: 'form', opts: [
        { text: '画结构/流程图', val: 'big' }, { text: '拉数据看', val: 'smalldata' },
        { text: '列要点写文档', val: 'mid' }, { text: '找人聊对齐', val: 'pieces' },
      ]},
      { text: '一个问题深挖几层Why？', prop: 'size', opts: [
        { text: '3层以上', val: 'l' }, { text: '2-3层', val: 'm' },
        { text: '1层', val: 's' }, { text: '不怎么挖', val: 'xs' },
      ]},
      { text: '数据vs直觉比例？', prop: 'condition', opts: [
        { text: '数据>70%', val: 'cool' }, { text: '直觉>70%', val: 'warm' },
        { text: '各半', val: 'neutral' }, { text: '参考Leader', val: 'notebook' },
      ]},
    ],
  },
  {
    id: 'penholder', room: 'study', name: '笔筒', why: '文档产出量',
    questions: [
      { text: '写了多少份正式文档？', prop: 'density', opts: [
        { text: '<5份', val: 'sparse' }, { text: '5-10份', val: 'half' },
        { text: '11-20份', val: 'full' }, { text: '>20份', val: 'multi' },
      ]},
      { text: '一份文档平均改几次？', prop: 'form', opts: [
        { text: '1-2次', val: 'pen' }, { text: '3-5次', val: 'ballpen' },
        { text: '6-10次', val: 'pencil' }, { text: '>10次', val: 'mixed' },
      ]},
      { text: '文档最高流转层级？', prop: 'pattern', opts: [
        { text: '团队内部', val: 'plain' }, { text: '跨部门', val: 'stripe' },
        { text: '产品负责人/总监', val: 'engraved' }, { text: 'VP/高层', val: 'ornate' },
      ]},
    ],
  },
  {
    id: 'magnifier', room: 'study', name: '放大镜', why: '数据触达深度',
    questions: [
      { text: '获取数据主要途径？', prop: 'form', opts: [
        { text: '自己写SQL', val: 'pro' }, { text: 'BI工具', val: 'standard' },
        { text: '已有报表分析', val: 'portable' }, { text: '请人帮忙取', val: 'borrowed' },
      ]},
      { text: '数据工作占时间比？', prop: 'size', opts: [
        { text: '>40%', val: 'l' }, { text: '20%-40%', val: 'm' },
        { text: '5%-20%', val: 's' }, { text: '<5%', val: 'xs' },
      ]},
      { text: '分析结论被用到程度？', prop: 'condition', opts: [
        { text: '影响产品决策', val: 'shiny' }, { text: '用于优化迭代', val: 'used' },
        { text: '不清楚有没有用', val: 'foggy' }, { text: '没怎么做过', val: 'cased' },
      ]},
    ],
  },
  {
    id: 'corkboard', room: 'study', name: '软木板', why: '并行任务管理',
    questions: [
      { text: '同时在跟进几个需求？', prop: 'density', opts: [
        { text: '1-2个', val: 'sparse' }, { text: '3-5个', val: 'mid' },
        { text: '6-9个', val: 'dense' }, { text: '10个以上', val: 'overflow' },
      ]},
      { text: '用什么追踪任务？', prop: 'form', opts: [
        { text: 'Jira/TAPD', val: 'neat' }, { text: 'Notion/飞书', val: 'colored' },
        { text: '纸质/Excel', val: 'mixed' }, { text: '主要靠脑子', val: 'chaotic' },
      ]},
      { text: '任务间依赖复杂度？', prop: 'pattern', opts: [
        { text: '高度独立', val: 'scattered' }, { text: '有少量依赖', val: 'linked' },
        { text: '依赖复杂', val: 'web' }, { text: '不关注', val: 'random' },
      ]},
    ],
  },

  // ==================== 厨房 · 执行与产出 ====================
  {
    id: 'stove', room: 'kitchen', name: '炉灶', why: '项目推进强度',
    questions: [
      { text: '项目按时交付率？', prop: 'form', opts: [
        { text: '>90%', val: 'high' }, { text: '70%-90%', val: 'mid' },
        { text: '50%-70%', val: 'low' }, { text: '<50%或不可控', val: 'flicker' },
      ]},
      { text: '同时推进几个项目？', prop: 'density', opts: [
        { text: '1个', val: 'one' }, { text: '2个', val: 'two' },
        { text: '3-4个', val: 'four' }, { text: '5个以上', val: 'many' },
      ]},
      { text: '项目推进最大阻塞？', prop: 'condition', opts: [
        { text: '技术难度', val: 'grease' }, { text: '资源不足', val: 'empty' },
        { text: '需求变更', val: 'scratched' }, { text: '基本顺畅', val: 'clean' },
      ]},
    ],
  },
  {
    id: 'pots', room: 'kitchen', name: '锅具', why: '项目规模与类型',
    questions: [
      { text: '最大项目影响范围？', prop: 'form', opts: [
        { text: '个人模块', val: 'saucepan' }, { text: '部门内多模块', val: 'wok' },
        { text: '跨部门', val: 'stockpot' }, { text: '公司/用户级', val: 'commercial' },
      ]},
      { text: '最大项目性质？', prop: 'tone', opts: [
        { text: '0到1新项目', val: 'shiny' }, { text: '重大改版', val: 'used' },
        { text: '日常维护', val: 'plain' }, { text: '探索未上线', val: 'unused' },
      ]},
      { text: '总共经手几个项目？', prop: 'density', opts: [
        { text: '1-2个', val: 'one' }, { text: '3-4个', val: 'few' },
        { text: '5-8个', val: 'many' }, { text: '9个以上', val: 'wall' },
      ]},
    ],
  },
  {
    id: 'recipestand', room: 'kitchen', name: '食谱架', why: '流程成熟度与贡献',
    questions: [
      { text: '团队需求流程规范程度？', prop: 'form', opts: [
        { text: '完善文档化', val: 'thick' }, { text: '有大致约定', val: 'mid' },
        { text: '比较随意', val: 'thin' }, { text: '几乎没有', val: 'empty' },
      ]},
      { text: '你对流程做了什么？', prop: 'condition', opts: [
        { text: '严格执行', val: 'clean' }, { text: '灵活调整', val: 'dogeared' },
        { text: '提出并落地改进', val: 'inserts' }, { text: '觉得太束缚', val: 'closed' },
      ]},
      { text: '有没有沉淀流程给团队？', prop: 'pattern', opts: [
        { text: '主导写了SOP', val: 'gold' }, { text: '参与了一部分', val: 'marked' },
        { text: '纯使用者', val: 'plain' }, { text: '没关注过', val: 'none' },
      ]},
    ],
  },
  {
    id: 'timer', room: 'kitchen', name: '计时器', why: 'Deadline表现',
    questions: [
      { text: '通常比Deadline提前多久？', prop: 'form', opts: [
        { text: '提前1天以上', val: 'digital' }, { text: '踩点', val: 'mechanical' },
        { text: '偶尔延期', val: 'brokenbell' }, { text: '常需提醒', val: 'hourglass' },
      ]},
      { text: '预估工时准确度？', prop: 'size', opts: [
        { text: '误差<20%', val: 's' }, { text: '20%-50%', val: 'm' },
        { text: '常低估50%+', val: 'l' }, { text: '没预估过', val: 'simple' },
      ]},
      { text: '最大一次延期程度？', prop: 'condition', opts: [
        { text: '从未延期', val: 'new' }, { text: '延期1-2天', val: 'scratch' },
        { text: '延期1周+', val: 'dent' }, { text: '项目被取消', val: 'broken' },
      ]},
    ],
  },
  {
    id: 'spicerack', room: 'kitchen', name: '调料架', why: '资源调配能力',
    questions: [
      { text: '工作需要依赖几个外部角色？', prop: 'density', opts: [
        { text: '1-2个', val: 'sparse' }, { text: '3-4个', val: 'mid' },
        { text: '5-7个', val: 'dense' }, { text: '8个以上', val: 'full' },
      ]},
      { text: '资源按时到位率？', prop: 'form', opts: [
        { text: '90%以上', val: 'neat' }, { text: '70%-90%', val: 'mostly' },
        { text: '50%-70%', val: 'messy' }, { text: '<50%', val: 'chaotic' },
      ]},
      { text: '会主动争取资源吗？', prop: 'tone', opts: [
        { text: '经常主动且成功', val: 'warm' }, { text: '尝试不一定成', val: 'neutral' },
        { text: '不太会等分配', val: 'cool' }, { text: '全靠Leader', val: 'otherhand' },
      ]},
    ],
  },
  {
    id: 'knifeblock', room: 'kitchen', name: '刀架', why: '决策权限与准确度',
    questions: [
      { text: '有哪个级别的决策权？', prop: 'form', opts: [
        { text: '产品方案级', val: 'chef' }, { text: '功能细节级', val: 'utility' },
        { text: '交互/文案级', val: 'fruit' }, { text: '基本没有', val: 'none' },
      ]},
      { text: '决策被验证正确比例？', prop: 'size', opts: [
        { text: '>80%', val: 'l' }, { text: '60%-80%', val: 'm' },
        { text: '40%-60%', val: 's' }, { text: '没机会独立决策', val: 'xs' },
      ]},
      { text: '决策主要依赖？', prop: 'condition', opts: [
        { text: '自己的数据分析', val: 'sharp' }, { text: '竞品+用户反馈', val: 'used' },
        { text: 'Leader给框架', val: 'guided' }, { text: '基本听Leader', val: 'blunt' },
      ]},
    ],
  },

  // ==================== 卧室 · 内驱与韧性 ====================
  {
    id: 'bed', room: 'bedroom', name: '床', why: '工作强度与生活边界',
    questions: [
      { text: '日均工作几小时？', prop: 'size', opts: [
        { text: '<8h', val: 's' }, { text: '8-10h', val: 'm' },
        { text: '10-12h', val: 'l' }, { text: '>12h', val: 'xl' },
      ]},
      { text: '结束能切换生活吗？', prop: 'condition', opts: [
        { text: '分得很清楚', val: 'neat' }, { text: '大部分能', val: 'tidy' },
        { text: '常躺着想工作', val: 'messy' }, { text: '持续焦虑', val: 'chaotic' },
      ]},
      { text: '周末要处理工作吗？', prop: 'pattern', opts: [
        { text: '从不', val: 'smooth' }, { text: '偶尔', val: 'lightcrease' },
        { text: '经常', val: 'heavycrease' }, { text: '每天', val: 'bombed' },
      ]},
    ],
  },
  {
    id: 'alarmclock', room: 'bedroom', name: '闹钟', why: '自我驱动力来源',
    questions: [
      { text: '什么最能驱动你？', prop: 'form', opts: [
        { text: '想把事做到最好', val: 'swiss' }, { text: '获得Leader认可', val: 'twinbell' },
        { text: '快速学到东西', val: 'progress' }, { text: '拿Return Offer', val: 'countdown' },
      ]},
      { text: '主动设目标吗？', prop: 'size', opts: [
        { text: '写下来追踪', val: 'l' }, { text: '心里有但不写', val: 'm' },
        { text: 'Leader给我设', val: 's' }, { text: '没有明确目标', val: 'xs' },
      ]},
      { text: '主动找额外任务？', prop: 'condition', opts: [
        { text: '经常主动找', val: 'busy' }, { text: '偶尔会', val: 'used' },
        { text: '很少', val: 'idle' }, { text: '从不', val: 'dusty' },
      ]},
    ],
  },
  {
    id: 'mirror', room: 'bedroom', name: '镜子', why: '自我认知清晰度',
    questions: [
      { text: '清楚自己擅长/不擅长吗？', prop: 'form', opts: [
        { text: '能且可举例', val: 'clear' }, { text: '大概能但不准', val: 'normal' },
        { text: '不太确定', val: 'blurry' }, { text: '没仔细想过', val: 'fogged' },
      ]},
      { text: '实习改变自我认知吗？', prop: 'size', opts: [
        { text: '完全刷新', val: 'l' }, { text: '有显著调整', val: 'm' },
        { text: '微调', val: 's' }, { text: '没变化', val: 'xs' },
      ]},
      { text: '自评和他评差距？', prop: 'condition', opts: [
        { text: '基本一致', val: 'clean' }, { text: '别人评我更好', val: 'softglow' },
        { text: '自评比他评高', val: 'cracked' }, { text: '没收到反馈', val: 'dusty' },
      ]},
    ],
  },
  {
    id: 'coatrack', room: 'bedroom', name: '衣帽架', why: '角色适应速度',
    questions: [
      { text: '学生→职场切换花多久？', prop: 'size', opts: [
        { text: '<2周', val: 's' }, { text: '2-4周', val: 'm' },
        { text: '1-2月', val: 'l' }, { text: '>2月', val: 'xl' },
      ]},
      { text: '扮演过几种角色？', prop: 'density', opts: [
        { text: '4种以上', val: 'full' }, { text: '3种', val: 'mostly' },
        { text: '2种', val: 'sparse' }, { text: '1种', val: 'one' },
      ]},
      { text: '职场身份变化大吗？', prop: 'pattern', opts: [
        { text: '变化巨大', val: 'mixed' }, { text: '有变化', val: 'blend' },
        { text: '变化不大', val: 'uniform' }, { text: '没感觉', val: 'empty' },
      ]},
    ],
  },
  {
    id: 'notebook', room: 'bedroom', name: '笔记本', why: '复盘习惯与刻意练习',
    questions: [
      { text: '复盘频率？', prop: 'form', opts: [
        { text: '每周系统复盘', val: 'thick' }, { text: '每两周/月', val: 'mid' },
        { text: '仅项目结束', val: 'thin' }, { text: '从不复盘', val: 'empty' },
      ]},
      { text: '复盘内容？', prop: 'condition', opts: [
        { text: '数据+根因+方案', val: 'structured' }, { text: '做了什么+感受', val: 'narrative' },
        { text: '只列做了什么', val: 'checklist' }, { text: 'Leader要求', val: 'pressed' },
      ]},
      { text: '复盘后改了吗？', prop: 'pattern', opts: [
        { text: '改变了工作方法', val: 'worn' }, { text: '有些调整', val: 'used' },
        { text: '想改没改', val: 'new' }, { text: '不复盘', val: 'clean' },
      ]},
    ],
  },
  {
    id: 'desklamp', room: 'bedroom', name: '台灯', why: '主动学习强度',
    questions: [
      { text: '每周课外学习产品时间？', prop: 'brightness', opts: [
        { text: '>8h', val: 'bright' }, { text: '3-8h', val: 'normal' },
        { text: '1-3h', val: 'dim' }, { text: '<1h', val: 'off' },
      ]},
      { text: '学习方向？', prop: 'form', opts: [
        { text: '工作强相关', val: 'spot' }, { text: '行业/赛道', val: 'flood' },
        { text: '跨界', val: 'swing' }, { text: '没明确方向', val: 'sway' },
      ]},
      { text: '学习谁在推动？', prop: 'tone', opts: [
        { text: '完全自驱', val: 'warm' }, { text: '自驱+Leader推', val: 'midwarm' },
        { text: 'Leader推+偶尔', val: 'cool' }, { text: '项目倒逼', val: 'cold' },
      ]},
    ],
  },

  // ==================== 阳台 · 成果与影响 ====================
  {
    id: 'pottedplant', room: 'balcony', name: '盆栽', why: '量化成果',
    questions: [
      { text: '有可量化业务指标变化吗？', prop: 'form', opts: [
        { text: '核心指标显著提升', val: 'tree' }, { text: '过程指标改善', val: 'flowering' },
        { text: '有但变化不显著', val: 'small' }, { text: '没有量化数据', val: 'empty' },
      ]},
      { text: '成果类型最接近？', prop: 'size', opts: [
        { text: '用户/收入增长', val: 'l' }, { text: '效率/流程提升', val: 'm' },
        { text: '0到1产出', val: 's' }, { text: '维护/优化', val: 'xs' },
      ]},
      { text: '成果归因于？', prop: 'condition', opts: [
        { text: '我主导关键动作', val: 'owned' }, { text: '团队协作', val: 'team' },
        { text: 'Leader决策+我执行', val: 'supported' }, { text: '运气/大环境', val: 'luck' },
      ]},
    ],
  },
  {
    id: 'telescope', room: 'balcony', name: '望远镜', why: '行业认知深度',
    questions: [
      { text: '对行业的了解程度？', prop: 'form', opts: [
        { text: '能独立分析格局', val: 'astro' }, { text: '知道基本盘', val: 'bino' },
        { text: '能听懂不能输出', val: 'toy' }, { text: '没关注过', val: 'none' },
      ]},
      { text: '行业信息主要来源？', prop: 'size', opts: [
        { text: '报告/媒体/财报', val: 'l' }, { text: '竞品+用户反馈', val: 'm' },
        { text: 'Leader转述', val: 's' }, { text: '不主动获取', val: 'xs' },
      ]},
      { text: '行业认知提升多少？', prop: 'condition', opts: [
        { text: '大幅,能和人交流', val: 'worn' }, { text: '有提升', val: 'used' },
        { text: '提升有限', val: 'new' }, { text: '没有提升', val: 'boxed' },
      ]},
    ],
  },
  {
    id: 'windvane', room: 'balcony', name: '风向标', why: '趋势判断力',
    questions: [
      { text: '能判断需求价值吗？', prop: 'form', opts: [
        { text: '能,被数据验证', val: 'smooth' }, { text: '有个判断说不准', val: 'sticky' },
        { text: '不太能', val: 'still' }, { text: '没想过', val: 'removed' },
      ]},
      { text: '判断主要依据？', prop: 'tone', opts: [
        { text: '数据+逻辑', val: 'metal' }, { text: '用户反馈+直觉', val: 'fabric' },
        { text: '竞品导向', val: 'plastic' }, { text: '参考Leader', val: 'wood' },
      ]},
      { text: '主动向上提过建议？', prop: 'size', opts: [
        { text: '提过且被采纳', val: 'l' }, { text: '提过未采纳', val: 'm' },
        { text: '想过没提', val: 's' }, { text: '没想过', val: 'xs' },
      ]},
    ],
  },
  {
    id: 'balconytable', room: 'balcony', name: '阳台桌椅', why: '外部网络规模',
    questions: [
      { text: '和多少行业人士建立联系？', prop: 'density', opts: [
        { text: '>10人', val: 'dense' }, { text: '5-10人', val: 'mid' },
        { text: '1-4人', val: 'sparse' }, { text: '几乎没有', val: 'empty' },
      ]},
      { text: '还活跃互动吗？', prop: 'condition', opts: [
        { text: '3人以上活跃', val: 'active' }, { text: '加微信不常聊', val: 'dusty' },
        { text: '只加LinkedIn', val: 'new' }, { text: '没持续联系', val: 'unused' },
      ]},
      { text: '这些连接怎么来的？', prop: 'pattern', opts: [
        { text: '主动认识', val: 'outward' }, { text: '工作自然接触', val: 'center' },
        { text: 'Leader引荐', val: 'inward' }, { text: '没刻意建立', val: 'folded' },
      ]},
    ],
  },
  {
    id: 'clothesline', room: 'balcony', name: '晾衣绳', why: '工作能见度',
    questions: [
      { text: '成果被什么层级看到？', prop: 'size', opts: [
        { text: 'VP/总监级', val: 'l' }, { text: '产品负责人级', val: 'm' },
        { text: '仅直属Leader', val: 's' }, { text: '不清楚', val: 'xs' },
      ]},
      { text: '有什么证据证明贡献？', prop: 'density', opts: [
        { text: '上线功能/被采纳报告', val: 'full' }, { text: 'Leader正面评价', val: 'one' },
        { text: '不太确定', val: 'empty' }, { text: '没有', val: 'none' },
      ]},
      { text: '有人公开提过贡献吗？', prop: 'condition', opts: [
        { text: '全员会/大群', val: 'neat' }, { text: '组内周会', val: 'casual' },
        { text: '私下1v1', val: 'folded' }, { text: '没被提过', val: 'empty' },
      ]},
    ],
  },
  {
    id: 'windchime', room: 'balcony', name: '风铃', why: '额外贡献',
    questions: [
      { text: '本职外还做了什么？', prop: 'form', opts: [
        { text: '3件以上', val: 'long' }, { text: '1-2件', val: 'mid' },
        { text: '一点点', val: 'short' }, { text: '只做本职工作', val: 'none' },
      ]},
      { text: '额外贡献类型？', prop: 'tone', opts: [
        { text: '搭建工具/流程', val: 'metal' }, { text: '分享/培训/文档', val: 'bamboo' },
        { text: '帮同事分担', val: 'shell' }, { text: '招聘/文化', val: 'glass' },
      ]},
      { text: '额外贡献被注意到？', prop: 'condition', opts: [
        { text: '被公开提过', val: 'swinging' }, { text: '有人私下谢过', val: 'still' },
        { text: '不确定', val: 'high' }, { text: '没有', val: 'empty' },
      ]},
    ],
  },
]

/** 按 ID 快速查找 */
export const ITEM_BY_ID: Record<string, CabinItemDef> = {}
itemDefs.forEach(d => { ITEM_BY_ID[d.id] = d })

/** 按房间分组 */
export const ITEMS_BY_ROOM: Record<string, CabinItemDef[]> = {}
itemDefs.forEach(d => {
  if (!ITEMS_BY_ROOM[d.room]) ITEMS_BY_ROOM[d.room] = []
  ITEMS_BY_ROOM[d.room].push(d)
})

export { ROOM_DEFS }