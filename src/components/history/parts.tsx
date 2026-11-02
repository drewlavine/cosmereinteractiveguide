import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { interactiveMaps, mapImageUrl } from '../../data/maps'
import type { MarkedMap, PlaceSpot } from '../../data/maps'
import { useBooksRead } from '../../state/booksRead'
import { useCanSee } from '../../state/reveal'
import { PortraitArt } from '../ArtViewer'
import { PlanetGlobe } from '../PlanetGlobe'
import {
  kindLabels,
  sourceLine,
  toneStyle,
  type HistoryProps,
  type Step,
} from './helpers'
import s from './history.module.css'

/** A moment's words: kind, title, text, places and where it was told. */
export function MomentText({
  step: { era, moment },
  props,
  heading: Heading = 'h4',
  showEra = true,
}: {
  step: Step
  props: HistoryProps
  heading?: 'h3' | 'h4'
  showEra?: boolean
}) {
  return (
    <>
      <p className={s.kicker}>
        <span className={s.kind} data-kind={moment.kind}>
          {kindLabels[moment.kind]}
        </span>
        {showEra && (
          <span>
            {era.title}
            {era.when && ` · ${era.when}`}
          </span>
        )}
      </p>
      <Heading className={s.title}>{moment.title}</Heading>
      <p className={s.text}>{props.link(moment.text)}</p>
      {moment.places.length > 0 && (
        <ul className={s.places} aria-label="Where it happened">
          {moment.places.map((place) => (
            <li key={place.id}>
              <Link to={props.placeHref(place.id)}>{place.name}</Link>
            </li>
          ))}
        </ul>
      )}
      <p className={s.source}>{sourceLine(moment)}</p>
    </>
  )
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))

/** The stage's width over its height, kept up to date. */
function useAspect(fallback: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [aspect, setAspect] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(([{ contentRect: r }]) => {
      if (r.width && r.height) setAspect(r.width / r.height)
    })
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  return [ref, aspect] as const
}

/**
 * The picture beside a moment: the map flown to where it happened, else its
 * art, else the world itself.
 */
export function Stage({ step, props }: { step: Step; props: HistoryProps }) {
  const { hasRead } = useBooksRead()
  const canSee = useCanSee()
  const [ref, aspect] = useAspect(4 / 3)
  const { era, moment } = step
  const { planet } = props
  if (!planet) return null
  const maps = interactiveMaps(
    planet.id,
    props.showAll ? () => true : hasRead,
    (place) => props.showAll || canSee(place.revealedIn),
  )
  const ids = new Set(moment.places.map((p) => p.id))
  const marks = (m: MarkedMap<PlaceSpot>) =>
    m.spots.filter((spot) => ids.has(spot.location.id))
  // The map stays mounted between moments so it can fly from place to place.
  const map = maps.find((m) => marks(m).length) ?? maps[0]
  const view = map && frame(map, marks(map), aspect)
  const mode = view?.places.length ? 'map' : moment.art ? 'art' : 'world'
  // Beside a map the art takes the first corner clear of the marked places.
  const corner =
    mode === 'map'
      ? (['br', 'bl', 'tr', 'tl'] as const).find(
          ([v, h]) =>
            !view!.places.some(
              ({ x, y }) =>
                (h === 'r' ? x > view!.vw * 0.6 : x < view!.vw * 0.4) &&
                (v === 'b' ? y > view!.vh * 0.4 : y < view!.vh * 0.6),
            ),
        )
      : undefined
  return (
    <div
      ref={ref}
      className={s.stage}
      data-mode={mode}
      data-corner={corner}
      style={toneStyle(era.tone)}
    >
      <svg className={s.world} viewBox="-160 -160 320 320" aria-hidden>
        <PlanetGlobe planet={planet} cx={0} cy={0} r={120} />
      </svg>
      {map && view && (
        <MapLayer key={map.id} map={map} view={view} stepKey={moment.id} />
      )}
      {moment.art && (
        <PortraitArt
          key={moment.art.src}
          className={s.art}
          src={moment.art.src}
          alt={moment.art.alt}
          artist={moment.art.artist}
          artistUrl={moment.art.artistUrl}
        />
      )}
    </div>
  )
}

