<template>
  <div class="qa-page">
    <div class="qa-sidebar">
      <div class="sidebar-header">
        <div class="exp-title">{{ store.experienceTitle || '新经历' }}</div>
        <div class="exp-dir" v-if="store.experienceDirection">{{ dirName }}</div>
      </div>
      <div class="global-progress">
        <div class="gp-bar">
          <div class="gp-fill" :style="{ width: globalPercent + '%' }"></div>
        </div>
        <div class="gp-text">{{ store.getTotalProgress.answered }} / {{ store.getTotalProgress.total }} 物品完成</div>
      </div>
      <div class="room-nav">
        <div v-for="room in rooms" :key="room.id" class="room-group">
          <div class="room-label">
            <span>{{ room.emoji }} {{ room.shortName }}</span>
            <span class="room-count">{{ roomProgress(room.id).answered }}/{{ roomProgress(room.id).total }}</span>
          </div>
          <div class="item-list">
            <button
              v-for="item in room.items"
              :key="item.id"
              class="item-btn"
              :class="{
                active: currentItemId === item.id,
                done: store.isItemComplete(item.id),
              }"
              @click="currentItemId = item.id"
            >
              <span class="ib-check">{{ store.isItemComplete(item.id) ? '✓' : '' }}</span>
              <span class="ib-name">{{ item.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="qa-main">
      <template v-if="currentItem">
        <div class="qa-header">
          <div class="qa-item-name">{{ currentItem.name }}</div>
          <div class="qa-item-why">{{ currentItem.why }}</div>
        </div>
        <div class="qa-progress">
          <div class="qa-pbar">
            <div class="qa-pfill" :style="{ width: itemPercent + '%' }"></div>
          </div>
          <div class="qa-ptext">{{ itemAnsweredCount }}/3</div>
        </div>
        <div class="qa-questions">
          <div v-for="(q, qi) in currentItem.questions" :key="qi" class="q-block" :class="{ active: qi === currentItemFirstUnanswered }">
            <div class="q-label">
              <span class="q-num">{{ qi + 1 }}</span>
              {{ q.text }}
            </div>
            <div class="q-opts">
              <button
                v-for="opt in q.opts"
                :key="opt.val"
                class="q-opt"
                :class="{ sel: currentAnswers[q.prop] === opt.val }"
                @click="select(q.prop, opt.val)"
              >{{ opt.text }}</button>
            </div>
          </div>
        </div>
        <div class="qa-footer">
          <div class="desc-preview" v-if="itemDescriptor">{{ itemDescriptor }}</div>
          <div class="qa-actions">
            <button v-if="prevItem" class="btn ghost" @click="currentItemId = prevItem.id">← 上一件</button>
            <div v-else></div>
            <button
              v-if="nextItem"
              class="btn"
              :class="{ disabled: !isCurrentItemComplete }"
              @click="goNext"
            >下一件 →</button>
            <button
              v-else-if="isCurrentItemComplete && store.getTotalProgress.answered === store.getTotalProgress.total"
              class="btn finish"
              @click="finish"
            >✓ 完成所有物品，进入小屋</button>
            <button v-else class="btn disabled">请完成所有物品</button>
          </div>
        </div>
      </template>
      <div v-else class="qa-empty">
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { describeItem, type ItemAnswers, ROOM_DEFS } from '../types/cabin'
import { itemDefs, ITEM_BY_ID, ITEMS_BY_ROOM } from '../data/itemDefs'

const router = useRouter()
const store = useExperienceStore()

const currentItemId = ref(itemDefs[0]?.id || '')

const dirNameMap: Record<string, string> = {
  product: '产品', ops: '运营', marketing: '市场',
  tech: '技术', data: '数据', other: '其他',
}
const dirName = computed(() => dirNameMap[store.experienceDirection] || store.experienceDirection)

const rooms = computed(() => {
  return ROOM_DEFS.map(rd => ({
    ...rd,
    items: ITEMS_BY_ROOM[rd.id] || [],
  }))
})

function roomProgress(roomId: string) {
  return store.getRoomProgress(roomId)
}

const globalPercent = computed(() => {
  const p = store.getTotalProgress
  return p.total > 0 ? (p.answered / p.total) * 100 : 0
})

const currentItem = computed(() => ITEM_BY_ID[currentItemId.value] || null)

const currentAnswers = computed<ItemAnswers>(() => {
  if (!currentItemId.value) return {} as ItemAnswers
  return store.getItemAnswers(currentItemId.value)
})

const itemAnsweredCount = computed(() => {
  if (!currentItem.value) return 0
  return currentItem.value.questions.filter(q => !!currentAnswers.value[q.prop]).length
})

const itemPercent = computed(() => (itemAnsweredCount.value / 3) * 100)

const isCurrentItemComplete = computed(() => {
  if (!currentItem.value) return false
  return currentItem.value.questions.every(q => !!currentAnswers.value[q.prop])
})

const currentItemFirstUnanswered = computed(() => {
  if (!currentItem.value) return 0
  return currentItem.value.questions.findIndex(q => !currentAnswers.value[q.prop])
})

const itemDescriptor = computed(() => {
  if (!currentItem.value || itemAnsweredCount.value === 0) return ''
  return describeItem(currentItem.value, currentAnswers.value).desc
})

const prevItem = computed(() => {
  const idx = itemDefs.findIndex(d => d.id === currentItemId.value)
  return idx > 0 ? itemDefs[idx - 1] : null
})

const nextItem = computed(() => {
  const idx = itemDefs.findIndex(d => d.id === currentItemId.value)
  return idx < itemDefs.length - 1 ? itemDefs[idx + 1] : null
})

function select(prop: string, val: string) {
  store.answerItemQuestion(currentItemId.value, prop, val)
}

function goNext() {
  if (isCurrentItemComplete.value && nextItem.value) {
    currentItemId.value = nextItem.value.id
  }
}

async function finish() {
  const exp = await store.finalizeExperience()
  router.push(`/house/${exp.id}`)
}

onMounted(() => {
  // If no experience in progress, redirect to street
  if (!store.experienceTitle) {
    router.replace('/street')
    return
  }
  // Jump to first incomplete item
  const firstIncomplete = itemDefs.find(d => !store.isItemComplete(d.id))
  if (firstIncomplete) {
    currentItemId.value = firstIncomplete.id
  }
})
</script>

<style scoped>
.qa-page {
  display: flex;
  height: calc(100vh - 52px);
  overflow: hidden;
}

/* ── Sidebar ── */
.qa-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fafaf8;
  border-right: 1px solid #e8e0d5;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sidebar-header {
  padding: 20px 16px 12px;
  border-bottom: 1px solid #e8e0d5;
}
.exp-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2c2416;
}
.exp-dir {
  font-size: 0.75rem;
  color: #8b7a65;
  margin-top: 2px;
}
.global-progress {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e0d5;
}
.gp-bar {
  height: 4px;
  background: #e8e0d5;
  border-radius: 2px;
  overflow: hidden;
}
.gp-fill {
  height: 100%;
  background: #2c2416;
  border-radius: 2px;
  transition: width 0.3s;
}
.gp-text {
  font-size: 0.72rem;
  color: #8b7a65;
  margin-top: 4px;
  text-align: center;
}
.room-nav {
  flex: 1;
  padding: 8px 0;
}
.room-group {
  margin-bottom: 4px;
}
.room-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #5a4a35;
}
.room-count {
  font-size: 0.68rem;
  color: #a09080;
  font-weight: 400;
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.item-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px 7px 24px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.8rem;
  color: #5a4a35;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.item-btn:hover {
  background: #f0e8d8;
}
.item-btn.active {
  background: #f0e8d8;
  color: #2c2416;
  font-weight: 600;
}
.item-btn.done {
  color: #8b7a65;
}
.ib-check {
  width: 16px;
  font-size: 0.72rem;
  color: #3a7d44;
  flex-shrink: 0;
}

