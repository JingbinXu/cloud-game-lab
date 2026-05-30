<template>
  <div class="house-page">
    <WorldviewScreen
      v-if="showWorldview"
      icon="🏚️"
      badge="世界观 B"
      title="如实回答才能还原"
      subtitle="每件物品都承载着一段真实的记忆。只有你如实回答，这些物品才会以最真实的样貌出现在你面前。准备好了吗？"
      color="#4A6FA5"
      @continue="dismissWorldview"
    />

    <div class="top-bar">
      <div>
        <h2>{{ store.experienceTitle || '房子单层' }}</h2>
        <div class="subtitle" v-if="store.experienceDirection">{{ dirName }}</div>
      </div>
      <div class="btns">
        <button class="btn ghost small" @click="$router.push('/backpack')">🎒 背包</button>
        <button class="btn ghost small" @click="$router.push('/street')">🏠 街区</button>
      </div>
    </div>

    <div class="house-content">
      <CabinCanvas @item-click="onItemClick" />
    </div>

    <div class="room-bar">
      <div
        v-for="room in ROOM_DEFS"
        :key="room.id"
        class="room-chip"
        :class="{ complete: store.getRoomProgress(room.id).answered === store.getRoomProgress(room.id).total }"
      >
        {{ room.emoji }} {{ room.shortName }}
        <span class="rc-count">{{ store.getRoomProgress(room.id).answered }}/{{ store.getRoomProgress(room.id).total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { ROOM_DEFS } from '../types/cabin'
import CabinCanvas from '../components/cabin/CabinCanvas.vue'
import WorldviewScreen from '../components/cabin/WorldviewScreen.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
const store = useExperienceStore()

const showWorldview = ref(false)

const dirNameMap: Record<string, string> = {
  product: '产品', ops: '运营', marketing: '市场',
  tech: '技术', data: '数据', other: '其他',
}
const dirName = computed(() => dirNameMap[store.experienceDirection] || store.experienceDirection)

function dismissWorldview() {
  showWorldview.value = false
  store.markWorldviewShown(`house-${props.id}`)
}

onMounted(async () => {
  await store.loadExperiences()
  const exp = store.experiences.find(e => e.id === props.id)
  if (!exp) {
    router.replace('/street')
    return
  }
  store.loadForEdit(exp)
  if (!store.shownWorldviews[`house-${props.id}`]) {
    showWorldview.value = true
  }
})

function onItemClick(itemId: string) {
  // Show item info — for now just set active item
  store.setActiveItem(itemId)
}
</script>

<style scoped>
.house-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 52px);
  overflow: hidden;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  gap: 8px;
  flex-shrink: 0;
}
.top-bar h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c2416;
}
.subtitle {
  font-size: 0.78rem;
  color: #8b7a65;
  margin-top: 2px;
}
.btns {
  display: flex;
  gap: 8px;
}
.house-content {
  flex: 1;
  min-height: 0;
  padding: 0 24px;
}
.room-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  flex-shrink: 0;
}
.room-chip {
  font-size: 0.78rem;
  padding: 6px 14px;
  border-radius: 20px;
  background: #fafaf8;
  border: 1px solid #e8e0d5;
  color: #5a4a35;
}
.room-chip.complete {
  border-color: #3a7d44;
  color: #3a7d44;
}
.rc-count {
  font-size: 0.68rem;
  color: #a09080;
  margin-left: 4px;
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
