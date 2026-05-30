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
  const w = 880, h = 380
  canvasRef.value.width = w * dpr
  canvasRef.value.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  hitboxes = []

  // Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55)
  skyGrad.addColorStop(0, '#f5f2ed')
  skyGrad.addColorStop(1, '#fafaf8')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h)
  // Ground
  ctx.fillStyle = '#f0ebe0'
  ctx.fillRect(0, h * 0.55, w, h * 0.45)
  ctx.fillStyle = '#e8e0d5'
  ctx.fillRect(0, h * 0.78, w, h * 0.12)
  // Road
  ctx.beginPath()
  ctx.moveTo(0, h * 0.78)
  ctx.lineTo(w, h * 0.78)
  ctx.strokeStyle = '#d4c8b8'
  ctx.lineWidth = 0.5
  ctx.stroke()
  ctx.setLineDash([10, 14])
  ctx.lineWidth = 0.6
  ctx.strokeStyle = '#c8b898'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.84)
  ctx.lineTo(w, h * 0.84)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = '#2c2416'
  ctx.lineWidth = 2

  // Trees
  for (let i = 0; i < 8; i++) {
    const tx = 30 + i * 120
    ctx.beginPath()
    ctx.moveTo(tx, h * 0.76)
    ctx.lineTo(tx, h * 0.78)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(tx, h * 0.72, 10, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(tx - 5, h * 0.68, 7, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(tx + 5, h * 0.67, 7, 0, Math.PI * 2)
    ctx.stroke()
  }

  const plots = [{ x: 95 }, { x: 225 }, { x: 355 }, { x: 485 }, { x: 615 }, { x: 745 }]
  const houseW = 90, baseY = h * 0.72, floorH = 32

  plots.forEach((plot, i) => {
    const jt = jobTypes[i]
    const exps = store.experiences.filter(inv => inv.direction === jt)
    const cnt = exps.length
    if (cnt > 0) {
      const hh = 24 + cnt * floorH + 20, hx = plot.x - houseW / 2, hy = baseY - hh
      ctx.fillStyle = '#fdfcf9'
      ctx.fillRect(hx, hy, houseW, hh - 20)
      ctx.strokeStyle = '#2c2416'
      ctx.lineWidth = 2
      ctx.strokeRect(hx, hy, houseW, hh - 20)
      // Roof
      ctx.fillStyle = '#f5ede0'
      ctx.beginPath()
      ctx.moveTo(hx - 8, hy)
      ctx.lineTo(plot.x, hy - 22)
      ctx.lineTo(hx + houseW + 8, hy)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#2c2416'
      ctx.beginPath()
      ctx.moveTo(hx - 8, hy)
      ctx.lineTo(plot.x, hy - 22)
      ctx.lineTo(hx + houseW + 8, hy)
      ctx.stroke()
      // Floors
      ctx.lineWidth = 0.6
      ctx.strokeStyle = '#c8b898'
      for (let f = 1; f < cnt; f++) {
        const fy = hy + 24 + f * floorH
        ctx.beginPath()
        ctx.moveTo(hx, fy)
        ctx.lineTo(hx + houseW, fy)
        ctx.stroke()
      }
      ctx.strokeStyle = '#2c2416'
      ctx.lineWidth = 2
      // Windows with floor labels
      for (let f = 0; f < cnt; f++) {
        const wy = hy + 28 + f * floorH
        ctx.strokeRect(hx + 12, wy, 16, 16)
        ctx.strokeRect(hx + houseW - 28, wy, 16, 16)
        // Floor number
        ctx.fillStyle = '#8b7a65'
        ctx.font = '9px "Noto Serif SC","SimSun",serif'
        ctx.fillText(`${f + 1}F`, hx + 36, wy + 12)
        // Experience title (truncated)
        const expTitle = exps[f].title
        const maxW = houseW - 60
        let display = expTitle
        while (ctx.measureText(display).width > maxW && display.length > 2) {
          display = display.slice(0, -1)
        }
        if (display !== expTitle) display += '…'
        ctx.fillStyle = '#5a4a35'
        ctx.font = '9px "PingFang SC","Microsoft YaHei",sans-serif'
        ctx.fillText(display, hx + 52, wy + 12)
      }
      // Door
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(plot.x - 10, hy + hh - 44, 20, 24)
      ctx.strokeStyle = '#2c2416'
      ctx.lineWidth = 2
      ctx.strokeRect(plot.x - 10, hy + hh - 44, 20, 24)
      ctx.beginPath()
      ctx.arc(plot.x + 6, hy + hh - 32, 2, 0, Math.PI * 2)
      ctx.fill()
      // Label
      ctx.fillStyle = '#2c2416'
      ctx.font = 'bold 11px "Noto Serif SC","SimSun",serif'
      const label = jobNames[jt]
      ctx.fillText(label, plot.x - ctx.measureText(label).width / 2, hy - 26)
      ctx.fillStyle = '#8b7a65'
      ctx.font = '9px "Noto Serif SC","SimSun",serif'
      ctx.fillText(cnt + '层', plot.x - 6, hy + hh - 10)
      hitboxes.push({ x: hx, y: hy, w: houseW, h: hh, idx: i, type: 'house' })
    } else {
      ctx.strokeStyle = '#d4c8b8'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.strokeRect(plot.x - houseW / 2, baseY - 50, houseW, 50)
      ctx.setLineDash([])
      ctx.strokeStyle = '#2c2416'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(plot.x, baseY - 30)
      ctx.lineTo(plot.x, baseY)
      ctx.stroke()
      ctx.strokeRect(plot.x - 18, baseY - 48, 36, 16)
      ctx.fillStyle = '#8b7a65'
      ctx.font = '9px "Noto Serif SC","SimSun",serif'
      ctx.fillText('待建造', plot.x - 16, baseY - 36)
      hitboxes.push({ x: plot.x - houseW / 2, y: baseY - 50, w: houseW, h: 50, idx: i, type: 'empty' })
    }
    // Plot line
    ctx.strokeStyle = '#e8e0d5'
    ctx.lineWidth = 0.3
    ctx.beginPath()
    ctx.moveTo(plot.x - 65, baseY - 80)
    ctx.lineTo(plot.x - 65, baseY + 5)
    ctx.stroke()
    ctx.strokeStyle = '#2c2416'
    ctx.lineWidth = 2
  })

  ctx.fillStyle = '#a09080'
  ctx.font = '10px "Noto Serif SC","SimSun",serif'
  ctx.fillText('点击房屋进入查看 →', w - 160, h - 20)
}

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
        // Clicked empty building → new experience
        showNewDialog.value = true
      } else {
        // Clicked existing building → find experience to enter
        const jt = jobTypes[hb.idx]
        const exps = store.experiences.filter(inv => inv.direction === jt)
        if (exps.length > 0) {
          // Determine which floor was clicked
          const baseY = 380 * 0.72
          const floorH = 32
          const cnt = exps.length
          const hh = 24 + cnt * floorH + 20
          const hy = baseY - hh
          const relY = my - hy - 24
          const floorIdx = Math.min(Math.max(Math.floor(relY / floorH), 0), cnt - 1)
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
      found = true
      break
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
  color: #2c2416;
}
.btns {
  display: flex;
  gap: 8px;
}
canvas {
  display: block;
  border-radius: 16px;
  max-width: 100%;
}
.hint-text {
  text-align: center;
  color: #8b7a65;
  font-size: 0.78rem;
  margin-top: 4px;
}
.btn {
  background: #2c2416;
  color: #fafaf8;
  border: none;
  padding: 13px 44px;
  font-size: 0.95rem;
  font-family: inherit;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.04em;
}
.btn.ghost {
  background: transparent;
  border: 1.5px solid #8b7a65;
  color: #5a4a35;
  padding: 10px 30px;
  font-size: 0.82rem;
}
.btn.ghost:hover {
  background: #f5ede0;
}
.btn.small {
  padding: 7px 16px;
  font-size: 0.75rem;
}
</style>
