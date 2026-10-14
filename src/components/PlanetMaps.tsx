import { useState } from 'react'
import { books } from '../data/books'
import {
  mapImageUrl,
  mapSourceUrl,
  mapThumbUrl,
  unlockedMaps,
  type PlanetMap,
} from '../data/maps'
import { useBooksRead } from '../state/booksRead'
import { PanZoom } from './PanZoom'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

const newest = (map: PlanetMap) => map.versions[map.versions.length - 1]

/** A planet's maps, limited to those from books the reader has read. */
export function PlanetMaps({ planetId }: { planetId: string }) {
  const { hasRead } = useBooksRead()
  const maps = unlockedMaps(planetId, hasRead)
  const [mapId, setMapId] = useState<string>()
  const [file, setFile] = useState<string>()

  if (!maps.length) return null

  const map = maps.find((m) => m.id === mapId) ?? maps[0]
  const version = map.versions.find((v) => v.file === file) ?? newest(map)

  const selectMap = (next: PlanetMap) => {
    setMapId(next.id)
    setFile(undefined)
  }

  return (
    <section className="planet-maps" aria-labelledby="planet-maps-title">
      <h2 id="planet-maps-title">Maps</h2>

      <figure className="map-viewer">
        <div
          className="map-viewer-frame"
          style={{ aspectRatio: `${version.width} / ${version.height}` }}
        >
          <PanZoom key={version.file} label={`${map.title} map`}>
            <img
              className="map-viewer-image"
              src={mapImageUrl(version.file)}
              alt={`${map.title}: ${version.caption}`}
              width={version.width}
              height={version.height}
              draggable={false}
            />
          </PanZoom>
        </div>

        <figcaption className="map-viewer-caption">
          <div>
            <strong>{map.title}.</strong> {version.caption}
          </div>

          {map.versions.length > 1 && (
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
                  onClick={() => setFile(v.file)}
                >
                  {bookTitle(v.bookId)}
                </button>
              ))}
            </div>
          )}

          <small className="map-credit">
            Map by {version.artist}, from{' '}
            <cite>{bookTitle(version.bookId)}</cite>. © Dragonsteel. Image via{' '}
            <a
              href={mapSourceUrl(version.file)}
              target="_blank"
              rel="noreferrer"
            >
              the Coppermind
            </a>
            .
          </small>
        </figcaption>
      </figure>

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
                  src={mapThumbUrl(shown.file)}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
                <span className="map-thumb-title">{m.title}</span>
                <span className="map-thumb-book">
                  {bookTitle(shown.bookId)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
