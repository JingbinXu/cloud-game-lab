<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResumeStore } from '../stores/resume'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const resumeStore = useResumeStore()
const isGenerating = ref(false)

onMounted(() => {
  if (!resumeStore.resumeOutput) {
    router.push('/resume')
  }
})

async function downloadResume() {
  if (isGenerating.value) return
  isGenerating.value = true

  try {
    const element = document.getElementById('resume-preview-content')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    const pdfWidth = 210
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`简历_${new Date().toLocaleDateString('zh-CN')}.pdf`)
  } catch (err) {
    console.error('PDF generation failed:', err)
  } finally {
    isGenerating.value = false
  }
}

const templateNames: Record<string, string> = {
  classic: '经典专业',
  modern: '现代简洁',
  dual: '双栏布局',
  creative: '创意设计',
}
</script>

<template>
  <div class="flow-screen" v-if="resumeStore.resumeOutput">
    <div class="flow-header">
      <button class="btn-back" @click="router.push('/resume')">←</button>
      <span class="flow-title">生成简历 · 预览</span>
    </div>

    <div class="flow-body" style="max-width: 860px;">
      <div class="resume-preview" id="resume-preview-content">
        <div class="resume-name">你的姓名</div>
        <div class="resume-contact">your@email.com &nbsp;|&nbsp; 138-0000-0000</div>
        <div style="text-align:center; font-size:12px; color:var(--bark-light); margin-bottom:24px;">
          基于 {{ resumeStore.resumeOutput.experiences.length }} 段经历生成 · {{ templateNames[resumeStore.selectedTemplateId] || '经典专业' }} 模板
        </div>

        <div class="resume-section" v-for="section in resumeStore.resumeOutput.sections" :key="section.title">
          <h4>{{ section.title }}</h4>
          <div class="resume-bullet" v-for="(bullet, i) in section.bullets" :key="i">
            {{ bullet }}
          </div>
        </div>
      </div>

      <div class="resume-actions">
        <button class="btn-primary" style="margin: 0;" @click="downloadResume" :disabled="isGenerating">
          {{ isGenerating ? '生成中...' : '下载 PDF' }}
        </button>
        <button class="btn-secondary" @click="router.push('/resume')">换个模板</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flow-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 48px;
  border-bottom: 1px solid var(--border);
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background: var(--wood-light);
  border-color: var(--wood);
}

.flow-title {
  font-size: 18px;
  font-weight: 700;
}

.flow-body {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 24px;
}

.resume-preview {
  background: #fff;
  padding: 48px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  line-height: 1.8;
}

.resume-name {
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 4px;
}

.resume-contact {
  text-align: center;
  font-size: 13px;
  color: var(--bark-light);
  margin-bottom: 24px;
}

.resume-section {
  margin-bottom: 20px;
}

.resume-section h4 {
  font-size: 16px;
  border-bottom: 2px solid var(--wood);
  padding-bottom: 4px;
  margin-bottom: 10px;
}

.resume-bullet {
  padding-left: 16px;
  position: relative;
  margin-bottom: 4px;
}

.resume-bullet::before {
  content: '\2022';
  position: absolute;
  left: 0;
  color: var(--wood);
}

.resume-actions {
  text-align: center;
  padding: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--wood), var(--wood-deep));
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 16px rgba(139, 105, 20, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(139, 105, 20, 0.35);
}

.btn-primary:disabled {
  opacity: 0.4;
}

.btn-secondary {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border: 2px solid var(--wood);
  background: transparent;
  color: var(--wood-deep);
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover {
  background: var(--wood-light);
}

@media (max-width: 768px) {
  .flow-header {
    padding: 16px 20px;
  }

  .resume-preview {
    padding: 24px;
  }
}
</style>
