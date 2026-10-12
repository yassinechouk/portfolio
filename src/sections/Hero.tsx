import { content } from '../content'
import { assetUrl } from '../content/assetUrl'

export default function Hero() {
  const { name, role, affiliation, availability, headline, tagline, links } = content.about
  return (
    <section id="hero" className="section" aria-labelledby="hero-title">
      <div className="panel hero-panel">
        <p className="badge">{availability}</p>
        <h1 id="hero-title">{name}</h1>
        <p className="hero-role">
          <span className="hero-role-title">{role}</span>{' '}
          <span className="hero-affiliation">{affiliation}</span>
        </p>
        <p className="hero-headline">{headline}</p>
        <p className="lead">{tagline}</p>
        <div className="actions">
          <a className="button button-primary" href="#projects">
            See my work
          </a>
          <a className="button" href={assetUrl(links.cv)}>
            Download CV
          </a>
          <a className="button" href="#contact">
            Say hello
          </a>
        </div>
      </div>
    </section>
  )
}
