import { describe, expect, it } from 'vitest'
import { abilityList } from './abilityList'
import { books } from './books'
import { systems } from './systems'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
const byId = new Map(abilityList.map((a) => [a.id, a]))

const pointsOf = (reveal: Reveal): string[] =>
  reveal.flatMap((p) =>
    typeof p === 'string' ? [p] : 'all' in p ? pointsOf(p.all) : [p.book],
  )

describe('ability list', () => {
  it('has unique ids', () => {
    expect(byId.size).toBe(abilityList.length)
  })

  it('dates every ability by a known book its page cites', () => {
    for (const a of abilityList) {
      expect(a.books.length, a.id).toBeGreaterThan(0)
      for (const b of a.books) expect(bookIds, `${a.id}: ${b}`).toContain(b)
      for (const b of pointsOf(a.revealedIn))
        expect(bookIds, `${a.id}: ${b}`).toContain(b)
    }
  })

  it('ties abilities only to listed systems, never before the ability itself', () => {
    for (const a of abilityList) {
      if (a.world) expect(planetIds, a.id).toContain(a.world)
      for (const t of a.systems ?? []) {
        expect(byId.get(t.id)?.kind, `${a.id} → ${t.id}`).toBe('system')
        expect(pointsOf(t.revealedIn), a.id).toEqual(
          expect.arrayContaining(pointsOf(a.revealedIn)),
        )
      }
      for (const s of a.shards ?? [])
        expect(pointsOf(s.revealedIn), a.id).toEqual(
          expect.arrayContaining(pointsOf(a.revealedIn)),
        )
    }
  })
})
