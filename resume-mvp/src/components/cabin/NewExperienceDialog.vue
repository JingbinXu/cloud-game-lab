<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-card">
      <h3>📋 记录一段新经历</h3>
      <p class="dialog-desc">给这段经历起个名字，选择对应的岗位方向</p>

      <div class="field">
        <label>经历标题</label>
        <input
          v-model="title"
          type="text"
          placeholder="例如：腾讯产品实习"
          maxlength="30"
          @keyup.enter="onConfirm"
        />
      </div>

      <div class="field">
        <label>岗位方向</label>
        <div class="direction-grid">
          <button
            v-for="d in directions"
            :key="d.value"
            class="dir-btn"
            :class="{ active: direction === d.value }"
            @click="direction = d.value"
          >
            {{ d.emoji }} {{ d.label }}
          </button>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="pixel-btn ghost" @click="$emit('close')">取消</button>
        <button class="pixel-btn green" :disabled="!canConfirm" @click="onConfirm">开始探索 ▶</button>
      </div>
      <div class="card-corner tl"></div>
      <div class="card-corner tr"></div>
      <div class="card-corner bl"></div>
      <div class="card-corner br"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', title: string, direction: string): void
}>()

const title = ref('')
const direction = ref('')

const directions = [
  { value: 'product', label: '产品', emoji: '🎯' },
  { value: 'ops', label: '运营', emoji: '📊' },
  { value: 'marketing', label: '市场', emoji: '📣' },
  { value: 'tech', label: '技术', emoji: '💻' },
  { value: 'data', label: '数据', emoji: '📈' },
  { value: 'other', label: '其他', emoji: '✨' },
]

const canConfirm = computed(() => title.value.trim().length > 0 && direction.value.length > 0)

function onConfirm() {
  if (canConfirm.value) {
    emit('confirm', title.value.trim(), direction.value)
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(62, 39, 35, 0.5);
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.dialog-card {
  background: var(--card-bg);
  border: var(--border-pixel);
  border-radius: var(--radius);
  padding: 28px;
  max-width: 420px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  position: relative;
  animation: pixelPop 0.3s ease;
}
@keyframes pixelPop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.card-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--border-color);
}
.card-corner.tl { top: -3px; left: -3px; }
.card-corner.tr { top: -3px; right: -3px; }
.card-corner.bl { bottom: -3px; left: -3px; }
.card-corner.br { bottom: -3px; right: -3px; }

.dialog-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bark);
  margin-bottom: 4px;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}
.dialog-desc {
  font-size: 0.82rem;
  color: var(--bark-light);
  margin-bottom: 20px;
}
.field {
  margin-bottom: 16px;
}
.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--bark);
  margin-bottom: 6px;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}
.field input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  font-family: var(--font-body);
  color: var(--bark);
  background: #FFF;
  outline: none;
  transition: all 0.15s;
  box-sizing: border-box;
  box-shadow: inset 1px 1px 0 rgba(0,0,0,0.05);
}
.field input:focus {
  border-color: var(--golden);
  background: #FFFBF0;
}
.field input::placeholder {
  color: #BCAAA4;
}
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.dir-btn {
  background: var(--panel);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xs);
  padding: 9px 6px;
  font-size: 0.78rem;
  font-family: var(--font-body);
  color: var(--bark-light);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.dir-btn:hover {
  border-color: var(--border-color);
  background: var(--card-hover);
}
.dir-btn.active {
  border-color: var(--border-color);
  background: var(--golden);
  color: var(--bark);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
}
.dialog-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
.pixel-btn {
  flex: 1;
  padding: 9px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-family: var(--font-body);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
}
.pixel-btn.green {
  background: var(--leaf);
  color: #fff;
}
.pixel-btn.green:hover:not(:disabled) {
  background: var(--leaf-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}
.pixel-btn.green:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pixel-btn.ghost {
  background: var(--panel);
  color: var(--bark-light);
}
.pixel-btn.ghost:hover {
  background: var(--card-hover);
}
</style>
