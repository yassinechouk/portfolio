import { assetUrl } from '../content/assetUrl'
import type { Project } from '../content/types'

export default function ProjectDetail({ project }: { project: Project }) {
  return (
    <section className="project-detail" aria-label="Project details">
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <p className="meta">
        Role: <span>{project.role}</span>
      </p>
      <ul className="chips">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {project.media.map((m) => (
        <img key={m.src} src={assetUrl(m.src)} alt={m.alt} />
      ))}
      <ul className="links">
        <li>
          <a href={project.repoUrl}>Repository</a>
        </li>
        {project.demoUrl ? (
          <li>
            <a href={project.demoUrl}>Live demo</a>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
