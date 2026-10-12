import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

/** Page background per theme: `--bg` in tokens.css (a test keeps them equal) and the `theme-color` meta. */
export const THEME_BACKGROUND: Record<Theme, string> = {
  light: '#f4f6f8',
  dark: '#05080d',
}

// Every visit opens light; the toggle only lasts for this page load (nothing is stored).
let theme: Theme = 'light'

const listeners = new Set<() => void>()

export function getTheme(): Theme {
  return theme
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setTheme(next: Theme): void {
  if (next === theme) return
  theme = next
  listeners.forEach((l) => l())
}

export function toggleTheme(): void {
  setTheme(theme === 'light' ? 'dark' : 'light')
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme, getTheme)
}

/** Writes the theme to `<html data-theme>` (which switches the CSS tokens) and the `theme-color` meta. */
function applyTheme(t: Theme): void {
  document.documentElement.dataset.theme = t
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', THEME_BACKGROUND[t])
}

/** Applies the current theme now and on every change; returns the unsubscribe. Called once from main.tsx. */
export function startThemeSync(): () => void {
  applyTheme(theme)
  return subscribeTheme(() => applyTheme(theme))
}
