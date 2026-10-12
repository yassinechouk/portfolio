import { describe, expect, it } from 'vitest'
import { content } from '../../content'
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
  const DIE_HALF = 0.95
  const rect = (b: (typeof dieBlocks)[number]) => ({
    x0: b.position[0] - b.size[0] / 2,
    x1: b.position[0] + b.size[0] / 2,
    z0: b.position[2] - b.size[2] / 2,
    z1: b.position[2] + b.size[2] / 2,
  })

  it('dieBlocks cover all six skill ids exactly once', () => {
    const ids = dieBlocks.map((b) => b.groupId).sort()
    expect(ids).toEqual(['firmware', 'languages', 'platforms', 'protocols', 'testing', 'tools'])
    expect(ids).toEqual(content.skills.map((g) => g.id).sort())
  })

  it('every die block lies inside the die bounds', () => {
    for (const b of dieBlocks) {
      const r = rect(b)
      expect(r.x0, b.groupId).toBeGreaterThanOrEqual(-DIE_HALF)
      expect(r.x1, b.groupId).toBeLessThanOrEqual(DIE_HALF)
      expect(r.z0, b.groupId).toBeGreaterThanOrEqual(-DIE_HALF)
      expect(r.z1, b.groupId).toBeLessThanOrEqual(DIE_HALF)
    }
  })

  it('no two die blocks overlap', () => {
    for (let i = 0; i < dieBlocks.length; i++) {
      for (let j = i + 1; j < dieBlocks.length; j++) {
        const a = rect(dieBlocks[i])
        const b = rect(dieBlocks[j])
        const overlap = a.x0 < b.x1 && b.x0 < a.x1 && a.z0 < b.z1 && b.z0 < a.z1
        expect(overlap, `${dieBlocks[i].groupId} / ${dieBlocks[j].groupId}`).toBe(false)
      }
    }
  })

  it('gives every die block a distinct height', () => {
    expect(new Set(dieBlocks.map((b) => b.size[1])).size).toBe(dieBlocks.length)
  })
})
