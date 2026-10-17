import { hasReached, type ReadingProgress } from './progress'
import { characterDetails } from './characterDetails'
import type { Portrait } from './characterPortraits'
import { characterTravels, type TravelStop } from './travels'
import type {
  CharacterDetails,
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
  StarSystem,
  Story,
  CharacterStory,
  StoryItem,
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
    spoilers,
  }
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
  history: { title?: string; items: { text: string; books: string[] }[] }[]
  appearance: string[]
  personality: string[]
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
    return { history: [], appearance: [], personality: [], spoilers: false }
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

  const history = prose.history
    .map(({ title, items }) => ({
      title: title.filter(show).at(-1)?.text,
      items: items.filter(show).map(({ text, revealedIn }) => ({
        text,
        books: [...new Set(trim(revealedIn).flatMap(pointBooks))],
      })),
    }))
    .filter((s) => s.items.length > 0)

  return {
    intro: prose.intro
      .filter((i) => persona || !aboutPersona(i))
      .filter(show)
      .at(-1)?.text,
    history,
    appearance: prose.appearance.filter(show).map((i) => i.text),
    personality: prose.personality.filter(show).map((i) => i.text),
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

export interface ShownTravelStop {
  planetId: string
  place?: string
  uncertain?: string
  wob?: string
  events: { text: string; books: string[] }[]
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
        books: [...new Set(v.trim(revealedIn).flatMap(pointBooks))],
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

/** What a place's page may say in prose. */
export interface ShownLocationStory {
  /** The latest "what it is" line the reader may see. */
  intro?: string
  description: string[]
  /** As ShownStory's history. */
  history: { title?: string; items: { text: string; books: string[] }[] }[]
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
          books: [...new Set(revealedIn.flatMap(pointBooks))],
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
