import { content } from '../content'
import { assetUrl } from '../content/assetUrl'

export default function Hero() {
  const { name, eyebrow, headline, tagline, links } = content.about
  return (
    <section id="hero" className="section" aria-labelledby="hero-title">
      <div className="panel hero-panel">
        <p className="eyebrow">{eyebrow}</p>
        <p className="hero-name">{name}</p>
        <h1 id="hero-title">{headline}</h1>
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
