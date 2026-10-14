import type { ChartPalette, OrbitNote, Planet, StarSystem } from '../data/types'
import { ChartDefs, GoldFrame, GoldStar, InkLabel, SvgLink } from './chart'
import {
  DEFAULT_PALETTE,
  GOLD,
  INK_BLUE,
  INK_DARK,
  INK_RED,
  arcPath,
  polar,
  seededRandom,
} from './chartTheme'

// Chart geometry, in SVG user units. By default the sun sits at the bottom
// edge and the orbits arc over it; "centered" systems put the sun mid-page with
// full orbits. Systems with few orbits get wider spacing so every chart keeps a
// similar portrait shape.
const WIDTH = 1000
const CENTERED_HEIGHT = 1574
const FIRST_ORBIT = 250
const MIN_SPACING = 82
/** A lone orbit gets a wide band and room above it. */
const SINGLE_ORBIT_SPACING = 170
const TARGET_SPAN = 850
const TITLE_SPACE = 125
const TITLE_RING = 58
const BASE_PLANET_RADIUS = 24
const MAX_PLANET_RADIUS = 30
const MAX_BAND = 64
/** Most room left between the outermost orbit and the title ring. */
const MAX_EDGE = 90
/** Half the distance between the two planets of a double planet. */
const PAIR_SPREAD = 80

interface Geometry {
  centered: boolean
  height: number
  cx: number
  cy: number
  /** Inner edge of the title ring; the painted space fills this circle. */
  outerRadius: number
  planetRadius: number
  orbitRadius: (orbit: number) => number
  /** Distance to the nearest neighbouring orbit. */
  gap: (orbit: number) => number
  band: (orbit: number) => number
}

function geometry(system: StarSystem, maxOrbit: number): Geometry {
  const layout = system.layout ?? {}
  const spacing =
    maxOrbit > 1
      ? Math.max(MIN_SPACING, TARGET_SPAN / (maxOrbit - 1))
      : SINGLE_ORBIT_SPACING
  const orbitRadius = (orbit: number) =>
    layout.orbitRadii?.[orbit - 1] ?? FIRST_ORBIT + (orbit - 1) * spacing
  const gap = (orbit: number) =>
    Math.min(
      ...[orbit - 1, orbit + 1]
        .filter((n) => n >= 1 && n <= maxOrbit)
        .map((n) => Math.abs(orbitRadius(n) - orbitRadius(orbit))),
      maxOrbit > 1 ? Infinity : spacing,
    )
  const centered = layout.centered ?? false
  const lift = centered ? 0 : (layout.sunLift ?? 0)
  const height = centered
    ? CENTERED_HEIGHT
    : orbitRadius(maxOrbit) +
      Math.min(gap(maxOrbit) / 2, MAX_EDGE) +
      6 +
      TITLE_SPACE +
      lift
  const cy = centered ? (layout.sunY ?? height / 2) : height - lift
  return {
    centered,
    height,
    cx: WIDTH / 2,
    cy,
    outerRadius: centered ? cy - TITLE_RING - 30 : cy - TITLE_SPACE,
    planetRadius: Math.min(
      MAX_PLANET_RADIUS,
      BASE_PLANET_RADIUS * Math.sqrt(spacing / MIN_SPACING),
    ),
    orbitRadius,
    gap,
    band: (orbit) => Math.min(MAX_BAND, gap(orbit) * 0.42),
  }
}

