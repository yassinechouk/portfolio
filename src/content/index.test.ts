import { describe, expect, it } from 'vitest'
import { content } from './index'
import { validateContent } from './validate'

describe('shipped content', () => {
  it('passes validation', () => {
    expect(validateContent(content)).toEqual([])
  })

  it('has 3 projects and 4 skill groups', () => {
    expect(content.projects).toHaveLength(3)
    expect(content.skills.map((s) => s.id)).toEqual(['languages', 'platforms', 'protocols', 'tools'])
  })
})
