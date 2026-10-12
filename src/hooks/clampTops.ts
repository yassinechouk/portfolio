/**
 * Clamps section tops to the maximum reachable scroll offset so the last
 * section's top is attainable even when it is shorter than the viewport.
 */
export function clampTopsToMaxScroll(tops: number[], maxScroll: number): number[] {
  const max = Number.isFinite(maxScroll) ? Math.max(0, maxScroll) : 0
  return tops.map((t) => Math.min(t, max))
}
