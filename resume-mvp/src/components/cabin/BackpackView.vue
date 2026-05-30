<template>
  <div class="backpack-page">
    <WorldviewScreen
      v-if="showWorldview"
      icon="🎒"
      badge="世界观 C"
      title="背包 = 简历原料库"
      subtitle="你收集的每一件物品，都是一段真实经历的碎片。它们就是你简历的原材料——从这里出发，生成一份量身定制的简历吧。"
      color="#3A7D44"
      @continue="dismissWorldview"
    />

    <div class="top-bar">
      <h2>记忆背包</h2>
      <div class="btns">
        <button class="btn ghost small" @click="$router.push('/street')">🏠 街区</button>
        <button class="btn small" @click="$router.push('/resume')">📄 生成简历</button>
      </div>
    </div>

    <div class="backpack-content">
      <div v-for="([rk, rname]) in roomOrder" :key="rk" class="room-section">
        <div class="room-title">{{ rname }} · {{ getRoomItems(rk).length }}件物品</div>
        <div class="card-grid">
          <div v-for="item in getRoomItems(rk)" :key="item.id" class="item-card">
            <div class="card-name">{{ item.name }}</div>
            <div class="card-desc">{{ getItemDesc(item) }}</div>
            <div class="card-record">{{ getItemRecord(item) }}</div>
          </div>
        </div>
      </div>
      <div v-if="totalItems === 0" class="empty-state">
        <p>还没有完成任何经历记录</p>
        <p>去<a href="#" @click.prevent="$router.push('/street')">记忆街区</a>开始记录吧</p>
      </div>
    </div>
    <div class="hint-text">同一物品类型在不同实习中会生成不同变体</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExperienceStore } from '../../stores/experience'
import { describeItem, type CabinItemDef, type ItemAnswers } from '../../types/cabin'
import { ITEMS_BY_ROOM } from '../../data/itemDefs'
import WorldviewScreen from './WorldviewScreen.vue'

const store = useExperienceStore()
const showWorldview = ref(false)

const roomOrder: [string, string][] = [
  ['living', '🛋️ 客厅'],
  ['study', '📚 书房'],
  ['kitchen', '🍳 厨房'],
  ['bedroom', '🛏️ 卧室'],
  ['balcony', '🌿 阳台'],
]

const totalItems = computed(() => store.getTotalProgress.answered)

function dismissWorldview() {
  showWorldview.value = false
  store.markWorldviewShown('backpack')
}

onMounted(async () => {
  await store.loadExperiences()
  if (!store.shownWorldviews['backpack']) {
    showWorldview.value = true
  }
})

function getRoomItems(roomId: string): CabinItemDef[] {
  return ITEMS_BY_ROOM[roomId] || []
}

function getItemDesc(item: CabinItemDef): string {
  const answers = store.getItemAnswers(item.id) as ItemAnswers
  if (!item.questions.some(q => !!answers[q.prop])) return '（未回答）'
  return describeItem(item, answers).desc
}

function getItemRecord(item: CabinItemDef): string {
  const answers = store.getItemAnswers(item.id) as ItemAnswers
  if (!item.questions.some(q => !!answers[q.prop])) return ''
  return describeItem(item, answers).work
}
</script>

<style scoped>
.backpack-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 900px;
  margin: 0 auto;
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
.backpack-content {
  flex: 1;
  overflow-y: auto;
}
.room-section {
  margin-bottom: 28px;
}
.room-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 12px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.item-card {
  background: #fff;
  border: 1px solid #d4c8b8;
  border-radius: 12px;
  padding: 14px;
}
.card-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c2416;
  margin-bottom: 6px;
}
.card-desc {
  font-size: 0.78rem;
  color: #5a4a35;
  line-height: 1.5;
  margin-bottom: 4px;
}
.card-record {
  font-size: 0.72rem;
  color: #8b7a65;
  line-height: 1.5;
}
.empty-state {
  text-align: center;
  color: #a09080;
  padding: 60px 20px;
}
.empty-state p {
  margin: 6px 0;
}
.empty-state a {
  color: #4a6fa5;
  text-decoration: underline;
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
