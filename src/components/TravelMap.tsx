import { SourceMark } from './SourceMark'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import type { ShownSystem, ShownTravelStop } from '../data/reveal'
import { systems as allSystems } from '../data/systems'
import { ChartDefs, GoldStar } from './chart'
import { PlanetGlobe } from './PlanetGlobe'

const WIDTH = 1000
const HEIGHT = 680
const STEP_MS = 2600

const toX = (pct: number) => 70 + (pct / 100) * (WIDTH - 140)
const toY = (pct: number) => 120 + (pct / 100) * (HEIGHT - 190)

/** Where a planet sits on the star map; worlds of the uncharted cluster are fanned out. */
function locate(planetId: string) {
  for (const system of allSystems) {
    const i = system.planets.findIndex((p) => p.id === planetId)
    if (i < 0) continue
    let x = toX(system.mapPosition.x)
    let y = toY(system.mapPosition.y)
    if (system.uncharted) {
      const angle = (i / system.planets.length) * Math.PI * 2 - 1.2
      x += Math.cos(angle) * 34
      y += Math.sin(angle) * 34
    }
    return { x, y, planet: system.planets[i], systemId: system.id }
  }
}

/**
 * Where each visited world is drawn. Worlds that would sit on top of each
 * other (e.g. Ashyn and Roshar, which share a system) are set side by side.
 */
function placeWorlds(planetIds: string[]) {
  const clusters: { x: number; y: number; ids: string[] }[] = []
  const located = new Map(
    planetIds.flatMap((id) => {
      const p = locate(id)
      return p ? [[id, p] as const] : []
    }),
  )
  for (const [id, p] of located) {
    const near = clusters.find((c) => Math.hypot(c.x - p.x, c.y - p.y) < 90)
    if (near) near.ids.push(id)
    else clusters.push({ x: p.x, y: p.y, ids: [id] })
  }
  const placed = new Map<string, NonNullable<ReturnType<typeof locate>>>()
  for (const c of clusters) {
    if (c.ids.length === 1) {
      placed.set(c.ids[0], located.get(c.ids[0])!)
      continue
    }
    const x = c.ids.reduce((t, id) => t + located.get(id)!.x, 0) / c.ids.length
    const y = c.ids.reduce((t, id) => t + located.get(id)!.y, 0) / c.ids.length
    c.ids
      .sort((a, b) => located.get(a)!.x - located.get(b)!.x)
      .forEach((id, i) =>
        placed.set(id, {
          ...located.get(id)!,
          x: x + (i - (c.ids.length - 1) / 2) * 110,
          y,
        }),
      )
  }
  return placed
}

const backgroundStars = (() => {
  let seed = 7
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: 220 }, () => ({
    x: random() * WIDTH,
    y: random() * HEIGHT,
    r: 0.5 + random() * 1.4,
    opacity: 0.2 + random() * 0.6,
  }))
})()

type Pt = { x: number; y: number }

/**
 * A curved path from a to b, bowing away from `away` (the middle of the
 * journey) so it doesn't seem to pass through another world. Repeat trips
 * between the same worlds bow wider.
 */
function arc(a: Pt, b: Pt, away: Pt, repeat: number) {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const side = (mx - away.x) * nx + (my - away.y) * ny >= 0 ? 1 : -1
  const k = Math.min(140, len * 0.3) * (1 + repeat * 0.6) * side
  // Split in two at the middle, so an arrow can sit there (markerMid).
  const cx = mx + nx * k
  const cy = my + ny * k
  const mid = { x: (a.x + 2 * cx + b.x) / 4, y: (a.y + 2 * cy + b.y) / 4 }
  return (
    `M${a.x},${a.y} Q${(a.x + cx) / 2},${(a.y + cy) / 2} ${mid.x},${mid.y} ` +
    `Q${(cx + b.x) / 2},${(cy + b.y) / 2} ${b.x},${b.y}`
  )
}

/**
 * A character's journey across the Cosmere: the worlds they've visited, joined
 * in in-world order, with a scrubber to step (or play) through their life.
 */
