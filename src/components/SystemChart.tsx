import type { ChartPalette, Planet, StarSystem } from '../data/types'
import { ChartDefs, GoldFrame, GoldStar, SvgLink } from './chart'
import {
  DEFAULT_PALETTE,
  GOLD,
  INK_DARK,
  INK_RED,
  seededRandom,
} from './chartTheme'

// Chart geometry, in SVG user units. The sun sits at the bottom edge and the
// orbits arc over it, as on the in-world star charts. Systems with few orbits
// get wider spacing so every chart keeps a similar portrait shape.
const WIDTH = 1000
const FIRST_ORBIT = 250
const MIN_SPACING = 82
const TARGET_SPAN = 850
const TITLE_SPACE = 125
const TITLE_RING = 58
const BASE_PLANET_RADIUS = 24
const MAX_PLANET_RADIUS = 30

interface Geometry {
  spacing: number
  band: number
  planetRadius: number
  orbitRadius: (orbit: number) => number
}

function geometry(maxOrbit: number): Geometry {
  const spacing =
    maxOrbit > 1
      ? Math.max(MIN_SPACING, TARGET_SPAN / (maxOrbit - 1))
      : MIN_SPACING
  return {
    spacing,
    band: spacing * 0.42,
    planetRadius: Math.min(
      MAX_PLANET_RADIUS,
      BASE_PLANET_RADIUS * Math.sqrt(spacing / MIN_SPACING),
    ),
    orbitRadius: (orbit) => FIRST_ORBIT + (orbit - 1) * spacing,
  }
}

/** Arc over the top of the sun, drawn left to right (for text paths). */
const arcPath = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

const polar = (cx: number, cy: number, r: number, angle: number) =>
  [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const

export function SystemChart({ system }: { system: StarSystem }) {
  const palette = system.palette ?? DEFAULT_PALETTE
  const maxOrbit = Math.max(
    1,
    ...system.planets.map((p) => p.orbit),
    system.asteroidBelt?.orbit ?? 0,
    system.cometBelt?.orbit ?? 0,
  )
  const geo = geometry(maxOrbit)
  const outerRadius = geo.orbitRadius(maxOrbit) + geo.spacing / 2 + 6
  const height = outerRadius + TITLE_SPACE
  const cx = WIDTH / 2
  const cy = height
  const orbits = Array.from({ length: maxOrbit }, (_, i) => i + 1)
  const arcId = (orbit: number) => `orbit-arc-${system.id}-${orbit}`

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
        <clipPath id="chart-clip">
          <rect x={18} y={18} width={WIDTH - 36} height={height - 36} />
        </clipPath>
        <path
          id="title-arc"
          d={arcPath(cx, cy, outerRadius + TITLE_RING / 2)}
        />
        {orbits.map((orbit) => (
          <path
            key={orbit}
            id={arcId(orbit)}
            d={arcPath(cx, cy, geo.orbitRadius(orbit))}
          />
        ))}
      </defs>

      <g clipPath="url(#chart-clip)">
        {/* Pale sky above the outermost ring, painted space below it. */}
        <rect width={WIDTH} height={height} fill={palette.sky} />
        <circle cx={cx} cy={cy} r={outerRadius} fill="url(#space-wash)" />

        {orbits.map((orbit) => {
          const r = geo.orbitRadius(orbit)
          if (system.asteroidBelt?.orbit === orbit)
            return (
              <AsteroidBelt
                key={orbit}
                cx={cx}
                cy={cy}
                r={r}
                band={geo.band}
                belt={palette.belt}
              />
            )
          if (system.cometBelt?.orbit === orbit)
            return (
              <CometBelt key={orbit} cx={cx} cy={cy} r={r} band={geo.band} />
            )
          return (
            <OrbitBand
              key={orbit}
              cx={cx}
              cy={cy}
              r={r}
              geo={geo}
              fill={palette.band}
            />
          )
        })}

        {/* Dark border ring carrying the title, with gold stars. */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + TITLE_RING / 2}
          fill="none"
          stroke="#2d4352"
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
        {[-1, 1].flatMap((side) => {
          // Three stars each side of the title, across the visible ring.
          const r = outerRadius + TITLE_RING / 2
          const visible = Math.asin(Math.min(1, (WIDTH / 2 - 40) / r))
          const title = (system.name.length * 11 + 70) / r
          return [0, 0.5, 1].map((t) => {
            const angle = title + t * (visible - title)
            const [x, y] = polar(cx, cy, r, side * angle - Math.PI / 2)
            return <GoldStar key={`${side}${t}`} x={x} y={y} size={11} />
          })
        })}

        <Sun cx={cx} cy={cy} sun={palette.sun} />

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

        {system.planets.map((planet) => (
          <PlanetMarker
            key={planet.id}
            planet={planet}
            systemId={system.id}
            cx={cx}
            cy={cy - geo.orbitRadius(planet.orbit)}
            radius={geo.planetRadius * (planet.size ?? 1)}
            pathId={arcId(planet.orbit)}
            arcLength={(Math.PI * geo.orbitRadius(planet.orbit)) / 2}
          />
        ))}

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
  geo,
  fill,
}: {
  cx: number
  cy: number
  r: number
  geo: Geometry
  fill: string
}) {
  return (
    <g fill="none" pointerEvents="none">
      <circle cx={cx} cy={cy} r={r} stroke={fill} strokeWidth={geo.band} />
      <circle
        cx={cx}
        cy={cy}
        r={r - geo.band / 2}
        stroke={INK_DARK}
        strokeWidth={2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r + geo.band / 2}
        stroke={INK_DARK}
        strokeWidth={2}
      />
      {/* Thin guide line between bands. */}
      <circle
        cx={cx}
        cy={cy}
        r={r + geo.spacing / 2}
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
}: {
  cx: number
  cy: number
  r: number
  band: number
  belt: ChartPalette['belt']
}) {
  const random = seededRandom(Math.round(r))
  const rocks = Array.from({ length: Math.round((r * band) / 20) }, () => {
    // Only the upper half is ever visible on the chart.
    const [x, y] = polar(
      cx,
      cy,
      r + (random() - 0.5) * (band + 18),
      Math.PI + random() * Math.PI,
    )
    return {
      x,
      y,
      rx: 3 + random() * 6,
      ry: 2.5 + random() * 4,
      rotate: random() * 180,
      fill: belt.rocks[Math.floor(random() * belt.rocks.length)],
    }
  })
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
      {rocks.map((rock, i) => (
        <ellipse
          key={i}
          cx={rock.x}
          cy={rock.y}
          rx={rock.rx}
          ry={rock.ry}
          transform={`rotate(${rock.rotate} ${rock.x} ${rock.y})`}
          fill={rock.fill}
          stroke={belt.rockStroke}
          strokeWidth={0.8}
        />
      ))}
    </g>
  )
}

