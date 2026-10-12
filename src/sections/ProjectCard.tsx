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
      {cover ? <img src={assetUrl(cover.src)} alt="" loading="lazy" /> : null}
      <span className="project-title">{project.title}</span>
      <span className="chips">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </span>
    </button>
  )
}
