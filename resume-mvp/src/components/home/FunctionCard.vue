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
  <div class="home-card" :class="'card-' + variant" @click="$emit('click')">
    <div class="card-badge">{{ badge }}</div>
    <div class="card-icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<style scoped>
.home-card {
  width: 360px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.home-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--wood);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin-bottom: 20px;
}

.card-a .card-icon {
  background: linear-gradient(135deg, #F5E6D3, #E8D5B7);
}

.card-b .card-icon {
  background: linear-gradient(135deg, #E8F0E0, #D0E5C8);
}

h3 {
  font-size: 22px;
  margin-bottom: 8px;
  color: var(--bark);
}

p {
  font-size: 14px;
  color: var(--bark-light);
  line-height: 1.7;
}

.card-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--wood-light);
  color: var(--wood-deep);
  font-weight: 600;
}
</style>
