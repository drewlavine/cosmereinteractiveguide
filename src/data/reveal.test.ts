import { describe, expect, it } from 'vitest'
import { books } from './books'
import { readerCanSee, revealSystem, spoilerBooks } from './reveal'
import { systems } from './systems'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const everyBook = readerCanSee(bookIds)
const noBooks = readerCanSee(new Set())

function allTags(): Reveal[] {
  const tags: Reveal[] = []
  for (const s of systems) {
    tags.push(
      ...s.star.map((p) => p.revealedIn),
      ...s.summary.map((p) => p.revealedIn),
    )
    for (const item of [s.companionStar, s.asteroidBelt, s.cometBelt])
      if (item) tags.push(item.revealedIn)
    for (const item of [...(s.markers ?? []), ...(s.orbitNotes ?? [])])
      tags.push(item.revealedIn)
    for (const p of s.planets) {
      tags.push(p.revealedIn)
      for (const item of [p.altName, p.chartLabel])
        if (item) tags.push(item.revealedIn)
      for (const item of [
        ...p.summary,
        ...p.shards,
        ...p.magicSystems,
        ...p.moons,
      ])
        tags.push(item.revealedIn)
    }
  }
  return tags
}

describe('spoiler tags', () => {
  it('tags everything with real book ids', () => {
    for (const tag of allTags()) {
      expect(tag.length).toBeGreaterThan(0)
      for (const id of tag) expect(bookIds).toContain(id)
    }
  })

  it('shows everything to a reader who has read every book', () => {
    for (const system of systems) {
      const shown = revealSystem(system, everyBook)
      expect(shown.spoilers).toEqual([])
      expect(shown.planets).toHaveLength(system.planets.length)
    }
  })

  it('hides every system from a reader with no books', () => {
    for (const system of systems) {
      const shown = revealSystem(system, noBooks)
      expect(shown.planets).toEqual([])
      expect(shown.summary).toBe('')
      expect(shown.star).toBe('')
      expect(shown.asteroidBelt).toBeUndefined()
      expect(shown.spoilers.length).toBeGreaterThan(0)
      // The chart is still laid out for the whole system.
      expect(shown.maxOrbit).toBeGreaterThanOrEqual(
        Math.max(...system.planets.map((p) => p.orbit)),
      )
    }
  })

  it('shows everything on request, still listing the spoilers', () => {
    const [system] = systems
    const shown = revealSystem(system, noBooks, true)
    expect(shown.planets).toHaveLength(system.planets.length)
    expect(shown.hiddenPlanets).toEqual([])
    expect(shown.spoilers.length).toBeGreaterThan(0)
  })

  it('lists spoiler books once each, in publication order', () => {
    expect(
      spoilerBooks([
        ['oathbringer'],
        ['way-of-kings', 'arcanum-unbounded'],
        ['oathbringer'],
      ]),
    ).toEqual(['way-of-kings', 'oathbringer'])
  })
})
