import type { AtlasMap, MapPoint } from '../../data/journey'
import type { MapBox } from './MapEngine'

/**
 * Each stop's track on one map: the way from the last placed stop before it
 * (its last point) along the stop's own path. `paths[i]` is stop i's points
 * on this map: empty while where it happened is unknown (no track; the line
 * joins the stops either side), undefined when it's on another map (the
 * line breaks there). Hidden stops are already gone.
 */
export function tracks(
  paths: readonly (readonly MapPoint[] | undefined)[],
): MapPoint[][] {
  let prev: MapPoint | undefined
  return paths.map((path) => {
    if (!path) {
      prev = undefined
      return []
    }
    if (!path.length) return []
    const from = prev
    prev = path.at(-1)
    return from ? [from, ...path] : [...path]
  })
}

/**
 * Where map `inner` sits on map `outer`, if `outer` holds it (directly or
 * through maps between): the pin on `outer` that zooms into it.
 */
export function anchorOn(
  maps: readonly AtlasMap[],
  outer: string,
  inner: string,
): MapPoint | undefined {
  const seen = new Set<string>()
  for (let m = maps.find((x) => x.id === inner); m?.parent;) {
    if (seen.has(m.id)) return undefined
    seen.add(m.id)
    if (m.parent.mapId === outer) return m.parent.at
    const up: string = m.parent.mapId
    m = maps.find((x) => x.id === up)
  }
  return undefined
}

/** The outermost map holding `id` (itself when nothing does). */
export function rootOf(maps: readonly AtlasMap[], id: string): string {
  const seen = new Set<string>()
  let m = maps.find((x) => x.id === id)
  while (m?.parent && !seen.has(m.id)) {
    seen.add(m.id)
    const up: string = m.parent.mapId
    const next = maps.find((x) => x.id === up)
    if (!next) break
    m = next
  }
  return m?.id ?? id
}

/**
 * Each stop's points as drawn on map `mapId`: its own path there, or the pin
 * of the inner map (e.g. a city) it happened on; undefined if neither.
 */
export function pathsOn(
  stops: readonly { mapId: string; path: readonly MapPoint[] }[],
  maps: readonly AtlasMap[],
  mapId: string,
): (readonly MapPoint[] | undefined)[] {
  return stops.map((s) => {
    if (s.mapId === mapId) return s.path
    const at = anchorOn(maps, mapId, s.mapId)
    if (!at) return undefined
    return s.path.length ? [at] : []
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
