<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <nav class="nav">
    <router-link to="/" class="nav-logo">
      <span class="logo-icon">🏡</span>
      <span class="logo-text">记忆小屋</span>
    </router-link>
    <div class="nav-actions">
      <button class="nav-btn" @click="router.push('/street')" title="记忆街区">🗺️</button>
      <button class="nav-btn" @click="router.push('/backpack')" title="背包">🎒</button>
    </div>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(139, 109, 74, 0.06) 0px,
      rgba(139, 109, 74, 0.06) 2px,
      transparent 2px,
      transparent 8px
    ),
    linear-gradient(180deg, #6D4C41 0%, #5D4037 100%);
  border-bottom: 3px solid #3E2723;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 3px 0 #3E2723;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;
}

.logo-icon {
  font-size: 24px;
  filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.3));
}

.logo-text {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  color: #FFD54F;
  text-shadow:
    1px 1px 0 #3E2723,
    -1px -1px 0 transparent,
    2px 0 0 #3E2723;
  letter-spacing: 2px;
}

.nav-actions {
  display: flex;
  gap: 6px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-btn:active {
  transform: translateY(1px);
}
</style>
