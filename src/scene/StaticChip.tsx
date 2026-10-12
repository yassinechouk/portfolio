import { assetUrl } from '../content/assetUrl'

/** Fixed full-viewport still of the chip, used when the live scene is unavailable. */
export default function StaticChip() {
  return (
    <img
      className="static-chip"
      src={assetUrl('chip-fallback.png')}
      alt="Illustration of a microcontroller chip"
    />
  )
}
