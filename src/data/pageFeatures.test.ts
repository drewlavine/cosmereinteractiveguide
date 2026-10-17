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
import { hasMet, readerCanSee, revealCharacterTravels } from './reveal'
import { characterTravels } from './travels'

const progress = (read: string[]) => ({
  canSee: readerCanSee({ read: new Set(read), reading: new Map() }),
})
const all = progress(books.map((b) => b.id))
const none = progress([])
const kinds: FeatureKind[] = ['character', 'location', 'ability']

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
    expect(featuresFor('character').map((f) => f.id)).toEqual(['travels'])
    expect(featuresFor('location').map((f) => f.id)).toEqual(['map'])
    expect(featuresFor('ability')).toEqual([])
  })

  it('finds nothing before any book is read', () => {
    for (const c of people) expect(featuresOf('character', c, none)).toEqual([])
    for (const l of listedLocations)
      expect(featuresOf('location', l, none)).toEqual([])
  })

  it('flags Travels exactly when the Travels section shows', () => {
    const travellers = people.filter((c) => characterTravels[c.id])
    expect(travellers.length).toBeGreaterThan(0)
    for (const read of [
      [],
      ...books.map((b) => [b.id]),
      books.map((b) => b.id),
    ])
      for (const c of travellers) {
        const ctx = progress(read)
        const shows =
          hasMet(c.id, ctx.canSee) &&
          revealCharacterTravels(c.id, ctx.canSee).stops.length > 0
        expect(featuresOf('character', c, ctx).map((f) => f.section)).toEqual(
          shows ? ['travels'] : [],
        )
      }
    // Every traveller's journey shows once every book is read.
    for (const c of travellers)
      expect(featuresOf('character', c, all)[0]?.section).toBe('travels')
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
