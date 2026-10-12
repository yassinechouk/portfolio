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

const cover = { src: 'a.webp', alt: 'alt', caption: 'cap' }

const featured = (id: string, overrides: Partial<Project> = {}): Project =>
  project(id, { featured: true, media: [cover], ...overrides })

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
  projects: [featured('a'), project('b', { metrics: [] }), project('c', { metrics: [] })],
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
    c.projects = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => featured(id))
    c.projects.forEach((p, i) => { if (i > 0) { p.featured = false; p.media = [] } })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('projects')
  })

  it('rejects duplicate project ids', () => {
    const c = valid()
    c.projects[1] = project('a', { metrics: [] })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('id')
  })

  it('rejects non-https repoUrl', () => {
    const c = valid()
    c.projects[0] = featured('a', { repoUrl: 'http://github.com/example/a' })
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

  it('rejects featured project metrics outside 2 to 4', () => {
    for (const metrics of [['one'], ['1', '2', '3', '4', '5']]) {
      const c = valid()
      c.projects[0] = featured('a', { metrics })
      const errors = validateContent(c)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('metrics')
    }
  })

  it('rejects zero featured projects', () => {
    const c = valid()
    c.projects[0] = project('a', { metrics: [] })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('featured')
  })

  it('rejects more than 3 featured', () => {
    const c = valid()
    c.projects = ['a', 'b', 'c', 'd'].map((id) => featured(id))
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('featured')
  })

  it('rejects a featured project without exactly one media', () => {
    for (const media of [[], [cover, cover]]) {
      const c = valid()
      c.projects[0] = featured('a', { media })
      const errors = validateContent(c)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('media')
    }
  })

  it('rejects a featured project with fewer than 2 metrics', () => {
    const c = valid()
    c.projects[0] = featured('a', { metrics: ['one'] })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('metrics')
  })

  it('rejects media on a compact project', () => {
    const c = valid()
    c.projects[1] = project('b', { metrics: [], media: [cover] })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('media')
  })

  it('accepts a compact project with no metrics', () => {
    const c = valid()
    expect(c.projects[1].metrics).toEqual([])
    expect(validateContent(c)).toEqual([])
  })

  it('rejects compact project metrics above 4', () => {
    const c = valid()
    c.projects[1] = project('b', { metrics: ['1', '2', '3', '4', '5'] })
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('metrics')
  })

  it('rejects media with empty alt or caption', () => {
    for (const media of [[{ src: 'a.webp', alt: '', caption: 'cap' }], [{ src: 'a.webp', alt: 'alt', caption: ' ' }]]) {
      const c = valid()
      c.projects[0] = featured('a', { media })
      const errors = validateContent(c)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('media')
    }
  })

  it('accepts a project without a role', () => {
    const c = valid()
    c.projects[1] = project('b', { metrics: [], role: undefined })
    expect(validateContent(c)).toEqual([])
  })

  it('rejects a phone without a plus and digits', () => {
    const c = valid()
    c.contact.phone = '21691995'
    const errors = validateContent(c)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('phone')
  })
})
