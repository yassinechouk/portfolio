import { SECTION_ORDER, type SectionId } from '../state/tourStore'

export type Vec3 = [number, number, number]
export type CameraPose = { position: Vec3; target: Vec3 }

// Chip frame: ~4x4 slab centred at the origin, label faces +y, pins ~0.5 outside each edge.
export const waypoints: Record<SectionId, CameraPose> = {
  hero: { position: [6, 4, 8], target: [0, 0, 0] },
  about: { position: [0.5, 4, 2.5], target: [0, 0, 0] },
  skills: { position: [0.3, 1.6, 0.9], target: [0, 0, 0] },
  projects: { position: [0, 0.8, 5], target: [0, 0, 2.2] },
  contact: { position: [-3, 6, 9], target: [0, 0, 0] },
}

const smoothstep = (t: number): number => t * t * (3 - 2 * t)

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
]

const clonePose = (p: CameraPose): CameraPose => ({
  position: [...p.position],
  target: [...p.target],
})

export function poseAt(progress: number): CameraPose {
  if (!Number.isFinite(progress)) return clonePose(waypoints.hero)
  const last = SECTION_ORDER.length - 1
  const f = Math.min(1, Math.max(0, progress)) * last
  const i = Math.min(Math.floor(f), last - 1)
  const a = waypoints[SECTION_ORDER[i]]
  const b = waypoints[SECTION_ORDER[i + 1]]
  const t = smoothstep(f - i)
  if (t === 0) return clonePose(a)
  if (t === 1) return clonePose(b)
  return { position: lerpVec(a.position, b.position, t), target: lerpVec(a.target, b.target, t) }
}
