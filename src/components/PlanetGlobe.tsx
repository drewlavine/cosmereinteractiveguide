import { useId } from 'react'
import type { Planet } from '../data/types'
import {
  INK_DARK,
  RING_SCALE,
  RING_TILT,
  hashString,
  mixColor,
  seededRandom,
} from './chartTheme'

type GlobePlanet = Pick<
  Planet,
  'id' | 'color' | 'accent' | 'surface' | 'rings' | 'ringTilt' | 'glow'
>

/** How strongly each surface is blotched with painted light and shade. */
const MOTTLE: Record<NonNullable<Planet['surface']>, number> = {
  mottled: 0.16,
  banded: 0.04,
  cratered: 0.2,
  marbled: 0.1,
  tidal: 0.1,
}

/**
 * A planet painted like those on the in-world star charts: a pale halo, a
 * brushed surface, soft shading and an inked rim. Shared by the system charts
 * and the planet pages so a world looks the same in both.
 */
export function PlanetGlobe({
  planet,
  cx,
  cy,
  r,
}: {
  planet: GlobePlanet
  cx: number
  cy: number
  r: number
}) {
  const id = `globe-${useId().replace(/[^\w-]/g, '')}`
  const surface = planet.surface ?? 'mottled'
  const rand = seededRandom(hashString(planet.id))
  const seed = Math.floor(rand() * 1000)
  const banded = surface === 'banded'
  // Bands shade toward their accent; veins and the like are painted in it.
  const accent =
    planet.accent ?? mixColor(planet.color, banded ? '#000000' : '#ffffff', 0.4)
  const light = mixColor(planet.color, '#ffffff', 0.45)
  const shadow = mixColor(planet.color, banded ? accent : '#000000', 0.75)
  // The charts give every body a thin pale rim, then only a faint haze.
  const rim = Math.min(r * 0.05, 1.6)
  const haloR = r + rim * 4
  const outline = Math.min(1.4, Math.max(0.8, r * 0.04))
  const tilt = planet.ringTilt ?? RING_TILT
  const ring = { rx: r * RING_SCALE.rx, ry: r * RING_SCALE.ry }
  const ringTransform = `rotate(${tilt} ${cx} ${cy})`
  const ringHalf = `M ${cx - ring.rx} ${cy} A ${ring.rx} ${ring.ry} 0 0 0 ${cx + ring.rx} ${cy}`
  const ringWidth = Math.min(3, Math.max(1, r * 0.08))
  const mottle = MOTTLE[surface]
  const disc = { cx, cy, r }

  return (
    <g pointerEvents="none">
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle {...disc} />
        </clipPath>
        <radialGradient id={`${id}-halo`}>
          <stop offset={r / haloR} stopColor="#f1f5f6" stopOpacity={0.45} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        {planet.glow && (
          <radialGradient id={`${id}-glow`}>
            <stop offset="0.6" stopColor={planet.glow} stopOpacity={0.75} />
            <stop offset="1" stopColor={planet.glow} stopOpacity={0} />
          </radialGradient>
        )}
        <linearGradient
          id={`${id}-base`}
          x1="0.15"
          y1="0.1"
          x2="0.85"
          y2="0.95"
        >
          <stop
            offset="0"
            stopColor={mixColor(planet.color, light, banded ? 0.5 : 0.2)}
          />
          <stop offset={banded ? 0.4 : 0.5} stopColor={planet.color} />
          <stop
            offset="1"
            stopColor={
              banded ? shadow : mixColor(planet.color, '#000000', 0.15)
            }
          />
        </linearGradient>
        {/* Lit from the upper left, with a dark crescent along the lower right. */}
        <radialGradient id={`${id}-shade`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity={0.12} />
          <stop offset="0.35" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.68" stopColor="#000" stopOpacity={0} />
          <stop offset="0.86" stopColor="#000" stopOpacity={0.38} />
          <stop offset="1" stopColor="#000" stopOpacity={0.7} />
        </radialGradient>
        <NoiseFilter id={`${id}-dark`} r={r} seed={seed} strength={mottle} />
        <NoiseFilter
          id={`${id}-light`}
          r={r}
          seed={seed + 1}
          strength={mottle * 0.3}
          light
        />
        {surface === 'marbled' && (
          <VeinFilter id={`${id}-veins`} r={r} seed={seed} />
        )}
        {surface === 'banded' && (
          <filter
            id={`${id}-brush`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${0.9 / r} ${5 / r}`}
              numOctaves={2}
              seed={seed}
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale={r * 0.14}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={r * 0.012} />
          </filter>
        )}
      </defs>

      {planet.glow ? (
        <circle {...disc} r={r * 1.6} fill={`url(#${id}-glow)`} />
      ) : (
        <circle {...disc} r={haloR} fill={`url(#${id}-halo)`} />
      )}

      {/* Back half of the rings passes behind the planet. */}
      {planet.rings && (
        <RingLine
          d={`${ringHalf} A ${ring.rx} ${ring.ry} 0 0 1 ${cx - ring.rx} ${cy}`}
          transform={ringTransform}
          width={ringWidth}
        />
      )}

      <circle {...disc} fill={`url(#${id}-base)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {surface === 'banded' && (
          <Bands
            id={id}
            cx={cx}
            cy={cy}
            r={r}
            rand={rand}
            accent={accent}
            light={light}
          />
        )}
        {surface === 'tidal' && (
          <>
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
              fill="#2c3f60"
            />
            <line
              x1={cx - r}
              y1={cy}
              x2={cx + r}
              y2={cy}
              stroke={INK_DARK}
              strokeWidth={Math.max(1, r * 0.04)}
            />
          </>
        )}
        <circle {...disc} filter={`url(#${id}-dark)`} />
        <circle {...disc} filter={`url(#${id}-light)`} />
        {surface === 'marbled' && (
          <circle {...disc} fill={accent} filter={`url(#${id}-veins)`} />
        )}
        {surface === 'cratered' && (
          <Craters cx={cx} cy={cy} r={r} rand={rand} />
        )}
      </g>
      <circle {...disc} fill={`url(#${id}-shade)`} />
      <circle {...disc} fill="none" stroke={INK_DARK} strokeWidth={outline} />
      {/* The thin pale rim the charts paint just outside every planet's ink line. */}
      <circle
        {...disc}
        r={r + outline / 2 + rim / 2}
        fill="none"
        stroke={planet.glow ? mixColor(planet.glow, '#ffffff', 0.6) : '#f1f5f6'}
        strokeOpacity={0.9}
        strokeWidth={rim}
      />

      {/* Front half of the rings passes over the planet. */}
      {planet.rings && (
        <RingLine d={ringHalf} transform={ringTransform} width={ringWidth} />
      )}
    </g>
  )
}

/** An inked ring line with the same thin pale edge the charts give every body. */
function RingLine({
  d,
  transform,
  width,
}: {
  d: string
  transform: string
  width: number
}) {
  return (
    <g fill="none" transform={transform}>
      <path
        d={d}
        stroke="#f1f5f6"
        strokeOpacity={0.75}
        strokeWidth={width + 2.5}
      />
      <path d={d} stroke={INK_DARK} strokeWidth={width} />
    </g>
  )
}

/** Fractal noise turned into soft dark (or light) blotches, clipped to the shape it paints. */
function NoiseFilter({
  id,
  r,
  seed,
  strength,
  light = false,
}: {
  id: string
  r: number
  seed: number
  strength: number
  light?: boolean
}) {
  const gain = 2.6 * strength
  const tone = light ? 1 : 0
  const alpha = light
    ? `${-gain} 0 0 0 ${0.5 * gain + 0.04}`
    : `${gain} 0 0 0 ${-0.5 * gain + 0.1 * strength}`
  return (
    <filter id={id} x="0" y="0" width="1" height="1">
      <feTurbulence
        type="fractalNoise"
        baseFrequency={3 / r}
        numOctaves={3}
        seed={seed}
      />
      <feColorMatrix
        type="matrix"
        values={`0 0 0 0 ${tone}  0 0 0 0 ${tone}  0 0 0 0 ${tone}  ${alpha}`}
      />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
  )
}

/** Thin swirling veins in the shape's own fill color, as on Ashyn or Roshar. */
function VeinFilter({ id, r, seed }: { id: string; r: number; seed: number }) {
  return (
    <filter id={id} x="0" y="0" width="1" height="1">
      <feTurbulence
        type="turbulence"
        baseFrequency={`${1.1 / r} ${1.8 / r}`}
        numOctaves={3}
        seed={seed}
      />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 0.9"
      />
      <feGaussianBlur stdDeviation={r * 0.025} result="veins" />
      <feComposite in="SourceGraphic" in2="veins" operator="in" />
    </filter>
  )
}

/** Curved brush strokes following the planet's latitude, tipped like the charts' gas giants. */
function Bands({
  id,
  cx,
  cy,
  r,
  rand,
  accent,
  light,
}: {
  id: string
  cx: number
  cy: number
  r: number
  rand: () => number
  accent: string
  light: string
}) {
  const strokes = []
  for (let t = -1.05; t < 1.05; t += 0.03 + rand() * 0.05) {
    const y = t * r
    const bulge = r * 0.32 * (1 - 0.5 * t * t)
    const pick = rand()
    strokes.push(
      <path
        key={t}
        d={`M ${-1.3 * r} ${y - bulge * 0.4} Q 0 ${y + bulge} ${1.3 * r} ${y - bulge * 0.4}`}
        fill="none"
        stroke={pick < 0.3 ? accent : pick < 0.85 ? light : '#fff'}
        strokeOpacity={0.12 + rand() * 0.26}
        strokeWidth={r * (0.015 + rand() * 0.045)}
        strokeLinecap="round"
      />,
    )
  }
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(-32)`}
      filter={`url(#${id}-brush)`}
    >
      {strokes}
    </g>
  )
}

function Craters({
  cx,
  cy,
  r,
  rand,
}: {
  cx: number
  cy: number
  r: number
  rand: () => number
}) {
  const count = 6 + Math.floor(rand() * 4)
  return Array.from({ length: count }, (_, i) => {
    const angle = rand() * Math.PI * 2
    const dist = Math.sqrt(rand()) * r * 0.78
    const size = r * (0.06 + rand() * 0.12)
    const x = cx + dist * Math.cos(angle)
    const y = cy + dist * Math.sin(angle)
    return (
      <g key={i}>
        {/* A shadowed bowl with light catching its far rim. */}
        <circle cx={x} cy={y} r={size} fill="#fff" fillOpacity={0.08} />
        <circle
          cx={x - size * 0.15}
          cy={y - size * 0.15}
          r={size * 0.85}
          fill={INK_DARK}
          fillOpacity={0.32}
        />
      </g>
    )
  })
}
