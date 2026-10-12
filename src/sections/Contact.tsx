import { content } from '../content'
import { assetUrl } from '../content/assetUrl'

export default function Contact() {
  const { email } = content.contact
  return (
    <section id="contact" className="section section-short" aria-labelledby="contact-title">
      <div className="panel">
        <h2 id="contact-title">Contact</h2>
        <ul className="links">
          <li>
            <a href={`mailto:${email}`}>{email}</a>
          </li>
          <li>
            <a className="button" href={assetUrl(content.about.links.cv)}>
              Download CV
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
