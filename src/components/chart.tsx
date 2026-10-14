import type { ReactNode } from 'react'
import { useHref, useLinkClickHandler } from 'react-router'
import { GOLD } from './chartTheme'

/** Shared SVG filters for the hand-painted look. */
export function ChartDefs() {
  return (
    <defs>
      {/* Mottled brush-stroke texture laid over painted areas. */}
      <filter id="paint-texture" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.06"
          numOctaves="4"
          seed="7"
        />
        <feColorMatrix
          values="0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0.55 -0.2"
        />
      </filter>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
        <feColorMatrix
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0.18 0"
        />
      </filter>
      {/* Soft white smudge painted behind labels. */}
      <filter id="smudge" x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>
  )
}

/** Gold border with fine inner ink lines, drawn on top of the chart. */
export function GoldFrame({
  width,
  height,
}: {
  width: number
  height: number
}) {
  return (
    <g pointerEvents="none">
      <rect
        x={9}
        y={9}
        width={width - 18}
        height={height - 18}
        fill="none"
        stroke={GOLD}
        strokeWidth={18}
      />
      <rect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        fill="none"
        stroke="#3b2a12"
        strokeWidth={2}
      />
      <rect
        x={18}
        y={18}
        width={width - 36}
        height={height - 36}
        fill="none"
        stroke="#3b2a12"
        strokeWidth={2}
      />
    </g>
  )
}

/** Six-spoked gold star used as decoration on the charts. */
export function GoldStar({
  x,
  y,
  size = 14,
}: {
  x: number
  y: number
  size?: number
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      stroke={GOLD}
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      {[0, 60, 120].map((deg) => (
        <line
          key={deg}
          x1={0}
          y1={-size}
          x2={0}
          y2={size}
          transform={`rotate(${deg})`}
        />
      ))}
    </g>
  )
}

/** Router-aware link that can live inside an SVG. */
export function SvgLink({
  to,
  label,
  className,
  children,
}: {
  to: string
  label: string
  className?: string
  children: ReactNode
}) {
  const href = useHref(to)
  const handleClick = useLinkClickHandler(to)
  return (
    <a
      href={href}
      role="link"
      aria-label={label}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

/** Hand-lettered label along a path, with a soft white smudge behind it. */
export function InkLabel({
  pathId,
  offset,
  anchor,
  color,
  size,
  children,
}: {
  pathId: string
  offset: number | string
  anchor: 'start' | 'middle' | 'end'
  color: string
  size: number
  children: string
}) {
  const path = (
    <textPath href={`#${pathId}`} startOffset={offset} textAnchor={anchor}>
      {children}
    </textPath>
  )
  return (
    <g className="ink-label" pointerEvents="none">
      <text
        fontSize={size}
        dy="0.32em"
        stroke="#fff"
        strokeWidth={size * 0.5}
        strokeOpacity={0.8}
        fill="#fff"
        filter="url(#smudge)"
      >
        {path}
      </text>
      <text fontSize={size} dy="0.32em" fill={color}>
        {path}
      </text>
    </g>
  )
}
