import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, NormalBlending, type ShaderMaterial } from 'three'
import { getTour } from '../../state/tourStore'
import { createPulseUniforms, pulseFragmentShader, pulseVertexShader, type PulseUniforms } from '../shaders/pulse'
import { BODY_SIZE, BODY_THICKNESS, PINS_PER_SIDE } from './geometry'
import type { ScenePalette } from './palette'

const HALF = BODY_SIZE / 2
const PITCH = (BODY_SIZE * 0.85) / PINS_PER_SIDE
const WIDTH = 0.03
const Y = BODY_THICKNESS / 2 + 0.003
const BOOT_SECONDS = 1.6

type P2 = [number, number]

// (lateral, normal) on a side -> world x/z, matching pinPositions' side order.
function toWorld(side: number, [lat, norm]: P2): P2 {
  if (side === 0) return [lat, norm]
  if (side === 1) return [norm, -lat]
  if (side === 2) return [-lat, -norm]
  return [-norm, lat]
}

function buildTraces(lite: boolean): BufferGeometry {
  const pos: number[] = []
  const dist: number[] = []
  const trace: number[] = []
  const phase: number[] = []
  const pulse: number[] = []
  const index: number[] = []
  let count = 0
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < PINS_PER_SIDE; i++) {
      // The front row carries the project pins, so it always keeps every trace.
      if (lite && side !== 0 && i % 3 !== 0) continue
      const s = (i - (PINS_PER_SIDE - 1) / 2) * PITCH
      const path: P2[] = [
        [s * 0.85, HALF - 0.5 + (i % 2) * 0.08],
        [s, HALF - 0.25],
        [s, HALF - 0.02],
      ].map((p) => toWorld(side, p as P2))
      const lengths = path.slice(1).map((p, k) => Math.hypot(p[0] - path[k][0], p[1] - path[k][1]))
      const total = lengths.reduce((a, b) => a + b, 0)
      const g = side * PINS_PER_SIDE + i
      const ph = (Math.sin(g * 12.9898) * 43758.5453) % 1
      const pulses = lite ? (count % 2 === 0 ? 1 : 0) : 1
      let travelled = 0
      for (let k = 0; k < lengths.length; k++) {
        const [ax, az] = path[k]
        const [bx, bz] = path[k + 1]
        const nx = (-(bz - az) / lengths[k]) * (WIDTH / 2)
        const nz = ((bx - ax) / lengths[k]) * (WIDTH / 2)
        const d0 = travelled / total
        const d1 = (travelled + lengths[k]) / total
        travelled += lengths[k]
        const base = pos.length / 3
        pos.push(ax + nx, Y, az + nz, ax - nx, Y, az - nz, bx + nx, Y, bz + nz, bx - nx, Y, bz - nz)
        dist.push(d0, d0, d1, d1)
        for (let v = 0; v < 4; v++) {
          trace.push(g)
          phase.push(Math.abs(ph))
          pulse.push(pulses)
        }
        index.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
      }
      count++
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geometry.setAttribute('aDist', new BufferAttribute(new Float32Array(dist), 1))
  geometry.setAttribute('aTrace', new BufferAttribute(new Float32Array(trace), 1))
  geometry.setAttribute('aPhase', new BufferAttribute(new Float32Array(phase), 1))
  geometry.setAttribute('aPulse', new BufferAttribute(new Float32Array(pulse), 1))
  geometry.setIndex(index)
  return geometry
}

/** Glowing traces on the package top, one per pin, with signal pulses travelling outward. */
export function Traces({ lite, activePin, palette }: { lite: boolean; activePin: number | null; palette: ScenePalette }) {
  const geometry = useMemo(() => buildTraces(lite), [lite])
  const opaque = palette.traceBlending === 'normal'
  // Created once in the current theme's mode, so the first frame matches the blending; a theme
  // change only rewrites the colour and mode uniforms in the effect below.
  const [uniforms] = useState(() => createPulseUniforms(palette.traces, opaque))
  const material = useRef<ShaderMaterial>(null)
  const boot = useRef({ section: getTour().activeSection, start: -Infinity })

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    if (!material.current) return
    const u = material.current.uniforms as PulseUniforms
    u.uAccent.value.set(palette.traces)
    u.uOpaque.value = opaque ? 1 : 0
  }, [palette.traces, opaque])

  useFrame(({ clock }) => {
    if (!material.current) return
    const u = material.current.uniforms as PulseUniforms
    const t = clock.getElapsedTime()
    const section = getTour().activeSection
    const b = boot.current
    if (section !== b.section) {
      if (section === 'contact') b.start = t
      b.section = section
    }
    u.uTime.value = t
    u.uActive.value = activePin ?? -1
    u.uBoot.value = Number.isFinite(b.start) ? (t - b.start) / BOOT_SECONDS : -1
  })

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <shaderMaterial
        ref={material}
        vertexShader={pulseVertexShader}
        fragmentShader={pulseFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={opaque ? NormalBlending : AdditiveBlending}
      />
    </mesh>
  )
}
