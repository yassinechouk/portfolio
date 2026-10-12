import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { content } from '../content'
import type { Project } from '../content/types'
import { getTour, setTour } from '../state/tourStore'
import Experience from './Experience'
import CompactProject from './CompactProject'
import FeaturedProject from './FeaturedProject'

beforeEach(() => {
  act(() => {
    setTour({ progress: 0, activeSection: 'hero', activeProjectId: null, activeSkillGroup: null })
  })
})

describe('sections', () => {
  it('renders all six sections with ids hero, about, skills, experience, projects, contact', () => {
    const { container } = render(<App />)
    const ids = Array.from(container.querySelectorAll('main > section')).map((el) => el.id)
    expect(ids).toEqual(['hero', 'about', 'skills', 'experience', 'projects', 'contact'])
    for (const id of ids) {
      const el = container.querySelector(`main section#${id}`)
      expect(el, id).not.toBeNull()
    }
  })

  it('nav marks the active section with aria-current', () => {
    render(<App />)
    const nav = screen.getByRole('navigation')
    expect(nav.querySelector('[aria-current]')).toHaveAttribute('href', '#hero')
    act(() => {
      setTour({ activeSection: 'skills' })
    })
    const current = nav.querySelectorAll('[aria-current]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAttribute('href', '#skills')
    expect(current[0]).toHaveAttribute('aria-current', 'location')
  })

  it('the CV link href starts with import.meta.env.BASE_URL', () => {
    render(<App />)
    const cv = screen.getAllByRole('link', { name: /cv/i })
    expect(cv).toHaveLength(2) // Hero and Contact
    for (const a of cv) {
      expect(a.getAttribute('href')).toBe(import.meta.env.BASE_URL + content.about.links.cv)
    }
  })

  it('contact shows a mailto link', () => {
    const { container } = render(<App />)
    const contact = container.querySelector('section#contact') as HTMLElement
    expect(within(contact).getByRole('link', { name: content.contact.email })).toHaveAttribute(
      'href',
      `mailto:${content.contact.email}`,
    )
  })

  it('Contact shows the tel link, email, LinkedIn, GitHub and CV link', () => {
    const { container } = render(<App />)
    const contact = container.querySelector('section#contact') as HTMLElement
    const c = within(contact)
    expect(c.getByRole('link', { name: content.contact.phone })).toHaveAttribute('href', 'tel:+21621691995')
    expect(c.getByRole('link', { name: content.contact.email })).toBeInTheDocument()
    expect(c.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', content.about.links.linkedin)
    expect(c.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', content.about.links.github)
    expect(c.getByRole('link', { name: /download cv/i })).toHaveAttribute(
      'href',
      import.meta.env.BASE_URL + content.about.links.cv,
    )
  })

  it('clicking a skill group sets activeSkillGroup', () => {
    render(<App />)
    const group = content.skills[2]
    fireEvent.click(screen.getByRole('button', { name: new RegExp(group.label) }))
    expect(getTour().activeSkillGroup).toBe(group.id)
  })
})

describe('experience', () => {
  it('Experience renders both internships newest first with outcomes', () => {
    const { container } = render(<App />)
    const section = container.querySelector('section#experience') as HTMLElement
    expect(within(section).getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
    const timeline = section.querySelector('ol')!
    const items = Array.from(timeline.children) as HTMLElement[]
    expect(items).toHaveLength(content.experience.length)
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Qehna LAB (ENIT), Tunis')
    expect(items[1]).toHaveTextContent('Sagemcom, Ezzahra')
    content.experience.forEach((job, i) => {
      const card = within(items[i])
      expect(card.getByRole('heading', { level: 3, name: job.role })).toBeInTheDocument()
      expect(card.getByText(job.period)).toBeInTheDocument()
      for (const outcome of job.outcomes) {
        expect(card.getByText(outcome).tagName).toBe('LI')
      }
      for (const tag of job.tags) {
        expect(card.getByText(tag)).toBeInTheDocument()
      }
      expect(card.getByRole('link', { name: /repository/i })).toHaveAttribute('href', job.repoUrl)
    })
  })

  it('the Qehna LAB card shows no picture', () => {
    const { container } = render(<App />)
    const section = container.querySelector('section#experience') as HTMLElement
    expect(content.experience[0].image).toBeUndefined()
    expect(section.querySelector('img')).toBeNull()
  })

  it('omits the repo link and image when absent', () => {
    const bare = { ...content.experience[0], repoUrl: undefined, image: undefined }
    const { container } = render(<Experience items={[bare]} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.queryByRole('link', { name: /repository/i })).toBeNull()
  })

  it('shows an image with its alt text when present', () => {
    const withImage = {
      ...content.experience[0],
      image: { src: 'experience/scope.jpg', alt: 'Scope capture', caption: 'Dead-time' },
    }
    render(<Experience items={[withImage]} />)
    const img = screen.getByRole('img', { name: 'Scope capture' })
    expect(img).toHaveAttribute('src', import.meta.env.BASE_URL + 'experience/scope.jpg')
  })
})

describe('nav', () => {
  it('Nav lists six links including Experience', () => {
    render(<App />)
    const links = within(screen.getByRole('navigation')).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '#hero',
      '#about',
      '#skills',
      '#experience',
      '#projects',
      '#contact',
    ])
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '#experience')
  })
})

describe('project tiers', () => {
  const featuredProjects = content.projects.filter((p) => p.featured)
  const compactProjects = content.projects.filter((p) => !p.featured)
  const card = (title: string) => screen.getByRole('heading', { name: title }).closest('article') as HTMLElement

  it('keeps the four projects in order, two featured then two compact', () => {
    expect(content.projects.map((p) => p.id)).toEqual(['freertos-inspector', 'ota-bootloader', 'trackify', 'aqua-genius'])
    expect(featuredProjects.map((p) => p.id)).toEqual(['freertos-inspector', 'ota-bootloader'])
    expect(compactProjects.map((p) => p.id)).toEqual(['trackify', 'aqua-genius'])
  })

  it('featured cards show title, description, metrics, tags, role, one picture and a repository link', () => {
    render(<App />)
    for (const p of featuredProjects) {
      const c = within(card(p.title))
      expect(c.getByText(p.summary)).toBeInTheDocument()
      for (const metric of p.metrics) expect(c.getByText(metric)).toBeInTheDocument()
      for (const tag of p.tags) expect(c.getByText(tag)).toBeInTheDocument()
      expect(c.getByText(`Role:`)).toBeInTheDocument()
      expect(c.getByText(p.role!)).toBeInTheDocument()
      const imgs = c.getAllByRole('img')
      expect(imgs).toHaveLength(1)
      expect(imgs[0].getAttribute('src')).toBe(import.meta.env.BASE_URL + p.media[0].src)
      expect(c.getByRole('link', { name: `${p.title} repository` })).toHaveAttribute('href', p.repoUrl)
    }
  })

  it('compact rows show title, one line, three tags and a link, and no picture, metrics or role', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'More projects' })).toBeInTheDocument()
    for (const p of compactProjects) {
      const el = card(p.title)
      const c = within(el)
      expect(c.getByText(p.summary)).toBeInTheDocument()
      expect(p.tags).toHaveLength(3)
      for (const tag of p.tags) expect(c.getByText(tag)).toBeInTheDocument()
      expect(c.getByRole('link', { name: `${p.title} repository` })).toHaveAttribute('href', p.repoUrl)
      expect(el.querySelector('img')).toBeNull()
      expect(el.querySelector('.proof-chips')).toBeNull()
      expect(el).not.toHaveTextContent(/Role:/)
    }
  })

  it('shows no detail panel or gallery any more', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.project-detail, .gallery')).toBeNull()
    expect(screen.queryByRole('region', { name: /project details/i })).toBeNull()
  })

  it('the first project is auto-selected on entering the section and only it is aria-current', () => {
    const { container } = render(<App />)
    act(() => {
      setTour({ activeSection: 'projects' })
    })
    const current = container.querySelectorAll('#projects [aria-current]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAttribute('aria-current', 'true')
    expect(current[0]).toBe(card(content.projects[0].title))
  })

  it('no item uses aria-pressed', () => {
    const { container } = render(<App />)
    expect(container.querySelector('#projects [aria-pressed]')).toBeNull()
  })

  it('clicking a compact row selects it', () => {
    render(<App />)
    act(() => {
      setTour({ activeSection: 'projects' })
    })
    fireEvent.click(within(card(content.projects[3].title)).getByText(content.projects[3].summary))
    expect(getTour().activeProjectId).toBe(content.projects[3].id)
    expect(card(content.projects[3].title)).toHaveAttribute('aria-current', 'true')
    expect(card(content.projects[0].title)).not.toHaveAttribute('aria-current')
  })

  it('focusing a link inside an item selects it, featured or compact', () => {
    render(<App />)
    for (const i of [1, 2]) {
      const link = within(card(content.projects[i].title)).getByRole('link', { name: /repository/i })
      act(() => link.focus())
      expect(getTour().activeProjectId).toBe(content.projects[i].id)
    }
  })

  it('clicking a featured card selects it', () => {
    render(<App />)
    fireEvent.click(within(card(content.projects[1].title)).getByText(content.projects[1].summary))
    expect(getTour().activeProjectId).toBe(content.projects[1].id)
  })
})

