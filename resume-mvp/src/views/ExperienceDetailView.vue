<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { CabinExperience } from '../types/cabin'
import { ROOM_DEFS, describeItem } from '../types/cabin'
import { itemDefs, ITEMS_BY_ROOM } from '../data/itemDefs'
import { getExperienceById, deleteExperience } from '../utils/storage'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const experience = ref<CabinExperience | null>(null)

onMounted(async () => {
  const exp = await getExperienceById(props.id)
  if (exp) {
    experience.value = exp
  } else {
    router.push('/cabinet')
  }
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

function getRoomItems(roomId: string) {
  return ITEMS_BY_ROOM[roomId] || []
}

function getItemDesc(itemId: string) {
  const def = itemDefs.find(d => d.id === itemId)
  if (!def || !experience.value) return ''
  const answers = experience.value.itemAnswers[itemId]
  if (!answers) return '（未回答）'
  const answered = def.questions.some(q => !!answers[q.prop])
  if (!answered) return '（未回答）'
  return describeItem(def, answers).desc
}

function getRoomCompletion(roomId: string) {
  const items = getRoomItems(roomId)
  if (!experience.value) return '0/6'
  const answered = items.filter(item => {
    const answers = experience.value!.itemAnswers[item.id]
    if (!answers) return false
    return item.questions.some(q => !!answers[q.prop])
  }).length
  return `${answered}/${items.length}`
}

async function handleDelete() {
  if (confirm('确定要删除这段经历吗？')) {
    await deleteExperience(props.id)
    router.push('/cabinet')
  }
}
</script>

<template>
  <div class="detail-screen" v-if="experience">
    <div class="flow-header">
      <button class="btn-back" @click="router.push('/cabinet')">←</button>
      <span class="flow-title">经历详情</span>
    </div>

    <div class="flow-body">
      <div class="detail-title-section">
        <h2>{{ experience.title }}</h2>
        <p class="detail-date">创建于 {{ formatDate(experience.createdAt) }}</p>
      </div>

      <div class="rooms-section" v-for="room in ROOM_DEFS" :key="room.id">
        <div class="room-header">
          <span>{{ room.emoji }} {{ room.shortName }}</span>
          <span class="room-completion">{{ getRoomCompletion(room.id) }}</span>
        </div>
        <div class="items-grid">
          <div v-for="item in getRoomItems(room.id)" :key="item.id" class="item-card">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-desc">{{ getItemDesc(item.id) }}</div>
          </div>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn-primary" style="margin: 0;" @click="router.push('/warehouse')">
          查看经历仓库
        </button>
        <button class="btn-secondary" @click="router.push('/resume')">
          用这段经历生成简历
        </button>
        <button class="btn-danger" @click="handleDelete">
          删除
        </button>
      </div>
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

.flow-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
}

.detail-title-section {
  margin-bottom: 32px;
}

.detail-title-section h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--bark);
  margin-bottom: 4px;
}

.detail-date {
  font-size: 13px;
  color: var(--bark-light);
}

.rooms-section {
  margin-bottom: 24px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--bark);
  margin-bottom: 10px;
}

.room-completion {
  font-size: 13px;
  color: var(--bark-light);
  font-weight: 500;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.item-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--bark);
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: var(--bark-light);
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
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

.btn-danger {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border: 2px solid #E88B8B;
  background: transparent;
  color: #C0392B;
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-danger:hover {
  background: #FDE8E8;
}

@media (max-width: 768px) {
  .flow-header {
    padding: 16px 20px;
  }
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>