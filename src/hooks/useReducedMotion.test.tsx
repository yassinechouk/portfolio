import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

function Probe() {
  return <span data-testid="v">{String(useReducedMotion())}</span>
}

afterEach(() => {
  vi.unstubAllGlobals()
  // @ts-expect-error cleanup of stub
  delete window.matchMedia
})

describe('useReducedMotion', () => {
  it('returns true when the media query matches', () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: true,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<Probe />)
    expect(screen.getByTestId('v').textContent).toBe('true')
  })

  it('returns false when matchMedia is unavailable', () => {
    render(<Probe />)
    expect(screen.getByTestId('v').textContent).toBe('false')
  })
})
