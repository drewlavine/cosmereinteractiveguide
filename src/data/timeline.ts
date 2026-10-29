import { findCharacter } from './characters'
import type { MapPoint } from './journey'
import { COSMERE_MAP, journeyAtlas, journeyMapPlanet } from './journeyAtlas'
import { areaCentre } from './maps'
import { hasMet, type CanSee } from './reveal'
import { systems } from './systems'
import type { ChapterPoint, Planet, Reveal, RevealPoint } from './types'

/**
 * The Cosmere Timeline: events across every world in the order they
 * happened, each tagged like the rest of the guide's facts so the reader
 * only ever sees what their books have shown them. A proof of concept with
 * the first events of the Cosmere; see docs/cosmere-timeline.md.
 */

/** The world of an event the reader can't yet place on any one planet. */
export const COSMERE = 'cosmere'

/** A line that may change as the reader learns more; the last visible wins. */
export interface TimelineText {
  text: string
  revealedIn: Reveal
}

/**
 * A world's own count of years, from Drew's chronology sheet. Worlds with
 * no known calendar are counted from an event the sheet sets as year 0.
 */
export interface Calendar {
  /** A couple of words under the year, e.g. "Rosharan year". */
  label: string
  /** What the count runs from, for the tooltip. */
  note: string
  /** The label and note wait for this; until then the year shows bare. */
  revealedIn: Reveal
}

const ch = (book: string, chapter: string): ChapterPoint => ({ book, chapter })
const line = (text: string, ...revealedIn: RevealPoint[]): TimelineText => ({
  text,
  revealedIn,
})

const WOK = 'way-of-kings'
const WOR = 'words-of-radiance'
const OB = 'oathbringer'
const SH = 'secret-history'
const AU = 'arcanum-unbounded'
const WAT = 'wind-and-truth'
const WB = 'warbreaker'
const ELA = 'elantris'
const HOA = 'hero-of-ages'
/** Khriss's lecture on the Shards: the Shattering, and who took them up. */
const SHARDS = ch(SH, '3-2')
const KHOLINAR = {
  mapId: 'roshar',
  at: [1936, 796] as MapPoint,
  placeId: 'kholinar',
}
const HEARTHSTONE = {
  mapId: 'roshar',
  at: [1922, 631] as MapPoint,
  placeId: 'hearthstone',
}

export const calendars = {
  rosharan: {
    label: 'Rosharan year',
    note: "Roshar's own count of years. A Rosharan year is a little longer than an Earth year.",
    revealedIn: [ch(WOK, '46')],
  },
  fe: {
    label: 'FE',
    note: "Years of the Final Empire, counted from the Lord Ruler's Ascension.",
    revealedIn: [ch('final-empire', 'prologue')],
  },
  selish: {
    label: 'Selish year',
    note: 'Counted from the Reod, the night Elantris fell.',
    revealedIn: [ch(ELA, '4')],
  },
  nalthian: {
    label: 'Nalthian count',
    note: "No Nalthian calendar is known: years are counted from the Pahn Kahl rebellion in T'Telir.",
    revealedIn: [WB],
  },
  taldain: {
    label: 'Taldain count',
    note: 'No Taldain calendar is known: years are counted from the story of White Sand.',
    revealedIn: [AU, 'white-sand-omnibus'],
  },
  threnodite: {
    label: 'Threnodite count',
    note: "No Threnodite calendar is known: years are counted from Silence Montane's hunt for Chesterton Divide.",
    revealedIn: ['shadows-for-silence', AU],
  },
  shattering: {
    label: 'after the Shattering',
    note: 'Years since the Shattering of Adonalsium, the reckoning used to line up the worlds.',
    revealedIn: [SHARDS],
  },
} satisfies Record<string, Calendar>

export type CalendarId = keyof typeof calendars

/**
 * When an event happened, in its own world's calendar, shown the way the
 * 17th Shard's Roshar map shows dates: the bare year, with month and so on
 * after dots when known, and "ca." when it's an estimate.
 */
export interface TimelineDate {
  year: number
  /** Month, week, day, as far as known (17th Shard's `1173.1.2.3`). */
  parts?: number[]
  /** An estimate: the sheet marks it so, or it's converted from another world. */
  circa?: boolean
  calendar: CalendarId
  /** When the date itself is known; the event's own reveal if not set. */
  revealedIn?: Reveal
}

export interface TimelineEvent {
  id: string
  /** Planet id, or COSMERE. */
  world: string
  /**
   * Until then the event sits in the open Cosmere rather than on its world,
   * for a place a later book reveals (the Shattering, on Yolen).
   */
  worldRevealedIn?: Reveal
  /**
   * Years since the Shattering (the sheet's Cosmere column): orders and
   * spaces events across worlds, and is the date shown once the reader
   * knows of the Shattering.
   */
  year: number
  date: TimelineDate
  /**
   * Where it happened: a journey map, and a point on it once known.
   * `revealedIn` gates the point and place when the book names them later
   * than the event itself.
   */
  map?: { mapId: string; at?: MapPoint; placeId?: string; revealedIn?: Reveal }
  /** Its name, as the reader knows it then. The last visible one wins. */
  title: TimelineText[]
  /** What happened: every visible passage, in order. */
  blurb: TimelineText[]
  /**
   * The card's one-liner, for a blurb too long for it; the last visible
   * wins. Without one, the card shows the first visible passage; `[]`
   * shows none (a birth: the title says it all).
   */
  summary?: TimelineText[]
  /** Character ids, each shown once the reader has met them. */
  characters: string[]
  /**
   * Where notable people are at this moment, anywhere in the Cosmere: a
   * snapshot for the characters panel and the map.
   */
  whereabouts?: Whereabout[]
  revealedIn: Reveal
  /** Known only from Brandon's answers, not the books: badged as such. */
  wob?: TimelineText
  /** Its timing is a guess: said on the card. */
  approximate?: TimelineText
  /** A run of events shown together on the bar, e.g. the Shards settling. */
  group?: { id: string; label: string }
  /**
   * A special effect on the map while it's the current event, like the
   * 17th Shard map's `specialEffect`. It shows with the event, at the
   * event's world only once that's revealed.
   */
  effect?: TimelineEffect
  /** Its page in the guide, once the reader may open it. */
  more?: { href: string; revealedIn: Reveal }
  /** Where the facts and dates come from (for maintainers; not shown). */
  sources: string[]
}

