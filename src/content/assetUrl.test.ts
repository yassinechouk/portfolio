import { describe, expect, it } from 'vitest'
import { assetUrl } from './assetUrl'

const base = import.meta.env.BASE_URL

describe('assetUrl', () => {
  it('prefixes relative paths with BASE_URL', () => {
    expect(assetUrl('img/x.png')).toBe(`${base}img/x.png`)
  })
  it('strips a leading slash without doubling', () => {
    expect(assetUrl('/img/x.png')).toBe(`${base}img/x.png`)
  })
  it('leaves absolute, data and protocol-relative urls unchanged', () => {
    for (const u of ['https://a.b/x.png', 'http://a.b/x.png', 'data:image/png;base64,AAA', '//a.b/x.png']) {
      expect(assetUrl(u)).toBe(u)
    }
  })
})
