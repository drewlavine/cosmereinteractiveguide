import type { ShownSystem } from '../data/reveal'
import { ChartDefs, GoldFrame, GoldStar, InkLabel, SvgLink } from './chart'
import {
  GOLD,
  INK_DARK,
  INK_RED,
  arcPath,
  polar,
  seededRandom,
} from './chartTheme'

// Layout for the Taldain chart: a huge blue-white supergiant rising from the
// bottom, a white dwarf inside the Particulate Ring near the top, and the
// planet held between them. Positions are measured from the in-world chart.
const WIDTH = 1000
const HEIGHT = 1574
const RING = { cx: 500, cy: 905, r: 830, width: 50 }
const GIANT = { cx: 500, cy: 1262, halo: 493, core: 222 }
const DWARF = { cx: 500, cy: 332, halo: 68, core: 34 }
const PARTICLES = { inner: 148, outer: 220 }
const ORBIT = { cx: 500, cy: 782, r: 450 }
const PLANET = { cx: 500, cy: 664, r: 34 }

const NAVY = '#2b4672'
const SKY = '#dfe5ec'
const BLUE_INK = '#2b4c9a'

/** Closed wavy circle, used for the scalloped edges of the Particulate Ring. */
function wavyCircle(
  cx: number,
  cy: number,
  r: number,
  waves: number,
  amplitude: number,
) {
  const points = Array.from({ length: 360 }, (_, i) => {
    const a = (i / 360) * Math.PI * 2
    return polar(cx, cy, r + amplitude * Math.cos(a * waves), a).join(',')
  })
  return `M ${points.join(' L ')} Z`
}

/** A tapering, S-curved ray pointing out from a star. */
function wavyRay(
  cx: number,
  cy: number,
  inner: number,
  length: number,
  angle: number,
  width: number,
  wave: number,
) {
  const steps = 24
  const centre = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const r = inner + t * length
    return polar(cx, cy, r, angle + (wave * Math.sin(t * Math.PI * 2)) / r)
  })
  const side = (sign: number) =>
    centre.map(([x, y], i) => {
      const [px, py] = centre[Math.max(0, i - 1)]
      const [nx, ny] = centre[Math.min(steps, i + 1)]
      const len = Math.hypot(nx - px, ny - py)
      const half = (width / 2) * Math.pow(1 - i / steps, 0.9)
      return `${x - (sign * (ny - py) * half) / len},${y + (sign * (nx - px) * half) / len}`
    })
  return `M ${[...side(1), ...side(-1).reverse()].join(' L ')} Z`
}

