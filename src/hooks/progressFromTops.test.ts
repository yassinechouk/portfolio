import { describe, expect, it } from 'vitest'
import { progressFromTops } from './progressFromTops'

const tops = [0, 100, 300, 400, 700]

describe('progressFromTops', () => {
  it('returns 0 at scrollY 0', () => {
    expect(progressFromTops(tops, 0)).toBe(0)
  })
  it('returns 0.25 at the second section top', () => {
    expect(progressFromTops(tops, 100)).toBeCloseTo(0.25)
  })
  it('interpolates inside a section (scrollY 200 gives 0.375)', () => {
    expect(progressFromTops(tops, 200)).toBeCloseTo(0.375)
  })
  it('clamps below 0 and above the last top to [0,1]', () => {
    expect(progressFromTops(tops, -50)).toBe(0)
    expect(progressFromTops(tops, 700)).toBe(1)
    expect(progressFromTops(tops, 5000)).toBe(1)
  })
  it('returns 0 for zero-height or single-section input', () => {
    expect(progressFromTops([], 10)).toBe(0)
    expect(progressFromTops([50], 100)).toBe(0)
    expect(progressFromTops([0, 0], 100)).toBe(0)
  })
  it('never returns NaN for duplicate tops', () => {
    for (const y of [-1, 0, 100, 150, 300, 999]) {
      const p = progressFromTops([0, 100, 100, 400, 700], y)
      expect(Number.isNaN(p)).toBe(false)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })
})
