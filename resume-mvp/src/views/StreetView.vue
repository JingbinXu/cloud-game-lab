<template>
  <div class="street-page">
    <WorldviewScreen
      v-if="showWorldview"
      icon="🏚️"
      badge="世界观 A"
      title="你从失忆中醒来"
      subtitle="眼前是一条陌生的街道，几栋房子安静地矗立着。你隐约记得，每栋房子里都藏着一段你经历过的记忆……走进去看看吧。"
      color="#C05746"
      @continue="dismissWorldview"
    />

    <NewExperienceDialog
      v-if="showNewDialog"
      @close="showNewDialog = false"
      @confirm="onNewExperience"
    />

    <div class="top-bar">
      <h2>记忆街区</h2>
      <div class="btns">
        <button class="btn ghost small" @click="$router.push('/backpack')">背包</button>
      </div>
    </div>

    <canvas
      ref="canvasRef"
      width="880"
      height="380"
      @click="onCanvasClick"
      @mousemove="onCanvasMove"
    ></canvas>
    <div class="hint-text">点击房屋进入查看 · 每种岗位一栋楼 · 每段经历一层</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import WorldviewScreen from '../components/cabin/WorldviewScreen.vue'
import NewExperienceDialog from '../components/cabin/NewExperienceDialog.vue'

const router = useRouter()
const store = useExperienceStore()

const canvasRef = ref<HTMLCanvasElement>()
const showNewDialog = ref(false)
const showWorldview = ref(false)

const jobTypes = ['product', 'ops', 'marketing', 'tech', 'data', 'other']
const jobNames: Record<string, string> = {
  product: '产品', ops: '运营', marketing: '市场',
  tech: '技术', data: '数据', other: '其他',
}

interface HitBox { x: number; y: number; w: number; h: number; idx: number; type: 'house' | 'empty' }
let hitboxes: HitBox[] = []

// Deterministic pseudo-random for hand-drawn feel (seeded per frame)
let _seed = 42
function srand(s: number) { _seed = s }
function jitter(): number {
  _seed = (_seed * 16807) % 2147483647
  return (_seed / 2147483647 - 0.5) * 0.8 // ~[-0.4, +0.4]
}

function dismissWorldview() {
  showWorldview.value = false
  store.markWorldviewShown('street')
}

onMounted(async () => {
  await store.loadExperiences()
  if (!store.shownWorldviews['street']) {
    showWorldview.value = true
  }
  render()
})

function render() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')!
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssW = 880, cssH = 380
  canvasRef.value.width = cssW * dpr
  canvasRef.value.height = cssH * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)
  ctx.imageSmoothingEnabled = false
  hitboxes = []
  srand(42) // reset seed for consistent hand-drawn wobble

  const PX = 2
  const W = cssW / PX, H = cssH / PX

  // ── Background layers ──
  drawSky(ctx, PX, W)
  drawMountains(ctx, PX, W)
  drawGround(ctx, PX, W, H)
  drawPath(ctx, PX, W, H)
  drawGrassPatches(ctx, PX)
  drawStreetTrees(ctx, PX)

  // ── Houses (wider spacing for emptiness) ──
  const groundY = 100
  const houseW = 58
  const margin = 60
  const usable = W - margin * 2
  const spacing = usable / 5
  const plots = Array.from({ length: 6 }, (_, i) => Math.round(margin + spacing * i))

  plots.forEach((cx, i) => {
    const jt = jobTypes[i]
    const exps = store.experiences.filter(inv => inv.direction === jt)
    const hx = Math.round(cx - houseW / 2)

    if (exps.length > 0) {
      const floors = Math.min(exps.length, 3)
      const bodyH = 8 + floors * 16 + 6
      const roofH = 18
      const hy = groundY - bodyH - roofH
      drawPixelHouse(ctx, PX, hx, hy, houseW, bodyH, roofH, floors)
      hitboxes.push({ x: hx * PX, y: hy * PX, w: houseW * PX, h: (bodyH + roofH) * PX, idx: i, type: 'house' })
      // Draw label sign
      drawLabel(ctx, PX, hx + houseW + 4, groundY - 12, jobNames[jt] || '???')
    } else {
      drawEmptyPlot(ctx, PX, cx, groundY, houseW)
      hitboxes.push({ x: (cx - houseW / 2) * PX, y: (groundY - 26) * PX, w: houseW * PX, h: 26 * PX, idx: i, type: 'empty' })
    }
  })

  // ── Falling man easter egg ──
  drawFallingMan(ctx, PX, 420, 88)

  // ── Text overlay ──
  drawTextOverlay(ctx, cssW, cssH, plots, PX)
}

