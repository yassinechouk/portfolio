import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { content } from '../content'
import { assetUrl } from '../content/assetUrl'
import About from './About'
import Hero from './Hero'
import ProfilePhoto from './ProfilePhoto'

describe('ProfilePhoto', () => {
  it('shows YC initials when no photo is set', () => {
    const { container } = render(<ProfilePhoto name="Yassine Chouk" />)
    expect(screen.getByText('YC')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows an img with alt "Portrait of Yassine Chouk" when src is set', () => {
    render(<ProfilePhoto name="Yassine Chouk" src="profile.jpg" />)
    const img = screen.getByRole('img', { name: 'Portrait of Yassine Chouk' })
    expect(img.getAttribute('src')!.startsWith(import.meta.env.BASE_URL)).toBe(true)
    expect(img).toHaveAttribute('src', assetUrl('profile.jpg'))
  })

  it('falls back to the initials when the image errors', () => {
    const { container } = render(<ProfilePhoto name="Yassine Chouk" src="profile.jpg" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('YC')).toBeInTheDocument()
  })
})

describe('Hero', () => {
  it('has exactly one h1, the name', () => {
    render(<Hero />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent(content.about.name)
    expect(h1s[0].textContent).toBe(content.about.name)
  })

  it('shows the availability badge, role and affiliation', () => {
    const { about } = content
    render(<Hero />)
    expect(about.availability).toBe('Open to collaborations')
    expect(screen.getByText(about.availability)).toBeInTheDocument()
    expect(screen.getByText(about.role)).toBeInTheDocument()
    expect(screen.getByText(about.affiliation)).toBeInTheDocument()
  })

  it('shows the headline as a paragraph, not a heading, plus the tagline', () => {
    const { about } = content
    render(<Hero />)
    expect(screen.queryByRole('heading', { name: about.headline })).toBeNull()
    expect(screen.getByText(about.headline).tagName).toBe('P')
    expect(screen.getByText(about.tagline)).toBeInTheDocument()
  })

  it('keeps the three actions', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', assetUrl(content.about.links.cv))
    expect(screen.getByRole('link', { name: 'Say hello' })).toHaveAttribute('href', '#contact')
  })
})

describe('About', () => {
  it('shows the lead, the collaboration block, highlights, education and spoken languages', () => {
    const { about } = content
    render(<About />)
    expect(screen.getByRole('heading', { level: 2, name: "Hi, I'm Yassine." })).toBeInTheDocument()
    expect(screen.getByText(about.lead)).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      "Let's collaborate",
    ])
    for (const b of about.blocks) expect(screen.getByText(b.text)).toBeInTheDocument()
    for (const h of about.highlights) expect(screen.getByText(h)).toBeInTheDocument()
    expect(screen.getByText(about.education)).toBeInTheDocument()
    for (const l of about.spokenLanguages) expect(screen.getByText(l)).toBeInTheDocument()
  })

  it('links to GitHub and LinkedIn but not the CV', () => {
    render(<About />)
    const section = screen.getByRole('region', { name: "Hi, I'm Yassine." })
    expect(within(section).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', content.about.links.github)
    expect(within(section).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', content.about.links.linkedin)
    expect(within(section).queryByRole('link', { name: /cv/i })).toBeNull()
  })
})
