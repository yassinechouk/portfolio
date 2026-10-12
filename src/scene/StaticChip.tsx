import { assetUrl } from '../content/assetUrl'
import { useTheme } from '../state/themeStore'

const STILL = { light: 'chip-fallback-light.png', dark: 'chip-fallback.png' } as const

/** Fixed full-viewport still of the chip (per theme), used when the live scene is unavailable. */
export default function StaticChip() {
  const theme = useTheme()
  return <img className="static-chip" src={assetUrl(STILL[theme])} alt="Illustration of a microcontroller chip" />
}
