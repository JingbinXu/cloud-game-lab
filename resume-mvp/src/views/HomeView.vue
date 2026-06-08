<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FunctionCard from '../components/home/FunctionCard.vue'

const router = useRouter()
const llmConfigured = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8000/api/llm/status')
    const data = await res.json()
    llmConfigured.value = data.configured
  } catch {
    llmConfigured.value = false
  }
})
</script>

<template>
  <div class="home-screen">
    <div class="home-sky">
      <div class="cloud c1">☁</div>
      <div class="cloud c2">☁</div>
      <div class="cloud c3">⛅</div>
    </div>
    <div class="home-hero">
      <div class="hero-deco">🏡</div>
      <h1>你的每一段经历<br>都值得被完整记录</h1>
      <p class="subtitle">走进记忆小屋，用问答的方式<br>把散落的经历<span>整理成册</span></p>
    </div>
    <div class="home-ground">
      <div class="fence"></div>
      <div class="home-cards">
        <FunctionCard
          badge="流程 A"
          icon="🌱"
          title="记录我的经历"
          description="走进记忆小屋的每个房间，通过温暖的问答对话，把实习经历完整地梳理成可视化的成长地图。"
          variant="a"
          @click="router.push('/street')"
        />
        <FunctionCard
          badge="流程 B"
          icon="📜"
          title="生成定制简历"
          description="从背包中挑选记忆碎片，选择你喜欢的模板样式，系统自动匹配目标岗位，生成一份量身定制的简历。"
          variant="b"
          @click="router.push('/resume')"
        />
        <FunctionCard
          v-if="llmConfigured"
          badge="流程 C"
          icon="✨"
          title="AI 智能生成"
          description="上传已有简历，结合 QA 对话数据，由 AI 自动生成实习经历、自我评价等模块，润色优化后一键导出。"
          variant="b"
          @click="router.push('/resume/ai-generate')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-screen {
  min-height: calc(100vh - 52px);
  background:
    linear-gradient(
      180deg,
      #87CEEB 0%,
      #A8D8EA 30%,
      #B8E6B8 55%,
      #7CB342 55.5%,
      #689F38 100%
    );
  position: relative;
  overflow: hidden;
}

/* 天空云朵 */
.home-sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
}

.cloud {
  position: absolute;
  font-size: 40px;
  opacity: 0.7;
  animation: cloudDrift 30s linear infinite;
}
.cloud.c1 { top: 8%; left: 10%; animation-duration: 35s; }
.cloud.c2 { top: 15%; left: 50%; animation-duration: 28s; animation-delay: -10s; }
.cloud.c3 { top: 5%; left: 75%; animation-duration: 32s; animation-delay: -20s; font-size: 32px; }

@keyframes cloudDrift {
  from { transform: translateX(-100px); }
  to { transform: translateX(100vw); }
}

.home-hero {
  text-align: center;
  padding: 50px 24px 30px;
  position: relative;
  z-index: 1;
}

.hero-deco {
  font-size: 56px;
  margin-bottom: 16px;
  filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.15));
  animation: pixelBounce 2s ease infinite;
}

@keyframes pixelBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.home-hero h1 {
  font-size: 32px;
  font-weight: 800;
  color: #FFF;
  margin-bottom: 12px;
  text-shadow:
    2px 2px 0 #3E2723,
    -1px -1px 0 transparent,
    3px 0 0 rgba(62, 39, 35, 0.3);
  line-height: 1.4;
}

.subtitle {
  font-size: 14px;
  color: #FFF;
  font-weight: 400;
  line-height: 1.8;
  text-shadow: 1px 1px 0 rgba(62, 39, 35, 0.4);
}

.subtitle span {
  color: #FFD54F;
  font-weight: 700;
  text-shadow: 1px 1px 0 #3E2723;
}

.home-ground {
  position: relative;
  z-index: 1;
  padding: 20px 24px 60px;
}

/* 木栅栏装饰 */
.fence {
  height: 16px;
  margin-bottom: 20px;
  background:
    repeating-linear-gradient(
      90deg,
      #A1887F 0px,
      #A1887F 4px,
      transparent 4px,
      transparent 8px
    );
  border-top: 3px solid #795548;
  border-bottom: 3px solid #795548;
  position: relative;
}
.fence::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  height: 6px;
  background:
    repeating-linear-gradient(
      90deg,
      #8D6E63 0px,
      #8D6E63 2px,
      transparent 2px,
      transparent 16px
    );
}

.home-cards {
  display: flex;
  gap: 28px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .home-cards {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .home-hero h1 {
    font-size: 24px;
  }
  .home-hero {
    padding: 30px 16px 20px;
  }
}
</style>
