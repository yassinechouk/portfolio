import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useWebGLSupport } from '../hooks/useWebGLSupport'
import SceneErrorBoundary from './SceneErrorBoundary'
import StaticChip from './StaticChip'

const Scene = lazy(() => import('./Scene'))

/** Fixed backdrop: the live scene when possible, otherwise a static image. */
export default function SceneHost() {
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const [contextLost, setContextLost] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // webglcontextlost does not bubble; a capture listener still sees it from an ancestor.
    const onLost = (event: Event) => {
      event.preventDefault()
      setContextLost(true)
    }
    el.addEventListener('webglcontextlost', onLost, true)
    return () => el.removeEventListener('webglcontextlost', onLost, true)
  }, [])

  const showScene = webgl && !reduced && !contextLost

  return (
    <div className="scene-host" ref={ref} aria-hidden={showScene ? true : undefined}>
      {showScene ? (
        <SceneErrorBoundary fallback={<StaticChip />}>
          <Suspense fallback={<StaticChip />}>
            <Scene />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <StaticChip />
      )}
    </div>
  )
}
