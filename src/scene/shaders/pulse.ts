import { Color } from 'three'

// Signal pulses along trace ribbons. Per-vertex attributes:
//   aDist  0 at the inner end of a trace, 1 at its pin end (pulses travel outward)
//   aTrace pin index the trace belongs to (compared with uActive)
//   aPhase pulse offset in [0, 1); aPulse 1 when the trace carries pulses, 0 when it only glows
export const pulseVertexShader = /* glsl */ `
attribute float aDist;
attribute float aTrace;
attribute float aPhase;
attribute float aPulse;
varying float vDist;
varying float vTrace;
varying float vPhase;
varying float vPulse;
void main() {
  vDist = aDist;
  vTrace = aTrace;
  vPhase = aPhase;
  vPulse = aPulse;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const pulseFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform float uActive;
uniform float uBoot;
varying float vDist;
varying float vTrace;
varying float vPhase;
varying float vPulse;
void main() {
  float isActive = 1.0 - step(0.5, abs(vTrace - uActive));
  float speed = mix(0.22, 0.6, isActive);
  float head = fract(uTime * speed + vPhase);
  float behind = head - vDist;
  float trail = step(0.0, behind) * (1.0 - smoothstep(0.0, 0.14, behind));
  float pulse = trail * max(vPulse, isActive);
  // Squared explicitly: a power function with a negative base is undefined in GLSL (NaN on ANGLE/D3D).
  float bootD = (vDist - uBoot) * 10.0;
  float boot = (uBoot >= 0.0 && uBoot <= 1.2) ? exp(-bootD * bootD) : 0.0;
  float intensity = 0.32 + isActive * 0.4 + pulse * (0.9 + isActive * 1.4) + boot * 1.6;
  gl_FragColor = vec4(uAccent * intensity, clamp(intensity, 0.0, 1.0));
}
`

export type PulseUniforms = {
  uTime: { value: number }
  uAccent: { value: Color }
  uActive: { value: number }
  uBoot: { value: number }
}

export function createPulseUniforms(accent: string): PulseUniforms {
  return {
    uTime: { value: 0 },
    uAccent: { value: new Color(accent) },
    uActive: { value: -1 },
    uBoot: { value: -1 },
  }
}
