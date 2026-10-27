import { describe, expect, it } from 'vitest'
import { books } from './books'
import { chapters } from './chapters'
import type { Atlas, JourneyEvent, JourneyPack } from './journey'
import { journeyAtlas } from './journeyAtlas'
import { journeyIndex } from './journeyIndex'
import { hasPack, loadPack } from './journeyPacks'
import {
  journeyShown,
  readerCanSee,
  revealCharacterJourney,
  revealJourney,
} from './reveal'
import type { Reveal } from './types'

const wok = 'way-of-kings'
const at = (chapter: string | null) =>
  readerCanSee({ read: new Set(), reading: new Map([[wok, chapter]]) })
const finished = readerCanSee({ read: new Set([wok]), reading: new Map() })
const none = readerCanSee({ read: new Set(), reading: new Map() })
const ch = (chapter: string): Reveal => [{ book: wok, chapter }]

/** A tiny made-up series, so the generic rules are tested apart from data. */
const atlas: Atlas = {
  map: (id) =>
    ({
      world: {
        id: 'world',
        title: 'World',
        image: { src: 'w.jpg', width: 1000, height: 500, alt: 'Map' },
        credit: { text: 'Map' },
        revealedIn: ch('prelude'),
      },
      later: {
        id: 'later',
        title: 'Later',
        image: { src: 'l.jpg', width: 100, height: 100, alt: 'Map' },
        credit: { text: 'Map' },
        revealedIn: ch('20'),
        parent: { mapId: 'world', placeId: 'town' },
      },
    })[id],
  place: (id) =>
    ({
      town: { id: 'town', name: 'Town', revealedIn: ch('3') },
      fort: { id: 'fort', name: 'Fort', revealedIn: [wok] },
    })[id],
}

const event = (
  id: string,
  chapter: string,
  order: number,
  more: Partial<JourneyEvent> = {},
): JourneyEvent => ({
  id,
  characters: ['hero'],
  mapId: 'world',
  path: [[order * 10, 5]],
  revealedIn: ch(chapter),
  order,
  ...more,
})

const events: JourneyEvent[] = [
  event('b', '10', 2, { placeId: 'town' }),
  // A flashback: read later, but earlier in the hero's life.
  event('a', '30', 1, { placeId: 'fort', approximate: true }),
  event('c', '5', 3),
  event('d', 'no-such-chapter', 4),
  event('e', '25', 5, { mapId: 'later' }),
  event('f', '6', 6, { characters: ['someone-else'] }),
  event('g', '7', 7, {
    title: 'Something happens',
    summary: [
      { text: 'Early words', revealedIn: ch('7') },
      { text: 'Later words', revealedIn: ch('40') },
    ],
  }),
]

const ids = (canSee: ReturnType<typeof at>) =>
  revealJourney('hero', events, atlas, canSee).stops.map((s) => s.id)

