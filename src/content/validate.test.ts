import { describe, expect, it } from 'vitest'
import type { Content, Project } from './types'
import { validateContent } from './validate'

const project = (id: string, overrides: Partial<Project> = {}): Project => ({
  id,
  title: `Project ${id}`,
  summary: 'A summary.',
  tags: ['C'],
  role: 'Author',
  repoUrl: `https://github.com/example/${id}`,
  ...overrides,
})

const valid = (): Content => ({
  about: {
    name: 'Test Person',
    headline: 'Embedded engineer',
    bio: 'Bio.',
    links: {
      cv: 'cv.pdf',
      github: 'https://github.com/example',
      linkedin: 'https://linkedin.com/in/example',
    },
  },
  skills: [{ id: 'languages', label: 'Languages', items: ['C'] }],
  projects: [project('a'), project('b'), project('c')],
  contact: { email: 'me@example.com' },
})

describe('validateContent', () => {
  it('accepts valid content', () => {
    expect(validateContent(valid())).toEqual([])
  })

  it('rejects fewer than 3 projects', () => {
    const c = valid()
    c.projects = c.projects.slice(0, 2)
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('projects')
  })

  it('rejects more than 6 projects', () => {
    const c = valid()
    c.projects = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => project(id))
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('projects')
  })

  it('rejects duplicate project ids', () => {
    const c = valid()
    c.projects[1] = project('a')
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('id')
  })

  it('rejects non-https repoUrl', () => {
    const c = valid()
    c.projects[0] = project('a', { repoUrl: 'http://github.com/example/a' })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('repoUrl')
  })

  it('rejects an empty skill group', () => {
    const c = valid()
    c.skills = [{ id: 'languages', label: 'Languages', items: [] }]
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('skills')
  })

  it('rejects an email without @', () => {
    const c = valid()
    c.contact.email = 'not-an-email'
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('email')
  })

  it('accepts a project with no image', () => {
    const c = valid()
    expect(c.projects[0].image).toBeUndefined()
    expect(validateContent(c)).toEqual([])
  })
})
