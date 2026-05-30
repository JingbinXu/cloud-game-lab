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

const TILE_W = 86
const TILE_H = 43
const ORIGIN_X = 430
const ORIGIN_Y = 55

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
    x: ORIGIN_X + (tx - ty) * (TILE_W / 2),
    y: ORIGIN_Y + (tx + ty) * (TILE_H / 2) - tz * TILE_H,
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
  itemHitboxes = []

  const cabinItems = getCabinItems()

  // Draw rooms
  const allRooms: RoomId[] = ['kitchen', 'bedroom', 'balcony', 'living', 'study']
  allRooms.forEach(rk => {
    const r = ROOM_DEFS.find(rd => rd.id === rk)!
    const corners = [toScreen(r.bounds.x, r.bounds.y, 0), toScreen(r.bounds.x + r.bounds.w, r.bounds.y, 0), toScreen(r.bounds.x + r.bounds.w, r.bounds.y + r.bounds.h, 0), toScreen(r.bounds.x, r.bounds.y + r.bounds.h, 0)]
    ctx!.fillStyle = '#fdfcf9'
    ctx!.beginPath(); ctx!.moveTo(corners[0].x, corners[0].y); ctx!.lineTo(corners[1].x, corners[1].y); ctx!.lineTo(corners[2].x, corners[2].y); ctx!.lineTo(corners[3].x, corners[3].y); ctx!.closePath(); ctx!.fill()
    ctx!.strokeStyle = '#c8b898'; ctx!.lineWidth = 0.7; ctx!.stroke()
    ctx!.strokeStyle = '#2c2416'; ctx!.lineWidth = 1.6

    // Walls
    if (rk !== 'balcony') {
      const wh = 16
      const tr = toScreen(r.bounds.x + r.bounds.w, r.bounds.y, 0)
      const br = toScreen(r.bounds.x + r.bounds.w, r.bounds.y + r.bounds.h, 0)
      const bl = toScreen(r.bounds.x, r.bounds.y + r.bounds.h, 0)
      ctx!.beginPath(); ctx!.moveTo(tr.x, tr.y); ctx!.lineTo(tr.x, tr.y - wh); ctx!.lineTo(br.x, br.y - wh); ctx!.lineTo(br.x, br.y); ctx!.stroke()
      ctx!.beginPath(); ctx!.moveTo(br.x, br.y); ctx!.lineTo(br.x, br.y - wh); ctx!.lineTo(bl.x, bl.y - wh); ctx!.lineTo(bl.x, bl.y); ctx!.stroke()
    }

    // Room label
    const lp = toScreen(r.bounds.x + r.bounds.w / 2, r.bounds.y + r.bounds.h / 2, 0)
    ctx!.fillStyle = '#c8b898'; ctx!.font = '11px "Noto Serif SC","SimSun",serif'
    const labels: Record<string, string> = { kitchen: '厨房', bedroom: '卧室', balcony: '阳台', living: '客厅', study: '书房' }
    ctx!.fillText(labels[rk], lp.x - 12, lp.y)
  })

  // Roof
  const tl = toScreen(0, 0, 0), tr2 = toScreen(6, 0, 0), roofH = 28
  ctx!.lineWidth = 1.4; ctx!.strokeStyle = '#3a2a16'
  ctx!.beginPath(); ctx!.moveTo(tl.x - 12, tl.y - 4); ctx!.lineTo((tl.x + tr2.x) / 2, tl.y - roofH); ctx!.lineTo(tr2.x + 12, tr2.y - 4); ctx!.stroke()
  ctx!.strokeStyle = '#2c2416'; ctx!.lineWidth = 1.6

  // Door
  const dc = toScreen(2.5, 5.9, 0)
  ctx!.lineWidth = 1.4
  ctx!.beginPath(); ctx!.moveTo(dc.x - 8, dc.y); ctx!.lineTo(dc.x - 8, dc.y - 14); ctx!.lineTo(dc.x + 8, dc.y - 14); ctx!.lineTo(dc.x + 8, dc.y); ctx!.stroke()
  ctx!.beginPath(); ctx!.arc(dc.x + 5, dc.y - 7, 1.8, 0, Math.PI * 2); ctx!.fill()
  ctx!.lineWidth = 1.6

  // Draw items
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
    const rx = screenX - ORIGIN_X, ry = screenY - ORIGIN_Y
    const tx = (rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2
    const ty = (ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2
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
  border-radius: 16px;
  max-width: 100%;
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