import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import type { MeshStandardMaterial } from 'three'
// Bundled so the label never depends on troika's default CDN font at runtime.
import labelFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff?url'
import { getTour } from '../../state/tourStore'
import { packageOpacity } from './fade'
import { BODY_SIZE, BODY_THICKNESS } from './geometry'

const TOP = BODY_THICKNESS / 2

type Fadeable = { fillOpacity: number }

/** Dark package body with a pin-1 dot and an engraved label; fades as the camera dives in. */
export function Package() {
  const body = useRef<MeshStandardMaterial>(null)
  const dot = useRef<MeshStandardMaterial>(null)
  const name = useRef<Fadeable>(null)
  const part = useRef<Fadeable>(null)

  useFrame(() => {
    const o = packageOpacity(getTour().progress)
    if (body.current) {
      body.current.opacity = o
      body.current.depthWrite = o > 0.99
    }
    if (dot.current) dot.current.opacity = o
    // The label stays crisp while the camera reads it, then vanishes before the die view.
    const label = Math.min(1, Math.max(0, (o - 0.3) / 0.55))
    if (name.current) name.current.fillOpacity = label
    if (part.current) part.current.fillOpacity = label
  })

  return (
    <group>
      <mesh>
        <boxGeometry args={[BODY_SIZE, BODY_THICKNESS, BODY_SIZE]} />
        <meshStandardMaterial ref={body} color="#15191f" metalness={0.15} roughness={0.7} transparent />
      </mesh>
      <mesh position={[-1.15, TOP + 0.001, 1.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial ref={dot} color="#2a3038" roughness={0.9} transparent />
      </mesh>
      <Suspense fallback={null}>
        <group position={[0, TOP + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text ref={name} font={labelFont} fontSize={0.3} letterSpacing={0.08} color="#7d8894" anchorX="center" anchorY="middle" position={[0, 0.2, 0]}>
            YASSINE CHOUK
          </Text>
          <Text ref={part} font={labelFont} fontSize={0.19} letterSpacing={0.12} color="#5c6672" anchorX="center" anchorY="middle" position={[0, -0.25, 0]}>
            YC-MCU32
          </Text>
        </group>
      </Suspense>
    </group>
  )
}
