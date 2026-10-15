import { useState } from 'react'
import { Link } from 'react-router'
import { books } from '../data/books'
import { findLocation, kindLabels } from '../data/locations'
import {
  mapImageUrl,
  mapSourceUrl,
  unlockedMaps,
  type Hotspot,
  type MapVersion,
} from '../data/maps'
import type { Location, LocationKind } from '../data/types'
import { useBooksRead } from '../state/booksRead'
import { useCanSee } from '../state/reveal'
import { TracerOverlay, TracerToolbar, type Point } from './MapTracer'
import { PanZoom } from './PanZoom'

type Spot = Hotspot & { location: Location }

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

const kindOrder: LocationKind[] = [
  'continent',
  'nation',
  'region',
  'city',
  'landmark',
]

/** Center of an outline's bounding box, where its label goes. */
function areaCenter(points: string) {
  const xs: number[] = []
  const ys: number[] = []
  for (const pair of points.trim().split(/\s+/)) {
    const [x, y] = pair.split(',').map(Number)
    xs.push(x)
    ys.push(y)
  }
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  }
}

/**
 * A planet's maps with clickable nations, regions and cities, each linking to
 * its place page. Only maps and places the reader may see are shown, unless
 * `showAll` (the reader chose to view spoilers).
 */
export function InteractiveMap({
  systemId,
  planetId,
  showAll = false,
}: {
  systemId: string
  planetId: string
  showAll?: boolean
}) {
  const { hasRead } = useBooksRead()
  const canSee = useCanSee()
  const [mapId, setMapId] = useState<string>()
  const [activeId, setActiveId] = useState<string>()
  const [tracing, setTracing] = useState(false)
  const [points, setPoints] = useState<Point[]>([])

  const spotsOf = (version: MapVersion): Spot[] =>
    (version.hotspots ?? []).flatMap((spot) => {
      const location = findLocation(planetId, spot.locationId)
      return location && (showAll || canSee(location.revealedIn))
        ? [{ ...spot, location }]
        : []
    })

  const maps = unlockedMaps(planetId, showAll ? () => true : hasRead).flatMap(
    (map) => {
      const version = map.versions.findLast((v) => spotsOf(v).length)
      return version ? [{ ...map, version, spots: spotsOf(version) }] : []
    },
  )
  if (!maps.length) return null

  const map = maps.find((m) => m.id === mapId) ?? maps[0]
  const { version, spots } = map
  const size = Math.max(version.width, version.height)
  const pinRadius = size / 120
  const labelSize = size / 45
  const href = (id: string) =>
    `/systems/${systemId}/planets/${planetId}/locations/${id}`

  // Draw outlines under pins, and list each place once.
  const ordered = [
    ...spots.filter((s) => s.shape === 'area'),
    ...spots.filter((s) => s.shape === 'pin'),
  ]
  const places = [...new Map(spots.map((s) => [s.location.id, s.location]))]
    .map(([, location]) => location)
    .sort((a, b) => a.name.localeCompare(b.name))
  const active = ordered.find((s) => s.location.id === activeId)
  const labelAt = active
    ? active.shape === 'area'
      ? areaCenter(active.points)
      : { x: active.x, y: active.y - pinRadius * 1.8 }
    : undefined

  const highlight = (id: string) => ({
    onMouseEnter: () => setActiveId(id),
    onMouseLeave: () => setActiveId(undefined),
    onFocus: () => setActiveId(id),
    onBlur: () => setActiveId(undefined),
  })

  return (
    <section
      className="interactive-map"
      aria-labelledby="interactive-map-title"
    >
      <h2 id="interactive-map-title">Interactive map</h2>

      {maps.length > 1 && (
        <div
          className="map-editions"
          role="group"
          aria-label="Choose an interactive map"
        >
          {maps.map((m) => (
            <button
              key={m.id}
              type="button"
              className="map-edition"
              aria-pressed={m === map}
              onClick={() => {
                setMapId(m.id)
                setActiveId(undefined)
                setPoints([])
              }}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}

      <div className="interactive-map-body">
        <div
          className="map-viewer-frame"
          style={{ aspectRatio: `${version.width} / ${version.height}` }}
        >
          <PanZoom key={version.file} label={`${map.title} interactive map`}>
            <div className="map-canvas">
              <img
                className="map-viewer-image"
                src={mapImageUrl(version.file)}
                alt={`${map.title}: ${version.caption}`}
                width={version.width}
                height={version.height}
                draggable={false}
              />
              <svg
                className={`map-hotspots${tracing ? ' is-tracing' : ''}`}
                viewBox={`0 0 ${version.width} ${version.height}`}
              >
                {ordered.map((spot) => (
                  <Link
                    key={`${spot.shape}-${spot.location.id}`}
                    to={href(spot.location.id)}
                    aria-label={spot.location.name}
                    className={`map-hotspot is-${spot.shape}${spot.location.id === activeId ? ' is-active' : ''}`}
                    {...highlight(spot.location.id)}
                  >
                    {spot.shape === 'area' ? (
                      <polygon points={spot.points} />
                    ) : (
                      <circle cx={spot.x} cy={spot.y} r={pinRadius} />
                    )}
                  </Link>
                ))}
                {active && labelAt && (
                  <text
                    className="map-hotspot-label"
                    x={labelAt.x}
                    y={labelAt.y}
                    fontSize={labelSize}
                    aria-hidden
                  >
                    {active.location.name}
                  </text>
                )}
              </svg>
              {tracing && (
                <TracerOverlay
                  width={version.width}
                  height={version.height}
                  points={points}
                  onAdd={(point) => setPoints((list) => [...list, point])}
                />
              )}
            </div>
          </PanZoom>
        </div>

        <nav
          className="map-places"
          aria-label={`Places on the ${map.title} map`}
        >
          {kindOrder.map((kind) => {
            const group = places.filter((l) => l.kind === kind)
            if (!group.length) return null
            return (
              <div key={kind}>
                <h3>{kindLabels[kind][group.length > 1 ? 1 : 0]}</h3>
                <ul>
                  {group.map((location) => (
                    <li key={location.id}>
                      <Link
                        to={href(location.id)}
                        className={
                          location.id === activeId ? 'is-active' : undefined
                        }
                        {...highlight(location.id)}
                      >
                        {location.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>
      </div>

      <small className="map-credit">
        Choose a place on the map or in the list. Map by {version.artist}, from{' '}
        <cite>{bookTitle(version.bookId)}</cite>. © Dragonsteel. Image via{' '}
        <a href={mapSourceUrl(version.file)} target="_blank" rel="noreferrer">
          the Coppermind
        </a>
        .
      </small>

      {import.meta.env.DEV && (
        <TracerToolbar
          tracing={tracing}
          points={points}
          onToggle={() => setTracing((on) => !on)}
          onUndo={() => setPoints((list) => list.slice(0, -1))}
          onClear={() => setPoints([])}
        />
      )}
    </section>
  )
}
