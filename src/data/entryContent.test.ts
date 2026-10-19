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

  it('groups users by the highest level the reader has seen', () => {
    const levelled: EntryStory = {
      ...story,
      levels: ['Low', 'Mid', 'High'],
      people: [
        { characterId: 'kelsier', role: 'u', level: 'Low', revealedIn: at(5) },
        {
          characterId: 'kelsier',
          role: 'u',
          level: 'High',
          revealedIn: at(30),
        },
        { characterId: 'vin', role: 'u', level: 'Mid', revealedIn: at(8) },
      ],
    }
    const show = (i: number) =>
      revealEntry(levelled, reader([], { 'final-empire': tfe[i] }), () => true)
    expect(show(6).levels).toEqual(['Low'])
    const mid = show(10)
    expect(mid.levels).toEqual(['Mid', 'Low'])
    expect(mid.people.find((p) => p.characterId === 'kelsier')?.level).toBe(
      'Low',
    )
    const late = show(31)
    expect(late.levels).toEqual(['High', 'Mid'])
    expect(late.people.find((p) => p.characterId === 'kelsier')?.level).toBe(
      'High',
    )
  })

  it('shows How it works sections and table rows by date', () => {
    const full: EntryStory = {
      ...story,
      mechanics: [
        {
          title: [{ text: 'Burning', revealedIn: at(5) }],
          items: [
            { text: 'early', revealedIn: at(5) },
            { text: 'late', revealedIn: at(30) },
          ],
        },
      ],
      tables: [
        {
          title: 'Metals',
          columns: ['Metal', 'Name', 'Effect'],
          rows: [
            {
              key: 'steel',
              entry: 'steel',
              cells: ['Steel', '', 'Pushes'],
              revealedIn: at(5),
            },
            { key: 'gold', cells: ['Gold', '', 'Past'], revealedIn: at(30) },
            {
              key: 'steel',
              entry: 'steel',
              cells: ['Steel', 'Coinshot', 'Pushes'],
              revealedIn: at(20),
            },
          ],
        },
      ],
    }
    const show = (i: number) =>
      revealEntry(full, reader([], { 'final-empire': tfe[i] }), () => true)
    expect(show(4).mechanics).toEqual([])
    expect(show(4).tables).toEqual([])
    const early = show(6)
    expect(early.mechanics[0].items.map((i) => i.text)).toEqual(['early'])
    expect(early.tables[0].columns).toEqual(['Metal', 'Effect'])
    expect(early.tables[0].rows[0].cells).toEqual(['Steel', 'Pushes'])
    expect(early.spoilers).toBe(true)
    const mid = show(21)
    expect(mid.tables[0].rows.map((r) => r.cells[1])).toEqual(['Coinshot'])
    const late = show(31)
    expect(late.tables[0].rows.map((r) => r.key)).toEqual(['steel', 'gold'])
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
