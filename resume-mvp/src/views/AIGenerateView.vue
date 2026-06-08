<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { useAiGenerateStore } from '../stores/aiGenerate'
import { MODULE_LIST } from '../types/aiGenerate'
import type { ModuleType } from '../types/aiGenerate'
import { hasRoomData } from '../utils/contextBuilder'
import { parseResumeFile, FileParseError } from '../utils/fileParser'

const router = useRouter()
const experienceStore = useExperienceStore()
const aiStore = useAiGenerateStore()

const step = ref<1 | 2 | 3>(1)

// ---- Step 1: 选经历 ----
const selectedExpIds = ref<string[]>([])

onMounted(async () => {
  await experienceStore.loadExperiences()
  await aiStore.loadHistory()
  // 默认全选
  selectedExpIds.value = experienceStore.experiences.map(e => e.id)

  // 如果有历史结果，直接跳到步骤 3
  if (aiStore.hasHistory) {
    step.value = 3
  }
})

onUnmounted(() => {
  aiStore._abortController?.abort()
})

const hasExperiences = computed(() => experienceStore.experiences.length > 0)

function toggleExp(id: string) {
  const idx = selectedExpIds.value.indexOf(id)
  if (idx === -1) selectedExpIds.value.push(id)
  else selectedExpIds.value.splice(idx, 1)
}

function toStep2() {
  if (selectedExpIds.value.length === 0) return
  aiStore.setSelectedExperiences(selectedExpIds.value)
  step.value = 2
}

// ---- Step 2: 选模块 + 上传简历 ----
const selectedModules = ref<ModuleType[]>([])
const resumeText = ref<string | null>(null)
const uploadError = ref<string | null>(null)
const uploading = ref(false)

// 有数据的模块默认勾选
onMounted(() => {
  const selectedExps = experienceStore.experiences.filter(e =>
    selectedExpIds.value.includes(e.id),
  )
  selectedModules.value = MODULE_LIST
    .filter(m => selectedExps.some(exp =>
      m.sourceRooms.some(room => hasRoomData(exp, room)),
    ))
    .map(m => m.type)
})

function toggleModule(type: ModuleType) {
  const idx = selectedModules.value.indexOf(type)
  if (idx === -1) selectedModules.value.push(type)
  else selectedModules.value.splice(idx, 1)
}

function moduleHasData(type: ModuleType): boolean {
  const meta = MODULE_LIST.find(m => m.type === type)
  if (!meta) return false
  const selectedExps = experienceStore.experiences.filter(e =>
    selectedExpIds.value.includes(e.id),
  )
  return selectedExps.some(exp =>
    meta.sourceRooms.some(room => hasRoomData(exp, room)),
  )
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadError.value = null
  uploading.value = true
  try {
    resumeText.value = await parseResumeFile(file)
  } catch (err) {
    uploadError.value = err instanceof FileParseError ? err.message : '文件解析失败'
    resumeText.value = null
  } finally {
    uploading.value = false
  }
}

async function startGenerate() {
  if (selectedModules.value.length === 0) return
  step.value = 3
  const experiences = experienceStore.experiences.filter(e =>
    selectedExpIds.value.includes(e.id),
  )
  await aiStore.generateModules(selectedModules.value, experiences)
}

// ---- Step 3: 生成结果 ----

async function handleRegenerate(type: ModuleType) {
  const experiences = experienceStore.experiences.filter(e =>
    selectedExpIds.value.includes(e.id),
  )
  await aiStore.regenerateModule(type, experiences)
}

function goToPreview() {
  router.push('/resume/preview')
}
</script>

