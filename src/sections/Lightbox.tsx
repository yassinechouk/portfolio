import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { assetUrl } from '../content/assetUrl'
import type { Media } from '../content/types'

type Props = {
  item: Media | null
  onClose: () => void
  /** Where focus goes on close if the opener has left the document. */
  fallbackFocus?: () => HTMLElement | null
}

/** Full-screen image viewer. Focus moves to the close button and returns to the opener on close. */
export default function Lightbox({ item, onClose, fallbackFocus }: Props) {
  const captionId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const fallbackRef = useRef(fallbackFocus)
  const open = item !== null

  useEffect(() => {
    onCloseRef.current = onClose
    fallbackRef.current = fallbackFocus
  })

  useEffect(() => {
    if (!open) return
    const opener =
      document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = dialogRef.current?.contains(active) ?? false
      if (!inside || (e.shiftKey && active === first)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      const target = opener?.isConnected ? opener : (fallbackRef.current?.() ?? null)
      target?.focus()
    }
  }, [open])

  if (!item) return null

  return createPortal(
    <div className="lightbox" data-testid="lightbox-backdrop" onClick={onClose}>
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
    </div>,
    document.body,
  )
}
