import type { Experience } from '../types/experience'

const API_BASE = '/api/experiences'
const EXPERIENCES_KEY = 'resume_app__experiences'

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

function getLocal(): Experience[] {
  return safeParse<Experience[]>(localStorage.getItem(EXPERIENCES_KEY), [])
}

function saveLocal(experiences: Experience[]): void {
  localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(experiences))
}

async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export async function getExperiences(): Promise<Experience[]> {
  try {
    const res = await fetch(API_BASE)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    saveLocal(data)
    return data
  } catch {
    return getLocal()
  }
}

export async function addExperience(experience: Experience): Promise<Experience> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: experience.title,
        direction: experience.direction,
        answers: experience.answers,
      }),
    })
    if (!res.ok) throw new Error('API error')
    const created = await res.json()
    const local = getLocal()
    local.unshift(created)
    saveLocal(local)
    return created
  } catch {
    const local = getLocal()
    local.unshift(experience)
    saveLocal(local)
    return experience
  }
}

export async function getExperienceById(id: string): Promise<Experience | undefined> {
  try {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    return getLocal().find(e => e.id === id)
  }
}

export async function deleteExperience(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  } catch {
    // fallback: just update localStorage
  }
  const local = getLocal().filter(e => e.id !== id)
  saveLocal(local)
}

export async function updateExperience(id: string, partial: Partial<Experience>): Promise<void> {
  try {
    await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    })
  } catch {
    // fallback: just update localStorage
  }
  const local = getLocal()
  const index = local.findIndex(e => e.id === id)
  if (index !== -1) {
    local[index] = { ...local[index], ...partial, updatedAt: new Date().toISOString() }
    saveLocal(local)
  }
}
