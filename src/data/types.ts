/** A chapter in a book (see chapters.ts). */
export interface ChapterPoint {
  book: string
  chapter: string
}

/**
 * Where something is revealed: a book id (see books.ts), meaning by the end of
 * that book, or a chapter in it. `all` is reached only once every point in it
 * is, for things that take two books to see, such as a world hopper going by
 * another name in another series.
 */
export type RevealPoint =
  string | ChapterPoint | { all: readonly (string | ChapterPoint)[] }

/**
 * Places that reveal something, earliest first. It is shown once the reader
 * has reached any one of them.
 */
export type Reveal = readonly RevealPoint[]

/** A book a fact comes from, and its chapter if known. */
export interface BookSource {
  bookId: string
  chapter?: string
}

/** A sentence or two of prose, revealed by its own books. */
export interface Passage {
  text: string
  revealedIn: Reveal
}

/** A named fact, such as a Shard or magic system, revealed by its own books. */
export interface Fact {
  name: string
  revealedIn: Reveal
}

/** An out-of-book source for a fact, e.g. a Word of Brandon. */
export interface FactSource {
  text: string
  url?: string
}

/** A book set on a planet, shown once the reader has read it. */
export interface Story {
  bookId: string
  revealedIn: Reveal
}

export interface Moon {
  /** Omitted for moons that have no known name. */
  name?: string
  color: string
  revealedIn: Reveal
}

/**
 * mottled: soft painted blotches (the default). banded: gas-giant brush bands.
 * cratered: pocked rock. marbled: swirling veins. tidal: Taldain's lit and dark halves.
 * plated: the panels and lit windows of a built world, like the Grand Apparatus.
 */
export type PlanetSurface =
  'mottled' | 'banded' | 'cratered' | 'marbled' | 'tidal' | 'plated'

export interface Planet {
  id: string
  name: string
  /** Books that reveal the planet itself: its name, globe and place on the chart. */
  revealedIn: Reveal
  /** Second name shown on the star chart, e.g. "Seol" for Sel. */
  altName?: Passage
  /** Replaces the chart label, e.g. "Scadrial New Orbit". */
  chartLabel?: Passage
  summary: Passage[]
  /** Books set on this planet, in publication order. */
  settingOf?: Story[]
  /** Other books that mention or briefly visit this planet, in publication order. */
  mentionedIn?: Story[]
  shards: Fact[]
  magicSystems: Fact[]
  moons: Moon[]
  /** Draw every moon evenly spaced on one ring, like Lumar's twelve. */
  moonRing?: boolean
  /** Orbit index from the star, used for layout only (not to scale). */
  orbit: number
  color: string
  /** Relative drawn size on the chart (1 = default). */
  size?: number
  rings?: boolean
  /** Ring angle in degrees; 90 stands the rings upright. */
  ringTilt?: number
  /** How the globe is painted, matched to its in-world chart. */
  surface?: PlanetSurface
  /** Second paint color for bands, veins and the like. */
  accent?: string
  /** Color of a soft halo drawn around the planet. */
  glow?: string
  dwarf?: boolean
  coppermindUrl: string
}

export type LocationKind =
  'continent' | 'nation' | 'region' | 'city' | 'landmark'

/** A place on a planet, with its own page and spots on interactive maps. */
export interface Location {
  id: string
  name: string
  /** Another name in the same books, e.g. Opelon for Sycla. */
  altName?: string
  planetId: string
  kind: LocationKind
  /** The place it lies within, e.g. Kae's parent is Arelon. */
  parentId?: string
  /** Books that reveal the place itself: its name, page and map spots. */
  revealedIn: Reveal
  summary: Passage[]
  /** Books set here, in publication order. */
  settingOf?: Story[]
  /** Other books that mention it, in publication order. */
  mentionedIn?: Story[]
  coppermindUrl: string
}

/** Kinds of place in the Locations list, from the Coppermind's categories. */
export type ListedLocationKind =
  | 'system'
  | 'planet'
  | 'moon'
  | 'celestial'
  | 'continent'
  | 'nation'
  | 'region'
  | 'settlement'
  | 'building'
  | 'water'
  | 'island'
  | 'mountain'
  | 'forest'
  | 'plain'
  | 'cave'
  | 'perpendicularity'
  | 'other'

/** A place in the Locations list (see locationList.ts). */
export interface ListedLocation {
  /** Same id as its map place, when it has one. */
  id: string
  name: string
  kind: ListedLocationKind
  /** Planet id. */
  world?: string
  /** The listed place it lies within. */
  parentId?: string
  /** The earliest book its Coppermind page cites. */
  revealedIn: Reveal
  /** Every book its page cites, in publication order. */
  books: string[]
  coppermindPage: string
  /** Planet of its map place, when it has one (see places/). */
  mapPlanetId?: string
}

