import { content } from '../content'
import { assetUrl } from '../content/assetUrl'
import type { ExperienceItem } from '../content/types'

/** Work history as a timeline, newest first (the order of `items`). */
export default function Experience({ items = content.experience }: { items?: ExperienceItem[] }) {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="panel">
        <h2 id="experience-title">Experience</h2>
        <ol className="timeline">
          {items.map((job) => (
            <li key={job.id} className="timeline-item">
              <article className="job">
                <p className="meta job-period">{job.period}</p>
                <h3>{job.role}</h3>
                <p className="job-org">
                  {job.organization}, {job.place}
                </p>
                <ul className="job-outcomes">
                  {job.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
                <ul className="chips">
                  {job.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {job.image ? (
                  <figure className="job-figure">
                    <img src={assetUrl(job.image.src)} alt={job.image.alt} loading="lazy" />
                    <figcaption className="meta">{job.image.caption}</figcaption>
                  </figure>
                ) : null}
                {job.repoUrl ? (
                  <p className="job-links">
                    <a href={job.repoUrl}>Repository</a>
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
