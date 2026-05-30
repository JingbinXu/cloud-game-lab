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
        <button class="btn ghost small" @click="$router.push('/backpack')">🎒 背包</button>
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

const roofColors = ['#c44a3f', '#4a9c5e', '#d4a04a', '#5a8cc4', '#9c5ab5', '#c47a3f']

interface HitBox { x: number; y: number; w: number; h: number; idx: number; type: 'house' | 'empty' }
let hitboxes: HitBox[] = []

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

  const PX = 2 // each pixel-art unit = 2 CSS px
  const W = cssW / PX, H = cssH / PX

  // ── Background ──
  drawSky(ctx, PX, W)
  drawGround(ctx, PX, W, H)
  drawPath(ctx, PX, W, H)
  drawStones(ctx, PX)
  drawBGTrees(ctx, PX)

  // ── Houses ──
  const groundY = 100
  const houseW = 62
  const spacing = W / 6
  const plots = Array.from({ length: 6 }, (_, i) => Math.round(spacing * i + spacing / 2))

  plots.forEach((cx, i) => {
    const jt = jobTypes[i]
    const exps = store.experiences.filter(inv => inv.direction === jt)
    const hx = Math.round(cx - houseW / 2)

    if (exps.length > 0) {
      const bodyH = 10 + exps.length * 14 + 6
      const roofH = 14
      const hy = groundY - bodyH - roofH
      drawPixelHouse(ctx, PX, hx, hy, houseW, bodyH, roofH, roofColors[i], exps)
      hitboxes.push({ x: hx * PX, y: hy * PX, w: houseW * PX, h: (bodyH + roofH) * PX, idx: i, type: 'house' })
    } else {
      drawEmptyPlot(ctx, PX, cx, groundY, houseW)
      hitboxes.push({ x: (cx - houseW / 2) * PX, y: (groundY - 26) * PX, w: houseW * PX, h: 26 * PX, idx: i, type: 'empty' })
    }
  })

  // ── Text overlay (HTML text on pixel-art scene) ──
  drawTextOverlay(ctx, cssW, cssH, plots, PX)
}

/* ── Pixel-art helpers ── */

function fillR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, PX: number) {
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX)
}
function outlineR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, PX: number) {
  ctx.strokeRect(x * PX, y * PX, w * PX, h * PX)
}

function drawSky(ctx: CanvasRenderingContext2D, PX: number, W: number) {
  const skyH = 100
  const grad = ctx.createLinearGradient(0, 0, 0, skyH * PX)
  grad.addColorStop(0, '#6bb5e3')
  grad.addColorStop(0.55, '#8ecae6')
  grad.addColorStop(1, '#b8dced')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W * PX, skyH * PX)

  // Clouds
  ctx.fillStyle = '#e8f0f8'
  fillR(ctx, 38, 12, 20, 5, PX)
  fillR(ctx, 43, 9, 12, 4, PX)
  fillR(ctx, 155, 18, 16, 4, PX)
  fillR(ctx, 160, 15, 8, 4, PX)
  fillR(ctx, 275, 10, 22, 5, PX)
  fillR(ctx, 280, 7, 14, 4, PX)
  fillR(ctx, 370, 20, 14, 4, PX)
}

function drawGround(ctx: CanvasRenderingContext2D, PX: number, W: number, H: number) {
  ctx.fillStyle = '#7ab84a'
  fillR(ctx, 0, 100, W, 10, PX)
  ctx.fillStyle = '#6aa83c'
  for (let x = 0; x < W; x += 4) fillR(ctx, x, 100, 2, 1, PX)
  for (let x = 2; x < W; x += 6) fillR(ctx, x, 102, 1, 1, PX)
  ctx.fillStyle = '#8cc854'
  for (let x = 1; x < W; x += 5) fillR(ctx, x, 104, 2, 1, PX)

  ctx.fillStyle = '#c4a468'
  fillR(ctx, 0, 110, W, H - 110, PX)
  ctx.fillStyle = '#b8985c'
  for (let x = 0; x < W; x += 7) fillR(ctx, x, 112, 3, 2, PX)
  for (let x = 3; x < W; x += 9) fillR(ctx, x, 120, 2, 1, PX)
}

function drawPath(ctx: CanvasRenderingContext2D, PX: number, W: number, H: number) {
  const cx = Math.round(W / 2)
  ctx.fillStyle = '#d4bc8c'
  fillR(ctx, cx - 10, 100, 20, H - 100, PX)
  ctx.fillStyle = '#c8ac78'
  for (let y = 102; y < H; y += 5) {
    fillR(ctx, cx - 8, y, 2, 2, PX)
    fillR(ctx, cx + 4, y + 2, 2, 1, PX)
  }
  ctx.fillStyle = '#e0c898'
  fillR(ctx, cx - 10, 100, 20, 1, PX)
}

