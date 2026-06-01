<template>
  <div class="quiz-panel" :class="{ open: !!item }">
    <template v-if="item">
      <div class="panel-header">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-why">{{ item.why }}</div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="questions">
        <div v-for="(q, qi) in item.questions" :key="qi" class="q-block" :class="{ active: qi === currentQ }">
          <div class="q-label">
            <span class="q-num">{{ qi + 1 }}</span>
            {{ q.text }}
          </div>
          <div class="q-opts">
            <button
              v-for="opt in q.opts"
              :key="opt.val"
              class="q-opt"
              :class="{ sel: answers[q.prop] === opt.val }"
              @click="select(q.prop, opt.val)"
            >{{ opt.text }}</button>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <div class="desc-preview" v-if="descriptor">{{ descriptor }}</div>
        <button class="btn done-btn" :class="{ disabled: !isComplete }" @click="onDone">
          {{ isComplete ? '✓ 完成这件物品' : `请回答所有问题 (${answeredCount}/3)` }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useExperienceStore } from '../../stores/experience'
import { describeItem, type ItemAnswers } from '../../types/cabin'
import { ITEM_BY_ID } from '../../data/itemDefs'

const props = defineProps<{ itemId: string | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'done'): void }>()

const store = useExperienceStore()

const item = computed(() => props.itemId ? ITEM_BY_ID[props.itemId] : null)
const answers = computed<ItemAnswers>(() => {
  if (!props.itemId) return {} as ItemAnswers
  return store.getItemAnswers(props.itemId)
})

const answeredCount = computed(() => {
  if (!item.value) return 0
  return item.value.questions.filter(q => !!answers.value[q.prop]).length
})

const isComplete = computed(() => {
  if (!item.value) return false
  return item.value.questions.every(q => !!answers.value[q.prop])
})

const currentQ = computed(() => {
  if (!item.value) return 0
  return item.value.questions.findIndex(q => !answers.value[q.prop])
})

const progressPercent = computed(() => (answeredCount.value / 3) * 100)

const descriptor = computed(() => {
  if (!item.value || answeredCount.value === 0) return ''
  return describeItem(item.value, answers.value).desc
})

function select(prop: string, val: string) {
  if (!props.itemId) return
  store.answerItemQuestion(props.itemId, prop, val)
}

function onDone() {
  if (isComplete.value) emit('done')
}
</script>

<style scoped>
.quiz-panel {
  position: fixed;
  right: -420px;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  background: #fafaf8;
  border-left: 1px solid #e8e0d5;
  box-shadow: -4px 0 24px rgba(44, 36, 22, 0.08);
  z-index: 50;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
  overflow-y: auto;
}
.quiz-panel.open { right: 0; }

.panel-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #e8e0d5;
  position: relative;
}
.item-name { font-size: 1.2rem; font-weight: 700; color: #2c2416; }
.item-why { font-size: 0.82rem; color: #8b7a65; margin-top: 4px; }
.close-btn {
  position: absolute; top: 20px; right: 16px;
  background: none; border: none; font-size: 1.1rem; color: #8b7a65;
  cursor: pointer; padding: 4px 8px; border-radius: 6px;
}
.close-btn:hover { background: #f0e8d8; }

.progress-bar {
  height: 3px; background: #e8e0d5;
}
.progress-fill {
  height: 100%; background: #2c2416; border-radius: 2px;
  transition: width 0.3s;
}

.questions {
  flex: 1; padding: 20px; overflow-y: auto;
}

.q-block { margin-bottom: 22px; }
.q-label {
  font-size: 0.85rem; font-weight: 600; color: #5a4a35;
  margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
}
.q-num {
  background: #2c2416; color: #fafaf8;
  width: 18px; height: 18px; border-radius: 50%;
  font-size: 0.65rem; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.q-opts { display: flex; flex-wrap: wrap; gap: 6px; }
.q-opt {
  background: #fff; border: 1.5px solid #d4c8b8; border-radius: 12px;
  padding: 8px 16px; cursor: pointer; transition: all 0.2s;
  font-family: inherit; font-size: 0.82rem; color: #2c2416; white-space: nowrap;
}
.q-opt:hover { border-color: #8b7a65; background: #fdfaf6; }
.q-opt.sel { border-color: #2c2416; background: #f0e8d8; font-weight: 600; }

.panel-footer {
  padding: 16px 20px; border-top: 1px solid #e8e0d5;
}
.desc-preview {
  font-size: 0.78rem; color: #8b7a65; margin-bottom: 10px;
  font-style: italic; line-height: 1.5;
}
.done-btn {
  width: 100%; text-align: center;
}
.done-btn.disabled {
  opacity: 0.5; cursor: not-allowed;
}

.btn {
  background: #2c2416; color: #fafaf8; border: none;
  padding: 13px 44px; font-size: 0.95rem; font-family: inherit;
  border-radius: 40px; cursor: pointer; transition: all 0.25s; letter-spacing: 0.04em;
}
.btn:hover { background: #4a3d2a; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(44, 36, 22, 0.12); }

@media (max-width: 640px) {
  .quiz-panel { width: 100%; }
  .q-opts { flex-direction: column; }
  .q-opt { text-align: left; }
}
</style>