import { useRef, useState } from 'react'
import { assetUrl } from '../content/assetUrl'
import type { Project } from '../content/types'
import Lightbox from './Lightbox'

type Props = {
  project: Project
  active: boolean
  onSelect: (id: string) => void
}

/** A big project card: one enlargeable picture, a short description and the proof chips. */
export default function FeaturedProject({ project, active, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const picture = project.media[0]
  const select = () => onSelect(project.id)

  return (
    <article
      className="project featured-project"
      aria-current={active ? 'true' : undefined}
      onClick={select}
      onFocus={select}
    >
      {picture ? (
        <button type="button" className="featured-picture" aria-label={`Enlarge: ${picture.caption}`} onClick={() => setOpen(true)}>
          <img src={assetUrl(picture.src)} alt={picture.alt} loading="lazy" />
        </button>
      ) : null}
      <h3 ref={headingRef} tabIndex={-1}>
        {project.title}
      </h3>
      <p>{project.summary}</p>
      {project.metrics.length > 0 ? (
        <ul className="proof-chips" aria-label="Measured results">
          {project.metrics.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
      ) : null}
      <ul className="chips" aria-label="Technologies">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {project.role ? (
        <p className="meta">
          Role: <span>{project.role}</span>
        </p>
      ) : null}
      <p className="project-links">
        <a href={project.repoUrl} aria-label={`${project.title} repository`}>
          Repository
        </a>
        {project.demoUrl ? <a href={project.demoUrl}>Live demo</a> : null}
      </p>
      <Lightbox item={open && picture ? picture : null} onClose={() => setOpen(false)} fallbackFocus={() => headingRef.current} />
    </article>
  )
}
