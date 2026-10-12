export type Project = {
  id: string
  title: string
  summary: string
  tags: string[]
  role: string
  image?: string
  demoUrl?: string
  repoUrl: string
}

export type SkillGroup = {
  id: 'languages' | 'platforms' | 'protocols' | 'tools'
  label: string
  items: string[]
}

export type Content = {
  about: {
    name: string
    headline: string
    bio: string
    links: { cv: string; github: string; linkedin: string }
  }
  skills: SkillGroup[]
  projects: Project[]
  contact: { email: string }
}
