import { defineStore } from 'pinia'
import type { ModuleType, ModuleState, ModuleContent } from '../types/aiGenerate'
import { MODULE_LIST } from '../types/aiGenerate'
import { buildContextTexts } from '../utils/contextBuilder'
import type { CabinExperience } from '../types/cabin'

const API_BASE = 'http://localhost:8000'

export const useAiGenerateStore = defineStore('aiGenerate', {
  state: () => ({
    selectedExperienceIds: [] as string[],
    modules: MODULE_LIST.map(m => ({
      type: m.type,
      status: 'pending' as const,
      content: null,
      error: undefined,
    })) as ModuleState[],
    generating: false,
    /** AbortController，用于取消进行中的 SSE 请求 */
    _abortController: null as AbortController | null,
  }),

  getters: {
    getModule: (state) => (type: ModuleType): ModuleState | undefined =>
      state.modules.find(m => m.type === type),

    hasHistory: (state): boolean =>
      state.modules.some(m => m.status === 'done' && m.content !== null),
  },

  actions: {
    setSelectedExperiences(ids: string[]) {
      this.selectedExperienceIds = ids
    },

    async loadHistory() {
      try {
        const res = await fetch(`${API_BASE}/api/ai-results`)
        if (!res.ok) return
        const results: Array<{ moduleType: ModuleType; content: ModuleContent }> = await res.json()
        for (const r of results) {
          const mod = this.modules.find(m => m.type === r.moduleType)
          if (mod) {
            mod.status = 'done'
            mod.content = r.content
            mod.error = undefined
          }
        }
      } catch {
        // 静默失败，历史加载不影响主流程
      }
    },

    async generateModules(
      selectedModuleTypes: ModuleType[],
      experiences: CabinExperience[],
    ) {
      // 取消上一次未完成的请求
      this._abortController?.abort()
      const controller = new AbortController()
      this._abortController = controller

      this.generating = true

      // 标记选中的模块为 generating
      for (const mod of this.modules) {
        if (selectedModuleTypes.includes(mod.type)) {
          mod.status = 'generating'
          mod.content = null
          mod.error = undefined
        }
      }

      // 构建上下文
      const selectedExps = experiences.filter(e =>
        this.selectedExperienceIds.includes(e.id),
      )
      const contextTexts = buildContextTexts(selectedExps)

      try {
        const res = await fetch(`${API_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modules: selectedModuleTypes,
            contextTexts,
            resumeText: null,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: '请求失败' }))
          throw new Error(err.detail || `HTTP ${res.status}`)
        }

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // 按 SSE 事件分割
          const events = buffer.split('\n\n')
          buffer = events.pop()! // 最后一段可能不完整，留到下次

          for (const event of events) {
            this._handleSSEEvent(event)
          }
        }

        // 处理 buffer 中剩余内容
        if (buffer.trim()) {
          this._handleSSEEvent(buffer)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        // 所有正在生成的模块标记为失败
        for (const mod of this.modules) {
          if (mod.status === 'generating') {
            mod.status = 'error'
            mod.error = err.message || '生成失败'
          }
        }
      } finally {
        this.generating = false
        this._abortController = null
      }
    },

    async regenerateModule(moduleType: ModuleType, experiences: CabinExperience[]) {
      await this.generateModules([moduleType], experiences)
    },

    _handleSSEEvent(raw: string) {
      const lines = raw.trim().split('\n')
      let eventType = ''
      let eventData = ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          eventData = line.slice(6)
        }
      }

      if (!eventType || !eventData) return

      try {
        const data = JSON.parse(eventData)

        if (eventType === 'module_done') {
          const mod = this.modules.find(m => m.type === data.module)
          if (mod) {
            mod.status = 'done'
            mod.content = data.content
            mod.error = undefined
          }
        } else if (eventType === 'module_error') {
          const mod = this.modules.find(m => m.type === data.module)
          if (mod) {
            mod.status = 'error'
            mod.error = data.error
          }
        }
      } catch {
        // 解析失败的事件静默跳过
      }
    },

    reset() {
      this._abortController?.abort()
      this.selectedExperienceIds = []
      this.modules = MODULE_LIST.map(m => ({
        type: m.type,
        status: 'pending' as const,
        content: null,
        error: undefined,
      }))
      this.generating = false
    },
  },
})
