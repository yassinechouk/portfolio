import { useEffect } from 'react'
import { type SectionId, setTour } from '../state/tourStore'
import { progressFromTops } from './progressFromTops'

export function useScrollProgress(sectionIds: SectionId[]): void {
  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const found = sectionIds
        .map((id) => ({ id, el: document.getElementById(id) }))
        .filter((s): s is { id: SectionId; el: HTMLElement } => s.el !== null)
        .map((s) => ({ id: s.id, top: s.el.getBoundingClientRect().top + window.scrollY }))
      if (found.length === 0) return
      const y = window.scrollY
      let active = found[0].id
      for (const s of found) if (y >= s.top - window.innerHeight / 2) active = s.id
      setTour({ progress: progressFromTops(found.map((s) => s.top), y), activeSection: active })
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [sectionIds])
}
