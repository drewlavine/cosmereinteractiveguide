import type { StarSystem } from '../data/types'
import { ChartDefs, GoldFrame, GoldStar, InkLabel } from './chart'
import {
  DEFAULT_PALETTE,
  GOLD,
  INK_DARK,
  arcPath,
  polar,
  ringHalfWidth,
  seededRandom,
} from './chartTheme'
import { PlanetMarker } from './SystemChart'

// Same page and title ring as the centered system charts, but with no sun or
// orbits: every world sits alone in its own pocket of space.
const WIDTH = 1000
const HEIGHT = 1574
const TITLE_RING = 58
const PLANET_RADIUS = 36
const LABEL_SIZE = 40
/** Pale ink so the pockets read against the dark space wash. */
const POCKET_INK = '#dce8ef'
const cx = WIDTH / 2
const cy = HEIGHT / 2
const outerRadius = cy - TITLE_RING - 30
/** Middle of the dark title ring. */
const ringRadius = outerRadius + TITLE_RING / 2

/** Zigzag down the page; names sit to the left, so the right column gets the long ones. */
const SLOTS = [
  { x: 330, y: 330 },
  { x: 700, y: 560 },
  { x: 330, y: 790 },
  { x: 700, y: 1030 },
  { x: 330, y: 1260 },
]

const backgroundStars = (() => {
  const random = seededRandom(1987)
  return Array.from({ length: 260 }, () => {
    const angle = random() * Math.PI * 2
    const dist = Math.sqrt(random()) * (outerRadius - 10)
    const [x, y] = polar(cx, cy, dist, angle)
    return { x, y, r: 0.6 + random() * 1.5, opacity: 0.2 + random() * 0.6 }
  })
})()

export function UnchartedChart({ system }: { system: StarSystem }) {
  const palette = system.palette ?? DEFAULT_PALETTE
  const visible = Math.asin((WIDTH / 2 - 40) / ringRadius)
  const titleAngle = (system.name.length * 11 + 70) / ringRadius
  const starAngles = [
    ...[-1, 1].flatMap((side) =>
      [0, 0.5, 1].map(
        (t) => side * (titleAngle + t * (visible - titleAngle)) - Math.PI / 2,
      ),
    ),
    ...[-1, -0.6, -0.2, 0.2, 0.6, 1].map((t) => Math.PI / 2 + t * visible),
  ]
  const captionR = outerRadius - 70

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
        <radialGradient
          id="space-wash"
          gradientUnits="userSpaceOnUse"
          cx={cx}
          cy={cy}
          r={outerRadius}
        >
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
        <path id="title-arc" d={arcPath(cx, cy, ringRadius)} />
        <path
          id="uncharted-caption"
          d={`M ${cx - captionR} ${cy} A ${captionR} ${captionR} 0 0 0 ${cx + captionR} ${cy}`}
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
        <circle cx={cx} cy={cy} r={outerRadius} fill="url(#space-wash)" />
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

        <circle
          cx={cx}
          cy={cy}
          r={ringRadius}
          fill="none"
          stroke={palette.ring}
          strokeWidth={TITLE_RING}
          pointerEvents="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + TITLE_RING}
          fill="none"
          stroke={GOLD}
          strokeWidth={2.5}
          pointerEvents="none"
        />
        {starAngles.map((angle) => {
          const [x, y] = polar(cx, cy, ringRadius, angle)
          return <GoldStar key={angle} x={x} y={y} size={11} />
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
