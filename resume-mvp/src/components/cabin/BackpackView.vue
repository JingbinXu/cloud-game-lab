<template>
  <div class="backpack-wrap">
    <div class="top-bar">
      <h2>物品收藏栏</h2>
      <div class="btns">
        <button class="btn ghost small" @click="$emit('back')">← 回到小屋</button>
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
        <p>完成一次答题后，物品会出现在这里</p>
      </div>
    </div>
    <div class="hint-text">同一物品类型在不同实习中会生成不同变体</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useExperienceStore } from '../../stores/experience'
import { describeItem, type CabinItemDef, type ItemAnswers } from '../../types/cabin'
import { ITEMS_BY_ROOM } from '../../data/itemDefs'

const store = useExperienceStore()

const roomOrder: [string, string][] = [
  ['living', '🛋️ 客厅'],
  ['study', '📚 书房'],
  ['kitchen', '🍳 厨房'],
  ['bedroom', '🛏️ 卧室'],
  ['balcony', '🌿 阳台'],
]

const totalItems = computed(() => store.getTotalProgress.answered)

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

defineEmits<{ (e: 'back'): void }>()
</script>

<style scoped>
.backpack-wrap { padding: 24px; display: flex; flex-direction: column; gap: 8px; max-width: 900px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.top-bar h2 { font-size: 1.15rem; font-weight: 700; color: #2c2416; }
.btns { display: flex; gap: 8px; }
.backpack-content { flex: 1; overflow-y: auto; }
.room-section { margin-bottom: 28px; }
.room-title { font-size: 0.95rem; font-weight: 700; color: #2c2416; margin-bottom: 12px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.item-card {
  background: #fff;
  border: 1px solid #d4c8b8;
  border-radius: 12px;
  padding: 14px;
}
.card-name { font-size: 0.85rem; font-weight: 600; color: #2c2416; margin-bottom: 6px; }
.card-desc { font-size: 0.78rem; color: #5a4a35; line-height: 1.5; margin-bottom: 4px; }
.card-record { font-size: 0.72rem; color: #8b7a65; line-height: 1.5; }
.empty-state { text-align: center; color: #a09080; padding: 60px 20px; }
.empty-state p { margin: 6px 0; }
.hint-text { text-align: center; color: #8b7a65; font-size: 0.78rem; margin-top: 4px; }
.btn { background: #2c2416; color: #fafaf8; border: none; padding: 13px 44px; font-size: 0.95rem; font-family: inherit; border-radius: 40px; cursor: pointer; transition: all 0.25s; letter-spacing: 0.04em; }
.btn.ghost { background: transparent; border: 1.5px solid #8b7a65; color: #5a4a35; padding: 10px 30px; font-size: 0.82rem; }
.btn.ghost:hover { background: #f5ede0; }
.btn.small { padding: 7px 16px; font-size: 0.75rem; }
</style>