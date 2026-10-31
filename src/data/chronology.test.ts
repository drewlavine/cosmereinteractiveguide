import { describe, expect, it } from 'vitest'
import { findBook } from './books'
import { chapters } from './chapters'
import { findCharacter } from './characters'
import {
  chronoKinds,
  chronoTiers,
  revealChronology,
  type ChronoEvent,
} from './chronology'
import data from './chronology.json'
import { sharedYear } from './bookTimeline'
import { chapterIndex } from './progress'
import { readerCanSee } from './reveal'
import { systems } from './systems'
import type { Reveal } from './types'

const events = data as unknown as ChronoEvent[]
const canSeeAt = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })

describe('the researched chronology', () => {
  it('only points at books, chapters, worlds and people the guide knows', () => {
    const planets = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
    const bad: string[] = []
    const check = (id: string, reveal: Reveal = []) => {
      for (const point of reveal.flatMap((p) =>
        typeof p === 'object' && 'all' in p ? p.all : [p],
      )) {
        const book = typeof point === 'string' ? point : point.book
        if (!findBook(book)) bad.push(`${id}: book ${book}`)
        else if (
          typeof point === 'object' &&
          chapters[book] &&
          chapterIndex(book, point.chapter) === undefined
        )
          bad.push(`${id}: ${book} chapter ${point.chapter}`)
      }
    }
    for (const e of events) {
      check(e.id, e.revealedIn)
      check(e.id, e.worldRevealedIn)
      for (const t of [...e.title, ...e.summary]) check(e.id, t.revealedIn)
      if (e.world !== 'cosmere' && !planets.has(e.world))
        bad.push(`${e.id}: world ${e.world}`)
      for (const c of e.characters ?? [])
        if (!findCharacter(c)) bad.push(`${e.id}: character ${c}`)
      if (!chronoTiers.includes(e.tier)) bad.push(`${e.id}: tier ${e.tier}`)
      if (!(e.kind in chronoKinds)) bad.push(`${e.id}: kind ${e.kind}`)
    }
    expect(bad).toEqual([])
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length)
  })

  const WOK = 'way-of-kings'
  const fixture: ChronoEvent[] = [
    {
      id: 'roshar-later',
      world: 'roshar',
      year: 20,
      certainty: 'exact',
      basis: 'text',
      title: [{ text: 'Later', revealedIn: [WOK] }],
      summary: [{ text: 'Later still.', revealedIn: [WOK] }],
      tier: 'minor',
      kind: 'story',
      revealedIn: [WOK],
      sources: [],
    },
    {
      id: 'roshar-event',
      world: 'roshar',
      worldRevealedIn: [{ book: WOK, chapter: '50' }],
      year: 10,
      certainty: 'estimate',
      basis: 'text',
      local: 'c. 1000',
      title: [
        { text: 'A battle', revealedIn: [{ book: WOK, chapter: '1' }] },
        { text: 'The named battle', revealedIn: [{ book: WOK, chapter: '3' }] },
      ],
      summary: [
        { text: 'First line.', revealedIn: [{ book: WOK, chapter: '1' }] },
        { text: 'Twist.', revealedIn: [{ book: WOK, chapter: '3' }] },
      ],
      inBook: { book: WOK, chapter: '50' },
      tier: 'headline',
      kind: 'war',
      revealedIn: [{ book: WOK, chapter: '1' }],
      sources: [],
    },
  ]

  it('shows events in order, as far as the reader has got', () => {
    const at = (chapter: string) =>
      revealChronology(fixture, canSeeAt([], { [WOK]: chapter }))
    expect(at('prologue')).toEqual([])
    const early = at('1')
    expect(early.map((e) => [e.title, e.summary, e.world.name])).toEqual([
      ['A battle', ['First line.'], 'The Cosmere'],
    ])
    expect(early[0].inBook).toBeUndefined()
    expect(at('3')[0]).toMatchObject({
      title: 'The named battle',
      summary: ['First line.', 'Twist.'],
    })
    // Roshar is named in chapter 46; this event is placed there only at 50.
    expect(at('46')[0].world.name).toBe('The Cosmere')
    expect(at('50')[0].world.name).toBe('Roshar')
    expect(at('50')[0].inBook).toMatch(/^The Way of Kings,/)
    expect(revealChronology(fixture, canSeeAt([WOK])).map((e) => e.id)).toEqual(
      ['roshar-event', 'roshar-later'],
    )
  })

  it('counts years from the Shattering only once the reader knows of it', () => {
    const [e] = revealChronology(fixture, canSeeAt([WOK]))
    expect(e.year).toBeUndefined()
    expect(e.local).toBe('c. 1000')
    const [known] = revealChronology(fixture, canSeeAt([WOK, 'secret-history']))
    expect(known.year).toBe(10)
  })
})

