import { describe, expect, it } from 'vitest'
import { pulseFragmentShader, pulseVertexShader } from './pulse'

describe('pulse shaders', () => {
  // pow(x, y) is undefined in GLSL for x < 0 (NaN on ANGLE/D3D), so square explicitly instead.
  it.each([
    ['fragment', pulseFragmentShader],
    ['vertex', pulseVertexShader],
  ])('the %s shader never calls pow()', (_, source) => {
    expect(source).not.toMatch(/\bpow\s*\(/)
  })
})
