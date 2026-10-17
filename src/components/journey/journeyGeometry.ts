import type { MapPoint } from '../../data/journey'
import type { MapBox } from './MapEngine'

interface Stop {
  mapId: string
  path: readonly MapPoint[]
}

/**
 * Each stop's track: the way from the last placed stop before it on the
 * same map (its last point) along the stop's own path. A stop on a
 * different map starts afresh; one with no place yet has no track. Hidden
 * stops are already gone, so the line joins what's shown.
 */
export function tracks(stops: readonly Stop[]): MapPoint[][] {
  let prev: Stop | undefined
  return stops.map((stop) => {
    if (!stop.path.length) return []
    const from = prev?.mapId === stop.mapId ? prev.path.at(-1) : undefined
    prev = stop
    return from ? [from, ...stop.path] : [...stop.path]
  })
}

/**
 * The box around some points, grown to at least `minSize` each way (so a
 * stay doesn't zoom in on one pixel), centred on them.
 */
export function boundsOf(points: readonly MapPoint[], minSize: number): MapBox {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const [x0, x1, y0, y1] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  const width = Math.max(x1 - x0, minSize)
  const height = Math.max(y1 - y0, minSize)
  return {
    x: (x0 + x1) / 2 - width / 2,
    y: (y0 + y1) / 2 - height / 2,
    width,
    height,
  }
}

/** SVG path data through the points. */
export const pathData = (points: readonly MapPoint[]) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
