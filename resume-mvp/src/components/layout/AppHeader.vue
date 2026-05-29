<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <nav class="nav">
    <router-link to="/" class="nav-logo">
      <span class="icon">🌳</span> 记忆树
    </router-link>
    <div class="nav-avatar" @click="router.push('/')" title="个人账户">R</div>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  background: linear-gradient(180deg, rgba(255, 248, 240, 0.95) 0%, rgba(255, 248, 240, 0) 100%);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: var(--bark);
  cursor: pointer;
}

.nav-logo .icon {
  font-size: 28px;
}

.nav-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--wood), var(--golden));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.nav-avatar:hover {
  border-color: var(--golden);
  transform: scale(1.05);
}
</style>
