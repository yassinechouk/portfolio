import { useLayoutEffect, useRef } from 'react'
import { Matrix4, type InstancedMesh } from 'three'
import { BODY_SIZE, PIN_LENGTH, PINS_PER_SIDE, pinPositions } from './geometry'
import type { ScenePalette } from './palette'

const PIN_WIDTH = ((BODY_SIZE * 0.85) / PINS_PER_SIDE) * 0.45
const PIN_THICKNESS = 0.05
const PIN_Y = -0.06
const PINS = pinPositions(PINS_PER_SIDE, BODY_SIZE, PIN_LENGTH)
const isAlongZ = (index: number): boolean => Math.floor(index / PINS_PER_SIDE) % 2 === 0
const ALONG = PINS.map((_, i) => i).filter(isAlongZ)
const ACROSS = PINS.map((_, i) => i).filter((i) => !isAlongZ(i))

// Front/back pins run along z, left/right pins along x.
const sizeFor = (index: number): [number, number, number] =>
  isAlongZ(index)
    ? [PIN_WIDTH, PIN_THICKNESS, PIN_LENGTH]
    : [PIN_LENGTH, PIN_THICKNESS, PIN_WIDTH]

/** Flat leads on all four sides; the active project's pin glows in the highlight colour. */
export function Pins({ activePin, palette }: { activePin: number | null; palette: ScenePalette }) {
  const alongRef = useRef<InstancedMesh>(null)
  const acrossRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const m = new Matrix4()
    const place = (mesh: InstancedMesh | null, indices: number[]) => {
      if (!mesh) return
      indices.forEach((pin, k) => {
        const [x, , z] = PINS[pin]
        mesh.setMatrixAt(k, m.makeTranslation(x, PIN_Y, z))
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    place(alongRef.current, ALONG)
    place(acrossRef.current, ACROSS)
  }, [])

  const active = activePin === null ? null : PINS[activePin]

  return (
    <group>
      <instancedMesh ref={alongRef} args={[undefined, undefined, ALONG.length]}>
        <boxGeometry args={sizeFor(0)} />
        <meshStandardMaterial color={palette.pins} metalness={palette.pinMetalness} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={acrossRef} args={[undefined, undefined, ACROSS.length]}>
        <boxGeometry args={sizeFor(PINS_PER_SIDE)} />
        <meshStandardMaterial color={palette.pins} metalness={palette.pinMetalness} roughness={0.35} />
      </instancedMesh>
      {active && activePin !== null && (
        <mesh position={[active[0], PIN_Y, active[2]]}>
          <boxGeometry args={sizeFor(activePin).map((v) => v * 1.12) as [number, number, number]} />
          <meshBasicMaterial color={palette.pinHighlight} toneMapped={false} />
          <pointLight color={palette.pinHighlight} intensity={0.8} distance={1.4} />
        </mesh>
      )}
    </group>
  )
}
