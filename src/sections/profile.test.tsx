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
  it('shows the eyebrow, name, headline, tagline and three actions', () => {
    const { about } = content
    render(<Hero />)
    expect(screen.getByText(about.eyebrow)).toBeInTheDocument()
    expect(screen.getByText(about.name)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: about.headline })).toBeInTheDocument()
    expect(screen.getByText(about.tagline)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', assetUrl(about.links.cv))
    expect(screen.getByRole('link', { name: 'Say hello' })).toHaveAttribute('href', '#contact')
  })
})

describe('About', () => {
  it('shows the paragraphs, highlights, education and spoken languages', () => {
    const { about } = content
    render(<About />)
    expect(screen.getByRole('heading', { level: 2, name: "Hi, I'm Yassine." })).toBeInTheDocument()
    for (const p of about.paragraphs) expect(screen.getByText(p)).toBeInTheDocument()
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
