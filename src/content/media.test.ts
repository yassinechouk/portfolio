/// <reference types="node" />
import { existsSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { content } from './index'

const allMedia = [
  ...content.projects.flatMap((p) => p.media),
  ...content.experience.flatMap((e) => (e.image ? [e.image] : [])),
]
const file = (src: string) => join(process.cwd(), 'public', src)

describe('media assets', () => {
  it('has media to check', () => {
    expect(allMedia.length).toBeGreaterThanOrEqual(9)
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
})
