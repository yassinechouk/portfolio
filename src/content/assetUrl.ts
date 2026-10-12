const ABSOLUTE = /^(?:https?:|data:|\/\/)/i

/** Resolve a content asset path against the deploy base path. */
export function assetUrl(path: string): string {
  if (ABSOLUTE.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}
