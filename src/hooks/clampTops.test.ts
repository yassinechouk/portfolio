import { describe, expect, it } from 'vitest'
import { clampTopsToMaxScroll } from './clampTops'
import { progressFromTops } from './progressFromTops'

const tops = [0, 500, 900, 1400, 2000]

describe('clampTopsToMaxScroll', () => {
  it('without clamping, progress stalls below 1 at max scroll', () => {
    expect(progressFromTops(tops, 1500)).toBeLessThan(1)
  })
  it('reaches exactly 1 at max scroll when the last section is short', () => {
    expect(progressFromTops(clampTopsToMaxScroll(tops, 1500), 1500)).toBe(1)
  })
  it('keeps tops ascending and leaves reachable tops untouched', () => {
    expect(clampTopsToMaxScroll(tops, 1500)).toEqual([0, 500, 900, 1400, 1500])
    expect(clampTopsToMaxScroll(tops, 5000)).toEqual(tops)
  })
  it('never yields NaN for zero, negative or non-finite maxScroll', () => {
    for (const m of [0, -100, NaN, Infinity]) {
      const c = clampTopsToMaxScroll(tops, m)
      expect(c.every((t) => Number.isFinite(t))).toBe(true)
      expect(Number.isNaN(progressFromTops(c, 300))).toBe(false)
    }
  })
})
