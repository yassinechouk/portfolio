import { useEffect, useRef } from 'react'
import { content } from '../content'
import { getTour, setTour, useTour } from '../state/tourStore'
import CompactProject from './CompactProject'
import FeaturedProject from './FeaturedProject'
import { pickActiveItem } from './pickActiveItem'

export default function Projects() {
  const activeId = useTour((t) => t.activeProjectId)
  // The first project is the active one until another is chosen or scrolled to.
  const active = content.projects.find((p) => p.id === activeId) ?? content.projects[0]
  const featured = content.projects.filter((p) => p.featured)
  const compact = content.projects.filter((p) => !p.featured)
  const inProjects = useTour((t) => t.activeSection === 'projects')
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const itemRef = (id: string) => (el: HTMLLIElement | null) => {
    if (el) itemRefs.current.set(id, el)
    else itemRefs.current.delete(id)
  }
  const select = (id: string) => setTour({ activeProjectId: id })

  useEffect(() => {
    if (inProjects && getTour().activeProjectId === null) {
      setTour({ activeProjectId: content.projects[0].id })
    }
  }, [inProjects])

  useEffect(() => {
    if (!inProjects || typeof IntersectionObserver === 'undefined') return
    const idByElement = new Map<Element, string>()
    for (const [id, el] of itemRefs.current) idByElement.set(el, id)
    const visible = new Set<string>()
    const update = () => {
      // Fresh geometry, in project order, so side-by-side cards are swept left to right.
      const rects = content.projects.flatMap((p) => {
        const el = itemRefs.current.get(p.id)
        if (!el || !visible.has(p.id)) return []
        const { top, height } = el.getBoundingClientRect()
        return [{ id: p.id, top, height }]
      })
      const best = pickActiveItem(rects, window.innerHeight / 2)
      if (best !== null && best !== getTour().activeProjectId) setTour({ activeProjectId: best })
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idByElement.get(entry.target)
          if (id === undefined) continue
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
        }
        update()
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    for (const el of idByElement.keys()) observer.observe(el)
    // Intersection thresholds are too coarse to catch the middle of a tall row.
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update)
    }
  }, [inProjects])

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="panel">
        <h2 id="projects-title">Projects</h2>
        <ul className="featured-list" aria-label="Featured projects">
          {featured.map((project) => (
            <li key={project.id} ref={itemRef(project.id)}>
              <FeaturedProject project={project} active={project.id === active.id} onSelect={select} />
            </li>
          ))}
        </ul>
        <h3 className="more-projects">More projects</h3>
        <ul className="compact-list" aria-label="More projects">
          {compact.map((project) => (
            <li key={project.id} ref={itemRef(project.id)}>
              <CompactProject project={project} active={project.id === active.id} onSelect={select} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
