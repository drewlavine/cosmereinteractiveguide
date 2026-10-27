import { describe, expect, it } from 'vitest'
import { books } from './books'
import { listedLocations } from './listedLocations'
import {
  featuresFor,
  featuresOf,
  pageFeatures,
  type FeatureKind,
} from './pageFeatures'
import { people } from './people'
import { chapters } from './chapters'
import { journeyAtlas } from './journeyAtlas'
import { journeyIndex } from './journeyIndex'
import { loadPack } from './journeyPacks'
import { hasMet, readerCanSee, revealCharacterJourney } from './reveal'
import { characterItineraries } from './itineraries'

const progress = (read: string[]) => ({
  canSee: readerCanSee({ read: new Set(read), reading: new Map() }),
})
const all = progress(books.map((b) => b.id))
const none = progress([])
const kinds: FeatureKind[] = ['character', 'location', 'ability']

describe('the Journey feature', () => {
  it('flags Journey exactly when the Journey section shows', async () => {
    const chaptersRead = chapters['way-of-kings'].map((c) => c.id)
    for (const [id, entries] of Object.entries(journeyIndex)) {
      const c = people.find((p) => p.id === id)!
      const events = (
        await Promise.all(entries.map((e) => loadPack(e.pack)))
      ).flatMap((p) => p!.events)
      for (const chapter of [null, ...chaptersRead]) {
        const canSee = readerCanSee({
          read: new Set(),
          reading: new Map([['way-of-kings', chapter]]),
        })
        const shows =
          revealCharacterJourney(id, events, journeyAtlas, canSee).stops
            .length > 0
        expect(
          featuresOf('character', c, { canSee })
            .filter((f) => f.feature.id === 'journey')
            .map((f) => f.section),
          `${id} at ${chapter}`,
        ).toEqual(shows ? ['journey'] : [])
      }
    }
  })
})

describe('page features registry', () => {
  it('describes every feature', () => {
    const ids = pageFeatures.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const f of pageFeatures) {
      expect(f.label).not.toBe('')
      expect(f.description).not.toBe('')
      expect(kinds.some((k) => k in f.section)).toBe(true)
    }
  })

  it('offers each list only the features its pages can have', () => {
    expect(featuresFor('character').map((f) => f.id)).toEqual(['journey'])
    expect(featuresFor('location').map((f) => f.id)).toEqual(['map'])
    expect(featuresFor('ability')).toEqual([])
  })

  it('finds nothing before any book is read', () => {
    for (const c of people) expect(featuresOf('character', c, none)).toEqual([])
    for (const l of listedLocations)
      expect(featuresOf('location', l, none)).toEqual([])
  })

  it('flags world-hoppers’ Journey exactly when it shows', async () => {
    const travellers = people.filter((c) => characterItineraries[c.id])
    expect(travellers.length).toBeGreaterThan(0)
    const events = (
      await Promise.all(
        [
          ...new Set(
            Object.values(journeyIndex)
              .flat()
              .map((e) => e.pack),
          ),
        ].map((p) => loadPack(p)),
      )
    ).flatMap((p) => p!.events)
    for (const read of [
      [],
      ...books.map((b) => [b.id]),
      books.map((b) => b.id),
    ])
      for (const c of travellers) {
        const ctx = progress(read)
        const shows =
          hasMet(c.id, ctx.canSee) &&
          revealCharacterJourney(c.id, events, journeyAtlas, ctx.canSee).stops
            .length > 0
        expect(
          featuresOf('character', c, ctx).map((f) => f.section),
          `${c.id} after ${read.length} books`,
        ).toEqual(shows ? ['journey'] : [])
      }
    // Every traveller's journey shows once every book is read.
    for (const c of travellers)
      expect(featuresOf('character', c, all)[0]?.section).toBe('journey')
  })

  it('points maps at the section the page shows them in', () => {
    const sections = new Set(
      listedLocations.flatMap((l) =>
        featuresOf('location', l, all).map((f) => f.section),
      ),
    )
    // A place's own map or where it lies; a planet's interactive map, else
    // its maps.
    expect(['map', 'where-it-is', 'interactive-map', 'maps']).toEqual(
      expect.arrayContaining([...sections]),
    )
    expect(sections).toContain('map')
    expect(sections).toContain('where-it-is')
    expect(sections).toContain('interactive-map')
  })
})