/**
 * A person's place at an event's moment, on a journey map (its world's, or
 * a city's in it). Shown once the reader has met them and `revealedIn`.
 */
export interface Whereabout {
  id: string
  map: { mapId: string; at?: MapPoint; placeId?: string }
  /** One line for the reader, e.g. "Training with Bridge Four." */
  note: string
  /**
   * Not seen there then: where their book left them, and functionally
   * immortal, so presumably still there.
   */
  assumed?: boolean
  /** Who they are there is known only from Brandon's answers. */
  wob?: boolean
  /**
   * Seen there only at this moment: a mortal whose later fate the reader
   * can't know yet, so later events don't carry them forward as alive.
   */
  momentary?: boolean
  revealedIn: Reveal
}

/** The burst of light and streaking Shards at the Shattering. */
export type TimelineEffect = 'shattering'

const SETTLE = { id: 'shards-settle', label: 'The Shards settle' }
const settling = line(
  "The order and timing of the Shards' settling are approximate.",
  SHARDS,
)
const SHEET = "Drew's Cosmere timeline sheet"

/**
 * The events, earliest first. Dating follows the guide's rules: every line
 * waits for the chapter that shows it, and an earlier hint never names
 * what a later chapter reveals. Years come from Drew's sheet (see the doc).
 */
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'roshar-created',
    world: 'roshar',
    year: -1050,
    date: { year: -9742, circa: true, calendar: 'rosharan' },
    title: [
      line('Adonalsium creates Roshar', { all: [ch(WOR, '66'), SHARDS] }),
    ],
    blurb: [
      line(
        'Adonalsium makes the world of Roshar, long before it is Shattered.',
        { all: [ch(WOR, '66'), SHARDS] },
      ),
    ],
    characters: [],
    revealedIn: [{ all: [ch(WOR, '66'), SHARDS] }],
    wob: line(
      'Brandon has said this outside the books; no book shows it yet.',
      { all: [ch(WOR, '66'), SHARDS] },
    ),
    sources: [`${SHEET}, row 2 (note 24)`, 'Coppermind: Roshar'],
  },
  {
    id: 'shattering',
    world: 'yolen',
    worldRevealedIn: [WAT, 'isles-of-the-emberdark'],
    year: 0,
    date: { year: 0, calendar: 'shattering' },
    title: [
      line('Adonalsium is killed', SHARDS),
      line('The Shattering of Adonalsium', SH),
    ],
    blurb: [
      line(
        'Sixteen people kill Adonalsium, and each takes up one of the sixteen Shards of its power.',
        SHARDS,
      ),
      line(
        'It happens on Yolen, the world where humans first appeared.',
        WAT,
        'isles-of-the-emberdark',
      ),
    ],
    characters: [],
    revealedIn: [SHARDS],
    effect: 'shattering',
    more: { href: '/events/shattering', revealedIn: [SH] },
    sources: [
      `${SHEET}, row 5`,
      'Mistborn: Secret History, part 3 chapter 2',
      "Yolen as the place: the guide's Yolish system summary (Wind and Truth, Isles of the Emberdark)",
    ],
  },
  {
    id: 'honor-cultivation-settle',
    world: 'roshar',
    year: 1,
    date: { year: -8788, circa: true, calendar: 'rosharan' },
    title: [line('Honor and Cultivation settle on Roshar', SHARDS)],
    blurb: [
      line(
        'Honor and Cultivation come to Roshar together, and both Invest the world equally.',
        SHARDS,
      ),
    ],
    characters: [],
    revealedIn: [SHARDS],
    approximate: settling,
    group: SETTLE,
    sources: [
      `${SHEET}, row 5 (note 25)`,
      "Secret History 3-2 (the guide's Tanavast story)",
    ],
  },
  {
    id: 'ruin-preservation-scadrial',
    world: 'scadrial',
    year: 2,
    date: { year: -9601, circa: true, calendar: 'fe' },
    title: [
      line('Ruin and Preservation make Scadrial', {
        all: ['hero-of-ages', SHARDS],
      }),
    ],
    blurb: [
      line(
        'Ruin and Preservation settle on Scadrial and, working together, make the world and its people.',
        { all: ['hero-of-ages', SHARDS] },
      ),
    ],
    characters: [],
    revealedIn: [{ all: ['hero-of-ages', SHARDS] }],
    approximate: settling,
    group: SETTLE,
    sources: [
      `${SHEET}, row 5 (the Scadrial column; placed just after the Shattering)`,
      'The Hero of Ages (the making of the world)',
      "Secret History 1-1 (the guide's Leras story)",
    ],
  },
  {
    id: 'devotion-dominion-settle',
    world: 'sel',
    year: 3,
    date: { year: -9101, circa: true, calendar: 'selish' },
    title: [line('Devotion and Dominion settle on Sel', { all: [AU, SHARDS] })],
    blurb: [
      line('Devotion and Dominion both make their home on Sel.', {
        all: [AU, SHARDS],
      }),
      line("It breaks the Shards' agreement not to settle together.", {
        all: [ch(WOK, '22'), ch(OB, '39')],
      }),
    ],
    characters: [],
    revealedIn: [{ all: [AU, SHARDS] }],
    approximate: settling,
    group: SETTLE,
    sources: [
      `${SHEET}, row 5 (the Sel column; placed just after the Shattering)`,
      'Arcanum Unbounded, The Selish System',
      "The Way of Kings 22 and Oathbringer 39 (the agreement; the guide's Aona story)",
    ],
  },
  {
    id: 'endowment-settles',
    world: 'nalthis',
    year: 4,
    date: { year: -10826, circa: true, calendar: 'nalthian' },
    title: [line('Endowment settles on Nalthis', { all: [WB, SHARDS] })],
    blurb: [
      line('The Shard Endowment makes its home on Nalthis.', {
        all: [WB, SHARDS],
      }),
    ],
    characters: [],
    revealedIn: [{ all: [WB, SHARDS] }],
    approximate: settling,
    group: SETTLE,
    sources: [
      `${SHEET}, row 5 (the Nalthis column; placed just after the Shattering)`,
      "Warbreaker (the guide's Nalthis Shards fact)",
    ],
  },
  {
    id: 'autonomy-settles',
    world: 'taldain',
    year: 5,
    date: { year: -8111, circa: true, calendar: 'taldain' },
    title: [
      line(
        'Autonomy settles on Taldain',
        { all: [AU, SHARDS] },
        { all: ['white-sand-omnibus', SHARDS] },
      ),
    ],
    blurb: [
      line(
        'The Shard Autonomy makes its home on Taldain.',
        { all: [AU, SHARDS] },
        { all: ['white-sand-omnibus', SHARDS] },
      ),
    ],
    characters: [],
    revealedIn: [
      { all: [AU, SHARDS] },
      { all: ['white-sand-omnibus', SHARDS] },
    ],
    approximate: settling,
    group: SETTLE,
    sources: [
      `${SHEET}, row 5 (the Taldain column; placed just after the Shattering)`,
      "Arcanum Unbounded, The Taldain System; White Sand (the guide's Taldain Shards fact)",
    ],
  },
  {
    id: 'spren-created',
    world: 'roshar',
    year: 96.3,
    date: { year: -8700, circa: true, calendar: 'rosharan' },
    map: { mapId: 'silver-kingdoms' },
    title: [line('The first thinking spren', { all: [WOK, SHARDS] })],
    blurb: [
      line(
        'Honor and Cultivation bring about the first spren that can think and speak.',
        { all: [WOK, SHARDS] },
      ),
    ],
    characters: [],
    revealedIn: [{ all: [WOK, SHARDS] }],
    wob: line(
      'Brandon has said this outside the books; no book dates it yet.',
      { all: [WOK, SHARDS] },
    ),
    sources: [`${SHEET}, row 6 (note 25)`, 'Coppermind: Spren'],
  },
  {
    id: 'devotion-dominion-splintered',
    world: 'sel',
    year: 1000,
    date: { year: -8101, circa: true, calendar: 'selish' },
    title: [line('Odium splinters Devotion and Dominion', AU)],
    blurb: [
      line(
        'Odium kills Devotion and Dominion on Sel and breaks their power into pieces.',
        AU,
      ),
    ],
    characters: [],
    revealedIn: [AU],
    sources: [
      `${SHEET}, row 7 (ESTIMATED)`,
      'Arcanum Unbounded, The Selish System',
    ],
  },
  {
    id: 'ambition-wounded',
    world: 'threnody',
    year: 2000,
    date: { year: -8850, circa: true, calendar: 'threnodite' },
    title: [line('Odium mortally wounds Ambition', AU)],
    blurb: [
      line(
        'Odium and Ambition fight near Threnody. Ambition escapes, mortally wounded.',
        AU,
      ),
    ],
    characters: [],
    revealedIn: [AU],
    sources: [
      `${SHEET}, row 8 (ESTIMATED; Books: Arcanum Unbounded)`,
      'Arcanum Unbounded, The Threnodite System',
    ],
  },
  {
    id: 'odium-ashyn',
    world: 'ashyn',
    year: 2158.8,
    date: { year: -6825, circa: true, calendar: 'rosharan' },
    title: [line('Odium comes to Ashyn', WAT)],
    blurb: [
      line(
        "Odium arrives on Ashyn, the innermost world of Roshar's system.",
        WAT,
      ),
    ],
    characters: [],
    revealedIn: [WAT],
    sources: [
      `${SHEET}, row 9 (Roshar note: "8000 years before Wind and Truth")`,
    ],
  },
  {
    id: 'humans-arrive',
    world: 'roshar',
    year: 2960.7,
    date: { year: -6096, circa: true, calendar: 'rosharan' },
    map: { mapId: 'silver-kingdoms' },
    title: [line('Humans arrive on Roshar', ch(OB, '111'), AU, 'sunlit-man')],
    blurb: [
      line(
        'Humans come to Roshar as refugees from another world, and its people take them in.',
        ch(OB, '111'),
      ),
      line(
        'Most of the humans of Ashyn flee a cataclysm there and come to Roshar.',
        AU,
        'sunlit-man',
      ),
    ],
    characters: [],
    revealedIn: [ch(OB, '111'), AU, 'sunlit-man'],
    sources: [
      `${SHEET}, row 10 (ESTIMATED; note 25)`,
      'Oathbringer 111 (the Eila Stele)',
      "Arcanum Unbounded, The Rosharan System; The Sunlit Man (the guide's Ashyn summary)",
    ],
  },
  {
    id: 'first-desolation',
    world: 'roshar',
    year: 2982.7,
    date: { year: -6076, circa: true, calendar: 'rosharan' },
    map: { mapId: 'silver-kingdoms' },
    title: [line('The First Desolation', WOK)],
    blurb: [
      line(
        'The first of the Desolations, the wars that again and again nearly end humankind on Roshar.',
        WOK,
      ),
    ],
    characters: [],
    revealedIn: [WOK],
    sources: [
      `${SHEET}, row 11 (ESTIMATED; note 25)`,
      'Coppermind: Desolation',
    ],
  },
  {
    id: 'oathpact-abandoned',
    world: 'roshar',
    year: 6000,
    date: {
      year: -3333,
      circa: true,
      calendar: 'rosharan',
      revealedIn: [ch(WOK, 'prologue')],
    },
    map: { mapId: 'silver-kingdoms' },
    title: [
      line('The Heralds abandon the Oathpact', ch(WOK, 'prelude')),
      line('Aharietiam: the Heralds abandon the Oathpact', ch(OB, '38')),
    ],
    blurb: [
      line(
        'After a great battle, Kalak and Jezrien meet the other Heralds. They leave their Honorblades thrust into the stone and agree to end the Oathpact, leaving behind the one Herald who did not come back.',
        ch(WOK, 'prelude'),
      ),
    ],
    summary: [
      line(
        'After a great battle, the Heralds leave their Honorblades in the stone and end the Oathpact.',
        ch(WOK, 'prelude'),
      ),
    ],
    characters: ['kalak', 'jezrien'],
    revealedIn: [ch(WOK, 'prelude')],
    more: {
      href: '/events/last-desolation',
      revealedIn: [{ all: [WOK, ch(OB, '38')] }],
    },
    sources: [
      `${SHEET}, row 15`,
      'The Way of Kings, Prelude; Prologue ("4500 years later", the date)',
      'Oathbringer, chapter 38 (linking the scene to Aharietiam)',
    ],
  },
  {
    id: 'reod',
    world: 'sel',
    year: 9101,
    date: {
      year: 0,
      calendar: 'selish',
      revealedIn: [ch(ELA, '4')],
    },
    map: { mapId: 'opelon', at: [318, 1412], placeId: 'elantris' },
    title: [
      line('Elantris falls', ch(ELA, 'prologue')),
      line('The Reod: Elantris falls', ch(ELA, '4')),
    ],
    blurb: [
      line(
        'Elantris, the shining city of the gods, falls from its glory.',
        ch(ELA, 'prologue'),
      ),
    ],
    characters: [],
    revealedIn: [ch(ELA, 'prologue')],
    sources: [
      `${SHEET}, row 32 (Sel year 0)`,
      'Elantris, Prologue; chapter 4 (the name "Reod")',
    ],
  },
  {
    id: 'manywar',
    world: 'nalthis',
    year: 10526,
    date: {
      year: -300,
      circa: true,
      calendar: 'nalthian',
      revealedIn: [ch(WB, '57')],
    },
    map: { mapId: 't-telir' },
    title: [line('The Manywar ends', ch(WB, '15'))],
    blurb: [
      line(
        "Peacegiver the Blessed ends the Manywar and passes his Breath to Hallandren's God Kings. The old royal line is driven into Idris.",
        ch(WB, '15'),
      ),
    ],
    characters: [],
    revealedIn: [ch(WB, '15')],
    more: { href: '/events/manywar', revealedIn: [WB] },
    sources: [
      `${SHEET}, row 44`,
      'Warbreaker, chapter 15; chapter 57 (about three hundred years)',
    ],
  },
  {
    id: 'catacendre',
    world: 'scadrial',
    year: 10626,
    date: { year: 1025, calendar: 'fe' },
    title: [line('Sazed becomes Harmony', ch(HOA, '82'))],
    blurb: [
      line(
        'Sazed takes up both Ruin and Preservation, becoming Harmony, and remakes the dying world.',
        ch(HOA, '82'),
      ),
    ],
    characters: ['sazed'],
    whereabouts: [
      {
        id: 'sazed',
        map: { mapId: 'final-empire' },
        note: 'As Harmony, watching over Scadrial from the Spiritual Realm.',
        revealedIn: [ch(HOA, '82')],
      },
      {
        id: 'marsh',
        map: {
          mapId: 'final-empire',
          at: [1140, 632],
          placeId: 'pits-of-hathsin',
        },
        note: "Ruin's Inquisitor at the Battle of Hathsin, where he kills Elend.",
        momentary: true,
        revealedIn: [ch(HOA, '81')],
      },
      {
        id: 'spook',
        map: { mapId: 'final-empire' },
        note: 'Lives through the end of the world, and wakes to the new one Sazed has made.',
        momentary: true,
        revealedIn: [ch(HOA, 'epilogue')],
      },
      {
        id: 'tensoon',
        map: {
          mapId: 'final-empire',
          at: [1140, 632],
          placeId: 'pits-of-hathsin',
        },
        note: 'In the Kandra Homeland by the Pits of Hathsin, after giving up his Blessings to save Sazed.',
        revealedIn: [ch(HOA, '79')],
      },
      {
        id: 'kelsier',
        map: { mapId: 'final-empire' },
        note: 'A Cognitive Shadow, who held Preservation until Vin could take it up, and saw her and Elend off to the Beyond.',
        revealedIn: [ch(SH, '6-8')],
      },
    ],
    revealedIn: [ch(HOA, '82')],
    sources: [
      `${SHEET}, row 63`,
      'The Hero of Ages, chapter 82',
      'https://coppermind.net/wiki/Catacendre',
    ],
  },
  {
    id: 'dalinar-born',
    world: 'roshar',
    // Rosharan years sit 9791 years after the Shattering here, as Gavilar's
    // assassination (1167) does.
    year: 10911,
    date: { year: 1120, circa: true, calendar: 'rosharan' },
    // Coppermind gives only "the Kholin princedom in Alethkar", no town.
    map: {
      mapId: 'roshar',
      placeId: 'alethkar',
      revealedIn: [ch(WOK, '12')],
    },
    title: [line('Dalinar Kholin is born', ch(WOK, 'prologue'))],
    summary: [],
    blurb: [
      line('Dalinar Kholin is born.', ch(WOK, 'prologue')),
      line('He is born into the Kholin family, in Alethkar.', ch(WOK, '12')),
      line(
        "He grows up to be the Blackthorn, the most feared warrior of his day, fighting at his brother Gavilar's side to unite Alethkar under one king.",
        WOK,
      ),
    ],
    characters: ['dalinar-kholin'],
    revealedIn: [ch(WOK, 'prologue')],
    wob: line(
      'The year comes from Brandon, not the books.',
      ch(WOK, 'prologue'),
    ),
    sources: [
      "The guide's born fact for Dalinar (Word of Brandon, wob.coppermind.net/events/116/#e5569)",
    ],
  },
  {
    id: 'kaladin-born',
    world: 'roshar',
    year: 10944.9,
    date: { year: 1153, calendar: 'rosharan' },
    map: {
      mapId: 'roshar',
      at: [1922, 631],
      placeId: 'hearthstone',
      revealedIn: [ch(WOK, '16')],
    },
    title: [line('Kaladin is born', ch(WOK, '1'))],
    summary: [],
    blurb: [
      line('Kaladin is born, late in the year.', ch(WOK, '1')),
      line('He is born in Hearthstone.', ch(WOK, '16')),
    ],
    characters: ['kaladin'],
    revealedIn: [ch(WOK, '1')],
    wob: line('The year comes from Brandon, not the books.', ch(WOK, '1')),
    sources: [
      "The guide's born fact for Kaladin (Word of Brandon, wob.coppermind.net/events/305/#e10572)",
    ],
  },
  {
    id: 'gavilar-assassinated',
    world: 'roshar',
    year: 10958,
    date: {
      year: 1167,
      parts: [10],
      calendar: 'rosharan',
      revealedIn: [WOK],
    },
    map: { mapId: 'roshar', at: [1936, 796], placeId: 'kholinar' },
    title: [line('Gavilar is assassinated', ch(WOK, 'prologue'))],
    blurb: [
      line(
        'On the night of a feast in Kholinar to celebrate a treaty with the Parshendi, Szeth, a Truthless assassin in white, kills King Gavilar of Alethkar.',
        ch(WOK, 'prologue'),
      ),
    ],
    summary: [
      line(
        'An assassin in white kills King Gavilar at a feast in Kholinar.',
        ch(WOK, 'prologue'),
      ),
    ],
    characters: ['gavilar-kholin', 'szeth'],
    whereabouts: [
      ...['dalinar-kholin', 'elhokar-kholin', 'torol-sadeas'].map((id) => ({
        id,
        map: KHOLINAR,
        note: 'At the feast.',
        revealedIn: [ch(WOK, 'prologue')],
      })),
      ...['jasnah-kholin', 'meridas-amaram'].map((id) => ({
        id,
        map: KHOLINAR,
        note: 'At the feast.',
        revealedIn: [ch(WOR, 'prologue')],
      })),
      {
        id: 'eshonai',
        map: KHOLINAR,
        note: 'Visiting Kholinar with the listeners for the treaty.',
        revealedIn: [ch(OB, 'prologue')],
      },
      ...['navani-kholin', 'adolin-kholin', 'renarin-kholin'].map((id) => ({
        id,
        map: KHOLINAR,
        note: 'At the feast.',
        revealedIn: [ch('rhythm-of-war', 'prologue')],
      })),
      {
        id: 'shallan-davar',
        map: { mapId: 'roshar', placeId: 'jah-keved' },
        note: "At her family's estate in Jah Keved.",
        revealedIn: [ch(WOR, '10')],
      },
      ...['kaladin', 'lirin', 'hesina'].map((id) => ({
        id,
        map: HEARTHSTONE,
        note: 'At home in Hearthstone.',
        revealedIn: [ch(WOK, '16')],
      })),
    ],
    revealedIn: [ch(WOK, 'prologue')],
    more: {
      href: '/events/assassination-of-gavilar',
      revealedIn: [WOK],
    },
    sources: [
      'The Way of Kings, Prologue',
      'Date and point: 17th Shard Roshar map events.json, gavilars-assassination (MIT)',
    ],
  },
  {
    // A snapshot of the Cosmere: who is where, on every world, at this moment.
    id: 'eshonai-takes-control',
    world: 'roshar',
    year: 10964.9,
    date: {
      year: 1173,
      parts: [10, 6],
      calendar: 'rosharan',
    },
    map: { mapId: 'roshar', at: [2045, 1110], placeId: 'shattered-plains' },
    title: [line('Eshonai takes control from the Five', ch(WOR, 'i-11'))],
    blurb: [
      line(
        'At Narak, Eshonai seizes control of the listeners from the Five, their ruling council.',
        ch(WOR, 'i-11'),
      ),
    ],
    characters: ['eshonai', 'venli'],
    whereabouts: [
      {
        id: 'kaladin',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "Locked in the Kholin warcamp prison after interfering in Adolin's duel.",
        revealedIn: [ch('words-of-radiance', '62')],
      },
      {
        id: 'sylphrena',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: 'With Kaladin in his cell in the Kholin warcamp prison.',
        revealedIn: [ch('words-of-radiance', '62')],
      },
      {
        id: 'adolin-kholin',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "Has locked himself in the cell beside Kaladin's in the Kholin warcamp prison.",
        revealedIn: [ch('words-of-radiance', '66')],
      },
      {
        id: 'dalinar-kholin',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: 'Highprince, in his warcamp.',
        revealedIn: [ch('words-of-radiance', '62')],
      },
      {
        id: 'navani-kholin',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "In Dalinar's warcamp.",
        revealedIn: [ch('words-of-radiance', '67')],
      },
      {
        id: 'renarin-kholin',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "Training with Bridge Four in Dalinar's warcamp.",
        revealedIn: [ch('words-of-radiance', '68')],
      },
      {
        id: 'teft',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "Running Bridge Four in Dalinar's warcamp while Kaladin is imprisoned.",
        revealedIn: [ch('words-of-radiance', '66')],
      },
      {
        id: 'lunamor',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "Cook for Bridge Four in Dalinar's warcamp.",
        revealedIn: [ch('words-of-radiance', '79')],
      },
      {
        id: 'sigzil',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "With Bridge Four in Dalinar's warcamp.",
        revealedIn: [ch('words-of-radiance', '71')],
      },
      {
        id: 'lopen',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "With Bridge Four in Dalinar's warcamp.",
        revealedIn: [ch('words-of-radiance', '76')],
      },
      {
        id: 'moash',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "A Bridge Four guard in Dalinar's warcamp.",
        revealedIn: [ch('words-of-radiance', '62')],
      },
      {
        id: 'vasher',
        map: { mapId: 'warcamps', at: [760, 340], placeId: 'alethkar' },
        note: "Zahel, a swordmaster among the ardents of Dalinar's warcamp, who trains Adolin.",
        revealedIn: [{ all: ['warbreaker', ch('words-of-radiance', '81')] }],
      },
      {
        id: 'talenel',
        map: { mapId: 'warcamps', at: [760, 340], placeId: 'alethkar' },
        note: "A madman kept in the ardents' monastery in Dalinar's warcamp, who calls himself Talenel'Elin.",
        revealedIn: [ch('words-of-radiance', '63')],
      },
      {
        id: 'felt',
        map: { mapId: 'warcamps', at: [745, 308], placeId: 'alethkar' },
        note: "A scout in Dalinar's service in the warcamps.",
        wob: true,
        revealedIn: [
          {
            all: [
              ch('words-of-radiance', '81'),
              ch('oathbringer', '114'),
              ch('final-empire', '31'),
            ],
          },
          {
            all: [
              ch('words-of-radiance', '81'),
              ch('oathbringer', '114'),
              ch('well-of-ascension', '42'),
            ],
          },
        ],
      },
      {
        id: 'elhokar-kholin',
        map: { mapId: 'warcamps', at: [930, 190], placeId: 'alethkar' },
        note: 'King, at his palace on the Pinnacle in the warcamps.',
        revealedIn: [ch('words-of-radiance', '66')],
      },
      {
        id: 'hoid',
        map: { mapId: 'warcamps', at: [935, 212], placeId: 'alethkar' },
        note: "The king's Wit, in the warcamps; he visits Kaladin in prison.",
        revealedIn: [ch('words-of-radiance', '59')],
      },
      {
        id: 'shallan-davar',
        map: { mapId: 'warcamps', at: [140, 200], placeId: 'alethkar' },
        note: "In Sebarial's warcamp, studying maps of the Shattered Plains.",
        revealedIn: [ch('words-of-radiance', '60')],
      },
      {
        id: 'pattern',
        map: { mapId: 'warcamps', at: [140, 200], placeId: 'alethkar' },
        note: "With Shallan in Sebarial's warcamp.",
        revealedIn: [ch('words-of-radiance', '60')],
      },
      {
        id: 'turinad-sebarial',
        map: { mapId: 'warcamps', at: [140, 200], placeId: 'alethkar' },
        note: 'Highprince, in his own warcamp.',
        revealedIn: [ch('words-of-radiance', '76')],
      },
      {
        id: 'iyatil',
        map: { mapId: 'warcamps', at: [140, 200], placeId: 'alethkar' },
        note: "A masked Ghostblood, secretly watching Shallan in Sebarial's warcamp.",
        revealedIn: [ch('words-of-radiance', '63')],
      },
      {
        id: 'mraize',
        map: { mapId: 'warcamps', placeId: 'alethkar' },
        note: "Directing the Ghostbloods' work in the warcamps; Shallan reports to him.",
        revealedIn: [ch('words-of-radiance', '64')],
      },
      {
        id: 'torol-sadeas',
        map: { mapId: 'warcamps', at: [975, 468], placeId: 'alethkar' },
        note: 'Highprince, in his warcamp.',
        revealedIn: [ch('words-of-radiance', '58')],
      },
      {
        id: 'ialai-sadeas',
        map: { mapId: 'warcamps', at: [975, 468], placeId: 'alethkar' },
        note: "In her husband's warcamp.",
        revealedIn: [ch('words-of-radiance', '76')],
      },
      {
        id: 'meridas-amaram',
        map: { mapId: 'warcamps', at: [975, 468], placeId: 'alethkar' },
        note: "At his manor in Sadeas's warcamp.",
        revealedIn: [ch('words-of-radiance', '64')],
      },
      {
        id: 'eshonai',
        map: {
          mapId: 'shattered-plains',
          at: [700, 380],
          placeId: 'shattered-plains',
        },
        note: 'Shardbearer and general of the listeners, at Narak.',
        revealedIn: [ch('words-of-radiance', 'i-11')],
      },
      {
        id: 'venli',
        map: {
          mapId: 'shattered-plains',
          at: [700, 380],
          placeId: 'shattered-plains',
        },
        note: "A listener scholar, Eshonai's sister, at Narak.",
        revealedIn: [ch('words-of-radiance', 'i-11')],
      },
      {
        id: 'rlain',
        map: {
          mapId: 'shattered-plains',
          at: [700, 380],
          placeId: 'shattered-plains',
        },
        note: 'Has left the warcamps and is back among the listeners near Narak.',
        revealedIn: [ch('words-of-radiance', '79')],
      },
      {
        id: 'jasnah-kholin',
        map: { mapId: 'shadesmar' },
        note: 'In Shadesmar.',
        revealedIn: [ch('words-of-radiance', 'epilogue')],
      },
      {
        id: 'lift',
        map: { mapId: 'roshar', at: [937, 1042], placeId: 'azimir' },
        note: 'Living in the Bronze Palace in Azimir.',
        revealedIn: [ch('edgedancer', '1')],
      },
      {
        // Without Edgedancer: where Words of Radiance last shows her, before
        // Yanagawn (in Azimir here, from the same interlude) is made Prime.
        id: 'lift',
        map: { mapId: 'roshar', at: [937, 1042], placeId: 'azimir' },
        note: 'Last seen in Azimir, where she broke into the Bronze Palace.',
        revealedIn: [ch(WOR, 'i-9')],
      },
      {
        id: 'taravangian',
        map: { mapId: 'roshar' },
        note: 'King of Kharbranth.',
        revealedIn: [ch(WOK, '3')],
      },
      {
        id: 'szeth',
        map: { mapId: 'roshar' },
        note: "Truthless, killing on his master's orders.",
        revealedIn: [ch(WOK, 'prologue')],
      },
      {
        id: 'rysn-ftori',
        map: { mapId: 'roshar' },
        note: "A Thaylen merchant's apprentice, trading.",
        revealedIn: [ch(WOK, 'i-4')],
      },
      {
        id: 'marsh',
        map: { mapId: 'elendel-basin' },
        note: 'Ironeyes: lived through the Catacendre, and works for Harmony in the Basin, his spikes keeping him alive.',
        assumed: true,
        revealedIn: [ch('lost-metal', '27')],
      },
      {
        id: 'yanagawn',
        map: { mapId: 'roshar', at: [937, 1042], placeId: 'azimir' },
        note: 'The new Prime Aqasix, in Azimir.',
        revealedIn: [ch('words-of-radiance', 'i-9')],
      },
      {
        id: 'ishar',
        map: { mapId: 'roshar', placeId: 'tukar' },
        note: 'Tezim, the god-priest of Tukar, at war with Emul.',
        revealedIn: [ch('oathbringer', '64')],
      },
      {
        id: 'lirin',
        map: { mapId: 'roshar', at: [1922, 631], placeId: 'hearthstone' },
        note: 'Surgeon in his home town of Hearthstone.',
        revealedIn: [ch('oathbringer', '7')],
      },
      {
        id: 'hesina',
        map: { mapId: 'roshar', at: [1922, 631], placeId: 'hearthstone' },
        note: 'With Lirin in Hearthstone.',
        revealedIn: [ch('oathbringer', '7')],
      },
      {
        id: 'galladon',
        map: { mapId: 'roshar', placeId: 'purelake' },
        note: 'Last seen at the Purelake, searching for someone.',
        wob: true,
        revealedIn: [
          { all: [ch('way-of-kings', 'i-1'), ch('wind-and-truth', 'i-11')] },
        ],
      },
      {
        id: 'baon',
        map: { mapId: 'roshar', placeId: 'purelake' },
        note: 'Last seen at the Purelake, searching for someone.',
        wob: true,
        revealedIn: [
          { all: [ch('way-of-kings', 'i-1'), ch('wind-and-truth', 'i-11')] },
        ],
      },
      {
        id: 'demoux',
        map: { mapId: 'roshar', placeId: 'purelake' },
        note: 'Last seen at the Purelake, searching for someone.',
        wob: true,
        revealedIn: [
          { all: [ch('way-of-kings', 'i-1'), ch('wind-and-truth', 'i-11')] },
        ],
      },
      {
        id: 'waxillium-ladrian',
        map: { mapId: 'elendel-basin', at: [228, 233], placeId: 'weathering' },
        note: 'A lawman in the Roughs, based in Weathering.',
        revealedIn: [ch('alloy-of-law', '1')],
      },
      {
        id: 'wayne',
        map: { mapId: 'elendel-basin', at: [228, 233], placeId: 'weathering' },
        note: "Wax's partner as a lawman in the Roughs.",
        revealedIn: ['alloy-of-law'],
      },
      {
        id: 'paalm',
        map: { mapId: 'elendel-basin', at: [228, 233], placeId: 'weathering' },
        note: "Lessie, Wax's partner in the Roughs.",
        revealedIn: [ch('shadows-of-self', '26')],
      },
      {
        id: 'steris-harms',
        map: { mapId: 'elendel-basin', at: [276, 794], placeId: 'elendel' },
        note: 'Living in Elendel, daughter of Lord Harms.',
        revealedIn: ['alloy-of-law'],
      },
      {
        id: 'sazed',
        map: { mapId: 'elendel-basin', placeId: 'elendel-basin' },
        note: 'Sazed as Harmony, the god of Scadrial, watching over the Basin.',
        assumed: true,
        revealedIn: ['alloy-of-law'],
      },
      {
        // Before Era 2: the world he remade at the Catacendre, no Basin yet.
        id: 'sazed',
        map: { mapId: 'scadrial' },
        note: 'As Harmony, watching over Scadrial from the Spiritual Realm.',
        assumed: true,
        revealedIn: [HOA],
      },
      {
        id: 'raoden',
        map: { mapId: 'elantris-and-kae', at: [546, 662], placeId: 'elantris' },
        note: 'Last seen ruling Arelon from a restored Elantris at the end of Elantris; an Elantrian, so still living.',
        assumed: true,
        revealedIn: ['elantris'],
      },
      {
        id: 'karata',
        map: { mapId: 'elantris-and-kae', at: [600, 700], placeId: 'elantris' },
        note: 'Last seen in a restored Elantris at the end of Elantris; an Elantrian, so still living.',
        assumed: true,
        revealedIn: ['elantris'],
      },
      {
        id: 'ashe',
        map: { mapId: 'elantris-and-kae', at: [546, 662], placeId: 'elantris' },
        note: "Sarene's seon, last seen in Elantris at the end of Elantris; seons are long-lived.",
        assumed: true,
        revealedIn: ['elantris'],
      },
      {
        id: 'susebron',
        map: { mapId: 't-telir', at: [690, 358], placeId: 'court-of-gods' },
        note: 'Last seen as God King in his palace in the Court of Gods at the end of Warbreaker; a Returned fed Breath, so he does not age.',
        assumed: true,
        revealedIn: ['warbreaker'],
      },
    ],
    revealedIn: [ch(WOR, 'i-11')],
    sources: [
      'https://coppermind.net/wiki/Words_of_Radiance/Timeline',
      'https://coppermind.net/wiki/Summary:Words_of_Radiance#Interlude_I-11',
      'Whereabouts: Coppermind summaries of each book; immortals left where their book ends',
    ],
  },
]

