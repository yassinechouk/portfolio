import type { Theme } from '../../state/themeStore'

/** Every colour (and the few light levels) the 3D scene uses, per theme. Pure data. */
export type ScenePalette = {
  /** Trace ribbons and their signal pulses. */
  traces: string
  /** `additive` glows on a dark page; `normal` keeps the traces solid teal on a light one. */
  traceBlending: 'additive' | 'normal'
  packageBody: string
  packageDot: string
  /** Engraved name on the package top. */
  label: string
  /** Engraved part number under the name. */
  partLabel: string
  pins: string
  pinMetalness: number
  /** The lit pin of the selected project (and its point light). */
  pinHighlight: string
  dieBase: string
  /** One colour per die block, in `dieBlocks` order (six). */
  dieBlocks: string[]
  /** Body colour of the active (selected skill group) block. */
  dieBlockActive: string
  dieEdge: string
  dieMetalness: number
  dieGlow: string
  dieGlowIdle: number
  dieGlowActive: number
  bondWires: string
  ambientLight: number
  keyLight: number
  rimLight: string
  rimLightIntensity: number
}

const DARK_ACCENT = '#00e5ff'
const LIGHT_ACCENT = '#006d79'

const PALETTES: Record<Theme, ScenePalette> = {
  // The original look: a near-black chip glowing cyan on a dark page.
  dark: {
    traces: DARK_ACCENT,
    traceBlending: 'additive',
    packageBody: '#15191f',
    packageDot: '#2a3038',
    label: '#7d8894',
    partLabel: '#5c6672',
    pins: '#9aa3ad',
    pinMetalness: 0.8,
    pinHighlight: DARK_ACCENT,
    dieBase: '#1c2530',
    dieBlocks: Array<string>(6).fill('#0d1218'),
    dieBlockActive: '#0d1218',
    dieEdge: DARK_ACCENT,
    dieMetalness: 0.3,
    dieGlow: DARK_ACCENT,
    dieGlowIdle: 0.06,
    dieGlowActive: 0.45,
    bondWires: DARK_ACCENT,
    ambientLight: 0.35,
    keyLight: 1.4,
    rimLight: DARK_ACCENT,
    rimLightIntensity: 0.5,
  },
  // A graphite package with silver leads and solid teal traces on a cool light page; the die
  // blocks are light silicon tints so each one reads on its own, the active one turns teal.
  light: {
    traces: '#1fb3bf',
    traceBlending: 'normal',
    packageBody: '#2b3138',
    packageDot: '#434b54',
    label: '#c3ccd4',
    partLabel: '#939ea8',
    pins: '#c9d0d6',
    pinMetalness: 0.45,
    pinHighlight: '#00a2b1',
    dieBase: '#3b4550',
    dieBlocks: ['#b3c7d3', '#dfe6ec', '#a7bcc9', '#cfdce4', '#bed2d8', '#e7ecf0'],
    dieBlockActive: '#11a1ae',
    dieEdge: LIGHT_ACCENT,
    dieMetalness: 0.05,
    dieGlow: '#00c2d1',
    dieGlowIdle: 0,
    dieGlowActive: 0.35,
    bondWires: '#a7b2bc',
    ambientLight: 0.85,
    keyLight: 1.5,
    rimLight: '#9fe3ea',
    rimLightIntensity: 0.35,
  },
}

export function scenePalette(theme: Theme): ScenePalette {
  const p = PALETTES[theme]
  return { ...p, dieBlocks: [...p.dieBlocks] }
}
