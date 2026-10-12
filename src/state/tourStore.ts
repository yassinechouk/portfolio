import { useSyncExternalStore } from 'react'
import type { SkillGroup } from '../content/types'

export type SectionId = 'hero' | 'about' | 'skills' | 'experience' | 'projects' | 'contact'

export const SECTION_ORDER: SectionId[] = ['hero', 'about', 'skills', 'experience', 'projects', 'contact']

export type Tour = {
  progress: number
  activeSection: SectionId
  activeProjectId: string | null
  activeSkillGroup: SkillGroup['id'] | null
}

let state: Tour = {
  progress: 0,
  activeSection: 'hero',
  activeProjectId: null,
  activeSkillGroup: null,
}

const listeners = new Set<() => void>()

export function getTour(): Tour {
  return state
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setTour(patch: Partial<Tour>): void {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function useTour<T>(select: (t: Tour) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(state),
  )
}
