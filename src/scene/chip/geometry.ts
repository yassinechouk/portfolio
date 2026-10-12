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

// Die floor plan (inside the package, centred at the origin):
// CPU core = languages, memory = platforms, peripherals = protocols, debug/tools = tools.
export const dieBlocks: DieBlock[] = [
  { groupId: 'languages', position: [-0.38, 0, -0.32], size: [0.62, 0.1, 0.72] },
  { groupId: 'platforms', position: [0.4, 0, -0.32], size: [0.6, 0.06, 0.72] },
  { groupId: 'protocols', position: [-0.2, 0, 0.42], size: [1.0, 0.05, 0.4] },
  { groupId: 'tools', position: [0.56, 0, 0.42], size: [0.28, 0.08, 0.4] },
]

/** Single scene accent; matches the CSS `--accent` default. */
export const ACCENT = '#00e5ff'
