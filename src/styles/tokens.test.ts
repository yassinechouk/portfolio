/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { THEME_BACKGROUND, type Theme } from '../state/themeStore'
import { readTokens } from '../test/tokens'
import { composite, contrastRatio, parseColor } from './contrast'

const SRC = join(process.cwd(), 'src')
const THEMES: Theme[] = ['light', 'dark']

function files(dir: string, ext: RegExp, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) files(p, ext, out)
    else if (ext.test(e.name)) out.push(p)
  }
  return out
}

const RAW_COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(?:white|black|red|green|blue|gr[ae]y|silver|cyan|teal|navy|orange|yellow|purple)(?![\w-])/i

const tokens = readTokens()

/** A token colour at `alpha` (what `color-mix(in srgb, var(--x) N%, transparent)` gives). */
function tint(colour: string, alpha: number): string {
  const { r, g, b, a } = parseColor(colour)
  return `rgba(${r}, ${g}, ${b}, ${a * alpha})`
}

/** Flattens a stack of layers (top first) onto an opaque bottom layer. */
function flatten(...layers: string[]): string {
  return layers.reduceRight((under, over) => composite(over, under))
}

/** Every text or graphic pair the CSS draws, with the minimum WCAG ratio it must meet. */
function contrastPairs(theme: Theme): { name: string; fg: string; bg: string; min: number }[] {
  const t = tokens[theme]
  const page = t['--bg']
  const panel = flatten(t['--panel'], page)
  const field = flatten(t['--field-bg'], panel)
  const accentTint = flatten(tint(t['--accent'], 0.1), panel)
  const currentProject = flatten(tint(t['--accent'], 0.06), panel)
  const pressedGroup = flatten(tint(t['--accent'], 0.08), panel)
  return [
    { name: 'text on page', fg: t['--text'], bg: page, min: 4.5 },
    { name: 'text on panel', fg: t['--text'], bg: panel, min: 4.5 },
    { name: 'muted on page', fg: t['--text-muted'], bg: page, min: 4.5 },
    { name: 'muted on panel', fg: t['--text-muted'], bg: panel, min: 4.5 },
    { name: 'accent text on panel', fg: t['--accent'], bg: panel, min: 4.5 },
    { name: 'accent text on page', fg: t['--accent'], bg: page, min: 4.5 },
    { name: 'on-accent on accent (primary button)', fg: t['--on-accent'], bg: t['--accent'], min: 4.5 },
    { name: 'accent on proof chip tint', fg: t['--accent'], bg: accentTint, min: 4.5 },
    { name: 'text on current project tint', fg: t['--text'], bg: currentProject, min: 4.5 },
    { name: 'muted on current project tint', fg: t['--text-muted'], bg: currentProject, min: 4.5 },
    { name: 'text on pressed skill group', fg: t['--text'], bg: pressedGroup, min: 4.5 },
    { name: 'text in form field', fg: t['--text'], bg: field, min: 4.5 },
    { name: 'danger marker on panel', fg: t['--danger'], bg: panel, min: 4.5 },
    { name: 'success text on panel', fg: t['--success'], bg: panel, min: 4.5 },
    { name: 'initials on photo slot', fg: t['--accent'], bg: flatten(t['--photo-bg'], panel), min: 4.5 },
    { name: 'text in lightbox dialog', fg: t['--text'], bg: page, min: 4.5 },
    { name: 'accent graphics/focus on page', fg: t['--accent'], bg: page, min: 3 },
    { name: 'accent graphics/focus on panel', fg: t['--accent'], bg: panel, min: 3 },
    { name: 'danger border on field', fg: t['--danger'], bg: field, min: 3 },
  ]
}

describe('design tokens', () => {
  it('the light and dark blocks define the same tokens, and the shared block holds no colour', () => {
    expect(Object.keys(tokens.light).sort()).toEqual(Object.keys(tokens.dark).sort())
    expect(Object.keys(tokens.light).length).toBeGreaterThan(5)
    for (const [name, value] of Object.entries(tokens.shared)) {
      expect(RAW_COLOUR.test(value), `${name}: ${value}`).toBe(false)
    }
  })

  it('every var(--x) used in src/**/*.css is defined for both themes', () => {
    const missing: string[] = []
    for (const file of files(SRC, /\.css$/)) {
      const css = readFileSync(file, 'utf8')
      for (const m of css.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = m[1]
        const ok = name in tokens.shared || (name in tokens.light && name in tokens.dark)
        if (!ok) missing.push(`${relative(SRC, file)}: ${name}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('no CSS outside tokens.css carries a raw colour', () => {
    const found: string[] = []
    for (const file of files(SRC, /\.css$/)) {
      if (file.endsWith(join('styles', 'tokens.css'))) continue
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      css.split('\n').forEach((line, i) => {
        if (RAW_COLOUR.test(line)) found.push(`${relative(SRC, file)}:${i + 1}: ${line.trim()}`)
      })
    }
    expect(found).toEqual([])
  })

  it('no component or module outside the palette files carries a raw colour', () => {
    const allowed = new Set([join(SRC, 'scene/chip/palette.ts'), join(SRC, 'state/themeStore.ts')])
    const found: string[] = []
    for (const file of files(SRC, /\.tsx?$/)) {
      if (allowed.has(file) || /\.test\.tsx?$/.test(file) || file.startsWith(join(SRC, 'test'))) continue
      readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|\s)\/\/.*$/gm, '$1')
        .split('\n')
        .forEach((line, i) => {
          if (RAW_COLOUR.test(line)) found.push(`${relative(SRC, file)}:${i + 1}: ${line.trim()}`)
        })
    }
    expect(found).toEqual([])
  })

  it.each(THEMES)('the %s page background matches the theme-color the store sets', (theme) => {
    expect(tokens[theme]['--bg'].toLowerCase()).toBe(THEME_BACKGROUND[theme])
  })

  it.each(THEMES)('every %s text pair is >= 4.5:1 and every graphic pair >= 3:1', (theme) => {
    const failing = contrastPairs(theme)
      .map((p) => ({ ...p, ratio: contrastRatio(p.fg, p.bg) }))
      .filter((p) => p.ratio < p.min)
      .map((p) => `${p.name}: ${p.ratio.toFixed(2)} < ${p.min}`)
    expect(failing).toEqual([])
  })
})
