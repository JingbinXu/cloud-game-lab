<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Experience } from '../types/experience'
import { getExperiences } from '../utils/storage'
import { experienceToDimensionBullets } from '../utils/answerMap'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const container = ref<HTMLDivElement>()
const tooltipEl = ref<HTMLDivElement>()
const floorCardEl = ref<HTMLDivElement>()
const floorCardTitle = ref('')
const floorCardExp = ref('')
const floorCardRooms = ref<string[]>([])
const experienceCount = ref(0)
const buildingCount = ref(0)

let renderer: THREE.WebGLRenderer | null = null
let animationId: number | null = null
let controls: OrbitControls | null = null
let cleanupFns: (() => void)[] = []

onMounted(async () => {
  const allExps = await getExperiences()
  if (allExps.length === 0) {
    router.push('/cabinet')
    return
  }
  experienceCount.value = allExps.length
  setTimeout(() => initWarehouse(allExps), 300)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
  if (controls) controls.dispose()
  cleanupFns.forEach(fn => fn())
})

// Direction label map
const DIR_LABELS: Record<string, string> = {
  product: '产品经理',
  ops: '运营',
  marketing: '市场营销',
  dev: '技术开发',
  data: '数据分析',
  other: '其他岗位',
}

// Dimension config per room type
const DIM_CONFIG: Record<string, { label: string; color: string; hex: number; wall: string }> = {
  dailyWork:     { label: '日常工作', color: '#E8B4B8', hex: 0xE8B4B8, wall: '#C98A8E' },
  collaboration: { label: '协作模式', color: '#A8D8D9', hex: 0xA8D8D9, wall: '#78A8A9' },
  results:       { label: '项目经历', color: '#F5E0C3', hex: 0xF5E0C3, wall: '#C5B093' },
  softSkills:    { label: '能力成长', color: '#C4B5D8', hex: 0xC4B5D8, wall: '#9485A8' },
  tools:         { label: '内心感受', color: '#B5C8A8', hex: 0xB5C8A8, wall: '#859878' },
}

