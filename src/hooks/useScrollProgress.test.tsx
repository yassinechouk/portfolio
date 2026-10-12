import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollProgress } from './useScrollProgress'

const IDS = ['hero', 'about'] as const

function Probe() {
  useScrollProgress([...IDS])
  return null
}

let resizeCallback: (() => void) | null = null
const observe = vi.fn()
const disconnect = vi.fn()
let measures = 0
let frames: FrameRequestCallback[] = []
const flush = () => frames.splice(0).forEach((cb) => cb(0))

beforeEach(() => {
  resizeCallback = null
  observe.mockClear()
  disconnect.mockClear()
  measures = 0
  frames = []
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: () => void) {
        resizeCallback = cb
      }
      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
    },
  )
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.push(cb)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  for (const id of IDS) {
    const el = document.createElement('section')
    el.id = id
    el.getBoundingClientRect = () => {
      if (id === 'about') measures += 1
      return { top: 0 } as DOMRect
    }
    document.body.appendChild(el)
  }
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('useScrollProgress', () => {
  it('re-measures when document.body resizes and disconnects on cleanup', () => {
    const { unmount } = render(<Probe />)
    flush()
    expect(observe).toHaveBeenCalledWith(document.body)
    const before = measures
    resizeCallback?.()
    flush()
    expect(measures).toBe(before + 1)
    unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