/** A world as the timeline shows it. */
export interface ShownTimelineWorld {
  id: string
  /** Its name as the reader knows it: the planet's, else its map's title. */
  name: string
  color: string
  planet?: Planet
  /** The map the timeline shows it on (the first of its events'). */
  mapId?: string
}

/** A date ready to show: "ca. −8788", with its calendar if known. */
export interface ShownDate {
  /** The year as shown on the bar, e.g. "ca. −8788" or "1167.10". */
  text: string
  /** The year itself, to count years between dates in one calendar. */
  year: number
  calendar: CalendarId
  circa: boolean
  /** e.g. "Rosharan year"; none until the reader knows the calendar. */
  label?: string
  note?: string
}

export interface ShownTimelineEvent {
  id: string
  /** Index in the shown list. */
  index: number
  world: ShownTimelineWorld
  map?: { mapId: string; at?: MapPoint; place?: string; placeId?: string }
  title: string
  /** The card's short line. */
  summary: string
  /** Everything the reader may see of what happened, for the details. */
  blurb: string
  /** In its world's own calendar. */
  date?: ShownDate
  /**
   * The date the timeline goes by: one count for every world, years after
   * the Shattering, once the reader knows of it; the world's date before.
   */
  when?: ShownDate
  /** Badged notes for the card, e.g. "Word of Brandon". */
  notes: { label: string; text: string }[]
  group?: { id: string; label: string }
  effect?: TimelineEffect
  characters: { id: string; name: string }[]
  whereabouts: ShownWhereabout[]
  more?: string
  /** Where it sits along the timeline bar, in steps from the first event. */
  offset: number
  /** Years since the Shattering, for picking a world's era map. */
  year: number
}

