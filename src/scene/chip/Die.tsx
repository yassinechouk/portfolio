import { Edges } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import type { SkillGroup } from '../../content/types'
import { BODY_SIZE, PIN_LENGTH, PINS_PER_SIDE, dieBlocks, pinPositions } from './geometry'
import type { ScenePalette } from './palette'

const DIE_SIZE = 1.9
const DIE_HALF = DIE_SIZE / 2
const LEAD_IN = BODY_SIZE / 2 - 0.05

// Bond wires from the die edge to each lead, arcing slightly above the die.
function buildBondWires(): BufferGeometry {
  const points: number[] = []
  for (const [x, , z] of pinPositions(PINS_PER_SIDE, BODY_SIZE, PIN_LENGTH)) {
    const scale = Math.max(Math.abs(x), Math.abs(z))
    const pad = [(x / scale) * DIE_HALF * 0.92, 0.04, (z / scale) * DIE_HALF * 0.92]
    const mid = [(x / scale) * (DIE_HALF + LEAD_IN) * 0.5, 0.12, (z / scale) * (DIE_HALF + LEAD_IN) * 0.5]
    const lead = [(x / scale) * LEAD_IN, -0.05, (z / scale) * LEAD_IN]
    points.push(...pad, ...mid, ...mid, ...lead)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3))
  return geometry
}

/** Silicon die inside the package; each block is one skill group, the active one glows. */
export function Die({ activeGroup, palette }: { activeGroup: SkillGroup['id'] | null; palette: ScenePalette }) {
  const wires = useMemo(() => buildBondWires(), [])
  useEffect(() => () => wires.dispose(), [wires])

  return (
    <group>
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[DIE_SIZE, 0.04, DIE_SIZE]} />
        <meshStandardMaterial color={palette.dieBase} metalness={0.4} roughness={0.5} />
      </mesh>
      {dieBlocks.map((block, i) => {
        const active = block.groupId === activeGroup
        return (
          <mesh key={block.groupId} position={[block.position[0], 0.01 + block.size[1] / 2, block.position[2]]}>
            <boxGeometry args={block.size} />
            <meshStandardMaterial
              color={active ? palette.dieBlockActive : palette.dieBlocks[i]}
              emissive={palette.dieGlow}
              emissiveIntensity={active ? palette.dieGlowActive : palette.dieGlowIdle}
              metalness={palette.dieMetalness}
              roughness={0.6}
            />
            <Edges color={palette.dieEdge} transparent opacity={active ? 1 : 0.45} />
          </mesh>
        )
      })}
      <lineSegments geometry={wires}>
        <lineBasicMaterial color={palette.bondWires} transparent opacity={0.35} />
      </lineSegments>
    </group>
  )
}
