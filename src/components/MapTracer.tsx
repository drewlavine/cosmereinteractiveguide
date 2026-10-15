import { useState, type MouseEvent } from 'react'

export type Point = [number, number]

const pointList = (points: Point[]) => points.map((p) => p.join(',')).join(' ')

/**
 * Dev-only: catches clicks over a map and records them in image pixels, so
 * new hotspots can be traced by hand.
 */
export function TracerOverlay({
  width,
  height,
  points,
  onAdd,
}: {
  width: number
  height: number
  points: Point[]
  onAdd: (point: Point) => void
}) {
  const onClick = (event: MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget
    const matrix = svg.getScreenCTM()?.inverse()
    if (!matrix) return
    const at = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix,
    )
    onAdd([Math.round(at.x), Math.round(at.y)])
  }
  const r = Math.max(width, height) / 250

  return (
    <svg
      className="map-tracer"
      viewBox={`0 0 ${width} ${height}`}
      onClick={onClick}
    >
      <polygon points={pointList(points)} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </svg>
  )
}

/** Dev-only controls for the tracer, with the traced shape as map data. */
export function TracerToolbar({
  tracing,
  points,
  onToggle,
  onUndo,
  onClear,
}: {
  tracing: boolean
  points: Point[]
  onToggle: () => void
  onUndo: () => void
  onClear: () => void
}) {
  const [copied, setCopied] = useState(false)
  const code =
    points.length === 1
      ? `pin('place-id', ${points[0].join(', ')}),`
      : `area('place-id', '${pointList(points)}'),`

  return (
    <div className="map-tracer-toolbar" role="group" aria-label="Map tracer">
      <button type="button" aria-pressed={tracing} onClick={onToggle}>
        Trace (dev)
      </button>
      {tracing && (
        <>
          <button type="button" onClick={onUndo} disabled={!points.length}>
            Undo
          </button>
          <button type="button" onClick={onClear} disabled={!points.length}>
            Clear
          </button>
          <button
            type="button"
            disabled={!points.length}
            onClick={() => {
              void navigator.clipboard.writeText(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          {points.length > 0 && <code>{code}</code>}
        </>
      )}
    </div>
  )
}
