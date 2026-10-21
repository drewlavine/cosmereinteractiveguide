import { describe, expect, it } from 'vitest'
import { LIST_CAP, NOTABLE, splitNotable, weight } from './notable'
import { prominence } from './prominence'
import type { CanSee } from './reveal'

const finished =
  (...books: string[]): CanSee =>
  (reveal) =>
    reveal.some((p) => typeof p === 'string' && books.includes(p))
const people = (ids: string[]) => ids.map((characterId) => ({ characterId }))

describe('notable people', () => {
  it('counts only finished books', () => {
    expect(weight('teft', finished('way-of-kings'))).toBe(
      prominence.teft['way-of-kings'],
    )
    expect(weight('teft', finished())).toBe(0)
  })

  it('leaves a short list alone', () => {
    const list = people(['kaladin', 'teft'])
    expect(splitNotable(list, finished('way-of-kings')).rest).toEqual([])
  })

  it('keeps the most prominent of a long list, in the list’s order', () => {
    const ids = Object.keys(prominence)
      .filter((id) => prominence[id]['way-of-kings'])
      .slice(0, LIST_CAP + 5)
    const { notable, rest } = splitNotable(
      people(ids),
      finished('way-of-kings'),
    )
    expect(notable).toHaveLength(NOTABLE)
    expect(rest).toHaveLength(ids.length - NOTABLE)
    const w = (p: { characterId: string }) =>
      prominence[p.characterId]['way-of-kings']
    expect(Math.min(...notable.map(w))).toBeGreaterThanOrEqual(
      Math.max(...rest.map(w)),
    )
    expect(notable.map((p) => p.characterId)).toEqual(
      ids.filter((id) => notable.some((p) => p.characterId === id)),
    )
  })
})
