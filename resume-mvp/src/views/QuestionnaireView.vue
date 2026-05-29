<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExperienceStore } from '../stores/experience'
import { questions, encourageMessages, categoryLabels } from '../data/questions'

const router = useRouter()
const store = useExperienceStore()

// Flow steps: direction -> quiz -> review -> done
const step = ref<'direction' | 'quiz' | 'review'>('direction')
const selectedDirection = ref('')
const currentQuestion = ref(0)
const answers = ref<Record<number, number[]>>({})
const encourageText = ref('')
const encourageShow = ref(false)

const directions = [
  { id: 'product', icon: '💡', label: '产品经理' },
  { id: 'ops', icon: '⚙️', label: '运营' },
  { id: 'marketing', icon: '📢', label: '市场营销' },
  { id: 'dev', icon: '💻', label: '技术开发' },
  { id: 'data', icon: '📊', label: '数据分析' },
  { id: 'other', icon: '✨', label: '其他岗位' },
]

const currentQ = computed(() => questions[currentQuestion.value])
const isLastQ = computed(() => currentQuestion.value === questions.length - 1)
const canNext = computed(() => {
  const saved = answers.value[currentQuestion.value] || []
  return saved.length > 0
})

function selectDirection(dir: string) {
  selectedDirection.value = dir
}

function startQuiz() {
  if (!selectedDirection.value) return
  step.value = 'quiz'
  currentQuestion.value = 0
  answers.value = {}
}

function toggleOption(qIdx: number, optIdx: number) {
  const q = questions[qIdx]
  if (!answers.value[qIdx]) answers.value[qIdx] = []

  if (q.type === 'multiChoice') {
    const idx = answers.value[qIdx].indexOf(optIdx)
    if (idx > -1) answers.value[qIdx].splice(idx, 1)
    else answers.value[qIdx].push(optIdx)
  } else {
    answers.value[qIdx] = [optIdx]
  }
}

function nextQuestion() {
  if (!canNext.value) return

  if (!isLastQ.value) {
    currentQuestion.value++
    encourageText.value = encourageMessages[currentQuestion.value] || ''
    encourageShow.value = true
    setTimeout(() => { encourageShow.value = false }, 3000)
  } else {
    step.value = 'review'
  }
}

