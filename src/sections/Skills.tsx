import { useEffect, useRef } from 'react'
import { content } from '../content'
import type { SkillGroup } from '../content/types'
import { setTour, useTour } from '../state/tourStore'

export default function Skills() {
  const active = useTour((t) => t.activeSkillGroup)
  const refs = useRef(new Map<string, HTMLLIElement>())

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.group as SkillGroup['id'] | undefined
          if (entry.isIntersecting && id) setTour({ activeSkillGroup: id })
        }
      },
      { threshold: 0.6 },
    )
    refs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const select = (id: SkillGroup['id']) => setTour({ activeSkillGroup: id })

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="panel">
        <h2 id="skills-title">Skills</h2>
        <ul className="skill-groups">
          {content.skills.map((group) => (
            <li
              key={group.id}
              data-group={group.id}
              ref={(el) => {
                if (el) refs.current.set(group.id, el)
                else refs.current.delete(group.id)
              }}
            >
              <button
                type="button"
                className="group-button"
                aria-pressed={active === group.id}
                onClick={() => select(group.id)}
                onFocus={() => select(group.id)}
              >
                {group.label}
              </button>
              <ul className="chips">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
