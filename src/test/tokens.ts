/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type TokenBlocks = {
  /** Theme-independent tokens (fonts, radius, spacing) in the plain `:root` block. */
  shared: Record<string, string>
  light: Record<string, string>
  dark: Record<string, string>
}

const TOKENS_PATH = join(process.cwd(), 'src/styles/tokens.css')

function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

/** Parses `src/styles/tokens.css` into its shared, light and dark blocks (test helper). */
export function readTokens(): TokenBlocks {
  const css = readFileSync(TOKENS_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const blocks: TokenBlocks = { shared: {}, light: {}, dark: {} }
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const selector = m[1].replace(/\s+/g, ' ').trim()
    const decls = declarations(m[2])
    if (selector === ':root') Object.assign(blocks.shared, decls)
    else if (selector === ":root, :root[data-theme='light']") Object.assign(blocks.light, decls)
    else if (selector === ":root[data-theme='dark']") Object.assign(blocks.dark, decls)
    else throw new Error(`Unexpected selector in tokens.css: ${selector}`)
  }
  return blocks
}