export function BinarySystemChart({ system }: { system: ShownSystem }) {
  const [planet] = system.planets
  const ringRadius = RING.r
  const inner = ringRadius - RING.width / 2
  // Where the inner edge of the title ring meets the page sides.
  const edgeY = RING.cy - Math.sqrt(inner ** 2 - (WIDTH / 2) ** 2)

  const visible = Math.asin((WIDTH / 2 - 40) / ringRadius)
  const titleAngle = (system.name.length * 11 + 70) / ringRadius
  const starAngles = [-1, 1].flatMap((side) =>
    [0, 1 / 3, 2 / 3, 1].map(
      (t) => side * (titleAngle + t * (visible - titleAngle)) - Math.PI / 2,
    ),
  )

  const giantRays = Array.from({ length: 22 }, (_, i) => {
    const long = i % 2 === 0
    return wavyRay(
      GIANT.cx,
      GIANT.cy,
      GIANT.core - 6,
      long ? 255 : 190,
      (i / 22) * Math.PI * 2 - Math.PI / 2,
      long ? 46 : 38,
      long ? 26 : 20,
    )
  })
  const dwarfRays = Array.from({ length: 16 }, (_, i) =>
    wavyRay(
      DWARF.cx,
      DWARF.cy,
      DWARF.core - 2,
      i % 2 ? 20 : 28,
      (i / 16) * Math.PI * 2,
      6,
      4,
    ),
  )

  // Faint swirls in the dust of the Particulate Ring.
  const random = seededRandom(7)
  const dust = Array.from({ length: 140 }, () => {
    const [x, y] = polar(
      DWARF.cx,
      DWARF.cy,
      PARTICLES.inner +
        15 +
        random() * (PARTICLES.outer - PARTICLES.inner - 25),
      random() * Math.PI * 2,
    )
    return { x, y, r: 3 + random() * 7 }
  })

  const particulateOuter = wavyCircle(
    DWARF.cx,
    DWARF.cy,
    PARTICLES.outer,
    30,
    8,
  )
  const particulateInner = wavyCircle(
    DWARF.cx,
    DWARF.cy,
    PARTICLES.inner,
    22,
    6,
  )

  return (
    <svg
      className="chart system-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-label={`Chart of the ${system.name}`}
    >
      <ChartDefs />
      <defs>
        {/* Space lightens to grey in the supergiant's glare. */}
        <radialGradient
          id="space-wash"
          gradientUnits="userSpaceOnUse"
          cx={GIANT.cx}
          cy={GIANT.cy}
          r={1000}
        >
          <stop offset={0.45} stopColor="#b9c4cf" />
          <stop offset={0.53} stopColor="#7d8ea3" />
          <stop offset={0.64} stopColor="#4c6383" />
          <stop offset={0.8} stopColor="#33507a" />
          <stop offset={1} stopColor={NAVY} />
        </radialGradient>
        <radialGradient id="giant-halo">
          <stop offset={0.4} stopColor="#f1f6fa" />
          <stop offset={1} stopColor="#cddcea" />
        </radialGradient>
        <radialGradient id="giant-core" cx="0.42" cy="0.4" r="0.7">
          <stop offset={0} stopColor="#e6eff6" />
          <stop offset={1} stopColor="#a8c2db" />
        </radialGradient>
        <radialGradient id="dwarf-glow">
          <stop offset={0.3} stopColor="#9fb4c9" />
          <stop offset={0.75} stopColor="#2f4b75" />
          <stop offset={1} stopColor="#253f68" />
        </radialGradient>
        <radialGradient id="dwarf-core" cx="0.4" cy="0.35" r="0.75">
          <stop offset={0} stopColor="#ffffff" />
          <stop offset={1} stopColor="#c6d6e3" />
        </radialGradient>
        <clipPath id="chart-clip">
          <rect x={18} y={18} width={WIDTH - 36} height={HEIGHT - 36} />
        </clipPath>
        <path id="title-arc" d={arcPath(RING.cx, RING.cy, ringRadius)} />
        <path
          id="particulate-arc"
          d={`M ${DWARF.cx - 196} ${DWARF.cy} A 196 196 0 0 0 ${DWARF.cx + 196} ${DWARF.cy}`}
        />
        <path
          id="taldain-arc"
          d={arcPath(PLANET.cx, PLANET.cy, PLANET.r + 18)}
        />
        <path
          id="darkside-arc"
          d={arcPath(PLANET.cx, PLANET.cy, PLANET.r - 12)}
        />
        <path
          id="dayside-arc"
          d={`M ${PLANET.cx - PLANET.r + 4} ${PLANET.cy} A ${PLANET.r - 4} ${PLANET.r - 4} 0 0 0 ${PLANET.cx + PLANET.r - 4} ${PLANET.cy}`}
        />
      </defs>

      <g clipPath="url(#chart-clip)">
        {/* Pale sky above the title ring; painted space everywhere below. */}
        <rect width={WIDTH} height={HEIGHT} fill={SKY} />
        <path
          d={`M 0 ${edgeY} A ${inner} ${inner} 0 0 1 ${WIDTH} ${edgeY} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
          fill="url(#space-wash)"
        />

        {/* The Particulate Ring around the Eye of Ridos. */}
        <g pointerEvents="none">
          <path
            d={`${particulateOuter} ${particulateInner}`}
            fillRule="evenodd"
            fill="#e4e9ef"
            stroke={INK_DARK}
            strokeWidth={1.5}
          />
          {dust.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#c5cfda"
              opacity={0.45}
            />
          ))}
          <path d={particulateInner} fill="url(#dwarf-glow)" />
        </g>

        {/* Thin orbit line, passing behind the supergiant. */}
        <circle
          cx={ORBIT.cx}
          cy={ORBIT.cy}
          r={ORBIT.r}
          fill="none"
          stroke={INK_DARK}
          strokeWidth={1.6}
          pointerEvents="none"
        />
        {/* The supergiant AisDa, mostly below the page. */}
        <g pointerEvents="none">
          <circle
            cx={GIANT.cx}
            cy={GIANT.cy}
            r={GIANT.halo}
            fill="url(#giant-halo)"
            stroke={INK_DARK}
            strokeWidth={2}
          />
          {giantRays.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#f8fbfd"
              stroke={INK_DARK}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ))}
          <circle
            cx={GIANT.cx}
            cy={GIANT.cy}
            r={GIANT.core}
            fill="url(#giant-core)"
            stroke={INK_DARK}
            strokeWidth={2.5}
          />
        </g>

        {/* The Eye of Ridos. */}
        <g pointerEvents="none">
          <circle
            cx={DWARF.cx}
            cy={DWARF.cy}
            r={DWARF.halo}
            fill="#eef3f7"
            stroke={INK_DARK}
            strokeWidth={1.5}
          />
          {dwarfRays.map((d, i) => (
            <path key={i} d={d} fill={INK_DARK} />
          ))}
          <circle
            cx={DWARF.cx}
            cy={DWARF.cy}
            r={DWARF.core}
            fill="url(#dwarf-core)"
            stroke={INK_DARK}
            strokeWidth={1.5}
          />
        </g>

        {/* Dark title ring with gold stars, open at the bottom. */}
        <path
          d={arcPath(RING.cx, RING.cy, ringRadius)}
          fill="none"
          stroke={NAVY}
          strokeWidth={RING.width}
        />
        <path
          d={arcPath(RING.cx, RING.cy, ringRadius + RING.width / 2)}
          fill="none"
          stroke={GOLD}
          strokeWidth={2.5}
        />
        {starAngles.map((angle) => {
          const [x, y] = polar(RING.cx, RING.cy, ringRadius, angle)
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
          pathId="particulate-arc"
          offset="50%"
          anchor="middle"
          color={BLUE_INK}
          size={36}
        >
          The Particulate Ring
        </InkLabel>

        {planet && (
          <SvgLink
            to={`/systems/${system.id}/planets/${planet.id}`}
            label={`${planet.name}: view details`}
            className="chart-planet"
          >
            <title>{planet.name}: click for details</title>
            <InkLabel
              pathId="taldain-arc"
              offset="50%"
              anchor="middle"
              color={INK_RED}
              size={32}
            >
              {planet.name}
            </InkLabel>

            {/* Moons ride the twilight line between Dayside and Darkside. */}
            {planet.moons.map((moon) => {
              const mx = PLANET.cx - PLANET.r - 22
              return (
                <g key={moon.name} pointerEvents="none">
                  <line
                    x1={mx}
                    y1={PLANET.cy}
                    x2={PLANET.cx}
                    y2={PLANET.cy}
                    stroke={INK_DARK}
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={mx}
                    cy={PLANET.cy}
                    r={7}
                    fill={moon.color}
                    stroke={INK_DARK}
                    strokeWidth={1.2}
                  />
                  <text
                    className="moon-label"
                    x={mx - 12}
                    y={PLANET.cy + 8}
                    textAnchor="end"
                    fontSize={26}
                    fill={INK_DARK}
                    stroke="#fff"
                    strokeWidth={5}
                    strokeOpacity={0.75}
                    paintOrder="stroke"
                  >
                    {moon.name}
                  </text>
                </g>
              )
            })}

            <g className="chart-planet-body">
              <circle
                cx={PLANET.cx}
                cy={PLANET.cy}
                r={PLANET.r + 6}
                fill="#3b5174"
                stroke={INK_DARK}
                strokeWidth={2}
              />
              {/* Darkside faces the white dwarf above, Dayside the giant below. */}
              <path
                d={`${arcPath(PLANET.cx, PLANET.cy, PLANET.r)} Z`}
                fill="#2c3f60"
              />
              <path
                d={`M ${PLANET.cx - PLANET.r} ${PLANET.cy} A ${PLANET.r} ${PLANET.r} 0 0 0 ${PLANET.cx + PLANET.r} ${PLANET.cy} Z`}
                fill={planet.color}
              />
              <circle
                cx={PLANET.cx}
                cy={PLANET.cy}
                r={PLANET.r}
                fill="none"
                stroke={INK_DARK}
                strokeWidth={1.5}
              />
              <line
                x1={PLANET.cx - PLANET.r}
                y1={PLANET.cy}
                x2={PLANET.cx + PLANET.r}
                y2={PLANET.cy}
                stroke={INK_DARK}
                strokeWidth={1.5}
              />
            </g>
            <g pointerEvents="none" fontSize={11.5}>
              <text fill="#c9d8ea" dy="0.32em">
                <textPath
                  href="#darkside-arc"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  Darkside
                </textPath>
              </text>
              <text fill={BLUE_INK} dy="0.2em">
                <textPath
                  href="#dayside-arc"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  Dayside
                </textPath>
              </text>
            </g>

            <text
              className="chart-planet-hint"
              x={PLANET.cx + PLANET.r + 20}
              y={PLANET.cy + 6}
              fontSize={18}
              fill={INK_DARK}
              stroke="#fff"
              strokeWidth={4}
              paintOrder="stroke"
            >
              Click for details
            </text>
          </SvgLink>
        )}

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
