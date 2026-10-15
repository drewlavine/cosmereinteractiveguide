import { describe, expect, it } from 'vitest'
import { books } from './books'
import { chapters } from './chapters'
import { findCharacter } from './characters'
import { characterDetails } from './characterDetails'
import { systems } from './systems'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
const entries = Object.entries(characterDetails)

const expectValidReveal = (reveal: Reveal, where: string) => {
  expect(reveal.length, where).toBeGreaterThan(0)
  for (const point of reveal) {
    const book = typeof point === 'string' ? point : point.book
    expect(bookIds, where).toContain(book)
    if (typeof point !== 'string')
      expect(
        chapters[point.book]?.map((c) => c.id),
        `${where}: ${point.book} ${point.chapter}`,
      ).toContain(point.chapter)
  }
}

describe('character details', () => {
  it('is keyed by character ids', () => {
    for (const [id] of entries) expect(findCharacter(id), id).toBeDefined()
  })

  it('names books, chapters and planets that exist', () => {
    for (const [id, d] of entries) {
      expect(d.appearsIn.length, id).toBeGreaterThan(0)
      const appearsIn = d.appearsIn.map((s) => s.bookId)
      expect(new Set(appearsIn).size, id).toBe(appearsIn.length)
      for (const s of d.appearsIn) {
        expect(bookIds, id).toContain(s.bookId)
        expectValidReveal(s.revealedIn, `${id} appearsIn ${s.bookId}`)
      }
      if (d.world) {
        expect(planetIds, id).toContain(d.world.planetId)
        expectValidReveal(d.world.revealedIn, `${id} world`)
      }
      for (const kind of ['aliases', 'species', 'abilities'] as const)
        for (const f of d[kind]) {
          expect(f.name.trim(), id).not.toBe('')
          expectValidReveal(f.revealedIn, `${id} ${kind} ${f.name}`)
        }
    }
  })

  it('keeps big reveals out of early chapters', () => {
    const revealOf = (
      id: string,
      kind: 'aliases' | 'abilities',
      name: string,
    ) => characterDetails[id][kind].find((f) => f.name === name)?.revealedIn
    expect(revealOf('kaladin', 'abilities', 'Windrunner')).not.toContain(
      'way-of-kings',
    )
    expect(revealOf('vin', 'aliases', 'Preservation')).toEqual([
      { book: 'hero-of-ages', chapter: '73' },
    ])
    // Zahel is only confirmed to be Vasher in Wind and Truth.
    for (const s of characterDetails.vasher.appearsIn)
      if (s.bookId !== 'warbreaker' && s.bookId !== 'fires-of-december')
        expect(s.revealedIn, s.bookId).toEqual(['wind-and-truth'])
    // Hoid's disguised Final Empire cameo is not named in that book.
    expect(characterDetails.hoid.appearsIn.map((s) => s.bookId)).not.toContain(
      'final-empire',
    )
  })
})
