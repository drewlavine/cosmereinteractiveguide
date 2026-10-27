import { useState } from 'react'
import { Link } from 'react-router'
import { books } from '../data/books'
import { kindLabels } from '../data/locations'
import { mapLabels } from '../data/mapLabels'
import { interactiveMaps, mapImageUrl, mapSourceUrl } from '../data/maps'
import type { Location, LocationKind } from '../data/types'
import { useBooksRead } from '../state/booksRead'
import { useCanSee } from '../state/reveal'
import { TracerOverlay, TracerToolbar, type Point } from './MapTracer'
import { PanZoom } from './PanZoom'
import { PageSection } from './PageSections'
import { assetUrl } from '../data/assetUrl'

/** One place on the map: an outline made of one or more areas, or a pin. */
type Shape =
  | { shape: 'area'; location: Location; areas: string[] }
  | { shape: 'pin'; location: Location; x: number; y: number }

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

const kindOrder: LocationKind[] = [
  'continent',
  'nation',
  'region',
  'city',
  'landmark',
]

/** An outline's bounding box. */
function bounds(points: string) {
  const xs: number[] = []
  const ys: number[] = []
  for (const pair of points.trim().split(/\s+/)) {
    const [x, y] = pair.split(',').map(Number)
    xs.push(x)
    ys.push(y)
  }
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  return { minX, maxX, minY, maxY, size: (maxX - minX) * (maxY - minY) }
}

/** Center of the largest outline's bounding box, where the label goes. */
function areaCenter(areas: string[]) {
  const box = areas
    .map(bounds)
    .reduce((best, b) => (b.size > best.size ? b : best))
  return { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 }
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

  const maps = interactiveMaps(
    planetId,
    showAll ? () => true : hasRead,
    (location) => showAll || canSee(location.revealedIn),
  )
  if (!maps.length) return null

  const map = maps.find((m) => m.id === mapId) ?? maps[0]
  const { version, spots } = map
  const size = Math.max(version.width, version.height)
  const pinRadius = size / 120
  const labelSize = size / 45
  const href = (id: string) =>
    `/systems/${systemId}/planets/${planetId}/locations/${id}`

  // Draw outlines under pins. A place drawn as several areas (e.g. islands)
  // is one link.
  const outlines = new Map<string, Shape & { shape: 'area' }>()
  const pins: Shape[] = []
  for (const spot of spots) {
    if (spot.shape === 'pin') {
      pins.push({ shape: 'pin', location: spot.location, x: spot.x, y: spot.y })
      continue
    }
    const outline = outlines.get(spot.location.id)
    if (outline) outline.areas.push(spot.points)
    else
      outlines.set(spot.location.id, {
        shape: 'area',
        location: spot.location,
        areas: [spot.points],
      })
  }
  const ordered: Shape[] = [...outlines.values(), ...pins]
  const places = [...new Map(spots.map((s) => [s.location.id, s.location]))]
    .map(([, location]) => location)
    .sort((a, b) => a.name.localeCompare(b.name))
  const active = ordered.find((s) => s.location.id === activeId)
  // Names printed on the map light up instead of getting a floating label.
  const labels = mapLabels[version.file]
  const bandsOf = (id: string) => labels?.bands[id] ?? []
  const activeBands = active ? bandsOf(active.location.id) : []
  const inkId = `map-ink-${map.id}`
  const labelAt = activeBands.length
    ? undefined
    : active
      ? active.shape === 'area'
        ? areaCenter(active.areas)
        : { x: active.x, y: active.y - pinRadius * 1.8 }
      : undefined

  const highlight = (id: string) => ({
    onMouseEnter: () => setActiveId(id),
    onMouseLeave: () => setActiveId(undefined),
    onFocus: () => setActiveId(id),
    onBlur: () => setActiveId(undefined),
  })

  return (
    <PageSection
      id="interactive-map"
      title="Interactive map"
      className="interactive-map"
    >
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
          <PanZoom
            key={version.file}
            label={`${map.title} interactive map`}
            fill="cover"
          >
            <div className="map-canvas">
              <img
                className="map-viewer-image"
                src={mapImageUrl(version.file)}
                alt={`${map.title}: ${version.caption}`}
                width={version.width}
                height={version.height}
                draggable={false}
              />
              {labels && activeBands.length > 0 && (
                // A highlighter pen over the printed name: a yellow glow
                // shaped like the letters, multiplied onto the map so the
                // printed ink stays dark and crisp on top of it.
                <svg
                  className="map-label-ink"
                  viewBox={`0 0 ${version.width} ${version.height}`}
                  aria-hidden
                >
                  <defs>
                    <mask
                      id={inkId}
                      maskUnits="userSpaceOnUse"
                      x={0}
                      y={0}
                      width={version.width}
                      height={version.height}
                    >
                      <image
                        href={assetUrl(labels.mask)}
                        width={version.width}
                        height={version.height}
                      />
                    </mask>
                    <filter
                      id={`${inkId}-glow`}
                      x="-20%"
                      y="-50%"
                      width="140%"
                      height="200%"
                    >
                      <feMorphology
                        in="SourceAlpha"
                        operator="dilate"
                        radius={5}
                        result="thick"
                      />
                      <feGaussianBlur
                        in="thick"
                        stdDeviation={8}
                        result="soft"
                      />
                      <feFlood floodColor="#ffd84d" />
                      <feComposite in2="soft" operator="in" result="halo" />
                      <feMerge>
                        <feMergeNode in="halo" />
                        <feMergeNode in="halo" />
                      </feMerge>
                    </filter>
                  </defs>
                  <g filter={`url(#${inkId}-glow)`}>
                    <g mask={`url(#${inkId})`}>
                      {activeBands.map((points) => (
                        <path key={points} d={`M${points}Z`} />
                      ))}
                    </g>
                  </g>
                </svg>
              )}
              <svg
                className={`map-hotspots${tracing ? ' is-tracing' : ''}`}
                viewBox={`0 0 ${version.width} ${version.height}`}
              >
                {ordered.map((spot) => {
                  // A place whose name is printed on the map is pointed at
                  // by its name alone, not its region or pin.
                  const bands = bandsOf(spot.location.id)
                  return (
                    <Link
                      key={`${spot.shape}-${spot.location.id}`}
                      to={href(spot.location.id)}
                      aria-label={spot.location.name}
                      className={`map-hotspot is-${bands.length ? 'label' : spot.shape}${spot.location.id === activeId ? ' is-active' : ''}`}
                      {...highlight(spot.location.id)}
                    >
                      {bands.length ? (
                        bands.map((points) => (
                          <path
                            key={points}
                            className="map-label-hit"
                            d={`M${points}Z`}
                          />
                        ))
                      ) : spot.shape === 'area' ? (
                        spot.areas.map((points) => (
                          <polygon key={points} points={points} />
                        ))
                      ) : (
                        <circle cx={spot.x} cy={spot.y} r={pinRadius} />
                      )}
                    </Link>
                  )
                })}
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
        <cite>
          {bookTitle(
            [version.bookId, ...(version.alsoIn ?? [])].find(hasRead) ??
              version.bookId,
          )}
        </cite>
        . © Dragonsteel. Image via{' '}
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
    </PageSection>
  )
}
