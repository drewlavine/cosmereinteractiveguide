import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react'
import {
  clampScale,
  clampTransform,
  fitTransform,
  homeTransform,
  MAX_SCALE,
  MIN_SCALE,
  scaleRange,
  zoomAround,
  type Bounds,
  type ContentRect,
  type Fill,
  type FlyOptions,
  type Transform,
} from './fitTransform'

export type { ContentRect, Fill, FlyOptions, Transform } from './fitTransform'

const BUTTON_STEP = 1.5
// Pointer movement (px) before a press becomes a pan instead of a click.
const DRAG_THRESHOLD = 4
// The wheel eases towards its zoom, closing the gap with this time constant.
const WHEEL_EASE_MS = 90
// How quickly a flung map slows down once let go.
const FLING_DECAY_MS = 300
const IDENTITY: Transform = { x: 0, y: 0, scale: 1 }

const reducedMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The map's area in content pixels: the element marked
 * `data-pan-zoom-area`, else the content's first element, narrowed to what
 * an SVG with a viewBox actually draws.
 */
function measure(viewport: HTMLElement, fill: Fill): Bounds | null {
  const content = viewport.firstElementChild as HTMLElement | null
  const el =
    content?.querySelector<Element>('[data-pan-zoom-area]') ??
    content?.firstElementChild
  if (!content || !el || !content.offsetWidth || !viewport.clientWidth)
    return null
  const box = content.getBoundingClientRect()
  // The content's scale as drawn, which mid-transition isn't the state's.
  const drawn = box.width / content.offsetWidth
  const r = el.getBoundingClientRect()
  const area = {
    x: (r.left - box.left) / drawn,
    y: (r.top - box.top) / drawn,
    width: r.width / drawn,
    height: r.height / drawn,
  }
  const viewBox = el instanceof SVGSVGElement ? el.viewBox.baseVal : null
  if (
    viewBox?.width &&
    viewBox.height &&
    el.getAttribute('preserveAspectRatio') !== 'none'
  ) {
    const k = Math.min(area.width / viewBox.width, area.height / viewBox.height)
    const width = viewBox.width * k
    const height = viewBox.height * k
    area.x += (area.width - width) / 2
    area.y += (area.height - height) / 2
    area.width = width
    area.height = height
  }
  if (!area.width || !area.height) return null
  return {
    viewport: { width: viewport.clientWidth, height: viewport.clientHeight },
    area,
    fill,
  }
}

/** What a parent can do to a PanZoom through its `ref`. */
export interface PanZoomHandle {
  /** Pans and zooms so the box fills the viewport, centred. */
  flyTo(rect: ContentRect, options?: FlyOptions): void
  reset(options?: { animate?: boolean }): void
}

/**
 * A pannable, zoomable view. The wheel eases into its zoom and a flung map
 * glides to a stop; the view never zooms out past the map (see `fill`) nor
 * pans off its edges.
 */
