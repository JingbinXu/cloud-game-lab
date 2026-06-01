<script setup lang="ts">
defineProps<{
  badge: string
  icon: string
  title: string
  description: string
  variant: 'a' | 'b'
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="sdv-card" :class="'card-' + variant" @click="$emit('click')">
    <div class="card-badge">{{ badge }}</div>
    <div class="card-icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <div class="card-corner tl"></div>
    <div class="card-corner tr"></div>
    <div class="card-corner bl"></div>
    <div class="card-corner br"></div>
  </div>
</template>

<style scoped>
.sdv-card {
  width: 340px;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(139, 109, 74, 0.03) 0px,
      rgba(139, 109, 74, 0.03) 1px,
      transparent 1px,
      transparent 4px
    ),
    var(--card-bg);
  border: var(--border-pixel);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px 28px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.sdv-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  background: var(--card-hover);
}

.sdv-card:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-sm);
}

/* 像素风角落装饰 */
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

.card-icon {
  width: 56px;
  height: 56px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
}

.card-a .card-icon {
  background: linear-gradient(135deg, #FFD54F, #FFB300);
}

.card-b .card-icon {
  background: linear-gradient(135deg, #81C784, #66BB6A);
}

h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--bark);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}

p {
  font-size: 13px;
  color: var(--bark-light);
  line-height: 1.7;
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  padding: 3px 10px;
  background: var(--golden);
  color: var(--bark);
  font-weight: 700;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  box-shadow: var(--shadow-sm);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
}
</style>
