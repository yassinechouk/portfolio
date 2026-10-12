import { useState } from 'react'

function detectWebGL(): boolean {
  try {
    if (typeof document === 'undefined') return false
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function useWebGLSupport(): boolean {
  const [supported] = useState(detectWebGL)
  return supported
}