function initWarehouse(allExps: Experience[]) {
  if (!container.value) { console.warn('container is null'); return }
  const el = container.value
  const width = el.clientWidth
  const height = el.clientHeight
  console.log('initWarehouse', { expCount: allExps.length, width, height })

  // Group experiences by direction
  const dirGroups: Record<string, Experience[]> = {}
  allExps.forEach(exp => {
    const dir = exp.direction || 'other'
    if (!dirGroups[dir]) dirGroups[dir] = []
    dirGroups[dir].push(exp)
  })

  const dirKeys = Object.keys(dirGroups)
  buildingCount.value = dirKeys.length

  // ==================== SCENE ====================
  const scene = new THREE.Scene()

  // Sky blue gradient background
  const bgC = document.createElement('canvas')
  bgC.width = 256
  bgC.height = 256
  const bgX = bgC.getContext('2d')!
  const grad = bgX.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#87CEEB')
  grad.addColorStop(0.6, '#B0E0F0')
  grad.addColorStop(1, '#E8F4F8')
  bgX.fillStyle = grad
  bgX.fillRect(0, 0, 256, 256)
  // Subtle clouds
  bgX.fillStyle = 'rgba(255,255,255,0.3)'
  bgX.beginPath(); bgX.ellipse(60, 50, 40, 12, 0, 0, Math.PI * 2); bgX.fill()
  bgX.beginPath(); bgX.ellipse(180, 80, 30, 10, 0, 0, Math.PI * 2); bgX.fill()
  bgX.beginPath(); bgX.ellipse(130, 35, 25, 8, 0, 0, Math.PI * 2); bgX.fill()
  scene.background = new THREE.CanvasTexture(bgC)
  scene.fog = new THREE.Fog('#B0E0F0', 50, 100)

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 120)
  const centerX = 0
  camera.position.set(centerX, 8, 16)
  camera.lookAt(centerX, 3, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(centerX, 3, 0)
  controls.minDistance = 6
  controls.maxDistance = 40
  controls.minPolarAngle = 0.15
  controls.maxPolarAngle = 1.3
  controls.update()

  // ==================== CONSTANTS ====================
  const PW = 7, PD = 5.5, FLOOR_H = 2.8

  // ==================== LIGHTING ====================
  scene.add(new THREE.AmbientLight('#fff5e6', 1.8))
  const sun = new THREE.DirectionalLight('#ffe4b5', 1.5)
  sun.position.set(8, 20, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  scene.add(sun)
  const fillLight = new THREE.DirectionalLight('#e0f0ff', 0.4)
  fillLight.position.set(-6, 10, -4)
  scene.add(fillLight)

  // ==================== GROUND ====================
  const gnd = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: '#7EC850', roughness: 0.9 })
  )
  gnd.rotation.x = -Math.PI / 2
  gnd.position.y = -0.5
  gnd.receiveShadow = true
  scene.add(gnd)

  // Path (brown strip across buildings)
  const path = box(60, 0.02, 1.2, '#D4B896', 0.9)
  path.position.set(0, -0.48, PD / 2 + 1.5)
  scene.add(path)

  // ==================== HELPERS ====================
  function box(w: number, h: number, d: number, color: string | number, roughness = 0.7) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 })
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.castShadow = true
    m.receiveShadow = true
    return m
  }

  function cyl(rT: number, rB: number, h: number, color: string | number, roughness = 0.5, segs = 12) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 })
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, segs), mat)
    m.castShadow = true
    m.receiveShadow = true
    return m
  }

  // ==================== DATA STRUCTURES ====================

  interface RoomObj {
    floorGroup: THREE.Group
    buildingIdx: number
    floorIdx: number
    dimKey: string
    bullets: string[]
    carpet: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>
    glow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    walls: THREE.Mesh[]
    pointLight: THREE.PointLight
    cx: number
    cz: number
    w: number
    d: number
  }

  interface FloorObj {
    group: THREE.Group
    buildingIdx: number
    floorIdx: number
    expTitle: string
    fy: number
    rooms: RoomObj[]
    slabGlow: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
  }

  interface BuildingObj {
    group: THREE.Group
    dirKey: string
    dirLabel: string
    bx: number
    floors: FloorObj[]
    shellGroup: THREE.Group
  }

  const allBuildings: BuildingObj[] = []
  const allFloors: FloorObj[] = []
  const allRooms: RoomObj[] = []

  // ==================== BUILD BUILDINGS ====================
  const buildingSpacing = 12

  dirKeys.forEach((dirKey, bi) => {
    const bx = (bi - (dirKeys.length - 1) / 2) * buildingSpacing
    const bz = 0
    const exps = dirGroups[dirKey]
    const nFloors = exps.length
    const dirLabel = DIR_LABELS[dirKey] || dirKey

    const buildingGroup = new THREE.Group()
    const shellGroup = new THREE.Group()

    const interiorTop = (nFloors - 1) * FLOOR_H + 0.4
    const interiorBottom = -0.3
    const interiorH = interiorTop - interiorBottom
    const shellCY = (interiorTop + interiorBottom) / 2

    // Building shell (cross-section style — only back wall, no side walls)
    // Back wall (cream/beige)
    const backWall = box(PW + 0.4, interiorH + 0.1, 0.15, '#F5E6D3', 0.8)
    backWall.position.set(0, shellCY, -PD / 2 - 0.1)
    shellGroup.add(backWall)

    // Windows on back wall
    const winMat = new THREE.MeshStandardMaterial({ color: '#AED8F0', roughness: 0.3, metalness: 0.1 })
    const winFrameMat = new THREE.MeshStandardMaterial({ color: '#8B7355', roughness: 0.7 })
    const winW = 0.7, winH = 0.8
    const winZ = -PD / 2 + 0.02
    exps.forEach((exp, fi) => {
      const fy = fi * FLOOR_H + FLOOR_H * 0.4
      // Two windows per floor
      for (let wx = -1; wx <= 1; wx += 2) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.06), winFrameMat)
        frame.position.set(wx * 2, fy, winZ)
        shellGroup.add(frame)
        const glass = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.08), winMat)
        glass.position.set(wx * 2, fy, winZ)
        shellGroup.add(glass)
      }
    })

    // Foundation
    const found = box(PW + 0.6, 0.2, PD + 0.6, '#8B7355', 0.8)
    found.position.set(0, interiorBottom - 0.15, 0)
    shellGroup.add(found)

    // Roof (red tile style)
    const roofMat = new THREE.MeshStandardMaterial({ color: '#C05746', roughness: 0.7 })
    const roofOH = 0.4, roofPeak = 0.8
    const roofShape = new THREE.Shape()
    roofShape.moveTo(-PW / 2 - roofOH, 0)
    roofShape.lineTo(0, roofPeak)
    roofShape.lineTo(PW / 2 + roofOH, 0)
    roofShape.closePath()
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { steps: 1, depth: PD + roofOH * 2, bevelEnabled: false })
    const roof = new THREE.Mesh(roofGeo, roofMat)
    roof.position.set(0, interiorTop + 0.05, -PD / 2 - roofOH)
    shellGroup.add(roof)

    // Building label — floating text plane above roof
    const labelC = document.createElement('canvas')
    labelC.width = 256
    labelC.height = 48
    const lctx = labelC.getContext('2d')!
    lctx.fillStyle = 'rgba(0,0,0,0)'
    lctx.fillRect(0, 0, 256, 48)
    lctx.font = 'bold 22px "PingFang SC","Microsoft YaHei",sans-serif'
    lctx.fillStyle = '#6B4226'
    lctx.textAlign = 'center'
    lctx.fillText(dirLabel, 128, 32)
    const labelTex = new THREE.CanvasTexture(labelC)
    const labelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 0.6),
      new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false })
    )
    labelPlane.position.set(0, interiorTop + roofPeak + 1, 0)
    shellGroup.add(labelPlane)

    shellGroup.position.set(bx, 0, bz)
    buildingGroup.add(shellGroup)

    const buildingFloors: FloorObj[] = []

    // Build floors
    exps.forEach((exp, fi) => {
      const fy = fi * FLOOR_H
      const fg = new THREE.Group()
      fg.position.set(bx, fy, bz)

      const dimBullets = experienceToDimensionBullets(exp)
      const dimKeysWithContent = Object.keys(dimBullets).filter(k => dimBullets[k].length > 0)

      // Floor slab (warm wood color)
      const slab = box(PW, 0.08, PD, '#DEB887', 0.7)
      slab.position.y = -0.04
      const slabGlow = slab as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
      fg.add(slab)

      const floorRooms: RoomObj[] = []

      // Layout rooms in grid
      const nRooms = dimKeysWithContent.length
      if (nRooms === 0) return

      const cols = Math.min(nRooms, 3)
      const rows = Math.ceil(nRooms / cols)
      const marginX = 0.4, marginZ = 0.35
      const cellW = (PW - marginX * 2) / cols
      const cellD = (PD - marginZ * 2) / rows

      dimKeysWithContent.forEach((dimKey, ri) => {
        const dc = DIM_CONFIG[dimKey] || DIM_CONFIG.dailyWork
        const col = ri % cols
        const row = Math.floor(ri / cols)
        const w = cellW - 0.12
        const d = cellD - 0.12
        const cx = -PW / 2 + marginX + cellW * (col + 0.5)
        const cz = -PD / 2 + marginZ + cellD * (row + 0.5)

        // Carpet — visible by default (light version of room color)
        const dimColor = new THREE.Color(dc.hex).lerp(new THREE.Color('#ffffff'), 0.55)
        const carpetMat = new THREE.MeshStandardMaterial({
          color: dimColor, roughness: 0.6,
          emissive: '#000000', emissiveIntensity: 0,
        })
        const carpet = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, d - 0.08), carpetMat)
        carpet.rotation.x = -Math.PI / 2
        carpet.position.set(cx, 0.01, cz)
        carpet.receiveShadow = true
        fg.add(carpet)

        // Glow plane (subtle by default)
        const glowMat = new THREE.MeshBasicMaterial({
          color: dc.hex, transparent: true, opacity: 0.08,
          side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
        })
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, d - 0.08), glowMat)
        glow.rotation.x = -Math.PI / 2
        glow.position.set(cx, 0.015, cz)
        glow.renderOrder = 998
        fg.add(glow)

        // Room walls — light cream by default
        const wallMat = new THREE.MeshStandardMaterial({ color: '#E8D5C0', roughness: 0.7, transparent: true, opacity: 0.7 })
        const iwThick = 0.04, iwH = 0.4
        const walls: THREE.Mesh[] = []
        const wallDefs: [number, number, number, number, number, number][] = [
          [w, iwH, iwThick, cx, iwH / 2, cz - d / 2],
          [w, iwH, iwThick, cx, iwH / 2, cz + d / 2],
          [iwThick, iwH, d, cx - w / 2, iwH / 2, cz],
          [iwThick, iwH, d, cx + w / 2, iwH / 2, cz],
        ]
        wallDefs.forEach(([ww, hh, dd, px, py, pz]) => {
          const wm = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, dd), wallMat.clone())
          wm.position.set(px, py, pz)
          fg.add(wm)
          walls.push(wm)
        })

        // Room point light — soft glow by default
        const roomLight = new THREE.PointLight(dc.color, 0.3, 3, 2)
        roomLight.position.set(cx, 0.5, cz)
        fg.add(roomLight)

        const roomObj: RoomObj = {
          floorGroup: fg, buildingIdx: bi, floorIdx: fi,
          dimKey, bullets: dimBullets[dimKey],
          carpet: carpet as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>,
          glow: glow as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
          walls,
          pointLight: roomLight,
          cx, cz, w, d,
        }
        floorRooms.push(roomObj)
        allRooms.push(roomObj)
      })

      const floorObj: FloorObj = {
        group: fg, buildingIdx: bi, floorIdx: fi,
        expTitle: exp.title, fy, rooms: floorRooms,
        slabGlow,
      }
      buildingFloors.push(floorObj)
      allFloors.push(floorObj)

      // Floor label on back wall
      const flC = document.createElement('canvas')
      flC.width = 256
      flC.height = 32
      const flctx = flC.getContext('2d')!
      flctx.clearRect(0, 0, 256, 32)
      flctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif'
      flctx.fillStyle = '#5D4037'
      flctx.textAlign = 'right'
      flctx.fillText(exp.title, 248, 20)
      const flTex = new THREE.CanvasTexture(flC)
      const flPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 0.35),
        new THREE.MeshBasicMaterial({ map: flTex, transparent: true, depthWrite: false })
      )
      flPlane.position.set(PW / 2 - 0.2, fy + FLOOR_H * 0.15, -PD / 2 + 0.08)
      fg.add(flPlane)

      buildingGroup.add(fg)
    })

    scene.add(buildingGroup)

    allBuildings.push({
      group: buildingGroup, dirKey, dirLabel, bx,
      floors: buildingFloors, shellGroup,
    })
  })

  // ==================== EXTERNAL DECORATIONS ====================
  // Trees
  function addTree(x: number, z: number, height = 1.5) {
    const trunk = cyl(0.08, 0.1, height, '#8B6914', 0.8)
    trunk.position.set(x, height / 2 - 0.5, z)
    scene.add(trunk)
    // Canopy (sphere)
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#4A8C3F', roughness: 0.8 })
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(height * 0.5, 8, 6), canopyMat)
    canopy.position.set(x, height - 0.2, z)
    canopy.castShadow = true
    scene.add(canopy)
    // Second smaller sphere
    const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(height * 0.35, 8, 6), canopyMat)
    canopy2.position.set(x + 0.2, height + 0.3, z)
    canopy2.castShadow = true
    scene.add(canopy2)
  }

  // Place trees around buildings
  const totalWidth = dirKeys.length * buildingSpacing
  const startX = -(totalWidth / 2) - 3
  for (let i = 0; i < 5; i++) {
    addTree(startX + i * 3.5 + Math.random() * 1.5, -PD - 1.5 - Math.random() * 2, 1.2 + Math.random() * 0.8)
  }
  for (let i = 0; i < 3; i++) {
    addTree(-totalWidth / 2 - 2 - i * 2, PD / 2 + 2 + Math.random(), 1 + Math.random() * 0.6)
  }
  addTree(totalWidth / 2 + 2, PD / 2 + 1.5, 1.3)
  addTree(totalWidth / 2 + 3.5, PD / 2 + 2.5, 1.1)

  // Grass patches
  const grassMat = new THREE.MeshStandardMaterial({ color: '#5DAE3B', roughness: 0.9 })
  for (let i = 0; i < 8; i++) {
    const gp = new THREE.Mesh(new THREE.CircleGeometry(0.3 + Math.random() * 0.3, 6), grassMat)
    gp.rotation.x = -Math.PI / 2
    gp.position.set(
      (Math.random() - 0.5) * totalWidth * 1.5,
      -0.47,
      PD / 2 + 3 + Math.random() * 3
    )
    scene.add(gp)
  }

  // Cat (simple box shapes)
  const catGroup = new THREE.Group()
  const catBodyMat = new THREE.MeshStandardMaterial({ color: '#F4A460', roughness: 0.8 })
  // Body
  const catBody = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.2), catBodyMat)
  catBody.position.set(0, 0.12, 0)
  catGroup.add(catBody)
  // Head
  const catHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.18), catBodyMat)
  catHead.position.set(0.25, 0.18, 0)
  catGroup.add(catHead)
  // Ears
  const earMat = new THREE.MeshStandardMaterial({ color: '#D28A3C', roughness: 0.8 })
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.04), earMat)
  earL.position.set(0.22, 0.32, -0.06)
  catGroup.add(earL)
  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.04), earMat)
  earR.position.set(0.22, 0.32, 0.06)
  catGroup.add(earR)
  // Tail
  const tail = cyl(0.025, 0.02, 0.35, '#F4A460', 0.8, 6)
  tail.position.set(-0.28, 0.22, 0)
  tail.rotation.z = 0.6
  catGroup.add(tail)
  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#2E2E2E', roughness: 0.3 })
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), eyeMat)
  eyeL.position.set(0.36, 0.2, -0.05)
  catGroup.add(eyeL)
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), eyeMat)
  eyeR.position.set(0.36, 0.2, 0.05)
  catGroup.add(eyeR)

  catGroup.position.set(totalWidth / 2 + 1, -0.5, PD / 2 + 2)
  catGroup.rotation.y = -0.5
  scene.add(catGroup)

  console.log('Scene ready:', { buildings: allBuildings.length, rooms: allRooms.length, children: scene.children.length })

  // ==================== INTERACTION ====================
  let focusedBuilding: BuildingObj | null = null
  let hoveredRoom: RoomObj | null = null
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  function dimRoom(room: RoomObj) {
    const dc = DIM_CONFIG[room.dimKey] || DIM_CONFIG.dailyWork
    // Return to light default color (not dark)
    const dimColor = new THREE.Color(dc.hex).lerp(new THREE.Color('#ffffff'), 0.55)
    room.carpet.material.color.copy(dimColor)
    room.carpet.material.emissiveIntensity = 0
    room.glow.material.opacity = 0.08
    room.pointLight.intensity = 0.3
    // Dim walls to light cream
    room.walls.forEach(wm => {
      const mat = wm.material as THREE.MeshStandardMaterial
      mat.color.set('#E8D5C0')
      mat.opacity = 0.7
    })
  }

  function illuminateRoom(room: RoomObj, intensity = 1) {
    const dc = DIM_CONFIG[room.dimKey] || DIM_CONFIG.dailyWork
    room.carpet.material.color.set(dc.hex)
    room.carpet.material.emissive.set(dc.hex)
    room.carpet.material.emissiveIntensity = 0.3 * intensity
    room.glow.material.opacity = 0.25 * intensity
    room.pointLight.intensity = 1.5 * intensity
    // Illuminate walls with room color
    room.walls.forEach(wm => {
      const mat = wm.material as THREE.MeshStandardMaterial
      mat.color.set(dc.wall)
      mat.opacity = 0.8 * intensity
    })
  }

  function resetAll() {
    allRooms.forEach(r => dimRoom(r))
    allFloors.forEach(f => {
      f.slabGlow.material.color.set('#DEB887')
      f.slabGlow.material.emissiveIntensity = 0
    })
    focusedBuilding = null
    hoveredRoom = null
    floorCardEl.value?.classList.remove('show')
    tooltipEl.value?.classList.remove('show')
  }

  function focusBuilding(bObj: BuildingObj) {
    resetAll()
    focusedBuilding = bObj
    // Slightly highlight this building's floors
    bObj.floors.forEach(f => {
      f.slabGlow.material.color.set('#E8C99B')
    })
  }

  function onRoomHover(room: RoomObj | null, e: MouseEvent) {
    if (hoveredRoom === room) return
    // Unhover previous
    if (hoveredRoom) {
      dimRoom(hoveredRoom)
    }
    hoveredRoom = room
    if (room) {
      illuminateRoom(room, 1)

      // Tooltip
      if (tooltipEl.value) {
        const dc = DIM_CONFIG[room.dimKey] || DIM_CONFIG.dailyWork
        const floor = allFloors.find(f => f.buildingIdx === room.buildingIdx && f.floorIdx === room.floorIdx)
        const bulletPreview = room.bullets.slice(0, 2).join('、')
        tooltipEl.value.innerHTML = `
          <div class="tt-name" style="color:${dc.color}">${dc.label}</div>
          <div class="tt-floor">${floor?.expTitle || ''}</div>
          <div class="tt-bullets">${bulletPreview}</div>
        `
        tooltipEl.value.classList.add('show')
        const rect = el.getBoundingClientRect()
        tooltipEl.value.style.left = (e.clientX - rect.left + 16) + 'px'
        tooltipEl.value.style.top = (e.clientY - rect.top - 70) + 'px'
      }
    } else {
      tooltipEl.value?.classList.remove('show')
    }
  }

  function onClick(e: MouseEvent) {
    const rect = el.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const carpets = allRooms.map(r => r.carpet)
    const hits = raycaster.intersectObjects(carpets)

    if (hits.length > 0) {
      const room = allRooms.find(r => r.carpet === hits[0].object)
      if (room) {
        const bObj = allBuildings[room.buildingIdx]
        if (bObj !== focusedBuilding) {
          focusBuilding(bObj)
        }
        // Show floor card
        const floor = allFloors.find(f => f.buildingIdx === room.buildingIdx && f.floorIdx === room.floorIdx)
        if (floor) {
          floorCardTitle.value = `${bObj.dirLabel} · 第${room.floorIdx + 1}层`
          floorCardExp.value = floor.expTitle
          floorCardRooms.value = floor.rooms.map(r => {
            const dc = DIM_CONFIG[r.dimKey]
            return `${dc.label}：${r.bullets.slice(0, 2).join('、')}`
          })
          floorCardEl.value?.classList.add('show')
        }
        return
      }
    }
    // Click empty — reset
    resetAll()
  }

  function onMouseMove(e: MouseEvent) {
    const rect = el.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const carpets = allRooms.map(r => r.carpet)
    const hits = raycaster.intersectObjects(carpets)

    if (hits.length > 0) {
      const room = allRooms.find(r => r.carpet === hits[0].object)
      if (room) {
        el.style.cursor = 'pointer'
        onRoomHover(room, e)
        return
      }
    }
    el.style.cursor = 'grab'
    onRoomHover(null, e)
  }

  el.addEventListener('click', onClick)
  el.addEventListener('mousemove', onMouseMove)
  cleanupFns.push(() => el.removeEventListener('click', onClick))
  cleanupFns.push(() => el.removeEventListener('mousemove', onMouseMove))

  // ==================== ANIMATION ====================
  function animate() {
    animationId = requestAnimationFrame(animate)
    if (controls) controls.update()
    if (renderer) renderer.render(scene, camera)
  }
  animate()
}
</script>

