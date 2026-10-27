import { useId } from 'react'
import {
  CHART,
  chartPoint,
  chartedWorlds,
  COSMERE_MAP,
  journeyMapPlanet,
  realmPoint,
} from '../../data/journeyAtlas'
import type { ShownJourney, ShownSystem } from '../../data/reveal'
import { ChartDefs, GoldStar } from '../chart'
import { PlanetGlobe } from '../PlanetGlobe'

const backgroundStars = (() => {
  let seed = 7
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: 220 }, () => ({
    x: random() * CHART.width,
    y: random() * CHART.height,
    r: 0.5 + random() * 1.4,
    opacity: 0.2 + random() * 0.6,
  }))
})()

const toX = (pct: number) => 70 + (pct / 100) * (CHART.width - 140)
const toY = (pct: number) => 120 + (pct / 100) * (CHART.height - 190)

/**
 * The Journey's star chart of the Cosmere, drawn under its stops: the
 * worlds the journey reaches as globes, each Cognitive Realm visited as a
 * faint ring beside its world, and other systems the reader knows, faint.
 */
export function StarChart({
  journey,
  systems,
}: {
  journey: ShownJourney
  /** The systems as the reader may see them. */
  systems: ShownSystem[]
}) {
  const id = useId().replace(/[^\w-]/g, '')
  const worldOf = (s: ShownJourney['stops'][number]) =>
    s.world ?? journeyMapPlanet(s.mapId)
  const reached = new Set(journey.stops.map(worldOf))
  const worlds = chartedWorlds().filter((w) => reached.has(w.id))
  const realms = [
    ...new Set(
      journey.stops
        .filter((s) => s.mapId === COSMERE_MAP && s.world && s.realm)
        .map((s) => s.world!),
    ),
  ]
  const systemsHere = new Set(
    worlds.flatMap(
      (w) =>
        systems.find((s) => s.planets.some((p) => p.id === w.id))?.id ?? [],
    ),
  )
  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      className="chart journey-star-chart"
      aria-hidden
    >
      <ChartDefs />
      <defs>
        <radialGradient id={`${id}-wash`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0" stopColor="#3d5868" />
          <stop offset="0.6" stopColor="#24394a" />
          <stop offset="1" stopColor="#15232f" />
        </radialGradient>
      </defs>
      <rect
        width={CHART.width}
        height={CHART.height}
        fill={`url(#${id}-wash)`}
      />
      <rect width={CHART.width} height={CHART.height} filter="url(#grain)" />
      {backgroundStars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#e9f3f7"
          opacity={s.opacity}
        />
      ))}
      {/* Other systems the reader knows, faint, for a sense of place. */}
      {systems
        .filter(
          (s) => s.planets.length && !s.uncharted && !systemsHere.has(s.id),
        )
        .map((s) => (
          <g key={s.id} opacity={0.4}>
            <GoldStar
              x={toX(s.mapPosition.x)}
              y={toY(s.mapPosition.y)}
              size={8}
            />
            <text
              x={toX(s.mapPosition.x)}
              y={toY(s.mapPosition.y) + 26}
              textAnchor="middle"
              fontSize={15}
              fill="#f1e6c8"
            >
              {s.name}
            </text>
          </g>
        ))}
      {realms.map((planetId) => {
        const at = realmPoint(planetId)!
        const from = chartPoint(planetId)!
        return (
          <g key={`realm-${planetId}`} className="journey-realm">
            <line x1={from[0]} y1={from[1]} x2={at[0]} y2={at[1]} />
            <circle cx={at[0]} cy={at[1]} r={18} />
            <text x={at[0]} y={at[1] + 34} textAnchor="middle" fontSize={12}>
              Cognitive Realm
            </text>
          </g>
        )
      })}
      {worlds.map(({ id: planetId, at, planet }) => (
        <g key={planetId}>
          <PlanetGlobe planet={planet} cx={at[0]} cy={at[1]} r={22} />
          <text
            x={at[0]}
            y={at[1] - 32}
            textAnchor="middle"
            fontSize={18}
            fill="#f1e6c8"
            stroke="#15232f"
            strokeWidth={4}
            paintOrder="stroke"
          >
            {planet.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
