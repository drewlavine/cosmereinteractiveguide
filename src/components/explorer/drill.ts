import { MAP_H } from './sky'

/**
 * A city's map drawn on the map it's on: centred on its place, its full
 * height this many of that map's units. Cities are far smaller than their
 * maps' art, so this is a legible footprint, not to scale.
 */
export const INSET_H = 80
/** City map units to parent map units. */
export const INSET_K = INSET_H / MAP_H

/**
 * How far in a world's map is zoomed before its cities' tags show (view
 * height, map units): none on the whole map, all from about a region in.
 * A city's map has few, so they always show there.
 */
export const TAGS_H = [1000, 1300] as const

export const tagsFade = (h: number, onCity: boolean) =>
  onCity ? 1 : 1 - smoothstep(TAGS_H[0], TAGS_H[1], h)

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * How far into a city, all in the units of the map it's on: `h` is the view
 * height now, `fit` the view height that shows all of the city's map (the
 * camera's fitH, scaled down to its footprint), `lo` the closest that map
 * zooms, where the two swap. The city's map fades in over its footprint
 * well before the swap; the map around it fades away between the swap and
 * the whole city's map in view, so neither is ever cut.
 */
export const drillFades = (h: number, fit: number, lo: number) => {
  const end = Math.max(fit * 1.01, Math.min(fit * 2.2, lo * 0.95))
  return {
    city: 1 - smoothstep(1.6 * lo, 3 * lo, h),
    // Dimmed, not gone: past its edges the city's map stays in its place.
    parent: 0.35 + 0.65 * smoothstep(fit, end, h),
    // Each map's flags give way over the swap, so none pop.
    outside: smoothstep(lo * 1.05, lo * 1.6, h),
    inside: 1 - smoothstep(fit, end, h),
  }
}