export function PanZoom({
  children,
  label,
  ref,
  onTransform,
  fill = 'contain',
}: {
  children: ReactNode
  label: string
  ref?: Ref<PanZoomHandle>
  /** Told the new transform after each change, e.g. to size overlays. */
  onTransform?: (transform: Transform) => void
  /**
   * 'cover' for a picture: zoom out only until it fills the view.
   * 'contain' for a chart: until all of it shows.
   */
  fill?: Fill
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState(IDENTITY)
  const [range, setRange] = useState<[number, number]>([MIN_SCALE, MAX_SCALE])
  // 'zoom': a short ease for the buttons; 'fly': a longer glide for flyTo.
  const [animate, setAnimate] = useState<false | 'zoom' | 'fly'>(false)
  // The transform as last set, for handlers and frames between renders.
  const shown = useRef(IDENTITY)
  // The wheel's zoom still to ease into, and a flung map's velocity (px/ms).
  const glide = useRef<{ scale: number; px: number; py: number } | null>(null)
  const fling = useRef<{ x: number; y: number } | null>(null)
  const frame = useRef({ id: 0, last: 0 })
  // Whether the view has been placed (or flown somewhere) yet.
  const opened = useRef(false)

  useEffect(() => onTransform?.(transform), [transform, onTransform])

  const bounds = useCallback(() => {
    const b = viewportRef.current && measure(viewportRef.current, fill)
    if (b) {
      const next = scaleRange(b)
      setRange((r) => (r[0] === next[0] && r[1] === next[1] ? r : next))
    }
    return b
  }, [fill])

  const settle = useCallback(
    (t: Transform) => {
      const b = bounds()
      return b ? clampTransform(t, b) : { ...t, scale: clampScale(t.scale) }
    },
    [bounds],
  )

  const show = useCallback((t: Transform) => {
    shown.current = t
    setTransform(t)
  }, [])

  const stopGliding = useCallback(() => {
    cancelAnimationFrame(frame.current.id)
    frame.current.id = 0
    glide.current = null
    fling.current = null
  }, [])

  // Eases the wheel's zoom and glides a fling, a frame at a time.
  const startGliding = useCallback(() => {
    if (frame.current.id) return
    const step = (now: number) => {
      const dt = Math.min(64, now - (frame.current.last || now - 16))
      frame.current.last = now
      let t = shown.current
      const g = glide.current
      if (g) {
        // Stay in range, in case the view resized mid-ease.
        const b = bounds()
        const [min, max] = b ? scaleRange(b) : [MIN_SCALE, MAX_SCALE]
        g.scale = Math.min(max, Math.max(min, g.scale))
        const k = 1 - Math.exp(-dt / WHEEL_EASE_MS)
        const done = Math.abs(Math.log(g.scale / t.scale)) < 2e-3
        t = zoomAround(
          t,
          done ? g.scale : t.scale * (g.scale / t.scale) ** k,
          g.px,
          g.py,
        )
        if (done) glide.current = null
      }
      const f = fling.current
      if (f) {
        const moved = { ...t, x: t.x + f.x * dt, y: t.y + f.y * dt }
        t = settle(moved)
        // Stop dead against an edge rather than sliding along it forever.
        const decay = Math.exp(-dt / FLING_DECAY_MS)
        f.x = t.x === moved.x ? f.x * decay : 0
        f.y = t.y === moved.y ? f.y * decay : 0
        if (Math.hypot(f.x, f.y) < 0.02) fling.current = null
      }
      show(settle(t))
      frame.current.id =
        glide.current || fling.current ? requestAnimationFrame(step) : 0
    }
    frame.current.last = 0
    frame.current.id = requestAnimationFrame(step)
  }, [bounds, settle, show])

  useEffect(() => stopGliding, [stopGliding])

  // Open on the whole map, and keep it filling the view as the view resizes.
  // (A ResizeObserver reports before the first paint, so there's no flash.)
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const viewport = viewportRef.current!
    const observer = new ResizeObserver(() => {
      const b = bounds()
      if (!b) return
      show(
        !opened.current && fill === 'cover'
          ? homeTransform(b)
          : settle(shown.current),
      )
      opened.current = true
    })
    observer.observe(viewport)
    const area = viewport.firstElementChild?.firstElementChild
    if (area) observer.observe(area)
    return () => observer.disconnect()
  }, [bounds, settle, show, fill])

  useImperativeHandle(
    ref,
    () => ({
      flyTo(rect, options = {}) {
        const box = viewportRef.current!.getBoundingClientRect()
        stopGliding()
        opened.current = true
        setAnimate(options.animate === false ? false : 'fly')
        show(settle(fitTransform(rect, box, options)))
      },
      reset({ animate = true } = {}) {
        stopGliding()
        opened.current = true
        setAnimate(animate && 'zoom')
        const b = bounds()
        show(b ? homeTransform(b) : IDENTITY)
      },
    }),
    [bounds, settle, show, stopGliding],
  )
  const [dragging, setDragging] = useState(false)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({
    moved: 0,
    suppressClick: false,
    pinchDistance: 0,
    velocity: { x: 0, y: 0 },
    at: 0,
  })

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      const t = shown.current
      const b = bounds()
      const [min, max] = b ? scaleRange(b) : [MIN_SCALE, MAX_SCALE]
      const scale = Math.min(max, Math.max(min, t.scale * factor))
      show(settle(zoomAround(t, scale, px, py)))
    },
    [bounds, settle, show],
  )

  const zoomFromCenter = (factor: number) => {
    const rect = viewportRef.current!.getBoundingClientRect()
    stopGliding()
    setAnimate('zoom')
    zoomAt(factor, rect.width / 2, rect.height / 2)
  }

  // React's onWheel is passive, so preventDefault needs a native listener.
  useEffect(() => {
    const el = viewportRef.current!
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      // Lines or pages (Firefox) as pixels.
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1
      const factor = Math.exp(-e.deltaY * unit * 0.002)
      setAnimate(false)
      fling.current = null
      if (reducedMotion()) return zoomAt(factor, px, py)
      const b = bounds()
      const [min, max] = b ? scaleRange(b) : [MIN_SCALE, MAX_SCALE]
      const from = glide.current?.scale ?? shown.current.scale
      glide.current = {
        scale: Math.min(max, Math.max(min, from * factor)),
        px,
        py,
      }
      startGliding()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [bounds, zoomAt, startGliding])

  const pinchState = () => {
    const [a, b] = [...pointers.current.values()]
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    // A press catches a gliding map.
    stopGliding()
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      gesture.current = {
        moved: 0,
        suppressClick: false,
        pinchDistance: 0,
        velocity: { x: 0, y: 0 },
        at: e.timeStamp,
      }
    } else if (pointers.current.size === 2) {
      gesture.current.pinchDistance = pinchState().distance
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y

    if (pointers.current.size === 2) {
      const before = pinchState()
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const after = pinchState()
      const rect = viewportRef.current!.getBoundingClientRect()
      gesture.current.suppressClick = true
      gesture.current.velocity = { x: 0, y: 0 }
      setAnimate(false)
      const t = shown.current
      shown.current = {
        ...t,
        x: t.x + (after.mid.x - before.mid.x),
        y: t.y + (after.mid.y - before.mid.y),
      }
      zoomAt(
        after.distance / before.distance,
        after.mid.x - rect.left,
        after.mid.y - rect.top,
      )
      return
    }

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    gesture.current.moved += Math.hypot(dx, dy)
    if (gesture.current.moved < DRAG_THRESHOLD) return

    // Capture only once panning starts, so plain clicks still reach links.
    if (!gesture.current.suppressClick) {
      gesture.current.suppressClick = true
      viewportRef.current!.setPointerCapture(e.pointerId)
      setDragging(true)
    }
    // The drag's recent speed, smoothed, to fling the map on release.
    const g = gesture.current
    const dt = Math.max(1, e.timeStamp - g.at)
    g.at = e.timeStamp
    g.velocity = {
      x: 0.7 * (dx / dt) + 0.3 * g.velocity.x,
      y: 0.7 * (dy / dt) + 0.3 * g.velocity.y,
    }
    setAnimate(false)
    const t = shown.current
    show(settle({ ...t, x: t.x + dx, y: t.y + dy }))
  }

  const onPointerEnd = (e: PointerEvent) => {
    const wasPinch = pointers.current.size > 1
    pointers.current.delete(e.pointerId)
    if (pointers.current.size > 0) return
    setDragging(false)
    const g = gesture.current
    // Fling only if still moving when let go, not after a pause.
    if (
      !wasPinch &&
      e.type === 'pointerup' &&
      g.suppressClick &&
      e.timeStamp - g.at < 80 &&
      Math.hypot(g.velocity.x, g.velocity.y) > 0.1 &&
      !reducedMotion()
    ) {
      fling.current = { ...g.velocity }
      startGliding()
    }
  }

  const onClickCapture = (e: MouseEvent) => {
    if (gesture.current.suppressClick) {
      e.preventDefault()
      e.stopPropagation()
      gesture.current.suppressClick = false
    }
  }

  return (
    <div className="pan-zoom">
      <div
        ref={viewportRef}
        className={`pan-zoom-viewport${dragging ? ' is-dragging' : ''}`}
        aria-label={label}
        role="region"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
      >
        <div
          className={`pan-zoom-content${animate ? ' is-animating' : ''}${animate === 'fly' ? ' is-flying' : ''}`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {children}
        </div>
      </div>

      <div className="zoom-controls" role="group" aria-label="Zoom controls">
        <button
          type="button"
          aria-label="Zoom in"
          data-tooltip="Zoom in"
          disabled={transform.scale >= range[1] - 1e-6}
          onClick={() => zoomFromCenter(BUTTON_STEP)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          data-tooltip="Zoom out"
          disabled={transform.scale <= range[0] + 1e-6}
          onClick={() => zoomFromCenter(1 / BUTTON_STEP)}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Reset view"
          data-tooltip="Reset the zoom and position"
          onClick={() => {
            stopGliding()
            setAnimate('zoom')
            const b = bounds()
            show(b ? homeTransform(b) : IDENTITY)
          }}
        >
          ⟲
        </button>
      </div>
    </div>
  )
}