function drawStones(ctx: CanvasRenderingContext2D, PX: number) {
  ctx.fillStyle = '#9a8a6a'
  const cx = Math.round(440 / PX / 2)
  const stones = [
    [cx - 14, 105], [cx - 8, 112], [cx + 10, 108], [cx - 12, 125],
    [cx + 12, 122], [cx - 6, 135], [cx + 8, 138],
  ]
  for (const [sx, sy] of stones) fillR(ctx, sx, sy, 2, 2, PX)
}

function drawBGTrees(ctx: CanvasRenderingContext2D, PX: number) {
  const positions = [18, 72, 175, 268, 360, 412]
  for (const tx of positions) {
    drawPixelTree(ctx, PX, tx, 92)
  }
}

function drawPixelTree(ctx: CanvasRenderingContext2D, PX: number, cx: number, gy: number) {
  ctx.fillStyle = '#6b4226'
  fillR(ctx, cx, gy - 8, 2, 8, PX)
  ctx.fillStyle = '#3a8c3a'
  fillR(ctx, cx - 4, gy - 14, 10, 4, PX)
  fillR(ctx, cx - 2, gy - 18, 6, 4, PX)
  fillR(ctx, cx - 5, gy - 12, 12, 2, PX)
  ctx.fillStyle = '#48a848'
  fillR(ctx, cx - 3, gy - 16, 2, 2, PX)
  fillR(ctx, cx + 1, gy - 13, 2, 2, PX)
}

function drawPixelHouse(
  ctx: CanvasRenderingContext2D, PX: number,
  x: number, y: number, w: number, bodyH: number, roofH: number,
  roofColor: string, exps: any[]
) {
  const cx = Math.round(x + w / 2)

  // ── Roof (filled + outline) ──
  const overhang = 6
  const roofL = x - overhang
  const roofR = x + w + overhang
  const roofTotalW = roofR - roofL

  ctx.fillStyle = roofColor
  for (let rx = 0; rx < roofTotalW; rx++) {
    const distFromCenter = Math.abs(rx - roofTotalW / 2) / (roofTotalW / 2)
    const rh = Math.max(1, Math.ceil((1 - distFromCenter) * roofH))
    fillR(ctx, roofL + rx, y + roofH - rh, 1, rh, PX)
  }
  // Roof light edge (left half highlight)
  ctx.fillStyle = lighten(roofColor, 0.2)
  for (let rx = 0; rx < Math.floor(roofTotalW / 2); rx++) {
    const distFromCenter = Math.abs(rx - roofTotalW / 2) / (roofTotalW / 2)
    const rh = Math.max(1, Math.ceil((1 - distFromCenter) * roofH))
    fillR(ctx, roofL + rx, y + roofH - rh, 1, 1, PX)
  }
  // Roof outline
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = PX
  ctx.beginPath()
  ctx.moveTo(roofL * PX, (y + roofH) * PX)
  ctx.lineTo(cx * PX, y * PX)
  ctx.lineTo(roofR * PX, (y + roofH) * PX)
  ctx.closePath()
  ctx.stroke()

  // ── Chimney ──
  const chimX = cx + Math.floor(w / 4)
  ctx.fillStyle = '#8b6a50'
  fillR(ctx, chimX, y - 4, 4, 6, PX)
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = PX
  outlineR(ctx, chimX, y - 4, 4, 6, PX)

  // ── Body ──
  ctx.fillStyle = '#f5ede0'
  fillR(ctx, x, y + roofH, w, bodyH, PX)
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = PX
  outlineR(ctx, x, y + roofH, w, bodyH, PX)

  // ── Floor lines ──
  for (let f = 1; f < exps.length; f++) {
    const fy = y + roofH + 10 + f * 14
    ctx.fillStyle = '#d4c8b0'
    fillR(ctx, x + 1, fy, w - 2, 1, PX)
  }

  // ── Windows ──
  for (let f = 0; f < exps.length; f++) {
    const wy = y + roofH + 4 + f * 14
    const winPositions = [x + 4, x + w - 11]
    for (const wx of winPositions) {
      ctx.fillStyle = '#8ab8d8'
      fillR(ctx, wx, wy, 7, 7, PX)
      ctx.strokeStyle = '#3a2a1a'
      ctx.lineWidth = PX
      outlineR(ctx, wx, wy, 7, 7, PX)
      ctx.fillStyle = '#3a2a1a'
      fillR(ctx, wx + 3, wy, 1, 7, PX)
      fillR(ctx, wx, wy + 3, 7, 1, PX)
    }
  }

  // ── Door ──
  const doorY = y + roofH + bodyH - 14
  ctx.fillStyle = '#7a5a14'
  fillR(ctx, cx - 3, doorY, 6, 12, PX)
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = PX
  outlineR(ctx, cx - 3, doorY, 6, 12, PX)
  ctx.fillStyle = '#c8a030'
  fillR(ctx, cx + 1, doorY + 6, 1, 1, PX)
  // Door arch
  ctx.fillStyle = '#f5ede0'
  fillR(ctx, cx - 4, doorY - 1, 8, 1, PX)
  // Steps
  ctx.fillStyle = '#c8b898'
  fillR(ctx, cx - 4, doorY + 12, 8, 2, PX)
  fillR(ctx, cx - 5, doorY + 14, 10, 2, PX)
  ctx.strokeStyle = '#8a7a5a'
  ctx.lineWidth = 1
  outlineR(ctx, cx - 4, doorY + 12, 8, 2, PX)
  outlineR(ctx, cx - 5, doorY + 14, 10, 2, PX)

  // ── Grass tufts at base ──
  ctx.fillStyle = '#5a9a32'
  fillR(ctx, x - 1, y + roofH + bodyH, 2, 2, PX)
  fillR(ctx, x + w - 1, y + roofH + bodyH, 2, 2, PX)
  fillR(ctx, cx + 8, y + roofH + bodyH, 2, 1, PX)
}

