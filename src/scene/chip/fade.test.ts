import { describe, expect, it } from 'vitest'
import { SECTION_ORDER } from '../../state/tourStore'
import { PACKAGE_OPACITY, packageOpacity } from './fade'

describe('packageOpacity', () => {
  it('equals the table value at each section stop', () => {
    const last = SECTION_ORDER.length - 1
    SECTION_ORDER.forEach((id, i) => {
      expect(packageOpacity(i / last), id).toBeCloseTo(PACKAGE_OPACITY[id])
    })
  })

  it('uses the per-section table from the design', () => {
    expect(PACKAGE_OPACITY).toEqual({ hero: 1, about: 0.88, skills: 0.1, experience: 1, projects: 1, contact: 1 })
  })

  it('interpolates between stops', () => {
    const last = SECTION_ORDER.length - 1
    expect(packageOpacity(0.5 / last)).toBeCloseTo((1 + 0.88) / 2)
  })

  it('clamps and tolerates NaN', () => {
    expect(packageOpacity(-1)).toBe(1)
    expect(packageOpacity(2)).toBe(1)
    expect(packageOpacity(NaN)).toBe(1)
    expect(packageOpacity(Infinity)).toBe(1)
  })
})
