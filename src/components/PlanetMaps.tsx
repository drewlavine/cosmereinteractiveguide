import { useState, type ReactNode } from 'react'
import { books } from '../data/books'
import {
  mapImageUrl,
  mapSourceUrl,
  mapThumbUrl,
  unlockedMaps,
  type MapVersion,
  type PlanetMap,
} from '../data/maps'
import { useBooksRead } from '../state/booksRead'
import { PanZoom } from './PanZoom'
import { PageSection } from './PageSections'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

const newest = (map: PlanetMap) => map.versions[map.versions.length - 1]

/**
 * A planet's maps, limited to those from books the reader has read unless
 * `showAll` (the reader chose to view spoilers).
 */
export function PlanetMaps({
  planetId,
  showAll = false,
}: {
  planetId: string
  showAll?: boolean
}) {
  const { hasRead } = useBooksRead()
  const maps = unlockedMaps(planetId, showAll ? () => true : hasRead)
  const [mapId, setMapId] = useState<string>()
  const [file, setFile] = useState<string>()
  // Credit a read book, so a map unlocked by a reprint doesn't name the unread original.
  const source = (v: MapVersion) =>
    bookTitle([v.bookId, ...(v.alsoIn ?? [])].find(hasRead) ?? v.bookId)

  if (!maps.length) return null

  const map = maps.find((m) => m.id === mapId) ?? maps[0]
  const version = map.versions.find((v) => v.file === file) ?? newest(map)

  const selectMap = (next: PlanetMap) => {
    setMapId(next.id)
    setFile(undefined)
  }

  return (
    <PageSection id="maps" title="Maps" className="planet-maps">
      <MapFigure
        map={map}
        version={version}
        source={source}
        onVersion={(v) => setFile(v.file)}
      />

      <ul className="map-strip" aria-label="Choose a map">
        {maps.map((m) => {
          const shown = newest(m)
          return (
            <li key={m.id}>
              <button
                type="button"
                className="map-thumb"
                aria-pressed={m === map}
                onClick={() => selectMap(m)}
              >
                <img
                  src={mapThumbUrl(shown)}
                  // Coppermind sometimes lacks a thumbnail; use the full image.
                  onError={(event) => {
                    const full = mapImageUrl(shown.file)
                    if (event.currentTarget.src !== full)
                      event.currentTarget.src = full
                  }}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
                <span className="map-thumb-title">{m.title}</span>
                <span className="map-thumb-book">{source(shown)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </PageSection>
  )
}

/**
 * One map version with its caption, edition choice (when `onVersion` is
 * given) and credit. `overlay` is drawn over the image, in image pixels.
 */
export function MapFigure({
  map,
  version,
  source,
  onVersion,
  overlay,
}: {
  map: PlanetMap
  version: MapVersion
  source: (version: MapVersion) => string
  onVersion?: (version: MapVersion) => void
  overlay?: ReactNode
}) {
  return (
    <figure className="map-viewer">
      <div
        className="map-viewer-frame"
        style={{ aspectRatio: `${version.width} / ${version.height}` }}
      >
        <PanZoom key={version.file} label={`${map.title} map`} fill="cover">
          <div className="map-canvas">
            <img
              className="map-viewer-image"
              src={mapImageUrl(version.file)}
              alt={`${map.title}: ${version.caption}`}
              width={version.width}
              height={version.height}
              draggable={false}
            />
            {overlay}
          </div>
        </PanZoom>
      </div>

      <figcaption className="map-viewer-caption">
        <div>
          <strong>{map.title}.</strong> {version.caption}
        </div>

        {onVersion && map.versions.length > 1 && (
          <div
            className="map-editions"
            role="group"
            aria-label={`${map.title} editions`}
          >
            <span className="map-editions-label">Edition:</span>
            {map.versions.map((v) => (
              <button
                key={v.file}
                type="button"
                className="map-edition"
                aria-pressed={v === version}
                onClick={() => onVersion?.(v)}
              >
                {v.edition ?? source(v)}
              </button>
            ))}
          </div>
        )}

        <small className="map-credit">
          Map by {version.artist}, from <cite>{source(version)}</cite>. ©
          Dragonsteel. Image via{' '}
          <a href={mapSourceUrl(version.file)} target="_blank" rel="noreferrer">
            the Coppermind
          </a>
          .
        </small>
      </figcaption>
    </figure>
  )
}
