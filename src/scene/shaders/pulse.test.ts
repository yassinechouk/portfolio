import { describe, expect, it } from 'vitest'
import { createPulseUniforms, pulseFragmentShader, pulseVertexShader } from './pulse'

describe('pulse shaders', () => {
  // pow(x, y) is undefined in GLSL for x < 0 (NaN on ANGLE/D3D), so square explicitly instead.
  it.each([
    ['fragment', pulseFragmentShader],
    ['vertex', pulseVertexShader],
  ])('the %s shader never calls pow()', (_, source) => {
    expect(source).not.toMatch(/\bpow\s*\(/)
  })
})

describe('createPulseUniforms', () => {
  it('starts in additive mode with the given colour', () => {
    const u = createPulseUniforms('#00e5ff')
    expect(u.uOpaque.value).toBe(0)
    expect(u.uAccent.value.getHexString()).toBe('00e5ff')
  })

  it('honours the initial opaque flag, so the first frame already uses the right mode', () => {
    expect(createPulseUniforms('#1fb3bf', true).uOpaque.value).toBe(1)
    expect(createPulseUniforms('#00e5ff', false).uOpaque.value).toBe(0)
  })
})