/* ── Black-and-white pixel-art helpers ── */

const K = '#000000'
const W_COLOR = '#ffffff'
const LINE_W = 2

function fillR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, PX: number) {
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX)
}
// Hand-drawn line with tiny random wobble
function wobbleLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, PX: number) {
  const jx1 = jitter(), jy1 = jitter(), jx2 = jitter(), jy2 = jitter()
  ctx.beginPath()
  ctx.moveTo((x1 + jx1) * PX, (y1 + jy1) * PX)
  // Add a mid-point wobble for longer lines
  const mx = (x1 + x2) / 2 + jitter()
  const my = (y1 + y2) / 2 + jitter()
  ctx.lineTo((mx) * PX, (my) * PX)
  ctx.lineTo((x2 + jx2) * PX, (y2 + jy2) * PX)
  ctx.stroke()
}
// Hand-drawn rectangle outline
function wobbleRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, PX: number) {
  wobbleLine(ctx, x, y, x + w, y, PX)
  wobbleLine(ctx, x + w, y, x + w, y + h, PX)
  wobbleLine(ctx, x + w, y + h, x, y + h, PX)
  wobbleLine(ctx, x, y + h, x, y, PX)
}

function drawSky(ctx: CanvasRenderingContext2D, PX: number, W: number) {
  ctx.fillStyle = W_COLOR
  ctx.fillRect(0, 0, W * PX, 100 * PX)

  // ── Stardew Valley style clouds: elongated, pixel-dot shaded ──
  ctx.fillStyle = K
  drawCloud(ctx, PX, 35, 14, 28, 8)   // large
  drawCloud(ctx, PX, 155, 20, 18, 6)  // medium
  drawCloud(ctx, PX, 270, 10, 34, 10) // largest
  drawCloud(ctx, PX, 380, 24, 14, 5)  // small
  drawCloud(ctx, PX, 420, 18, 22, 7)  // medium
}

function drawCloud(ctx: CanvasRenderingContext2D, PX: number, cx: number, cy: number, cw: number, ch: number) {
  // Cloud body: filled black dots forming a soft elongated oval
  // Use an elliptical mask: (dx/(cw/2))^2 + (dy/(ch/2))^2 <= 1
  const halfW = cw / 2
  const halfH = ch / 2
  for (let dy = -halfH; dy <= halfH; dy++) {
    for (let dx = -halfW; dx <= halfW; dx++) {
      const norm = (dx / halfW) ** 2 + (dy / halfH) ** 2
      if (norm <= 1.0) {
        // Core fill
        fillR(ctx, Math.round(cx + dx), Math.round(cy + dy), 1, 1, PX)
      }
    }
  }

  // Shadow dots on bottom-right (half-tone dithering)
  ctx.fillStyle = '#888888'
  for (let dx = -halfW + 2; dx <= halfW - 1; dx++) {
    for (let dy = 1; dy <= halfH; dy++) {
      const norm = ((dx + 0.5) / halfW) ** 2 + ((dy - 0.5) / halfH) ** 2
      // Checkerboard dither pattern for shadow
      if (norm <= 0.85 && (Math.round(cx + dx) + Math.round(cy + dy)) % 2 === 0) {
        fillR(ctx, Math.round(cx + dx), Math.round(cy + dy), 1, 1, PX)
      }
    }
  }
  ctx.fillStyle = K
}

