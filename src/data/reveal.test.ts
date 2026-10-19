import { describe, expect, it } from 'vitest'
import { books } from './books'
import { chapters } from './chapters'
import { characterPortraits } from './characterPortraits'
import {
  metIn,
  readerCanSee,
  revealCharacter,
  revealPortrait,
  revealStory,
  revealSystem,
} from './reveal'
import spookStory from './stories/spook.json'
import wayneStory from './stories/wayne.json'
import yumiStory from './stories/yumi.json'
import { systems } from './systems'
import type { Reveal, RevealPoint } from './types'

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
    const check = (point: RevealPoint) => {
      if (typeof point === 'string') return expect(bookIds).toContain(point)
      if ('all' in point) return point.all.forEach(check)
      expect(bookIds).toContain(point.book)
      expect(chapters[point.book].map((c) => c.id)).toContain(point.chapter)
    }
    for (const tag of allTags()) {
      expect(tag.length).toBeGreaterThan(0)
      tag.forEach(check)
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

// Re-dated after the Coppermind Time Machine sweep showed the wiki gained
// these only after a later book; the dates come from the right footnotes.
describe('facts dated by the Time Machine sweep', () => {
  const at = (read: string[], reading: Record<string, string> = {}) =>
    readerCanSee({
      read: new Set(read),
      reading: new Map(Object.entries(reading)),
    })

  it("keeps Shallan's Formless alias until Rhythm of War names it", () => {
    const aliases = (c: ReturnType<typeof at>) =>
      revealCharacter('shallan-davar', c).aliases
    expect(aliases(at(['oathbringer']))).not.toContain('Formless')
    expect(
      aliases(at(['oathbringer'], { 'rhythm-of-war': '8' })),
    ).not.toContain('Formless')
    expect(aliases(at(['oathbringer'], { 'rhythm-of-war': '9' }))).toContain(
      'Formless',
    )
  })

  it("keeps Syl's earlier bond until Rhythm of War's first interlude", () => {
    const bonds = (c: ReturnType<typeof at>) =>
      revealCharacter('sylphrena', c).bonds
    expect(bonds(at(['oathbringer']))).not.toContain('Relador')
    expect(bonds(at(['oathbringer'], { 'rhythm-of-war': 'i-1' }))).toContain(
      'Relador',
    )
  })

  it('calls Lightsong a Cognitive Shadow only once the books use the term', () => {
    const species = (c: ReturnType<typeof at>) =>
      revealCharacter('lightsong', c).species
    expect(species(at(['warbreaker', 'oathbringer']))).not.toContain(
      'Cognitive Shadow',
    )
    expect(species(at(['warbreaker'], { 'rhythm-of-war': '15' }))).toContain(
      'Cognitive Shadow',
    )
  })
})

describe('art and appearance gaps', () => {
  const at = (read: string[], reading: Record<string, string> = {}) =>
    readerCanSee({
      read: new Set(read),
      reading: new Map(Object.entries(reading)),
    })
  const art = (id: string, c: ReturnType<typeof at>) =>
    revealPortrait(characterPortraits[id], c).portrait?.src

  it("shows Syl's Shardblade art only from Words of Radiance chapter 84", () => {
    expect(
      art('sylphrena', at(['way-of-kings'], { 'words-of-radiance': '83' })),
    ).toBe('/portraits/sylphrena-card.webp')
    expect(
      art('sylphrena', at(['way-of-kings'], { 'words-of-radiance': '84' })),
    ).toBe('/portraits/sylphrena-storm.webp')
  })

  it('shows Venli before stormform, then stormform from WoR I-11', () => {
    expect(art('venli', at(['way-of-kings']))).toBeUndefined()
    expect(
      art('venli', at(['way-of-kings'], { 'words-of-radiance': 'i-1' })),
    ).toBe('/portraits/venli-listeners.webp')
    expect(
      art('venli', at(['way-of-kings'], { 'words-of-radiance': 'i-10' })),
    ).toBe('/portraits/venli-listeners.webp')
    expect(
      art('venli', at(['way-of-kings'], { 'words-of-radiance': 'i-11' })),
    ).toBe('/portraits/venli-stormform.webp')
  })

  it('shows Moash as a bridgeman until Words of Radiance', () => {
    expect(art('moash', at([], { 'way-of-kings': '13' }))).toBeUndefined()
    expect(art('moash', at([], { 'way-of-kings': '14' }))).toBe(
      '/portraits/moash-bridge.webp',
    )
    expect(art('moash', at(['way-of-kings']))).toBe(
      '/portraits/moash-bridge.webp',
    )
  })

  it("replaces Dalinar's uniform art", () => {
    const srcs = characterPortraits['dalinar-kholin'].map((p) => p.src)
    expect(srcs).not.toContain('/portraits/dalinar-kholin-uniform.webp')
    expect(
      art(
        'dalinar-kholin',
        at(['way-of-kings'], { 'words-of-radiance': 'prologue' }),
      ),
    ).toBe('/portraits/dalinar-kholin-coat.webp')
  })

  it('dates the new appearance text by its footnotes', () => {
    const looks = (id: string, story: unknown, c: ReturnType<typeof at>) =>
      revealStory(id, story as Parameters<typeof revealStory>[1], c).appearance
        .length
    expect(
      looks(
        'spook',
        spookStory,
        at(['final-empire'], { 'well-of-ascension': '24' }),
      ),
    ).toBe(0)
    expect(
      looks(
        'spook',
        spookStory,
        at(['final-empire'], { 'well-of-ascension': '25' }),
      ),
    ).toBe(1)
    expect(
      looks(
        'spook',
        spookStory,
        at(['final-empire', 'well-of-ascension'], { 'hero-of-ages': '16' }),
      ),
    ).toBe(2)
    expect(looks('yumi', yumiStory, at([], { yumi: '14' }))).toBe(0)
    expect(looks('yumi', yumiStory, at([], { yumi: '15' }))).toBe(1)
    const era2 = ['alloy-of-law', 'shadows-of-self', 'bands-of-mourning']
    expect(looks('wayne', wayneStory, at(era2, { 'lost-metal': '48' }))).toBe(0)
    expect(looks('wayne', wayneStory, at(era2, { 'lost-metal': '49' }))).toBe(1)
  })
})

describe('planets', () => {
  const at = (reading: Record<string, string>) =>
    readerCanSee({ read: new Set(), reading: new Map(Object.entries(reading)) })
  const shown = (systemId: string, reading: Record<string, string>) =>
    revealSystem(
      systems.find((s) => s.id === systemId)!,
      at(reading),
    ).planets.map((p) => p.name)

  it('shows a planet from the chapter that first names it', () => {
    expect(shown('uncharted', { 'sunlit-man': '7' })).not.toContain('Canticle')
    expect(shown('uncharted', { 'sunlit-man': '8' })).toContain('Canticle')
    expect(shown('rosharan', { 'way-of-kings': '45' })).toEqual([])
    expect(shown('rosharan', { 'way-of-kings': '46' })).toEqual(['Roshar'])
  })

  it('shows a world named in another series once the reader gets there', () => {
    expect(shown('selish', { 'way-of-kings': '20' })).toEqual([])
    expect(shown('selish', { 'way-of-kings': '21' })).toEqual(['Sel'])
    expect(shown('rosharan', { 'sunlit-man': '9' })).toEqual(['Roshar'])
  })

  it("builds up a planet's description chapter by chapter", () => {
    const canticle = (chapter: string) =>
      revealSystem(
        systems.find((s) => s.id === 'uncharted')!,
        at({ 'sunlit-man': chapter }),
      ).planets.find((p) => p.id === 'canticle')!
    const early = canticle('8')
    expect(early.summary).toMatch(/stay ahead of the dawn/)
    expect(early.summary).not.toMatch(/Sky Tyrant|100 miles|Zellion/)
    expect(early.magicSystems).toEqual([])
    expect(early.spoilers).toBe(true)
    const mid = canticle('12')
    expect(mid.summary).toMatch(/Sky Tyrant/)
    expect(mid.summary).not.toMatch(/100 miles/)
    expect(mid.magicSystems).toEqual(['Charred', 'Sunhearts'])
    expect(canticle('34').summary).toMatch(/100 miles/)
  })
})