const pointsOf = (spot: PlaceSpot) =>
  spot.shape === 'pin'
    ? [[spot.x, spot.y]]
    : spot.points
        .trim()
        .split(/\s+/)
        .map((xy) => xy.split(',').map(Number))

const boxOf = (points: number[][]) => {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const [x0, x1, y0, y1] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }
}

/**
 * The view of a map cut to the stage's shape and zoomed onto the marked
 * places, with where each place lands in it.
 */
function frame(map: MarkedMap<PlaceSpot>, spots: PlaceSpot[], aspect: number) {
  const { width: w, height: h } = map.version
  // The view covers the map at 1×; (ox, oy) centres the map in it.
  const [vw, vh] = w / h > aspect ? [h * aspect, h] : [w, w / aspect]
  const [ox, oy] = [(vw - w) / 2, (vh - h) / 2]
  let [k, tx, ty] = [1, 0, 0]
  if (spots.length) {
    const box = boxOf(spots.flatMap(pointsOf))
    const span = Math.max((box.x1 - box.x0) / vw, (box.y1 - box.y0) / vh)
    k = clamp(0.45 / Math.max(span, 0.01), 1, 2.6)
    tx = clamp(vw / 2 - k * (box.cx + ox), vw - k * (ox + w), -k * ox)
    ty = clamp(vh / 2 - k * (box.cy + oy), vh - k * (oy + h), -k * oy)
  }
  const ids = [...new Set(spots.map((spot) => spot.location.id))]
  const places = ids.map((id) => {
    const own = spots.filter((spot) => spot.location.id === id)
    const box = boxOf(own.flatMap(pointsOf))
    return {
      spot: own[0],
      x: k * (box.cx + ox) + tx,
      y: k * (box.cy + oy) + ty,
    }
  })
  return { w, h, vw, vh, ox, oy, k, tx, ty, spots, places }
}

/** A map flown (with a CSS transition) to its frame, the places pinned and named. */
function MapLayer({
  map,
  view: { w, h, vw, vh, ox, oy, k, tx, ty, spots, places },
  stepKey,
}: {
  map: MarkedMap<PlaceSpot>
  view: ReturnType<typeof frame>
  stepKey: string
}) {
  const unit = Math.min(vw, vh) / 100
  const names = places.map(({ spot }) => spot.location.name)
  return (
    <svg
      className={s.map}
      viewBox={`0 0 ${vw} ${vh}`}
      role={names.length ? 'img' : undefined}
      aria-label={
        names.length
          ? `${map.title} map, marking ${names.join(' and ')}`
          : undefined
      }
      aria-hidden={names.length ? undefined : true}
    >
      <g
        className={s.zoom}
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${k})` }}
      >
        <g transform={`translate(${ox} ${oy})`}>
          <image href={mapImageUrl(map.version.file)} width={w} height={h} />
          {spots.map(
            (spot) =>
              spot.shape === 'area' && (
                <polygon
                  key={spot.points}
                  className={s.area}
                  points={spot.points}
                />
              ),
          )}
        </g>
      </g>
      <g key={stepKey} className={s.marks}>
        {places.map(({ spot, x, y }) => {
          const pin = spot.shape === 'pin'
          const anchor =
            x < vw * 0.25 ? 'start' : x > vw * 0.75 ? 'end' : 'middle'
          return (
            <g key={spot.location.id}>
              {pin && (
                <>
                  <circle className={s.pulse} cx={x} cy={y} r={unit * 2.4} />
                  <circle className={s.pin} cx={x} cy={y} r={unit * 1.4} />
                </>
              )}
              <text
                className={s.label}
                x={x}
                y={Math.max(pin ? y - unit * 3.2 : y, unit * 5.5)}
                fontSize={unit * 4.6}
                textAnchor={anchor}
              >
                {spot.location.name}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
