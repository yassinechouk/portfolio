import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getTheme, setTheme } from '../state/themeStore'
import Nav from './Nav'
import ThemeToggle from './ThemeToggle'

beforeEach(() => {
  act(() => setTheme('light'))
})

describe('ThemeToggle', () => {
  it('in light offers to switch to dark, and its icon is hidden from assistive tech', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: 'Switch to dark theme' })
    expect(button).toHaveAttribute('type', 'button')
    const svg = button.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('click toggles the theme and the label follows', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(getTheme()).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(getTheme()).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
  })

  it('reflects a theme set elsewhere', () => {
    render(<ThemeToggle />)
    act(() => setTheme('dark'))
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
  })
})

describe('Nav', () => {
  it('has the six section links plus the theme toggle as its last element', () => {
    render(<Nav />)
    const nav = screen.getByRole('navigation', { name: 'Sections' })
    expect(within(nav).getAllByRole('link')).toHaveLength(6)
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveAccessibleName('Switch to dark theme')
    expect(nav.lastElementChild).toBe(buttons[0])
  })
})
