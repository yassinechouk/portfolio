import { describe, expect, it } from 'vitest'
import { effectiveScrollY, progressFromTops } from './progressFromTops'

describe('effectiveScrollY', () => {
  it('stays 0 at the top of the page', () => {
    expect(effectiveScrollY(0, 64)).toBe(0)
  })
  it('ramps the padding in over the first padding pixels', () => {
    expect(effectiveScrollY(32, 64)).toBe(64)
  })
  it('adds the full padding once past it', () => {
    expect(effectiveScrollY(936, 64)).toBe(1000)
  })
  it('ignores a missing or invalid padding and scroll', () => {
    expect(effectiveScrollY(500, NaN)).toBe(500)
    expect(effectiveScrollY(500, -10)).toBe(500)
    expect(effectiveScrollY(NaN, 64)).toBe(0)
  })
  it('lands a nav-click position exactly on the section stop', () => {
    const tops = [0, 1000, 2000]
    expect(progressFromTops(tops, effectiveScrollY(936, 64))).toBeCloseTo(0.5, 5)
  })
  it('never exceeds 1 at the end of the page', () => {
    expect(progressFromTops([0, 1000, 2000], effectiveScrollY(2000, 64))).toBe(1)
  })
})
