export type Media = { src: string; alt: string; caption: string }

export type Project = {
  id: string
  title: string
  summary: string
  tags: string[]
  role?: string
  featured?: boolean
  metrics: string[]
  media: Media[]
  demoUrl?: string
  repoUrl: string
}

export type SkillGroupId = 'languages' | 'platforms' | 'firmware' | 'protocols' | 'tools' | 'testing'

export type SkillGroup = {
  id: SkillGroupId
  label: string
  items: string[]
}

export type ExperienceItem = {
  id: string
  role: string
  organization: string
  place: string
  period: string
  outcomes: string[]
  tags: string[]
  repoUrl?: string
  image?: Media
}

export type Content = {
  about: {
    name: string
    role: string
    affiliation: string
    availability: string
    headline: string
    tagline: string
    lead: string
    blocks: { title: string; text: string }[]
    highlights: string[]
    education: string
    spokenLanguages: string[]
    photo?: string
    links: { cv: string; github: string; linkedin: string }
  }
  skills: SkillGroup[]
  experience: ExperienceItem[]
  projects: Project[]
  contact: { email: string; phone: string; form: { accessKey: string } }
}
