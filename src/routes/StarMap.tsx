import { ChartDefs, GoldFrame, GoldStar, SvgLink } from '../components/chart'
import { GOLD, seededRandom } from '../components/chartTheme'
import { PanZoom } from '../components/PanZoom'
import { systems } from '../data/systems'

const WIDTH = 1000
const HEIGHT = 680
const MARGIN = 70
const TITLE_SPACE = 50

const backgroundStars = (() => {
  const random = seededRandom(42)
  return Array.from({ length: 160 }, () => ({
    x: 20 + random() * (WIDTH - 40),
    y: 20 + random() * (HEIGHT - 40),
    r: 0.6 + random() * 1.6,
    opacity: 0.25 + random() * 0.6,
  }))
})()

const toX = (pct: number) => MARGIN + (pct / 100) * (WIDTH - MARGIN * 2)
const toY = (pct: number) =>
  MARGIN + TITLE_SPACE + (pct / 100) * (HEIGHT - MARGIN * 2 - TITLE_SPACE)

export function StarMap() {
  return (
    <section className="star-map" aria-labelledby="star-map-title">
      <h1 id="star-map-title" className="visually-hidden">
        Cosmere star map
      </h1>
      <PanZoom label="Cosmere star map">
        <svg
          className="chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          aria-label="Chart of the known Cosmere systems"
        >
          <ChartDefs />
          <defs>
            <radialGradient id="cosmere-wash" cx="0.5" cy="0.55" r="0.75">
              <stop offset="0" stopColor="#3d5868" />
              <stop offset="0.6" stopColor="#24394a" />
              <stop offset="1" stopColor="#15232f" />
            </radialGradient>
          </defs>

          <g pointerEvents="none">
            <rect width={WIDTH} height={HEIGHT} fill="url(#cosmere-wash)" />
            <rect
              width={WIDTH}
              height={HEIGHT}
              filter="url(#paint-texture)"
              opacity={0.18}
            />
            <rect width={WIDTH} height={HEIGHT} filter="url(#grain)" />
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
            <text
              className="chart-title"
              x={WIDTH / 2}
              y={84}
              textAnchor="middle"
              fill={GOLD}
              fontSize={48}
            >
              The Cosmere
            </text>
            <GoldStar x={WIDTH / 2 - 170} y={70} size={12} />
            <GoldStar x={WIDTH / 2 + 170} y={70} size={12} />
          </g>

          {systems.map((system) => {
            const x = toX(system.mapPosition.x)
            const y = toY(system.mapPosition.y)
            return (
              <SvgLink
                key={system.id}
                to={`/systems/${system.id}`}
                label={system.name}
                className="chart-system"
              >
                <title>{system.name}: click to explore</title>
                {/* Invisible hit area so the small star is easy to click. */}
                <circle cx={x} cy={y} r={26} fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={20}
                  fill={system.color}
                  opacity={0.2}
                />
                <g className="chart-system-star">
                  <GoldStar x={x} y={y} size={13} />
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill={system.color}
                    stroke="#f4fafc"
                    strokeWidth={1.5}
                  />
                </g>
                <text
                  className="chart-system-label"
                  x={x}
                  y={y + 42}
                  textAnchor="middle"
                  fontSize={24}
                  fill="#f1e6c8"
                  stroke="#15232f"
                  strokeWidth={4}
                  paintOrder="stroke"
                >
                  {system.name}
                </text>
              </SvgLink>
            )
          })}

          <GoldFrame width={WIDTH} height={HEIGHT} />
        </svg>
      </PanZoom>
    </section>
  )
}
