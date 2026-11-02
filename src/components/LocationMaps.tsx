import { useCallback, useId, useRef, useState } from 'react'
import { books } from '../data/books'
import {
  mapImageUrl,
  placeMaps,
  type Hotspot,
  type MapVersion,
  type MarkedMap,
} from '../data/maps'
import { useBooksRead } from '../state/booksRead'
import type { PanZoomHandle, PanZoomHome, Transform } from './PanZoom'
import { MapFigure, type MapView } from './PlanetMaps'
import { PageSection } from './PageSections'
import { contextBox, ringRadius, spotsBox } from './placeFrame'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

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
      <PlaceOnMap key={map.id} map={map} name={name} source={source} />
    </PageSection>
  )
}

// Below this zoom the view is about the whole map: name the place with a tag.
const TAG_BELOW = 1.5
// A place framed at less than this already fills the map: no toggle needed.
const FRAMED_FROM = 1.15
// The zoom controls' corner of the frame, kept clear of the tag.
const CONTROLS = { width: 72, height: 150 }

/**
 * A map with one place spotlit: the map opens framed on it, the rest greyed,
 * the place redrawn crisp inside a casing and line (a ring, for a pin).
 */
function PlaceOnMap({
  map,
  name,
  source,
}: {
  map: MarkedMap<Hotspot>
  name: string
  source: (v: MapVersion) => string
}) {
  const { version, spots } = map
  const { width: W, height: H } = version
  const panZoom = useRef<PanZoomHandle>(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  // The tag's width, to keep it inside the frame, once it's drawn.
  const [tagWidth, setTagWidth] = useState(0)
  const tagRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setTagWidth(el.offsetWidth)
  }, [])
  // The zoom the home view opens at, once PanZoom has placed it.
  const [homeScale, setHomeScale] = useState<number>()
  const homing = useRef(false)
  const [scale, setScale] = useState(1)
  const areas = spots.filter((s) => s.shape === 'area')
  const pin = spots.find((s) => s.shape === 'pin')
  const box = spotsBox(spots)
  const framed = homeScale !== undefined && homeScale >= FRAMED_FROM
  const whole = scale < 1.05

  const home: PanZoomHome = (area) => {
    // Content px per image px, and where the (letterboxed) image starts.
    const s = Math.min(area.width / W, area.height / H)
    const ox = area.x + (area.width - W * s) / 2
    const oy = area.y + (area.height - H * s) / 2
    const r = contextBox(box, W, H)
    homing.current = true
    return {
      rect: {
        x: ox + r.x * s,
        y: oy + r.y * s,
        width: r.width * s,
        height: r.height * s,
      },
      // Keep the place clear of the zoom controls on the right.
      options: {
        padding: 24,
        maxScale: Math.min(4, 1.25 / s),
        inset: { right: 64 },
      },
    }
  }
  const onTransform = useCallback((t: Transform) => {
    setScale(t.scale)
    if (homing.current) {
      homing.current = false
      setHomeScale(t.scale)
    }
  }, [])
  const toggle = () =>
    whole ? panZoom.current?.reset() : panZoom.current?.showWhole()

  const overlay = ({ px }: MapView) => {
    const u = 1 / px
    const ring = pin && ringRadius(W, H, px)
    const clipId = `place-clip-${uid}`
    const spotId = `place-spot-${uid}`
    const softId = `place-soft-${uid}`
    return (
      <svg
        className="map-hotspots place-marker"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${name} ${pin ? 'circled' : 'outlined'} on a map of ${map.title}`}
      >
        <defs>
          {areas.length > 0 && (
            <clipPath id={clipId}>
              {areas.map((a) => (
                <polygon key={a.points} points={a.points} />
              ))}
            </clipPath>
          )}
          {pin && ring && (
            <>
              <radialGradient id={softId}>
                <stop offset="0.55" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </radialGradient>
              <mask
                id={spotId}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={W}
                height={H}
              >
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={ring + 24 * u}
                  fill={`url(#${softId})`}
                />
              </mask>
            </>
          )}
        </defs>
        {/* The place itself, crisp, over the greyed image. */}
        <image
          href={mapImageUrl(version.file)}
          width={W}
          height={H}
          preserveAspectRatio="none"
          {...(pin
            ? { mask: `url(#${spotId})` }
            : { clipPath: `url(#${clipId})` })}
        />
        {/* Every casing, then every line, so no piece covers another's line. */}
        {areas.map((a) => (
          <polygon
            key={`c${a.points}`}
            className="place-marker-casing"
            points={a.points}
            strokeWidth={5 * u}
          />
        ))}
        {pin && ring && (
          <circle
            className="place-marker-casing"
            cx={pin.x}
            cy={pin.y}
            r={ring}
            strokeWidth={5 * u}
          />
        )}
        {areas.map((a) => (
          <polygon
            key={`l${a.points}`}
            className="place-marker-line"
            points={a.points}
            strokeWidth={2 * u}
          />
        ))}
        {pin && ring && (
          <circle
            className="place-marker-line"
            cx={pin.x}
            cy={pin.y}
            r={ring}
            strokeWidth={2 * u}
          />
        )}
      </svg>
    )
  }

  const frameExtras = ({ transform: t, k, origin, px, frame }: MapView) => {
    if (!framed || !frame.width) return null
    // The place's box on screen.
    const ks = k * t.scale
    const bx = (origin.x + box.x * k) * t.scale + t.x
    const by = (origin.y + box.y * k) * t.scale + t.y
    const bw = box.width * ks
    const bh = box.height * ks
    if (t.scale < TAG_BELOW) {
      const ringPx = pin ? ringRadius(W, H, px) * px : 0
      let y = by - ringPx - 10
      const below = y - 34 < 0
      if (below) y = by + bh + ringPx + 10
      // A place spanning the frame has no room for a tag (and needs none).
      const hidden = below && y + 34 > frame.height
      const half = tagWidth / 2 + 6
      let x = Math.min(frame.width - half, Math.max(half, bx + bw / 2))
      const bottom = below ? y + 34 : y
      if (
        x + half > frame.width - CONTROLS.width &&
        bottom > frame.height - CONTROLS.height
      )
        x = frame.width - CONTROLS.width - half
      return (
        <div
          ref={tagRef}
          className={`place-tag${below ? ' is-below' : ''}`}
          style={{ left: x, top: y, visibility: hidden ? 'hidden' : undefined }}
          aria-hidden
        >
          {name}
        </div>
      )
    }
    // The view, in image px, for the overview inset.
    const view = {
      x: (-t.x / t.scale - origin.x) / k,
      y: (-t.y / t.scale - origin.y) / k,
      width: frame.width / ks,
      height: frame.height / ks,
    }
    const left = bx + bw / 2 > frame.width / 2
    const maskId = `place-inset-${uid}`
    return (
      <button
        type="button"
        className={`place-inset ${left ? 'is-left' : 'is-right'}`}
        aria-hidden
        tabIndex={-1}
        onClick={toggle}
      >
        <img src={mapImageUrl(version.file)} alt="" draggable={false} />
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={W}
              height={H}
            >
              <rect width={W} height={H} fill="#fff" />
              <rect {...view} fill="#000" />
            </mask>
          </defs>
          {areas.map((a) => (
            <polygon
              key={a.points}
              points={a.points}
              fill="var(--gold-soft)"
              fillOpacity={0.9}
              stroke="var(--map-casing)"
              strokeWidth={W / 300}
              strokeLinejoin="round"
            />
          ))}
          <rect
            width={W}
            height={H}
            fill="#0f1a22"
            fillOpacity={0.5}
            mask={`url(#${maskId})`}
          />
          {pin && (
            <>
              <circle
                cx={pin.x}
                cy={pin.y}
                r={W / 60}
                fill="none"
                stroke="var(--map-casing)"
                strokeWidth={W / 90}
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={W / 60}
                fill="none"
                stroke="var(--gold-soft)"
                strokeWidth={W / 220}
              />
            </>
          )}
          <rect
            {...view}
            fill="none"
            stroke="var(--map-casing)"
            strokeWidth={W / 80}
          />
          <rect
            {...view}
            fill="none"
            stroke="var(--gold-soft)"
            strokeWidth={W / 200}
          />
        </svg>
      </button>
    )
  }

  const captionStart = (
    <>
      <div className="place-key">
        {pin ? (
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            <circle
              className="place-marker-casing"
              cx="11"
              cy="11"
              r="7"
              strokeWidth="5"
            />
            <circle
              className="place-marker-line"
              cx="11"
              cy="11"
              r="7"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden>
            <rect width="28" height="18" fill="#0f1a22" opacity="0.55" />
            <rect
              x="5"
              y="4"
              width="18"
              height="10"
              rx="2"
              fill="#7d6a48"
              stroke="var(--map-casing)"
              strokeWidth="5"
            />
            <rect
              className="place-marker-line"
              x="5"
              y="4"
              width="18"
              height="10"
              rx="2"
              strokeWidth="2"
            />
          </svg>
        )}
        <span>
          <strong>{name}</strong> {pin ? 'circled' : 'outlined'} on the map of{' '}
          {map.title}
        </span>
      </div>
      {framed && (
        <div>
          <button
            type="button"
            className="map-edition place-toggle"
            onClick={toggle}
          >
            {whole ? `Back to ${name}` : `Show all of ${map.title}`}
          </button>
        </div>
      )}
    </>
  )

  return (
    <MapFigure
      map={map}
      version={version}
      source={source}
      spotlight
      home={home}
      panZoom={panZoom}
      onTransform={onTransform}
      overlay={overlay}
      frameExtras={frameExtras}
      captionStart={captionStart}
    />
  )
}
