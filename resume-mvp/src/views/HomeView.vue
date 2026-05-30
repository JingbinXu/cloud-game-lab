<script setup lang="ts">
import { useRouter } from 'vue-router'
import FunctionCard from '../components/home/FunctionCard.vue'

const router = useRouter()
</script>

<template>
  <div class="home-screen">
    <div class="home-hero">
      <h1>你的每一段经历，都值得被完整记录</h1>
      <p class="subtitle">告别碎片化信息，让经历像<span>大树</span>一样扎根生长，枝繁叶茂</p>
    </div>
    <div class="home-cards">
      <FunctionCard
        badge="流程 A"
        icon="🌱"
        title="记录我的经历"
        description="像和一位资深前辈聊天一样，通过温暖的问答对话，把实习经历完整地梳理成可视化的成长脑图。再也不用担心忘记那些重要的细节。"
        variant="a"
        @click="router.push('/cabin')"
      />
      <FunctionCard
        badge="流程 B"
        icon="📄"
        title="生成定制简历"
        description="上传目标岗位JD，选择你喜欢的模板样式，系统自动从你的经历库中提取最匹配的内容，生成一份量身定制的简历。"
        variant="b"
        @click="router.push('/resume')"
      />
    </div>
  </div>
</template>

<style scoped>
.home-hero {
  text-align: center;
  padding: 60px 48px 40px;
}

.home-hero h1 {
  font-size: 42px;
  font-weight: 800;
  color: var(--bark);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 17px;
  color: var(--bark-light);
  font-weight: 400;
}

.subtitle span {
  color: var(--leaf);
  font-weight: 600;
}

.home-cards {
  display: flex;
  gap: 32px;
  justify-content: center;
  padding: 20px 48px 60px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .home-cards {
    flex-direction: column;
    align-items: center;
    padding: 20px 20px 60px;
  }

  .home-card {
    width: 100%;
    max-width: 360px;
  }

  .home-hero h1 {
    font-size: 28px;
  }

  .home-hero {
    padding: 40px 20px 24px;
  }
}
</style>
