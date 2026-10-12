import { describe, expect, it } from 'vitest'
import { SECTION_ORDER } from '../state/tourStore'
import { poseAt, waypoints } from './cameraPath'

describe('poseAt', () => {
  it('returns the hero waypoint at 0', () => {
    expect(poseAt(0)).toEqual(waypoints.hero)
  })

  it('returns the contact waypoint at 1', () => {
    expect(poseAt(1)).toEqual(waypoints.contact)
  })

  it('returns the about waypoint at 0.25', () => {
    expect(poseAt(0.25)).toEqual(waypoints.about)
  })

  it('returns every waypoint at its integer index', () => {
    SECTION_ORDER.forEach((id, i) => {
      expect(poseAt(i / (SECTION_ORDER.length - 1))).toEqual(waypoints[id])
    })
  })

  it('lies strictly between hero and about at 0.125 on every differing axis', () => {
    const a = waypoints.hero
    const b = waypoints.about
    const p = poseAt(0.125)
    for (const key of ['position', 'target'] as const) {
      for (let i = 0; i < 3; i++) {
        if (a[key][i] === b[key][i]) continue
        const lo = Math.min(a[key][i], b[key][i])
        const hi = Math.max(a[key][i], b[key][i])
        expect(p[key][i]).toBeGreaterThan(lo)
        expect(p[key][i]).toBeLessThan(hi)
      }
    }
  })

  it('clamps out-of-range progress', () => {
    expect(poseAt(-1)).toEqual(waypoints.hero)
    expect(poseAt(2)).toEqual(waypoints.contact)
  })

  it('returns the hero pose for non-finite input', () => {
    expect(poseAt(NaN)).toEqual(waypoints.hero)
    expect(poseAt(Infinity)).toEqual(waypoints.hero)
  })

  it('gives every waypoint a distinct position', () => {
    const keys = new Set(SECTION_ORDER.map((id) => waypoints[id].position.join(',')))
    expect(keys.size).toBe(SECTION_ORDER.length)
  })

  it.each([0, 1, NaN, 0.125])('returns a fresh pose that cannot corrupt waypoints (progress %s)', (progress) => {
    const before = structuredClone(waypoints)
    const pose = poseAt(progress)
    pose.position[0] += 100
    pose.target[1] += 100
    expect(waypoints).toEqual(before)
    expect(poseAt(progress)).not.toBe(pose)
    expect(poseAt(progress).position).not.toBe(pose.position)
  })
})
