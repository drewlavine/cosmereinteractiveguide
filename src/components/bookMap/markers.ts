import type { MapPoint } from '../../data/journey'

/**
 * The chapter map's character colours: Paul Tol's "muted" scheme plus
 * Okabe–Ito's orange and blue, told apart under the common kinds of colour
 * blindness and readable on the parchment maps behind a dark backing.
 * A book hands them out in order of first appearance.
 */
export const castPalette = [
  '#e69f00',
  '#56b4e9',
  '#cc6677',
  '#44aa99',
  '#ddcc77',
  '#aa4499',
  '#88ccee',
  '#999933',
  '#d55e00',
  '#117733',
  '#882255',
  '#dddddd',
] as const

export const castColour = (index: number) =>
  castPalette[index % castPalette.length]

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

/**
 * Offsets (in marker diameters) to fan `n` markers at one spot out into a
 * honeycomb: one in the middle, then rings of 6, 12, 18... so the first
 * (those in the chapter) stay closest to the spot.
 */
export function honeycomb(n: number): MapPoint[] {
  const out: MapPoint[] = [[0, 0]]
  for (let ring = 1; out.length < n; ring++)
    for (let i = 0; i < 6 * ring && out.length < n; i++) {
      const side = Math.floor(i / ring)
      const step = i % ring
      const a = (Math.PI / 3) * side - Math.PI / 2
      const b = a + (2 * Math.PI) / 3
      out.push([
        ring * Math.cos(a) + step * Math.cos(b),
        ring * Math.sin(a) + step * Math.sin(b),
      ])
    }
  return out.slice(0, n)
}