describe('revealJourney', () => {
  it('shows only events reached, at chapter granularity', () => {
    expect(ids(none)).toEqual([])
    expect(ids(at(null))).toEqual([])
    expect(ids(at('4'))).toEqual([])
    expect(ids(at('5'))).toEqual(['c'])
    expect(ids(at('9'))).toEqual(['c', 'g'])
    expect(ids(at('10'))).toEqual(['b', 'c', 'g'])
  })

  it('orders stops by the timeline, not by reading order', () => {
    expect(ids(at('epilogue'))).toEqual(['a', 'b', 'c', 'e', 'g'])
  })

  it('hides an event dated to an unknown chapter until the book is done', () => {
    expect(ids(at('epilogue'))).not.toContain('d')
    expect(revealJourney('hero', events, atlas, at('epilogue')).spoilers).toBe(
      true,
    )
    // A finished book reveals all of itself, as everywhere in the app.
    expect(ids(finished)).toContain('d')
  })

  it('waits for the map as well as the event', () => {
    const shown = revealJourney('hero', events, atlas, at('25'))
    expect(shown.stops.map((s) => s.id)).toContain('e')
    expect(shown.maps.map((m) => m.id)).toEqual(['world', 'later'])
    const before = revealJourney(
      'hero',
      [event('e', '15', 5, { mapId: 'later' })],
      atlas,
      at('19'),
    )
    expect(before.stops).toEqual([])
    expect(before.spoilers).toBe(true)
  })

  it('names a place only once the place is revealed', () => {
    const early = revealJourney('hero', events, atlas, at('10')).stops
    expect(early.find((s) => s.id === 'b')?.place?.name).toBe('Town')
    const late = revealJourney('hero', events, atlas, at('30')).stops
    expect(late.find((s) => s.id === 'a')?.place).toBeUndefined()
    const done = revealJourney('hero', events, atlas, finished).stops
    expect(done.find((s) => s.id === 'a')?.place?.name).toBe('Fort')
    expect(done.find((s) => s.id === 'a')?.approximate).toBe(true)
  })

  it('says where each stop is revealed, and trims its text', () => {
    const g = revealJourney('hero', events, atlas, at('10')).stops.find(
      (s) => s.id === 'g',
    )
    expect(g?.where).toEqual({ bookId: wok, chapter: '7' })
    expect(g?.title).toBe('Something happens')
    expect(g?.summary).toEqual([{ text: 'Early words' }])
  })

  it('replaces a passage with a fuller one, linking only people met', () => {
    const born = [
      event('born', '5', 0, {
        summary: [
          { text: 'Born.', revealedIn: ch('5'), supersededIn: ch('20') },
          {
            text: 'Born to Kaladin and Lift.',
            revealedIn: ch('20'),
            links: [
              { text: 'Kaladin', characterId: 'kaladin' },
              { text: 'Lift', characterId: 'lift' },
            ],
          },
        ],
      }),
    ]
    const summary = (canSee: ReturnType<typeof at>) =>
      revealJourney('hero', born, atlas, canSee).stops[0].summary
    expect(summary(at('19'))).toEqual([{ text: 'Born.' }])
    // Lift isn't met in this book, so isn't linked.
    expect(summary(at('20'))).toEqual([
      {
        text: 'Born to Kaladin and Lift.',
        links: [{ text: 'Kaladin', href: '/characters/kaladin' }],
      },
    ])
  })

  it('keeps an event off the map until where it happened is revealed', () => {
    const born = [
      event('born', '5', 0, {
        placeId: 'town',
        placeRevealedIn: ch('20'),
        title: 'Born',
        summary: [
          {
            text: 'Born in a known year.',
            revealedIn: ch('5'),
            cite: { text: 'Word of Brandon', url: 'https://example.com' },
          },
          { text: 'To known parents.', revealedIn: ch('20') },
        ],
      }),
    ]
    const early = revealJourney('hero', born, atlas, at('10')).stops[0]
    expect(early.path).toEqual([])
    expect(early.place).toBeUndefined()
    expect(early.summary).toEqual([
      {
        text: 'Born in a known year.',
        cite: { text: 'Word of Brandon', url: 'https://example.com' },
      },
    ])
    const late = revealJourney('hero', born, atlas, at('20')).stops[0]
    expect(late.path).toEqual([[0, 5]])
    expect(late.place?.name).toBe('Town')
    expect(late.summary.map((p) => p.text)).toEqual([
      'Born in a known year.',
      'To known parents.',
    ])
  })

  it('flags hidden events as spoilers, and credits only what it shows', () => {
    const credits = [{ text: 'Data', url: 'https://example.com' }]
    expect(revealJourney('hero', events, atlas, none, { credits })).toEqual({
      stops: [],
      maps: [],
      credits: [],
      spoilers: true,
    })
    const shown = revealJourney('hero', events, atlas, at('10'), { credits })
    expect(shown.credits).toEqual(credits)
    expect(shown.spoilers).toBe(true)
  })
})

