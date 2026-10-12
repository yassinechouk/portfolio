import { SECTION_ORDER, type SectionId } from '../../state/tourStore'

/**
 * Package opacity at each section stop: solid at hero, a slight fade at about (hinting at the
 * inside), nearly see-through at skills so the die shows, solid again from experience on.
 */
export const PACKAGE_OPACITY: Record<SectionId, number> = {
  hero: 1,
  about: 0.88,
  skills: 0.1,
  experience: 1,
  projects: 1,
  contact: 1,
}

/** Piecewise-linear opacity over the section stops at i / (n - 1); non-finite progress gives 1. */
export function packageOpacity(progress: number): number {
  if (!Number.isFinite(progress)) return 1
  const last = SECTION_ORDER.length - 1
  const f = Math.min(1, Math.max(0, progress)) * last
  const i = Math.min(Math.floor(f), last - 1)
  const a = PACKAGE_OPACITY[SECTION_ORDER[i]]
  const b = PACKAGE_OPACITY[SECTION_ORDER[i + 1]]
  return a + (b - a) * (f - i)
}
