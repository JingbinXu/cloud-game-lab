<template>
  <div class="cabin-canvas-wrap" ref="wrapRef">
    <canvas ref="canvasRef" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseLeave"></canvas>
    <div class="tooltip" :class="{ show: tooltip.show }" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tip-desc">{{ tooltip.desc }}</div>
      <div class="tip-work">{{ tooltip.work }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useExperienceStore } from '../../stores/experience'
import { ROOM_DEFS, describeItem, type RoomId, type GridPos } from '../../types/cabin'
import { itemDefs, ITEM_BY_ID } from '../../data/itemDefs'
import { drawFnMap } from './itemDrawers'

const GRID_W = 6
const GRID_H = 8.5
let TILE_W = 80
let TILE_H = 80
let TILE_SIZE = 80
let ORIGIN_X = 60
let ORIGIN_Y = 40

const store = useExperienceStore()
const { currentItemAnswers, currentRoomPlacements } = storeToRefs(store)

const canvasRef = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let needRender = true

interface HitBox { x: number; y: number; w: number; h: number; id: string }
let itemHitboxes: HitBox[] = []

const tooltip = ref({ show: false, desc: '', work: '', x: 0, y: 0 })
let dragState: { active: boolean; id: string; room: string; offsetX: number; offsetY: number } | null = null

const emit = defineEmits<{
  (e: 'item-click', itemId: string): void
}>()

function toScreen(tx: number, ty: number, tz: number) {
  return {
    x: ORIGIN_X + tx * TILE_W,
    y: ORIGIN_Y + ty * TILE_H,
  }
}

