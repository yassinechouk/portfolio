import { describe, expect, it } from 'vitest'
import { THEME_BACKGROUND, type Theme } from '../../state/themeStore'
import { contrastRatio } from '../../styles/contrast'
import { readTokens } from '../../test/tokens'
import { scenePalette } from './palette'

const THEMES: Theme[] = ['light', 'dark']

describe('scenePalette', () => {
  it('both themes define the same keys and every value is set', () => {
    const light = scenePalette('light')
    const dark = scenePalette('dark')
    expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort())
    for (const theme of THEMES) {
      for (const [key, value] of Object.entries(scenePalette(theme))) {
        expect(value, `${theme}.${key}`).not.toBeUndefined()
        expect(value, `${theme}.${key}`).not.toBe('')
      }
    }
  })

  it.each(THEMES)('%s has one colour per die block (six)', (theme) => {
    expect(scenePalette(theme).dieBlocks).toHaveLength(6)
  })

  it.each(THEMES)('the %s accent is >= 3:1 against the page background', (theme) => {
    expect(contrastRatio(scenePalette(theme).accent, THEME_BACKGROUND[theme])).toBeGreaterThanOrEqual(3)
  })

  it.each(THEMES)('the %s scene accent and background match tokens.css', (theme) => {
    const tokens = readTokens()[theme]
    expect(scenePalette(theme).accent).toBe(tokens['--accent'].toLowerCase())
    expect(scenePalette(theme).background).toBe(tokens['--bg'].toLowerCase())
  })

  it.each(THEMES)('the %s engraved label is readable on the package (>= 3:1)', (theme) => {
    const p = scenePalette(theme)
    expect(contrastRatio(p.label, p.packageBody)).toBeGreaterThanOrEqual(3)
  })

  it('the dark palette keeps the original scene colours', () => {
    const p = scenePalette('dark')
    expect(p.accent).toBe('#00e5ff')
    expect(p.packageBody).toBe('#15191f')
    expect(p.packageDot).toBe('#2a3038')
    expect(p.pins).toBe('#9aa3ad')
    expect(p.dieBase).toBe('#1c2530')
    expect(p.dieBlocks).toEqual(Array(6).fill('#0d1218'))
    expect(p.traceBlending).toBe('additive')
  })

  it('returns a fresh object, so callers cannot corrupt the palette', () => {
    const p = scenePalette('light')
    p.dieBlocks[0] = '#ff00ff'
    expect(scenePalette('light').dieBlocks[0]).not.toBe('#ff00ff')
  })
})
