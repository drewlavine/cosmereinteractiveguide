import { hasReached, type ReadingProgress } from './progress'
import { characterDetails } from './characterDetails'
import type { Portrait } from './characterPortraits'
import { characterTravels, type TravelStop } from './travels'
import type {
  Atlas,
  AtlasMap,
  JourneyArt,
  JourneyCredit,
  JourneyEvent,
  JourneyIndex,
  MapPoint,
} from './journey'
import type {
  CharacterDetails,
  EntryPerson,
  EntryStory,
  Fact,
  Location,
  LocationDetails,
  LocationPerson,
  LocationStory,
  Passage,
  Persona,
  Planet,
  Reveal,
  RevealPoint,
  BookSource,
  StarSystem,
  Story,
  CharacterStory,
  StoryItem,
  StorySection,
  FactSource,
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

/** A character's other name, listed alongside the characters. */
export interface PersonaEntry extends Persona {
  characterId: string
}

export const personas: PersonaEntry[] = Object.entries(
  characterDetails,
).flatMap(([characterId, details]) =>
  (details.personas ?? []).map((p) => ({ ...p, characterId })),
)
const personaById = new Map(personas.map((p) => [p.id, p]))

export const findPersona = (id?: string) =>
  id === undefined ? undefined : personaById.get(id)

/** The book (and chapter) of each point, without repeats. */
function pointSources(points: Reveal): BookSource[] {
  const flat = (p: RevealPoint): BookSource[] =>
    typeof p === 'string'
      ? [{ bookId: p }]
      : 'all' in p
        ? p.all.flatMap(flat)
        : [{ bookId: p.book, chapter: p.chapter }]
  const seen = new Set<string>()
  return points.flatMap(flat).filter((s) => {
    const key = `${s.bookId}/${s.chapter ?? ''}`
    return !seen.has(key) && !!seen.add(key)
  })
}

const pointBooks = (point: RevealPoint): string[] =>
  typeof point === 'string'
    ? [point]
    : 'all' in point
      ? point.all.flatMap(pointBooks)
      : [point.book]

/**
 * The details a page draws on, and which of their reveal points it may use.
 * A persona's page uses only the persona's books. A character's page leaves
 * those books out until the reader can tell who the persona is.
 */
function view(id: string, canSee: CanSee) {
  const persona = personaById.get(id)
  const details = characterDetails[persona?.characterId ?? id]
  if (!details) return undefined
  if (persona) {
    const books = new Set(persona.books)
    const trim = (reveal: Reveal) =>
      reveal.filter((p) => pointBooks(p).every((b) => books.has(b)))
    return { details, persona, trim }
  }
  const hidden = new Set(
    (details.personas ?? [])
      .filter((p) => !canSee(p.identityRevealedIn))
      .flatMap((p) => p.books),
  )
  const trim = (reveal: Reveal) =>
    reveal.filter((p) => !pointBooks(p).some((b) => hidden.has(b)))
  return { details, persona: undefined, trim }
}

/**
 * Where the reader first meets a character or persona, or undefined for a
 * character without details yet. A persona the reader has seen through is
 * never met: they meet the character instead.
 */
export function metIn(id: string, canSee: CanSee): Reveal | undefined {
  const v = view(id, canSee)
  if (!v) return undefined
  if (v.persona && canSee(v.persona.identityRevealedIn)) return []
  return v.trim(firstMet(v.details))
}

/** Whether the reader can tell who a persona really is. */
export const seenThrough = (persona: Persona, canSee: CanSee) =>
  canSee(persona.identityRevealedIn)

/**
 * Whether the reader has met a character. Characters without details yet
 * can't be checked, so they count as met.
 */
export function hasMet(characterId: string, canSee: CanSee) {
  const reveal = metIn(characterId, canSee)
  return !reveal || canSee(reveal)
}

/** A character's details trimmed to what the reader may see. */
export interface ShownCharacter {
  met: boolean
  /**
   * Books they appear in, with the chapter they first appear in when it's
   * known from the same book.
   */
  appearsIn: { bookId: string; chapter?: string }[]
  /** Planet id of their home world. */
  world?: string
  /**
   * Other names they go by in whole series (see Persona), once the reader
   * can tell it's the same person. Left out of `aliases`.
   */
  personas: { name: string; books: readonly string[] }[]
  aliases: string[]
  species: string[]
  abilities: string[]
  nationality: string[]
  profession: string[]
  groups: string[]
  bonds: string[]
  relatives: { name: string; relation: string; characterId?: string }[]
  /** The latest version the reader may see. */
  /**
   * `sources` back the date; `placeBooks` the place, the chapter of the
   * first version to give it.
   */
  born?: {
    name: string
    placeId?: string
    sources?: FactSource[]
    placeBooks?: BookSource[]
  }
  /** The latest the reader may see, and the book it's as of. */
  age?: { name: string; bookId: string; sources?: FactSource[] }
  /** Whether unread books hide anything about this character. */
  spoilers: boolean
}

/** The last of some story-ordered versions the reader may see. */
function latest<T extends { revealedIn: Reveal }>(
  versions: readonly T[] = [],
  show: (reveal: Reveal) => boolean,
) {
  return versions.filter((v) => show(v.revealedIn)).at(-1)
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
  const v = view(characterId, canSee)
  const empty = {
    appearsIn: [],
    personas: [],
    aliases: [],
    species: [],
    abilities: [],
    nationality: [],
    profession: [],
    groups: [],
    bonds: [],
    relatives: [],
  }
  if (!v) return { met: true, ...empty, spoilers: false }
  const { details, persona, trim } = v
  const met = hasMet(characterId, canSee)
  if (!met && !viewAnyway) return { met, ...empty, spoilers: true }

  let spoilers = !met
  const show = (all: Reveal) => {
    const reveal = trim(all)
    // A persona's page never shows what the character's other books reveal.
    if (persona && reveal.length === 0) return false
    if (canSee(reveal)) return true
    spoilers = true
    return viewAnyway
  }
  const names = (facts: Fact[] = []) =>
    facts.filter((f) => show(f.revealedIn)).map((f) => f.name)

  const appearsIn = details.appearsIn
    .filter((s) => show(s.revealedIn))
    .map(({ bookId, revealedIn }) => {
      // In an `all` point, the first chapter of this book is where they
      // appear; the other points say what else it takes to recognize them.
      const first = trim(revealedIn)
        .flatMap((p) => (typeof p !== 'string' && 'all' in p ? p.all : [p]))
        .find((p) => typeof p !== 'string' && p.book === bookId)
      return typeof first === 'object'
        ? { bookId, chapter: first.chapter }
        : { bookId }
    })
  // Only the persona's books the reader has met them in, so the header
  // doesn't hint at books they haven't reached.
  const shownPersonas = persona
    ? []
    : (details.personas ?? [])
        .filter((p) => show(p.identityRevealedIn))
        .map(({ name, books }) => ({
          name,
          books: books.filter((b) => appearsIn.some((s) => s.bookId === b)),
        }))
  return {
    met,
    appearsIn,
    world:
      details.world && show(details.world.revealedIn)
        ? details.world.planetId
        : undefined,
    personas: shownPersonas,
    // Shown personas get their own line; a persona's page is already titled
    // with its name. Otherwise the name is just another alias.
    aliases: names(details.aliases).filter(
      (name) =>
        name !== persona?.name && !shownPersonas.some((p) => p.name === name),
    ),
    species: names(details.species),
    abilities: names(details.abilities),
    nationality: names(details.nationality),
    profession: names(details.profession),
    groups: names(details.groups),
    bonds: names(details.bonds),
    relatives: (details.relatives ?? [])
      .filter((r) => show(r.revealedIn))
      .map(({ name, relation, characterId }) => ({
        name,
        relation,
        characterId,
      })),
    born: (() => {
      const born = latest(details.born, show)
      if (!born) return undefined
      const { name, placeId, sources } = born
      const first = details.born?.find((b) => b.placeId === placeId)
      return {
        name,
        ...(sources && { sources }),
        ...(placeId &&
          first && {
            placeId,
            placeBooks: pointSources(trim(first.revealedIn)),
          }),
      }
    })(),
    age: (() => {
      const age = latest(details.age, show)
      const points = age ? trim(age.revealedIn) : []
      const point = points.find((p) => canSee([p])) ?? points[0]
      const bookId =
        typeof point === 'string'
          ? point
          : point && 'book' in point
            ? point.book
            : undefined
      return age && bookId
        ? {
            name: age.name,
            bookId,
            ...(age.sources && { sources: age.sources }),
          }
        : undefined
    })(),
    spoilers,
  }
}

/** A section of a character's prose the reader may see. */
export interface ShownSection {
  /**
   * The section's first title, which stays put as later titles replace it;
   * only for finding its art (see characterFigures), never shown, as it may
   * name something the reader hasn't reached.
   */
  key: string
  title?: string
  items: { text: string; books: BookSource[] }[]
}

/** A character's prose trimmed to what the reader may see. */
export interface ShownStory {
  /** The latest "who they are" line the reader may see. */
  intro?: string
  /**
   * Their life in in-world order. A section shows when any of its items
   * does, under its latest title the reader may see; each item notes the
   * books it's from.
   */
  history: ShownSection[]
  appearance: string[]
  personality: string[]
  description: ShownSection[]
  abilities: ShownSection[]
  relationships: ShownSection[]
  /** Whether unread books hide any of it. */
  spoilers: boolean
}

/**
 * Trims a character's prose like revealCharacter does its facts. The
 * character's page leaves out intros from their personas' books, which
 * describe the persona.
 */
/** `prose` is the story of the character behind any persona (see loadStory). */
export function revealStory(
  characterId: string,
  prose: CharacterStory | undefined,
  canSee: CanSee,
  viewAnyway = false,
): ShownStory {
  const v = view(characterId, canSee)
  if (!v || !prose)
    return {
      history: [],
      appearance: [],
      personality: [],
      description: [],
      abilities: [],
      relationships: [],
      spoilers: false,
    }
  const { details, persona, trim } = v

  let spoilers = false
  const show = ({ revealedIn }: StoryItem) => {
    const reveal = trim(revealedIn)
    if (persona && reveal.length === 0) return false
    if (canSee(reveal)) return true
    spoilers = true
    return viewAnyway
  }
  const personaBooks = new Set((details.personas ?? []).flatMap((p) => p.books))
  const aboutPersona = ({ revealedIn }: StoryItem) =>
    revealedIn.flatMap(pointBooks).every((b) => personaBooks.has(b))

  const sections = (list: StorySection[] = []): ShownSection[] =>
    list
      .map(({ title, items }) => ({
        key: title[0]?.text ?? '',
        title: title.filter(show).at(-1)?.text,
        items: items.filter(show).map(({ text, revealedIn }) => ({
          text,
          books: pointSources(trim(revealedIn)),
        })),
      }))
      .filter((s) => s.items.length > 0)

  const intros = prose.intro
    .filter((i) => persona || !aboutPersona(i))
    .filter(show)

  return {
    intro: (intros.filter((i) => !i.fallback).at(-1) ?? intros.at(-1))?.text,
    history: sections(prose.history),
    appearance: prose.appearance.filter(show).map((i) => i.text),
    personality: prose.personality.filter(show).map((i) => i.text),
    description: sections(prose.description),
    abilities: sections(prose.abilities),
    relationships: sections(prose.relationships),
    spoilers,
  }
}

/**
 * The latest portrait the reader may see (or, with `viewAnyway`, the latest
 * of all), and whether unread books hide a later one.
 */
export function revealPortrait(
  portraits: readonly Portrait[] = [],
  canSee: CanSee,
  viewAnyway = false,
): { portrait?: Portrait; spoilers: boolean } {
  const visible = portraits.filter((p) => canSee(p.revealedIn))
  const spoilers = visible.length < portraits.length
  return {
    portrait: (viewAnyway ? portraits : visible).at(-1),
    spoilers,
  }
}

/**
 * Every piece of art for a part of a page the reader may see (or, with
 * `viewAnyway`, all of it), and whether unread books hide any.
 */
export function revealFigures<T extends Portrait>(
  figures: readonly T[] = [],
  canSee: CanSee,
  viewAnyway = false,
): { figures: T[]; spoilers: boolean } {
  const visible = figures.filter((f) => canSee(f.revealedIn))
  return {
    figures: viewAnyway ? [...figures] : visible,
    spoilers: visible.length < figures.length,
  }
}

export interface ShownTravelStop {
  planetId: string
  place?: string
  uncertain?: string
  wob?: string
  events: { text: string; books: BookSource[] }[]
}

/**
 * A character's worlds, trimmed like their History. A persona's page gets
 * none, since travelling between worlds would give the persona away.
 */
export function revealTravels(
  characterId: string,
  stops: readonly TravelStop[] = [],
  canSee: CanSee,
  viewAnyway = false,
): { stops: ShownTravelStop[]; spoilers: boolean } {
  const v = view(characterId, canSee)
  if (!v || v.persona) return { stops: [], spoilers: false }
  let spoilers = false
  const show = ({ revealedIn }: Passage) => {
    if (canSee(v.trim(revealedIn))) return true
    spoilers = true
    return viewAnyway
  }
  const shown = stops
    .filter(({ needs }) => !needs || show({ text: '', revealedIn: needs }))
    .map(({ planetId, place, uncertain, wob, events }) => ({
      planetId,
      place,
      uncertain: uncertain && show(uncertain) ? uncertain.text : undefined,
      wob: wob && show(wob) ? wob.text : undefined,
      events: events.filter(show).map(({ text, revealedIn }) => ({
        text,
        books: pointSources(v.trim(revealedIn)),
      })),
    }))
    .filter((s) => s.events.length > 0)
  return { stops: shown, spoilers }
}

/** A character's Travels section: their (or a persona's) stops, trimmed. */
export const revealCharacterTravels = (
  id: string,
  canSee: CanSee,
  viewAnyway = false,
) =>
  revealTravels(
    id,
    characterTravels[findPersona(id)?.characterId ?? id],
    canSee,
    viewAnyway,
  )

/** A journey event trimmed to what the reader may see. */
export interface ShownJourneyStop {
  id: string
  mapId: string
  /** Empty while where it happened is still hidden. */
  path: readonly MapPoint[]
  approximate: boolean
  /** What happens, e.g. "Sold to Bridge Four". */
  title?: string
  art?: JourneyArt
  /** Set only once the place itself is revealed. */
  place?: { name: string; href?: string }
  /** The first point the reader has reached that reveals it. */
  where?: { bookId: string; chapter?: string }
  summary: {
    text: string
    cite?: { text: string; url?: string }
    links?: { text: string; href: string }[]
  }[]
}

export interface ShownJourney {
  /** In timeline order. */
  stops: ShownJourneyStop[]
  /**
   * The maps the stops are on and the maps holding those (a city's world
   * map), outermost first, in order of first use.
   */
  maps: AtlasMap[]
  credits: JourneyCredit[]
  /** Whether unread books hide any of it. */
  spoilers: boolean
}

const firstPoint = (
  reveal: Reveal,
  canSee: CanSee,
): ShownJourneyStop['where'] => {
  for (const point of reveal) {
    if (!canSee([point]) || (typeof point !== 'string' && 'all' in point))
      continue
    return typeof point === 'string'
      ? { bookId: point }
      : { bookId: point.book, chapter: point.chapter }
  }
  return undefined
}

/**
 * One character's journey (the events of any of `characterIds`, e.g. a
 * character and their personas), trimmed to what the reader may see: events they
 * haven't reached, on maps they can't see yet, vanish; places they haven't
 * reached stay unnamed. `trim` drops reveal points a page may not use (see
 * revealCharacterJourney). Generic: knows nothing of any one series.
 */
export function revealJourney(
  characterIds: string | readonly string[],
  events: readonly JourneyEvent[],
  atlas: Atlas,
  canSee: CanSee,
  {
    viewAnyway = false,
    credits = [],
    trim = (r: Reveal) => r,
  }: {
    viewAnyway?: boolean
    credits?: readonly JourneyCredit[]
    trim?: (reveal: Reveal) => Reveal
  } = {},
): ShownJourney {
  const ids = typeof characterIds === 'string' ? [characterIds] : characterIds
  let spoilers = false
  const show = (reveal: Reveal) => {
    if (canSee(trim(reveal))) return true
    spoilers = true
    return viewAnyway
  }
  const see: CanSee = (reveal) => viewAnyway || canSee(trim(reveal))
  const maps: AtlasMap[] = []
  const sources = new Set<string>()
  const stops = events
    .filter((e) => e.characters.some((c) => ids.includes(c)))
    .toSorted((a, b) => a.order - b.order)
    .flatMap((e): ShownJourneyStop[] => {
      const map = atlas.map(e.mapId)
      if (!map || !show(e.revealedIn)) return []
      // The map is the series' own, not the character's: never trimmed.
      if (!canSee(map.revealedIn) && ((spoilers = true), !viewAnyway)) return []
      // An inner map (a city) brings the maps holding it, to zoom out to.
      const chain: AtlasMap[] = []
      for (let m: AtlasMap | undefined = map; m;) {
        if (chain.includes(m)) break
        chain.unshift(m)
        const up: AtlasMap | undefined = m.parent && atlas.map(m.parent.mapId)
        m = up && canSee(up.revealedIn) ? up : undefined
      }
      for (const m of chain) if (!maps.some((x) => x.id === m.id)) maps.push(m)
      if (e.source) sources.add(e.source)
      const located = !e.placeRevealedIn || see(e.placeRevealedIn)
      const place = e.placeId && located ? atlas.place(e.placeId) : undefined
      return [
        {
          id: e.id,
          mapId: e.mapId,
          path: located ? e.path : [],
          approximate: !!e.approximate,
          ...(e.title && { title: e.title }),
          ...(e.art && { art: e.art }),
          place:
            place && see(place.revealedIn)
              ? { name: place.name, href: place.href }
              : e.placeName && located
                ? { name: e.placeName }
                : undefined,
          where: firstPoint(trim(e.revealedIn), see),
          summary: (e.summary ?? [])
            .filter(
              (p) =>
                see(p.revealedIn) && !(p.supersededIn && see(p.supersededIn)),
            )
            .map((p) => {
              const links = (p.links ?? [])
                .filter((l) => viewAnyway || hasMet(l.characterId, canSee))
                .map((l) => ({
                  text: l.text,
                  href: `/characters/${l.characterId}`,
                }))
              return {
                text: p.text,
                ...(p.cite && { cite: p.cite }),
                ...(links.length && { links }),
              }
            }),
        },
      ]
    })
  return {
    stops,
    maps,
    // Only the sources it shows (a credit without one goes with any).
    credits: credits.filter((c) =>
      c.source ? sources.has(c.source) : stops.length,
    ),
    spoilers,
  }
}

/**
 * Whose events a page's journey draws on. A persona page has only events
 * tagged with the persona (told under that name, so they never give the
 * character away). A character's page adds those of every persona the
 * reader has seen through, and skips books where they go by a persona the
 * reader hasn't.
 */
export function journeyIds(id: string, canSee: CanSee): string[] {
  const v = view(id, canSee)
  if (!v) return []
  if (v.persona) return [id]
  return [
    id,
    ...(v.details.personas ?? [])
      .filter((p) => canSee(p.identityRevealedIn))
      .map((p) => p.id),
  ]
}

/**
 * Whether a character's page shows any of their journey, by the index alone
 * (no pack needed): some event and its map are revealed.
 */
export function journeyShown(
  id: string,
  index: JourneyIndex,
  atlas: Atlas,
  canSee: CanSee,
) {
  const v = view(id, canSee)
  if (!v) return false
  return journeyIds(id, canSee).some((who) =>
    (index[who] ?? []).some(({ mapId, revealedIn }) => {
      const map = atlas.map(mapId)
      return !!map && canSee(v.trim(revealedIn)) && canSee(map.revealedIn)
    }),
  )
}

/**
 * A journey cut into one per world (e.g. Hoid's on Roshar and on Scadrial),
 * each with only its own stops and the maps they use. `worldOf` names the
 * world a map shows.
 */
export function journeyByWorld(
  journey: ShownJourney,
  worldOf: (mapId: string) => string | undefined,
): Record<string, ShownJourney> {
  const out: Record<string, ShownJourney> = {}
  for (const stop of journey.stops) {
    const world = worldOf(stop.mapId)
    if (!world) continue
    out[world] ??= { ...journey, stops: [], maps: [] }
    out[world].stops.push(stop)
  }
  for (const part of Object.values(out))
    part.maps = journey.maps.filter(
      (m) => worldOf(m.id) === worldOf(part.stops[0].mapId),
    )
  return out
}

/**
 * A character or persona page's journey: as revealJourney, for the events
 * of journeyIds, with books the page leaves out trimmed.
 */
export function revealCharacterJourney(
  id: string,
  events: readonly JourneyEvent[],
  atlas: Atlas,
  canSee: CanSee,
  options: { viewAnyway?: boolean; credits?: readonly JourneyCredit[] } = {},
): ShownJourney {
  const v = view(id, canSee)
  if (!v) return { stops: [], maps: [], credits: [], spoilers: false }
  return revealJourney(journeyIds(id, canSee), events, atlas, canSee, {
    ...options,
    trim: v.trim,
  })
}

/** What a place's page may say in prose. */
export interface ShownLocationStory {
  /** The latest "what it is" line the reader may see. */
  intro?: string
  description: string[]
  /** As ShownStory's history. */
  history: { title?: string; items: { text: string; books: BookSource[] }[] }[]
  spoilers: boolean
}

/** Trims a place's story to what the reader may see. */
export function revealLocationStory(
  prose: LocationStory | undefined,
  canSee: CanSee,
  viewAnyway = false,
): ShownLocationStory {
  if (!prose) return { description: [], history: [], spoilers: false }
  let spoilers = false
  const show = ({ revealedIn }: StoryItem) => {
    if (canSee(revealedIn)) return true
    spoilers = true
    return viewAnyway
  }
  return {
    intro: prose.intro.filter(show).at(-1)?.text,
    description: prose.description.filter(show).map((i) => i.text),
    history: prose.history
      .map(({ title, items }) => ({
        title: title.filter(show).at(-1)?.text,
        items: items.filter(show).map(({ text, revealedIn }) => ({
          text,
          books: pointSources(revealedIn),
        })),
      }))
      .filter((s) => s.items.length > 0),
    spoilers,
  }
}

/** A place's Key facts and people, trimmed to what the reader may see. */
export interface ShownLocationDetails {
  /** Facts by label, in the order first given. */
  facts: {
    label: string
    values: { name: string; placeId?: string; characterId?: string }[]
  }[]
  /** Each person once, with every tie the reader may see. */
  people: { characterId: string; relations: LocationPerson['relation'][] }[]
  spoilers: boolean
}

/**
 * Trims a place's Key facts and people. A fact naming a place or character
 * shows only once the reader may see them too (`placeShown`, hasMet); a
 * person only once met, and not through a persona the reader hasn't seen
 * through.
 */
export function revealLocationDetails(
  details: LocationDetails | undefined,
  canSee: CanSee,
  placeShown: (placeId: string) => boolean,
  viewAnyway = false,
): ShownLocationDetails {
  const shown: ShownLocationDetails = { facts: [], people: [], spoilers: false }
  if (!details) return shown
  const show = (ok: boolean) => {
    if (ok) return true
    shown.spoilers = true
    return viewAnyway
  }
  for (const f of details.facts) {
    const ok =
      canSee(f.revealedIn) &&
      (!f.placeId || placeShown(f.placeId)) &&
      (!f.characterId || hasMet(f.characterId, canSee))
    if (!show(ok)) continue
    const group = shown.facts.find((g) => g.label === f.label)
    const value = {
      name: f.name,
      placeId: f.placeId,
      characterId: f.characterId,
    }
    if (group) group.values.push(value)
    else shown.facts.push({ label: f.label, values: [value] })
  }
  for (const p of details.people) {
    const trim = view(p.characterId, canSee)?.trim ?? ((r: Reveal) => r)
    const reveal = trim(p.revealedIn)
    const ok =
      reveal.length > 0 && canSee(reveal) && hasMet(p.characterId, canSee)
    if (!show(ok)) continue
    const person = shown.people.find((x) => x.characterId === p.characterId)
    if (person) {
      if (!person.relations.includes(p.relation))
        person.relations.push(p.relation)
    } else
      shown.people.push({ characterId: p.characterId, relations: [p.relation] })
  }
  return shown
}

/** A Culture or Abilities entry's page, trimmed to what the reader may see. */
export interface ShownEntry extends ShownLocationStory {
  /** Facts by label, in the order first given. */
  facts: {
    label: string
    values: { name: string; characterId?: string; placeId?: string }[]
  }[]
  /**
   * Each person once, with every role the reader may see and, on a page with
   * levels, the highest level they've been seen to reach.
   */
  people: {
    characterId: string
    roles: EntryPerson['role'][]
    level?: string
  }[]
  /** The page's levels that have someone in them, highest first. */
  levels: string[]
  /** Sections in the Coppermind's order, each part like history's. */
  sections: {
    title: string
    items: string[]
    parts: (ShownLocationStory['history'][number] & {
      /** Quoted words, each with who the reader has seen say them. */
      words: { text: string; books: BookSource[]; spokenBy: string[] }[]
    })[]
  }[]
  aboutTitle?: string
  peopleTitle?: string
  /**
   * On a page with member write-ups: each member the reader has met, in the
   * page's order, with what it says about them so far; then everyone else in
   * `people`, with nothing written.
   */
  members: {
    characterId: string
    items: { text: string; books: BookSource[] }[]
  }[]
  /** "How it works", shaped like history. */
  mechanics: ShownLocationStory['history']
  /** Tables with at least one row the reader may see. */
  tables: {
    title: string
    columns: string[]
    rows: {
      key: string
      entry?: string
      cells: string[]
      books: BookSource[]
    }[]
  }[]
}

/**
 * Trims an entry's page like a place's: prose by date; a fact naming a place
 * or character only once the reader may see them too; a person only once
 * met, and not through a persona the reader hasn't seen through.
 */
export function revealEntry(
  story: EntryStory | undefined,
  canSee: CanSee,
  placeShown: (placeId: string) => boolean,
  viewAnyway = false,
  members: readonly { characterId: string; revealedIn: Reveal }[] = [],
): ShownEntry {
  const prose = revealLocationStory(story, canSee, viewAnyway)
  const shown: ShownEntry = {
    ...prose,
    facts: [],
    people: [],
    levels: [],
    sections: [],
    mechanics: [],
    tables: [],
    members: [],
    aboutTitle: story?.aboutTitle,
    peopleTitle: story?.peopleTitle,
  }
  const show = (ok: boolean) => {
    if (ok) return true
    shown.spoilers = true
    return viewAnyway
  }
  // Seen to belong, from their own page's dated group or title facts.
  const seen = (p: { characterId: string; revealedIn: Reveal }) => {
    const trim = view(p.characterId, canSee)?.trim ?? ((r: Reveal) => r)
    const reveal = trim(p.revealedIn)
    return reveal.length > 0 && canSee(reveal) && hasMet(p.characterId, canSee)
  }
  const addMembers = () => {
    for (const m of members) {
      if (shown.people.some((p) => p.characterId === m.characterId)) continue
      if (show(seen(m)))
        shown.people.push({ characterId: m.characterId, roles: [] })
    }
  }
  if (!story) {
    addMembers()
    return shown
  }
  for (const section of story.sections ?? []) {
    const lead = revealLocationStory(
      { intro: [], description: section.items, history: [] },
      canSee,
      viewAnyway,
    )
    shown.spoilers ||= lead.spoilers
    const parts: ShownEntry['sections'][number]['parts'] = []
    for (const part of section.parts) {
      const words = part.words
        ?.filter((w) => show(canSee(w.revealedIn)))
        .map((w) => ({
          text: w.text,
          books: pointSources(w.revealedIn),
          spokenBy: w.spokenBy
            .filter((p) => show(seen(p)))
            .map((p) => p.characterId),
        }))
      const body = revealLocationStory(
        { intro: [], description: [], history: [part] },
        canSee,
        viewAnyway,
      )
      shown.spoilers ||= body.spoilers
      const title = part.title.filter((t) => show(canSee(t.revealedIn))).at(-1)
      const items = body.history[0]?.items ?? []
      if (items.length > 0 || words?.length)
        parts.push({ title: title?.text, items, words: words ?? [] })
    }
    if (lead.description.length > 0 || parts.length > 0)
      shown.sections.push({
        title: section.title,
        items: lead.description,
        parts,
      })
  }
  if (story.mechanics) {
    const how = revealLocationStory(
      { intro: [], description: [], history: story.mechanics },
      canSee,
      viewAnyway,
    )
    shown.mechanics = how.history
    shown.spoilers ||= how.spoilers
  }
  for (const f of story.facts) {
    const ok =
      canSee(f.revealedIn) &&
      (!f.placeId || placeShown(f.placeId)) &&
      (!f.characterId || hasMet(f.characterId, canSee))
    if (!show(ok)) continue
    const group = shown.facts.find((g) => g.label === f.label)
    const value = {
      name: f.name,
      characterId: f.characterId,
      placeId: f.placeId,
    }
    if (group) group.values.push(value)
    else shown.facts.push({ label: f.label, values: [value] })
  }
  const rank = (level?: string) => story.levels?.indexOf(level ?? '') ?? -1
  for (const p of story.people) {
    if (!show(seen(p))) continue
    const person = shown.people.find((x) => x.characterId === p.characterId)
    if (person) {
      if (!person.roles.includes(p.role)) person.roles.push(p.role)
      if (rank(p.level) > rank(person.level)) person.level = p.level
    } else
      shown.people.push({
        characterId: p.characterId,
        roles: [p.role],
        level: p.level,
      })
  }
  for (const table of story.tables ?? []) {
    const rows: ShownEntry['tables'][number]['rows'] = []
    for (const r of table.rows) {
      if (!show(canSee(r.revealedIn))) continue
      const row = {
        key: r.key,
        entry: r.entry,
        cells: r.cells,
        books: pointSources(r.revealedIn),
      }
      const at = rows.findIndex((x) => x.key === r.key)
      if (at >= 0) rows[at] = row
      else rows.push(row)
    }
    // A column with nothing the reader may see yet is left out, so blank
    // cells don't hint at what's to come.
    const keep = table.columns.map(
      (_, i) => i === 0 || rows.some((r) => r.cells[i]),
    )
    if (rows.length > 0)
      shown.tables.push({
        title: table.title,
        columns: table.columns.filter((_, i) => keep[i]),
        rows: rows.map((r) => ({
          ...r,
          cells: r.cells.filter((_, i) => keep[i]),
        })),
      })
  }
  addMembers()
  if (story.members) {
    for (const m of story.members) {
      const items = m.items
        .filter((i) => show(canSee(i.revealedIn)))
        .map((i) => ({ text: i.text, books: pointSources(i.revealedIn) }))
      const listed = shown.people.some((p) => p.characterId === m.characterId)
      if ((items.length > 0 || listed) && show(hasMet(m.characterId, canSee)))
        shown.members.push({ characterId: m.characterId, items })
    }
    for (const p of shown.people)
      if (!shown.members.some((m) => m.characterId === p.characterId))
        shown.members.push({ characterId: p.characterId, items: [] })
  }
  shown.levels = (story.levels ?? [])
    .filter((l) => shown.people.some((p) => p.level === l))
    .reverse()
  return shown
}
