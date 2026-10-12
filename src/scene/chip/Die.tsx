import { Edges } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import type { SkillGroup } from '../../content/types'
import { ACCENT, BODY_SIZE, PIN_LENGTH, PINS_PER_SIDE, dieBlocks, pinPositions } from './geometry'

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
export function Die({ activeGroup }: { activeGroup: SkillGroup['id'] | null }) {
  const wires = useMemo(() => buildBondWires(), [])
  useEffect(() => () => wires.dispose(), [wires])

  return (
    <group>
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[DIE_SIZE, 0.04, DIE_SIZE]} />
        <meshStandardMaterial color="#1c2530" metalness={0.4} roughness={0.5} />
      </mesh>
      {dieBlocks.map((block) => {
        const active = block.groupId === activeGroup
        return (
          <mesh key={block.groupId} position={[block.position[0], 0.01 + block.size[1] / 2, block.position[2]]}>
            <boxGeometry args={block.size} />
            <meshStandardMaterial
              color="#0d1218"
              emissive={ACCENT}
              emissiveIntensity={active ? 0.45 : 0.06}
              metalness={0.3}
              roughness={0.6}
            />
            <Edges color={ACCENT} transparent opacity={active ? 1 : 0.45} />
          </mesh>
        )
      })}
      <lineSegments geometry={wires}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.35} />
      </lineSegments>
    </group>
  )
}
