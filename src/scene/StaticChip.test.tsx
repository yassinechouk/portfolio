import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setTheme } from '../state/themeStore'
import StaticChip from './StaticChip'

const CHIP_ALT = /microcontroller chip/i

beforeEach(() => {
  act(() => setTheme('light'))
})

describe('StaticChip', () => {
  it('shows the light still in light, under the base URL', () => {
    render(<StaticChip />)
    const src = screen.getByAltText(CHIP_ALT).getAttribute('src') ?? ''
    expect(src).toBe(import.meta.env.BASE_URL + 'chip-fallback-light.png')
  })

  it('shows the dark still in dark, and follows a theme change', () => {
    render(<StaticChip />)
    act(() => setTheme('dark'))
    const src = screen.getByAltText(CHIP_ALT).getAttribute('src') ?? ''
    expect(src).toBe(import.meta.env.BASE_URL + 'chip-fallback.png')
  })
})
