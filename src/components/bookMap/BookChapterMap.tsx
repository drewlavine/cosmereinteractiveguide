import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { Link, useSearchParams } from 'react-router'
import { assetUrl } from '../../data/assetUrl'
import { characterPortraits } from '../../data/characterPortraits'
import type { MapPoint } from '../../data/journey'
import { journeyAtlas } from '../../data/journeyAtlas'
import { findPerson } from '../../data/people'
import {
  revealBookChapters,
  type ShownBookCast,
  type ShownBookChapters,
  type ShownBookPosition,
} from '../../data/reveal'
import { useBooksRead } from '../../state/booksRead'
import { useCanSee } from '../../state/reveal'
import { useLinkText } from '../LinkedText'
import { SpoilerNotice } from '../SpoilerNotice'
import { anchorOn, boundsOf, pathData } from '../journey/journeyGeometry'
import type { MapEngineHandle } from '../journey/MapEngine'
import { SvgMapEngine } from '../journey/SvgMapEngine'
import styles from './BookChapterMap.module.css'
import { castColour, honeycomb, initials } from './markers'
import { useBookScenes } from './useBookScenes'

/** Marker radius and gap, in screen pixels. */
const R = 16
const GAP = 4
/** Earlier chapters whose routes stay on the map, faded, for "Last 5". */
const TRAIL = 5
/** How long Play stays on each chapter. */
const PLAY_MS = 2600

const trails = [
  { id: 'chapter', label: 'This chapter', back: 0 },
  { id: 'recent', label: `Last ${TRAIL}`, back: TRAIL },
  { id: 'book', label: 'Whole book', back: Infinity },
] as const
type Trail = (typeof trails)[number]['id']
/** The least a chapter's view shows, as a share of the map's width. */
const MIN_VIEW = 0.12
/** Room around a chapter's points, so markers and labels at the edge show. */
const MARGIN = 0.3
/** How far a chapter's view may zoom in. */
const MAX_ZOOM = 3
/** Dimmed markers are smaller, so they crowd the chapter's less. */
const DIM_SCALE = 0.75

const person = (id: string) => {
  const p = findPerson(id)
  return p && { name: p.name, portraits: characterPortraits[id] }
}

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * A book's chapter map: where everyone is, chapter by chapter, up to the
 * reader's chapter, with a line on what happens. Renders nothing for a book
 * the reader hasn't started or one without scenes yet.
 */
export default function BookChapterMap({ bookId }: { bookId: string }) {
  const pack = useBookScenes(bookId)
  const canSee = useCanSee()
  const { viewAnyway } = useBooksRead()
  const scope = `book:${bookId}`
  const showAll = viewAnyway.has(scope)
  const shown = useMemo(
    () =>
      pack &&
      revealBookChapters(bookId, pack.events, journeyAtlas, canSee, {
        viewAnyway: showAll,
        credits: pack.credits,
        person,
      }),
    [bookId, pack, canSee, showAll],
  )
  if (!shown?.chapters.length) return null
  return <ChapterMapView key={bookId} shown={shown} scope={scope} />
}