export interface ShownWhereabout {
  id: string
  world: ShownTimelineWorld
  /** The most detailed map the reader has seen, and the pin if it's that. */
  /** `place`, `placeId`: where it is, if the reader knows it. */
  map?: { mapId: string; at?: MapPoint; place?: string; placeId?: string }
  note: string
  assumed?: boolean
  wob?: boolean
  momentary?: boolean
}

export interface ShownTimeline {
  events: ShownTimelineEvent[]
  worlds: ShownTimelineWorld[]
}

const GOLD = '#d4a540'

const planetOf = (id: string) =>
  systems.flatMap((s) => s.planets).find((p) => p.id === id)

/** A year as 17th Shard shows it: bare, true minus, parts after dots. */
export function formatYear(
  date: Pick<TimelineDate, 'year' | 'parts' | 'circa'>,
) {
  const year = Math.round(date.year)
  const text = [
    `${year < 0 ? '\u2212' : ''}${Math.abs(year)}`,
    ...(date.parts ?? []),
  ].join('.')
  return date.circa ? `ca. ${text}` : text
}

/**
 * How far apart two events sit on the bar: always room for a marker, and
 * a little more for longer gaps. Only shown events are spaced, so a gap
 * never hints at a hidden event inside it.
 */
export const barGap = (years: number) =>
  1 + Math.log10(1 + Math.max(0, years)) / 2