export function SystemChart({ system }: { system: StarSystem }) {
  const palette = system.palette ?? DEFAULT_PALETTE
  const maxOrbit = Math.max(
    1,
    ...system.planets.map((p) => p.orbit),
    system.asteroidBelt?.orbit ?? 0,
    system.cometBelt?.orbit ?? 0,
  )
  const geo = geometry(system, maxOrbit)
  const { cx, cy, height, outerRadius } = geo
  const ringRadius = outerRadius + TITLE_RING / 2
  const orbits = Array.from({ length: maxOrbit }, (_, i) => i + 1)
  const arcId = (orbit: number) => `orbit-arc-${system.id}-${orbit}`

  // Gold stars: three each side of the title, across the visible ring, and a
  // mirrored row along the bottom when the whole ring is on the page.
  const visible = Math.asin(Math.min(1, (WIDTH / 2 - 40) / ringRadius))
  const titleAngle = (system.name.length * 11 + 70) / ringRadius
  const starAngles = [-1, 1].flatMap((side) =>
    [0, 0.5, 1].map(
      (t) => side * (titleAngle + t * (visible - titleAngle)) - Math.PI / 2,
    ),
  )
  if (geo.centered && cy + ringRadius < height)
    starAngles.push(
      ...[-1, -0.6, -0.2, 0.2, 0.6, 1].map((t) => Math.PI / 2 + t * visible),
    )

  return (
    <svg
      className="chart system-chart"
      viewBox={`0 0 ${WIDTH} ${height}`}
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
        <radialGradient id="mark-shade" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="0.4" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#0b1218" stopOpacity={0.7} />
        </radialGradient>
        <radialGradient id="mark-haze">
          <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="0.6" stopColor="#f2f4f2" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <clipPath id="chart-clip">
          <rect x={18} y={18} width={WIDTH - 36} height={height - 36} />
        </clipPath>
        <path id="title-arc" d={arcPath(cx, cy, ringRadius)} />
        {orbits.map((orbit) => (
          <path
            key={orbit}
            id={arcId(orbit)}
            d={arcPath(cx, cy, geo.orbitRadius(orbit))}
          />
        ))}
      </defs>

      <g clipPath="url(#chart-clip)">
        {/* Pale sky outside the title ring, painted space inside it. */}
        <rect width={WIDTH} height={height} fill={palette.sky} />
        <circle cx={cx} cy={cy} r={outerRadius} fill="url(#space-wash)" />

        {orbits.map((orbit) => {
          const r = geo.orbitRadius(orbit)
          const band = geo.band(orbit)
          if (system.asteroidBelt?.orbit === orbit)
            return (
              <AsteroidBelt
                key={orbit}
                cx={cx}
                cy={cy}
                r={r}
                band={band}
                belt={palette.belt ?? DEFAULT_PALETTE.belt!}
                fullCircle={geo.centered}
              />
            )
          if (system.cometBelt?.orbit === orbit)
            return (
              <CometBelt
                key={orbit}
                cx={cx}
                cy={cy}
                r={r}
                band={band}
                comets={palette.comets}
                fullCircle={geo.centered}
              />
            )
          return (
            <OrbitBand
              key={orbit}
              cx={cx}
              cy={cy}
              r={r}
              band={band}
              guide={r + Math.min(geo.gap(orbit) / 2, band * 1.2)}
              fill={palette.band}
            />
          )
        })}

        {/* Dark border ring carrying the title, with gold stars. */}
        <circle
          cx={cx}
          cy={cy}
          r={ringRadius}
          fill="none"
          stroke={palette.ring}
          strokeWidth={TITLE_RING}
        />
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + TITLE_RING}
          fill="none"
          stroke={GOLD}
          strokeWidth={2.5}
        />
        {starAngles.map((angle) => {
          const [x, y] = polar(cx, cy, ringRadius, angle)
          return <GoldStar key={angle} x={x} y={y} size={11} />
        })}

        <Sun
          cx={cx}
          cy={cy}
          sun={palette.sun}
          scale={system.layout?.sunScale ?? 1}
        />

        <rect
          width={WIDTH}
          height={height}
          filter="url(#paint-texture)"
          opacity={0.5}
          pointerEvents="none"
        />
        <rect
          width={WIDTH}
          height={height}
          filter="url(#grain)"
          pointerEvents="none"
        />

        {system.asteroidBelt && (
          <InkLabel
            pathId={arcId(system.asteroidBelt.orbit)}
            offset="50%"
            anchor="middle"
            color={INK_DARK}
            size={34}
          >
            asteroid belt
          </InkLabel>
        )}
        {system.cometBelt && (
          <InkLabel
            pathId={arcId(system.cometBelt.orbit)}
            offset="50%"
            anchor="middle"
            color={INK_DARK}
            size={34}
          >
            comet belt
          </InkLabel>
        )}

        {system.orbitNotes?.map((note) => (
          <OrbitNoteMark
            key={`${note.orbit}-${note.left ?? note.right}`}
            note={note}
            cx={cx}
            cy={cy}
            r={geo.orbitRadius(note.orbit)}
            radius={geo.planetRadius * 0.5}
            pathId={arcId(note.orbit)}
            labelSize={Math.min(40, geo.gap(note.orbit) * 0.55)}
          />
        ))}

        {system.markers?.map((marker) => (
          <ChartMark
            key={marker.label}
            cx={cx}
            cy={cy}
            r={geo.orbitRadius(marker.orbit)}
            {...marker}
          />
        ))}

        {/* Double planets: two planets sharing an orbit circle a barycentre. */}
        {orbits.map((orbit) => {
          if (system.planets.filter((p) => p.orbit === orbit).length !== 2)
            return null
          const y = cy - geo.orbitRadius(orbit)
          return (
            <g key={orbit} pointerEvents="none">
              <ellipse
                cx={cx}
                cy={y}
                rx={PAIR_SPREAD}
                ry={PAIR_SPREAD * 0.3}
                fill="none"
                stroke={INK_DARK}
                strokeWidth={1.5}
              />
              <circle cx={cx} cy={y} r={3.5} fill={INK_DARK} />
            </g>
          )
        })}

        {system.planets.map((planet) => {
          const r = geo.orbitRadius(planet.orbit)
          const pair = system.planets.filter((p) => p.orbit === planet.orbit)
          const pairSide =
            pair.length === 2 ? (pair[0] === planet ? -1 : 1) : undefined
          const dx = (pairSide ?? 0) * PAIR_SPREAD
          return (
            <PlanetMarker
              key={planet.id}
              planet={planet}
              systemId={system.id}
              cx={cx + dx}
              cy={cy - r}
              radius={geo.planetRadius * (planet.size ?? 1)}
              labelSize={Math.min(40, geo.gap(planet.orbit) * 0.55)}
              pathId={arcId(planet.orbit)}
              arcPos={(Math.PI * r) / 2 + r * Math.asin(dx / r)}
              pairSide={pairSide}
            />
          )
        })}

        <text className="chart-title" fill={GOLD} fontSize={44} dy="0.32em">
          <textPath href="#title-arc" startOffset="50%" textAnchor="middle">
            The {system.name}
          </textPath>
        </text>
      </g>

      <GoldFrame width={WIDTH} height={height} />
    </svg>
  )
}

