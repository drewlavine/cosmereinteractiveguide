import { describe, expect, it } from 'vitest'
import { chapters } from './chapters'
import { characterDetails } from './characterDetails'
import { locationDetails } from './locationDetails'
import {
  firstMet,
  readerCanSee,
  revealLocationDetails,
  revealLocationStory,
} from './reveal'
import type { LocationDetails, LocationStory, Reveal } from './types'

const reader = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })

const tfe = chapters['final-empire'].map((c) => c.id)
const at = (i: number): Reveal => [{ book: 'final-empire', chapter: tfe[i] }]

const story: LocationStory = {
  intro: [
    { text: 'intro early', revealedIn: at(1) },
    { text: 'intro late', revealedIn: at(20) },
  ],
  description: [
    { text: 'about early', revealedIn: at(2) },
    { text: 'about other book', revealedIn: ['well-of-ascension'] },
  ],
  history: [
    {
      title: [
        { text: 'title safe', revealedIn: at(5) },
        { text: 'title more', revealedIn: at(30) },
      ],
      items: [
        { text: 'event a', revealedIn: at(5) },
        { text: 'event b', revealedIn: at(30) },
      ],
    },
    {
      title: [{ text: 'later part', revealedIn: ['hero-of-ages'] }],
      items: [{ text: 'event c', revealedIn: ['hero-of-ages'] }],
    },
  ],
}

describe('revealLocationStory', () => {
  it('shows only what the reader has reached, by chapter', () => {
    const s = revealLocationStory(
      story,
      reader([], { 'final-empire': tfe[10] }),
    )
    expect(s.intro).toBe('intro early')
    expect(s.description).toEqual(['about early'])
    expect(s.history).toEqual([
      {
        title: 'title safe',
        items: [
          {
            text: 'event a',
            books: [{ bookId: 'final-empire', chapter: tfe[5] }],
          },
        ],
      },
    ])
    expect(s.spoilers).toBe(true)
  })

  it('shows nothing before the first point', () => {
    const s = revealLocationStory(story, reader([], { 'final-empire': tfe[0] }))
    expect(s).toEqual({
      intro: undefined,
      description: [],
      history: [],
      spoilers: true,
    })
  })

  it('takes the latest intro and title once read', () => {
    const s = revealLocationStory(
      story,
      reader(['final-empire', 'well-of-ascension', 'hero-of-ages']),
    )
    expect(s.intro).toBe('intro late')
    expect(s.history.map((h) => h.title)).toEqual(['title more', 'later part'])
    expect(s.spoilers).toBe(false)
  })
})

describe('revealLocationDetails', () => {
  const details: LocationDetails = {
    facts: [
      { label: 'Type', name: 'Keep', revealedIn: at(3) },
      { label: 'Type', name: 'Fort', revealedIn: at(40) },
      {
        label: 'Region',
        name: 'Somewhere',
        placeId: 'hidden-place',
        revealedIn: at(1),
      },
    ],
    people: [],
  }

  it('groups facts by label and hides facts not yet reached', () => {
    const d = revealLocationDetails(
      details,
      reader([], { 'final-empire': tfe[10] }),
      () => true,
    )
    expect(d.facts).toEqual([
      { label: 'Type', values: [{ name: 'Keep' }] },
      {
        label: 'Region',
        values: [{ name: 'Somewhere', placeId: 'hidden-place' }],
      },
    ])
    expect(d.spoilers).toBe(true)
  })

  it('hides a fact naming a place the reader may not see', () => {
    const d = revealLocationDetails(
      details,
      reader(['final-empire']),
      (id) => id !== 'hidden-place',
    )
    expect(d.facts.map((f) => f.label)).toEqual(['Type'])
    expect(d.spoilers).toBe(true)
  })

  it('shows hidden facts anyway when asked', () => {
    const d = revealLocationDetails(details, reader([]), () => false, true)
    expect(d.facts.flatMap((f) => f.values).length).toBe(3)
  })

  it('never shows a person through a persona the reader has not seen through', () => {
    const [id, character] = Object.entries(characterDetails).find(
      ([, d]) => d.personas?.length,
    )!
    const persona = character.personas![0]
    const people: LocationDetails = {
      facts: [],
      people: [
        {
          characterId: id,
          relation: 'resident',
          revealedIn: [persona.books[0]],
        },
      ],
    }
    const d = revealLocationDetails(
      people,
      reader([...persona.books]),
      () => true,
    )
    expect(d.people).toEqual([])
  })

  it('hides people the reader has not met', () => {
    const bookOf = (p: Reveal[number]) =>
      typeof p === 'string' ? p : 'book' in p ? p.book : undefined
    const [id, character] = Object.entries(characterDetails).find(
      ([, d]) =>
        !d.personas &&
        firstMet(d).length > 0 &&
        firstMet(d).every((p) => typeof p === 'string' && p !== 'final-empire'),
    )!
    const people: LocationDetails = {
      facts: [],
      people: [
        { characterId: id, relation: 'born', revealedIn: ['final-empire'] },
      ],
    }
    const metBooks = firstMet(character).map(bookOf) as string[]
    expect(
      revealLocationDetails(people, reader(['final-empire']), () => true)
        .people,
    ).toEqual([])
    expect(
      revealLocationDetails(
        people,
        reader(['final-empire', ...metBooks]),
        () => true,
      ).people,
    ).toEqual([{ characterId: id, relations: ['born'] }])
  })
})

describe('locationDetails data', () => {
  it('names only listed places and known characters', async () => {
    const { findListed } = await import('./listedLocations')
    const { findPerson } = await import('./people')
    for (const d of Object.values(locationDetails)) {
      for (const f of d.facts) {
        if (f.placeId) expect(findListed(f.placeId), f.placeId).toBeDefined()
        expect(f.revealedIn.length).toBeGreaterThan(0)
      }
      for (const p of d.people)
        expect(findPerson(p.characterId), p.characterId).toBeDefined()
    }
  })
})
