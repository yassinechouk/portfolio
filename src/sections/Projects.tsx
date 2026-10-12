import { useEffect, useRef } from 'react'
import { content } from '../content'
import { getTour, setTour, useTour } from '../state/tourStore'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

export default function Projects() {
  const activeId = useTour((t) => t.activeProjectId)
  const active = content.projects.find((p) => p.id === activeId)
  const inProjects = useTour((t) => t.activeSection === 'projects')
  const itemRefs = useRef(new Map<string, HTMLLIElement>())

  useEffect(() => {
    if (inProjects && getTour().activeProjectId === null) {
      setTour({ activeProjectId: content.projects[0].id })
    }
  }, [inProjects])

  useEffect(() => {
    if (!inProjects || typeof IntersectionObserver === 'undefined') return
    const idByElement = new Map<Element, string>()
    for (const [id, el] of itemRefs.current) idByElement.set(el, id)
    const rects = new Map<string, DOMRectReadOnly>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idByElement.get(entry.target)
          if (id === undefined) continue
          if (entry.isIntersecting) rects.set(id, entry.boundingClientRect)
          else rects.delete(id)
        }
        const mid = window.innerHeight / 2
        let best: string | null = null
        let bestDistance = Infinity
        for (const [id, rect] of rects) {
          const distance = Math.abs(rect.top + rect.height / 2 - mid)
          if (distance < bestDistance) {
            best = id
            bestDistance = distance
          }
        }
        if (best !== null && best !== getTour().activeProjectId) setTour({ activeProjectId: best })
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    for (const el of idByElement.keys()) observer.observe(el)
    return () => observer.disconnect()
  }, [inProjects])

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="panel">
        <h2 id="projects-title">Projects</h2>
        <ul className="project-list" aria-label="Projects">
          {content.projects.map((project) => (
            <li
              key={project.id}
              ref={(el) => {
                if (el) itemRefs.current.set(project.id, el)
                else itemRefs.current.delete(project.id)
              }}
            >
              <ProjectCard
                project={project}
                selected={project.id === activeId}
                onSelect={(id) => setTour({ activeProjectId: id })}
              />
            </li>
          ))}
        </ul>
        {active ? <ProjectDetail key={active.id} project={active} /> : <p className="meta">Select a project for details.</p>}
      </div>
    </section>
  )
}
