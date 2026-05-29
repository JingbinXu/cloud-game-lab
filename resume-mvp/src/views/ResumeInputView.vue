<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { useResumeStore } from '../stores/resume'

const router = useRouter()
const experienceStore = useExperienceStore()
const resumeStore = useResumeStore()

const jdText = ref('')
const step = ref<'jd' | 'template'>('jd')
const selectedTemplate = ref('')

const templateList = [
  { id: 'classic', name: '经典专业', desc: '适合传统行业、国企、咨询' },
  { id: 'modern', name: '现代简洁', desc: '适合互联网、科技公司' },
  { id: 'dual', name: '双栏布局', desc: '信息密度高，适合经历丰富者' },
  { id: 'creative', name: '创意设计', desc: '适合设计、市场、品牌岗' },
]

onMounted(() => {
  experienceStore.loadExperiences()
  resumeStore.reset()
})

function analyzeJD() {
  if (!jdText.value.trim()) return
  resumeStore.setJobDescription(jdText.value.trim())
  step.value = 'template'
}

function selectTemplate(id: string) {
  selectedTemplate.value = id
  resumeStore.setTemplate(id)
}

function generateResume() {
  if (!selectedTemplate.value) return
  if (experienceStore.experiences.length > 0) {
    experienceStore.experiences.forEach(exp => {
      resumeStore.toggleExperience(exp.id)
    })
  }
  resumeStore.generateResume(experienceStore.experiences)
  router.push('/resume/preview')
}
</script>

<template>
  <div class="flow-screen">
    <div class="flow-header">
      <button class="btn-back" @click="step === 'jd' ? router.push('/') : step = 'jd'">
        ←
      </button>
      <span class="flow-title">
        生成简历 · {{ step === 'jd' ? '输入JD' : '选择模板' }}
      </span>
    </div>

    <!-- Step 1: JD Input -->
    <div v-if="step === 'jd'" class="flow-body animate-fade-in">
      <h2>粘贴目标岗位的 JD</h2>
      <p class="flow-desc">系统会分析JD中的关键要求，从你的经历库中智能匹配最相关的内容</p>
      <textarea
        v-model="jdText"
        class="jd-textarea"
        placeholder="在这里粘贴岗位描述（JD）...&#10;&#10;例如：&#10;【岗位职责】&#10;1. 负责产品需求分析，撰写PRD文档&#10;2. 协调研发、设计、测试团队完成产品迭代&#10;3. 通过数据分析和用户反馈持续优化产品体验...&#10;&#10;【任职要求】&#10;1. 有较强的逻辑分析能力和数据敏感度&#10;2. 具备良好的跨部门沟通能力..."
      ></textarea>
      <button class="btn-primary" @click="analyzeJD">
        🔍 分析JD → 选择模板
      </button>
    </div>

    <!-- Step 2: Template Selection -->
    <div v-else-if="step === 'template'" class="flow-body animate-fade-in">
      <h2>选择你喜欢的简历样式</h2>
      <p class="flow-desc">相同的经历，不同的呈现方式，选一个最适合投递目标的风格</p>
      <div class="template-grid">
        <div
          v-for="tpl in templateList"
          :key="tpl.id"
          class="template-card"
          :class="{ selected: selectedTemplate === tpl.id }"
          @click="selectTemplate(tpl.id)"
        >
          <div class="tpl-preview" :class="'preview-' + tpl.id">
            <span v-if="tpl.id === 'classic'">Classic<br>经典单栏</span>
            <span v-else-if="tpl.id === 'modern'">Modern<br>现代简洁</span>
            <div v-else-if="tpl.id === 'dual'" style="display:flex; gap:8px; width:100%; height:100%;">
              <div style="flex:1; background:#ddd; height:100%;"></div>
              <div style="flex:2; background:#eee; height:100%;"></div>
            </div>
            <span v-else>Creative<br>创意设计</span>
          </div>
          <h4>{{ tpl.name }}</h4>
          <p style="font-size:12px; color:var(--bark-light);">{{ tpl.desc }}</p>
        </div>
      </div>
      <button class="btn-primary" :disabled="!selectedTemplate" @click="generateResume">
        ✨ 生成简历
      </button>
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
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
}

.flow-body h2 {
  font-size: 28px;
  color: var(--bark);
  margin-bottom: 8px;
  text-align: center;
}

.flow-desc {
  text-align: center;
  color: var(--bark-light);
  font-size: 15px;
  margin-bottom: 40px;
}

.jd-textarea {
  width: 100%;
  min-height: 200px;
  padding: 20px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  background: #fff;
  transition: var(--transition);
  line-height: 1.7;
}

.jd-textarea:focus {
  outline: none;
  border-color: var(--wood);
  box-shadow: 0 0 0 4px rgba(196, 154, 60, 0.1);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.template-card {
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  cursor: pointer;
  transition: var(--transition);
  background: #fff;
  text-align: center;
}

.template-card:hover,
.template-card.selected {
  border-color: var(--wood);
  background: var(--wood-light);
}

.tpl-preview {
  height: 160px;
  background: var(--cream);
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--bark-light);
  border: 1px dashed var(--border);
}

.preview-classic {
  font-family: serif;
}

.preview-modern {
  font-family: sans-serif;
}

.preview-creative {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.template-card h4 {
  font-size: 16px;
}

.btn-primary {
  display: block;
  margin: 40px auto 0;
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
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .flow-header {
    padding: 16px 20px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