<template>
  <div class="brainmap-screen">
    <div class="flow-header">
      <button class="btn-back" @click="router.push('/cabinet')">←</button>
      <span class="flow-title">经历仓库 · {{ experienceCount }} 段经历 / {{ buildingCount }} 栋楼</span>
    </div>

    <div class="brainmap-container" ref="container">
      <div class="brainmap-tip">拖拽旋转 | 滚轮缩放 | 点击房间查看详情</div>
      <div class="brainmap-legend">
        <div><span class="dot-color" style="background:#E8B4B8;"></span> 日常工作</div>
        <div><span class="dot-color" style="background:#A8D8D9;"></span> 协作模式</div>
        <div><span class="dot-color" style="background:#F5E0C3;"></span> 项目经历</div>
        <div><span class="dot-color" style="background:#C4B5D8;"></span> 能力成长</div>
        <div><span class="dot-color" style="background:#B5C8A8;"></span> 内心感受</div>
      </div>
      <div class="tooltip" ref="tooltipEl"></div>
      <div class="floor-card" ref="floorCardEl">
        <h4>已聚焦楼层</h4>
        <div class="fc-name">{{ floorCardTitle }}</div>
        <div class="fc-exp">{{ floorCardExp }}</div>
        <ul class="fc-rooms">
          <li v-for="(room, i) in floorCardRooms" :key="i">{{ room }}</li>
        </ul>
      </div>
    </div>

    <div class="brainmap-actions">
      <button class="btn-primary" style="margin: 0;" @click="router.push('/questionnaire')">
        再记录一段经历
      </button>
      <button class="btn-secondary" @click="router.push('/cabinet')">
        管理经历
      </button>
      <button class="btn-secondary" @click="router.push('/resume')">
        生成简历
      </button>
    </div>
  </div>
