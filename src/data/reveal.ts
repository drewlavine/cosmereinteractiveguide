import { books } from './books'
import type {
  Location,
  Passage,
  Planet,
  Reveal,
  StarSystem,
  Story,
} from './types'

/** Whether the reader may see something with these tags. */
export type CanSee = (reveal: Reveal) => boolean

export const readerCanSee =
  (read: ReadonlySet<string>): CanSee =>
  (reveal) =>
    reveal.some((id) => read.has(id))

export interface ShownMoon {
  name?: string
  color: string
}

/** A planet trimmed to what the reader may see, with prose flattened. */
export type ShownPlanet = Omit<
  Planet,
  | 'revealedIn'
  | 'altName'
  | 'chartLabel'
  | 'summary'
  | 'settingOf'
  | 'mentionedIn'
  | 'shards'
  | 'magicSystems'
  | 'moons'
> & {
  altName?: string
  chartLabel?: string
  summary: string
  /** Ids of the books set here that the reader may see. */
  settingOf: string[]
  /** Ids of other books mentioning it that the reader may see. */
  mentionedIn: string[]
  shards: string[]
  magicSystems: string[]
  moons: ShownMoon[]
  /** Unread books hiding parts of this planet, in publication order. */
  spoilers: string[]
}

/** A system trimmed to what the reader may see. */
export type ShownSystem = Omit<
  StarSystem,
  'star' | 'companionStar' | 'summary' | 'planets'
> & {
  star: string
  companionStar?: string
  summary: string
  planets: ShownPlanet[]
  /** Planets the reader hasn't reached yet, kept out of `planets`. */
  hiddenPlanets: Planet[]
  /** Outermost orbit of the full system, so charts don't shift as books are read. */
  maxOrbit: number
  binary: boolean
  /** Unread books hiding parts of this system or its planets, in publication order. */
  spoilers: string[]
}

const bookOrder = new Map(books.map((b, i) => [b.id, b.year * 1000 + i]))

/** The first book of each hidden thing, deduplicated, oldest first. */
export const spoilerBooks = (hidden: Reveal[]) =>
  [...new Set(hidden.map((reveal) => reveal[0]))].sort(
    (a, b) => (bookOrder.get(a) ?? 0) - (bookOrder.get(b) ?? 0),
  )

/**
 * Trims a system to what the reader may see. With `viewAnyway` everything is
 * shown, but `spoilers` still lists what would have been hidden.
 */
export function revealSystem(
  system: StarSystem,
  canSee: CanSee,
  viewAnyway = false,
): ShownSystem {
  const hidden: Reveal[] = []
  const show = (reveal: Reveal) => {
    if (canSee(reveal)) return true
    hidden.push(reveal)
    return viewAnyway
  }
  const keep = <T extends { revealedIn: Reveal }>(item?: T) =>
    item && show(item.revealedIn) ? item : undefined
  const prose = (passages: Passage[]) =>
    passages
      .filter((p) => show(p.revealedIn))
      .map((p) => p.text)
      .join(' ')

  const stories = (list: Story[] = []) =>
    list.filter((s) => show(s.revealedIn)).map((s) => s.bookId)

  const planets: ShownPlanet[] = []
  const hiddenPlanets: Planet[] = []
  for (const planet of system.planets) {
    if (!show(planet.revealedIn)) {
      hiddenPlanets.push(planet)
      continue
    }
    const start = hidden.length
    planets.push({
      ...planet,
      altName: keep(planet.altName)?.text,
      chartLabel: keep(planet.chartLabel)?.text,
      summary: prose(planet.summary),
      settingOf: stories(planet.settingOf),
      mentionedIn: stories(planet.mentionedIn),
      shards: planet.shards
        .filter((f) => show(f.revealedIn))
        .map((f) => f.name),
      magicSystems: planet.magicSystems
        .filter((f) => show(f.revealedIn))
        .map((f) => f.name),
      moons: planet.moons
        .filter((m) => show(m.revealedIn))
        .map(({ name, color }) => ({ name, color })),
      spoilers: spoilerBooks(hidden.slice(start)),
    })
  }

  // System-wide prose only means something once one of its worlds is known.
  const known = planets.length > 0
  const ifKnown = (passages: Passage[]) => (known ? prose(passages) : '')

  return {
    ...system,
    star: ifKnown(system.star),
    companionStar: known ? keep(system.companionStar)?.text : undefined,
    summary: ifKnown(system.summary),
    planets,
    hiddenPlanets: viewAnyway ? [] : hiddenPlanets,
    asteroidBelt: known ? keep(system.asteroidBelt) : undefined,
    cometBelt: known ? keep(system.cometBelt) : undefined,
    markers: known ? system.markers?.filter((m) => show(m.revealedIn)) : [],
    orbitNotes: known
      ? system.orbitNotes?.filter((n) => show(n.revealedIn))
      : [],
    maxOrbit: Math.max(
      1,
      ...system.planets.map((p) => p.orbit),
      system.asteroidBelt?.orbit ?? 0,
      system.cometBelt?.orbit ?? 0,
    ),
    binary: Boolean(system.companionStar),
    spoilers: spoilerBooks(hidden),
  }
}

/** A place trimmed to what the reader may see, with prose flattened. */
export type ShownLocation = Omit<
  Location,
  'revealedIn' | 'summary' | 'settingOf' | 'mentionedIn'
> & {
  summary: string
  settingOf: string[]
  mentionedIn: string[]
  /** Unread books hiding parts of this place, in publication order. */
  spoilers: string[]
}

/**
 * Trims a place to what the reader may see, or undefined if the place itself
 * is hidden. With `viewAnyway` everything is shown, but `spoilers` still lists
 * what would have been hidden.
 */
export function revealLocation(
  location: Location,
  canSee: CanSee,
  viewAnyway = false,
): ShownLocation | undefined {
  if (!viewAnyway && !canSee(location.revealedIn)) return undefined
  const hidden: Reveal[] = []
  const show = (reveal: Reveal) => {
    if (canSee(reveal)) return true
    hidden.push(reveal)
    return viewAnyway
  }
  show(location.revealedIn)
  const stories = (list: Story[] = []) =>
    list.filter((s) => show(s.revealedIn)).map((s) => s.bookId)

  return {
    ...location,
    summary: location.summary
      .filter((p) => show(p.revealedIn))
      .map((p) => p.text)
      .join(' '),
    settingOf: stories(location.settingOf),
    mentionedIn: stories(location.mentionedIn),
    spoilers: spoilerBooks(hidden),
  }
}