describe('journey data', () => {
  const art = Object.keys(import.meta.glob('../../public/journey-art/*'))
  const packs = new Map<string, JourneyPack>()
  const pack = async (id: string) => {
    if (!packs.has(id)) packs.set(id, (await loadPack(id))!)
    return packs.get(id)!
  }

  it('indexes exactly the packs, maps and chapters the events use', async () => {
    for (const [characterId, entries] of Object.entries(journeyIndex))
      for (const { pack: id, mapId, revealedIn } of entries) {
        expect(hasPack(id)).toBe(true)
        const mine = (await pack(id)).events.filter(
          (e) => e.characters.includes(characterId) && e.mapId === mapId,
        )
        expect(mine.length).toBeGreaterThan(0)
        expect(new Set(revealedIn.map((p) => JSON.stringify(p)))).toEqual(
          new Set(
            mine.flatMap((e) => e.revealedIn.map((p) => JSON.stringify(p))),
          ),
        )
      }
  })

  it('dates every event to a known chapter and keeps it on its map', async () => {
    for (const id of new Set(
      Object.values(journeyIndex).flatMap((es) => es.map((e) => e.pack)),
    )) {
      const p = await pack(id)
      expect(p.credits.length).toBeGreaterThan(0)
      for (const e of p.events) {
        const map = journeyAtlas.map(e.mapId)
        expect(map, e.mapId).toBeDefined()
        expect(e.revealedIn.length).toBeGreaterThan(0)
        for (const point of e.revealedIn) {
          // A whole work only when it has no chapters (a short story).
          if (typeof point === 'string') {
            expect(chapters[point] ?? [], point).toHaveLength(0)
            continue
          }
          if ('all' in point) continue
          expect(chapters[point.book]?.map((c) => c.id)).toContain(
            point.chapter,
          )
        }
        for (const [x, y] of e.path) {
          expect(x).toBeGreaterThanOrEqual(0)
          expect(y).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThanOrEqual(map!.image.width)
          expect(y).toBeLessThanOrEqual(map!.image.height)
        }
        if (e.placeId) expect(journeyAtlas.place(e.placeId)).toBeDefined()
        // Our own text, and where it happened, are revealed with the
        // event or later (a later version may come in a later book of the
        // series), never earlier.
        const bookAt = (id: string) => books.findIndex((b) => b.id === id)
        const index = (point: Reveal[number]) => {
          if (typeof point === 'string' || 'all' in point) return -1
          return chapters[point.book].findIndex((c) => c.id === point.chapter)
        }
        const [own] = e.revealedIn
        for (const reveal of [
          ...(e.summary ?? []).map((p) => p.revealedIn),
          ...(e.placeRevealedIn ? [e.placeRevealedIn] : []),
        ])
          for (const point of reveal) {
            // A short story with no chapters is dated as a whole.
            const book = (p: Reveal[number]) =>
              typeof p === 'string' ? p : 'book' in p ? p.book : undefined
            expect(book(point)).toBeDefined()
            if (!book(own)) throw new Error(`${e.id} has no book`)
            if (book(own) === book(point))
              expect(index(point)).toBeGreaterThanOrEqual(index(own))
            else
              expect(bookAt(book(point)!)).toBeGreaterThan(bookAt(book(own)!))
          }
        // Ids are neutral: they must never name what happens.
        expect(e.id).toMatch(/^[a-z]+-[0-9a-f]{8}$/)
        // Art is credited, described, and named by the neutral id only.
        if (e.art) {
          expect(e.art.src).toBe(`/journey-art/${e.id}.webp`)
          expect(art).toContain(`../../public${e.art.src}`)
          expect(e.art.alt.length).toBeGreaterThan(10)
          expect(e.art.credit.text).not.toBe('')
        }
      }
    }
  })
})

