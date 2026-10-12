import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SceneHost from './SceneHost'

const hooks = vi.hoisted(() => ({ webgl: true, reduced: false, throwing: false }))

vi.mock('../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => hooks.webgl }))
vi.mock('../hooks/useReducedMotion', () => ({ useReducedMotion: () => hooks.reduced }))
vi.mock('./Scene', () => ({
  default: function StubScene() {
    if (hooks.throwing) throw new Error('scene exploded')
    return (
      <div data-testid="scene">
        <div data-testid="inner" />
      </div>
    )
  },
}))

const CHIP_ALT = /microcontroller chip/i

beforeEach(() => {
  hooks.webgl = true
  hooks.reduced = false
  hooks.throwing = false
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SceneHost', () => {
  it('shows the static chip when WebGL is unsupported', () => {
    hooks.webgl = false
    render(<SceneHost />)
    expect(screen.getByAltText(CHIP_ALT)).toBeInTheDocument()
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()
  })

  it('shows the static chip when reduced motion is preferred', () => {
    hooks.reduced = true
    render(<SceneHost />)
    expect(screen.getByAltText(CHIP_ALT)).toBeInTheDocument()
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()
  })

  it('shows the static chip when the scene throws', async () => {
    hooks.throwing = true
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<SceneHost />)
    expect(await screen.findByAltText(CHIP_ALT)).toBeInTheDocument()
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()
    spy.mockRestore()
  })

  it('shows the scene when supported and motion allowed', async () => {
    render(<SceneHost />)
    expect(await screen.findByTestId('scene')).toBeInTheDocument()
    expect(screen.queryByAltText(CHIP_ALT)).not.toBeInTheDocument()
  })

  it('the static chip src starts with the base URL', () => {
    hooks.webgl = false
    render(<SceneHost />)
    const src = screen.getByAltText(CHIP_ALT).getAttribute('src') ?? ''
    expect(src.startsWith(import.meta.env.BASE_URL)).toBe(true)
    expect(src.endsWith('chip-fallback.png')).toBe(true)
  })

  it('switches to the static chip when webglcontextlost fires on the wrapper', async () => {
    render(<SceneHost />)
    const inner = await screen.findByTestId('inner')
    act(() => {
      inner.dispatchEvent(new Event('webglcontextlost', { bubbles: false, cancelable: true }))
    })
    expect(screen.getByAltText(CHIP_ALT)).toBeInTheDocument()
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()
  })

  it('the wrapper is aria-hidden when the canvas is shown', async () => {
    render(<SceneHost />)
    const scene = await screen.findByTestId('scene')
    expect(scene.closest('.scene-host')).toHaveAttribute('aria-hidden', 'true')
  })

  it('the wrapper is not aria-hidden when the static chip is shown, so its alt is exposed', () => {
    hooks.webgl = false
    render(<SceneHost />)
    expect(screen.getByAltText(CHIP_ALT).closest('.scene-host')).not.toHaveAttribute('aria-hidden')
  })
})
