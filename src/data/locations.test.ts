import { describe, expect, it } from 'vitest'
import { books } from './books'
import { findLocation, locations } from './locations'
import { planetMaps } from './maps'
import { systems } from './systems'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))

describe('locations', () => {
  it('have unique ids on real planets', () => {
    const ids = locations.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of locations) expect(planetIds).toContain(l.planetId)
  })

  it('only reference real books', () => {
    for (const l of locations) {
      const tags = [
        l.revealedIn,
        ...l.summary.map((p) => p.revealedIn),
        ...(l.settingOf ?? []).map((s) => [s.bookId, ...s.revealedIn]),
        ...(l.mentionedIn ?? []).map((s) => [s.bookId, ...s.revealedIn]),
      ]
      for (const id of tags.flat()) expect(bookIds).toContain(id)
    }
  })

  it('sit within places on the same planet', () => {
    for (const l of locations)
      if (l.parentId)
        expect(findLocation(l.planetId, l.parentId), l.id).toBeDefined()
  })

  it('back every map hotspot', () => {
    for (const [planetId, maps] of Object.entries(planetMaps))
      for (const map of maps)
        for (const v of map.versions)
          for (const spot of v.hotspots ?? []) {
            expect(
              findLocation(planetId, spot.locationId),
              spot.locationId,
            ).toBeDefined()
            if (spot.shape === 'pin') {
              expect(spot.x).toBeLessThanOrEqual(v.width)
              expect(spot.y).toBeLessThanOrEqual(v.height)
            }
          }
  })

  it('are never both set in and mentioned in one book', () => {
    for (const l of locations) {
      const set = new Set(l.settingOf?.map((s) => s.bookId))
      for (const s of l.mentionedIn ?? []) expect(set).not.toContain(s.bookId)
    }
  })
})
