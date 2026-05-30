export type RoomId = 'living' | 'study' | 'kitchen' | 'bedroom' | 'balcony'

export type VisualProperty = 'form' | 'size' | 'tone' | 'condition' | 'density' | 'pattern' | 'brightness'

export interface ItemOption {
  text: string
  val: string
}

export interface ItemQuestion {
  text: string
  prop: VisualProperty
  opts: ItemOption[]
}

export interface CabinItemDef {
  id: string
  room: RoomId
  name: string
  why: string
  questions: ItemQuestion[]
}

export interface GridPos {
  tx: number
  ty: number
}

/** 用户对某个物品的回答: prop -> selected val */
export type ItemAnswers = Record<VisualProperty, string>

/** 一段经历的完整数据 */
export interface CabinExperience {
  id: string
  title: string
  direction?: string
  createdAt: string
  updatedAt: string
  /** itemId -> { prop: val } */
  itemAnswers: Record<string, ItemAnswers>
  /** itemId -> { tx, ty } */
  roomPlacements: Record<string, GridPos>
}

export interface RoomDef {
  id: RoomId
  name: string
  shortName: string
  emoji: string
  /** 等距坐标系中的 bounds */
  bounds: { x: number; y: number; w: number; h: number }
}

export const ROOM_DEFS: RoomDef[] = [
  { id: 'living', name: '客厅 · 沟通与协作', shortName: '客厅', emoji: '🛋️', bounds: { x: 0, y: 3, w: 5, h: 3 } },
  { id: 'study', name: '书房 · 专业与学习', shortName: '书房', emoji: '📚', bounds: { x: 1.5, y: 6, w: 3.5, h: 2.5 } },
  { id: 'kitchen', name: '厨房 · 执行与产出', shortName: '厨房', emoji: '🍳', bounds: { x: 0, y: 0, w: 3, h: 3 } },
  { id: 'bedroom', name: '卧室 · 内驱与韧性', shortName: '卧室', emoji: '🛏️', bounds: { x: 1.5, y: 0, w: 3, h: 3 } },
  { id: 'balcony', name: '阳台 · 成果与影响', shortName: '阳台', emoji: '🌿', bounds: { x: 3.5, y: 0, w: 2.5, h: 3 } },
]

export const ROOM_CN: Record<RoomId, string> = {
  living: '沟通与协作',
  study: '专业与学习',
  kitchen: '执行与产出',
  bedroom: '内驱与韧性',
  balcony: '成果与影响',
}

export const ROOM_SHORT: Record<RoomId, string> = {
  living: '客厅',
  study: '书房',
  kitchen: '厨房',
  bedroom: '卧室',
  balcony: '阳台',
}

export const ROOM_EMOJI: Record<RoomId, string> = {
  living: '🛋️',
  study: '📚',
  kitchen: '🍳',
  bedroom: '🛏️',
  balcony: '🌿',
}

/* ---- 视觉描述标签 ---- */

export const SIZE_LABELS: Record<string, string> = {
  xs: '迷样的', s: '小巧的', m: '', l: '宽大的', xl: '巨大的',
  simple: '简易的',
}

export const COND_LABELS: Record<string, string> = {
  new: '崭新光亮', used: '带着日常使用痕迹', worn: '磨损明显', dusty: '落了一层薄灰',
  stopped: '指针已停止走动', repaired: '带着修补的痕迹',
  heavy: '使用频繁留下印记', light: '不太常用保持整洁',
  neat: '整洁如新', tidy: '基本整洁', messy: '略显凌乱', chaotic: '凌乱不堪',
  clean: '干净清爽', dogeared: '页角被翻卷', inserts: '夹着补充页', closed: '被合上放在高处',
  scratch: '有轻微划痕', dent: '有一处明显凹痕', broken: '被砸坏的痕迹',
  shiny: '镜片清澈透亮', foggy: '镜面有些模糊', cased: '装在收纳盒里',
  sharp: '刀刃锋利', blunt: '刀刃还未开刃', guided: '刀刃上有利器划的准线',
  grease: '灶面有油渍', scratched: '灶面有多道划痕', empty: '灶上空空如也',
  owned: '刻着主人的标记', team: '旁边有几块协作的石头', supported: '旁边有支撑的架子', luck: '挂着幸运的露珠',
  active: '桌上有温热的茶杯', unused: '从未有人坐过', folded: '被折叠收纳',
  swinging: '在轻轻摆动', still: '静静挂着', high: '挂得很高不起眼',
  structured: '页面留有分栏笔记', narrative: '字迹连绵不断', checklist: '短句整齐排列', pressed: '有压痕但翻得不多',
  cracked: '有一道细细的裂纹', softglow: '镜面带着柔光',
  boxed: '装在未拆的包装盒里', curled: '一角卷起',
  busy: '旁边堆着待办清单', idle: '孤零零地放在那里',
  worn2: '封面磨损',
}

export const TONE_LABELS: Record<string, string> = {
  warm: '暖木色的', cool: '冷灰色的', neutral: '素净的', dark: '深色厚重的',
  shiny: '亮面崭新的', plain: '朴实无华的', unused: '还未开火的',
  metal: '金属质感的', fabric: '布质的', plastic: '塑料的', wood: '木质的',
  glass: '玻璃的', bamboo: '竹制的', shell: '贝壳的',
  none: '无框的', otherhand: '带着另一个人痕迹的',
  midwarm: '偏暖的', cold: '冷光的',
}

