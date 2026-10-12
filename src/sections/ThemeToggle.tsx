import { toggleTheme, useTheme } from '../state/themeStore'

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

/** Switches light/dark for this visit only; the icon shows the theme a click switches to. */
export default function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'light' ? 'dark' : 'light'
  const label = `Switch to ${next} theme`
  return (
    <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={toggleTheme}>
      {next === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
