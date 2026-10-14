import type { ChartPalette } from '../data/types'

export const GOLD = '#d4a540'
export const INK_RED = '#9a1c1c'
export const INK_BLUE = '#1d3f8c'
export const INK_DARK = '#1c2a35'

/** Deterministic PRNG so decorative scatter (rocks, stars) is stable between renders. */
export function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable numeric seed from a string, e.g. a planet id. */
export function hashString(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Blend two #rrggbb colors; t = 0 gives a, t = 1 gives b. */
export function mixColor(a: string, b: string, t: number) {
  const channel = (hex: string, i: number) =>
    parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** Default ring angle and ring size relative to the planet's radius. */
export const RING_TILT = 12
export const RING_SCALE = { rx: 1.75, ry: 0.42 }

/** Half-width of a planet's rings as drawn, for keeping labels clear of them. */
export function ringHalfWidth(r: number, tilt = RING_TILT) {
  const t = (tilt * Math.PI) / 180
  return Math.hypot(
    r * RING_SCALE.rx * Math.cos(t),
    r * RING_SCALE.ry * Math.sin(t),
  )
}

/** Palette of the Rosharan chart; used for systems without their own. */
export const DEFAULT_PALETTE: ChartPalette = {
  wash: ['#f2f8fa', '#c9dde4', '#7d98a6', '#4b6676'],
  sky: '#dfe9ee',
  ring: '#2d4352',
  band: 'rgba(255, 255, 255, 0.28)',
  sun: {
    style: 'spiky',
    halo: '#f4fafc',
    rays: ['#9fd0de', '#c6e6ee'],
    core: '#e6f4f8',
    ink: '#2b4a5a',
  },
  belt: {
    fill: 'rgba(58, 75, 86, 0.55)',
    rocks: ['#232f37'],
    rockStroke: '#9fb3bf',
  },
}

/** Arc over the top of the sun, drawn left to right (for text paths). */
export const arcPath = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

export const polar = (cx: number, cy: number, r: number, angle: number) =>
  [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const