export type ListedAbilityKind =
  | 'system'
  | 'power'
  | 'metal'
  | 'order'
  | 'user'
  | 'bond'
  | 'investiture'
  | 'item'
  | 'concept'

/** A link from an ability to a magic system or Shard, dated on its own. */
export interface AbilityTie {
  revealedIn: Reveal
}

/** A magic system, power or other ability (see abilityList.ts). */
export interface ListedAbility {
  id: string
  name: string
  kind: ListedAbilityKind
  /** Planet id of its world of origin. */
  world?: string
  /** Ids of the listed systems it belongs to. */
  systems?: (AbilityTie & { id: string })[]
  /** Shards it draws on. */
  shards?: (AbilityTie & { name: string })[]
  /** The earliest book its Coppermind page cites, or later if set by hand. */
  revealedIn: Reveal
  /** Every book its page cites, in publication order. */
  books: string[]
  coppermindPage: string
}

export type ListedCultureKind =
  | 'house'
  | 'title'
  | 'class'
  | 'people'
  | 'religion'
  | 'organization'
  | 'language'
  | 'custom'
  | 'literature'
  | 'myth'
  | 'food'
  | 'clothing'
  | 'currency'
  | 'game'
  | 'other'

/** A house, title, religion, custom or other bit of culture (see cultureList.ts). */
export interface ListedCulture {
  id: string
  name: string
  kind: ListedCultureKind
  /** Planet id of the world it belongs to. */
  world?: string
  /** The earliest book its Coppermind page cites, or later if set by hand. */
  revealedIn: Reveal
  /** Every book its page cites (from its reveal on), in publication order. */
  books: string[]
  coppermindPage: string
}

/** A Key fact about a place, e.g. the dominance it lies in. */
export interface LocationFact {
  /** e.g. 'Dominance', 'Ruled by'. */
  label: string
  name: string
  /** The listed place it names, if any. */
  placeId?: string
  /** The character it names, if any. */
  characterId?: string
  revealedIn: Reveal
}

/** Someone who lives at, was born at or belongs to a place. */
export interface LocationPerson {
  characterId: string
  relation: 'resident' | 'born' | 'citizen'
  revealedIn: Reveal
}

/** Key facts and people for a place (see locationDetails.ts). */
export interface LocationDetails {
  facts: LocationFact[]
  people: LocationPerson[]
}

/** What a place's page says in prose (see locationStories.ts). */
export interface LocationStory {
  /** "What it is" in a sentence or two, earliest first. */
  intro: StoryItem[]
  /** What it's like: geography, layout, people, culture. */
  description: StoryItem[]
  /** What happened there, in in-world order (as CharacterStory's). */
  history: { title: StoryItem[]; items: StoryItem[] }[]
}

/** A Key fact on a Culture or Abilities entry's page, e.g. its leader. */
export interface EntryFact {
  /** e.g. 'Leader', 'Based on'. */
  label: string
  name: string
  characterId?: string
  /** A listed place it names. */
  placeId?: string
  revealedIn: Reveal
}

/** Someone tied to a Culture or Abilities entry, e.g. a member. */
export interface EntryPerson {
  characterId: string
  /** e.g. 'member', 'leader', 'user'. */
  role: string
  revealedIn: Reveal
}

/**
 * What a Culture or Abilities entry's page says (see entryStories.ts): prose
 * like a place's, plus Key facts and people, every item dated on its own so
 * the page grows chapter by chapter.
 */
export interface EntryStory extends LocationStory {
  facts: EntryFact[]
  people: EntryPerson[]
}

export interface Belt {
  /** Orbit index for layout; bodies outside the belt should use higher orbits. */
  orbit: number
  description: string
  revealedIn: Reveal
}

/** Colors for a system's star chart, matched to its in-world chart. */
export interface ChartPalette {
  /** Radial wash from the sun outward: [inner, mid, outer-mid, outer]. */
  wash: [string, string, string, string]
  sky: string
  /** Dark ring that carries the title and gold stars. */
  ring: string
  band: string
  sun: {
    /** spiky: straight rays; flame: curled blades; thorn: thin inked thorns. */
    style: 'spiky' | 'flame' | 'thorn'
    halo: string
    rays: [string, string]
    core: string
    ink: string
  }
  /** Defaults to the Rosharan belt colors. */
  belt?: { fill: string; rocks: string[]; rockStroke: string }
  /** Scattered comets in the comet belt; without it the belt is plain. */
  comets?: { fill: string; rocks: string[]; rockStroke: string }
}

/** Extra ink along an orbit, e.g. a planet's former position. */
export interface OrbitNote {
  orbit: number
  /** Text left of the top of the orbit, where planet names go. */
  left?: string
  /** Text right of the top of the orbit. */
  right?: string
  /** Blue ink marks historical notes, as on the Scadrian chart. */
  ink?: 'red' | 'blue'
  /** Unclickable body at the top of the orbit. */
  body?: { color: string; title: string }
  revealedIn: Reveal
}

