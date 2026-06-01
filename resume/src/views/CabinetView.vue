<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { getExperienceSummary } from '../utils/answerMap'

const router = useRouter()
const store = useExperienceStore()

onMounted(() => {
  store.loadExperiences()
})

function handleDelete(id: string, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  if (confirm('确定要删除这段经历吗？')) {
    store.deleteExperience(id)
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

function summary(exp: any): string[] {
  return getExperienceSummary(exp).slice(0, 4)
}
</script>

<template>
  <div class="cabinet-screen">
    <div class="flow-header">
      <button class="btn-back" @click="router.push('/')">←</button>
      <span class="flow-title">我的经历柜</span>
      <span class="cabinet-count">共 {{ store.experiences.length }} 段经历</span>
      <button
        v-if="store.experiences.length > 0"
        class="btn-warehouse"
        @click="router.push('/warehouse')"
      >
        进入经历仓库
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="store.experiences.length === 0" class="empty-state">
      <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
      <p>还没有记录任何经历</p>
      <p style="font-size: 13px; color: var(--bark-light);">去记录你的第一段经历吧，像种下一颗种子 🌱</p>
    </div>

    <!-- Cabinet grid -->
    <div v-else class="cabinet-grid">
      <div
        v-for="exp in store.experiences"
        :key="exp.id"
        class="cabinet-drawer"
        @click="router.push('/warehouse')"
      >
        <div class="drawer-top">
          <span class="drawer-tag">{{ exp.title }}</span>
          <button class="delete-btn" @click="handleDelete(exp.id, $event)">🗑️</button>
        </div>
        <div class="drawer-date">📅 {{ formatDate(exp.createdAt) }}</div>
        <div class="drawer-chips">
          <span
            v-for="(tag, i) in summary(exp)"
            :key="i"
            class="drawer-chip"
          >
            {{ tag }}
          </span>
        </div>
        <div class="drawer-footer">
          <span class="view-brainmap">查看经历仓库 →</span>
        </div>
        <div class="drawer-bottom-bar"></div>
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

.cabinet-count {
  font-size: 14px;
  color: var(--bark-light);
}

.btn-warehouse {
  margin-left: auto;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #1a1a2e, #2a2a4a);
  color: #FFD89B;
  border: 1px solid rgba(255, 216, 155, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-warehouse:hover {
  background: linear-gradient(135deg, #2a2a4a, #3a3a5a);
  border-color: rgba(255, 216, 155, 0.6);
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--bark-light);
  font-size: 16px;
}

.cabinet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 48px 60px;
}

.cabinet-drawer {
  background: linear-gradient(180deg, #FFFDF9 0%, #FBF3E6 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  box-shadow: 0 2px 8px rgba(60, 36, 21, 0.04);
  overflow: hidden;
}

.cabinet-drawer:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  border-color: var(--wood);
}

.drawer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.drawer-tag {
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  color: var(--bark);
}

.drawer-date {
  font-size: 12px;
  color: var(--bark-light);
  margin-bottom: 12px;
}

.drawer-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.drawer-chip {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(139, 169, 92, 0.12);
  color: #4a6a2f;
  font-size: 12px;
  font-weight: 500;
}

.drawer-footer {
  font-size: 12px;
  color: var(--wood);
  font-weight: 600;
  opacity: 0;
  transition: opacity var(--transition);
}

.cabinet-drawer:hover .drawer-footer {
  opacity: 1;
}

.drawer-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--wood), var(--golden), var(--leaf));
  border-radius: 0 0 var(--radius) var(--radius);
}

.delete-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  opacity: 0;
  transition: all var(--transition);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.cabinet-drawer:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #E88B8B;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .cabinet-grid {
    grid-template-columns: 1fr;
    padding: 0 20px 60px;
  }

  .flow-header {
    padding: 16px 20px;
  }
}
</style>
