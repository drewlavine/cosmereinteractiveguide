import { useState } from 'react'
import { books } from '../data/books'
import { placeMaps, type Hotspot, type MapVersion } from '../data/maps'
import { useBooksRead } from '../state/booksRead'
import { MapFigure } from './PlanetMaps'
import { PageSection } from './PageSections'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

/** Where the label goes: above the pin, or the middle of the outlines. */
function labelPoint(spots: Hotspot[], lift: number) {
  const pin = spots.find((s) => s.shape === 'pin')
  if (pin) return { x: pin.x, y: pin.y - lift }
  const xs: number[] = []
  const ys: number[] = []
  for (const s of spots)
    if (s.shape === 'area')
      for (const pair of s.points.trim().split(/\s+/)) {
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
 * A place's maps. A place with a map of its own (a city like Luthadel) shows
 * that map. Any other place shows the maps it's marked on, with it
 * highlighted, so the reader sees where it lies. Only maps from books the
 * reader has read are used, unless `showAll`.
 */
export function LocationMaps({
  planetId,
  locationId,
  name,
  showAll = false,
}: {
  planetId: string
  locationId: string
  name: string
  showAll?: boolean
}) {
  const { hasRead } = useBooksRead()
  const [mapId, setMapId] = useState<string>()
  const [file, setFile] = useState<string>()
  const found = placeMaps(planetId, locationId, showAll ? () => true : hasRead)
  // Credit a read book, so a map unlocked by a reprint doesn't name the unread original.
  const source = (v: MapVersion) =>
    bookTitle([v.bookId, ...(v.alsoIn ?? [])].find(hasRead) ?? v.bookId)

  if (!found) return null
  if (found.section === 'map') {
    const { own } = found
    const version =
      own.versions.find((v) => v.file === file) ?? own.versions.at(-1)!
    return (
      <PageSection id={found.section} title="Map" className="planet-maps">
        <MapFigure
          map={own}
          version={version}
          source={source}
          onVersion={(v) => setFile(v.file)}
        />
      </PageSection>
    )
  }

  const { locators } = found
  const map = locators.find((m) => m.id === mapId) ?? locators[0]
  const { version, spots } = map
  const size = Math.max(version.width, version.height)
  const pinRadius = size / 110
  const label = labelPoint(spots, pinRadius * 3.2)

  return (
    <PageSection id={found.section} title="Where it is" className="planet-maps">
      {locators.length > 1 && (
        <div className="map-editions" role="group" aria-label="Choose a map">
          {locators.map((m) => (
            <button
              key={m.id}
              type="button"
              className="map-edition"
              aria-pressed={m === map}
              onClick={() => setMapId(m.id)}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}
      <MapFigure
        key={map.id}
        map={map}
        version={version}
        source={source}
        overlay={
          <svg
            className="map-hotspots location-marker"
            viewBox={`0 0 ${version.width} ${version.height}`}
            role="img"
            aria-label={`${name} marked on a map of ${map.title}`}
          >
            {spots.map((spot) =>
              spot.shape === 'area' ? (
                <polygon key={spot.points} points={spot.points} />
              ) : (
                <g key={`${spot.x},${spot.y}`}>
                  <circle
                    className="location-marker-pulse"
                    cx={spot.x}
                    cy={spot.y}
                    r={pinRadius * 2.4}
                  />
                  <circle cx={spot.x} cy={spot.y} r={pinRadius} />
                </g>
              ),
            )}
            <text
              className="map-hotspot-label"
              x={label.x}
              y={label.y}
              fontSize={size / 40}
              aria-hidden
            >
              {name}
            </text>
          </svg>
        }
      />
    </PageSection>
  )
}
