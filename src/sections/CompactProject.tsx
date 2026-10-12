import type { Project } from '../content/types'

type Props = {
  project: Project
  active: boolean
  onSelect: (id: string) => void
}

/** A one-line project row: title, a sentence, tags and the source link. */
export default function CompactProject({ project, active, onSelect }: Props) {
  const select = () => onSelect(project.id)
  return (
    <article
      className="project compact-project"
      aria-current={active ? 'true' : undefined}
      onClick={select}
      onFocus={select}
    >
      <div className="compact-text">
        <h4>{project.title}</h4>
        <p>{project.summary}</p>
      </div>
      <ul className="chips" aria-label="Technologies">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <p className="project-links">
        <a href={project.repoUrl} aria-label={`${project.title} repository`}>
          Repository
        </a>
        {project.demoUrl ? <a href={project.demoUrl}>Live demo</a> : null}
      </p>
    </article>
  )
}