function roomGridPositions(roomKey: string): GridPos[] {
  const r = ROOM_DEFS.find(rd => rd.id === roomKey)
  if (!r) return []
  const positions: GridPos[] = []
  const step = 0.7
  for (let tx = r.bounds.x + 0.5; tx < r.bounds.x + r.bounds.w; tx += step) {
    for (let ty = r.bounds.y + 0.5; ty < r.bounds.y + r.bounds.h; ty += step) {
      if (tx > r.bounds.x + 0.3 && tx < r.bounds.x + r.bounds.w - 0.3 && ty > r.bounds.y + 0.3 && ty < r.bounds.y + r.bounds.h - 0.3) {
        positions.push({ tx, ty })
      }
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }
  return positions
}

function getCabinItems() {
  const map: Record<string, { id: string; room: string; stx: number; sty: number; answers: Record<string, string> }[]> = {}
  const roomGrids: Record<string, GridPos[]> = {}
  for (const rd of ROOM_DEFS) {
    map[rd.id] = []
    roomGrids[rd.id] = roomGridPositions(rd.id)
  }
  itemDefs.forEach(def => {
    const props: Record<string, string> = {}
    def.questions.forEach(q => { props[q.prop] = currentItemAnswers.value[def.id]?.[q.prop as keyof typeof currentItemAnswers.value[string]] || q.opts[0].val })
    const room = def.room
    let pos: GridPos
    if (currentRoomPlacements.value[def.id]) {
      pos = currentRoomPlacements.value[def.id]
    } else {
      const slotIdx = map[room].length
      const rDef = ROOM_DEFS.find(rd => rd.id === room)!
      pos = roomGrids[room][slotIdx] || { tx: rDef.bounds.x + 1, ty: rDef.bounds.y + 1 }
    }
    map[room].push({ id: def.id, room, stx: pos.tx, sty: pos.ty, answers: props })
  })
  return map
}

function render() {
  if (!canvasRef.value || !ctx) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = canvasRef.value.getBoundingClientRect()
  const w = rect.width, h = rect.height
  canvasRef.value.width = w * dpr
  canvasRef.value.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#fafaf8'
  ctx.fillRect(0, 0, w, h)

  // 动态计算，X/Y 独立拉伸，铺满整个 canvas（不留空隙）
  TILE_W = w / GRID_W
  TILE_H = h / GRID_H
  TILE_SIZE = Math.min(TILE_W, TILE_H)
  ORIGIN_X = 0
  ORIGIN_Y = 0

  itemHitboxes = []
  const cabinItems = getCabinItems()

  const labels: Record<string, string> = { kitchen: '厨房', bedroom: '卧室', balcony: '阳台', living: '客厅', study: '书房' }
  const WALL = 4 // 墙体线宽

  // ========== 填充房间 ==========
  const allRooms: RoomId[] = ['kitchen', 'bedroom', 'living', 'study', 'balcony']
  allRooms.forEach(rk => {
    const r = ROOM_DEFS.find(rd => rd.id === rk)!
    const x = ORIGIN_X + r.bounds.x * TILE_W
    const y = ORIGIN_Y + r.bounds.y * TILE_H
    const rw = r.bounds.w * TILE_W
    const rh = r.bounds.h * TILE_H
    ctx!.fillStyle = '#fdfcf9'
    ctx!.fillRect(x, y, rw, rh)

    // 房间标签
    ctx!.fillStyle = '#b8a888'
    ctx!.font = 'bold 15px "Noto Serif SC","SimSun",serif'
    ctx!.textAlign = 'center'
    ctx!.textBaseline = 'middle'
    ctx!.fillText(labels[rk], x + rw / 2, y + rh / 2)
  })

  // ========== 绘制墙体 ==========
  ctx!.strokeStyle = '#2c2416'
  ctx!.lineWidth = WALL
  allRooms.forEach(rk => {
    const r = ROOM_DEFS.find(rd => rd.id === rk)!
    const x = ORIGIN_X + r.bounds.x * TILE_W
    const y = ORIGIN_Y + r.bounds.y * TILE_H
    const rw = r.bounds.w * TILE_W
    const rh = r.bounds.h * TILE_H
    ctx!.strokeRect(x, y, rw, rh)
  })

  // ========== 辅助函数 ==========
  function drawArc(gx: number, gy: number, sweepDown: boolean, sweepRight: boolean, leafLen: number) {
    const cx = ORIGIN_X + gx * TILE_W
    const cy = ORIGIN_Y + gy * TILE_H
    const r = leafLen * TILE_W
    ctx!.strokeStyle = '#2c2416'
    ctx!.lineWidth = 2
    // 门扇线
    if (sweepDown) {
      ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(cx, cy + r); ctx!.stroke()
    } else {
      ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(cx + r, cy); ctx!.stroke()
    }
    // 弧线
    let startA: number, endA: number
    if (sweepDown && sweepRight) { startA = -Math.PI / 2; endA = 0 }
    else if (sweepDown && !sweepRight) { startA = Math.PI; endA = Math.PI / 2; sweepRight }
    else if (!sweepDown && sweepRight) { startA = Math.PI; endA = -Math.PI / 2 }
    else { startA = -Math.PI / 2; endA = Math.PI }
    ctx!.beginPath()
    ctx!.arc(cx, cy, r, startA, endA, !sweepRight)
    ctx!.stroke()
  }

  // ========== 入户门（北墙） ==========
  const entryX = ORIGIN_X + 1 * TILE_W
  const entryY = ORIGIN_Y + 0
  ctx!.strokeStyle = '#2c2416'
  ctx!.lineWidth = 3
  ctx!.beginPath(); ctx!.moveTo(entryX, entryY); ctx!.lineTo(entryX + 1.4 * TILE_W, entryY); ctx!.stroke()
  ctx!.lineWidth = 1.5
  ctx!.beginPath(); ctx!.moveTo(entryX, entryY + 3); ctx!.lineTo(entryX + 1.4 * TILE_W, entryY + 3); ctx!.stroke()
  // 入户门弧线
  ctx!.lineWidth = 2
  ctx!.beginPath(); ctx!.moveTo(entryX, entryY); ctx!.lineTo(entryX, entryY + 0.8 * TILE_H); ctx!.stroke()
  ctx!.beginPath(); ctx!.arc(entryX, entryY, 0.8 * TILE_H, Math.PI / 2, 0, true); ctx!.stroke()

  // ========== 室内门（圆弧表示） ==========
  // 厨房→客厅：南墙 x=1
  drawArc(1, 3, true, true, 0.7)
  // 主卧→客厅：南墙 x=4
  drawArc(4, 3, true, true, 0.7)
  // 主卧→次卧：西墙 y=1.5
  drawArc(3, 1.5, false, true, 0.7)
  // 书房→阳台：南墙 x=1
  drawArc(1, 6, true, true, 0.7)

  // ========== 窗户 ==========
  ctx!.strokeStyle = '#6ba3d6'
  ctx!.lineWidth = 2.5
  function drawWin(gx: number, gy: number, horizontal: boolean, len: number) {
    const px = ORIGIN_X + gx * TILE_W
    const py = ORIGIN_Y + gy * TILE_H
    if (horizontal) {
      // 水平墙上的窗 → 三线段
      ctx!.beginPath(); ctx!.moveTo(px, py - 3); ctx!.lineTo(px + len, py - 3); ctx!.stroke()
      ctx!.beginPath(); ctx!.moveTo(px, py + 3); ctx!.lineTo(px + len, py + 3); ctx!.stroke()
      ctx!.beginPath(); ctx!.moveTo(px, py); ctx!.lineTo(px + len, py); ctx!.stroke()
    } else {
      ctx!.beginPath(); ctx!.moveTo(px - 3, py); ctx!.lineTo(px - 3, py + len); ctx!.stroke()
      ctx!.beginPath(); ctx!.moveTo(px + 3, py); ctx!.lineTo(px + 3, py + len); ctx!.stroke()
      ctx!.beginPath(); ctx!.moveTo(px, py); ctx!.lineTo(px, py + len); ctx!.stroke()
    }
  }
  // 北墙窗户
  drawWin(0.5, 0, true, 1.5 * TILE_W)   // 厨房
  drawWin(3.8, 0, true, 1.5 * TILE_W)   // 主卧
  // 南墙窗户
  drawWin(0.8, 6, true, 0.8 * TILE_W)   // 书房
  drawWin(2.5, 3, true, 1.5 * TILE_W)   // 客厅
  drawWin(4.3, 6, true, 1.2 * TILE_W)   // 阳台

  // ========== 北方向标 ==========
  const nX = w - 35, nY = 35
  ctx!.strokeStyle = '#bbb'
  ctx!.lineWidth = 1.5
  ctx!.beginPath(); ctx!.moveTo(nX, nY + 12); ctx!.lineTo(nX, nY - 12); ctx!.stroke()
  ctx!.beginPath(); ctx!.moveTo(nX - 6, nY - 8); ctx!.lineTo(nX, nY - 14); ctx!.lineTo(nX + 6, nY - 8); ctx!.fill()
  ctx!.fillStyle = '#bbb'
  ctx!.font = 'bold 11px sans-serif'
  ctx!.textAlign = 'center'
  ctx!.fillText('N', nX, nY - 18)

  // ========== 绘制物品 ==========
  const allEntries: { id: string; sx: number; sy: number; room: string; answers: Record<string, string> }[] = []
  Object.entries(cabinItems).forEach(([room, items]) => {
    items.forEach(item => {
      const sc = toScreen(item.stx, item.sty, 0)
      allEntries.push({ ...item, sx: sc.x, sy: sc.y, room })
    })
  })
  allEntries.sort((a, b) => a.sy - b.sy)
  allEntries.forEach(entry => {
    const fn = drawFnMap[entry.id]
    if (fn) fn(ctx!, entry.sx, entry.sy, 18, entry.answers as any)
    const isComplete = ITEM_BY_ID[entry.id]?.questions.every(q => !!currentItemAnswers.value[entry.id]?.[q.prop])
    if (!isComplete) {
      ctx!.globalAlpha = 0.4
    }
    itemHitboxes.push({ x: entry.sx - 18, y: entry.sy - 20, w: 36, h: 40, id: entry.id })
    ctx!.globalAlpha = 1
  })
}

function scheduleRender() {
  if (!needRender) {
    needRender = true
    rafId = requestAnimationFrame(() => {
      if (needRender) { render(); needRender = false }
    })
  }
}

function findItemAt(mx: number, my: number): HitBox | null {
  for (let i = itemHitboxes.length - 1; i >= 0; i--) {
    const hb = itemHitboxes[i]
    if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) return hb
  }
  return null
}

