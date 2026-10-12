import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { content } from '../content'
import { getTour, setTour } from '../state/tourStore'
import ProjectCard from './ProjectCard'

beforeEach(() => {
  act(() => {
    setTour({ progress: 0, activeSection: 'hero', activeProjectId: null, activeSkillGroup: null })
  })
})

describe('sections', () => {
  it('renders all five sections with ids hero, about, skills, projects, contact', () => {
    const { container } = render(<App />)
    for (const id of ['hero', 'about', 'skills', 'projects', 'contact']) {
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

  it('a project without an image renders its card without an img element', () => {
    const project = content.projects.find((p) => p.image === undefined)!
    const { container } = render(<ProjectCard project={project} selected={false} onSelect={() => {}} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('the CV link href starts with import.meta.env.BASE_URL', () => {
    render(<App />)
    const cv = screen.getAllByRole('link', { name: /cv/i })
    expect(cv.length).toBeGreaterThan(0)
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

  it('clicking a skill group sets activeSkillGroup', () => {
    render(<App />)
    const group = content.skills[2]
    fireEvent.click(screen.getByRole('button', { name: new RegExp(group.label) }))
    expect(getTour().activeSkillGroup).toBe(group.id)
  })
})
