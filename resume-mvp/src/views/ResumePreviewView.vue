<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResumeStore } from '../stores/resume'
import { useAiGenerateStore } from '../stores/aiGenerate'
import { MODULE_LIST } from '../types/aiGenerate'
import type { ModuleType } from '../types/aiGenerate'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const resumeStore = useResumeStore()
const aiStore = useAiGenerateStore()
const isGenerating = ref(false)

// ---- 编辑状态 ----
const editingModule = ref<ModuleType | null>(null)
const editDraft = ref('')

onMounted(() => {
  if (!resumeStore.resumeOutput) {
    router.push('/resume')
  }
})

// ---- AI 模块内容渲染 ----
function moduleToBullets(type: ModuleType): string[] {
  const mod = aiStore.getModule(type)
  if (!mod || mod.status !== 'done' || !mod.content) return []
  const content = mod.content as any

  if (type === 'internship') {
    return [
      content.company && content.role ? `${content.company} · ${content.role}` : '',
      content.period || '',
      ...(content.bullets || []),
    ].filter(Boolean)
  }
  if (type === 'project') {
    return [
      content.projectName && content.role ? `${content.projectName} · ${content.role}` : '',
      content.period || '',
      content.description || '',
      ...(content.bullets || []),
    ].filter(Boolean)
  }
  if (type === 'self_intro') {
    return [
      content.summary || '',
      ...(content.highlights || []),
    ].filter(Boolean)
  }
  if (type === 'skills') {
    const lines: string[] = []
    if (content.categories) {
      for (const cat of content.categories) {
        lines.push(`${cat.name}：${(cat.items || []).join('、')}`)
      }
    }
    if (content.summary) lines.push(content.summary)
    return lines
  }
  return []
}

function moduleLabel(type: ModuleType): string {
  return MODULE_LIST.find(m => m.type === type)?.label || type
}

function hasAiContent(): boolean {
  return aiStore.modules.some(m => m.status === 'done' && m.content)
}

// ---- 编辑逻辑 ----
function startEdit(type: ModuleType) {
  editingModule.value = type
  const mod = aiStore.getModule(type)
  editDraft.value = mod?.content ? JSON.stringify(mod.content, null, 2) : ''
}

function cancelEdit() {
  editingModule.value = null
  editDraft.value = ''
}

function saveEdit() {
  if (!editingModule.value) return
  try {
    const parsed = JSON.parse(editDraft.value)
    const mod = aiStore.modules.find(m => m.type === editingModule.value)
    if (mod) mod.content = parsed
    editingModule.value = null
    editDraft.value = ''
  } catch {
    alert('JSON 格式错误，请检查')
  }
}

// ---- PDF 导出 ----
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

        <!-- 原有 sections -->
        <div class="resume-section" v-for="section in resumeStore.resumeOutput.sections" :key="section.title">
          <h4>{{ section.title }}</h4>
          <div class="resume-bullet" v-for="(bullet, i) in section.bullets" :key="i">
            {{ bullet }}
          </div>
        </div>

        <!-- AI 生成内容 sections -->
        <template v-if="hasAiContent()">
          <div
            v-for="mod in aiStore.modules.filter(m => m.status === 'done' && m.content)"
            :key="mod.type"
            class="resume-section ai-section"
          >
            <h4>{{ moduleLabel(mod.type) }} <span class="ai-tag">AI</span></h4>
            <div
              class="resume-bullet"
              v-for="(line, i) in moduleToBullets(mod.type)"
              :key="i"
            >
              {{ line }}
            </div>
          </div>
        </template>
      </div>

      <!-- AI 内容编辑面板 -->
      <div v-if="hasAiContent()" class="ai-edit-panel">
        <h4>AI 生成内容管理</h4>
        <div
          v-for="mod in aiStore.modules.filter(m => m.status === 'done' && m.content)"
          :key="mod.type"
          class="ai-edit-item"
        >
          <div class="ai-edit-header">
            <span>{{ moduleLabel(mod.type) }}</span>
            <button
              v-if="editingModule !== mod.type"
              class="btn-sm"
              @click="startEdit(mod.type)"
            >
              编辑
            </button>
          </div>

          <div v-if="editingModule === mod.type" class="ai-edit-form">
            <textarea
              v-model="editDraft"
              rows="8"
              class="edit-textarea"
            ></textarea>
            <div class="edit-actions">
              <button class="btn-sm btn-save" @click="saveEdit">保存</button>
              <button class="btn-sm" @click="cancelEdit">取消</button>
            </div>
          </div>
        </div>
      </div>

      <div class="resume-actions">
        <button class="btn-primary" style="margin: 0;" @click="downloadResume" :disabled="isGenerating">
          {{ isGenerating ? '生成中...' : '下载 PDF' }}
        </button>
        <button class="btn-secondary" @click="router.push('/resume')">换个模板</button>
        <button class="btn-secondary" @click="router.push('/resume/ai-generate')">AI 生成</button>
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

/* ---- AI 生成内容 ---- */
.ai-section {
  background: #f0f9eb;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #67c23a;
}

.ai-tag {
  font-size: 10px;
  background: #67c23a;
  color: #fff;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: 400;
  vertical-align: middle;
}

/* ---- AI 编辑面板 ---- */
.ai-edit-panel {
  margin-top: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: var(--radius);
  border: 1px solid #e0e0e0;
}

.ai-edit-panel h4 {
  font-size: 15px;
  margin: 0 0 12px;
  color: var(--bark);
}

.ai-edit-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.ai-edit-item:last-child {
  border-bottom: none;
}

.ai-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-edit-form {
  margin-top: 8px;
}

.edit-textarea {
  width: 100%;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 10px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  resize: vertical;
  line-height: 1.6;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-sm:hover {
  border-color: var(--wood);
  color: var(--wood-deep);
}

.btn-save {
  background: #67c23a;
  color: #fff;
  border-color: #67c23a;
}

.btn-save:hover {
  background: #529b2e;
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