function ChapterMapView({
  shown,
  scope,
}: {
  shown: ShownBookChapters
  scope: string
}) {
  const { chapters, cast, maps } = shown
  const link = useLinkText()
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const [params, setParams] = useSearchParams()
  const asked = chapters.findIndex((c) => c.id === params.get('ch'))
  const current = asked >= 0 ? asked : chapters.length - 1
  const chapter = chapters[current]
  const [choice, setChoice] = useState<{ chapter: string; mapId: string }>()
  const [trail, setTrail] = useState<Trail>('recent')
  const [showAway, setShowAway] = useState(true)
  const [following, setFollowing] = useState<ReadonlySet<string>>(new Set())
  const [playing, setPlaying] = useState(false)
  const engine = useRef<MapEngineHandle>(null)
  // Play from the end restarts at the first chapter; wait for the URL to catch up.
  const restarting = useRef(false)
  const track = useRef<HTMLDivElement>(null)
  const scrolled = useRef(false)

  // Keep the current chapter's point in view along the timeline.
  useEffect(() => {
    const box = track.current
    const at = box?.querySelector<HTMLElement>('[aria-current]')
    if (!box || !at) return
    const [b, a] = [box.getBoundingClientRect(), at.getBoundingClientRect()]
    const left = box.scrollLeft + a.left - b.left - b.width / 2 + a.width / 2
    const smooth = scrolled.current && !reducedMotion()
    box.scrollTo?.({ left, behavior: smooth ? 'smooth' : 'instant' })
    scrolled.current = true
  }, [current])

  const shows = (id: string) => !following.size || following.has(id)
  const follow = (id: string) =>
    setFollowing((f) => {
      const next = new Set(f)
      if (!next.delete(id)) next.add(id)
      return next
    })

  useEffect(() => {
    if (!playing) return
    if (current >= chapters.length - 1) {
      if (!restarting.current) setPlaying(false)
      return
    }
    restarting.current = false
    const t = setTimeout(() => go(current + 1), PLAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, current])

  const play = () => {
    if (!playing && current >= chapters.length - 1) {
      restarting.current = true
      go(0)
    }
    setPlaying(!playing)
  }

  const go = (i: number) => {
    const next = chapters[Math.max(0, Math.min(chapters.length - 1, i))]
    setParams(
      (p) => {
        p.set('ch', next.id)
        return p
      },
      { replace: true, preventScrollReset: true },
    )
  }

  // The chapter's main scene picks the map, unless the reader chose one.
  const main = chapter.scenes.find((s) => s.text) ?? chapter.scenes[0]
  const mapId =
    choice?.chapter === chapter.id ? choice.mapId : (main?.mapId ?? maps[0].id)
  const map = maps.find((m) => m.id === mapId) ?? maps[0]
  const castById = useMemo(
    () => new Map<string, ShownBookCast>(cast.map((c) => [c.id, c])),
    [cast],
  )
  const colourOf = (id: string) => castColour(castById.get(id)?.colour ?? 0)
  const nameOf = (id: string) => castById.get(id)?.name ?? id

  // A point on this map: its own, or the pin of the inner map (a city) it's on.
  const on = (mapOf: string, point: MapPoint): MapPoint | undefined =>
    mapOf === map.id ? point : anchorOn(maps, map.id, mapOf)

  // Everyone drawable on this map, grouped by spot, those here first.
  const placed = new Map<
    string,
    { at: MapPoint; people: ShownBookPosition[] }
  >()
  const elsewhere: ShownBookPosition[] = []
  for (const p of chapter.positions
    .filter((p) => shows(p.id) && (p.here || showAway))
    .toSorted((a, b) => Number(b.here) - Number(a.here))) {
    const at = on(p.mapId, p.point)
    if (!at) {
      elsewhere.push(p)
      continue
    }
    const key = at.join(',')
    if (!placed.has(key)) placed.set(key, { at, people: [] })
    placed.get(key)!.people.push(p)
  }

  const routes = (from: number, to: number) =>
    chapters
      .slice(Math.max(0, from), to + 1)
      .flatMap((c, i) =>
        c.scenes
          .filter(
            (s) =>
              s.mapId === map.id &&
              s.path.length > 1 &&
              s.characters.some(shows),
          )
          .map((s) => ({ ...s, now: from + i >= to })),
      )
  const back = trails.find((t) => t.id === trail)!.back
  const lines = routes(current - back, current)
  const labels = new Map<string, { id: string; at: MapPoint; name: string }>()
  for (const s of chapter.scenes) {
    const at = s.text && s.place && on(s.mapId, s.path.at(-1)!)
    if (at && !labels.has(at.join(',')))
      labels.set(at.join(','), { id: s.id, at, name: s.place!.name })
  }

  // Fly to where this chapter happens on the map shown.
  const focus = [
    ...chapter.positions
      .filter((p) => p.here && shows(p.id))
      .flatMap((p) => {
        const at = on(p.mapId, p.point)
        return at ? [at] : []
      }),
    ...lines.filter((l) => l.now).flatMap((l) => l.path),
  ]
  const focusKey = `${map.id}|${chapter.id}|${[...following]}`
  useEffect(() => {
    const [w, h] = [map.image.width, map.image.height]
    const spread = focus.length ? boundsOf(focus, 0) : undefined
    const box = spread
      ? boundsOf(
          [
            [
              spread.x - spread.width * MARGIN,
              spread.y - spread.height * MARGIN,
            ],
            [
              spread.x + spread.width * (1 + MARGIN),
              spread.y + spread.height * (1 + MARGIN),
            ],
          ],
          w * MIN_VIEW,
        )
      : { x: 0, y: 0, width: w, height: h }
    // Let the engine size itself first.
    const t = setTimeout(() =>
      engine.current?.flyTo(box, {
        animate: !reducedMotion(),
        maxZoom: MAX_ZOOM,
      }),
    )
    return () => clearTimeout(t)
    // Only when the chapter or map changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).matches('input, textarea')) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setPlaying(false)
    if (e.key === 'ArrowLeft') go(current - 1)
    else if (e.key === 'ArrowRight') go(current + 1)
    else return
    e.preventDefault()
  }

  // Runs of chapters in the same part (or none, e.g. a prologue).
  const parts: { part?: string; from: number; to: number }[] = []
  chapters.forEach((c, i) => {
    const last = parts.at(-1)
    if (last && last.part === c.part) last.to = i + 1
    else parts.push({ part: c.part, from: i, to: i + 1 })
  })
  const here = chapter.positions.filter((p) => p.here)
  const away = chapter.positions.filter((p) => !p.here)

  return (
    <section
      className={styles.root}
      aria-labelledby={`${uid}-title`}
      onKeyDown={onKey}
    >
      <h2 id={`${uid}-title`} className={styles.title}>
        Chapter by chapter
      </h2>
      <SpoilerNotice scope={scope} spoilers={shown.spoilers} />

      <div className={styles.layout}>
        <div className={styles.stage}>
          {maps.length > 1 && (
            <div className={styles.maps} role="group" aria-label="Map">
              {maps.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={m.id === map.id}
                  onClick={() =>
                    setChoice({ chapter: chapter.id, mapId: m.id })
                  }
                >
                  {m.title}
                </button>
              ))}
            </div>
          )}
          <div className={styles.tools}>
            <div role="group" aria-label="Routes">
              {trails.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={trail === t.id}
                  onClick={() => setTrail(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={showAway}
              onClick={() => setShowAway(!showAway)}
            >
              Others
            </button>
          </div>
          <SvgMapEngine
            key={map.id}
            ref={engine}
            image={map.image}
            label={`Map of ${map.title} at ${chapter.label}`}
            layers={(zoom) => (
              <>
                <defs>
                  <clipPath
                    id={`${uid}-clip`}
                    clipPathUnits="objectBoundingBox"
                  >
                    <circle cx="0.5" cy="0.5" r="0.5" />
                  </clipPath>
                  <filter id={`${uid}-grey`}>
                    <feColorMatrix type="saturate" values="0" />
                  </filter>
                </defs>
                {lines.map((l) => (
                  <path
                    key={l.id}
                    d={pathData(l.path)}
                    className={l.now ? styles.route : styles.trail}
                    stroke={colourOf(l.characters.find(shows)!)}
                    strokeWidth={(l.now ? 4 : 2.5) / zoom}
                    strokeDasharray={
                      l.approximate ? `${8 / zoom} ${6 / zoom}` : undefined
                    }
                  />
                ))}
                {[...placed.values()]
                  .flatMap(({ at, people }) => {
                    const offsets = honeycomb(people.length)
                    const step = (2 * R + GAP) / zoom
                    return people.map((p, i) => ({
                      p,
                      x: at[0] + offsets[i][0] * step,
                      y: at[1] + offsets[i][1] * step,
                    }))
                  })
                  // Those in the chapter drawn last, on top.
                  .toSorted((a, b) => Number(a.p.here) - Number(b.p.here))
                  .map(({ p, x, y }) => (
                    <Marker
                      key={p.id}
                      x={x}
                      y={y}
                      zoom={zoom}
                      name={nameOf(p.id)}
                      colour={colourOf(p.id)}
                      here={p.here}
                      portrait={p.portrait?.src}
                      uid={uid}
                      onOpen={
                        p.mapId === map.id
                          ? undefined
                          : () =>
                              setChoice({ chapter: chapter.id, mapId: p.mapId })
                      }
                    />
                  ))}
                {[...labels.values()].map((l) => {
                  const crowd = placed.get(l.at.join(','))?.people.length ?? 1
                  const rings = Math.ceil((Math.sqrt(12 * crowd - 3) - 3) / 6)
                  const below = (rings * (2 * R + GAP) + R + 16) / zoom
                  return (
                    <text
                      key={l.id}
                      x={l.at[0]}
                      y={l.at[1] + below}
                      className={styles.placeLabel}
                      fontSize={13 / zoom}
                      strokeWidth={3 / zoom}
                    >
                      {l.name}
                    </text>
                  )
                })}
              </>
            )}
          />
        </div>

        <div className={styles.panel}>
          <section aria-label="This chapter" className={styles.chapter}>
            <h3 aria-live="polite">
              {chapter.part && (
                <span className={styles.part}>{chapter.part}</span>
              )}
              {chapter.label}
            </h3>
            <ul className={styles.scenes}>
              {chapter.scenes
                .filter((s) => s.text)
                .map((s) => (
                  <li key={s.id}>
                    {s.place && (
                      <strong className={styles.where}>
                        {s.place.href ? (
                          <Link to={s.place.href}>{s.place.name}</Link>
                        ) : (
                          s.place.name
                        )}
                      </strong>
                    )}
                    {link(s.text!)}
                  </li>
                ))}
            </ul>
          </section>

          <section aria-label="Characters" className={styles.cast}>
            <p className={styles.hint}>
              {following.size ? (
                <button type="button" onClick={() => setFollowing(new Set())}>
                  Show everyone
                </button>
              ) : (
                'Pick characters to follow.'
              )}
            </p>
            <ul>
              {[...here, ...away].map((p) => (
                <li
                  key={p.id}
                  className={
                    p.here ? styles.chip : `${styles.chip} ${styles.away}`
                  }
                  style={{ '--ring': colourOf(p.id) } as CSSProperties}
                >
                  <button
                    type="button"
                    aria-pressed={following.has(p.id)}
                    className={shows(p.id) ? undefined : styles.muted}
                    onClick={() => follow(p.id)}
                  >
                    {p.portrait ? (
                      <img
                        className={styles.face}
                        src={assetUrl(p.portrait.src)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className={styles.face} aria-hidden="true">
                        {initials(nameOf(p.id))}
                      </span>
                    )}
                    <span>
                      {nameOf(p.id)}
                      {!p.here && (
                        <span className={styles.status}>
                          {' '}
                          (not in this chapter)
                        </span>
                      )}
                      {elsewhere.includes(p) && (
                        <span className={styles.status}> (on another map)</span>
                      )}
                    </span>
                  </button>
                  <Link
                    to={`/characters/${p.id}`}
                    className={styles.page}
                    aria-label={`${nameOf(p.id)}’s page`}
                    title={`${nameOf(p.id)}’s page`}
                  >
                    ↗
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className={styles.scrubber}>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            go(current - 1)
          }}
          disabled={current === 0}
          aria-label="Previous chapter"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={play}
          aria-label={playing ? 'Pause' : 'Play'}
          className={styles.play}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <div className={styles.track} ref={track}>
          <ol aria-label="Chapters">
            {parts.map(({ part, from, to }) => (
              <li key={from} className={styles.group}>
                <span className={styles.partName} aria-hidden={!part}>
                  {part ?? '\u00a0'}
                </span>
                <ol>
                  {chapters.slice(from, to).map((c, j) => {
                    const i = from + j
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          aria-label={part ? `${c.label}, ${part}` : c.label}
                          aria-current={i === current ? 'step' : undefined}
                          className={i < current ? styles.past : undefined}
                          onClick={() => {
                            setPlaying(false)
                            go(i)
                          }}
                        >
                          <span className={styles.dot} />
                          {c.label.replace(/^Chapter /, '')}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            go(current + 1)
          }}
          disabled={current === chapters.length - 1}
          aria-label="Next chapter"
        >
          ›
        </button>
      </div>
      <p className={styles.credit}>
        Map:{' '}
        {map.credit.url ? (
          <a href={map.credit.url} target="_blank" rel="noreferrer">
            {map.credit.text}
          </a>
        ) : (
          map.credit.text
        )}
      </p>
    </section>
  )
}

/** A character on the map: their art in a ring of their colour. */
function Marker({
  x,
  y,
  zoom,
  name,
  colour,
  here,
  portrait,
  uid,
  onOpen,
}: {
  x: number
  y: number
  zoom: number
  name: string
  colour: string
  here: boolean
  portrait?: string
  uid: string
  /** Opens the inner map (a city) this marker stands for. */
  onOpen?: () => void
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${(here ? 1 : DIM_SCALE) / zoom})`}
      className={[
        styles.marker,
        here ? '' : styles.dim,
        onOpen ? styles.opens : '',
      ].join(' ')}
      onClick={onOpen}
    >
      <title>
        {here ? name : `${name} (last seen here)`}
        {onOpen ? ' · click to zoom in' : ''}
      </title>
      <circle r={R + 2.5} className={styles.backing} />
      {portrait ? (
        <image
          href={assetUrl(portrait)}
          x={-R}
          y={-R}
          width={2 * R}
          height={2 * R}
          preserveAspectRatio="xMidYMin slice"
          clipPath={`url(#${uid}-clip)`}
          filter={here ? undefined : `url(#${uid}-grey)`}
        />
      ) : (
        <>
          <circle r={R} fill={colour} />
          <text className={styles.initials} dy="0.35em">
            {initials(name)}
          </text>
        </>
      )}
      <circle
        r={R}
        fill="none"
        stroke={colour}
        strokeWidth={3.5}
        strokeDasharray={here ? undefined : '5 3'}
      />
    </g>
  )
}
