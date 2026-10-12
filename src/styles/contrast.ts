/** WCAG 2.x contrast helpers for the colour tokens (used by tests; no runtime callers). */

export type Rgba = { r: number; g: number; b: number; a: number }

/** Parses `#rgb`, `#rrggbb`, `rgb(...)` and `rgba(...)` (comma or space separated). */
export function parseColor(input: string): Rgba {
  const s = input.trim().toLowerCase()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s)
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1]
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 }
  }
  const fn = /^rgba?\(([^)]+)\)$/.exec(s)
  if (fn) {
    const [r, g, b, a = 1] = fn[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
  }
  throw new Error(`Unsupported colour: ${input}`)
}

const toHex = (c: Rgba): string => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

/** Source-over composite of `over` onto the opaque `under`; returns an opaque `#rrggbb`. */
export function composite(over: string, under: string): string {
  const o = parseColor(over)
  const u = parseColor(under)
  const mix = (a: number, b: number) => a * o.a + b * (1 - o.a)
  return toHex({ r: mix(o.r, u.r), g: mix(o.g, u.g), b: mix(o.b, u.b), a: 1 })
}

function luminance(colour: string): number {
  const { r, g, b } = parseColor(colour)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two opaque colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
