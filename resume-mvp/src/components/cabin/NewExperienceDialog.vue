<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-card">
      <h3>记录一段新经历</h3>
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
        <button class="btn cancel" @click="$emit('close')">取消</button>
        <button class="btn confirm" :disabled="!canConfirm" @click="onConfirm">开始探索</button>
      </div>
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
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}
.dialog-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}
.dialog-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 4px;
}
.dialog-desc {
  font-size: 0.82rem;
  color: #8b7a65;
  margin-bottom: 24px;
}
.field {
  margin-bottom: 20px;
}
.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #5a4a35;
  margin-bottom: 8px;
}
.field input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d4c8b8;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #2c2416;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.field input:focus {
  border-color: #8b7a65;
}
.field input::placeholder {
  color: #c8b898;
}
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.dir-btn {
  background: #fafaf8;
  border: 1.5px solid #d4c8b8;
  border-radius: 10px;
  padding: 10px 8px;
  font-size: 0.82rem;
  font-family: inherit;
  color: #5a4a35;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.dir-btn:hover {
  border-color: #8b7a65;
  background: #f5ede0;
}
.dir-btn.active {
  border-color: #2c2416;
  background: #f0e8d8;
  color: #2c2416;
  font-weight: 600;
}
.dialog-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.btn {
  flex: 1;
  padding: 11px 20px;
  border-radius: 40px;
  font-size: 0.88rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
  letter-spacing: 0.04em;
}
.btn.cancel {
  background: transparent;
  border: 1.5px solid #d4c8b8;
  color: #8b7a65;
}
.btn.cancel:hover {
  background: #f5ede0;
}
.btn.confirm {
  background: #2c2416;
  color: #fafaf8;
}
.btn.confirm:hover:not(:disabled) {
  background: #4a3d2a;
  transform: translateY(-1px);
}
.btn.confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
