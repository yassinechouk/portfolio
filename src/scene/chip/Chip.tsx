import { useMemo } from 'react'
import { content } from '../../content'
import { useTheme } from '../../state/themeStore'
import { useTour } from '../../state/tourStore'
import { Die } from './Die'
import { PINS_PER_SIDE, pinIndexForProject } from './geometry'
import { Package } from './Package'
import { scenePalette } from './palette'
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
  const theme = useTheme()
  // A theme change re-renders this subtree once; materials update in place (nothing remounts).
  const palette = useMemo(() => scenePalette(theme), [theme])

  return (
    <group>
      <Die activeGroup={activeGroup} palette={palette} />
      <Package palette={palette} />
      <Pins activePin={activePin} palette={palette} />
      <Traces lite={lite} activePin={activePin} palette={palette} />
    </group>
  )
}
