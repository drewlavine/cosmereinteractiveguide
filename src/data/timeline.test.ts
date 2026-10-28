import { describe, expect, it } from 'vitest'
import { readerCanSee } from './reveal'
import { COSMERE, formatYear, revealTimeline, timelineEvents } from './timeline'
import { revealShards } from './shards'
import { peopleAt } from './timelinePeople'

const at = (read: string[], reading: Record<string, string> = {}) =>
  revealTimeline(
    readerCanSee({
      read: new Set(read),
      reading: new Map(Object.entries(reading)),
    }),
  )
const ids = (t: ReturnType<typeof at>) => t.events.map((e) => e.id)
const event = (t: ReturnType<typeof at>, id: string) =>
  t.events.find((e) => e.id === id)

const ERA1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']
/** Every book before Wind and Truth, as far as the timeline cares. */
const BEFORE_WAT = [
  'elantris',
  'hope-of-elantris',
  'emperors-soul',
  ...ERA1,
  'secret-history',
  'warbreaker',
  'way-of-kings',
  'words-of-radiance',
  'oathbringer',
  'rhythm-of-war',
  'shadows-for-silence',
  'white-sand-omnibus',
  'arcanum-unbounded',
  'sunlit-man',
]

describe('Cosmere Timeline reveal', () => {
  it("gives a birth no card line, and pins Dalinar's birth in Alethkar once named", () => {
    const early = event(at([], { 'way-of-kings': 'prologue' }), 'dalinar-born')
    // A birth's card is just its title.
    expect(early?.summary).toBe('')
    expect(early?.blurb).toBe('Dalinar Kholin is born.')
    expect(early?.map).toEqual({ mapId: 'roshar' })
    // Known only by its country: pinned in the middle of Alethkar.
    const placed = event(at(['way-of-kings']), 'dalinar-born')
    expect(placed?.map).toEqual({
      mapId: 'roshar',
      at: [1868, 853],
      place: 'Alethkar',
    })
    expect(placed?.blurb).toMatch(/the Blackthorn/)
    expect(event(at(['way-of-kings']), 'kaladin-born')?.summary).toBe('')
  })

  it('shows nothing before the reader starts a book', () => {
    expect(at([]).events).toEqual([])
    expect(at([]).worlds).toEqual([])
  })

  it('shows only the Oathpact at the Way of Kings prelude, undated', () => {
    const t = at([], { 'way-of-kings': 'prelude' })
    expect(ids(t)).toEqual(['oathpact-abandoned'])
    expect(t.events[0].date).toBeUndefined()
    expect(t.worlds.map((w) => w.name)).toEqual(['Roshar'])
  })

  it('dates the Oathpact from the prologue, but names its calendar only once Roshar is named', () => {
    const prologue = event(
      at([], { 'way-of-kings': 'prologue' }),
      'oathpact-abandoned',
    )
    expect(prologue?.date).toEqual({
      text: 'ca. \u22123333',
      year: -3333,
      calendar: 'rosharan',
      circa: true,
    })
    const named = event(at([], { 'way-of-kings': '46' }), 'oathpact-abandoned')
    expect(named?.date?.label).toBe('Rosharan year')
  })

  it('puts the Shattering in the open Cosmere until the books say where it happened', () => {
    const lecture = at(ERA1, { 'secret-history': '3-2' })
    const shattering = event(lecture, 'shattering')
    expect(shattering?.title).toBe('Adonalsium is killed')
    expect(shattering?.world.id).toBe(COSMERE)
    expect(shattering?.date).toMatchObject({
      text: '0',
      label: 'after the Shattering',
    })
    expect(shattering?.blurb).not.toMatch(/Yolen/)
    // Its burst shows with it, out in the open Cosmere.
    expect(shattering?.effect).toBe('shattering')
    expect(lecture.worlds.map((w) => w.id)).not.toContain('yolen')

    // Drew's point: still the open Cosmere at Wind and Truth 17.
    const drew = at(BEFORE_WAT, { 'wind-and-truth': '17' })
    expect(event(drew, 'shattering')?.world.id).toBe(COSMERE)
    expect(JSON.stringify(drew)).not.toMatch(/Yolen/)

    const after = at([...BEFORE_WAT, 'wind-and-truth'])
    expect(event(after, 'shattering')?.world.name).toBe('Yolen')
    expect(event(after, 'shattering')?.blurb).toMatch(/on Yolen/)
  })

  it('shows the Silver Kingdoms before the Recreance, once their map is out', () => {
    const early = at([], { 'way-of-kings': 'prelude' })
    expect(event(early, 'oathpact-abandoned')?.map?.mapId).toBe('roshar')
    const read = at(['way-of-kings'])
    expect(event(read, 'oathpact-abandoned')?.map?.mapId).toBe(
      'silver-kingdoms',
    )
    expect(event(read, 'gavilar-assassinated')?.map?.mapId).toBe('roshar')
  })

  it('goes by years after the Shattering only once the reader knows of it', () => {
    const wok = event(at(['way-of-kings']), 'gavilar-assassinated')
    expect(wok?.when).toBe(wok?.date)
    expect(wok?.when?.label).toBe('Rosharan year')
    const later = event(
      at(['way-of-kings', ...ERA1, 'secret-history']),
      'gavilar-assassinated',
    )
    expect(later?.when).toMatchObject({
      text: 'ca. 10958',
      label: 'after the Shattering',
    })
    expect(later?.date?.text).toBe('1167.10')
  })

  it('reveals each Shard settling only once its home is named', () => {
    const lecture = at(ERA1, { 'secret-history': '3-2' })
    // Era 1 shows Scadrial's Shards; Roshar, Sel, Nalthis and Taldain wait.
    expect(ids(lecture)).toEqual(['shattering', 'ruin-preservation-scadrial'])
    expect(event(lecture, 'ruin-preservation-scadrial')?.date).toMatchObject({
      text: 'ca. \u22129601',
      label: 'FE',
    })

    const hoa = at(['final-empire', 'well-of-ascension', 'hero-of-ages'])
    expect(ids(hoa)).not.toContain('ruin-preservation-scadrial')

    const warbreaker = at([...ERA1, 'secret-history', 'warbreaker'])
    expect(ids(warbreaker)).toContain('endowment-settles')
    expect(ids(warbreaker)).not.toContain('devotion-dominion-settle')
    expect(ids(warbreaker)).not.toContain('autonomy-settles')

    const drew = at(BEFORE_WAT, { 'wind-and-truth': '17' })
    const settle = drew.events.filter((e) => e.group?.id === 'shards-settle')
    expect(settle.map((e) => e.world.id)).toEqual([
      'roshar',
      'scadrial',
      'sel',
      'nalthis',
      'taldain',
    ])
    for (const e of settle) {
      expect(e.date?.circa).toBe(true)
      expect(e.notes).toContainEqual({
        label: 'Approximate',
        text: "The order and timing of the Shards' settling are approximate.",
      })
    }
  })

  it("badges facts known only from Brandon's answers", () => {
    const drew = at(BEFORE_WAT, { 'wind-and-truth': '17' })
    for (const id of ['roshar-created', 'spren-created'])
      expect(event(drew, id)?.notes.map((n) => n.label)).toEqual([
        'Word of Brandon',
      ])
    expect(event(drew, 'shattering')?.notes).toEqual([])
  })

  it("keeps Wind and Truth's events hidden at chapter 17", () => {
    const drew = at(BEFORE_WAT, { 'wind-and-truth': '17' })
    expect(ids(drew)).not.toContain('odium-ashyn')
    expect(drew.worlds.map((w) => w.id)).not.toContain('ashyn')
    expect(ids(at([...BEFORE_WAT, 'wind-and-truth']))).toContain('odium-ashyn')
  })

  it('tells of the human refugees before naming Ashyn', () => {
    const stele = at(['way-of-kings', 'words-of-radiance'], {
      oathbringer: '111',
    })
    const humans = event(stele, 'humans-arrive')
    expect(humans?.blurb).toMatch(/refugees from another world/)
    expect(humans?.blurb).not.toMatch(/Ashyn/)
    expect(event(at(['arcanum-unbounded']), 'humans-arrive')?.blurb).toMatch(
      /Ashyn/,
    )
  })

  it('names the Selish calendar from the Reod on', () => {
    const prologue = event(at([], { elantris: 'prologue' }), 'reod')
    expect(prologue?.title).toBe('Elantris falls')
    expect(prologue?.date).toBeUndefined()
    const reod = event(at([], { elantris: '4' }), 'reod')
    expect(reod?.date).toMatchObject({ text: '0', label: 'Selish year' })
  })

  it('spaces every shown event at least a marker apart, in order', () => {
    const all = at([...BEFORE_WAT, 'wind-and-truth', 'isles-of-the-emberdark'])
    expect(ids(all)).toEqual(
      [...timelineEvents].sort((a, b) => a.year - b.year).map((e) => e.id),
    )
    all.events.slice(1).forEach((e, i) => {
      expect(e.offset - all.events[i].offset).toBeGreaterThanOrEqual(1)
    })
  })

  it('formats years the way the 17th Shard map does', () => {
    expect(formatYear({ year: -9742.09, circa: true })).toBe('ca. \u22129742')
    expect(formatYear({ year: 1167, parts: [10] })).toBe('1167.10')
    expect(formatYear({ year: 0 })).toBe('0')
  })

  it("never tells of a death the reader hasn't reached", () => {
    const canSee = readerCanSee({
      read: new Set(BEFORE_WAT),
      reading: new Map(),
    })
    const shown = (events: typeof timelineEvents) => {
      const t = revealTimeline(canSee, events)
      return peopleAt(t, canSee, t.events.length - 1).find(
        (p) => p.id === 'gavilar-kholin',
      )
    }
    expect(shown(timelineEvents)?.died).toMatchObject({ years: 0 })
    // The same timeline with his death not yet revealed: alive, as far as
    // the reader knows, and nothing said of it.
    const later = timelineEvents.map((e) =>
      e.id === 'gavilar-assassinated'
        ? { ...e, revealedIn: ['wind-and-truth'] }
        : e,
    )
    const gavilar = shown(later)
    expect(gavilar?.name).toBe('Gavilar Kholin')
    expect(gavilar?.died).toBeUndefined()
  })

  it("shows each Shard's latest entry the reader can see by now", () => {
    const canSee = readerCanSee({
      read: new Set(BEFORE_WAT),
      reading: new Map(),
    })
    const t = revealTimeline(canSee)
    const at = (id: string) => t.events.findIndex((e) => e.id === id)
    const shard = {
      id: 'test',
      name: 'Test',
      art: 'test.webp',
      entries: [
        {
          from: 'ruin-preservation-scadrial',
          world: 'scadrial',
          status: 'A',
          vessel: { name: 'V', id: 'v', revealedIn: ['hero-of-ages'] },
          revealedIn: ['hero-of-ages'],
        },
        {
          from: 'gavilar-assassinated',
          world: 'roshar',
          status: 'B',
          vessel: { name: 'W', id: 'w', revealedIn: ['wind-and-truth'] },
          faded: true,
          revealedIn: ['hero-of-ages'],
        },
        {
          from: 'gavilar-assassinated',
          world: 'roshar',
          status: 'C',
          revealedIn: ['wind-and-truth'],
        },
      ],
    }
    const show = (event: string, before = 0) =>
      revealShards(t, canSee, at(event) - before, [shard])
    // W's name waits for Wind and Truth.
    expect(show('gavilar-assassinated')).toEqual([
      {
        id: 'test',
        name: 'Test',
        art: 'test.webp',
        world: 'roshar',
        status: 'B',
        faded: true,
      },
    ])
    expect(show('ruin-preservation-scadrial')[0]).toMatchObject({
      status: 'A',
      vessel: 'V',
      vesselId: 'v',
      faded: false,
    })
    expect(show('ruin-preservation-scadrial', 1)).toEqual([])
  })

  it('marks Ambition destroyed at Rhythm of War 27, naming its Vessel only in Wind and Truth', () => {
    const ambition = (read: string[], reading: Record<string, string> = {}) => {
      const canSee = readerCanSee({
        read: new Set(read),
        reading: new Map(Object.entries(reading)),
      })
      const t = revealTimeline(canSee)
      const now = t.events.findIndex((e) => e.id === 'gavilar-assassinated')
      return revealShards(t, canSee, now).find((s) => s.id === 'ambition')
    }
    const early = BEFORE_WAT.filter((b) => b !== 'rhythm-of-war')
    expect(ambition(early, { 'rhythm-of-war': '26' })).toMatchObject({
      world: 'threnody',
      status: 'Mortally wounded by Odium near Threnody; it escapes',
      faded: false,
    })
    expect(ambition(early, { 'rhythm-of-war': '27' })).toMatchObject({
      status: 'Destroyed after clashing with Odium and Mercy',
      faded: true,
    })
    expect(ambition(BEFORE_WAT)?.vessel).toBeUndefined()
    expect(ambition([...BEFORE_WAT, 'wind-and-truth'])?.vessel).toBe(
      'Uli Da (dead)',
    )
  })
})
