import { hasReached, type ReadingProgress } from './progress'
import { characterDetails } from './characterDetails'
import type {
  CharacterDetails,
  Fact,
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
  (progress: ReadingProgress): CanSee =>
  (reveal) =>
    reveal.some((point) => hasReached(progress, point))

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
  /** Whether unread books hide any part of this planet. */
  spoilers: boolean
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
  /** Whether unread books hide any part of this system or its planets. */
  spoilers: boolean
}

/**
 * Trims a system to what the reader may see. With `viewAnyway` everything is
 * shown, but `spoilers` still notes that something would have been hidden.
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
      spoilers: hidden.length > start,
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
    spoilers: hidden.length > 0,
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
  /** Whether unread books hide any part of this place. */
  spoilers: boolean
}

/**
 * Trims a place to what the reader may see, or undefined if the place itself
 * is hidden. With `viewAnyway` everything is shown, but `spoilers` still notes
 * that something would have been hidden.
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
    spoilers: hidden.length > 0,
  }
}

/** Every point where the reader could first meet a character. */
export const firstMet = (details: CharacterDetails): Reveal =>
  details.appearsIn.flatMap((s) => s.revealedIn)

/**
 * Whether the reader has met a character. Characters without details yet
 * can't be checked, so they count as met.
 */
export function hasMet(characterId: string, canSee: CanSee) {
  const details = characterDetails[characterId]
  return !details || canSee(firstMet(details))
}

/** A character's details trimmed to what the reader may see. */
export interface ShownCharacter {
  met: boolean
  appearsIn: string[]
  /** Planet id of their home world. */
  world?: string
  aliases: string[]
  species: string[]
  abilities: string[]
  /** Whether unread books hide anything about this character. */
  spoilers: boolean
}

/**
 * Trims a character's details to what the reader may see. Nothing is shown
 * for a character the reader hasn't met, unless `viewAnyway`.
 */
export function revealCharacter(
  characterId: string,
  canSee: CanSee,
  viewAnyway = false,
): ShownCharacter {
  const details = characterDetails[characterId]
  const empty = { appearsIn: [], aliases: [], species: [], abilities: [] }
  if (!details) return { met: true, ...empty, spoilers: false }
  const met = canSee(firstMet(details))
  if (!met && !viewAnyway) return { met, ...empty, spoilers: true }

  let spoilers = !met
  const show = (reveal: Reveal) => {
    if (canSee(reveal)) return true
    spoilers = true
    return viewAnyway
  }
  const names = (facts: Fact[]) =>
    facts.filter((f) => show(f.revealedIn)).map((f) => f.name)

  return {
    met,
    appearsIn: details.appearsIn
      .filter((s) => show(s.revealedIn))
      .map((s) => s.bookId),
    world:
      details.world && show(details.world.revealedIn)
        ? details.world.planetId
        : undefined,
    aliases: names(details.aliases),
    species: names(details.species),
    abilities: names(details.abilities),
    spoilers,
  }
}
