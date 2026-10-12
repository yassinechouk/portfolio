import { useState } from 'react'
import { assetUrl } from '../content/assetUrl'
import type { Media, Project } from '../content/types'
import Lightbox from './Lightbox'

export default function ProjectDetail({ project }: { project: Project }) {
  const [open, setOpen] = useState<{ projectId: string; media: Media } | null>(null)
  // Derived so a stale image never stays open over a different project.
  const shown = open && open.projectId === project.id ? open.media : null
  return (
    <section className="project-detail" aria-label="Project details">
      <h3 tabIndex={-1}>{project.title}</h3>
      <p>{project.summary}</p>
      <p className="meta">
        Role: <span>{project.role}</span>
      </p>
      {project.metrics.length > 0 ? (
        <ul className="proof-chips" aria-label="Measured results">
          {project.metrics.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
      ) : null}
      <ul className="chips">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {project.media.length > 0 ? (
        <div className="gallery">
          {project.media.map((m) => (
            <figure key={m.src} className="gallery-item">
              <button type="button" className="gallery-button" aria-label={`Enlarge: ${m.caption}`} onClick={() => setOpen({ projectId: project.id, media: m })}>
                <img src={assetUrl(m.src)} alt={m.alt} loading="lazy" />
              </button>
              <figcaption className="meta">{m.caption}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}
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
      <Lightbox
        item={shown}
        onClose={() => setOpen(null)}
        fallbackFocus={() => document.querySelector<HTMLElement>('.project-detail h3')}
      />
    </section>
  )
}
