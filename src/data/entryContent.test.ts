import { describe, expect, it } from 'vitest'
import { chapters } from './chapters'
import { characterDetails } from './characterDetails'
import { entryBooks } from './entryStories'
import { firstMet, readerCanSee, revealEntry } from './reveal'
import type { EntryStory, Reveal } from './types'

const reader = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })

const tfe = chapters['final-empire'].map((c) => c.id)
const at = (i: number): Reveal => [{ book: 'final-empire', chapter: tfe[i] }]

// Someone the reader meets only in a later book.
const [laterId] = Object.entries(characterDetails).find(
  ([, d]) =>
    !d.personas &&
    firstMet(d).length > 0 &&
    firstMet(d).every((p) => typeof p === 'string' && p !== 'final-empire'),
)!

const story: EntryStory = {
  intro: [
    { text: 'intro early', revealedIn: at(3) },
    { text: 'intro late', revealedIn: at(20) },
  ],
  description: [{ text: 'about', revealedIn: at(4) }],
  history: [],
  facts: [
    { label: 'Leader', name: 'Early', revealedIn: at(3) },
    { label: 'Leader', name: 'Late', revealedIn: at(25) },
    { label: 'Based in', name: 'A place', placeId: 'p', revealedIn: at(3) },
  ],
  people: [
    { characterId: 'kelsier', role: 'member', revealedIn: at(5) },
    { characterId: 'kelsier', role: 'leader', revealedIn: at(30) },
    { characterId: laterId, role: 'member', revealedIn: at(5) },
  ],
}

describe('revealEntry', () => {
  it('builds up chapter by chapter', () => {
    const early = revealEntry(
      story,
      reader([], { 'final-empire': tfe[10] }),
      () => true,
    )
    expect(early.intro).toBe('intro early')
    expect(early.description).toEqual(['about'])
    expect(early.facts).toEqual([
      { label: 'Leader', values: [{ name: 'Early' }] },
      { label: 'Based in', values: [{ name: 'A place', placeId: 'p' }] },
    ])
    expect(early.people).toEqual([
      { characterId: 'kelsier', roles: ['member'] },
    ])
    expect(early.spoilers).toBe(true)

    const late = revealEntry(story, reader(['final-empire']), () => true)
    expect(late.intro).toBe('intro late')
    expect(late.facts[0].values.map((v) => v.name)).toEqual(['Early', 'Late'])
    expect(late.people).toEqual([
      { characterId: 'kelsier', roles: ['member', 'leader'] },
    ])
  })

  it('hides facts about unseen places and unmet people', () => {
    const s = revealEntry(story, reader(['final-empire']), () => false)
    expect(s.facts.map((f) => f.label)).toEqual(['Leader'])
    expect(s.people.map((p) => p.characterId)).not.toContain(laterId)
  })

  it('shows nothing before the first point', () => {
    const s = revealEntry(
      story,
      reader([], { 'final-empire': tfe[0] }),
      () => true,
    )
    expect(s).toMatchObject({
      intro: undefined,
      description: [],
      facts: [],
      people: [],
    })
  })

  it('shows everything when viewed anyway', () => {
    const s = revealEntry(story, reader([]), () => false, true)
    expect(s.intro).toBe('intro late')
    expect(s.facts).toHaveLength(2)
    expect(s.people).toHaveLength(2)
  })
})

describe('entryBooks', () => {
  const entry = {
    id: 'not-a-real-entry',
    revealedIn: at(3),
    books: ['final-empire', 'well-of-ascension'],
  }
  it('counts a book once the reader reaches the entry in it', () => {
    expect(entryBooks('culture', entry, reader([]))).toEqual([])
    expect(
      entryBooks('culture', entry, reader([], { 'final-empire': tfe[5] })),
    ).toEqual(['final-empire'])
    expect(
      entryBooks(
        'culture',
        entry,
        reader(['final-empire', 'well-of-ascension']),
      ),
    ).toEqual(['final-empire', 'well-of-ascension'])
  })
})