describe('projects follow scroll', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults activeProjectId to the first project when the projects section becomes active', () => {
    render(<App />)
    expect(getTour().activeProjectId).toBeNull()
    act(() => {
      setTour({ activeSection: 'projects' })
    })
    expect(getTour().activeProjectId).toBe(content.projects[0].id)
  })

  it('does not override an existing selection when the projects section becomes active', () => {
    render(<App />)
    act(() => {
      setTour({ activeProjectId: content.projects[1].id, activeSection: 'projects' })
    })
    expect(getTour().activeProjectId).toBe(content.projects[1].id)
  })

  it('sets activeProjectId to the item whose centre is nearest the viewport centre', () => {
    const observed: Element[] = []
    const targets = new Map<Element, IntersectionObserverCallback>()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        cb: IntersectionObserverCallback
        constructor(cb: IntersectionObserverCallback) {
          this.cb = cb
        }
        observe = (el: Element) => targets.set(el, this.cb)
        unobserve = vi.fn()
        disconnect = vi.fn()
      },
    )
    render(<App />)
    act(() => {
      setTour({ activeSection: 'projects' })
    })
    observed.push(...[...targets.keys()].filter((el) => el.closest('#projects')))
    expect(observed).toHaveLength(content.projects.length)
    // observed in project order, whatever the DOM order of the two tiers
    expect(observed.map((el) => el.querySelector('h3, h4')?.textContent)).toEqual(content.projects.map((p) => p.title))
    const callback = targets.get(observed[0])!
    const mid = window.innerHeight / 2
    const place = (el: Element, top: number) => {
      el.getBoundingClientRect = () => ({ top, height: 100, bottom: top + 100 }) as DOMRect
    }
    const entry = (target: Element, top: number) => {
      place(target, top)
      return { target, isIntersecting: true } as unknown as IntersectionObserverEntry
    }
    act(() => {
      callback(
        [entry(observed[0], mid - 500), entry(observed[1], mid - 50), entry(observed[2], mid + 400)],
        {} as IntersectionObserver,
      )
    })
    expect(getTour().activeProjectId).toBe(content.projects[1].id)
  })
})

