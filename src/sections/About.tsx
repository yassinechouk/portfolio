import { content } from '../content'
import ProfilePhoto from './ProfilePhoto'

export default function About() {
  const { name, paragraphs, highlights, education, spokenLanguages, photo, links } = content.about
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="panel about-panel">
        <ProfilePhoto name={name} src={photo} />
        <div className="about-text">
          <h2 id="about-title">Hi, I'm Yassine.</h2>
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <ul className="chips" aria-label="Focus areas">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <dl className="facts">
            <div>
              <dt>Education</dt>
              <dd>{education}</dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>
                <ul className="chips">
                  {spokenLanguages.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          <ul className="links">
            <li>
              <a href={links.github}>GitHub</a>
            </li>
            <li>
              <a href={links.linkedin}>LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
