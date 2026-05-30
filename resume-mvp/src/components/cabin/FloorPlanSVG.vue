<template>
  <div class="floor-plan-wrap">
    <svg
      class="floor-plan"
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- 像素云 (top-left) -->
      <g v-for="(cloud, ci) in clouds" :key="ci">
        <rect
          v-for="(r, ri) in cloud.body"
          :key="'b'+ri"
          :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]"
          fill="#ffffff"
          shape-rendering="crispEdges"
        />
        <!-- 棋盘格阴影 -->
        <rect
          v-for="(r, ri) in cloud.shadow"
          :key="'s'+ri"
          :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]"
          fill="#555555"
          shape-rendering="crispEdges"
        />
      </g>

      <!-- 房间白色填充 -->
      <polygon
        v-for="room in rooms"
        :key="room.id"
        :points="room.points"
        fill="#ffffff"
        shape-rendering="crispEdges"
      />
      <!-- 外墙轮廓 -->
      <path
        :d="outerPath"
        fill="none"
        stroke="#000000"
        stroke-width="4"
        stroke-linejoin="round"
        stroke-linecap="round"
        shape-rendering="crispEdges"
      />
      <!-- 外墙像素描边加粗 -->
      <path
        :d="outerPath"
        fill="none"
        stroke="#000000"
        stroke-width="6"
        stroke-linejoin="round"
        stroke-linecap="round"
        shape-rendering="crispEdges"
        opacity="0.3"
      />
      <!-- 内墙隔断 -->
      <path
        :d="innerPath"
        fill="none"
        stroke="#000000"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
        shape-rendering="crispEdges"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
/*
  45° 等轴测俯瞰视角房间布局 — 纯 SVG 白线黑底
  2:1 isometric: screenX = (tx-ty)*43, screenY = (tx+ty)*21.5
  SVG offset: +310 x, +25 y
  viewBox expanded to 640x400 for clouds; floor plan centered with offset (+35, +40)
*/

// 坐标偏移：将 floor plan 居中到 640x400 画布
const ox = 35, oy = 40

// 每个房间的等轴测四边形（SVG 坐标，逆时针）
const rooms = [
  {
    id: 'kitchen',
    points: `${310+ox},${25+oy} ${375+ox},${57+oy} ${310+ox},${89+oy} ${181+ox},${89+oy}`,
  },
  {
    id: 'bedroom',
    points: `${375+ox},${57+oy} ${504+ox},${122+oy} ${439+ox},${154+oy} ${310+ox},${89+oy}`,
  },
  {
    id: 'balcony',
    points: `${504+ox},${122+oy} ${568+ox},${154+oy} ${439+ox},${219+oy} ${375+ox},${186+oy}`,
  },
  {
    id: 'living',
    points: `${181+ox},${89+oy} ${310+ox},${89+oy} ${310+ox},${154+oy} ${267+ox},${262+oy} ${52+ox},${154+oy}`,
  },
  {
    id: 'study',
    points: `${246+ox},${122+oy} ${310+ox},${154+oy} ${267+ox},${262+oy} ${160+ox},${316+oy} ${9+ox},${240+oy}`,
  },
]

// 外墙：逆时针沿建筑外围
const outerPath = [
  `M ${310+ox} ${25+oy}`,
  `L ${52+ox} ${154+oy}`,
  `L ${9+ox} ${240+oy}`,
  `L ${160+ox} ${316+oy}`,
  `L ${267+ox} ${262+oy}`,
  `L ${310+ox} ${154+oy}`,
  `L ${439+ox} ${219+oy}`,
  `L ${568+ox} ${154+oy}`,
  `L ${310+ox} ${25+oy}`,
  'Z',
].join(' ')

// 内墙：相邻房间之间的隔断
const innerPath = [
  `M ${375+ox} ${57+oy} L ${310+ox} ${89+oy}`,
  `M ${504+ox} ${122+oy} L ${439+ox} ${154+oy}`,
  `M ${181+ox} ${89+oy} L ${310+ox} ${154+oy}`,
  `M ${246+ox} ${122+oy} L ${375+ox} ${186+oy}`,
  `M ${331+ox} ${165+oy} L ${439+ox} ${219+oy}`,
  `M ${375+ox} ${186+oy} L ${310+ox} ${262+oy}`,
].join(' ')

/* ── 像素云 (椭圆像素点 + 棋盘格阴影) ── */
interface PixelRect { 0: number; 1: number; 2: number; 3: number }
interface CloudData { body: PixelRect[]; shadow: PixelRect[] }

function makePixelCloud(cx: number, cy: number, hw: number, hh: number, px: number): CloudData {
  const body: PixelRect[] = []
  const shadow: PixelRect[] = []
  for (let dy = -hh; dy <= hh; dy++) {
    for (let dx = -hw; dx <= hw; dx++) {
      const norm = (dx / hw) ** 2 + (dy / hh) ** 2
      if (norm <= 1.0) {
        body.push([cx + dx * px, cy + dy * px, px, px])
      }
      // 棋盘格阴影 (bottom-right)
      if (norm <= 0.85 && (cx + dx * px + cy + dy * px) % (px * 2) === 0 && dy >= 1) {
        shadow.push([cx + (dx + 0.3) * px, cy + (dy - 0.3) * px, px, px])
      }
    }
  }
  return { body, shadow }
}

const clouds: CloudData[] = [
  makePixelCloud(50, 18, 7, 3, 4),     // top-left, small
  makePixelCloud(180, 12, 10, 3, 4),   // top-center-left, medium
  makePixelCloud(480, 16, 8, 3, 4),    // top-right, small
  makePixelCloud(590, 22, 6, 2, 4),    // top-far-right, tiny
  makePixelCloud(340, 375, 9, 3, 4),   // bottom-center, medium
  makePixelCloud(520, 380, 7, 2, 4),   // bottom-right, small
]
</script>

<style scoped>
.floor-plan-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.floor-plan {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
</style>
