<template>
  <div class="floor-plan-wrap">
    <svg
      class="floor-plan"
      viewBox="0 0 570 320"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
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
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
        shape-rendering="crispEdges"
      />
      <!-- 内墙隔断 -->
      <path
        :d="innerPath"
        fill="none"
        stroke="#000000"
        stroke-width="1.5"
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
*/

// 每个房间的等轴测四边形（SVG 坐标，逆时针）
const rooms = [
  {
    id: 'kitchen',
    points: '310,25 375,57 310,89 181,89',
  },
  {
    id: 'bedroom',
    points: '375,57 504,122 439,154 310,89',
  },
  {
    id: 'balcony',
    points: '504,122 568,154 439,219 375,186',
  },
  {
    id: 'living',
    points: '181,89 310,89 310,154 267,262 52,154',
  },
  {
    id: 'study',
    points: '246,122 310,154 267,262 160,316 9,240',
  },
]

// 外墙：逆时针沿建筑外围（加中间节点消除斜线）
const outerPath = [
  'M 310 25',         // (0,0)   厨房左上
  'L 52 154',         // (0,6)   客厅左下
  'L 9 240',          // (1.5,8.5) 书房左下
  'L 160 316',        // (5,8.5) 书房右下
  'L 267 262',        // (5,6)   客厅右下
  'L 310 154',        // (5,3)   客厅右上/卧室阳台交界
  'L 439 219',        // (6,3)   阳台右下
  'L 568 154',        // (6,0)   阳台右上
  'L 310 25',         // 回到起点
  'Z',
].join(' ')

// 内墙：相邻房间之间的隔断
const innerPath = [
  // 厨房 ↔ 卧室
  'M 375 57 L 310 89',
  // 卧室 ↔ 阳台
  'M 504 122 L 439 154',
  // 厨房底部
  'M 181 89 L 310 154',
  // 卧室底部
  'M 246 122 L 375 186',
  // 阳台底部
  'M 331 165 L 439 219',
  // 客厅右侧
  'M 375 186 L 310 262',
].join(' ')
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
