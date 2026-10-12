import { describe, expect, it } from 'vitest'
import { pickActiveItem } from './pickActiveItem'

const row = (top: number) => [
  { id: 'a', top, height: 600 },
  { id: 'b', top, height: 600 },
]

describe('pickActiveItem', () => {
  it('single items pick the nearest centre', () => {
    const items = [
      { id: 'a', top: 0, height: 100 },
      { id: 'b', top: 200, height: 100 },
      { id: 'c', top: 400, height: 100 },
    ]
    expect(pickActiveItem(items, 260)).toBe('b')
    expect(pickActiveItem(items, 440)).toBe('c')
  })

  it('two same-top cards: the first wins while the row centre is below the viewport centre', () => {
    // row centre = 300 + 300 = 600 > viewport centre 400
    expect(pickActiveItem(row(300), 400)).toBe('a')
  })

  it('two same-top cards: the second wins after the row centre has passed the viewport centre', () => {
    // row centre = 50 + 300 = 350 < 400; virtual centres 200 and 500
    expect(pickActiveItem(row(50), 400)).toBe('b')
    expect(pickActiveItem(row(-100), 400)).toBe('b')
  })

  it('then a lower compact item wins once it is nearest', () => {
    const items = [...row(-300), { id: 'c', top: 400, height: 150 }]
    expect(pickActiveItem(items, 400)).toBe('c')
  })

  it('ties beyond the row logic fall back to DOM order', () => {
    const items = [
      { id: 'a', top: 0, height: 100 },
      { id: 'b', top: 100, height: 100 },
    ]
    expect(pickActiveItem(items, 100)).toBe('a')
  })

  it('returns null for no items', () => {
    expect(pickActiveItem([], 400)).toBeNull()
  })
})
