import type { Content, SkillGroupId } from './types'

const MIN_PROJECTS = 3
const MAX_PROJECTS = 6
const MIN_METRICS = 2
const MAX_METRICS = 4
const MIN_FEATURED = 1
const MAX_FEATURED = 3
const PHONE = /^\+\d[\d ]{6,}$/
const SKILL_IDS: SkillGroupId[] = ['languages', 'platforms', 'firmware', 'protocols', 'tools', 'testing']

/** Returns a list of human-readable problems; an empty array means valid. */
export function validateContent(c: Content): string[] {
  const errors: string[] = []

  if (c.projects.length < MIN_PROJECTS || c.projects.length > MAX_PROJECTS) {
    errors.push(`projects: expected ${MIN_PROJECTS}-${MAX_PROJECTS}, got ${c.projects.length}`)
  }

  if (c.experience.length < 1) errors.push('experience: expected at least 1 entry')

  const seen = new Set<string>()
  for (const p of c.projects) {
    if (seen.has(p.id)) errors.push(`projects: duplicate id "${p.id}"`)
    seen.add(p.id)
    if (!p.repoUrl.startsWith('https://')) {
      errors.push(`projects["${p.id}"].repoUrl: must start with https://`)
    }
    if (p.featured) {
      if (p.metrics.length < MIN_METRICS || p.metrics.length > MAX_METRICS) {
        errors.push(`projects["${p.id}"].metrics: featured needs ${MIN_METRICS}-${MAX_METRICS}, got ${p.metrics.length}`)
      }
      if (p.media.length !== 1) {
        errors.push(`projects["${p.id}"].media: featured needs exactly 1, got ${p.media.length}`)
      }
    } else {
      if (p.metrics.length > MAX_METRICS) {
        errors.push(`projects["${p.id}"].metrics: at most ${MAX_METRICS}, got ${p.metrics.length}`)
      }
      if (p.media.length > 0) {
        errors.push(`projects["${p.id}"].media: a compact project has none, got ${p.media.length}`)
      }
    }
    p.media.forEach((m, i) => {
      if (m.alt.trim() === '' || m.caption.trim() === '') {
        errors.push(`projects["${p.id}"].media[${i}]: alt and caption must be non-empty`)
      }
    })
  }

  const featuredCount = c.projects.filter((p) => p.featured).length
  if (featuredCount < MIN_FEATURED || featuredCount > MAX_FEATURED) {
    errors.push(`projects: expected ${MIN_FEATURED}-${MAX_FEATURED} featured, got ${featuredCount}`)
  }

  for (const g of c.skills) {
    if (g.items.length === 0) errors.push(`skills["${g.id}"]: group has no items`)
  }
  for (const id of SKILL_IDS) {
    const n = c.skills.filter((g) => g.id === id).length
    if (n !== 1) errors.push(`skills: id "${id}" must appear exactly once, found ${n}`)
  }

  if (!c.contact.email.includes('@')) {
    errors.push('contact.email: must contain @')
  }
  if (!PHONE.test(c.contact.phone)) {
    errors.push('contact.phone: must start with + followed by digits')
  }

  return errors
}
