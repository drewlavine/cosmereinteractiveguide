/**
 * Book ids (see books.ts) that reveal something, earliest first. It is shown
 * once the reader has read any one of them.
 */
export type Reveal = readonly string[]

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

/** A Cosmere character. Names only for now; details come later. */
export interface Character {
  /** Unique kebab-case slug, used in the character's URL. */
  id: string
  name: string
  /** Exact Coppermind page title, e.g. "Ati (seon)". */
  coppermindPage: string
}