describe("Kaladin's journey in The Way of Kings", () => {
  const kaladin = async (canSee: ReturnType<typeof at>) => {
    const pack = (await loadPack('roshar'))!
    return revealCharacterJourney(
      'kaladin',
      pack.events,
      journeyAtlas,
      canSee,
      {
        credits: pack.credits,
      },
    )
  }
  const chaptersOf = async (canSee: ReturnType<typeof at>) =>
    (await kaladin(canSee)).stops.map((s) => s.where?.chapter)

  it('shows nothing before his first event is reached', async () => {
    for (const canSee of [none, at(null), at('prologue')]) {
      expect((await kaladin(canSee)).stops).toEqual([])
      expect(journeyShown('kaladin', journeyIndex, journeyAtlas, canSee)).toBe(
        false,
      )
    }
  })

  it('starts with his birth, each part shown only once read', async () => {
    const [born] = (await kaladin(at('1'))).stops
    expect(born.title).toBe('Born')
    // Where isn't known yet: no point on the map, no place.
    expect(born.path).toEqual([])
    expect(born.place).toBeUndefined()
    // Only the year, from a Word of Brandon that spoils nothing.
    expect(born.summary).toHaveLength(1)
    expect(born.summary[0].text).not.toMatch(/Lirin|Hesina|Hearthstone/)
    expect(born.summary[0].cite?.text).toBe('Word of Brandon')
    expect(journeyShown('kaladin', journeyIndex, journeyAtlas, at('1'))).toBe(
      true,
    )
    // Once his parents are known, a fuller line replaces the year alone,
    // linking them to their pages.
    const [later] = (await kaladin(at('16'))).stops
    expect(later.path).toHaveLength(1)
    expect(later.summary).toHaveLength(1)
    expect(later.summary[0].text).toMatch(/1153 to Lirin and Hesina/)
    expect(later.summary[0].links?.map((l) => l.href)).toEqual([
      '/characters/lirin',
      '/characters/hesina',
    ])
  })

  it('adds each event at its own chapter', async () => {
    expect(await chaptersOf(at('6'))).toEqual(['1', '6'])
    expect(await chaptersOf(at('15'))).toEqual(['1', '6'])
    const mid = await chaptersOf(at('30'))
    expect(mid.toSorted()).toEqual(['1', '16', '20', '6'])
    // Flashbacks to his youth come first on the timeline.
    expect(mid).toEqual(['1', '16', '20', '6'])
    for (const chapter of await chaptersOf(at('60')))
      expect(
        chapters[wok].findIndex((c) => c.id === chapter),
      ).toBeLessThanOrEqual(chapters[wok].findIndex((c) => c.id === '60'))
  })

  it("shows each event's art only with the event", async () => {
    const early = await kaladin(at('6'))
    expect(early.stops.map((s) => s.title)).toEqual([
      'Born',
      'Sold to Bridge Four',
    ])
    expect(early.stops[1].art?.credit.text).toBe('ThomasW')
    const all = await kaladin(finished)
    expect(all.stops.filter((s) => s.art)).toHaveLength(8)
    // Events with no art that shows them get none.
    expect(
      all.stops.find((s) => s.title === 'Drawing in Stormlight')?.art,
    ).toBeUndefined()
  })

  it('shows the whole book once finished, without naming unrevealed places midway', async () => {
    const all = await kaladin(finished)
    expect(all.stops).toHaveLength(13)
    // Later books' events stay hidden until those books are read.
    expect(all.stops.every((s) => s.where?.bookId === wok)).toBe(true)
    expect(all.spoilers).toBe(true)
    expect(all.credits[0].url).toBe('https://github.com/17thshard/roshar-map')
    // Midway a stop links its place only once a chapter reached names it;
    // otherwise it gives only the name its own chapter tells.
    const midway = (await kaladin(at('60'))).stops
    expect(midway.every((s) => s.place)).toBe(true)
    for (const s of midway)
      if (s.place?.href)
        expect(
          at('60')(
            journeyAtlas.place(s.place.href.split('/').at(-1)!)!.revealedIn,
          ),
        ).toBe(true)
    expect(midway.some((s) => !s.place?.href)).toBe(true)
    expect(all.stops.some((s) => s.place?.name === 'Shattered Plains')).toBe(
      true,
    )
  })

  it('adds later books in story order as they are read', async () => {
    const wor = 'words-of-radiance'
    const shown = await kaladin(
      readerCanSee({ read: new Set([wok]), reading: new Map([[wor, '20']]) }),
    )
    const books = shown.stops.map((s) => s.where?.bookId)
    expect(books.slice(0, 13).every((b) => b === wok)).toBe(true)
    expect(books.slice(13).length).toBeGreaterThan(0)
    expect(books.slice(13).every((b) => b === wor)).toBe(true)
    for (const stop of shown.stops.slice(13))
      expect(
        chapters[wor].findIndex((c) => c.id === stop.where?.chapter),
      ).toBeLessThanOrEqual(chapters[wor].findIndex((c) => c.id === '20'))
  })

  it('gives a persona no journey', async () => {
    const shown = revealCharacterJourney(
      'zahel',
      (await loadPack('roshar'))!.events,
      journeyAtlas,
      finished,
    )
    expect(shown.stops).toEqual([])
  })
})

