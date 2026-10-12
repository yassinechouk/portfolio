import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_BACKGROUND,
  getTheme,
  setTheme,
  startThemeSync,
  subscribeTheme,
  toggleTheme,
  useTheme,
} from './themeStore'

let meta: HTMLMetaElement

beforeEach(() => {
  act(() => setTheme('light'))
  meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = '#000000'
  document.head.appendChild(meta)
  delete document.documentElement.dataset.theme
})

afterEach(() => {
  meta.remove()
})

describe('themeStore', () => {
  it('starts light', () => {
    expect(getTheme()).toBe('light')
  })

  it('toggleTheme flips between light and dark', () => {
    toggleTheme()
    expect(getTheme()).toBe('dark')
    toggleTheme()
    expect(getTheme()).toBe('light')
  })

  it('setTheme sets the theme', () => {
    setTheme('dark')
    expect(getTheme()).toBe('dark')
    setTheme('light')
    expect(getTheme()).toBe('light')
  })

  it('notifies subscribers once per change and not when the value is unchanged', () => {
    const listener = vi.fn()
    const off = subscribeTheme(listener)
    setTheme('dark')
    expect(listener).toHaveBeenCalledTimes(1)
    setTheme('dark')
    expect(listener).toHaveBeenCalledTimes(1)
    toggleTheme()
    expect(listener).toHaveBeenCalledTimes(2)
    off()
    toggleTheme()
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('useTheme re-renders with the new theme', () => {
    function Probe() {
      return <span data-testid="t">{useTheme()}</span>
    }
    const { getByTestId } = render(<Probe />)
    expect(getByTestId('t')).toHaveTextContent('light')
    act(() => toggleTheme())
    expect(getByTestId('t')).toHaveTextContent('dark')
  })

  it('startThemeSync applies the theme at once and on every change, until stopped', () => {
    const stop = startThemeSync()
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(meta.content).toBe(THEME_BACKGROUND.light)
    setTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(meta.content).toBe(THEME_BACKGROUND.dark)
    stop()
    setTheme('light')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('never touches web storage or cookies', () => {
    const stop = startThemeSync()
    toggleTheme()
    toggleTheme()
    stop()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    expect(document.cookie).toBe('')
  })
})