describe('featured project picture and lightbox', () => {
  const project: Project = {
    ...content.projects[0],
    media: [{ src: 'img/x.webp', alt: 'X alt', caption: 'X caption' }],
  }
  const renderCard = () => render(<FeaturedProject project={project} active={false} onSelect={() => {}} />)
  const opener = () => screen.getByRole('button', { name: 'Enlarge: X caption' })

  it('the picture src is built from BASE_URL and reserves its space', () => {
    renderCard()
    expect(screen.getByRole('img', { name: 'X alt' }).getAttribute('src')).toBe(import.meta.env.BASE_URL + 'img/x.webp')
  })

  it('a compact project renders no img', () => {
    const { container } = render(
      <CompactProject project={{ ...project, featured: false, media: [], metrics: [] }} active={false} onSelect={() => {}} />,
    )
    expect(container.querySelector('img')).toBeNull()
  })

  it('clicking the picture opens the lightbox dialog with the caption', () => {
    renderCard()
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(opener())
    const dialog = screen.getByRole('dialog', { name: 'X caption' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByRole('button', { name: /close/i })).toHaveFocus()
  })

  it('Escape closes the lightbox and returns focus to the opener', () => {
    renderCard()
    opener().focus()
    fireEvent.click(opener())
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener()).toHaveFocus()
  })

  it('the close button and a backdrop click close it', () => {
    renderCard()
    fireEvent.click(opener())
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(opener())
    fireEvent.click(screen.getByTestId('lightbox-backdrop'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Escape closes the lightbox after focus moved to body', () => {
    renderCard()
    fireEvent.click(opener())
    ;(document.activeElement as HTMLElement).blur()
    expect(document.body).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('the lightbox is portalled under document.body, outside the card', () => {
    const { container } = renderCard()
    fireEvent.click(opener())
    const dialog = screen.getByRole('dialog')
    expect(container.contains(dialog)).toBe(false)
    expect(dialog.closest('article')).toBeNull()
    expect(document.body.contains(dialog)).toBe(true)
  })

  it('body overflow is locked while open and restored after close and after unmount', () => {
    document.body.style.overflow = 'scroll'
    const { unmount } = renderCard()
    fireEvent.click(opener())
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.body.style.overflow).toBe('scroll')
    fireEvent.click(opener())
    unmount()
    expect(document.body.style.overflow).toBe('scroll')
    expect(screen.queryByRole('dialog')).toBeNull()
    document.body.style.overflow = ''
  })

  it('focus falls back to the card heading when the opener has been removed', () => {
    renderCard()
    opener().focus()
    fireEvent.click(opener())
    opener().remove()
    fireEvent.keyDown(document, { key: 'Escape' })
    const heading = screen.getByRole('heading', { name: project.title })
    expect(heading).toHaveAttribute('tabindex', '-1')
    expect(document.activeElement).toBe(heading)
  })

  it('opens from the featured picture button inside the app', () => {
    render(<App />)
    const first = content.projects[0]
    fireEvent.click(screen.getByRole('button', { name: `Enlarge: ${first.media[0].caption}` }))
    expect(screen.getByRole('dialog', { name: first.media[0].caption })).toBeInTheDocument()
  })
})