/* ── Main ── */
.qa-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #fff;
}
.qa-header {
  padding: 28px 32px 12px;
}
.qa-item-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c2416;
}
.qa-item-why {
  font-size: 0.85rem;
  color: #8b7a65;
  margin-top: 4px;
}
.qa-progress {
  padding: 0 32px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.qa-pbar {
  flex: 1;
  height: 3px;
  background: #e8e0d5;
  border-radius: 2px;
}
.qa-pfill {
  height: 100%;
  background: #2c2416;
  border-radius: 2px;
  transition: width 0.3s;
}
.qa-ptext {
  font-size: 0.75rem;
  color: #a09080;
  white-space: nowrap;
}
.qa-questions {
  flex: 1;
  padding: 0 32px;
}
.q-block {
  margin-bottom: 28px;
}
.q-block.active .q-label {
  color: #2c2416;
}
.q-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5a4a35;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.q-num {
  background: #2c2416;
  color: #fafaf8;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.q-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.q-opt {
  background: #fff;
  border: 1.5px solid #d4c8b8;
  border-radius: 14px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 0.85rem;
  color: #2c2416;
  white-space: nowrap;
}
.q-opt:hover {
  border-color: #8b7a65;
  background: #fdfaf6;
}
.q-opt.sel {
  border-color: #2c2416;
  background: #f0e8d8;
  font-weight: 600;
}
.qa-footer {
  padding: 16px 32px 24px;
  border-top: 1px solid #e8e0d5;
}
.desc-preview {
  font-size: 0.82rem;
  color: #8b7a65;
  font-style: italic;
  line-height: 1.5;
  margin-bottom: 14px;
}
.qa-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.btn {
  background: #2c2416;
  color: #fafaf8;
  border: none;
  padding: 12px 32px;
  font-size: 0.9rem;
  font-family: inherit;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.04em;
}
.btn:hover:not(.disabled) {
  background: #4a3d2a;
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(44, 36, 22, 0.12);
}
.btn.ghost {
  background: transparent;
  border: 1.5px solid #8b7a65;
  color: #5a4a35;
}
.btn.ghost:hover {
  background: #f5ede0;
}
.btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn.finish {
  background: #3a7d44;
}
.btn.finish:hover {
  background: #2d6335;
}
.qa-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #a09080;
}

@media (max-width: 768px) {
  .qa-page {
    flex-direction: column;
    height: auto;
  }
  .qa-sidebar {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e8e0d5;
  }
  .q-opts {
    flex-direction: column;
  }
  .q-opt {
    text-align: left;
  }
}
</style>