function OrbitBand({
  cx,
  cy,
  r,
  band,
  guide,
  fill,
}: {
  cx: number
  cy: number
  r: number
  band: number
  guide: number
  fill: string
}) {
  return (
    <g fill="none" pointerEvents="none">
      <circle cx={cx} cy={cy} r={r} stroke={fill} strokeWidth={band} />
      <circle
        cx={cx}
        cy={cy}
        r={r - band / 2}
        stroke={INK_DARK}
        strokeWidth={2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r + band / 2}
        stroke={INK_DARK}
        strokeWidth={2}
      />
      {/* Thin guide line between bands. */}
      <circle
        cx={cx}
        cy={cy}
        r={guide}
        stroke={INK_DARK}
        strokeOpacity={0.45}
        strokeWidth={1.2}
      />
    </g>
  )
}

function AsteroidBelt({
  cx,
  cy,
  r,
  band,
  belt,
  fullCircle,
}: {
  cx: number
  cy: number
  r: number
  band: number
  belt: NonNullable<ChartPalette['belt']>
  fullCircle: boolean
}) {
  return (
    <g pointerEvents="none">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={belt.fill}
        strokeWidth={band + 22}
      />
      {[-1, 1].map((side) => (
        <circle
          key={side}
          cx={cx}
          cy={cy}
          r={r + side * (band / 2 + 11)}
          fill="none"
          stroke={INK_DARK}
          strokeWidth={2}
        />
      ))}
      <Rocks
        cx={cx}
        cy={cy}
        r={r}
        spread={band + 18}
        count={((fullCircle ? 2 : 1) * r * band) / 20}
        fullCircle={fullCircle}
        colors={belt.rocks}
        stroke={belt.rockStroke}
      />
    </g>
  )
}

/** Scattered rocks across a belt; arc charts only show its upper half. */
function Rocks({
  cx,
  cy,
  r,
  spread,
  count,
  fullCircle,
  colors,
  stroke,
}: {
  cx: number
  cy: number
  r: number
  spread: number
  count: number
  fullCircle: boolean
  colors: string[]
  stroke: string
}) {
  const span = fullCircle ? 2 : 1
  const random = seededRandom(Math.round(r))
  return Array.from({ length: Math.round(count) }, (_, i) => {
    const [x, y] = polar(
      cx,
      cy,
      r + (random() - 0.5) * spread,
      Math.PI + random() * span * Math.PI,
    )
    return (
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx={3 + random() * 6}
        ry={2.5 + random() * 4}
        transform={`rotate(${random() * 180} ${x} ${y})`}
        fill={colors[Math.floor(random() * colors.length)]}
        stroke={stroke}
        strokeWidth={0.8}
      />
    )
  })
}

