import { content } from '../content'

export default function Hero() {
  const { name, headline } = content.about
  return (
    <section id="hero" className="section" aria-labelledby="hero-title">
      <div className="panel">
        <p className="eyebrow">Embedded / IoT / Systems</p>
        <h1 id="hero-title">{name}</h1>
        <p className="lead">{headline}</p>
        <a className="button" href="#projects">
          View projects
        </a>
      </div>
    </section>
  )
}
