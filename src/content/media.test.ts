/// <reference types="node" />
import { existsSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { content } from './index'

const allMedia = [
  ...content.projects.flatMap((p) => p.media),
  ...content.experience.flatMap((e) => (e.image ? [e.image] : [])),
]
const publicDir = join(process.cwd(), 'public')
const file = (src: string) => join(publicDir, src)

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? filesUnder(join(dir, e.name)) : [relative(publicDir, join(dir, e.name)).split('\\').join('/')],
  )
}

describe('media assets', () => {
  it('has media to check', () => {
    expect(allMedia.length).toBe(2)
  })

  it('every project media and experience image file exists under public/', () => {
    for (const m of allMedia) {
      expect(existsSync(file(m.src)), m.src).toBe(true)
      expect(extname(m.src)).toBe('.webp')
    }
  })

  it('every image is 200 KB or smaller', () => {
    for (const m of allMedia) {
      expect(statSync(file(m.src)).size, m.src).toBeLessThanOrEqual(200 * 1024)
    }
  })

  it('every media entry has non-empty alt and caption', () => {
    for (const m of allMedia) {
      expect(m.alt.trim(), m.src).not.toBe('')
      expect(m.caption.trim(), m.src).not.toBe('')
    }
  })

  it('ships no orphan images: every file under projects/ and experience/ is referenced by content', () => {
    const referenced = new Set(allMedia.map((m) => m.src))
    const shipped = [...filesUnder(join(publicDir, 'projects')), ...filesUnder(join(publicDir, 'experience'))]
    expect(shipped.length).toBeGreaterThan(0)
    expect(shipped.filter((f) => !referenced.has(f))).toEqual([])
  })

  it('only featured projects carry media', () => {
    for (const p of content.projects) expect(p.media.length > 0, p.id).toBe(p.featured === true)
  })
})