<template>
  <div class="ai-generate">
    <header class="ai-header">
      <button class="btn-back" @click="step === 1 ? router.push('/') : step--">
        ←
      </button>
      <span class="ai-title">
        AI 生成简历 ·
        {{ step === 1 ? '选择经历' : step === 2 ? '选择模块' : '生成结果' }}
      </span>
      <span class="step-indicator">{{ step }}/3</span>
    </header>

    <!-- Step 1: 选经历 -->
    <div v-if="step === 1" class="step-content">
      <div v-if="!hasExperiences" class="empty-state">
        <p>还没有经历数据，请先通过 QA 流程创建经历。</p>
        <button class="btn" @click="router.push('/qa')">去创建经历</button>
      </div>
      <template v-else>
        <p class="step-hint">选择要用作 AI 生成素材的经历（默认全选）</p>
        <div class="exp-list">
          <label
            v-for="exp in experienceStore.experiences"
            :key="exp.id"
            class="exp-item"
          >
            <input
              type="checkbox"
              :checked="selectedExpIds.includes(exp.id)"
              @change="toggleExp(exp.id)"
            />
            <div class="exp-info">
              <span class="exp-title">{{ exp.title }}</span>
              <span v-if="exp.direction" class="exp-dir">{{ exp.direction }}</span>
            </div>
          </label>
        </div>
        <button
          class="btn btn-primary"
          :disabled="selectedExpIds.length === 0"
          @click="toStep2"
        >
          下一步 · 选择模块
        </button>
      </template>
    </div>

    <!-- Step 2: 选模块 + 上传简历 -->
    <div v-if="step === 2" class="step-content">
      <p class="step-hint">勾选需要 AI 生成的模块，有数据支撑的模块已自动推荐</p>
      <div class="module-list">
        <label
          v-for="meta in MODULE_LIST"
          :key="meta.type"
          class="module-item"
          :class="{ recommended: moduleHasData(meta.type) }"
        >
          <input
            type="checkbox"
            :checked="selectedModules.includes(meta.type)"
            @change="toggleModule(meta.type)"
          />
          <div class="module-info">
            <span class="module-label">{{ meta.label }}</span>
            <span class="module-desc">{{ meta.description }}</span>
            <span v-if="!moduleHasData(meta.type)" class="module-warn">
              缺少对话数据，生成质量可能较低
            </span>
          </div>
        </label>
      </div>

      <div class="upload-section">
        <p class="section-label">上传已有简历（可选，提升生成质量）</p>
        <label class="upload-area">
          <input
            type="file"
            accept=".pdf,.docx"
            style="display: none"
            @change="handleFileUpload"
          />
          <span v-if="uploading">解析中...</span>
          <span v-else-if="resumeText">已解析 {{ resumeText.length }} 字 · 点击更换</span>
          <span v-else>点击或拖拽上传 PDF / Word</span>
        </label>
        <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
      </div>

      <button
        class="btn btn-primary"
        :disabled="selectedModules.length === 0"
        @click="startGenerate"
      >
        开始生成（{{ selectedModules.length }} 个模块）
      </button>
    </div>

    <!-- Step 3: 生成结果 -->
    <div v-if="step === 3" class="step-content">
      <div class="result-list">
        <div
          v-for="mod in aiStore.modules"
          :key="mod.type"
          class="result-item"
          :class="mod.status"
        >
          <div class="result-header">
            <span class="result-label">
              {{ MODULE_LIST.find(m => m.type === mod.type)?.label }}
            </span>
            <span class="result-status">
              <template v-if="mod.status === 'pending'">等待中</template>
              <template v-else-if="mod.status === 'generating'">生成中...</template>
              <template v-else-if="mod.status === 'done'">已完成</template>
              <template v-else-if="mod.status === 'error'">失败</template>
            </span>
          </div>

          <div v-if="mod.status === 'generating'" class="loading-bar">
            <div class="loading-fill"></div>
          </div>

          <div v-if="mod.status === 'done' && mod.content" class="result-preview">
            <pre class="result-json">{{ JSON.stringify(mod.content, null, 2) }}</pre>
          </div>

          <div v-if="mod.status === 'error'" class="result-error">
            {{ mod.error }}
          </div>

          <div class="result-actions">
            <button
              v-if="mod.status === 'done'"
              class="btn btn-sm"
              @click="handleRegenerate(mod.type)"
            >
              重新生成
            </button>
            <button
              v-if="mod.status === 'error'"
              class="btn btn-sm"
              @click="handleRegenerate(mod.type)"
            >
              重试
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="aiStore.modules.some(m => m.status === 'done')"
        class="btn btn-primary"
        @click="goToPreview"
      >
        预览并下载
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-generate {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 100vh;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.btn-back {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.ai-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.step-indicator {
  font-size: 14px;
  color: #888;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-hint {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* ---- Step 1: 经历列表 ---- */
.exp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exp-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.exp-item:hover {
  border-color: #409eff;
}

.exp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-title {
  font-weight: 500;
}

.exp-dir {
  font-size: 13px;
  color: #888;
}

/* ---- Step 2: 模块列表 ---- */
.module-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.module-item.recommended {
  border-color: #67c23a;
  background: #f0f9eb;
}

.module-item:hover {
  border-color: #409eff;
}

.module-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.module-label {
  font-weight: 500;
}

.module-desc {
  font-size: 13px;
  color: #666;
}

.module-warn {
  font-size: 12px;
  color: #e6a23c;
  margin-top: 2px;
}

/* ---- 上传区域 ---- */
.upload-section {
  margin-top: 8px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #888;
  transition: border-color 0.15s;
}

.upload-area:hover {
  border-color: #409eff;
  color: #409eff;
}

.upload-error {
  font-size: 13px;
  color: #f56c6c;
  margin: 8px 0 0;
}

/* ---- Step 3: 结果列表 ---- */
.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.result-item.done {
  border-color: #67c23a;
}

.result-item.error {
  border-color: #f56c6c;
}

.result-item.generating {
  border-color: #409eff;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-label {
  font-weight: 600;
}

.result-status {
  font-size: 13px;
  color: #888;
}

.result-item.done .result-status {
  color: #67c23a;
}

.result-item.error .result-status {
  color: #f56c6c;
}

.loading-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
}

.loading-fill {
  height: 100%;
  width: 40%;
  background: #409eff;
  border-radius: 2px;
  animation: slide 1.2s ease-in-out infinite;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

.result-preview {
  margin: 8px 0;
}

.result-json {
  font-size: 12px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
}

.result-error {
  font-size: 13px;
  color: #f56c6c;
  margin: 8px 0;
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* ---- 按钮 ---- */
.btn {
  padding: 10px 20px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}

.btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.btn-primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.btn-primary:hover {
  background: #337ecc;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #888;
}

.empty-state .btn {
  margin-top: 16px;
}
</style>
