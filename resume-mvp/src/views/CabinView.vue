<template>
  <div class="cabin-view">
    <!-- Step 1: Direction selection -->
    <div v-if="step === 'direction'" class="screen center">
      <h1>建造你的经历小屋</h1>
      <p>回答 90 个基于真实经历的问题<br>每个回答决定一件物品的形态<br>最终小屋里立起一座属于你的经历街区</p>
      <div class="direction-grid">
        <button
          v-for="d in directions" :key="d.value"
          class="dir-btn" :class="{ sel: selectedDir === d.value }"
          @click="selectedDir = d.value"
        >{{ d.icon }} {{ d.label }}</button>
      </div>
      <input v-model="title" class="title-input" placeholder="给这段经历起个名字（如：2024暑期产品实习）" />
      <button class="btn" :disabled="!selectedDir || !title.trim()" @click="startCabin">开始建造 →</button>
    </div>

    <!-- Step 2: Cabin exploration -->
    <div v-else-if="step === 'cabin'" class="cabin-layout">
      <div class="sidebar">
        <div class="sidebar-title">🏠 {{ title }}</div>
        <div class="room-list">
          <div
            v-for="r in ROOM_DEFS" :key="r.id"
            class="room-item" :class="{ active: activeRoom === r.id }"
            @click="activeRoom = r.id"
          >
            <span class="room-emoji">{{ r.emoji }}</span>
            <span class="room-name">{{ r.shortName }}</span>
            <span class="room-progress">{{ getRoomProgress(r.id) }}/6</span>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="total-progress">已完成 {{ totalProgress }}/30 件物品</div>
          <div class="progress-bar-outer"><div class="progress-bar-inner" :style="{ width: (totalProgress / 30 * 100) + '%' }"></div></div>
          <button v-if="totalProgress === 30" class="btn small" @click="step = 'review'">完成建造 →</button>
        </div>
      </div>
      <div class="main-area">
        <CabinCanvas @item-click="onItemClick" />
        <div class="hint-text">点击物品开始答题 · 拖拽物品可重新摆放</div>
      </div>
      <ItemQuizPanel :item-id="activeItemId" @close="activeItemId = null" @done="onItemDone" />
    </div>

    <!-- Step 3: Review -->
    <div v-else-if="step === 'review'" class="screen center review-screen">
      <h1>🎉 你的经历小屋已建成</h1>
      <p>共完成 {{ totalProgress }} 件物品的记录</p>
      <div class="review-summary">
        <div v-for="r in ROOM_DEFS" :key="r.id" class="review-room">
          <div class="review-room-header">{{ r.emoji }} {{ r.shortName }}</div>
          <div class="review-items">
            <div v-for="item in getRoomItems(r.id)" :key="item.id" class="review-item">
              <span class="review-item-desc">{{ getItemDesc(item) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="review-actions">
        <button class="btn ghost" @click="step = 'cabin'">← 修改答案</button>
        <button class="btn" @click="submit">提交经历 ✓</button>
      </div>
    </div>

    <!-- Transition overlay -->
    <div class="transition-overlay" :class="{ active: showTransition }">
      <div class="dot-pulse"><span></span><span></span><span></span></div>
      <div class="transition-text">正在建造……</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { ROOM_DEFS, describeItem, type RoomId, type CabinItemDef } from '../types/cabin'
import { itemDefs, ITEMS_BY_ROOM } from '../data/itemDefs'
import CabinCanvas from '../components/cabin/CabinCanvas.vue'
import ItemQuizPanel from '../components/cabin/ItemQuizPanel.vue'

const router = useRouter()
const store = useExperienceStore()

const step = ref<'direction' | 'cabin' | 'review'>('direction')
const selectedDir = ref('')
const title = ref('')
const activeRoom = ref<RoomId>('living')
const activeItemId = ref<string | null>(null)
const showTransition = ref(false)

const directions = [
  { value: 'product', label: '产品经理', icon: '📋' },
  { value: 'ops', label: '运营', icon: '📊' },
  { value: 'marketing', label: '市场营销', icon: '📣' },
  { value: 'tech', label: '技术开发', icon: '💻' },
  { value: 'data', label: '数据分析', icon: '📈' },
  { value: 'other', label: '其他岗位', icon: '🔧' },
]

function startCabin() {
  if (!selectedDir.value || !title.value.trim()) return
  store.startNew(title.value.trim(), selectedDir.value)
  step.value = 'cabin'
}

function getRoomProgress(roomId: string): number {
  return store.getRoomProgress(roomId).answered
}

const totalProgress = computed(() => store.getTotalProgress.answered)

function onItemClick(itemId: string) {
  activeItemId.value = itemId
  const item = itemDefs.find(d => d.id === itemId)
  if (item) activeRoom.value = item.room as RoomId
}

function onItemDone() {
  activeItemId.value = null
}

function getRoomItems(roomId: string): CabinItemDef[] {
  return ITEMS_BY_ROOM[roomId] || []
}

function getItemDesc(item: CabinItemDef): string {
  const answers = store.getItemAnswers(item.id)
  if (!item.questions.some(q => !!answers[q.prop])) return item.name + '（未回答）'
  return describeItem(item, answers).desc
}

async function submit() {
  showTransition.value = true
  await store.finalizeExperience()
  setTimeout(() => {
    showTransition.value = false
    router.push('/warehouse')
  }, 1400)
}
</script>

<style scoped>
.cabin-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.screen {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.screen.center {
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 24px;
}
.screen.center h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c2416;
}
.screen.center p {
  color: #7b6b5a;
  font-size: 0.95rem;
  line-height: 1.7;
  max-width: 440px;
}

.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 440px;
  width: 100%;
}
.dir-btn {
  background: #fff;
  border: 1.5px solid #d4c8b8;
  border-radius: 14px;
  padding: 14px 10px;
  font-family: inherit;
  font-size: 0.88rem;
  color: #2c2416;
  cursor: pointer;
  transition: all 0.2s;
}
.dir-btn:hover { border-color: #8b7a65; background: #fdfaf6; }
.dir-btn.sel { border-color: #2c2416; background: #f0e8d8; font-weight: 600; }

.title-input {
  width: 100%;
  max-width: 440px;
  padding: 12px 18px;
  border: 1.5px solid #d4c8b8;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  color: #2c2416;
  background: #fff;
  outline: none;
  text-align: center;
}
.title-input:focus { border-color: #8b7a65; }
.title-input::placeholder { color: #b0a090; }

.cabin-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 100vh;
}

.sidebar {
  width: 200px;
  min-width: 200px;
  background: #f5ede0;
  border-right: 1px solid #e8e0d5;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.sidebar-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 16px;
  word-break: break-all;
}
.room-list { flex: 1; }
.room-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}
.room-item:hover { background: #ece3d4; }
.room-item.active { background: #e0d5c2; font-weight: 600; }
.room-emoji { font-size: 1.1rem; }
.room-name { flex: 1; font-size: 0.85rem; color: #2c2416; }
.room-progress {
  font-size: 0.75rem;
  color: #8b7a65;
  background: #fafaf8;
  padding: 2px 8px;
  border-radius: 10px;
}

.sidebar-footer {
  margin-top: 16px;
  border-top: 1px solid #d4c8b8;
  padding-top: 12px;
}
.total-progress { font-size: 0.8rem; color: #5a4a35; margin-bottom: 8px; }
.progress-bar-outer {
  width: 100%; height: 4px; background: #d4c8b8; border-radius: 2px; margin-bottom: 12px;
}
.progress-bar-inner {
  height: 100%; background: #2c2416; border-radius: 2px; transition: width 0.3s;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 8px;
}

.hint-text {
  text-align: center;
  color: #8b7a65;
  font-size: 0.78rem;
  margin-top: 4px;
}

.review-screen {
  overflow-y: auto;
  padding: 40px 24px;
}
.review-summary {
  max-width: 600px;
  width: 100%;
  text-align: left;
}
.review-room { margin-bottom: 20px; }
.review-room-header {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 8px;
}
.review-item {
  font-size: 0.82rem;
  color: #5a4a35;
  padding: 4px 0;
  line-height: 1.5;
}
.review-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
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
.btn:hover { background: #4a3d2a; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(44, 36, 22, 0.12); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn.ghost { background: transparent; border: 1.5px solid #8b7a65; color: #5a4a35; padding: 10px 30px; font-size: 0.82rem; }
.btn.ghost:hover { background: #f5ede0; }
.btn.small { padding: 7px 16px; font-size: 0.75rem; }

.transition-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: #fafaf8;
  z-index: 50;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.transition-overlay.active { display: flex; }
.transition-text { font-size: 1rem; color: #5a4a35; animation: fadeUp 0.6s ease; }
.dot-pulse { display: flex; gap: 7px; }
.dot-pulse span {
  width: 7px; height: 7px; background: #2c2416; border-radius: 50%;
  animation: dotBounce 1.2s infinite;
}
.dot-pulse span:nth-child(2) { animation-delay: 0.2s; }
.dot-pulse span:nth-child(3) { animation-delay: 0.4s; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

@media (max-width: 768px) {
  .direction-grid { grid-template-columns: repeat(2, 1fr); }
  .cabin-layout { flex-direction: column; height: auto; min-height: 100vh; }
  .sidebar { width: 100%; min-width: 100%; flex-direction: row; flex-wrap: wrap; padding: 8px; border-right: none; border-bottom: 1px solid #e8e0d5; }
  .sidebar-title { width: 100%; margin-bottom: 8px; }
  .room-list { display: flex; gap: 4px; flex: none; width: 100%; }
  .sidebar-footer { display: none; }
  .main-area { min-height: 60vh; }
}
</style>
