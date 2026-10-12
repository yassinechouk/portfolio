import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { content } from '../content'
import { getTour, setTour } from '../state/tourStore'
import Experience from './Experience'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

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

  it('selecting a project by keyboard sets activeProjectId and shows its detail', () => {
    render(<App />)
    const project = content.projects[1]
    const list = screen.getByRole('list', { name: /projects/i })
    const button = within(list).getAllByRole('button')[1]
    expect(button.tagName).toBe('BUTTON')
    button.focus()
    // Enter/Space on a focused button dispatch a click
    fireEvent.click(button)
    expect(getTour().activeProjectId).toBe(project.id)
    const detail = screen.getByRole('region', { name: /project details/i })
    expect(within(detail).getByText(project.summary)).toBeInTheDocument()
    expect(within(detail).getByText(project.role)).toBeInTheDocument()
    expect(within(detail).getByRole('link', { name: /repo/i })).toHaveAttribute('href', project.repoUrl)
  })

  it('a project without media renders its card without an img element', () => {
    const project = { ...content.projects[0], media: [] }
    const { container } = render(<ProjectCard project={project} selected={false} onSelect={() => {}} />)
    expect(container.querySelector('img')).toBeNull()
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

describe('project images', () => {
  const withImage = {
    ...content.projects[0],
    media: [{ src: 'img/x.png', alt: 'X alt', caption: 'X caption' }],
  }

  it('card image src is built from BASE_URL', () => {
    const { container } = render(<ProjectCard project={withImage} selected={false} onSelect={() => {}} />)
    expect(container.querySelector('img')!.getAttribute('src')).toBe(import.meta.env.BASE_URL + 'img/x.png')
  })

  it('detail image src is built from BASE_URL', () => {
    const { container } = render(<ProjectDetail project={withImage} />)
    expect(container.querySelector('img')!.getAttribute('src')).toBe(import.meta.env.BASE_URL + 'img/x.png')
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

  it('sets activeProjectId to the card whose centre is nearest the viewport centre', () => {
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
    const list = screen.getByRole('list', { name: /projects/i })
    observed.push(...Array.from(list.children).filter((el) => targets.has(el)))
    expect(observed).toHaveLength(content.projects.length)
    const callback = targets.get(observed[0])!
    const mid = window.innerHeight / 2
    const entry = (target: Element, top: number) =>
      ({
        target,
        isIntersecting: true,
        boundingClientRect: { top, height: 100, bottom: top + 100 },
      }) as unknown as IntersectionObserverEntry
    act(() => {
      callback(
        [entry(observed[0], mid - 500), entry(observed[1], mid - 50), entry(observed[2], mid + 400)],
        {} as IntersectionObserver,
      )
    })
    expect(getTour().activeProjectId).toBe(content.projects[1].id)
  })

  it('clicking a card still selects it and opens its detail', () => {
    render(<App />)
    act(() => {
      setTour({ activeSection: 'projects' })
    })
    const list = screen.getByRole('list', { name: /projects/i })
    fireEvent.click(within(list).getAllByRole('button')[2])
    expect(getTour().activeProjectId).toBe(content.projects[2].id)
    expect(screen.getByRole('region', { name: /project details/i })).toBeInTheDocument()
  })
})

describe('project media', () => {
  const media = [
    { src: 'a.webp', alt: 'A alt', caption: 'A caption' },
    { src: 'b.webp', alt: 'B alt', caption: 'B caption' },
  ]
  const project = { ...content.projects[0], metrics: ['m one', 'm two'], media }

  it('ProjectCard shows the cover from media[0] and one chip per metric', () => {
    const { container } = render(<ProjectCard project={project} selected={false} onSelect={() => {}} />)
    const img = container.querySelector('img')!
    expect(img.getAttribute('src')).toBe(import.meta.env.BASE_URL + 'a.webp')
    expect(img).toHaveAttribute('alt', '')
    expect(container.querySelectorAll('.proof-chips > *')).toHaveLength(2)
    expect(screen.getByText('m one')).toBeInTheDocument()
  })

  it('ProjectCard without media renders no img', () => {
    const { container } = render(<ProjectCard project={{ ...project, media: [] }} selected={false} onSelect={() => {}} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('ProjectDetail renders every media item with its caption', () => {
    const { container } = render(<ProjectDetail project={project} />)
    expect(container.querySelectorAll('figure')).toHaveLength(2)
    expect(screen.getByText('A caption').tagName).toBe('FIGCAPTION')
    expect(screen.getByText('B caption')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'A alt' })).toBeInTheDocument()
  })

  it('a project with no media renders no gallery', () => {
    const { container } = render(<ProjectDetail project={{ ...project, media: [] }} />)
    expect(container.querySelector('figure')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('clicking a detail image opens the lightbox dialog with the caption', () => {
    render(<ProjectDetail project={project} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: B caption' }))
    const dialog = screen.getByRole('dialog', { name: 'B caption' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByRole('button', { name: /close/i })).toHaveFocus()
  })

  it('Escape closes the lightbox and returns focus to the opener', () => {
    render(<ProjectDetail project={project} />)
    const opener = screen.getByRole('button', { name: 'Enlarge: A caption' })
    opener.focus()
    fireEvent.click(opener)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener).toHaveFocus()
  })

  it('the close button and a backdrop click close it', () => {
    render(<ProjectDetail project={project} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    fireEvent.click(screen.getByTestId('lightbox-backdrop'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Escape closes the lightbox after focus moved to body', () => {
    render(<ProjectDetail project={project} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    ;(document.activeElement as HTMLElement).blur()
    expect(document.body).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('the lightbox is rendered under document.body outside the project detail', () => {
    render(<ProjectDetail project={project} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog.closest('.project-detail')).toBeNull()
    expect(document.body.contains(dialog)).toBe(true)
  })

  it('body overflow is locked while open and restored after close', () => {
    document.body.style.overflow = 'scroll'
    const { unmount } = render(<ProjectDetail project={project} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.body.style.overflow).toBe('scroll')
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    unmount()
    expect(document.body.style.overflow).toBe('scroll')
    document.body.style.overflow = ''
  })

  it('the lightbox closes when the active project changes', () => {
    const { rerender } = render(<ProjectDetail project={project} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge: A caption' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    rerender(<ProjectDetail project={{ ...content.projects[1], media }} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('focus falls back when the opener has been removed', () => {
    render(<ProjectDetail project={project} />)
    const opener = screen.getByRole('button', { name: 'Enlarge: A caption' })
    opener.focus()
    fireEvent.click(opener)
    opener.remove()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(document.querySelector('.project-detail h3'))
  })

  it('Experience renders the Qehna image with alt text', () => {
    render(<Experience />)
    const img = screen.getByRole('img', { name: /dead-time|oscilloscope/i })
    expect(img.getAttribute('alt')!.length).toBeGreaterThan(10)
  })
})
