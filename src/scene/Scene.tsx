import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../state/themeStore'
import { waypoints } from './cameraPath'
import { Chip } from './chip/Chip'
import { scenePalette } from './chip/palette'
import { useCameraRig } from './useCameraRig'

const isLite = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(max-width: 768px)').matches

const isHidden = (): boolean => typeof document !== 'undefined' && document.hidden

function Lights() {
  const theme = useTheme()
  const p = useMemo(() => scenePalette(theme), [theme])
  return (
    <>
      <ambientLight intensity={p.ambientLight} />
      <directionalLight position={[5, 8, 4]} intensity={p.keyLight} />
      <directionalLight position={[-6, 3, -5]} intensity={p.rimLightIntensity} color={p.rimLight} />
    </>
  )
}

function CameraRig() {
  useCameraRig()
  return null
}

/** Full-viewport WebGL scene: the MCU chip toured by a scroll-driven camera. */
export default function Scene() {
  const [lite] = useState(isLite)
  const [hidden, setHidden] = useState(isHidden)

  useEffect(() => {
    const onVisibility = () => setHidden(isHidden())
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={hidden ? 'never' : 'always'}
      camera={{ position: waypoints.hero.position, fov: 40, near: 0.05, far: 100 }}
      gl={{ antialias: !lite, alpha: true }}
    >
      <Lights />
      <CameraRig />
      <Chip lite={lite} />
    </Canvas>
  )
}
