import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { getTour } from '../state/tourStore'
import { poseAt } from './cameraPath'

const EASE = 3.5 // 1/s; higher follows the scroll more tightly
const SWAY = 0.3 // rad; hero orbit amplitude
const TILT = 0.12 // world units of parallax shift at the screen edge

/**
 * Eases the camera toward poseAt(progress) every frame (pulled back on portrait screens). Adds a slow orbit sway around the
 * chip near the hero stop and a small mouse parallax; neither is needed to use the page.
 */
export function useCameraRig(): void {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const target = useRef<Vector3 | null>(null)
  const goal = useRef({ position: new Vector3(), target: new Vector3() })
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ clock }, delta) => {
    const { progress } = getTour()
    const pose = poseAt(progress)
    const g = goal.current
    g.position.set(...pose.position)
    g.target.set(...pose.target)
    // Portrait screens: back off along the view ray so the chip still fits horizontally.
    if (aspect < 1) g.position.sub(g.target).multiplyScalar(1 / aspect).add(g.target)

    const hero = Math.max(0, 1 - (Number.isFinite(progress) ? progress : 0) * 4)
    if (hero > 0) {
      g.position.applyAxisAngle(UP, Math.sin(clock.getElapsedTime() * 0.12) * SWAY * hero)
    }
    g.position.x += pointer.current.x * TILT
    g.position.y -= pointer.current.y * TILT

    if (!target.current) {
      // First frame: snap so the page never opens with a fly-in from the origin.
      target.current = g.target.clone()
      camera.position.copy(g.position)
    } else {
      const k = 1 - Math.exp(-EASE * Math.min(delta, 0.1))
      camera.position.lerp(g.position, k)
      target.current.lerp(g.target, k)
    }
    camera.lookAt(target.current)
  })
}

const UP = new Vector3(0, 1, 0)