export function TravelMap({
  characterId,
  stops,
  systems,
}: {
  characterId: string
  stops: ShownTravelStop[]
  systems: ShownSystem[]
}) {
  const id = useId().replace(/[^\w-]/g, '')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = Math.min(step, stops.length - 1)

  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(() => {
      if (current >= stops.length - 1) setPlaying(false)
      else setStep(current + 1)
    }, STEP_MS)
    return () => clearTimeout(timer)
  }, [playing, current, stops.length])

  const worldAt = placeWorlds([...new Set(stops.map((s) => s.planetId))])
  const points = stops.map((s) => worldAt.get(s.planetId))
  const placed = points.filter((p) => p !== undefined)
  if (placed.length === 0) return null

  // Frame the worlds visited, keeping the map's proportions.
  const pad = 130
  const minX = Math.min(...placed.map((p) => p.x)) - pad
  const maxX = Math.max(...placed.map((p) => p.x)) + pad
  const minY = Math.min(...placed.map((p) => p.y)) - pad
  const maxY = Math.max(...placed.map((p) => p.y)) + pad
  let w = Math.max(maxX - minX, 520)
  let h = Math.max(maxY - minY, 300)
  if (w / h > 1.8) h = w / 1.8
  else w = h * 1.8
  const vx = (minX + maxX) / 2 - w / 2
  const vy = (minY + maxY) / 2 - h / 2

  // Each world is drawn once, numbered with every stay there.
  const worlds = new Map<string, number[]>()
  stops.forEach((s, i) =>
    worlds.set(s.planetId, [...(worlds.get(s.planetId) ?? []), i]),
  )
  const centre = {
    x: placed.reduce((t, p) => t + p.x, 0) / placed.length,
    y: placed.reduce((t, p) => t + p.y, 0) / placed.length,
  }
  const seen = new Map<string, number>()
  const legs = stops.slice(1).map((s, i) => {
    const a = points[i]
    const b = points[i + 1]
    if (!a || !b) return undefined
    const key = [stops[i].planetId, s.planetId].sort().join('>')
    const n = seen.get(key) ?? 0
    seen.set(key, n + 1)
    return arc(a, b, centre, n)
  })

  const stop = stops[current]
  const here = points[current]
  const home = systems.find((s) =>
    s.planets.some((p) => p.id === stop.planetId),
  )
  const name = here?.planet.name ?? stop.planetId
  const go = (i: number) => {
    setPlaying(false)
    setStep(i)
  }

  return (
    <div className="travel-map">
      <svg
        className="chart travel-map-chart"
        viewBox={`${vx} ${vy} ${w} ${h}`}
        role="img"
        aria-label={`Map of worlds visited: ${stops
          .map((s) => locate(s.planetId)?.planet.name ?? s.planetId)
          .join(', then ')}`}
      >
        <ChartDefs />
        <defs>
          <radialGradient id={`${id}-wash`} cx="0.5" cy="0.5" r="0.75">
            <stop offset="0" stopColor="#3d5868" />
            <stop offset="0.6" stopColor="#24394a" />
            <stop offset="1" stopColor="#15232f" />
          </radialGradient>
          <marker
            id={`${id}-arrow`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,1 L9,5 L0,9 z" fill="#f2c14e" />
          </marker>
          <radialGradient id={`${id}-spark`}>
            <stop offset="0" stopColor="#fff7d6" />
            <stop offset="0.4" stopColor="#f2c14e" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f2c14e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={vx} y={vy} width={w} height={h} fill={`url(#${id}-wash)`} />
        <rect x={vx} y={vy} width={w} height={h} filter="url(#grain)" />
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
        {/* Other known systems, faint, for a sense of place. */}
        {systems
          .filter(
            (s) =>
              s.planets.length &&
              !s.uncharted &&
              !placed.some((p) => p.systemId === s.id),
          )
          .map((s) => (
            <g key={s.id} opacity={0.45}>
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

        {legs.map(
          (d, i) =>
            d &&
            i < current && (
              <path
                key={`${i}-${current === i + 1 ? 'new' : 'old'}`}
                d={d}
                pathLength={1}
                markerMid={`url(#${id}-arrow)`}
                className={`travel-leg${current === i + 1 ? ' travel-leg-new' : ''}`}
              />
            ),
        )}
        {legs.map(
          (d, i) =>
            d &&
            i >= current && (
              <path
                key={`ahead-${i}`}
                d={d}
                pathLength={1}
                className="travel-leg-ahead"
              />
            ),
        )}

        {[...worlds].map(([planetId, visits]) => {
          const p = worldAt.get(planetId)
          if (!p) return null
          const active = stops[current].planetId === planetId
          const reached = visits.some((v) => v <= current)
          return (
            <g
              key={planetId}
              className={`travel-world${active ? ' travel-world-active' : ''}${reached ? '' : ' travel-world-ahead'}`}
              onClick={() => go(visits.find((v) => v >= current) ?? visits[0])}
            >
              <title>{p.planet.name}</title>
              {active && (
                <circle cx={p.x} cy={p.y} r={46} className="travel-pulse" />
              )}
              <PlanetGlobe
                planet={p.planet}
                cx={p.x}
                cy={p.y}
                r={active ? 30 : 22}
              />
              <text
                x={p.x}
                y={p.y + (active ? 56 : 46)}
                textAnchor="middle"
                fontSize={active ? 22 : 18}
                fill="#f1e6c8"
                stroke="#15232f"
                strokeWidth={4}
                paintOrder="stroke"
              >
                {p.planet.name}
              </text>
              {visits.map((v, j) => (
                <g
                  key={v}
                  transform={`translate(${p.x + 24 + j * 22},${p.y - 26})`}
                >
                  <circle
                    r={10}
                    className={
                      v === current ? 'travel-badge-on' : 'travel-badge-off'
                    }
                  />
                  <text textAnchor="middle" dy={4.5} fontSize={12}>
                    {v + 1}
                  </text>
                </g>
              ))}
            </g>
          )
        })}

        {current > 0 && legs[current - 1] && (
          <circle
            key={current}
            r={9}
            fill={`url(#${id}-spark)`}
            className="travel-spark"
          >
            <animateMotion dur="1.4s" fill="freeze" path={legs[current - 1]} />
          </circle>
        )}
      </svg>

      <div className="travel-controls">
        <button
          type="button"
          onClick={() => {
            if (playing) setPlaying(false)
            else {
              if (current >= stops.length - 1) setStep(0)
              setPlaying(true)
            }
          }}
          aria-label={playing ? 'Pause journey' : 'Play journey'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 0}
          aria-label="Previous stop"
        >
          ‹
        </button>
        <input
          type="range"
          min={0}
          max={stops.length - 1}
          value={current}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Stop"
          aria-valuetext={`Stop ${current + 1} of ${stops.length}: ${name}`}
        />
        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === stops.length - 1}
          aria-label="Next stop"
        >
          ›
        </button>
      </div>
      <ol className="travel-steps">
        {stops.map((s, i) => (
          <li
            key={i}
            style={{
              left: `${stops.length > 1 ? (i / (stops.length - 1)) * 100 : 50}%`,
            }}
          >
            <button
              type="button"
              aria-current={i === current ? 'step' : undefined}
              onClick={() => go(i)}
            >
              {locate(s.planetId)?.planet.name ?? s.planetId}
            </button>
          </li>
        ))}
      </ol>

      <section className="travel-card" aria-live="polite" key={current}>
        <p className="travel-card-step">
          Stop {current + 1} of {stops.length}
        </p>
        <h2>
          {home ? (
            <Link to={`/systems/${home.id}/planets/${stop.planetId}`}>
              {name}
            </Link>
          ) : (
            name
          )}
          {stop.place && <span className="travel-place"> · {stop.place}</span>}
        </h2>
        {stop.uncertain && (
          <p className="travel-uncertain">
            <span className="travel-badge">Timing uncertain</span>{' '}
            {stop.uncertain}
          </p>
        )}
        {stop.wob && (
          <p className="travel-uncertain">
            <span className="travel-badge">Word of Brandon</span> {stop.wob}
          </p>
        )}
        <ul>
          {stop.events.map(({ text, books }) => (
            <li key={text}>
              {text}
              <SourceMark books={books} />
            </li>
          ))}
        </ul>
        <Link to={`/characters/${characterId}/history`} className="travel-more">
          Read more in History →
        </Link>
      </section>
    </div>
  )
}