function prevQuestion() {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

// Review
interface ReviewItem {
  text: string
  category: string
  confirmed: boolean
}

const reviewItems = ref<ReviewItem[]>([])

function buildReview() {
  const items: ReviewItem[] = []
  questions.forEach((q, qIdx) => {
    const selected = answers.value[qIdx] || []
    const catLabel = categoryLabels[q.dimension] || q.dimension
    selected.forEach(optIdx => {
      if (q.options && q.options[optIdx]) {
        items.push({
          text: q.options[optIdx].label,
          category: catLabel,
          confirmed: true,
        })
      }
    })
  })
  reviewItems.value = items
}

// Watch for review step
const showReview = computed(() => {
  if (step.value === 'review') {
    buildReview()
    return true
  }
  return false
})

function toggleReviewItem(idx: number) {
  reviewItems.value[idx].confirmed = !reviewItems.value[idx].confirmed
}

const reviewCategories = computed(() => {
  const cats = [...new Set(reviewItems.value.map(i => i.category))]
  return cats.map(cat => ({
    name: cat,
    items: reviewItems.value
      .map((item, idx) => ({ ...item, idx }))
      .filter(item => item.category === cat),
  }))
})

function generateBrainMap() {
  const title = directions.find(d => d.id === selectedDirection.value)?.label || '实习经历'

  store.startNew(title + '实习', selectedDirection.value)
  // Save answers using correct question IDs and option values from BULLET_MAP
  questions.forEach((q, qIdx) => {
    const selectedIndices = answers.value[qIdx] || []
    if (selectedIndices.length === 0) return

    if (q.type === 'multiChoice') {
      const values = selectedIndices.map(i => q.options![i].value)
      store.saveAnswer(q.id, {
        questionId: q.id,
        type: q.type,
        value: values,
        dimension: q.dimension,
      })
    } else {
      const value = q.options![selectedIndices[0]].value
      store.saveAnswer(q.id, {
        questionId: q.id,
        type: q.type,
        value,
        dimension: q.dimension,
      })
    }
  })

  store.finalizeExperience()
  router.push('/warehouse')
}
</script>

<template>
  <div class="flow-screen">
    <!-- Back button -->
    <div class="flow-header">
      <button class="btn-back" @click="step === 'direction' ? router.push('/') : step === 'quiz' && currentQuestion > 0 ? prevQuestion() : step === 'review' ? step = 'quiz' : router.push('/')">
        ←
      </button>
      <span class="flow-title">
        记录经历 · {{ step === 'direction' ? '选择方向' : step === 'quiz' ? '深度梳理' : '确认信息' }}
      </span>
    </div>

    <!-- Step 1: Direction -->
    <div v-if="step === 'direction'" class="flow-body animate-fade-in">
      <h2>你想记录哪方面的经历？</h2>
      <p class="flow-desc">选一个最贴近的岗位方向，我会为你定制专属的问题</p>
      <div class="direction-grid">
        <div
          v-for="dir in directions"
          :key="dir.id"
          class="direction-card"
          :class="{ selected: selectedDirection === dir.id }"
          @click="selectDirection(dir.id)"
        >
          <span class="dir-icon">{{ dir.icon }}</span>
          {{ dir.label }}
        </div>
      </div>
      <button class="btn-primary" :disabled="!selectedDirection" @click="startQuiz">
        开始答题 →
      </button>
    </div>

    <!-- Step 2: Quiz -->
    <div v-else-if="step === 'quiz'" class="flow-body animate-fade-in">
      <div class="quiz-progress">
        <template v-for="(_q, i) in questions" :key="i">
          <div v-if="i > 0" class="line" :class="{ done: i <= currentQuestion }"></div>
          <div class="dot" :class="{ done: i < currentQuestion, current: i === currentQuestion }"></div>
        </template>
      </div>

      <div class="quiz-card">
        <div class="quiz-counter">第 {{ currentQuestion + 1 }} / {{ questions.length }} 题</div>
        <div class="quiz-question">{{ currentQ.text }}</div>
        <div class="quiz-hint" v-if="currentQ.hint">{{ currentQ.hint }}</div>
        <div class="quiz-options">
          <div
            v-for="(opt, optIdx) in currentQ.options"
            :key="opt.value"
            class="quiz-option"
            :class="{ selected: (answers[currentQuestion] || []).includes(optIdx) }"
            @click="toggleOption(currentQuestion, optIdx)"
          >
            <div class="check">
              {{ (answers[currentQuestion] || []).includes(optIdx) ? '✓' : '' }}
            </div>
            {{ opt.label }}
          </div>
        </div>
      </div>

      <div class="quiz-nav">
        <button v-if="currentQuestion > 0" class="btn-secondary" @click="prevQuestion">上一题</button>
        <button class="btn-primary" :disabled="!canNext" @click="nextQuestion" style="margin: 0;">
          {{ isLastQ ? '完成 ✨' : '下一题 →' }}
        </button>
      </div>

      <div class="quiz-encourage" :class="{ show: encourageShow }">{{ encourageText }}</div>
    </div>

    <!-- Step 3: Review -->
    <div v-else-if="showReview" class="flow-body animate-fade-in">
      <h2>确认一下，这是你这段经历的总结</h2>
      <p class="flow-desc">点击标签来确认或移除，这些会成为你的"成长脑图"的枝叶</p>

      <div class="review-content">
        <div v-for="cat in reviewCategories" :key="cat.name" class="review-section">
          <h4>🌿 {{ cat.name }}</h4>
          <div class="review-items">
            <div
              v-for="item in cat.items"
              :key="item.idx"
              class="review-chip"
              :class="{ confirmed: item.confirmed, removed: !item.confirmed }"
              @click="toggleReviewItem(item.idx)"
            >
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>

      <button class="btn-primary" @click="generateBrainMap">
        ✨ 生成我的成长脑图
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

/* Direction grid */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.direction-card {
  padding: 24px 16px;
  background: var(--card-bg);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 15px;
  font-weight: 600;
}

.direction-card:hover,
.direction-card.selected {
  border-color: var(--wood);
  background: var(--wood-light);
  transform: translateY(-2px);
}

.dir-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
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

/* Quiz */
.quiz-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
  justify-content: center;
}

.quiz-progress .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
  transition: var(--transition);
}

.quiz-progress .dot.done {
  background: var(--leaf);
}

.quiz-progress .dot.current {
  background: var(--wood);
  width: 12px;
  height: 12px;
}

.quiz-progress .line {
  width: 40px;
  height: 2px;
  background: var(--border);
}

.quiz-progress .line.done {
  background: var(--leaf);
}

.quiz-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.quiz-counter {
  font-size: 13px;
  color: var(--bark-light);
  margin-bottom: 16px;
  font-style: italic;
}

.quiz-question {
  font-size: 20px;
  font-weight: 700;
  color: var(--bark);
  margin-bottom: 8px;
  line-height: 1.5;
}

.quiz-hint {
  font-size: 13px;
  color: var(--bark-light);
  margin-bottom: 28px;
  font-style: italic;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz-option {
  padding: 16px 20px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  font-size: 15px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.quiz-option:hover {
  border-color: var(--wood);
  background: #FFFBF5;
}

.quiz-option.selected {
  border-color: var(--wood);
  background: var(--wood-light);
  font-weight: 600;
}

.quiz-option .check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  transition: var(--transition);
}

.quiz-option.selected .check {
  background: var(--leaf);
  border-color: var(--leaf);
  color: #fff;
}

.quiz-nav {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
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

.quiz-encourage {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--leaf);
  opacity: 0;
  transition: opacity 0.6s ease;
}

.quiz-encourage.show {
  opacity: 1;
}

/* Review */
.review-content {
  margin: 32px 0;
}

.review-section {
  margin-bottom: 24px;
}

.review-section h4 {
  font-size: 16px;
  color: var(--bark);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.review-chip {
  padding: 10px 18px;
  border: 2px solid var(--border);
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 14px;
  background: #fff;
  user-select: none;
}

.review-chip:hover {
  border-color: var(--wood);
}

.review-chip.confirmed {
  background: var(--leaf-light);
  border-color: var(--leaf);
  color: #fff;
  font-weight: 600;
}

.review-chip.removed {
  opacity: 0.3;
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .flow-header {
    padding: 16px 20px;
  }

  .direction-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
