<template>
  <div class="worldview-overlay">
    <div class="worldview-card">
      <div class="wv-icon">{{ icon }}</div>
      <div class="wv-badge">{{ badge }}</div>
      <h2 class="wv-title">{{ title }}</h2>
      <p class="wv-subtitle">{{ subtitle }}</p>
      <button class="wv-btn" @click="$emit('continue')">
        继续 ▶
      </button>
      <div class="card-corner tl"></div>
      <div class="card-corner tr"></div>
      <div class="card-corner bl"></div>
      <div class="card-corner br"></div>
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
  background: rgba(62, 39, 35, 0.5);
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.worldview-card {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(139, 109, 74, 0.04) 0px,
      rgba(139, 109, 74, 0.04) 1px,
      transparent 1px,
      transparent 4px
    ),
    #FFF8E1;
  border: var(--border-pixel);
  border-radius: var(--radius);
  padding: 40px 36px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: pixelPop 0.4s ease;
  position: relative;
}
@keyframes pixelPop {
  from { opacity: 0; transform: scale(0.9); }
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

.wv-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.15));
}
.wv-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 12px;
  background: var(--golden);
  color: var(--bark);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  margin-bottom: 14px;
  box-shadow: var(--shadow-sm);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
}
.wv-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--bark);
  margin-bottom: 10px;
  line-height: 1.4;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}
.wv-subtitle {
  font-size: 0.85rem;
  color: var(--bark-light);
  line-height: 1.8;
  margin-bottom: 24px;
}
.wv-btn {
  background: var(--golden);
  color: var(--bark);
  border: 2px solid var(--border-color);
  padding: 10px 32px;
  font-size: 0.88rem;
  font-family: var(--font-body);
  font-weight: 700;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
  letter-spacing: 1px;
}
.wv-btn:hover {
  background: var(--golden-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.wv-btn:active {
  transform: translateY(1px);
  box-shadow: none;
}
</style>
