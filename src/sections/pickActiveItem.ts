export type ItemRect = { id: string; top: number; height: number }

const SAME_ROW_PX = 2

/**
 * Picks the item nearest the viewport centre. Items sharing a row (equal tops)
 * get virtual centres spread across the row, left to right, so scrolling down
 * past a side-by-side pair selects the first card and then the second.
 * `rects` must be in DOM order; ties go to the earlier item.
 */
export function pickActiveItem(rects: ItemRect[], viewportCenter: number): string | null {
  let best: string | null = null
  let bestDistance = Infinity
  let i = 0
  while (i < rects.length) {
    let end = i + 1
    while (end < rects.length && Math.abs(rects[end].top - rects[i].top) <= SAME_ROW_PX) end++
    const count = end - i
    for (let k = 0; k < count; k++) {
      const { id, top, height } = rects[i + k]
      const distance = Math.abs(top + (height * (k + 0.5)) / count - viewportCenter)
      if (distance < bestDistance) {
        best = id
        bestDistance = distance
      }
    }
    i = end
  }
  return best
}
