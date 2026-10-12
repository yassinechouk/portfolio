import { describe, expect, it } from 'vitest'
import { dieBlocks, pinIndexForProject, pinPositions } from './geometry'

describe('pinPositions', () => {
  it('pinPositions returns 4 * pinsPerSide points', () => {
    expect(pinPositions(12, 4, 0.5)).toHaveLength(48)
    expect(pinPositions(5, 4, 0.5)).toHaveLength(20)
  })

  it('pins sit outside the body half-size', () => {
    const half = 4 / 2
    for (const [x, , z] of pinPositions(12, 4, 0.5)) {
      expect(Math.max(Math.abs(x), Math.abs(z))).toBeGreaterThan(half)
    }
  })
})

describe('pinIndexForProject', () => {
  it('pinIndexForProject stays within range for 1 to 6 projects', () => {
    for (let count = 1; count <= 6; count++) {
      for (let i = 0; i < count; i++) {
        const pin = pinIndexForProject(i, count, 12)
        expect(Number.isInteger(pin)).toBe(true)
        expect(pin).toBeGreaterThanOrEqual(0)
        expect(pin).toBeLessThan(12)
      }
    }
  })

  it('pinIndexForProject is strictly increasing across projects', () => {
    for (let count = 2; count <= 6; count++) {
      for (let i = 1; i < count; i++) {
        expect(pinIndexForProject(i, count, 12)).toBeGreaterThan(pinIndexForProject(i - 1, count, 12))
      }
    }
  })
})

describe('dieBlocks', () => {
  it('dieBlocks cover all four skill group ids exactly once', () => {
    const ids = dieBlocks.map((b) => b.groupId).sort()
    expect(ids).toEqual(['languages', 'platforms', 'protocols', 'tools'])
  })
})
