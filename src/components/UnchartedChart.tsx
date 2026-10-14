import type { ShownSystem } from '../data/reveal'
import { ChartDefs, GoldFrame, GoldStar, InkLabel } from './chart'
import {
  DEFAULT_PALETTE,
  GOLD,
  INK_DARK,
  ringHalfWidth,
  seededRandom,
} from './chartTheme'
import { PlanetMarker } from './SystemChart'

// A wide oval cartouche rather than the portrait system charts: there is no
// sun or orbits, and every world sits alone in its own pocket of space.
const WIDTH = 1600
const HEIGHT = 1000
const TITLE_RING = 58
const PLANET_RADIUS = 36
const LABEL_SIZE = 40
/** Pale ink so the pockets read against the dark space wash. */
const POCKET_INK = '#dce8ef'
const cx = WIDTH / 2
const cy = HEIGHT / 2
/** Inner edge of the title ring; the painted space fills this oval. */
const outer = { rx: cx - 40 - TITLE_RING, ry: cy - 40 - TITLE_RING }
/** Middle of the dark title ring. */
const ring = { rx: outer.rx + TITLE_RING / 2, ry: outer.ry + TITLE_RING / 2 }

/** A wave across the page; names sit to the left of each world. */
const SLOTS = [
  { x: 330, y: 470 },
  { x: 720, y: 330 },
  { x: 640, y: 680 },
  { x: 1090, y: 560 },
  { x: 1330, y: 370 },
]

const onOval = (rx: number, ry: number, t: number) =>
  [cx + rx * Math.cos(t), cy + ry * Math.sin(t)] as const

/** Left-to-right half of an oval: over the top, or under the bottom. */
const ovalArc = (rx: number, ry: number, top: boolean) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 ${top ? 1 : 0} ${cx + rx} ${cy}`

const backgroundStars = (() => {
  const random = seededRandom(1987)
  return Array.from({ length: 360 }, () => {
    const t = random() * Math.PI * 2
    const d = Math.sqrt(random()) * 0.97
    const [x, y] = onOval(outer.rx * d, outer.ry * d, t)
    return { x, y, r: 0.6 + random() * 1.5, opacity: 0.2 + random() * 0.6 }
  })
})()

export function UnchartedChart({ system }: { system: ShownSystem }) {
  const palette = system.palette ?? DEFAULT_PALETTE
  // Gold stars evenly round the ring, leaving room for the title.
  const titleHalf = (system.name.length * 11 + 90) / ring.rx
  const starAngles = Array.from(
    { length: 18 },
    (_, i) => -Math.PI / 2 + (i * Math.PI * 2) / 18,
  ).filter((t) => Math.abs(t + Math.PI / 2) > titleHalf)

  const placed = system.planets.map((planet, i) => {
    const slot = SLOTS[i % SLOTS.length]
    const r = PLANET_RADIUS * (planet.size ?? 1)
    const reach = Math.max(
      r,
      planet.rings ? ringHalfWidth(r, planet.ringTilt) : 0,
      planet.moonRing ? r + (16 + 8) * (r / 24) : 0,
    )
    return { planet, ...slot, r, pocket: reach + 46 }
  })

  return (
    <svg
      className="chart system-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-label={`Chart of the ${system.name}`}
    >
      <ChartDefs />
      <defs>
        <radialGradient id="space-wash">
          {palette.wash.map((color, i) => (
            <stop key={i} offset={[0, 0.35, 0.7, 1][i]} stopColor={color} />
          ))}
        </radialGradient>
        <radialGradient id="pocket-light">
          <stop offset="0" stopColor="#f4f8fa" stopOpacity={0.3} />
          <stop offset="0.7" stopColor="#f4f8fa" stopOpacity={0.12} />
          <stop offset="1" stopColor="#f4f8fa" stopOpacity={0.04} />
        </radialGradient>
        <clipPath id="chart-clip">
          <rect x={18} y={18} width={WIDTH - 36} height={HEIGHT - 36} />
        </clipPath>
        <path id="title-arc" d={ovalArc(ring.rx, ring.ry, true)} />
        <path
          id="uncharted-caption"
          d={ovalArc(outer.rx - 50, outer.ry - 50, false)}
        />
        {placed.map(({ planet, x, y }) => (
          <path
            key={planet.id}
            id={`label-line-${planet.id}`}
            d={`M ${x - 600} ${y} L ${x + 600} ${y}`}
          />
        ))}
      </defs>

      <g clipPath="url(#chart-clip)">
        <rect width={WIDTH} height={HEIGHT} fill={palette.sky} />
        <ellipse cx={cx} cy={cy} {...outer} fill="url(#space-wash)" />
        <g pointerEvents="none">
          {backgroundStars.map((star, i) => (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="#e9f3f7"
              opacity={star.opacity}
            />
          ))}
        </g>

        {/* Each world's own pocket of space: a lit wash inside an inked edge. */}
        {placed.map(({ planet, x, y, pocket }) => (
          <g key={planet.id} pointerEvents="none">
            <circle cx={x} cy={y} r={pocket} fill="url(#pocket-light)" />
            <circle
              cx={x}
              cy={y}
              r={pocket}
              fill="none"
              stroke={POCKET_INK}
              strokeOpacity={0.55}
              strokeWidth={1.5}
            />
            <circle
              cx={x}
              cy={y}
              r={pocket + 7}
              fill="none"
              stroke={POCKET_INK}
              strokeOpacity={0.6}
              strokeWidth={1}
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
          </g>
        ))}

        <g pointerEvents="none">
          <ellipse
            cx={cx}
            cy={cy}
            {...ring}
            fill="none"
            stroke={palette.ring}
            strokeWidth={TITLE_RING}
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={outer.rx + TITLE_RING}
            ry={outer.ry + TITLE_RING}
            fill="none"
            stroke={GOLD}
            strokeWidth={2.5}
          />
        </g>
        {starAngles.map((t) => {
          const [x, y] = onOval(ring.rx, ring.ry, t)
          return <GoldStar key={t} x={x} y={y} size={11} />
        })}

        <rect
          width={WIDTH}
          height={HEIGHT}
          filter="url(#paint-texture)"
          opacity={0.5}
          pointerEvents="none"
        />
        <rect
          width={WIDTH}
          height={HEIGHT}
          filter="url(#grain)"
          pointerEvents="none"
        />

        <InkLabel
          pathId="uncharted-caption"
          offset="50%"
          anchor="middle"
          color={INK_DARK}
          size={30}
        >
          each world orbits its own unknown star
        </InkLabel>

        {placed.map(({ planet, x, y, r }) => (
          <PlanetMarker
            key={planet.id}
            planet={planet}
            systemId={system.id}
            cx={x}
            cy={y}
            radius={r}
            labelSize={LABEL_SIZE}
            pathId={`label-line-${planet.id}`}
            arcPos={600}
          />
        ))}

        <text className="chart-title" fill={GOLD} fontSize={44} dy="0.32em">
          <textPath href="#title-arc" startOffset="50%" textAnchor="middle">
            The {system.name}
          </textPath>
        </text>
      </g>

      <GoldFrame width={WIDTH} height={HEIGHT} />
    </svg>
  )
}