function onMouseDown(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const mx = e.clientX - rect.left, my = e.clientY - rect.top
  const found = findItemAt(mx, my)
  if (found) {
    const def = ITEM_BY_ID[found.id]
    dragState = { active: true, id: found.id, room: def?.room || '', offsetX: mx - found.x, offsetY: my - found.y }
    canvasRef.value.style.cursor = 'grabbing'
    tooltip.value.show = false
    e.preventDefault()
  }
}

function onMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const mx = e.clientX - rect.left, my = e.clientY - rect.top

  if (dragState?.active) {
    const screenX = mx - dragState.offsetX + 18, screenY = my - dragState.offsetY + 20
    const tx = (screenX - ORIGIN_X) / TILE_W
    const ty = (screenY - ORIGIN_Y) / TILE_H
    const snapTx = Math.round(tx / 0.35) * 0.35
    const snapTy = Math.round(ty / 0.35) * 0.35
    const rb = ROOM_DEFS.find(rd => rd.id === dragState!.room)?.bounds
    if (rb) {
      const ctx2 = Math.max(rb.x + 0.4, Math.min(rb.x + rb.w - 0.4, snapTx))
      const cty = Math.max(rb.y + 0.4, Math.min(rb.y + rb.h - 0.4, snapTy))
      store.setItemPlacement(dragState.id, { tx: ctx2, ty: cty })
    }
    scheduleRender()
    return
  }

  // Hover tooltip
  const found = findItemAt(mx, my)
  if (found) {
    const def = ITEM_BY_ID[found.id]
    if (def) {
      const answers = currentItemAnswers.value[found.id] || {} as Record<string, string>
      const info = describeItem(def, answers as any)
      tooltip.value = { show: true, desc: info.desc, work: info.work, x: Math.min(e.clientX + 18, window.innerWidth - 300), y: Math.max(e.clientY - 70, 10) }
    }
  } else {
    tooltip.value.show = false
  }
  canvasRef.value.style.cursor = found ? 'pointer' : 'default'
}

