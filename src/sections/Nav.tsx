import { SECTION_ORDER, type SectionId, useTour } from '../state/tourStore'

const LABELS: Record<SectionId, string> = {
  hero: 'Home',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  contact: 'Contact',
}

export default function Nav() {
  const active = useTour((t) => t.activeSection)
  return (
    <nav className="nav" aria-label="Sections">
      <ul>
        {SECTION_ORDER.map((id) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
              {LABELS[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
