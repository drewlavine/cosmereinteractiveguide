import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

interface Transform {
  x: number
  y: number
  scale: number
}

const MIN_SCALE = 0.5
const MAX_SCALE = 8
const BUTTON_STEP = 1.5
// Pointer movement (px) before a press becomes a pan instead of a click.
const DRAG_THRESHOLD = 4
const IDENTITY: Transform = { x: 0, y: 0, scale: 1 }

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

export function PanZoom({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState(IDENTITY)
  const [animate, setAnimate] = useState(false)
  const [dragging, setDragging] = useState(false)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ moved: 0, suppressClick: false, pinchDistance: 0 })

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setTransform((t) => {
      const scale = clampScale(t.scale * factor)
      const k = scale / t.scale
      return { scale, x: px - (px - t.x) * k, y: py - (py - t.y) * k }
    })
  }, [])

  const zoomFromCenter = (factor: number) => {
    const rect = viewportRef.current!.getBoundingClientRect()
    setAnimate(true)
    zoomAt(factor, rect.width / 2, rect.height / 2)
  }

  // React's onWheel is passive, so preventDefault needs a native listener.
  useEffect(() => {
    const el = viewportRef.current!
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      setAnimate(false)
      zoomAt(
        Math.exp(-e.deltaY * 0.0015),
        e.clientX - rect.left,
        e.clientY - rect.top,
      )
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const pinchState = () => {
    const [a, b] = [...pointers.current.values()]
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      gesture.current = { moved: 0, suppressClick: false, pinchDistance: 0 }
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
      setAnimate(false)
      setTransform((t) => ({
        ...t,
        x: t.x + (after.mid.x - before.mid.x),
        y: t.y + (after.mid.y - before.mid.y),
      }))
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
    setAnimate(false)
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
  }

  const onPointerEnd = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) setDragging(false)
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
          className={`pan-zoom-content${animate ? ' is-animating' : ''}`}
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
          disabled={transform.scale >= MAX_SCALE}
          onClick={() => zoomFromCenter(BUTTON_STEP)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={transform.scale <= MIN_SCALE}
          onClick={() => zoomFromCenter(1 / BUTTON_STEP)}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => {
            setAnimate(true)
            setTransform(IDENTITY)
          }}
        >
          ⟲
        </button>
      </div>
    </div>
  )
}
