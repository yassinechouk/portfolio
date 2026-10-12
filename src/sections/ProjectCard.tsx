import { assetUrl } from '../content/assetUrl'
import type { Project } from '../content/types'

type Props = {
  project: Project
  selected: boolean
  onSelect: (id: string) => void
}

export default function ProjectCard({ project, selected, onSelect }: Props) {
  const cover = project.media[0]
  return (
    <button
      type="button"
      className="project-card"
      aria-pressed={selected}
      onClick={() => onSelect(project.id)}
    >
      {cover ? (
        <img className="project-cover" src={assetUrl(cover.src)} alt="" loading="lazy" />
      ) : null}
      <span className="project-title">{project.title}</span>
      {project.metrics.length > 0 ? (
        <span className="proof-chips">
          {project.metrics.map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </span>
      ) : null}
      <span className="chips">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </span>
    </button>
  )
}