function drawEmptyPlot(ctx: CanvasRenderingContext2D, PX: number, cx: number, gy: number, w: number) {
  const hx = Math.round(cx - w / 2)
  ctx.strokeStyle = '#b8a888'
  ctx.lineWidth = PX
  ctx.setLineDash([3 * PX, 3 * PX])
  outlineR(ctx, hx, gy - 26, w, 26, PX)
  ctx.setLineDash([])
  ctx.fillStyle = '#8a7a5a'
  fillR(ctx, cx, gy - 20, 2, 20, PX)
}

function drawTextOverlay(
  ctx: CanvasRenderingContext2D, cssW: number, cssH: number,
  plots: number[], PX: number
) {
  ctx.imageSmoothingEnabled = true

  plots.forEach((cx, i) => {
    const px = cx * PX
    const exps = store.experiences.filter(inv => inv.direction === jobTypes[i])
    if (exps.length > 0) {
      const bodyH = 10 + exps.length * 14 + 6
      const roofH = 14
      const hy = (100 - bodyH - roofH) * PX

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px "Noto Serif SC","SimSun",serif'
      ctx.textAlign = 'center'
      ctx.strokeStyle = '#3a2a1a'
      ctx.lineWidth = 3
      ctx.strokeText(jobNames[jobTypes[i]], px, hy - 8)
      ctx.fillText(jobNames[jobTypes[i]], px, hy - 8)

      ctx.fillStyle = '#e8e0d5'
      ctx.font = '9px "Noto Serif SC","SimSun",serif'
      ctx.strokeText(exps.length + '层', px, hy + (bodyH + roofH) * PX + 14)
      ctx.fillText(exps.length + '层', px, hy + (bodyH + roofH) * PX + 14)
    } else {
      ctx.fillStyle = '#b8a888'
      ctx.font = '10px "Noto Serif SC","SimSun",serif'
      ctx.textAlign = 'center'
      ctx.fillText('待建造', px, (100 - 12) * PX)
    }
  })

  ctx.fillStyle = '#e0d8c8'
  ctx.font = '10px "Noto Serif SC","SimSun",serif'
  ctx.textAlign = 'right'
  ctx.fillText('点击房屋进入查看 →', cssW - 16, cssH - 16)
  ctx.textAlign = 'left'
}

function lighten(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.min(255, r + Math.round((255 - r) * amt))
  const lg = Math.min(255, g + Math.round((255 - g) * amt))
  const lb = Math.min(255, b + Math.round((255 - b) * amt))
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
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
          const bodyH = 10 + exps.length * 14 + 6
          const roofH = 14
          const hy = (100 - bodyH - roofH) * PX
          const relY = my - hy - roofH * PX - 10
          const floorH = 14 * PX
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
  background: var(--bg);
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
  color: var(--bark);
  text-shadow: 1px 1px 0 rgba(255, 243, 224, 0.6);
}
.btns {
  display: flex;
  gap: 8px;
}
canvas {
  display: block;
  border-radius: var(--radius);
  border: var(--border-pixel);
  box-shadow: var(--shadow);
  max-width: 100%;
  image-rendering: pixelated;
}
.hint-text {
  text-align: center;
  color: var(--bark-light);
  font-size: 0.78rem;
  margin-top: 4px;
}
.btn {
  background: var(--bark);
  color: var(--panel);
  border: 2px solid var(--border-color);
  padding: 13px 44px;
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 700;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.04em;
  text-shadow: 1px 1px 0 rgba(62, 39, 35, 0.3);
}
.btn.ghost {
  background: transparent;
  border: 2px solid var(--border-light);
  color: var(--bark);
  padding: 10px 30px;
  font-size: 0.82rem;
}
.btn.ghost:hover {
  background: var(--card-hover);
}
.btn.small {
  padding: 7px 16px;
  font-size: 0.75rem;
}
</style>
