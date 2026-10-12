import type { Content } from './types'

const MIN_PROJECTS = 3
const MAX_PROJECTS = 6

/** Returns a list of human-readable problems; an empty array means valid. */
export function validateContent(c: Content): string[] {
  const errors: string[] = []

  if (c.projects.length < MIN_PROJECTS || c.projects.length > MAX_PROJECTS) {
    errors.push(`projects: expected ${MIN_PROJECTS}-${MAX_PROJECTS}, got ${c.projects.length}`)
  }

  const seen = new Set<string>()
  for (const p of c.projects) {
    if (seen.has(p.id)) errors.push(`projects: duplicate id "${p.id}"`)
    seen.add(p.id)
    if (!p.repoUrl.startsWith('https://')) {
      errors.push(`projects["${p.id}"].repoUrl: must start with https://`)
    }
  }

  for (const g of c.skills) {
    if (g.items.length === 0) errors.push(`skills["${g.id}"]: group has no items`)
  }

  if (!c.contact.email.includes('@')) {
    errors.push('contact.email: must contain @')
  }

  return errors
}
