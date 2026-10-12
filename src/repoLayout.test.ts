/// <reference types="node" />
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOTS = ['src', 'e2e', 'public']

/** Strip only the last extension: `Foo.test.ts` -> `Foo.test`. */
function baseName(name: string): string {
  const dot = name.lastIndexOf('.')
  return (dot > 0 ? name.slice(0, dot) : name).toLowerCase()
}

/** Pairs of names in one directory that Windows or macOS would resolve as one. */
function findCollisions(names: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i]
      const b = names[j]
      if (a.toLowerCase() === b.toLowerCase() || baseName(a) === baseName(b)) out.push(`${a} <-> ${b}`)
    }
  }
  return out
}

function walk(dir: string, found: string[]): void {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const c of findCollisions(entries.map((e) => e.name))) found.push(`${dir}: ${c}`)
  for (const e of entries) if (e.isDirectory()) walk(join(dir, e.name), found)
}

describe('repo layout', () => {
  it('no two files in a directory differ only by case (Windows and macOS resolve them as one)', () => {
    const found: string[] = []
    for (const root of ROOTS) walk(join(process.cwd(), root), found)
    expect(found, `Case-colliding names:\n${found.join('\n')}`).toEqual([])
  })

  it('the guard detects a synthetic collision', () => {
    expect(findCollisions(['ContactForm.tsx', 'contactForm.ts'])).toHaveLength(1)
    expect(findCollisions(['Foo.test.ts', 'foo.test.tsx'])).toHaveLength(1)
    expect(findCollisions(['Contact.tsx', 'ContactForm.tsx'])).toHaveLength(0)
  })
})
