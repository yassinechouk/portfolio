import { describe, expect, it } from 'vitest'
import { composite, contrastRatio, parseColor } from './contrast'

describe('contrast', () => {
  it('parses hex and rgba colours', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#00e5ff')).toEqual({ r: 0, g: 229, b: 255, a: 1 })
    expect(parseColor('rgba(8, 14, 22, 0.78)')).toEqual({ r: 8, g: 14, b: 22, a: 0.78 })
    expect(parseColor('rgb(1 2 3)')).toEqual({ r: 1, g: 2, b: 3, a: 1 })
  })

  it('computes the WCAG ratio (black on white is 21, a colour on itself is 1)', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5)
    // Known reference: #767676 on white is 4.54.
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })

  it('composites a translucent colour over an opaque one', () => {
    expect(composite('rgba(0, 0, 0, 0.5)', '#ffffff')).toBe('#808080')
    expect(composite('#123456', '#ffffff')).toBe('#123456')
  })
})
