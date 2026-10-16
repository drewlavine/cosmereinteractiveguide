import { describe, expect, it } from 'vitest'
import { books } from './books'
import { metIn, readerCanSee, revealCharacter, revealSystem } from './reveal'
import { systems } from './systems'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const everyBook = readerCanSee({ read: bookIds, reading: new Map() })
const noBooks = readerCanSee({ read: new Set(), reading: new Map() })

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
        ...(p.settingOf ?? []),
        ...(p.mentionedIn ?? []),
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

  it('never lists a book as both setting and mention', () => {
    for (const s of systems)
      for (const p of s.planets) {
        const set = new Set(p.settingOf?.map((x) => x.bookId))
        for (const m of p.mentionedIn ?? []) expect(set).not.toContain(m.bookId)
        for (const x of [...(p.settingOf ?? []), ...(p.mentionedIn ?? [])])
          expect(x.revealedIn[0]).toBe(x.bookId)
      }
  })

  it('shows everything to a reader who has read every book', () => {
    for (const system of systems) {
      const shown = revealSystem(system, everyBook)
      expect(shown.spoilers).toBe(false)
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
      expect(shown.spoilers).toBe(true)
      // The chart is still laid out for the whole system.
      expect(shown.maxOrbit).toBeGreaterThanOrEqual(
        Math.max(...system.planets.map((p) => p.orbit)),
      )
    }
  })

  it('shows everything on request, still noting the spoilers', () => {
    const [system] = systems
    const shown = revealSystem(system, noBooks, true)
    expect(shown.planets).toHaveLength(system.planets.length)
    expect(shown.hiddenPlanets).toEqual([])
    expect(shown.spoilers).toBe(true)
  })
})

describe('personas', () => {
  const reader = (read: string[]) =>
    readerCanSee({ read: new Set(read), reading: new Map() })
  const names = (id: string, read: string[]) => {
    const c = revealCharacter(id, reader(read))
    return { personas: c.personas.map((p) => p.name), aliases: c.aliases }
  }

  it('keeps Azure apart from Vivenna until both books are read', () => {
    expect(
      reader(['oathbringer'])(metIn('azure', reader(['oathbringer']))!),
    ).toBe(true)
    expect(revealCharacter('azure', reader(['oathbringer'])).relatives).toEqual(
      [],
    )
    expect(names('vivenna', ['warbreaker']).personas).toEqual([])
    expect(names('vivenna', ['warbreaker', 'oathbringer']).personas).toEqual([
      'Azure',
    ])
    expect(metIn('azure', reader(['warbreaker', 'oathbringer']))).toEqual([])
  })

  it('names Marsh as Ironeyes for Era 1 readers', () => {
    expect(names('marsh', ['final-empire']).aliases).toContain('Ironeyes')
    expect(names('marsh', ['alloy-of-law']).personas).toEqual([])
    expect(names('marsh', ['final-empire', 'alloy-of-law']).personas).toEqual([
      'Ironeyes',
    ])
  })

  it('shows Wit as Hoid once the reader can tell', () => {
    const wok = reader([])
    expect(wok(metIn('wit', reader(['sunlit-man']))!)).toBe(false)
    expect(names('hoid', ['way-of-kings']).personas).toEqual(['Wit'])
    expect(names('hoid', ['sunlit-man']).personas).toEqual([])
    expect(names('hoid', ['elantris', 'sunlit-man']).personas).toEqual(['Wit'])
    // The header names only the series of books the reader has reached.
    expect(
      revealCharacter('hoid', reader(['elantris', 'way-of-kings'])).personas,
    ).toEqual([{ name: 'Wit', books: ['way-of-kings'] }])
  })

  it('counts unnamed cameos only once Hoid is known', () => {
    const books = (read: string[]) =>
      revealCharacter('hoid', reader(read)).appearsIn.map((s) => s.bookId)
    expect(revealCharacter('hoid', reader(['final-empire'])).met).toBe(false)
    expect(books(['elantris'])).not.toContain('final-empire')
    expect(books(['final-empire', 'elantris'])).toContain('final-empire')
  })

  it('keeps Thaidakar apart from Kelsier until Wind and Truth', () => {
    expect(
      names('kelsier', ['final-empire', 'rhythm-of-war']).aliases,
    ).not.toContain('Thaidakar')
    expect(
      names('kelsier', ['final-empire', 'wind-and-truth']).personas,
    ).toEqual(['Thaidakar'])
  })
})
