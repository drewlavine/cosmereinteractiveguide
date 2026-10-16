import { describe, expect, it } from 'vitest'
import { books } from './books'
import { chapters } from './chapters'
import { findCharacter } from './characters'
import { characterDetails } from './characterDetails'
import { personas } from './reveal'
import { systems } from './systems'
import type { CharacterStory, Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
const entries = Object.entries(characterDetails)
const characterStories = Object.fromEntries(
  Object.entries(
    import.meta.glob<CharacterStory>('./stories/*.json', {
      eager: true,
      import: 'default',
    }),
  ).map(([f, s]) => [f.slice('./stories/'.length, -'.json'.length), s]),
)

const expectValidReveal = (reveal: Reveal, where: string) => {
  expect(reveal.length, where).toBeGreaterThan(0)
  const points = reveal.flatMap((p) =>
    typeof p !== 'string' && 'all' in p ? p.all : [p],
  )
  for (const point of points) {
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

  it('gives each persona its own id and real books', () => {
    for (const p of personas) {
      expect(findCharacter(p.id), p.id).toBeUndefined()
      for (const b of p.books) expect(bookIds, p.id).toContain(b)
      expectValidReveal(p.identityRevealedIn, p.id)
    }
    expect(new Set(personas.map((p) => p.id)).size).toBe(personas.length)
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
      for (const kind of [
        'aliases',
        'species',
        'abilities',
        'nationality',
        'profession',
        'groups',
        'bonds',
        'relatives',
      ] as const)
        for (const f of d[kind] ?? []) {
          expect(f.name.trim(), id).not.toBe('')
          expectValidReveal(f.revealedIn, `${id} ${kind} ${f.name}`)
        }
      for (const r of d.relatives ?? []) {
        expect(r.relation.trim(), id).not.toBe('')
        if (r.characterId) {
          expect(findCharacter(r.characterId), r.characterId).toBeDefined()
          expect(r.characterId, id).not.toBe(id)
        }
      }
    }
  })

  it('dates a family tie the same on both sides', () => {
    const mirror: Record<string, string> = {
      spouse: 'spouse',
      sibling: 'sibling',
      parent: 'child',
      child: 'parent',
    }
    for (const [id, d] of entries)
      for (const r of d.relatives ?? []) {
        const back = r.characterId
          ? characterDetails[r.characterId]?.relatives?.find(
              (x) => x.characterId === id && x.relation === mirror[r.relation],
            )
          : undefined
        if (back)
          expect(back.revealedIn, `${id} ↔ ${r.name}`).toEqual(r.revealedIn)
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
    // Zahel is Vasher only to readers of Warbreaker too.
    const [zahel] = characterDetails.vasher.personas ?? []
    expect(zahel.books).toContain('words-of-radiance')
    for (const p of zahel.identityRevealedIn)
      expect(typeof p === 'object' && 'all' in p && p.all).toContain(
        'warbreaker',
      )
    // Hoid's disguised Final Empire cameo isn't named in that book, so it
    // only counts once the reader has met Hoid somewhere else.
    const cameo = characterDetails.hoid.appearsIn.find(
      (s) => s.bookId === 'final-empire',
    )
    expect(cameo?.revealedIn.length).toBeGreaterThan(0)
    for (const p of cameo?.revealedIn ?? [])
      expect(typeof p === 'object' && 'all' in p && p.all.length).toBe(2)
  })

  it('dates every story item, and keeps persona-only items in persona', () => {
    for (const [id, s] of Object.entries(characterStories)) {
      const d = characterDetails[id]
      expect(d, id).toBeDefined()
      const name = findCharacter(id)!.name.split(' ')[0]
      const personaBooks = new Set(d.personas?.flatMap((p) => p.books))
      for (const [kind, items] of [
        ['intro', s.intro],
        ['story', s.story],
        ['personality', s.personality],
      ] as const)
        items.forEach((it, i) => {
          const where = `${id} ${kind}[${i}]`
          expect(it.text.trim(), where).not.toBe('')
          expectValidReveal(it.revealedIn, where)
          const books = it.revealedIn.flatMap((p) =>
            (typeof p !== 'string' && 'all' in p ? p.all : [p]).map((q) =>
              typeof q === 'string' ? q : q.book,
            ),
          )
          // Shown on a persona page, it mustn't give the real name away.
          if (books.every((b) => personaBooks.has(b)))
            expect(it.text, where).not.toMatch(new RegExp(`\\b${name}\\b`))
        })
      for (const it of s.story) expect(bookIds, id).toContain(it.bookId)
    }
  })
})
