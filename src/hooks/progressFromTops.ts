/**
 * Maps scroll position to 0..1 tour progress. Section tops (ascending) are
 * equally spaced boundaries (1/(n-1) apart); interpolates linearly inside a section.
 */
export function progressFromTops(tops: number[], scrollY: number): number {
  const n = tops.length
  if (n < 2 || !Number.isFinite(scrollY)) return 0
  if (tops[n - 1] <= tops[0]) return 0
  if (scrollY <= tops[0]) return 0
  if (scrollY >= tops[n - 1]) return 1
  let i = 0
  while (i < n - 2 && scrollY >= tops[i + 1]) i++
  const span = tops[i + 1] - tops[i]
  const frac = span > 0 ? (scrollY - tops[i]) / span : 0
  const p = (i + frac) / (n - 1)
  return Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0
}
