/** Geometry for framing one place on a map, in the map image's pixels. */
import type { Hotspot } from '../data/maps'

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** The points of an outline's "x,y x,y …" string. */
export const outlinePoints = (points: string) =>
  points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number) as [number, number])

/** The box around every piece of a place; a pin is a zero-size box. */
export function spotsBox(spots: Hotspot[]): Box {
  const xs: number[] = []
  const ys: number[] = []
  for (const s of spots)
    if (s.shape === 'pin') {
      xs.push(s.x)
      ys.push(s.y)
    } else
      for (const [x, y] of outlinePoints(s.points)) {
        xs.push(x)
        ys.push(y)
      }
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

/**
 * The place and its neighbourhood: its box ×2.2 about its centre, and at
 * least a quarter of the map each way.
 */
export function contextBox(b: Box, W: number, H: number): Box {
  const width = Math.max(b.width * 2.2, W * 0.25)
  const height = Math.max(b.height * 2.2, H * 0.25)
  return {
    x: b.x + b.width / 2 - width / 2,
    y: b.y + b.height / 2 - height / 2,
    width,
    height,
  }
}

/**
 * A pin's ring radius in image px, given `px` screen px per image px: just
 * outside the printed city symbol, and at least 9 screen px.
 */
export const ringRadius = (W: number, H: number, px: number) =>
  Math.max(9 / px, (Math.max(W, H) / 110) * 0.3 + 5 / px)
