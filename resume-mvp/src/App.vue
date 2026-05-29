<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
</script>

<template>
  <div class="app">
    <AppHeader />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.page-enter-active {
  animation: fadeSlideIn 0.5s ease;
}

.page-leave-active {
  animation: fadeIn 0.2s ease reverse;
}
</style>
