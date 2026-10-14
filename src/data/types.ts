export interface Moon {
  /** Omitted for moons that have no known name. */
  name?: string
  color: string
}

export interface Planet {
  id: string
  name: string
  /** Second name shown on the star chart, e.g. "Seol" for Sel. */
  altName?: string
  /** Replaces the chart label, e.g. "Scadrial New Orbit". */
  chartLabel?: string
  summary: string
  shards: string[]
  magicSystems: string[]
  moons: Moon[]
  /** Orbit index from the star, used for layout only (not to scale). */
  orbit: number
  color: string
  /** Relative drawn size on the chart (1 = default). */
  size?: number
  rings?: boolean
  /** Color of a soft halo drawn around the planet. */
  glow?: string
  dwarf?: boolean
  coppermindUrl: string
}

export interface Belt {
  /** Orbit index for layout; bodies outside the belt should use higher orbits. */
  orbit: number
  description: string
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
}

export interface ChartMarker {
  label: string
  description: string
  orbit: number
  /** Degrees clockwise from straight above the sun. */
  angle: number
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
  star: string
  /** Second star in a binary system; switches to the binary chart layout. */
  companionStar?: string
  summary: string
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
  coppermindUrl: string
}