function CometBelt({
  cx,
  cy,
  r,
  band,
  comets,
  fullCircle,
}: {
  cx: number
  cy: number
  r: number
  band: number
  comets?: ChartPalette['comets']
  fullCircle: boolean
}) {
  // Wavy inner edge, as drawn on the Selish chart.
  const span = fullCircle ? 2 : 1
  const waves = Math.round(r / 22)
  const inner = r - band / 2
  const points = Array.from({ length: 720 * span + 1 }, (_, i) => {
    const angle = Math.PI + (i / 720) * Math.PI
    return polar(cx, cy, inner + 7 * Math.sin(angle * waves), angle).join(',')
  })
  return (
    <g fill="none" pointerEvents="none">
      <circle
        cx={cx}
        cy={cy}
        r={r + 4}
        stroke={comets?.fill ?? 'rgba(18, 34, 44, 0.45)'}
        strokeWidth={band + 8}
      />
      {comets && (
        <Rocks
          cx={cx}
          cy={cy}
          r={r + 6}
          spread={band}
          count={((fullCircle ? 2 : 1) * r * band) / 45}
          fullCircle={fullCircle}
          colors={comets.rocks}
          stroke={comets.rockStroke}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r + band / 4}
        stroke="rgba(230, 238, 242, 0.25)"
        strokeWidth={band / 3}
      />
      <polyline points={points.join(' ')} stroke={INK_DARK} strokeWidth={2} />
      <circle
        cx={cx}
        cy={cy}
        r={r + band / 2 + 8}
        stroke={INK_DARK}
        strokeWidth={2}
      />
    </g>
  )
}

/** Distance along an orbit's text path, right of the top, for side notes. */
const NOTE_GAP = 190

function OrbitNoteMark({
  note,
  cx,
  cy,
  r,
  radius,
  pathId,
  labelSize,
}: {
  note: OrbitNote
  cx: number
  cy: number
  r: number
  radius: number
  pathId: string
  labelSize: number
}) {
  const top = (Math.PI * r) / 2
  const color = note.ink === 'blue' ? INK_BLUE : INK_RED
  return (
    <g>
      {note.left && (
        <InkLabel
          pathId={pathId}
          offset={top - radius - 30}
          anchor="end"
          color={color}
          size={labelSize}
        >
          {note.left}
        </InkLabel>
      )}
      {note.right && (
        <InkLabel
          pathId={pathId}
          offset={top + NOTE_GAP}
          anchor="start"
          color={color}
          size={labelSize}
        >
          {note.right}
        </InkLabel>
      )}
      {note.body && (
        <g className="chart-mark">
          <title>{note.body.title}</title>
          <circle
            cx={cx}
            cy={cy - r}
            r={radius + 4}
            fill="#e9eef0"
            stroke={INK_DARK}
            strokeWidth={2}
          />
          <circle cx={cx} cy={cy - r} r={radius} fill={note.body.color} />
          <circle cx={cx} cy={cy - r} r={radius} fill="url(#mark-shade)" />
        </g>
      )}
    </g>
  )
}

/** A hazy smudge with an inked note, for things that aren't planets. */
function ChartMark({
  cx,
  cy,
  r,
  angle,
  label,
  description,
}: {
  cx: number
  cy: number
  r: number
  angle: number
  label: string
  description: string
}) {
  const [x, y] = polar(cx, cy, r, ((angle - 90) * Math.PI) / 180)
  return (
    <g className="chart-mark">
      <title>{`${label}: ${description}`}</title>
      <circle cx={x} cy={y} r={22} fill="url(#mark-haze)" />
      <text
        className="moon-label"
        x={x + 30}
        y={y - 30}
        fontSize={24}
        fill={INK_DARK}
        stroke="#fff"
        strokeWidth={4}
        strokeOpacity={0.6}
        paintOrder="stroke"
      >
        {label.split(' ').map((word, i) => (
          <tspan key={word} x={x + 30 + i * 8} dy={i ? '1.1em' : 0}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function Sun({
  cx,
  cy,
  sun,
  scale,
}: {
  cx: number
  cy: number
  sun: ChartPalette['sun']
  scale: number
}) {
  const inner = 92 * scale
  const stroke = Math.max(0.8, 1.5 * scale)
  const count = { flame: 24, spiky: 28, thorn: 72 }[sun.style]
  const random = seededRandom(count)
  const rays = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    const long = i % 2 === 0
    const pt = (rad: number, angle: number) =>
      polar(cx, cy, rad, angle).join(',')
    if (sun.style === 'thorn') {
      // Thin, slightly hooked thorns of uneven length, as on the Drominad chart.
      const len = (long ? 72 : 46) * scale * (0.75 + random() * 0.5)
      const half = 0.03
      const hook = (random() - 0.5) * 0.3
      return `M ${pt(inner - 2 * scale, a - half)} Q ${pt(inner + len * 0.55, a - half * 0.2 + hook * 0.4)} ${pt(inner + len, a + hook)} Q ${pt(inner + len * 0.5, a + half * 0.6 + hook * 0.4)} ${pt(inner - 2 * scale, a + half)} Z`
    }
    if (sun.style === 'flame') {
      // Curved, flame-like blades that curl in one direction.
      const len = (long ? 112 : 80) * scale
      const half = long ? 0.13 : 0.11
      const curl = long ? 0.42 : 0.34
      const tip = pt(inner + len, a + curl)
      return `M ${pt(inner - 4 * scale, a - half)} C ${pt(inner + len * 0.45, a - half * 0.6)} ${pt(inner + len * 0.85, a + curl * 0.35)} ${tip} C ${pt(inner + len * 0.6, a + curl * 0.75)} ${pt(inner + len * 0.3, a + half * 1.1)} ${pt(inner - 4 * scale, a + half)} Z`
    }
    const half = long ? 0.07 : 0.09
    return `M ${pt(inner, a - half)} L ${pt(inner + (long ? 105 : 55) * scale, a)} L ${pt(inner, a + half)} Z`
  })
  return (
    <g pointerEvents="none">
      <circle
        cx={cx}
        cy={cy}
        r={205 * scale}
        fill={sun.halo}
        stroke={INK_DARK}
        strokeWidth={2}
      />
      {/* Long rays first so the short ones overlap them. */}
      {[0, 1].map((parity) =>
        rays.map(
          (d, i) =>
            i % 2 === parity && (
              <path
                key={i}
                d={d}
                fill={sun.rays[parity]}
                stroke={sun.ink}
                strokeWidth={stroke}
                strokeLinejoin="round"
              />
            ),
        ),
      )}
      <circle
        cx={cx}
        cy={cy}
        r={inner}
        fill={sun.core}
        stroke={sun.ink}
        strokeWidth={stroke}
      />
    </g>
  )
}

const RING_TILT = 12

function PlanetMarker({
  planet,
  systemId,
  cx,
  cy,
  radius: r,
  labelSize,
  pathId,
  arcPos,
  pairSide,
}: {
  planet: Planet
  systemId: string
  cx: number
  cy: number
  radius: number
  labelSize: number
  pathId: string
  /** Distance along the orbit's text path to the planet. */
  arcPos: number
  /** Which side of a double planet this is; its label goes on that side. */
  pairSide?: -1 | 1
}) {
  const gradientId = `planet-shade-${planet.id}`
  const named = planet.moons.filter((m) => m.name)
  const unnamed = planet.moons.filter((m) => !m.name)
  const ring = { rx: r * 1.75, ry: r * 0.42 }
  // Moon orbits were tuned for a 24-unit planet; scale them with the planet.
  const k = r / BASE_PLANET_RADIUS
  // How far decorations reach from the planet's centre, so labels clear them.
  const extent = Math.max(
    r + 4,
    planet.rings ? ring.rx : 0,
    unnamed.length ? r + 28 : 0,
    named.length ? r + (22 + (named.length - 1) * 12) * k : 0,
  )
  const label =
    planet.chartLabel ??
    (planet.altName ? `${planet.name} / ${planet.altName}` : planet.name)

  return (
    <SvgLink
      to={`/systems/${systemId}/planets/${planet.id}`}
      label={`${planet.name}: view details`}
      className="chart-planet"
    >
      <title>{planet.name}: click for details</title>
      <defs>
        <radialGradient id={gradientId} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="0.35" stopColor={planet.color} />
          <stop offset="1" stopColor="#0b1218" stopOpacity={0.9} />
        </radialGradient>
        {planet.glow && (
          <radialGradient id={`${gradientId}-glow`}>
            <stop offset="0.45" stopColor={planet.glow} stopOpacity={0.85} />
            <stop offset="1" stopColor={planet.glow} stopOpacity={0} />
          </radialGradient>
        )}
      </defs>

      <InkLabel
        pathId={pathId}
        offset={pairSide === 1 ? arcPos + extent + 18 : arcPos - extent - 18}
        anchor={pairSide === 1 ? 'start' : 'end'}
        color={planet.dwarf ? INK_DARK : INK_RED}
        size={planet.dwarf ? labelSize * 0.8 : labelSize}
      >
        {planet.dwarf ? label.toLowerCase() : label}
      </InkLabel>

      {named.map((moon, i) => {
        const rx = r + (22 + i * 12) * k
        const ry = r + (10 + i * 6) * k
        const tilt = -20 + i * 20
        // Keep moons on the right so their labels clear the planet name.
        const angle = ((50 - i * 50) * Math.PI) / 180
        const t = (tilt * Math.PI) / 180
        const px = rx * Math.cos(angle)
        const py = ry * Math.sin(angle)
        const mx = cx + px * Math.cos(t) - py * Math.sin(t)
        const my = cy + px * Math.sin(t) + py * Math.cos(t)
        return (
          <g key={moon.name} pointerEvents="none">
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              transform={`rotate(${tilt} ${cx} ${cy})`}
              fill="none"
              stroke={INK_DARK}
              strokeWidth={1.3}
            />
            <circle
              cx={mx}
              cy={my}
              r={5 * Math.max(k, 0.6)}
              fill={moon.color}
              stroke={INK_DARK}
              strokeWidth={1}
            />
            <text
              className="moon-label"
              x={mx + 9 * Math.max(k, 0.6)}
              y={my + 6 * Math.max(k, 0.7)}
              fontSize={20 * Math.max(k, 0.7)}
              fill={INK_DARK}
              stroke="#fff"
              strokeWidth={4}
              strokeOpacity={0.7}
              paintOrder="stroke"
            >
              {moon.name}
            </text>
          </g>
        )
      })}

      {/* Unnamed moons are scattered dots around the planet, as on the charts. */}
      {unnamed.map((moon, i) => {
        const angle = ((-110 + (360 / unnamed.length) * i) * Math.PI) / 180
        const [mx, my] = polar(cx, cy, r + 14 + (i % 2) * 10, angle)
        return (
          <circle
            key={i}
            cx={mx}
            cy={my}
            r={4.5}
            fill={moon.color}
            stroke={INK_DARK}
            strokeWidth={1}
            pointerEvents="none"
          />
        )
      })}

      {planet.rings && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={ring.rx}
          ry={ring.ry}
          transform={`rotate(${RING_TILT} ${cx} ${cy})`}
          fill="none"
          stroke={INK_DARK}
          strokeWidth={2}
          pointerEvents="none"
        />
      )}

      {planet.glow && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.9}
          fill={`url(#${gradientId}-glow)`}
          pointerEvents="none"
        />
      )}

      <g className="chart-planet-body">
        <circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="#e9eef0"
          stroke={INK_DARK}
          strokeWidth={2}
        />
        <circle cx={cx} cy={cy} r={r} fill={planet.color} />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} />
      </g>

      {/* Front half of the rings passes over the planet. */}
      {planet.rings && (
        <path
          d={`M ${cx - ring.rx} ${cy} A ${ring.rx} ${ring.ry} 0 0 0 ${cx + ring.rx} ${cy}`}
          transform={`rotate(${RING_TILT} ${cx} ${cy})`}
          fill="none"
          stroke={INK_DARK}
          strokeWidth={2}
          pointerEvents="none"
        />
      )}

      <text
        className="chart-planet-hint"
        // Double planets keep the hint below so it never covers the partner.
        x={pairSide ? cx : cx + extent + 16 + (named.length ? 44 * k : 0)}
        y={pairSide ? cy + extent + 28 : cy + 6}
        textAnchor={pairSide ? 'middle' : 'start'}
        fontSize={18}
        fill={INK_DARK}
        stroke="#fff"
        strokeWidth={4}
        paintOrder="stroke"
      >
        Click for details
      </text>
    </SvgLink>
  )
}
