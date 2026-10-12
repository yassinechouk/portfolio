import { content } from '../content'
import { assetUrl } from '../content/assetUrl'
import ContactForm from './ContactForm'

export default function Contact() {
  const { email, phone, form } = content.contact
  const { github, linkedin, cv } = content.about.links
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="panel contact-panel">
        <div className="contact-direct">
          <h2 id="contact-title">Contact</h2>
          <ul className="contact-links">
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            </li>
            <li>
              <a href={linkedin}>LinkedIn</a>
            </li>
            <li>
              <a href={github}>GitHub</a>
            </li>
          </ul>
          <p>
            <a className="button" href={assetUrl(cv)}>
              Download CV
            </a>
          </p>
        </div>
        <div className="contact-query">
          <ContactForm accessKey={form.accessKey} email={email} />
        </div>
      </div>
    </section>
  )
}
