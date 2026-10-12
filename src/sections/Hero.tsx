import { content } from '../content'

export default function Hero() {
  const { name, eyebrow, headline, tagline } = content.about
  return (
    <section id="hero" className="section" aria-labelledby="hero-title">
      <div className="panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="hero-title">{name}</h1>
        <p className="lead">{headline}</p>
        <p>{tagline}</p>
        <a className="button" href="#projects">
          View projects
        </a>
      </div>
    </section>
  )
}
