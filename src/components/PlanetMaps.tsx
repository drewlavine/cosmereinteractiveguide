import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
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
import {
  PanZoom,
  type PanZoomHandle,
  type PanZoomHome,
  type Transform,
} from './PanZoom'
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

/** How a map is shown right now, for overlays that follow the zoom. */
export interface MapView {
  transform: Transform
  /** Canvas px per image px, before the zoom. */
  k: number
  /** Where the image starts in the canvas (it's letterboxed to fit). */
  origin: { x: number; y: number }
  /** Screen px per image px, zoom included. */
  px: number
  frame: { width: number; height: number }
}

/**
 * One map version with its caption, edition choice (when `onVersion` is
 * given) and credit. `overlay` is drawn over the image, in image pixels;
 * given as a function, it and `frameExtras` (drawn over the frame, unzoomed)
 * follow the view. `spotlight` dims the image, for an overlay that redraws
 * part of it.
 */
export function MapFigure({
  map,
  version,
  source,
  onVersion,
  overlay,
  frameExtras,
  captionStart,
  spotlight = false,
  home,
  panZoom,
  onTransform,
}: {
  map: PlanetMap
  version: MapVersion
  source: (version: MapVersion) => string
  onVersion?: (version: MapVersion) => void
  overlay?: ReactNode | ((view: MapView) => ReactNode)
  frameExtras?: (view: MapView) => ReactNode
  captionStart?: ReactNode
  spotlight?: boolean
  home?: PanZoomHome
  panZoom?: Ref<PanZoomHandle>
  onTransform?: (transform: Transform) => void
}) {
  const follows = typeof overlay === 'function' || !!frameExtras
  const frameRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  })
  const [frame, setFrame] = useState({ width: 0, height: 0 })

  // The image is drawn to fit the frame; track its size to place the overlays.
  useEffect(() => {
    const el = frameRef.current
    if (!follows || !el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() =>
      setFrame({ width: el.clientWidth, height: el.clientHeight }),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [follows])

  const changed = useCallback(
    (t: Transform) => {
      if (follows) setTransform(t)
      onTransform?.(t)
    },
    [follows, onTransform],
  )
  const k =
    Math.min(frame.width / version.width, frame.height / version.height) || 1
  const origin = {
    x: frame.width ? (frame.width - version.width * k) / 2 : 0,
    y: frame.height ? (frame.height - version.height * k) / 2 : 0,
  }
  const view: MapView = { transform, k, origin, px: k * transform.scale, frame }

  return (
    <figure className="map-viewer">
      <div
        ref={frameRef}
        className={`map-viewer-frame${spotlight ? ' is-spotlit' : ''}`}
        style={{ aspectRatio: `${version.width} / ${version.height}` }}
      >
        <PanZoom
          key={version.file}
          label={`${map.title} map`}
          fill="cover"
          ref={panZoom}
          home={home}
          onTransform={changed}
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
            {typeof overlay === 'function' ? overlay(view) : overlay}
          </div>
        </PanZoom>
        {frameExtras?.(view)}
      </div>

      <figcaption className="map-viewer-caption">
        {captionStart}
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
