import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTour, setTour, subscribe, useTour } from './tourStore'

beforeEach(() => {
  act(() => {
    setTour({ progress: 0, activeSection: 'hero', activeProjectId: null, activeSkillGroup: null })
  })
})

describe('tourStore', () => {
  it('setTour notifies subscribers', () => {
    const listener = vi.fn()
    const off = subscribe(listener)
    setTour({ progress: 0.5 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getTour().progress).toBe(0.5)
    off()
    setTour({ progress: 0.6 })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('useTour only re-renders when the selected value changes', () => {
    let renders = 0
    function Probe() {
      const s = useTour((t) => t.activeSection)
      renders++
      return <span>{s}</span>
    }
    render(<Probe />)
    const initial = renders
    act(() => setTour({ progress: 0.3 }))
    expect(renders).toBe(initial)
    act(() => setTour({ activeSection: 'about' }))
    expect(renders).toBe(initial + 1)
  })
})
