<template>
  <div class="worldview-overlay" :style="{ '--accent': color }">
    <div class="worldview-card">
      <div class="wv-icon">{{ icon }}</div>
      <div class="wv-badge">{{ badge }}</div>
      <h2 class="wv-title">{{ title }}</h2>
      <p class="wv-subtitle">{{ subtitle }}</p>
      <button class="wv-btn" @click="$emit('continue')">继续 →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  badge: string
  title: string
  subtitle: string
  color: string
}>()

defineEmits<{ (e: 'continue'): void }>()
</script>

<style scoped>
.worldview-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.worldview-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  animation: slideUp 0.5s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.wv-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}
.wv-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 3px 12px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--accent);
  margin-bottom: 16px;
}
.wv-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 12px;
  line-height: 1.4;
}
.wv-subtitle {
  font-size: 0.88rem;
  color: #8b7a65;
  line-height: 1.7;
  margin-bottom: 28px;
}
.wv-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 12px 40px;
  font-size: 0.95rem;
  font-family: inherit;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.04em;
}
.wv-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 18px color-mix(in srgb, var(--accent) 30%, transparent);
}
</style>
