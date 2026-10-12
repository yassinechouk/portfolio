import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { assetUrl } from '../content/assetUrl'
import type { Media } from '../content/types'

type Props = { item: Media | null; onClose: () => void }

/** Full-screen image viewer. Focus moves to the close button and returns to the opener on close. */
export default function Lightbox({ item, onClose }: Props) {
  const captionId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const open = item !== null

  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    return () => {
      openerRef.current?.focus()
      openerRef.current = null
    }
  }, [open])

  if (!item) return null

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
    if (!focusable || focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    } else if (!dialogRef.current?.contains(active)) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="lightbox" data-testid="lightbox-backdrop" onClick={onClose} onKeyDown={onKeyDown}>
      <div
        ref={dialogRef}
        className="lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={captionId}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={assetUrl(item.src)} alt={item.alt} />
        <p id={captionId} className="lightbox-caption">
          {item.caption}
        </p>
        <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
