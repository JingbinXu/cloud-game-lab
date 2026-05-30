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

/* ── Sidebar ── 木质面板 */
.qa-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--panel);
  border-right: 3px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: inset -2px 0 0 rgba(255,255,255,0.2);
}
.sidebar-header {
  padding: 16px 14px 10px;
  border-bottom: 2px solid var(--border-light);
  background: var(--panel-dark);
}
.exp-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--bark);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}
.exp-dir {
  font-size: 0.72rem;
  color: var(--bark-light);
  margin-top: 2px;
}
.global-progress {
  padding: 10px 14px;
  border-bottom: 2px solid var(--border-light);
}
.gp-bar {
  height: 8px;
  background: var(--wood-light);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  overflow: hidden;
}
.gp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--leaf), var(--leaf-light));
  transition: width 0.3s;
}
.gp-text {
  font-size: 0.68rem;
  color: var(--bark-light);
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
}
.room-nav {
  flex: 1;
  padding: 6px 0;
}
.room-group {
  margin-bottom: 2px;
}
.room-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--bark);
  background: rgba(0,0,0,0.03);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.room-count {
  font-size: 0.65rem;
  color: var(--bark-light);
  font-weight: 400;
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.item-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 22px;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--bark-light);
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
}
.item-btn:hover {
  background: rgba(0,0,0,0.05);
}
.item-btn.active {
  background: var(--golden);
  color: var(--bark);
  font-weight: 700;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
}
.item-btn.done {
  color: var(--bark-light);
  opacity: 0.7;
}
.ib-check {
  width: 14px;
  font-size: 0.68rem;
  color: var(--leaf);
  flex-shrink: 0;
  font-weight: 700;
}

/* ── Main ── 羊皮纸面板 */
.qa-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--card-bg);
}
.qa-header {
  padding: 24px 28px 10px;
}
.qa-item-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--bark);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}
.qa-item-why {
  font-size: 0.82rem;
  color: var(--bark-light);
  margin-top: 3px;
}
.qa-progress {
  padding: 0 28px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.qa-pbar {
  flex: 1;
  height: 8px;
  background: var(--wood-light);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  overflow: hidden;
}
.qa-pfill {
  height: 100%;
  background: linear-gradient(90deg, var(--leaf), var(--leaf-light));
  transition: width 0.3s;
}
.qa-ptext {
  font-size: 0.72rem;
  color: var(--bark-light);
  white-space: nowrap;
  font-weight: 600;
}
.qa-questions {
  flex: 1;
  padding: 0 28px;
}
.q-block {
  margin-bottom: 24px;
}
.q-block.active .q-label {
  color: var(--bark);
}
.q-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--bark);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.q-num {
  background: var(--border-color);
  color: var(--golden-light);
  width: 20px;
  height: 20px;
  border-radius: var(--radius-xs);
  font-size: 0.68rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--bark);
  box-shadow: 1px 1px 0 rgba(0,0,0,0.15);
}
.q-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.q-opt {
  background: var(--panel);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xs);
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--bark);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}
.q-opt:hover {
  border-color: var(--border-color);
  background: var(--card-hover);
  transform: translateY(-1px);
}
.q-opt.sel {
  border-color: var(--border-color);
  background: var(--golden);
  font-weight: 700;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
  box-shadow: var(--shadow);
}
.qa-footer {
  padding: 14px 28px 20px;
  border-top: 2px solid var(--border-light);
}
.desc-preview {
  font-size: 0.78rem;
  color: var(--bark-light);
  font-style: italic;
  line-height: 1.5;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: rgba(0,0,0,0.03);
  border-radius: var(--radius-xs);
  border-left: 3px solid var(--golden);
}
.qa-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.btn {
  background: var(--golden);
  color: var(--bark);
  border: 2px solid var(--border-color);
  padding: 10px 28px;
  font-size: 0.82rem;
  font-family: var(--font-body);
  font-weight: 700;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
}
.btn:hover:not(.disabled) {
  background: var(--golden-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}
.btn:active:not(.disabled) {
  transform: translateY(1px);
  box-shadow: none;
}
.btn.ghost {
  background: var(--panel);
  color: var(--bark-light);
}
.btn.ghost:hover {
  background: var(--card-hover);
}
.btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn.finish {
  background: var(--leaf);
  color: #fff;
}
.btn.finish:hover {
  background: var(--leaf-light);
}
.qa-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--bark-light);
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
    border-bottom: 3px solid var(--border-color);
  }
  .q-opts {
    flex-direction: column;
  }
  .q-opt {
    text-align: left;
  }
}
</style>