function drawMountains(ctx: CanvasRenderingContext2D, PX: number, _W: number) {
  const baseY = 92
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  ctx.fillStyle = W_COLOR

  // Zigzag mountain silhouette
  ctx.beginPath()
  ctx.moveTo(0, baseY * PX)
  const peaks = [
    [0, baseY], [30, baseY - 18], [55, baseY - 8], [80, baseY - 24],
    [110, baseY - 6], [140, baseY - 20], [165, baseY - 10],
    [195, baseY - 28], [220, baseY - 12], [250, baseY - 22],
    [275, baseY - 8], [305, baseY - 16], [335, baseY - 5],
    [365, baseY - 26], [395, baseY - 10], [420, baseY - 18],
    [440, baseY],
  ]
  for (const [px, py] of peaks) {
    ctx.lineTo((px + jitter()) * PX, (py + jitter()) * PX)
  }
  ctx.stroke()
}

function drawGround(ctx: CanvasRenderingContext2D, PX: number, W: number, _H: number) {
  // Ground line
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  ctx.beginPath()
  ctx.moveTo(0, 100 * PX)
  for (let x = 0; x <= W; x += 8) {
    ctx.lineTo((x + jitter()) * PX, (100 + jitter()) * PX)
  }
  ctx.stroke()

  // Sparse ground texture dots
  ctx.fillStyle = K
  for (let x = 5; x < W; x += 12) {
    fillR(ctx, x + Math.round(jitter() * 2), 103, 1, 1, PX)
  }
  for (let x = 10; x < W; x += 18) {
    fillR(ctx, x, 106 + Math.round(jitter()), 2, 1, PX)
  }
}

