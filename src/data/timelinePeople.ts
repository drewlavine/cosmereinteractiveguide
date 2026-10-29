import { findCharacter } from './characters'
import type { MapPoint } from './journey'
import { revealCharacter, type CanSee } from './reveal'
import {
  COSMERE,
  type CalendarId,
  type ShownTimeline,
  type ShownTimelineEvent,
} from './timeline'
import type { Reveal } from './types'

/**
 * The notable people of the timeline's characters panel: Cosmere Maps'
 * lists (as on the chapter maps), plus anyone named on an event the reader
 * can see. `born` and `died` are timeline event ids, so they show only once
 * the reader has reached those events, or a `LifeDate` for a birth or death
 * with no event of its own. Hand-maintained.
 */
export interface TimelinePerson {
  id: string
  born?: string | LifeDate
  died?: string | LifeDate
}

/**
 * A birth or death off the timeline's events, known once `revealedIn` (or,
 * without it, as soon as the reader has met them: for bounds anyone could
 * tell, like a Rosharan not being born before the Catacendre).
 */
export interface LifeDate {
  /**
   * Years after the Shattering, as events' `year`. Not known exactly: for a
   * birth, the earliest it can be; for a death, the latest.
   */
  year: number
  /** The date itself, only if known, to count years in one calendar. */
  date?: { year: number; calendar: CalendarId; circa?: boolean }
  /**
   * Not told, but inferred from dates: a mortal last seen centuries before
   * is surely dead by now. Only for those no book shows alive later.
   */
  assumed?: boolean
  revealedIn?: Reveal
}

// Calendar years on the timeline's scale, as its events have them.
const rosharan = (year: number) => year + 9791
const fe = (year: number) => year + 9601
const pc = (year: number) => fe(1025) + year
// Bounds anyone could tell: mortals of the books' day, not born in the era
// before (Rosharans after 1050, Scadrians of Era 1 after 950 FE, Arelenes
// and Fjordens after the century before the Reod).
const ROSHARAN = { year: rosharan(1050) }
const ERA_1 = { year: fe(950) }
const SELISH = { year: 9000 }
const WOK = 'way-of-kings'
const HOA = 'hero-of-ages'
const WOR = 'words-of-radiance'
const r = (year: number, revealedIn: Reveal, circa?: boolean): LifeDate => ({
  year: rosharan(year),
  date: { year, calendar: 'rosharan', ...(circa && { circa }) },
  revealedIn,
})
const f = (year: number, revealedIn: Reveal, circa?: boolean): LifeDate => ({
  year: fe(year),
  date: { year, calendar: 'fe', ...(circa && { circa }) },
  revealedIn,
})

