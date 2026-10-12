import { content } from '../content'
import { assetUrl } from '../content/assetUrl'

export default function About() {
  const { paragraphs, links } = content.about
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="panel">
        <h2 id="about-title">About</h2>
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <ul className="links">
          <li>
            <a className="button" href={assetUrl(links.cv)}>
              Download CV
            </a>
          </li>
          <li>
            <a href={links.github}>GitHub</a>
          </li>
          <li>
            <a href={links.linkedin}>LinkedIn</a>
          </li>
        </ul>
      </div>
    </section>
  )
}