// The cross-world placement the three chronology validators agreed on
// (files/chronology-validation in the session), over the emitted data.
// Tolerances are the sources' own looseness, not the current values.
describe('the researched chronology, in order', () => {
  const sorted = [...events].sort(
    (a, b) => a.year - b.year || (a.order ?? 0) - (b.order ?? 0),
  )
  const pos = (id: string) => {
    const i = sorted.findIndex((e) => e.id === id)
    expect(i, id).toBeGreaterThanOrEqual(0)
    return i
  }
  const year = (id: string) => sorted[pos(id)].year
  const inOrder = (...ids: string[]) => {
    for (let i = 1; i < ids.length; i++)
      expect(pos(ids[i - 1]), `${ids[i - 1]} before ${ids[i]}`).toBeLessThan(
        pos(ids[i]),
      )
  }
  /** `to` comes `min` to `max` years after `from` (Rosharan years: scale 1.1). */
  const gap = (
    from: string,
    to: string,
    min: number,
    max: number,
    scale = 1,
  ) => {
    const years = (year(to) - year(from)) / scale
    expect(years, `${from} to ${to}`).toBeGreaterThanOrEqual(min)
    expect(years, `${from} to ${to}`).toBeLessThanOrEqual(max)
  }
  const stormlight = sorted
    .filter(
      (e) =>
        /^roshar-(wok|wor|edgedancer|ob|dawnshard|row|wat)-/.test(e.id) ||
        e.id === 'roshar-odium-honor-become-retribution',
    )
    .map((e) => e.id)
  const SL5_END = stormlight.at(-1)!
  const ERA_2 = [
    'scadrial-lessie-dies',
    'scadrial-wax-returns-elendel',
    'scadrial-vanishers-dismantled',
    'scadrial-bleeders-revolt-ended',
    'scadrial-aradel-elected-governor',
    'scadrial-first-contact-southern-scadrians',
    'scadrial-supremacy-bill-passed',
    'scadrial-elendel-attack-stopped',
    'scadrial-basin-national-assembly',
  ]

  it('keeps the worlds in their sourced order', () => {
    // Coppermind's chronological order; WoB 3842 and 1355 (the Heralds'
    // era first), 10502 and 14454 (White Sand earliest), 10273, 13784 and
    // 7462 (Elantris before Era 1, Warbreaker after it and before Alloy),
    // 14998 (The Lost Metal after Stormlight 4), 15579 (Sunlit Man after
    // Era 3).
    inOrder(
      'roshar-oathpact-founded',
      'taldain-diem-ambush',
      'taldain-diem-conspiracy-exposed',
      'sel-raoden-taken-by-shaod',
      'sel-elantris-restored',
      'scadrial-e1-kelsier-rebellion',
      'scadrial-e1-battle-of-hathsin',
      'nalthis-siri-sent-to-hallandren',
      'nalthis-pahn-kahl-rebellion-stopped',
      'roshar-war-of-reckoning-begins',
      stormlight[0],
      'roshar-row-taravangian-takes-up-odium',
      SL5_END,
      ERA_2[0],
      'scadrial-elendel-attack-stopped',
      'scadrial-basin-national-assembly',
      'canticle-nomad-arrives',
    )
  })

  it('puts Warbreaker about 300 years after the Manywar and a few generations before Stormlight', () => {
    // Warbreaker 1 and 57 ("about three hundred years", hatred "well over
    // three centuries"); WoB 14099 (2020), 5956 and 5657 ("a few
    // generations" before The Way of Kings, in flux); Vasher reaches Roshar
    // before Gavilar's death (WoB 5657, 6267).
    gap(
      'nalthis-manywar-begins',
      'nalthis-pahn-kahl-rebellion-stopped',
      280,
      360,
    )
    gap('nalthis-manywar-ends', 'nalthis-pahn-kahl-rebellion-stopped', 250, 330)
    inOrder('scadrial-e1-scadrial-restored', 'nalthis-siri-sent-to-hallandren')
    gap(
      'nalthis-pahn-kahl-rebellion-stopped',
      'roshar-wok-dalinar-trades-oathbringer',
      40,
      175,
    )
    gap(
      'nalthis-pahn-kahl-rebellion-stopped',
      'roshar-war-of-reckoning-begins',
      30,
      168,
    )
  })

  it('puts Stormlight 1–5 about 300 years after Era 1 and just before Era 2', () => {
    // WoB 4267 (Stormlight some 300 years after Era 1); WoB 4144 and 4208
    // (The Way of Kings a little before Alloy); Arcanum 15278, WoB 549,
    // 14998, 15877 and 14582 (Era 2 after Stormlight 5, inside the decade
    // or so before Stormlight 6).
    gap(
      'scadrial-e1-scadrial-restored',
      'roshar-wok-dalinar-trades-oathbringer',
      280,
      350,
    )
    gap(
      'roshar-wok-dalinar-trades-oathbringer',
      'scadrial-wax-returns-elendel',
      1.5,
      8,
    )
    const lastStormlight = Math.max(...stormlight.map(pos))
    for (const id of ERA_2) {
      expect(pos(id), id).toBeGreaterThan(lastStormlight)
      gap(SL5_END, id, 0, 16)
    }
    gap(SL5_END, ERA_2[0], 0, 6)
  })

  it('puts The Fires of December between Stormlight 5 and 6', () => {
    // WoB 17183 (after Stormlight 5, before 6); State of the Sanderson 2025
    // (WoB 17015: before Tress and Yumi; told after both).
    const fires = [
      'cosmere-fires-december-sets-out',
      'cosmere-fires-december-threat-uncovered',
      'cosmere-fires-december-palace-crisis',
      'cosmere-fires-december-crisis-resolved',
    ]
    inOrder(SL5_END, ...fires, 'lumar-tress-sets-out')
    for (const id of fires) gap(SL5_END, id, 0, 12)
    inOrder(fires[3], 'komashi-yumi-and-painter-connect')
    inOrder(
      'komashi-yumi-and-painter-part',
      'cosmere-fires-december-hoid-tells-the-story',
    )
    inOrder(
      'lumar-tress-reunites-with-charlie',
      'cosmere-fires-december-hoid-tells-the-story',
    )
  })

  it('puts Rhythm of War before Wind and Truth, which ends on 1175.5.2.5', () => {
    // 17th Shard's Stormlight timeline (Jofwu): Rhythm of War's climax is
    // 1175.4.10.x, Wind and Truth runs ten days to 1175.5.2.5, on a
    // 500-day year. The chronology and the book view share the anchor.
    const row = stormlight.filter((id) => id.startsWith('roshar-row-'))
    const wat = stormlight.filter(
      (id) => !/^roshar-(wok|wor|edgedancer|ob|dawnshard|row)-/.test(id),
    )
    expect(wat).toHaveLength(7)
    expect(Math.max(...row.map(pos))).toBeLessThan(Math.min(...wat.map(pos)))
    expect(year(SL5_END)).toBeCloseTo(sharedYear('rosharan', 1175.418), 1)
    expect(year('roshar-wok-dalinar-trades-oathbringer')).toBeCloseTo(
      sharedYear('rosharan', 1173.856),
      1,
    )
  })

  it('puts the newer standalones about ten thousand years after the Shattering', () => {
    // The Sunlit Man 11 and Isles of the Emberdark 32 ("about" / "more than"
    // ten thousand years); WoB 15579, 14582 and 15877 (after Era 3, itself
    // 50-70 years after Era 2); WoB 16524 and 16420 (Yumi after The Sunlit
    // Man and before Sixth of the Dusk; Isles a little after The Sunlit
    // Man); WoB 3295 and 1502 (Sixth of the Dusk centuries after most
    // stories); Isles of the Emberdark itself (some five years after Sixth
    // of the Dusk, its prologue 57 years before).
    gap('cosmere-shattering', 'canticle-nomad-arrives', 10500, 12000)
    gap(
      'cosmere-shattering',
      'first-of-the-sun-isles-expedition-reaches-the-emberdark',
      10000,
      12500,
    )
    gap('scadrial-basin-national-assembly', 'canticle-nomad-arrives', 50, 1000)
    gap(SL5_END, 'first-of-the-sun-dusk-returns-to-patji', 200, 1000)
    inOrder('canticle-beaconites-leave', 'komashi-yumi-and-painter-connect')
    inOrder(
      'komashi-yumi-and-painter-part',
      'first-of-the-sun-dusk-returns-to-patji',
    )
    gap(
      'canticle-beaconites-leave',
      'first-of-the-sun-isles-expedition-reaches-the-emberdark',
      0,
      150,
    )
    gap(
      'first-of-the-sun-dusk-returns-to-patji',
      'first-of-the-sun-isles-expedition-reaches-the-emberdark',
      4,
      7,
    )
    gap(
      'yolen-isles-starling-transforms',
      'first-of-the-sun-isles-expedition-reaches-the-emberdark',
      55,
      59,
    )
  })

  it("keeps each world's events in date and chapter order", () => {
    // Stormlight: Jofwu's dated timeline and the books' chapter order;
    // nearly six Rosharan years from Gavilar's funeral (1167.10.8.5) to the
    // Tower (1173.9.6.4).
    inOrder(
      'roshar-wok-kaladin-recognizes-surgebinding',
      'roshar-wok-shallan-reveals-soulcaster-theft',
      'roshar-wok-kaladin-turns-back-at-the-tower',
      'roshar-wok-dalinar-trades-oathbringer',
      'roshar-wor-everstorm-summoned',
      'roshar-wor-kaladin-defeats-szeth',
      'roshar-wor-urithiru-rediscovered',
      'roshar-wor-adolin-kills-sadeas',
      'roshar-edgedancer-lift-protects-yeddaw-outcasts',
      'roshar-ob-last-desolation-revealed',
      'roshar-ob-kholinar-falls',
      'roshar-ob-dalinar-opens-perpendicularity',
      'roshar-ob-thaylen-field-battle-resolves',
      'roshar-dawnshard-nikli-sabotage-exposed',
      'roshar-dawnshard-rysn-guards-dawnshard',
      'roshar-row-urithiru-captured',
      'roshar-row-antivoidlight-discovered',
      'roshar-row-maya-testifies',
      'roshar-row-kaladin-swears-fourth-ideal',
      'roshar-row-navani-bonds-sibling',
      'roshar-row-contest-of-champions-set',
      'roshar-row-taravangian-takes-up-odium',
      'roshar-wat-recreance-vision',
      'roshar-wat-nale-confronted',
      'roshar-wat-azir-remains-independent',
      'roshar-wat-mishram-freed',
      'roshar-odium-honor-become-retribution',
      'roshar-wat-contest-changes-the-war',
      'roshar-wat-sigzil-receives-dawnshard',
    )
    gap(
      'roshar-war-of-reckoning-begins',
      'roshar-wok-kaladin-turns-back-at-the-tower',
      5.5,
      6.2,
      1.1,
    )
    // Mistborn: the books' chapter order.
    inOrder(
      'scadrial-e1-kelsier-trains-with-gemmel',
      'scadrial-e1-kelsier-rebellion',
      'scadrial-e1-pits-destroyed',
      'scadrial-e1-kelsier-killed',
      'scadrial-e1-collapse',
      'scadrial-e1-siege-of-luthadel',
      'scadrial-e1-battle-of-luthadel',
      'scadrial-e1-well-power-released',
      'scadrial-e1-elend-mistborn',
      'scadrial-e1-catastrophe-escalates',
      'scadrial-e1-battle-of-hathsin',
      'scadrial-e1-scadrial-restored',
      'scadrial-ice-death',
    )
    inOrder(...ERA_2)
    // Warbreaker, Elantris, White Sand and the newer standalones: chapter
    // order.
    inOrder(
      'nalthis-manywar-begins',
      'nalthis-nightblood-created',
      'nalthis-manywar-ends',
      'nalthis-siri-sent-to-hallandren',
      'nalthis-lightsong-sacrifices-himself',
      'nalthis-pahn-kahl-rebellion-stopped',
    )
    inOrder(
      'sel-reod',
      'sel-raoden-taken-by-shaod',
      'sel-sarene-arrives-in-arelon',
      'sel-hrathen-arrives-in-arelon',
      'sel-elantris-restored',
    )
    inOrder(
      'taldain-diem-ambush',
      'taldain-khriss-and-kenton-ally',
      'taldain-kenton-becomes-lord-mastrell',
      'taldain-diem-conspiracy-exposed',
    )
    inOrder(
      'lumar-tress-sets-out',
      'lumar-tress-faces-the-mutiny',
      'lumar-tress-crew-joins-her',
      'lumar-tress-reunites-with-charlie',
    )
    inOrder(
      'canticle-nomad-arrives',
      'canticle-beaconites-recaptured',
      'canticle-beaconites-escape',
      'canticle-beaconites-leave',
    )
    inOrder(
      'komashi-yumi-and-painter-connect',
      'komashi-yumi-investigates-the-connection',
      'komashi-yumi-frees-the-spirits',
      'komashi-yumi-and-painter-part',
    )
    inOrder(
      'first-of-the-sun-isles-expedition-reaches-the-emberdark',
      'first-of-the-sun-isles-leadership-crisis',
      'first-of-the-sun-isles-navigators-return',
    )
  })

  it('breaks every same-year tie with its own explicit order', () => {
    const byYear = new Map<number, ChronoEvent[]>()
    for (const e of events)
      byYear.set(e.year, [...(byYear.get(e.year) ?? []), e])
    const bad = [...byYear.values()]
      .filter((same) => same.length > 1)
      .filter(
        (same) =>
          same.some((e) => e.order === undefined) ||
          new Set(same.map((e) => e.order)).size < same.length,
      )
      .map((same) => same.map((e) => e.id).join(', '))
    expect(bad).toEqual([])
  })
})
