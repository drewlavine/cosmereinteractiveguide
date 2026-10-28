import { findCharacter } from './characters'
import type { MapPoint } from './journey'
import { revealCharacter, type CanSee } from './reveal'
import {
  COSMERE,
  type ShownDate,
  type ShownTimeline,
  type ShownTimelineEvent,
} from './timeline'

/**
 * The notable people of the timeline's characters panel: Cosmere Maps'
 * lists (as on the chapter maps), plus anyone named on an event the reader
 * can see. `born` and `died` are timeline event ids, so they show only once
 * the reader has reached those events. Hand-maintained.
 */
export interface TimelinePerson {
  id: string
  born?: string
  died?: string
}

export const timelinePeople: TimelinePerson[] = [
  { id: 'vin' },
  { id: 'kelsier' },
  { id: 'elend-venture' },
  { id: 'sazed' },
  { id: 'spook' },
  { id: 'marsh' },
  { id: 'tensoon' },
  { id: 'kaladin', born: 'kaladin-born' },
  { id: 'shallan-davar' },
  { id: 'szeth' },
  { id: 'dalinar-kholin', born: 'dalinar-born' },
  { id: 'jasnah-kholin' },
  { id: 'adolin-kholin' },
  { id: 'moash' },
  { id: 'taravangian' },
  { id: 'navani-kholin' },
  { id: 'lopen' },
  { id: 'rysn-ftori' },
  { id: 'eshonai' },
  { id: 'venli' },
  { id: 'lift' },
  { id: 'sigzil' },
  { id: 'renarin-kholin' },
  { id: 'gavilar-kholin', died: 'gavilar-assassinated' },
]

/** Years from one date to a later one, when both are in one calendar. */
export interface YearsApart {
  /** The event's index on the shown timeline, to jump to. */
  event: number
  years?: number
  circa?: boolean
}

/** A person as of a point on the timeline, trimmed to what the reader knows. */
export interface PersonAt {
  id: string
  name: string
  aliases: string[]
  unborn?: YearsApart
  died?: YearsApart
  /** Where they are (alive): their world, and their pin if its map has one. */
  where?: {
    world: string
    worldName: string
    at?: MapPoint
    /** The event that puts them there. */
    event: ShownTimelineEvent
  }
}

const apart = (
  from: ShownDate | undefined,
  to: ShownDate | undefined,
): Omit<YearsApart, 'event'> =>
  from && to && from.calendar === to.calendar
    ? { years: Math.abs(to.year - from.year), circa: from.circa || to.circa }
    : {}

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
  const indexOf = (id?: string) => events.findIndex((e) => e.id === id)
  const ids = new Set([
    ...timelinePeople.map((p) => p.id),
    ...events.flatMap((e) => e.characters.map((c) => c.id)),
  ])
  return [...ids]
    .flatMap((id): PersonAt[] => {
      const c = findCharacter(id)
      const shown = revealCharacter(id, canSee)
      if (!c || !now || !shown.met) return []
      const person = timelinePeople.find((p) => p.id === id)
      const born = indexOf(person?.born)
      const died = indexOf(person?.died)
      const base = { id, name: c.name, aliases: shown.aliases }
      if (born > current)
        return [
          {
            ...base,
            unborn: { event: born, ...apart(now.date, events[born].date) },
          },
        ]
      if (died >= 0 && died <= current)
        return [
          {
            ...base,
            died: { event: died, ...apart(events[died].date, now.date) },
          },
        ]
      // Their birth, too, is an event they're named on.
      const seen = events
        .slice(0, current + 1)
        .filter((e) => e.characters.some((p) => p.id === id))
        .at(-1)
      if (!seen || seen.world.id === COSMERE) return [base]
      const at =
        seen.map?.mapId === seen.world.mapId ? seen.map?.at : undefined
      return [
        {
          ...base,
          where: {
            world: seen.world.id,
            worldName: seen.world.name,
            ...(at && { at }),
            event: seen,
          },
        },
      ]
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