export interface ChartMarker {
  label: string
  description: string
  orbit: number
  /** Degrees clockwise from straight above the sun. */
  angle: number
  revealedIn: Reveal
}

export interface ChartLayout {
  /** Sun in the middle of the page with full orbits, instead of rising from the bottom edge. */
  centered?: boolean
  /** Sun's height on a centered chart (chart units); defaults to the middle. */
  sunY?: number
  /** Raise the sun this far above the bottom edge on an arc chart. */
  sunLift?: number
  /** Explicit orbit radii (chart units, index 0 = orbit 1) for uneven spacing. */
  orbitRadii?: number[]
  /** Relative size of the sun drawing (1 = default). */
  sunScale?: number
}

export interface StarSystem {
  id: string
  name: string
  star: Passage[]
  /** Second star in a binary system; switches to the binary chart layout. */
  companionStar?: Passage
  /** Shown once any of its planets is revealed. */
  summary: Passage[]
  /** Stylized position on the star map, as percentages (0–100). */
  mapPosition: { x: number; y: number }
  color: string
  planets: Planet[]
  asteroidBelt?: Belt
  cometBelt?: Belt
  /** Unclickable features drawn on the chart, e.g. Nalthis's cognitive anomaly. */
  markers?: ChartMarker[]
  orbitNotes?: OrbitNote[]
  palette?: ChartPalette
  layout?: ChartLayout
  /**
   * Not a real system: worlds whose own systems are unknown, each charted
   * alone with no shared sun or orbits.
   */
  uncharted?: boolean
  coppermindUrl: string
}

/**
 * What's known about a character (see characterDetails.ts). Each fact carries
 * its own spoiler tag.
 */
export interface CharacterDetails {
  /**
   * Books they appear in, each revealed where they first appear in it. The
   * reader has met them once they've reached any of these.
   */
  appearsIn: Story[]
  /** Their home world: a planet id from systems.ts. */
  world?: { planetId: string; revealedIn: Reveal }
  aliases: Fact[]
  species: Fact[]
  abilities: Fact[]
  nationality?: Fact[]
  profession?: Fact[]
  /** Organizations, crews and orders they belong to. */
  groups?: Fact[]
  /** Spren, seons and others they're bonded with. */
  bonds?: Fact[]
  relatives?: Relative[]
  /**
   * When and where they were born, fuller versions later: a page shows the
   * latest one the reader may see. `name` is the when ("Late 1153"), if
   * known. `sources` are out-of-book ones (a Word of Brandon), used only if
   * they spoil nothing unread.
   */
  born?: (Fact & { placeId?: string; sources?: FactSource[] })[]
  /**
   * Their age at points in the story, in story order: a page shows the
   * latest one the reader may see, as of the book it's revealed in.
   */
  age?: (Fact & { sources?: FactSource[] })[]
  personas?: Persona[]
}

/**
 * Another name a character goes by in some books, such as Vasher as Zahel in
 * the Stormlight Archive. Until the reader can tell they're the same person,
 * what those books reveal is shown on a page of the persona's own, and left
 * off the character's page.
 */
export interface Persona {
  /** Unique kebab-case slug, used in the persona's URL. */
  id: string
  name: string
  /** Exact Coppermind page title (usually a redirect to the character). */
  coppermindPage: string
  /** Books where they go by this name. */
  books: readonly string[]
  /**
   * Where the reader can tell who they are: usually having read the
   * character's own books and reached the persona's first appearance.
   */
  identityRevealedIn: Reveal
}

/** A short piece of text about a character, adapted from the Coppermind. */
export interface StoryItem {
  text: string
  revealedIn: Reveal
}

/** What a character's page says about them in prose. */
export interface CharacterStory {
  /**
   * "Who they are" in a sentence or two, earliest first; a page shows the
   * latest one the reader may see.
   */
  intro: StoryItem[]
  /**
   * Their life in in-world order, like the Coppermind's History: sections
   * (each with title versions, earliest first) of items, in the order shown.
   */
  history: { title: StoryItem[]; items: StoryItem[] }[]
  /** How they look. */
  appearance: StoryItem[]
  /** Who they are: character, habits, outlook. */
  personality: StoryItem[]
}

/** A family tie, revealed where the books make it clear. */
export interface Relative extends Fact {
  /**
   * 'parent', 'sibling', 'spouse', 'child', 'relative', 'ancestor', or a
   * closer label from the Coppermind such as 'paternal grandfather'.
   */
  relation: string
  /** Set when the relative has a page of their own. */
  characterId?: string
}

/** A Cosmere character. Names only for now; details come later. */
export interface Character {
  /** Unique kebab-case slug, used in the character's URL. */
  id: string
  name: string
  /** Exact Coppermind page title, e.g. "Ati (seon)". */
  coppermindPage: string
}
