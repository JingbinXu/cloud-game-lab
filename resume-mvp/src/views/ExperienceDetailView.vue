<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Experience } from '../types/experience'
import { getExperienceById, deleteExperience } from '../utils/storage'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const experience = ref<Experience | null>(null)

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

function getAnswerDisplay(answer: any): string {
  if (typeof answer.value === 'string') return answer.value
  if (Array.isArray(answer.value)) return answer.value.join('、')
  return String(answer.value)
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

      <div class="detail-answers">
        <div
          v-for="(answer, key) in experience.answers"
          :key="key"
          class="answer-item"
        >
          <div class="answer-value">{{ getAnswerDisplay(answer) }}</div>
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

.detail-answers {
  margin-bottom: 32px;
}

.answer-item {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  margin-bottom: 10px;
}

.answer-value {
  font-size: 15px;
  color: var(--bark);
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  gap: 12px;
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
}
</style>