</template>

<style scoped>
.flow-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 48px;
  border-bottom: 1px solid var(--border);
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background: var(--wood-light);
  border-color: var(--wood);
}

.flow-title {
  font-size: 18px;
  font-weight: 700;
}

.brainmap-container {
  width: calc(100% - 96px);
  height: 600px;
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  background: #87CEEB;
  margin: 24px 48px 0;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.brainmap-container canvas {
  display: block;
}

.brainmap-tip {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #5D4037;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 14px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px);
}

.brainmap-legend {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.88);
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 2;
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #5D4037;
  backdrop-filter: blur(6px);
}

.dot-color {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  margin-right: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Tooltip */
.tooltip {
  position: absolute;
  z-index: 20;
  pointer-events: none;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px;
  color: #5D4037;
  opacity: 0;
  transition: opacity 0.15s;
  max-width: 280px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tooltip.show {
  opacity: 1;
}

.tooltip :deep(.tt-name) {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.tooltip :deep(.tt-floor) {
  color: #8D6E63;
  font-size: 11px;
  margin-bottom: 6px;
}

.tooltip :deep(.tt-bullets) {
  color: #6D4C41;
  font-size: 11px;
  line-height: 1.6;
}

/* Floor card */
.floor-card {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.floor-card.show {
  opacity: 1;
}

.floor-card h4 {
  font-size: 10px;
  color: #8D6E63;
  letter-spacing: 1px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.fc-name {
  font-size: 15px;
  font-weight: 700;
  color: #6B4226;
  margin-bottom: 2px;
}

.fc-exp {
  font-size: 12px;
  color: #8D6E63;
  margin-bottom: 10px;
}

.fc-rooms {
  font-size: 11px;
  color: #5D4037;
  line-height: 1.8;
  list-style: none;
  padding: 0;
  margin: 0;
}

.fc-rooms li {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.fc-rooms li::before {
  content: '└ ';
  color: #C05746;
}

.brainmap-actions {
  text-align: center;
  padding: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--wood), var(--wood-deep));
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 16px rgba(139, 105, 20, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(139, 105, 20, 0.35);
}

.btn-secondary {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border: 2px solid var(--wood);
  background: transparent;
  color: var(--wood-deep);
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover {
  background: var(--wood-light);
}

@media (max-width: 768px) {
  .flow-header {
    padding: 16px 20px;
  }

  .brainmap-container {
    width: calc(100% - 40px);
    height: 420px;
    margin: 16px 20px 0;
  }

  .brainmap-tip, .brainmap-legend {
    font-size: 10px;
    padding: 4px 10px;
  }
}
</style>
