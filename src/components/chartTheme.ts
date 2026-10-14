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
