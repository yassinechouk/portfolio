import { describe, expect, it } from 'vitest'
import type { Theme } from '../../state/themeStore'
import { contrastRatio } from '../../styles/contrast'
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

  it('carries only colours the scene draws (no unused page accent/background)', () => {
    for (const theme of THEMES) {
      expect(scenePalette(theme)).not.toHaveProperty('accent')
      expect(scenePalette(theme)).not.toHaveProperty('background')
    }
  })

  it.each(THEMES)('%s: traces, the lit pin and the pins keep >= 3:1 on the package top they are drawn on', (theme) => {
    const p = scenePalette(theme)
    for (const key of ['traces', 'pinHighlight', 'pins'] as const) {
      expect(contrastRatio(p[key], p.packageBody), key).toBeGreaterThanOrEqual(3)
    }
  })

  it.each(THEMES)('%s: block edges keep >= 3:1 on every block', (theme) => {
    const p = scenePalette(theme)
    for (const block of p.dieBlocks) expect(contrastRatio(p.dieEdge, block), block).toBeGreaterThanOrEqual(3)
  })

  it.each(THEMES)('%s: each die block stands out >= 3:1 from the die base, by its fill or its edge', (theme) => {
    const p = scenePalette(theme)
    for (const block of p.dieBlocks) {
      const best = Math.max(contrastRatio(block, p.dieBase), contrastRatio(p.dieEdge, p.dieBase))
      expect(best, block).toBeGreaterThanOrEqual(3)
    }
  })

  it('light: the drawn colours are distinct and the active block is >= 3:1 on the die base', () => {
    const p = scenePalette('light')
    const drawn = [p.traces, p.pinHighlight, p.pins, p.packageBody, p.dieBase, p.dieBlockActive, ...p.dieBlocks]
    expect(new Set(drawn.map((c) => c.toLowerCase())).size).toBe(drawn.length)
    expect(contrastRatio(p.dieBlockActive, p.dieBase)).toBeGreaterThanOrEqual(3)
  })

  it('dark: the active block is lit by its glow (same body colour, stronger emissive)', () => {
    const p = scenePalette('dark')
    expect(p.dieGlowActive).toBeGreaterThan(p.dieGlowIdle)
    expect(new Set([p.traces, p.pins, p.packageBody, p.dieBase, p.dieBlocks[0]]).size).toBe(5)
  })

  it.each(THEMES)('the %s engraved label is readable on the package (>= 3:1)', (theme) => {
    const p = scenePalette(theme)
    expect(contrastRatio(p.label, p.packageBody)).toBeGreaterThanOrEqual(3)
  })

  it('the dark palette keeps the original scene colours', () => {
    const p = scenePalette('dark')
    expect(p.traces).toBe('#00e5ff')
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