export const timelinePeople: TimelinePerson[] = [
  {
    id: 'vin',
    born: f(1005, [{ book: 'final-empire', chapter: '1' }]),
    died: f(1025, [{ book: 'hero-of-ages', chapter: '82' }]),
  },
  {
    // Dies in The Final Empire, but his whereabouts after it (a Cognitive
    // Shadow, from Secret History) outrank that.
    id: 'kelsier',
    born: f(984, [{ book: 'well-of-ascension', chapter: '5' }], true),
    died: f(1022, [{ book: 'final-empire', chapter: '35' }]),
  },
  {
    id: 'elend-venture',
    born: f(1000, [{ book: 'final-empire', chapter: '12' }]),
    died: f(1025, [{ book: 'hero-of-ages', chapter: '81' }]),
  },
  { id: 'sazed', born: ERA_1 },
  {
    // No book Drew-era readers have says when Spook dies (The Lost Metal has
    // him dead by 348 PC), but he's a mortal born in 1007 FE: two centuries
    // on, he's surely dead. Inferred, so marked as assumed.
    id: 'spook',
    born: f(1007, ['well-of-ascension']),
    died: { year: fe(1207), assumed: true, revealedIn: [HOA] },
  },
  {
    id: 'marsh',
    born: f(980, [{ book: 'well-of-ascension', chapter: '5' }], true),
  },
  // A Third Generation kandra: made after the Lord Ruler's Ascension.
  {
    id: 'tensoon',
    born: { year: fe(0), revealedIn: [{ book: 'hero-of-ages', chapter: '7' }] },
  },
  { id: 'kaladin', born: 'kaladin-born' },
  { id: 'shallan-davar', born: r(1156, [{ book: WOK, chapter: '3' }]) },
  { id: 'szeth', born: r(1138, [{ book: WOK, chapter: 'i-3' }]) },
  { id: 'dalinar-kholin', born: 'dalinar-born' },
  { id: 'jasnah-kholin', born: r(1139, [{ book: WOK, chapter: '36' }]) },
  { id: 'adolin-kholin', born: r(1150, [{ book: WOK, chapter: '12' }]) },
  { id: 'moash', born: ROSHARAN },
  { id: 'taravangian', born: ROSHARAN },
  // About 1120; 1115 is safely before it.
  {
    id: 'navani-kholin',
    born: { year: rosharan(1115), revealedIn: [{ book: WOK, chapter: '22' }] },
  },
  { id: 'lopen', born: ROSHARAN },
  { id: 'rysn-ftori', born: ROSHARAN },
  { id: 'eshonai', born: ROSHARAN },
  { id: 'venli', born: ROSHARAN },
  { id: 'lift', born: r(1160, [{ book: WOR, chapter: 'i-9' }]) },
  { id: 'sigzil', born: ROSHARAN },
  { id: 'renarin-kholin', born: r(1154, [{ book: WOK, chapter: '12' }]) },
  { id: 'gavilar-kholin', born: ROSHARAN, died: 'gavilar-assassinated' },
  { id: 'elhokar-kholin', born: r(1147, [{ book: WOK, chapter: '22' }]) },
  { id: 'hesina', born: r(1133, [{ book: 'oathbringer', chapter: '7' }]) },
  { id: 'lirin', born: ROSHARAN },
  { id: 'teft', born: ROSHARAN },
  { id: 'lunamor', born: ROSHARAN },
  { id: 'rlain', born: ROSHARAN },
  { id: 'torol-sadeas', born: r(1123, [{ book: WOR, chapter: '5' }]) },
  { id: 'ialai-sadeas', born: ROSHARAN },
  { id: 'meridas-amaram', born: ROSHARAN },
  { id: 'turinad-sebarial', born: ROSHARAN },
  { id: 'yanagawn', born: r(1160, [{ book: 'oathbringer', chapter: '12' }]) },
  { id: 'felt', born: ERA_1 },
  {
    id: 'waxillium-ladrian',
    born: {
      year: pc(299),
      revealedIn: [{ book: 'alloy-of-law', chapter: '1' }],
    },
  },
  {
    id: 'wayne',
    born: { year: pc(308), revealedIn: [{ book: 'lost-metal', chapter: '1' }] },
  },
  {
    id: 'steris-harms',
    born: {
      year: pc(313),
      revealedIn: [{ book: 'bands-of-mourning', chapter: '5' }],
    },
  },
  { id: 'raoden', born: SELISH },
  { id: 'karata', born: SELISH },
  { id: 'galladon', born: SELISH },
  // Fifty at Warbreaker, some three hundred years after the Manywar.
  {
    id: 'susebron',
    born: { year: 10775, revealedIn: [{ book: 'warbreaker', chapter: '15' }] },
  },
]

/** Years from one date to a later one (`circa` when estimated). */
export interface YearsApart {
  /** The event's index on the shown timeline, to jump to. */
  event: number
  years?: number
  circa?: boolean
  /** Inferred from dates, not told (presumed dead). */
  assumed?: boolean
}

/** A person as of a point on the timeline, trimmed to what the reader knows. */
export interface PersonAt {
  id: string
  name: string
  aliases: string[]
  /** Other names the reader knows they go by (Zahel for Vasher). */
  personas: string[]
  unborn?: YearsApart
  died?: YearsApart
  /** Where they are (alive): their world, and their pin if its map has one. */
  where?: {
    world: string
    worldName: string
    /** Their pin, on their world's map or a city's in it. */
    /** `place`: the name of where it is, if the reader knows it. */
    map?: { mapId: string; at: MapPoint; place?: string; placeId?: string }
    /** What they're doing there, from the event's whereabouts. */
    note?: string
    assumed?: boolean
    wob?: boolean
    /** The event that puts them there. */
    event: ShownTimelineEvent
  }
}

