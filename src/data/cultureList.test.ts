import { describe, expect, it } from 'vitest'
import { abilityList } from './abilityList'
import { books } from './books'
import { characters } from './characters'
import { cultureList } from './cultureList'
import { locationList } from './locationList'
import { systems } from './systems'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
const byId = new Map(cultureList.map((c) => [c.id, c]))

const pointsOf = (reveal: Reveal): string[] =>
  reveal.flatMap((p) =>
    typeof p === 'string' ? [p] : 'all' in p ? pointsOf(p.all) : [p.book],
  )

describe('culture list', () => {
  it('has unique ids', () => {
    expect(byId.size).toBe(cultureList.length)
  })

  it('has unique names', () => {
    const names = cultureList.map((c) => c.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('dates every entry by a known book its page cites', () => {
    for (const c of cultureList) {
      expect(c.books.length, c.id).toBeGreaterThan(0)
      for (const b of c.books) expect(bookIds, `${c.id}: ${b}`).toContain(b)
      for (const b of pointsOf(c.revealedIn))
        expect(bookIds, `${c.id}: ${b}`).toContain(b)
      if (c.world) expect(planetIds, c.id).toContain(c.world)
    }
  })

  it('starts its books at the book that reveals it', () => {
    for (const c of cultureList)
      if (c.revealedIn.every((p) => typeof p === 'string'))
        expect(c.revealedIn, c.id).toContain(c.books[0])
  })

  it('leaves out pages already listed as characters, places or abilities', () => {
    const elsewhere = new Set(
      [...characters, ...locationList, ...abilityList].map(
        (e) => e.coppermindPage,
      ),
    )
    for (const c of cultureList)
      expect(elsewhere.has(c.coppermindPage), c.id).toBe(false)
  })
})