function drawPath(ctx: CanvasRenderingContext2D, PX: number, W: number, H: number) {
  const cx = Math.round(W / 2)
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W

  // Path borders
  wobbleLine(ctx, cx - 8, 100, cx - 8, H, PX)
  wobbleLine(ctx, cx + 8, 100, cx + 8, H, PX)

  // Dashed center line
  ctx.setLineDash([3 * PX, 4 * PX])
  ctx.beginPath()
  ctx.moveTo(cx * PX, 102 * PX)
  ctx.lineTo(cx * PX, H * PX)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawGrassPatches(ctx: CanvasRenderingContext2D, PX: number) {
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  // Very sparse grass tufts
  const tufts = [25, 90, 180, 310, 380, 430]
  for (const gx of tufts) {
    // Simple grass: two angled lines
    ctx.beginPath()
    ctx.moveTo(gx * PX, 100 * PX)
    ctx.lineTo((gx - 1 + jitter()) * PX, (96 + jitter()) * PX)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo((gx + 2) * PX, 100 * PX)
    ctx.lineTo((gx + 3 + jitter()) * PX, (95 + jitter()) * PX)
    ctx.stroke()
  }
}

/* ── Pixel trees (dots + lines + shapes) ── */

function drawPixelTree(ctx: CanvasRenderingContext2D, PX: number, cx: number, gy: number, size: 'sm' | 'md' | 'lg') {
  ctx.fillStyle = K
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W

  const trunkH = size === 'lg' ? 12 : size === 'md' ? 9 : 6
  const canopyR = size === 'lg' ? 8 : size === 'md' ? 6 : 4

  // ── Trunk (vertical line + small cross-hatch) ──
  const trunkW = 2
  fillR(ctx, cx - 1, gy - trunkH, trunkW, trunkH, PX)
  // Bark texture dots
  for (let by = gy - trunkH + 2; by < gy - 1; by += 3) {
    fillR(ctx, cx, by, 1, 1, PX)
  }

  // ── Canopy: diamond/rhombus shape of filled pixels ──
  const topY = gy - trunkH - canopyR
  for (let dy = -canopyR; dy <= canopyR; dy++) {
    const rowW = canopyR - Math.abs(dy)
    for (let dx = -rowW; dx <= rowW; dx++) {
      // Sparse fill for organic feel (skip some inner pixels)
      if (Math.abs(dx) + Math.abs(dy) <= canopyR - 1 && (dx + dy) % 3 === 0) continue
      fillR(ctx, cx + dx, topY + canopyR + dy, 1, 1, PX)
    }
  }

  // ── Canopy outline (diamond contour) ──
  ctx.lineWidth = 1
  wobbleLine(ctx, cx, topY, cx + canopyR, topY + canopyR, PX)
  wobbleLine(ctx, cx, topY, cx - canopyR, topY + canopyR, PX)
  wobbleLine(ctx, cx - canopyR, topY + canopyR, cx, topY + canopyR * 2, PX)
  wobbleLine(ctx, cx + canopyR, topY + canopyR, cx, topY + canopyR * 2, PX)

  // ── Highlight dots (few white pixels for depth) ──
  ctx.fillStyle = W_COLOR
  fillR(ctx, cx - 1, topY + canopyR - 1, 1, 1, PX)
  if (size !== 'sm') fillR(ctx, cx - 2, topY + canopyR + 1, 1, 1, PX)

  // ── Shadow on ground ──
  ctx.fillStyle = '#888888'
  for (let sx = -canopyR + 1; sx < canopyR; sx += 2) {
    fillR(ctx, cx + sx, gy, 1, 1, PX)
  }
  ctx.fillStyle = K
}

function drawStreetTrees(ctx: CanvasRenderingContext2D, PX: number) {
  // Trees placed along the ground line, between houses and at edges
  const gy = 100
  const trees: Array<[number, 'sm' | 'md' | 'lg']> = [
    // Left edge cluster
    [8, 'md'],
    [16, 'sm'],
    // Between house 1 & 2
    [92, 'lg'],
    [96, 'sm'],
    // Between house 2 & 3
    [165, 'sm'],
    // Between house 3 & 4
    [240, 'md'],
    [246, 'sm'],
    // Between house 4 & 5
    [315, 'lg'],
    // Between house 5 & 6
    [378, 'sm'],
    [384, 'md'],
    // Right edge
    [428, 'lg'],
    [436, 'sm'],
  ]
  for (const [tx, sz] of trees) {
    drawPixelTree(ctx, PX, tx, gy, sz)
  }
}

/* ── Core house renderer (B&W hand-drawn style) ── */

function drawPixelHouse(
  ctx: CanvasRenderingContext2D, PX: number,
  x: number, y: number, w: number, bodyH: number, roofH: number,
  floors: number
) {
  const cx = Math.round(x + w / 2)
  const overhang = 6
  const roofL = x - overhang
  const roofR = x + w + overhang
  const roofTotalW = roofR - roofL

  ctx.strokeStyle = K
  ctx.fillStyle = K
  ctx.lineWidth = LINE_W

  // ── Roof (filled black triangle with white outline) ──
  ctx.fillStyle = K
  for (let rx = 0; rx < roofTotalW; rx++) {
    const distFromCenter = Math.abs(rx - roofTotalW / 2) / (roofTotalW / 2)
    const rh = Math.max(1, Math.ceil((1 - distFromCenter) * roofH))
    fillR(ctx, roofL + rx, y + roofH - rh, 1, rh, PX)
  }
  // Roof outline with wobble
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  wobbleLine(ctx, roofL, y + roofH, cx, y, PX)
  wobbleLine(ctx, cx, y, roofR, y + roofH, PX)
  wobbleLine(ctx, roofL, y + roofH, roofR, y + roofH, PX)

  // ── Chimney with smoke ──
  const chimX = cx + Math.floor(w / 4)
  ctx.fillStyle = K
  fillR(ctx, chimX, y - 2, 4, 6, PX)
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  wobbleRect(ctx, chimX, y - 2, 4, 6, PX)
  // Smoke trail (pixel dots rising)
  ctx.fillStyle = K
  fillR(ctx, chimX + 1, y - 5, 1, 1, PX)
  fillR(ctx, chimX + 3, y - 7, 1, 1, PX)
  fillR(ctx, chimX + 1, y - 9, 1, 1, PX)
  fillR(ctx, chimX + 2, y - 11, 1, 1, PX)

  // ── Body (white fill, black outline) ──
  ctx.fillStyle = W_COLOR
  fillR(ctx, x, y + roofH, w, bodyH, PX)
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  wobbleRect(ctx, x, y + roofH, w, bodyH, PX)

  // ── Horizontal floor lines ──
  for (let f = 1; f < floors; f++) {
    const fy = y + roofH + 12 + f * 16
    ctx.strokeStyle = K
    ctx.lineWidth = 1
    wobbleLine(ctx, x + 1, fy, x + w - 1, fy, PX)
  }

  // ── Windows ──
  ctx.strokeStyle = K
  ctx.fillStyle = W_COLOR
  ctx.lineWidth = LINE_W
  for (let f = 0; f < floors; f++) {
    const wy = y + roofH + 4 + f * 16
    const winPositions = [x + 5, x + w - 12]
    for (const wx of winPositions) {
      ctx.fillStyle = W_COLOR
      fillR(ctx, wx, wy, 7, 8, PX)
      ctx.strokeStyle = K
      ctx.lineWidth = LINE_W
      wobbleRect(ctx, wx, wy, 7, 8, PX)
      // Cross divider
      ctx.fillStyle = K
      fillR(ctx, wx + 3, wy, 1, 8, PX)
      fillR(ctx, wx, wy + 3, 7, 1, PX)
    }
  }

  // ── Door ──
  const doorY = y + roofH + bodyH - 14
  ctx.fillStyle = K
  fillR(ctx, cx - 3, doorY, 6, 12, PX)
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  wobbleRect(ctx, cx - 3, doorY, 6, 12, PX)
  // Door knob
  ctx.fillStyle = W_COLOR
  fillR(ctx, cx + 1, doorY + 6, 1, 1, PX)
  // Steps
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  wobbleLine(ctx, cx - 4, doorY + 12, cx + 4, doorY + 12, PX)
  wobbleLine(ctx, cx - 5, doorY + 14, cx + 5, doorY + 14, PX)
  // Step fill marks
  ctx.fillStyle = K
  fillR(ctx, cx - 3, doorY + 12, 1, 1, PX)
  fillR(ctx, cx + 2, doorY + 14, 1, 1, PX)
}

function drawEmptyPlot(ctx: CanvasRenderingContext2D, PX: number, cx: number, gy: number, w: number) {
  const hx = Math.round(cx - w / 2)
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  ctx.setLineDash([3 * PX, 3 * PX])
  wobbleRect(ctx, hx, gy - 26, w, 26, PX)
  ctx.setLineDash([])
  // Simple post
  ctx.fillStyle = K
  fillR(ctx, cx, gy - 20, 2, 20, PX)
}

/* ── Label sign (humorous) ── */

function drawLabel(ctx: CanvasRenderingContext2D, PX: number, x: number, y: number, text: string) {
  ctx.imageSmoothingEnabled = true
  const fontSize = 9
  ctx.font = `${fontSize}px "Courier New",monospace`
  ctx.textAlign = 'left'
  const metrics = ctx.measureText(text)
  const tw = metrics.width
  const pad = 4
  const signW = tw + pad * 2
  const signH = fontSize + pad * 2
  const sx = x * PX
  const sy = y * PX

  // White background with black border
  ctx.fillStyle = W_COLOR
  ctx.fillRect(sx, sy, signW, signH)
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W
  ctx.strokeRect(sx, sy, signW, signH)

  // Text
  ctx.fillStyle = K
  ctx.fillText(text, sx + pad, sy + pad + fontSize - 1)

  // Little post
  ctx.fillStyle = K
  ctx.fillRect(sx + signW / 2 - 1, sy + signH, 2, 6)

  ctx.imageSmoothingEnabled = false
}

/* ── Falling man easter egg ── */

function drawFallingMan(ctx: CanvasRenderingContext2D, PX: number, x: number, y: number) {
  ctx.fillStyle = K
  ctx.strokeStyle = K
  ctx.lineWidth = LINE_W

  // Head
  fillR(ctx, x, y, 2, 2, PX)
  // Body (tilted)
  fillR(ctx, x + 1, y + 2, 1, 4, PX)
  // Arms (flailing)
  fillR(ctx, x - 1, y + 2, 1, 1, PX)
  fillR(ctx, x + 3, y + 3, 1, 1, PX)
  fillR(ctx, x - 2, y + 3, 1, 1, PX)
  // Legs
  fillR(ctx, x, y + 6, 1, 2, PX)
  fillR(ctx, x + 2, y + 6, 1, 2, PX)
  // Motion lines
  ctx.lineWidth = 1
  wobbleLine(ctx, x - 4, y, x - 3, y + 1, PX)
  wobbleLine(ctx, x - 5, y + 2, x - 3, y + 3, PX)
}

/* ── Text overlay ── */

function drawTextOverlay(
  ctx: CanvasRenderingContext2D, cssW: number, cssH: number,
  plots: number[], PX: number
) {
  ctx.imageSmoothingEnabled = true

  plots.forEach((cx, i) => {
    const px = cx * PX
    const exps = store.experiences.filter(inv => inv.direction === jobTypes[i])
    if (exps.length > 0) {
      const floors = Math.min(exps.length, 3)
      const bodyH = 8 + floors * 16 + 6
      const roofH = 18
      const hy = (100 - bodyH - roofH) * PX

      ctx.fillStyle = K
      ctx.font = 'bold 11px "Courier New",monospace'
      ctx.textAlign = 'center'
      ctx.fillText(jobNames[jobTypes[i]], px, hy - 6)

      ctx.fillStyle = K
      ctx.font = '9px "Courier New",monospace'
      ctx.fillText(exps.length + '层', px, hy + (bodyH + roofH) * PX + 12)
    } else {
      ctx.fillStyle = '#999999'
      ctx.font = '10px "Courier New",monospace'
      ctx.textAlign = 'center'
      ctx.fillText('待建造', px, (100 - 12) * PX)
    }
  })

  ctx.fillStyle = '#888888'
  ctx.font = '10px "Courier New",monospace'
  ctx.textAlign = 'right'
  ctx.fillText('点击房屋进入查看 →', cssW - 16, cssH - 16)
  ctx.textAlign = 'left'
  ctx.imageSmoothingEnabled = false
}

/* ── Interaction ── */

function onCanvasClick(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const scaleX = 880 / rect.width, scaleY = 380 / rect.height
  const mx = (e.clientX - rect.left) * scaleX
  const my = (e.clientY - rect.top) * scaleY

  for (let i = hitboxes.length - 1; i >= 0; i--) {
    const hb = hitboxes[i]
    if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
      if (hb.type === 'empty') {
        showNewDialog.value = true
      } else {
        const jt = jobTypes[hb.idx]
        const exps = store.experiences.filter(inv => inv.direction === jt)
        if (exps.length > 0) {
          const PX = 2
          const floors = Math.min(exps.length, 3)
          const bodyH = 8 + floors * 16 + 6
          const roofH = 18
          const hy = (100 - bodyH - roofH) * PX
          const relY = my - hy - roofH * PX - 10
          const floorH = 16 * PX
          const floorIdx = Math.min(Math.max(Math.floor(relY / floorH), 0), exps.length - 1)
          router.push(`/house/${exps[floorIdx].id}`)
        }
      }
      return
    }
  }
}

