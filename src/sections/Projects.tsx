import { content } from '../content'
import { setTour, useTour } from '../state/tourStore'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

export default function Projects() {
  const activeId = useTour((t) => t.activeProjectId)
  const active = content.projects.find((p) => p.id === activeId)
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="panel">
        <h2 id="projects-title">Projects</h2>
        <ul className="project-list" aria-label="Projects">
          {content.projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                project={project}
                selected={project.id === activeId}
                onSelect={(id) => setTour({ activeProjectId: id })}
              />
            </li>
          ))}
        </ul>
        {active ? <ProjectDetail project={active} /> : <p className="meta">Select a project for details.</p>}
      </div>
    </section>
  )
}
