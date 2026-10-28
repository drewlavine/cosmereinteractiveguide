import { assetUrl } from '../../data/assetUrl'

/**
 * The explorer's space: one continuous zoom from the painted sky of the
 * Cosmere down to a world's globe and its map (docs/state-of-my-cosmere.md
 * §6 D13–D16; ported from the engine prototype).
 *
 * World units: the world being looked at (the "anchor") sits at the origin
 * as a globe of radius PLANET_R, with its map on the plane z = PLANE_Z,
 * 1600 units tall. A view is a centre on that plane and a height `h`: how
 * many units fit top to bottom.
 */

export const FOV = 40
export const PLANET_R = 1000
export const PLANE_Z = PLANET_R + 5
/** Where the painted sky is drawn, behind every world. */
export const SKY_Z = -PLANET_R - 400
/** Every world map is scaled to this height. */
export const MAP_H = 1600

/** Camera distance from the plane that shows a view of height h. */
export const distFor = (h: number) =>
  h / 2 / Math.tan(((FOV / 2) * Math.PI) / 180)

/**
 * The constellation map (Isaac Stewart, Arcanum Unbounded), names painted
 * out, with the pixel of each system's star. Yolen isn't in the painting:
 * its star is a placeholder, away from the others, until a book places it.
 */
export const SKY = {
  w: 2300,
  h: 1737,
  src: assetUrl('/explorer/constellation.jpg'),
  stars: {
    rosharan: [606, 1277],
    scadrian: [942, 1025],
    nalthian: [819, 1501],
    selish: [643, 1536],
    drominad: [1533, 1393],
    taldain: [302, 867],
    threnodite: [144, 167],
    yolish: [1260, 610],
  } as Record<string, readonly [number, number]>,
}

/** Sky view height, and world units per art pixel there. */
const SKY_H = 43000
const SKY_K = 30
/** The closest you can zoom into the painted sky. */
export const SKY_MIN_H = 2000
/** Flights between worlds rise at least this far, to show both stars. */
export const SKY_FLIGHT_H = 9000
/** Out in space by a world, before its globe fills the view. */
export const GLOBE_H = 2600
/** A world's whole map. */
export const MAP_VIEW_H = 1750
/** Close in on a pin on a map. */
export const PIN_H = 900

/**
 * World units per art pixel at view height h: the sky grows more slowly
 * than the world as you zoom in, a depth (parallax) effect.
 */
export const skyScale = (h: number) => SKY_K * Math.pow(h / SKY_H, 0.6)

/** Art pixels from star `from` to point `to`, y up. */
export const artOffset = (
  to: readonly [number, number],
  from: readonly [number, number],
): [number, number] => [to[0] - from[0], from[1] - to[1]]

/**
 * The camera centre that puts art point `to` in the middle of the view,
 * with the sky pinned at star `anchor` (the sky is drawn so it looks as if
 * it lay on the globe's plane, z = 0, scaled by skyScale).
 */
export const skyCentre = (
  to: readonly [number, number],
  anchor: readonly [number, number],
  h: number,
): [number, number] => {
  const [x, y] = artOffset(to, anchor)
  const k = skyScale(h)
  return [x * k, y * k]
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** Crossfades by how much is in view (world height across the screen). */
export const fades = (h: number) => ({
  /** The map takes over once the globe has unrolled. */
  map: clamp01((2000 - h) / 250),
  planet: clamp01((h - 1500) / 600),
  /** The painted sky gives way to space. */
  sky: clamp01((h - 7000) / 9000),
  /** The globe grows out of its star. */
  planetIn: clamp01((26000 - h) / 12000),
  /** The globe unrolls into the map. */
  flat: clamp01((2500 - h) / 550),
})

export type Fades = ReturnType<typeof fades>

/** The two maps you move between: the painted sky, and a world. */
export type Level = 'sky' | 'world'

/** On the sky the painting stays put however far you zoom. */
export const levelFades = (level: Level, h: number): Fades =>
  level === 'sky' ? { ...fades(h), sky: 1, planetIn: 0, map: 0 } : fades(h)

/** Ease for camera flights. */
export const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/** Log-space interpolation of the view height, so zooms feel even. */
export const lerpH = (a: number, b: number, t: number) =>
  Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * A centre on one axis so a view of half-size `half` stays inside
 * [lo, hi]; centred if it can't fit.
 */
export const clampAxis = (c: number, half: number, lo: number, hi: number) =>
  hi - lo <= 2 * half
    ? (lo + hi) / 2
    : Math.min(hi - half, Math.max(lo + half, c))

/** A map scaled to MAP_H, in world units. */
export interface WorldMap {
  src: string
  /** Pixel size of the image. */
  width: number
  height: number
}

export const mapScale = (m: WorldMap) => MAP_H / m.height
export const mapSize = (m: WorldMap): [number, number] => [
  m.width * mapScale(m),
  MAP_H,
]
/** Map pixel -> world (y up, origin at the map's centre). */
export const mapPoint = (
  m: WorldMap,
  [x, y]: readonly [number, number],
): [number, number] => {
  const s = mapScale(m)
  return [(x - m.width / 2) * s, (m.height / 2 - y) * s]
}