function onCanvasMove(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const scaleX = 880 / rect.width, scaleY = 380 / rect.height
  const mx = (e.clientX - rect.left) * scaleX
  const my = (e.clientY - rect.top) * scaleY
  let found = false
  for (let i = hitboxes.length - 1; i >= 0; i--) {
    const hb = hitboxes[i]
    if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
      found = true; break
    }
  }
  canvasRef.value.style.cursor = found ? 'pointer' : 'default'
}

function onNewExperience(title: string, direction: string) {
  showNewDialog.value = false
  store.startNew(title, direction)
  router.push('/qa')
}

watch(() => store.experiences, () => render(), { deep: true })
</script>

<style scoped>
.street-page {
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.top-bar h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #000;
  font-family: "Courier New", monospace;
}
.btns {
  display: flex;
  gap: 8px;
}
canvas {
  display: block;
  border: 2px solid #000;
  max-width: 100%;
  image-rendering: pixelated;
  background: #fff;
}
.hint-text {
  text-align: center;
  color: #888;
  font-size: 0.78rem;
  margin-top: 4px;
  font-family: "Courier New", monospace;
}
.btn {
  background: #000;
  color: #fff;
  border: 2px solid #000;
  padding: 7px 16px;
  font-size: 0.75rem;
  font-family: "Courier New", monospace;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
}
.btn.ghost {
  background: #fff;
  border: 2px solid #000;
  color: #000;
  padding: 7px 16px;
  font-size: 0.75rem;
}
.btn.ghost:hover {
  background: #000;
  color: #fff;
}
</style>
