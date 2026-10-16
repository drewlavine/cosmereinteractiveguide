import { describe, expect, it } from 'vitest'
import { books } from './books'
import { listedLocations } from './listedLocations'
import { locationList } from './locationList'
import { findLocation } from './locations'
import { systems } from './systems'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
const ids = locationList.map((l) => l.id)

describe('location list', () => {
  it('has unique ids, also with the map places added', () => {
    expect(new Set(ids).size).toBe(ids.length)
    const all = listedLocations.map((l) => l.id)
    expect(new Set(all).size).toBe(all.length)
  })

  it('dates every place by a known book, earliest first', () => {
    for (const l of locationList) {
      expect(l.books.length, l.id).toBeGreaterThan(0)
      for (const b of l.books) expect(bookIds, `${l.id}: ${b}`).toContain(b)
      expect(l.revealedIn, l.id).toEqual([l.books[0]])
    }
  })

  it('points worlds, parents and map places at things that exist', () => {
    for (const l of locationList) {
      if (l.world) expect(planetIds, l.id).toContain(l.world)
      if (l.parentId) expect(ids, l.id).toContain(l.parentId)
      if (l.mapPlanetId)
        expect(findLocation(l.mapPlanetId, l.id), l.id).toBeDefined()
    }
  })
})