/**
 * The timeline as the reader may see it: hidden events, lines, dates and
 * worlds are dropped completely, never left as placeholders.
 */
export function revealTimeline(
  canSee: CanSee,
  events: readonly TimelineEvent[] = timelineEvents,
): ShownTimeline {
  const last = <T extends { revealedIn: Reveal }>(list: readonly T[]) =>
    list.filter((x) => canSee(x.revealedIn)).at(-1)
  const worlds = new Map<string, ShownTimelineWorld>()
  // A world's own map, not a city's inside it: the outermost the reader
  // can see.
  const worldMap = (id: string) => {
    let seen
    for (
      let map = journeyAtlas.map(id);
      map && map.id !== COSMERE_MAP;
      map = map.parent && journeyAtlas.map(map.parent.mapId)
    )
      if (canSee(map.revealedIn)) seen = map
    return seen
  }

  const worldOf = (
    e: Pick<TimelineEvent, 'world' | 'worldRevealedIn' | 'map'>,
  ): ShownTimelineWorld | undefined => {
    const id =
      e.worldRevealedIn && !canSee(e.worldRevealedIn) ? COSMERE : e.world
    const known = worlds.get(id)
    if (known) {
      // A world's map is its first shown event's that has one.
      const map = !known.mapId && e.map && worldMap(e.map.mapId)
      if (id === e.world && map && canSee(map.revealedIn)) known.mapId = map.id
      return known
    }
    let world: ShownTimelineWorld | undefined
    if (id === COSMERE) {
      world = { id: COSMERE, name: 'The Cosmere', color: GOLD }
    } else {
      const planet = planetOf(id)
      const map = e.map && worldMap(e.map.mapId)
      const mapShown = map && canSee(map.revealedIn)
      const name =
        planet && canSee(planet.revealedIn)
          ? planet.name
          : mapShown
            ? map.title
            : undefined
      if (!planet || !name) return undefined
      world = {
        id,
        name,
        color: planet.color,
        planet,
        ...(mapShown && { mapId: map.id }),
      }
    }
    worlds.set(id, world)
    return world
  }

  const dateOf = (d: TimelineDate, e: TimelineEvent): ShownDate | undefined => {
    if (!canSee(d.revealedIn ?? e.revealedIn)) return undefined
    const calendar: Calendar = calendars[d.calendar]
    // "1050 before the Shattering", not "−1050 after".
    const before = d.calendar === 'shattering' && d.year < 0
    return {
      text: formatYear(before ? { ...d, year: -d.year } : d),
      year: d.year,
      calendar: d.calendar,
      circa: !!d.circa,
      ...(canSee(calendar.revealedIn) && {
        label: before ? 'before the Shattering' : calendar.label,
        note: calendar.note,
      }),
    }
  }

  const shown: ShownTimelineEvent[] = []
  const sorted = [...events].sort((a, b) => a.year - b.year)
  let offset = 0
  let prevYear: number | undefined
  for (const e of sorted) {
    if (!canSee(e.revealedIn)) continue
    const title = last(e.title)
    const world = worldOf(e)
    if (!title || !world) continue
    const onWorld = world.id === e.world
    // A map the reader hasn't seen yet (an era's) falls back to the world's.
    const own = onWorld && e.map && journeyAtlas.map(e.map.mapId)
    const map = own && (canSee(own.revealedIn) ? own : worldMap(own.id))
    const place = e.map?.placeId && journeyAtlas.place(e.map.placeId)
    const date = dateOf(e.date, e)
    // Known once both the world's date and the Shattering are; converted
    // from the world's calendar, so an estimate unless it's the Shattering's.
    const when =
      date && date.calendar !== 'shattering'
        ? (dateOf(
            {
              year: e.year,
              circa: true,
              calendar: 'shattering',
              revealedIn: calendars.shattering.revealedIn,
            },
            e,
          ) ?? date)
        : date
    const blurb = e.blurb.filter((b) => canSee(b.revealedIn))
    const notes = [
      ...(e.wob && canSee(e.wob.revealedIn)
        ? [{ label: 'Word of Brandon', text: e.wob.text }]
        : []),
      ...(e.approximate && canSee(e.approximate.revealedIn)
        ? [{ label: 'Approximate', text: e.approximate.text }]
        : []),
    ]
    if (prevYear !== undefined) offset += barGap(e.year - prevYear)
    prevYear = e.year
    const placed = !e.map?.revealedIn || canSee(e.map.revealedIn)
    // Known only by its country: the middle of the country's outline.
    const at =
      e.map?.at ?? (e.map?.placeId && areaCentre(e.map.mapId, e.map.placeId))
    shown.push({
      id: e.id,
      index: shown.length,
      year: e.year,
      world,
      ...(e.map &&
        map &&
        canSee(map.revealedIn) && {
          map: {
            mapId: map.id,
            ...(placed && at && map === own && { at }),
            ...(place &&
              placed &&
              canSee(place.revealedIn) && {
                place: place.name,
                placeId: place.id,
              }),
          },
        }),
      title: title.text,
      summary: summaryOf(e.summary ? last(e.summary) : blurb[0], title.text),
      blurb: blurb.map((b) => b.text).join(' '),
      ...(date && { date }),
      ...(when && { when }),
      notes,
      ...(e.group && { group: e.group }),
      ...(e.effect && { effect: e.effect }),
      characters: e.characters
        .filter((id) => hasMet(id, canSee))
        .flatMap((id) => {
          const c = findCharacter(id)
          return c ? [{ id, name: c.name }] : []
        }),
      whereabouts: (e.whereabouts ?? []).flatMap((w): ShownWhereabout[] => {
        const planet = journeyMapPlanet(w.map.mapId)
        if (!planet || !canSee(w.revealedIn) || !hasMet(w.id, canSee)) return []
        const world = worldOf({ world: planet, map: w.map })
        if (!world) return []
        const own = journeyAtlas.map(w.map.mapId)
        const map = own && (canSee(own.revealedIn) ? own : worldMap(own.id))
        const place = w.map.placeId && journeyAtlas.place(w.map.placeId)
        // Known only by its country: the middle of it.
        const at =
          w.map.at ?? (w.map.placeId && areaCentre(w.map.mapId, w.map.placeId))
        return [
          {
            id: w.id,
            world,
            ...(map &&
              canSee(map.revealedIn) && {
                map: {
                  mapId: map.id,
                  ...(at && map === own && { at }),
                  ...(place &&
                    canSee(place.revealedIn) && {
                      place: place.name,
                      placeId: place.id,
                    }),
                },
              }),
            note: w.note,
            ...(w.assumed && { assumed: true }),
            ...(w.wob && { wob: true }),
            ...(w.momentary && { momentary: true }),
          },
        ]
      }),
      ...(e.more && canSee(e.more.revealedIn) && { more: e.more.href }),
      offset,
    })
  }
  return { events: shown, worlds: [...worlds.values()] }
}

const plain = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '')

/** The card's line, or none when it only repeats the title. */
const summaryOf = (line: { text: string } | undefined, title: string) =>
  line && plain(line.text) !== plain(title) ? line.text : ''
