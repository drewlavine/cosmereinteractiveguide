/** PanZoom's geometry, kept apart so the component file exports only it. */

export interface Transform {
  x: number
  y: number
  scale: number
}

export const MIN_SCALE = 0.5
export const MAX_SCALE = 8

export const clampScale = (s: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

/**
 * How far the view may zoom out: a picture map until it fills the viewport
 * ('cover'), a chart until all of it is in view ('contain').
 */
export type Fill = 'cover' | 'contain'

/** What bounds a view: the viewport, and the map's area in content pixels. */
export interface Bounds {
  viewport: { width: number; height: number }
  area: ContentRect
  fill: Fill
}

/** The zoom range: out until the map fills (or fits) the view, in from there. */
export function scaleRange({ viewport, area, fill }: Bounds): [number, number] {
  const sx = viewport.width / area.width
  const sy = viewport.height / area.height
  // A chart may stay at its laid-out size, with its margin, too.
  const min = fill === 'cover' ? Math.max(sx, sy) : Math.min(1, sx, sy)
  return [min, MAX_SCALE * Math.max(1, min)]
}

/**
 * The transform zoomed into range, with the map covering the viewport
 * wherever it's big enough to, and centred where it isn't.
 */
export function clampTransform(t: Transform, bounds: Bounds): Transform {
  const [min, max] = scaleRange(bounds)
  const scale = Math.min(max, Math.max(min, t.scale))
  const { viewport, area } = bounds
  const keep = (offset: number, view: number, start: number, size: number) => {
    const scaled = size * scale
    if (scaled <= view) return (view - scaled) / 2 - start * scale
    return Math.min(
      0 - start * scale,
      Math.max(view - (start + size) * scale, offset),
    )
  }
  return {
    scale,
    x: keep(t.x, viewport.width, area.x, area.width),
    y: keep(t.y, viewport.height, area.y, area.height),
  }
}

/** The view a map opens on: a picture all the way out and centred; a chart as laid out. */
export function homeTransform(bounds: Bounds): Transform {
  if (bounds.fill === 'contain')
    return clampTransform({ scale: 1, x: 0, y: 0 }, bounds)
  const [scale] = scaleRange(bounds)
  const { viewport, area } = bounds
  return clampTransform(
    {
      scale,
      x: viewport.width / 2 - (area.x + area.width / 2) * scale,
      y: viewport.height / 2 - (area.y + area.height / 2) * scale,
    },
    bounds,
  )
}

/** Zooms to `scale`, keeping the viewport point (px, py) still. */
export function zoomAround(
  t: Transform,
  scale: number,
  px: number,
  py: number,
): Transform {
  const k = scale / t.scale
  return { scale, x: px - (px - t.x) * k, y: py - (py - t.y) * k }
}

/** A box in the content's own (unscaled) pixels. */
export interface ContentRect {
  x: number
  y: number
  width: number
  height: number
}

export interface FlyOptions {
  /** Glide there (default) or jump, e.g. for reduced motion. */
  animate?: boolean
  /** Don't zoom in further than this. */
  maxScale?: number
  /** Space to leave around the box, in viewport pixels. */
  padding?: number
  /**
   * Viewport pixels covered at each edge (e.g. by panels over the view): the
   * box is centred in what's left. The zoom still fits the whole viewport,
   * so a big panel doesn't zoom the view out.
   */
  inset?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  /**
   * The content's size: if given, the view stays on it, zoomed in enough
   * to leave no empty margin.
   */
  content?: { width: number; height: number }
}

/**
 * The transform that centres `rect` in a viewport of the given size, zoomed
 * to fit it (within `maxScale` and the zoom limits).
 */
export function fitTransform(
  rect: ContentRect,
  viewport: { width: number; height: number },
  { maxScale = MAX_SCALE, padding = 24, content, inset = {} }: FlyOptions = {},
): Transform {
  const { top = 0, right = 0, bottom = 0, left = 0 } = inset
  const freeW = Math.max(1, viewport.width - left - right)
  const freeH = Math.max(1, viewport.height - top - bottom)
  const w = Math.max(1, viewport.width - 2 * padding)
  const h = Math.max(1, viewport.height - 2 * padding)
  let scale = clampScale(
    Math.min(
      maxScale,
      w / Math.max(rect.width, 1e-6),
      h / Math.max(rect.height, 1e-6),
    ),
  )
  // Zoom in enough that the content covers the viewport, leaving no gaps.
  if (content)
    scale = Math.max(
      scale,
      clampScale(
        Math.max(
          viewport.width / content.width,
          viewport.height / content.height,
        ),
      ),
    )
  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2
  const keep = (offset: number, view: number, size?: number) => {
    if (size === undefined) return offset
    const scaled = size * scale
    // Too small to fill the view: centre it; else no gap at either edge.
    if (scaled <= view) return (view - scaled) / 2
    return Math.min(0, Math.max(view - scaled, offset))
  }
  return {
    scale,
    x: keep(left + freeW / 2 - cx * scale, viewport.width, content?.width),
    y: keep(top + freeH / 2 - cy * scale, viewport.height, content?.height),
  }
}
