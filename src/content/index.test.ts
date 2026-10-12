import { describe, expect, it } from 'vitest'
import { content } from './index'
import { validateContent } from './validate'

describe('shipped content', () => {
  it('passes validation', () => {
    expect(validateContent(content)).toEqual([])
  })

  it('has 3 to 6 projects and the four skill groups exactly once', () => {
    expect(content.projects.length).toBeGreaterThanOrEqual(3)
    expect(content.projects.length).toBeLessThanOrEqual(6)
    for (const id of ['languages', 'platforms', 'protocols', 'tools']) {
      expect(content.skills.filter((s) => s.id === id), id).toHaveLength(1)
    }
  })
})
