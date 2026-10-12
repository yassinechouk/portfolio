import type { SkillGroup } from '../../content/types'
import type { Vec3 } from '../cameraPath'

// Chip frame (shared with cameraPath waypoints): body centred at the origin, label on +y,
// front pin row on +z.
export const BODY_SIZE = 4
export const BODY_THICKNESS = 0.4
export const PIN_LENGTH = 0.5
export const PINS_PER_SIDE = 12

/**
 * Pin centres in side order front (+z), right (+x), back (-z), left (-x), each side running
 * left to right as seen from outside. Pins span 85% of the edge and sit fully outside the body.
 */
export function pinPositions(pinsPerSide: number, bodySize: number, pinLength: number): Vec3[] {
  const half = bodySize / 2
  const out = half + pinLength / 2
  const pitch = (bodySize * 0.85) / pinsPerSide
  const points: Vec3[] = []
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < pinsPerSide; i++) {
      const s = (i - (pinsPerSide - 1) / 2) * pitch
      if (side === 0) points.push([s, 0, out])
      else if (side === 1) points.push([out, 0, -s])
      else if (side === 2) points.push([-s, 0, -out])
      else points.push([-out, 0, s])
    }
  }
  return points
}

/** Spreads projects evenly along a pin row; the result is always in [0, pinCount). */
export function pinIndexForProject(projectIndex: number, projectCount: number, pinCount: number): number {
  const count = Math.max(1, projectCount)
  const index = Math.floor(((projectIndex + 0.5) * pinCount) / count)
  return Math.min(pinCount - 1, Math.max(0, index))
}

export type DieBlock = { groupId: SkillGroup['id']; position: Vec3; size: Vec3 }

// Die floor plan (inside the 1.9 x 1.9 die, centred at the origin; back row on -z), a 3x2 grid
// with distinct heights so it reads as a CPU: core = languages, flash/RAM = platforms,
// scheduler = firmware, peripherals = protocols, debug = tools, self-test/BIST = testing.
export const dieBlocks: DieBlock[] = [
  { groupId: 'languages', position: [-0.46, 0, -0.43], size: [0.72, 0.13, 0.74] },
  { groupId: 'platforms', position: [0.17, 0, -0.43], size: [0.42, 0.07, 0.74] },
  { groupId: 'firmware', position: [0.63, 0, -0.43], size: [0.38, 0.1, 0.74] },
  { groupId: 'protocols', position: [-0.53, 0, 0.34], size: [0.58, 0.05, 0.64] },
  { groupId: 'tools', position: [0.06, 0, 0.34], size: [0.48, 0.085, 0.64] },
  { groupId: 'testing', position: [0.59, 0, 0.34], size: [0.46, 0.06, 0.64] },
]
