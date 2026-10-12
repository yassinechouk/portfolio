import { useEffect } from 'react'
import { type SectionId, setTour } from '../state/tourStore'
import { clampTopsToMaxScroll } from './clampTops'
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
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      let active = found[0].id
      for (const s of found) if (y >= s.top - window.innerHeight / 2) active = s.id
      if (maxScroll > 0 && y >= maxScroll - 1) active = found[found.length - 1].id
      const tops = clampTopsToMaxScroll(found.map((s) => s.top), maxScroll)
      setTour({ progress: progressFromTops(tops, y), activeSection: active })
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resizeObserver?.observe(document.body)
    schedule()
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [sectionIds])
}
