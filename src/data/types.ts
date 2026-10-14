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
  band: string
  sun: {
    style: 'spiky' | 'flame'
    halo: string
    rays: [string, string]
    core: string
    ink: string
  }
  belt: { fill: string; rocks: string[]; rockStroke: string }
}

export interface StarSystem {
  id: string
  name: string
  star: string
  summary: string
  /** Stylized position on the star map, as percentages (0–100). */
  mapPosition: { x: number; y: number }
  color: string
  planets: Planet[]
  asteroidBelt?: Belt
  cometBelt?: Belt
  palette?: ChartPalette
  coppermindUrl: string
}