export const FORM_LABELS: Record<string, Record<string, string>> = {
  clock: { grandfather: '落地钟', round: '圆挂钟', digital: '数字钟', busy: '被便签层层包围的挂钟' },
  sofa: { loveseat: '双人沙发', lshape: 'L型转角沙发', ushape: 'U型大沙发', sectional: '组合沙发群' },
  phone: { smart: '智能手机', rotary: '老式拨盘电话', deskphone: '座机', walkie: '对讲机' },
  coffeetable: { mic: '立着话筒的茶几', coasters: '散着杯垫的茶几', notebook: '摊着笔记本的茶几', mixed: '杂物混放的茶几' },
  doormat: { s: '小门垫', m: '中号门垫', l: '大门垫', xl: '超大门垫' },
  pictureframe: { wide: '横画框', double: '双联画框', tall: '竖画框', desk: '台框' },
  bookshelf: { tallnarrow: '窄高书架', standard: '标准书架', wide: '宽书架', wall: '整面墙书架' },
  monitor: { bigscreen: '大屏显示器', dual: '双屏显示器', laptop: '笔记本电脑', triple: '三屏阵列' },
  whiteboard: { big: '大白板', smalldata: '小白板', mid: '中号白板', pieces: '拼接白板' },
  penholder: { pen: '钢笔笔筒', ballpen: '圆珠笔笔筒', pencil: '铅笔笔筒', mixed: '混装笔筒' },
  magnifier: { pro: '专业放大镜', standard: '标准放大镜', portable: '便携放大镜', borrowed: '借来的放大镜' },
  corkboard: { neat: '整齐的软木板', colored: '彩色标记软木板', mixed: '混杂软木板', chaotic: '凌乱软木板' },
  stove: { high: '猛火灶', mid: '中火灶', low: '小火灶', flicker: '火苗不稳定的灶' },
  pots: { saucepan: '小奶锅', wok: '炒锅', stockpot: '汤锅', commercial: '商用大锅' },
  recipestand: { thick: '厚食谱架', mid: '中等食谱架', thin: '薄食谱架', empty: '空食谱架' },
  timer: { digital: '倒计时器', mechanical: '机械计时器', brokenbell: '铃铛脱落的计时器', hourglass: '沙漏' },
  spicerack: { neat: '整齐的调料架', mostly: '基本整齐的调料架', messy: '有些杂乱的调料架', chaotic: '凌乱的调料架' },
  knifeblock: { chef: '主厨刀架', utility: '多功能刀架', fruit: '水果刀架', none: '空刀架' },
  bed: {},
  alarmclock: { swiss: '精密瑞士闹钟', twinbell: '双铃复古闹钟', progress: '带进度条的闹钟', countdown: '带倒计时的闹钟' },
  mirror: { clear: '高清镜子', normal: '普通镜子', blurry: '模糊的镜子', fogged: '蒙雾的镜子' },
  coatrack: {},
  notebook: { thick: '厚笔记本', mid: '中等笔记本', thin: '薄笔记本', empty: '空白笔记本' },
  desklamp: { spot: '聚光灯', flood: '散射灯', swing: '摇头灯', sway: '摇晃的灯' },
  pottedplant: { tree: '大树盆栽', flowering: '开花盆栽', small: '小盆栽', empty: '空花盆' },
  telescope: { astro: '天文望远镜', bino: '双筒望远镜', toy: '玩具望远镜', none: '空置' },
  windvane: { smooth: '流畅的风向标', sticky: '偶尔转动的风向标', still: '基本不动的风向标', removed: '被拆下的风向标' },
  balconytable: {},
  clothesline: {},
  windchime: { long: '长串风铃', mid: '中风铃', short: '短风铃', none: '空挂钩' },
}

/** 构建物品的视觉描述 */
export function describeItem(def: CabinItemDef, props: ItemAnswers): { desc: string; work: string } {
  const id = def.id
  const fm = props.form || ''
  const sz = props.size || 'm'
  const cd = props.condition || 'used'
  const tn = props.tone || ''

  let formName = fm
  if (FORM_LABELS[id] && FORM_LABELS[id][fm]) formName = FORM_LABELS[id][fm]
  else if (!formName) formName = def.name

  const sizeAdj = SIZE_LABELS[sz] || ''
  const condDesc = COND_LABELS[cd] || ''
  const toneAdj = TONE_LABELS[tn] || ''

  const parts: string[] = []
  if (sizeAdj) parts.push(sizeAdj)
  if (toneAdj) parts.push(toneAdj)
  parts.push(formName)
  let desc = parts.join('')
  if (condDesc) desc += '，' + condDesc
  else desc += '，外观完好'

  const record = makeRecord(def, props)
  return { desc: '一座' + desc, work: record }
}

/** 从用户实际选择的选项生成具体数据记录 */
function makeRecord(def: CabinItemDef, props: ItemAnswers): string {
  const parts: string[] = []
  def.questions.forEach(q => {
    const val = props[q.prop]
    if (!val) return
    const opt = q.opts.find(o => o.val === val)
    if (opt) {
      let label = q.text.replace(/[？?]/g, '').replace(/^你/, '').trim()
      if (label.length > 10) label = label.slice(0, 9) + '…'
      parts.push(label + '：' + opt.text)
    }
  })
  return parts.join('；')
}
