import { content } from '../../content'
import { useTour } from '../../state/tourStore'
import { Die } from './Die'
import { PINS_PER_SIDE, pinIndexForProject } from './geometry'
import { Package } from './Package'
import { Pins } from './Pins'
import { Traces } from './Traces'

const projectIds = content.projects.map((p) => p.id)

/** Front-row pin (side 0, so also the global pin index) for a project id, or null. */
function pinForProject(id: string | null): number | null {
  const index = id === null ? -1 : projectIds.indexOf(id)
  return index < 0 ? null : pinIndexForProject(index, projectIds.length, PINS_PER_SIDE)
}

/** The hero MCU: package, leads, die and traces. `lite` trims traces and pulses for mobile. */
export function Chip({ lite }: { lite: boolean }) {
  const activePin = pinForProject(useTour((t) => t.activeProjectId))
  const activeGroup = useTour((t) => t.activeSkillGroup)

  return (
    <group>
      <Die activeGroup={activeGroup} />
      <Package />
      <Pins activePin={activePin} />
      <Traces lite={lite} activePin={activePin} />
    </group>
  )
}