function onMouseUp(e: MouseEvent) {
  if (dragState?.active) {
    dragState.active = false
    if (canvasRef.value) canvasRef.value.style.cursor = 'default'
    scheduleRender()
    // If barely moved, treat as click
    // For simplicity, always emit click on mouseup over an item
    const rect = canvasRef.value!.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const found = findItemAt(mx, my)
    if (found && found.id === dragState?.id) {
      emit('item-click', found.id)
    }
    dragState = null
    return
  }
  // Click without drag
  const rect = canvasRef.value!.getBoundingClientRect()
  const mx = e.clientX - rect.left, my = e.clientY - rect.top
  const found = findItemAt(mx, my)
  if (found) emit('item-click', found.id)
}

function onMouseLeave() {
  tooltip.value.show = false
  if (dragState?.active) {
    dragState.active = false
    if (canvasRef.value) canvasRef.value.style.cursor = 'default'
    scheduleRender()
  }
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  render()

  const onResize = () => scheduleRender()
  window.addEventListener('resize', onResize)
  ;(canvasRef.value as any).__onResize = onResize
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  if (canvasRef.value) {
    const fn = (canvasRef.value as any).__onResize
    if (fn) window.removeEventListener('resize', fn)
  }
})

watch([currentItemAnswers, currentRoomPlacements], () => scheduleRender(), { deep: true })
</script>

<style scoped>
.cabin-canvas-wrap {
  position: relative;
  width: 100%;
  flex: 1;
}
.cabin-canvas-wrap canvas {
  display: block;
  border: 4px solid #2c2416;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.tooltip {
  position: fixed;
  pointer-events: none;
  opacity: 0;
  background: #2c2416;
  color: #fafaf8;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 0.8rem;
  line-height: 1.5;
  max-width: 280px;
  z-index: 100;
  transition: opacity 0.14s;
  box-shadow: 0 6px 24px rgba(44, 36, 22, 0.2);
}
.tooltip.show { opacity: 1; }
.tip-desc { font-weight: 600; font-size: 0.88rem; }
.tip-work { color: #c8b898; font-size: 0.73rem; margin-top: 3px; }
</style>