function CometBelt({
  cx,
  cy,
  r,
  band,
}: {
  cx: number
  cy: number
  r: number
  band: number
}) {
  // Wavy inner edge, as drawn on the Selish chart.
  const waves = Math.round(r / 22)
  const inner = r - band / 2
  const points = Array.from({ length: 721 }, (_, i) => {
    const angle = Math.PI + (i / 720) * Math.PI
    return polar(cx, cy, inner + 7 * Math.sin(angle * waves), angle).join(',')
  })
  return (
    <g fill="none" pointerEvents="none">
      <circle
        cx={cx}
        cy={cy}
        r={r + 4}
        stroke="rgba(18, 34, 44, 0.45)"
        strokeWidth={band + 8}
      />
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

function Sun({
  cx,
  cy,
  sun,
}: {
  cx: number
  cy: number
  sun: ChartPalette['sun']
}) {
  const inner = 92
  const count = sun.style === 'flame' ? 24 : 28
  const rays = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    const long = i % 2 === 0
    const pt = (rad: number, angle: number) =>
      polar(cx, cy, rad, angle).join(',')
    if (sun.style === 'flame') {
      // Curved, flame-like blades that curl in one direction.
      const len = long ? 112 : 80
      const half = long ? 0.13 : 0.11
      const curl = long ? 0.42 : 0.34
      const tip = pt(inner + len, a + curl)
      return `M ${pt(inner - 4, a - half)} C ${pt(inner + len * 0.45, a - half * 0.6)} ${pt(inner + len * 0.85, a + curl * 0.35)} ${tip} C ${pt(inner + len * 0.6, a + curl * 0.75)} ${pt(inner + len * 0.3, a + half * 1.1)} ${pt(inner - 4, a + half)} Z`
    }
    const half = long ? 0.07 : 0.09
    return `M ${pt(inner, a - half)} L ${pt(inner + (long ? 105 : 55), a)} L ${pt(inner, a + half)} Z`
  })
  return (
    <g pointerEvents="none">
      <circle
        cx={cx}
        cy={cy}
        r={205}
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
                strokeWidth={1.5}
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
        strokeWidth={1.5}
      />
    </g>
  )
}

function InkLabel({
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

const RING_TILT = 12

function PlanetMarker({
  planet,
  systemId,
  cx,
  cy,
  radius: r,
  pathId,
  arcLength,
}: {
  planet: Planet
  systemId: string
  cx: number
  cy: number
  radius: number
  pathId: string
  arcLength: number
}) {
  const gradientId = `planet-shade-${planet.id}`
  const named = planet.moons.filter((m) => m.name)
  const unnamed = planet.moons.filter((m) => !m.name)
  const ring = { rx: r * 1.75, ry: r * 0.42 }
  // How far decorations reach from the planet's centre, so labels clear them.
  const extent = Math.max(
    r + 4,
    planet.rings ? ring.rx : 0,
    unnamed.length ? r + 28 : 0,
    named.length ? r + 22 + (named.length - 1) * 12 : 0,
  )
  const label = planet.altName
    ? `${planet.name} / ${planet.altName}`
    : planet.name

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
      </defs>

      <InkLabel
        pathId={pathId}
        offset={arcLength - extent - 18}
        anchor="end"
        color={planet.dwarf ? INK_DARK : INK_RED}
        size={planet.dwarf ? 32 : 40}
      >
        {planet.dwarf ? label.toLowerCase() : label}
      </InkLabel>

      {named.map((moon, i) => {
        const rx = r + 22 + i * 12
        const ry = r + 10 + i * 6
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
              r={5}
              fill={moon.color}
              stroke={INK_DARK}
              strokeWidth={1}
            />
            <text
              className="moon-label"
              x={mx + 9}
              y={my + 6}
              fontSize={20}
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
        x={cx + extent + 16 + (named.length ? 44 : 0)}
        y={cy + 6}
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
