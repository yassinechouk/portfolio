import { describe, expect, it } from 'vitest'
import type { Content, ExperienceItem, Project, SkillGroup } from './types'
import { validateContent } from './validate'

const project = (id: string, overrides: Partial<Project> = {}): Project => ({
  id,
  title: `Project ${id}`,
  summary: 'A summary.',
  tags: ['C'],
  role: 'Author',
  metrics: ['one', 'two'],
  media: [],
  repoUrl: `https://github.com/example/${id}`,
  ...overrides,
})

const experience = (id: string): ExperienceItem => ({
  id,
  role: 'Intern',
  organization: 'Org',
  place: 'Tunis',
  period: 'Jun 2026',
  outcomes: ['Did a thing.'],
  tags: ['C'],
})

const skills = (): SkillGroup[] =>
  (['languages', 'platforms', 'firmware', 'protocols', 'tools', 'testing'] as const).map((id) => ({
    id,
    label: id,
    items: ['x'],
  }))

const valid = (): Content => ({
  about: {
    name: 'Test Person',
    eyebrow: 'Eyebrow',
    headline: 'Embedded engineer',
    tagline: 'Tagline.',
    paragraphs: ['Bio.'],
    highlights: ['a', 'b', 'c'],
    education: 'INSAT',
    spokenLanguages: ['English'],
    links: {
      cv: 'cv.pdf',
      github: 'https://github.com/example',
      linkedin: 'https://linkedin.com/in/example',
    },
  },
  skills: skills(),
  experience: [experience('e1')],
  projects: [project('a'), project('b'), project('c')],
  contact: { email: 'me@example.com', phone: '+216 21 691 995', form: { accessKey: 'key' } },
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
    c.skills[0].items = []
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

  it('rejects empty experience', () => {
    const c = valid()
    c.experience = []
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('experience')
  })

  it('rejects a skill set that is missing an id', () => {
    const c = valid()
    c.skills = c.skills.filter((g) => g.id !== 'testing')
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('skills')
  })

  it('rejects a duplicated skill id', () => {
    const c = valid()
    c.skills = [...c.skills.slice(0, 5), { ...c.skills[0] }]
    const errors = validateContent(c)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.every((e) => e.includes('skills'))).toBe(true)
  })

  it('rejects project metrics outside 2 to 4', () => {
    for (const metrics of [['one'], ['1', '2', '3', '4', '5']]) {
      const c = valid()
      c.projects[0] = project('a', { metrics })
      const errors = validateContent(c)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('metrics')
    }
  })

  it('rejects more than 4 media', () => {
    const c = valid()
    const m = { src: 'a.png', alt: 'alt', caption: 'cap' }
    c.projects[0] = project('a', { media: [m, m, m, m, m] })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('media')
  })

  it('rejects media with empty alt or caption', () => {
    const c = valid()
    c.projects[0] = project('a', {
      media: [
        { src: 'a.png', alt: '', caption: 'cap' },
        { src: 'b.png', alt: 'alt', caption: '' },
      ],
    })
    const errors = validateContent(c)
    expect(errors).toHaveLength(2)
    for (const e of errors) expect(e).toContain('media')
  })

  it('rejects a phone without a plus and digits', () => {
    const c = valid()
    c.contact.phone = '21691995'
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('phone')
  })

  it('accepts a project with no media', () => {
    const c = valid()
    expect(c.projects[0].media).toEqual([])
    expect(validateContent(c)).toEqual([])
  })
})
