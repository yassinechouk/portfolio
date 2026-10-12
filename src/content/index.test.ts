import { describe, expect, it } from 'vitest'
import { content } from './index'
import { validateContent } from './validate'

describe('shipped content', () => {
  it('validates', () => {
    expect(validateContent(content)).toEqual([])
  })

  it('has 3 to 6 projects and at least 1 experience', () => {
    expect(content.projects.length).toBeGreaterThanOrEqual(3)
    expect(content.projects.length).toBeLessThanOrEqual(6)
    expect(content.experience.length).toBeGreaterThanOrEqual(1)
  })

  it('has the six skill ids exactly once', () => {
    for (const id of ['languages', 'platforms', 'firmware', 'protocols', 'tools', 'testing']) {
      expect(content.skills.filter((s) => s.id === id), id).toHaveLength(1)
    }
    expect(content.skills).toHaveLength(6)
  })

  it('uses the real contact values', () => {
    expect(content.contact.email).toBe('yassine.chouk@insat.ucar.tn')
    expect(content.contact.phone).toBe('+216 21 691 995')
    expect(content.about.links.linkedin).toBe('https://www.linkedin.com/in/yassine-chouk-8ba806312/')
    expect(content.about.links.github).toBe('https://github.com/yassinechouk')
  })
})