type Dated = { year: number; calendar: CalendarId; circa?: boolean }
type Point = { year: number; date?: Dated }

/**
 * Years from one dated point to a later one: exact in a shared calendar,
 * otherwise an estimate on the timeline's own scale.
 */
const apart = (from: Point, to: Point): Omit<YearsApart, 'event'> =>
  !from.date || !to.date
    ? {}
    : from.date.calendar === to.date.calendar
      ? {
          years: Math.abs(to.date.year - from.date.year),
          circa: !!(from.date.circa || to.date.circa),
        }
      : { years: Math.round(Math.abs(to.year - from.year)), circa: true }

/**
 * The notable people the reader has met, as of the timeline's `current`
 * event: not yet born, dead, or where they were last seen. Births and deaths
 * the reader hasn't reached are left out, so they read as unknown.
 */
export function peopleAt(
  timeline: ShownTimeline,
  canSee: CanSee,
  current: number,
): PersonAt[] {
  const { events } = timeline
  const now = events[current]
  // A birth or death the reader knows of: its event (`to`, to jump to), or
  // for a LifeDate, the first event at or after it.
  const life = (d?: string | LifeDate) => {
    if (typeof d === 'string') {
      const i = events.findIndex((e) => e.id === d)
      const e = events[i]
      return (
        e && { event: i, to: i, year: e.year, date: e.date, assumed: false }
      )
    }
    if (!d || (d.revealedIn && !canSee(d.revealedIn))) return undefined
    const i = events.findIndex((e) => e.year >= d.year)
    return {
      event: undefined,
      to: i < 0 ? events.length - 1 : i,
      year: d.year,
      date: d.date,
      assumed: !!d.assumed,
    }
  }
  const ids = new Set([
    ...timelinePeople.map((p) => p.id),
    ...events.flatMap((e) => [
      ...e.characters.map((c) => c.id),
      ...e.whereabouts.map((w) => w.id),
    ]),
  ])
  return [...ids]
    .flatMap((id): PersonAt[] => {
      const c = findCharacter(id)
      const shown = revealCharacter(id, canSee)
      if (!c || !now || !shown.met) return []
      const person = timelinePeople.find((p) => p.id === id)
      const born = life(person?.born)
      const died = life(person?.died)
      const base = {
        id,
        name: c.name,
        aliases: shown.aliases,
        personas: shown.personas.map((p) => p.name),
      }
      const before = events.slice(0, current + 1)
      const named = (e: ShownTimelineEvent) =>
        e.characters.some((p) => p.id === id) ||
        // A momentary whereabout puts them there only at its own event.
        e.whereabouts.some((w) => w.id === id && (!w.momentary || e === now))
      if (
        born &&
        (born.event !== undefined ? born.event > current : born.year > now.year)
      )
        return [
          {
            ...base,
            unborn: { event: born.to, ...apart(now, born) },
          },
        ]
      // Seen after their death (as a Cognitive Shadow, say): not dead to us.
      const back =
        died &&
        before.some(
          (e) => e.year > died.year && e.whereabouts.some((w) => w.id === id),
        )
      if (
        died &&
        !back &&
        (died.event !== undefined
          ? died.event <= current
          : died.year <= now.year)
      )
        return [
          {
            ...base,
            died: {
              event: died.to,
              ...apart(died, now),
              ...(died.assumed && { assumed: true }),
            },
          },
        ]
      // Their birth, too, is an event they're named on.
      const seen = before.filter(named).at(-1)
      const there = seen?.whereabouts.find((w) => w.id === id)
      const world = there?.world ?? seen?.world
      if (!seen || !world || world.id === COSMERE) return [base]
      const map = there ? there.map : seen.map
      return [
        {
          ...base,
          where: {
            world: world.id,
            worldName: world.name,
            ...(map?.at && {
              map: { ...map, at: map.at },
            }),
            ...(there && {
              note: there.note,
              ...(there.assumed && { assumed: true }),
              ...(there.wob && { wob: true }),
            }),
            event: seen,
          },
        },
      ]
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