describe('every journey stop', () => {
  const series: Record<string, string[]> = {
    roshar: [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
      'rhythm-of-war',
    ],
    scadrial: ['final-empire', 'well-of-ascension', 'hero-of-ages'],
  }
  it('names where it happens as soon as it shows', async () => {
    const missing: string[] = []
    for (const [packId, books] of Object.entries(series)) {
      const events = (await loadPack(packId))!.events
      for (const e of events) {
        // Where it happened can be held back (a birthplace): check from then.
        const [point] = e.placeRevealedIn ?? e.revealedIn
        if (typeof point !== 'object' || !('book' in point)) continue
        const canSee = readerCanSee({
          read: new Set(books.slice(0, books.indexOf(point.book))),
          reading: new Map([[point.book, point.chapter]]),
        })
        for (const c of e.characters) {
          const stop = revealCharacterJourney(
            c,
            events,
            journeyAtlas,
            canSee,
          ).stops.find((s) => s.id === e.id)
          if (stop && !stop.place) missing.push(`${c}: ${stop.title}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})

describe('a shared Roshar event', () => {
  it("tells each character's side as their own stop", async () => {
    const events = (await loadPack('roshar'))!.events
    const wor = readerCanSee({
      read: new Set([wok]),
      reading: new Map([['words-of-radiance', '33']]),
    })
    const last = (id: string) =>
      revealCharacterJourney(id, events, journeyAtlas, wor).stops.at(-1)!
    // Dalinar's own text, dated to his chapter; Kaladin's comes later.
    expect(last('dalinar-kholin').title).toBe("Szeth's attack")
    expect(last('kaladin').title).not.toBe("Szeth's attack")
    const later = readerCanSee({
      read: new Set([wok]),
      reading: new Map([['words-of-radiance', 'i-6']]),
    })
    const kaladin = revealCharacterJourney(
      'kaladin',
      events,
      journeyAtlas,
      later,
    )
    expect(kaladin.stops.at(-1)!.title).toBe('The assassin in white')
  })
})

describe("Vin's journey in Era 1", () => {
  const reading = (book: string, chapter: string) =>
    readerCanSee({ read: new Set(), reading: new Map([[book, chapter]]) })
  const vin = async (canSee: ReturnType<typeof at>) => {
    const pack = (await loadPack('scadrial'))!
    return revealCharacterJourney('vin', pack.events, journeyAtlas, canSee, {
      credits: pack.credits,
    })
  }

  it('reveals each event at its chapter, starting with her birth', async () => {
    expect((await vin(reading('final-empire', '1'))).stops).toEqual([])
    expect(
      (await vin(reading('final-empire', '2'))).stops.map((s) => s.title),
    ).toEqual(["Vin works Camon's cons with her Luck"])
    const early = await vin(reading('final-empire', '4'))
    expect(early.stops.map((s) => s.title)).toEqual([
      'Vin is born',
      'Reen raises Vin, then leaves',
      "Vin works Camon's cons with her Luck",
      "Vin joins Kelsier's crew",
    ])
    // The city brings the world map holding it, to zoom out to.
    expect(early.stops.map((s) => s.mapId)).toEqual([
      'final-empire',
      'final-empire',
      'luthadel',
      'luthadel',
    ])
    expect(early.maps.map((m) => m.id)).toEqual(['final-empire', 'luthadel'])
    expect(journeyAtlas.map('luthadel')?.parent?.mapId).toBe('final-empire')
    const later = await vin(reading('final-empire', '8'))
    expect(later.stops.at(-1)?.mapId).toBe('final-empire')
  })

  it('keeps later books and the Fadrex map hidden until reached', async () => {
    const tfe = await vin(reading('final-empire', 'epilogue'))
    expect(tfe.stops.every((s) => s.where?.bookId === 'final-empire')).toBe(
      true,
    )
    expect(tfe.maps.map((m) => m.id)).not.toContain('fadrex-city')
    const hoa = await vin(
      readerCanSee({
        read: new Set(['final-empire', 'well-of-ascension']),
        reading: new Map([['hero-of-ages', '30']]),
      }),
    )
    expect(hoa.maps.map((m) => m.id)).toContain('fadrex-city')
    expect(hoa.stops.at(-1)?.where).toEqual({
      bookId: 'hero-of-ages',
      chapter: '30',
    })
  })

  it('names the square only once the reader knows its later name', async () => {
    const stop = (await vin(reading('final-empire', '34'))).stops.at(-1)!
    expect(stop.title).toBe('Vin watches Kelsier die')
    expect(stop.place?.name ?? '').not.toMatch(/Survivor/)
  })
})

describe('persona journeys', () => {
  const tfe = (chapter: string) =>
    readerCanSee({
      read: new Set(),
      reading: new Map([['final-empire', chapter]]),
    })
  const stay = (
    id: string,
    who: string,
    reveal: Reveal,
    order: number,
  ): JourneyEvent => ({
    id,
    characters: [who],
    mapId: 'final-empire',
    path: [[1273, 805]],
    revealedIn: reveal,
    order,
  })
  // Made-up events: one told under the persona's name, one about the
  // character himself, dated in the persona's book, and one in a later book.
  const events = [
    stay('ruler', 'lord-ruler', [{ book: 'final-empire', chapter: '5' }], 1),
    stay('trek', 'rashek', [{ book: 'final-empire', chapter: '20' }], 0),
    stay('later', 'rashek', [{ book: 'well-of-ascension', chapter: '5' }], 2),
  ]
  const index = {
    'lord-ruler': [
      {
        pack: 'scadrial',
        mapId: 'final-empire',
        revealedIn: [{ book: 'final-empire', chapter: '5' }],
      },
    ],
    rashek: [
      {
        pack: 'scadrial',
        mapId: 'final-empire',
        revealedIn: [{ book: 'final-empire', chapter: '20' }],
      },
    ],
  }
  const ids = (id: string, canSee: ReturnType<typeof at>) =>
    revealCharacterJourney(id, events, journeyAtlas, canSee).stops.map(
      (s) => s.id,
    )

  it("shows a persona's own events on its page, never the character's", () => {
    expect(ids('lord-ruler', tfe('30'))).toEqual(['ruler'])
    expect(journeyShown('lord-ruler', index, journeyAtlas, tfe('30'))).toBe(
      true,
    )
    expect(journeyShown('lord-ruler', index, journeyAtlas, tfe('4'))).toBe(
      false,
    )
  })

  it("keeps the character's events in the persona's books hidden until the reader sees through it", () => {
    expect(ids('rashek', tfe('30'))).toEqual([])
    expect(journeyShown('rashek', index, journeyAtlas, tfe('30'))).toBe(false)
  })

  it('merges both once the reader knows who the persona is', () => {
    expect(ids('rashek', tfe('38'))).toEqual(['trek', 'ruler'])
    expect(journeyShown('rashek', index, journeyAtlas, tfe('38'))).toBe(true)
  })
})

describe("Shallan's journey on Roshar's city maps", () => {
  const reading = (book: string, chapter: string) =>
    readerCanSee({ read: new Set(), reading: new Map([[book, chapter]]) })
  const shallan = async (canSee: ReturnType<typeof at>) => {
    const pack = (await loadPack('roshar'))!
    return revealCharacterJourney(
      'shallan-davar',
      pack.events,
      journeyAtlas,
      canSee,
      { credits: pack.credits },
    )
  }

  it('puts her Kharbranth stays on the city map, inside Roshar', async () => {
    const j = await shallan(finished)
    const there = j.stops.filter((s) => s.mapId === 'kharbranth')
    expect(there.length).toBeGreaterThan(1)
    expect(j.maps.map((m) => m.id)).toEqual(['roshar', 'kharbranth'])
    // Only the hand source is hers now; the imported one isn't credited.
    expect(j.credits.map((c) => c.source)).toEqual(['roshar-hand'])
  })

  it('keeps each city map closed until its own gate', async () => {
    const early = await shallan(reading('words-of-radiance', '12'))
    expect(early.maps.some((m) => m.id === 'frostlands')).toBe(false)
    const later = await shallan(reading('words-of-radiance', '13'))
    expect(later.maps.some((m) => m.id === 'frostlands')).toBe(true)
    for (const s of later.stops) expect(journeyAtlas.map(s.mapId)).toBeDefined()
  })
})
