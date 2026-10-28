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
import { facePortraits } from '../../data/faces'
import type { MapPoint } from '../../data/journey'
import { journeyAtlas } from '../../data/journeyAtlas'
import { featuresOf, type FoundFeature } from '../../data/pageFeatures'
import { findPerson } from '../../data/people'
import {
  revealBookChapters,
  type ShownBookCast,
  type ShownBookChapters,
  type ShownBookPin,
  type ShownBookPosition,
} from '../../data/reveal'
import { useBooksRead } from '../../state/booksRead'
import { useCanSee } from '../../state/reveal'
import { useLinkText } from '../LinkedText'
import { FeatureIcon } from '../PageFeatures'
import { SpoilerNotice } from '../SpoilerNotice'
import { anchorOn, boundsOf, pathData } from '../journey/journeyGeometry'
import type { MapEngineHandle } from '../journey/MapEngine'
import { SvgMapEngine } from '../journey/SvgMapEngine'
import { useFullscreen } from '../journey/useFullscreen'
import { FullscreenIcon } from '../FullscreenIcon'
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
  {
    id: 'chapter',
    label: 'This chapter',
    back: 0,
    tip: 'Show only the routes travelled in this chapter',
  },
  {
    id: 'recent',
    label: `Last ${TRAIL}`,
    back: TRAIL,
    tip: `Show the routes from the last ${TRAIL} chapters`,
  },
  {
    id: 'book',
    label: 'Whole book',
    back: Infinity,
    tip: 'Show every route in the book so far',
  },
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
  return (
    p && { name: p.name, portraits: facePortraits(id, characterPortraits[id]) }
  )
}

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * A book's chapter map: where the characters are, chapter by chapter, up to the
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
        dates: pack.dates,
        pins: pack.pins,
        notable: pack.notable,
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
  const { chapters, cast, maps, pins } = shown
  const link = useLinkText()
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const [params, setParams] = useSearchParams()
  const asked = chapters.findIndex((c) => c.id === params.get('ch'))
  const current = asked >= 0 ? asked : chapters.length - 1
  const chapter = chapters[current]
  const [choice, setChoice] = useState<{ chapter: string; mapId: string }>()
  const [trail, setTrail] = useState<Trail>('recent')
  const [showAway, setShowAway] = useState(true)
  const [showEvents, setShowEvents] = useState(true)
  const [following, setFollowing] = useState<ReadonlySet<string>>(new Set())
  const [playing, setPlaying] = useState(false)
  const engine = useRef<MapEngineHandle>(null)
  // Play from the end restarts at the first chapter; wait for the URL to catch up.
  const restarting = useRef(false)
  const track = useRef<HTMLDivElement>(null)
  const scrolled = useRef(false)
  const frame = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLElement>(null)
  const drawer = useRef<HTMLElement>(null)
  const fullscreen = useFullscreen(frame)
  const [castOpen, setCastOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(true)
  // Bumped when the browser goes in or out of full screen, to fly again.
  const [screens, setScreens] = useState(0)
  useEffect(() => {
    const again = () => setScreens((n) => n + 1)
    document.addEventListener('fullscreenchange', again)
    return () => document.removeEventListener('fullscreenchange', again)
  }, [])

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
  const canSee = useCanSee()
  // Each character's own journey, if their page shows one.
  const journeys = useMemo(
    () =>
      new Map<string, FoundFeature | undefined>(
        cast.map((c) => {
          const person = findPerson(c.id)
          return [
            c.id,
            person &&
              featuresOf('character', person, { canSee }).find(
                (f) => f.feature.id === 'journey',
              ),
          ]
        }),
      ),
    [cast, canSee],
  )
  const castById = useMemo(
    () => new Map<string, ShownBookCast>(cast.map((c) => [c.id, c])),
    [cast],
  )
  const colourOf = (id: string) => castColour(castById.get(id)?.colour ?? 0)
  // Where each scene's lead set out from: their last place before it.
  const fromOf = useMemo(() => {
    const from = new Map<string, string>()
    const lastAt = new Map<string, string>()
    for (const c of chapters)
      for (const s of c.scenes) {
        const to = s.place?.name
        const was = s.characters[0] && lastAt.get(s.characters[0])
        if (was && was !== to) from.set(s.id, was)
        if (to && !s.flashback)
          for (const id of s.characters) lastAt.set(id, to)
      }
    return from
  }, [chapters])
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
    .filter(
      (p) =>
        shows(p.id) &&
        (p.here ||
          (showAway && (castById.get(p.id)?.notable || following.has(p.id)))),
    )
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
    chapters.slice(Math.max(0, from), to + 1).flatMap((c, i) =>
      c.scenes
        .filter(
          (s) =>
            s.mapId === map.id && s.path.length > 1 && s.characters.some(shows),
        )
        .map((s) => ({
          ...s,
          now: from + i >= to,
          at: Math.max(0, from) + i,
        })),
    )
  const back = trails.find((t) => t.id === trail)!.back
  const lines = routes(current - back, current)
  const labels = new Map<string, { id: string; at: MapPoint; name: string }>()
  for (const s of chapter.scenes) {
    const at = s.text && s.place && on(s.mapId, s.path.at(-1)!)
    if (at && !labels.has(at.join(',')))
      labels.set(at.join(','), { id: s.id, at, name: s.place!.name })
  }

  // A chapter, keeping the map the reader is looking at.
  const visit = (i: number) => {
    setPlaying(false)
    setChoice({ chapter: chapters[i].id, mapId: map.id })
    go(i)
  }

  // Every place visited so far on this map, with what happened there.
  const visited = new Map<
    string,
    {
      at: MapPoint
      name: string
      kind?: string
      seen: { i: number; text: string }[]
    }
  >()
  chapters.slice(0, current + 1).forEach((c, i) =>
    c.scenes.forEach((s) => {
      const at = s.place && on(s.mapId, s.path.at(-1)!)
      if (!at || !s.place) return
      const key = s.place.id ?? s.place.name
      if (!visited.has(key))
        visited.set(key, {
          at,
          name: s.place.name,
          kind: s.place.kind,
          seen: [],
        })
      if (s.text) visited.get(key)!.seen.push({ i, text: s.text })
    }),
  )
  const placeTip = (v: NonNullable<ReturnType<typeof visited.get>>) => {
    const recent = v.seen.toReversed().slice(0, 3)
    const earlier = v.seen.length - recent.length
    const last = v.seen.at(-1)
    return [
      `${v.name}${v.kind ? ` (${v.kind.toLowerCase()})` : ''}`,
      ...recent.map((e) => `${chapters[e.i].label}: ${e.text}`),
      earlier ? `…and ${earlier} earlier` : '',
      last && last.i !== current
        ? `Click to go to ${chapters[last.i].label}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')
  }
  const placeAt = (at: MapPoint) =>
    [...visited.values()].find((v) => v.at.join(',') === at.join(','))

  // Turning points the reader knows of by this chapter, on this map.
  const shownPins = showEvents
    ? pins.flatMap((p) => {
        const at = p.from <= current && on(p.mapId, p.point)
        return at ? [{ ...p, at, now: p.chapter === chapter.id }] : []
      })
    : []

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
  const focusKey = `${map.id}|${chapter.id}|${[...following]}|${fullscreen.active}|${screens}`
  // Screen pixels the chapter card and character list cover, so the
  // chapter is centred in the clear part of the map.
  const covered = () => {
    const s = stage.current?.getBoundingClientRect()
    if (!s?.width) return undefined
    const c = card.current
    const d = drawer.current
    return {
      right:
        c && getComputedStyle(c).position === 'absolute'
          ? Math.max(0, s.right - c.getBoundingClientRect().left)
          : 0,
      left: d ? Math.max(0, d.getBoundingClientRect().right - s.left) : 0,
    }
  }
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
        inset: covered(),
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

  const arrowColours = [
    ...new Set(lines.map((l) => colourOf(l.characters.find(shows)!))),
  ]

  const layers = (zoom: number) => (
    <>
      <defs>
        <clipPath id={`${uid}-clip`} clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.5" />
        </clipPath>
        <filter id={`${uid}-grey`}>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        {arrowColours.map((c, i) => (
          <marker
            key={c}
            id={`${uid}-arrow-${i}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="3"
            markerHeight="3"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={c} />
          </marker>
        ))}
      </defs>
      {lines.map((l) => {
        const d = pathData(l.path)
        const width = (l.now ? 4 : 3) / zoom
        const who = l.characters.filter(shows).map(nameOf)
        const when = chapters[l.at].label
        const to = l.place?.name
        const from = fromOf.get(l.id)
        const colour = colourOf(l.characters.find(shows)!)
        const tip = [
          `${when}: ${listNames(who)}${from ? ` from ${from}` : ''}${to ? ` to ${to}` : ''}`,
          l.text?.replace(/\.$/, ''),
          l.approximate ? 'Route approximate' : '',
          l.now ? '' : 'Click to go to that chapter',
        ]
          .filter(Boolean)
          .join('. ')
        return (
          <g key={l.id} className={l.now ? styles.route : styles.trail}>
            <path
              d={d}
              className={styles.casing}
              strokeWidth={width + 2.5 / zoom}
            />
            <path
              d={d}
              stroke={colour}
              markerEnd={`url(#${uid}-arrow-${arrowColours.indexOf(colour)})`}
              strokeWidth={width}
              strokeDasharray={
                l.approximate ? `${8 / zoom} ${6 / zoom}` : undefined
              }
            />
            <path
              d={d}
              className={styles.hit}
              strokeWidth={14 / zoom}
              role={l.now ? 'img' : 'button'}
              aria-label={tip}
              data-tooltip={tip}
              onClick={l.now ? undefined : () => visit(l.at)}
            />
          </g>
        )
      })}
      {[...visited.values()]
        .filter((v) => !placed.has(v.at.join(',')))
        .map((v) => {
          const last = v.seen.at(-1)
          return (
            <circle
              key={v.at.join(',')}
              cx={v.at[0]}
              cy={v.at[1]}
              r={5 / zoom}
              strokeWidth={2 / zoom}
              className={styles.placeDot}
              role="button"
              aria-label={v.name}
              data-tooltip={placeTip(v)}
              onClick={last ? () => visit(last.i) : undefined}
            />
          )
        })}
      {shownPins.map((p) => (
        <g
          key={p.id}
          transform={`translate(${p.at[0]} ${p.at[1]}) scale(${1 / zoom})`}
          className={[styles.pin, p.now ? styles.pinNow : ''].join(' ')}
          role="button"
          aria-label={p.title}
          data-tooltip={[
            `${p.title} (${chapters.find((c) => c.id === p.chapter)?.label})`,
            p.text,
            p.now ? '' : 'Click to go to that chapter',
          ]
            .filter(Boolean)
            .join('\n')}
          onClick={
            p.now
              ? undefined
              : () => visit(chapters.findIndex((c) => c.id === p.chapter))
          }
        >
          <rect
            x={-11}
            y={-11}
            width={22}
            height={22}
            rx={3}
            transform="rotate(45)"
          />
          <text dy="0.35em">{PIN_GLYPHS[p.kind]}</text>
        </g>
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
        .map(({ p, x, y }) => {
          const name = nameOf(p.id)
          const seen = chapters.find((c) => c.id === p.chapter)?.label
          const inner = p.mapId !== map.id && maps.find((m) => m.id === p.mapId)
          const action = !p.here
            ? {
                label: `${name}, last seen here in ${seen}`,
                tip: `last seen here in ${seen}. Click to go to that chapter`,
                run: () => visit(chapters.findIndex((c) => c.id === p.chapter)),
              }
            : inner
              ? {
                  label: `${name}, in ${inner.title}`,
                  tip: `in ${inner.title}. Click to zoom in`,
                  run: () => setChoice({ chapter: chapter.id, mapId: p.mapId }),
                }
              : {
                  label: name,
                  tip: following.has(p.id)
                    ? 'click to stop following'
                    : 'click to follow them on this map',
                  run: () => follow(p.id),
                }
          return (
            <Marker
              key={p.id}
              x={x}
              y={y}
              zoom={zoom}
              name={name}
              colour={colourOf(p.id)}
              here={p.here}
              portrait={p.portrait?.src}
              uid={uid}
              label={action.label}
              description={p.role}
              tip={
                p.role
                  ? `${name}\n${p.role}\n${action.tip[0].toUpperCase()}${action.tip.slice(1)}`
                  : `${name}: ${action.tip}`
              }
              zooms={!!inner && p.here}
              onClick={action.run}
            />
          )
        })}
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
            data-tooltip={(() => {
              const v = placeAt(l.at)
              return v ? placeTip(v) : undefined
            })()}
            fontSize={13 / zoom}
            strokeWidth={3 / zoom}
          >
            {l.name}
          </text>
        )
      })}
    </>
  )

  const castList = (people: ShownBookPosition[]) => (
    <ul>
      {people.map((p) => (
        <li
          key={p.id}
          className={p.here ? styles.chip : `${styles.chip} ${styles.away}`}
          style={{ '--ring': colourOf(p.id) } as CSSProperties}
        >
          <button
            type="button"
            aria-pressed={following.has(p.id)}
            aria-description={p.role}
            className={shows(p.id) ? undefined : styles.muted}
            data-tooltip={[
              p.role,
              following.has(p.id)
                ? `Stop following ${nameOf(p.id)}`
                : `Follow ${nameOf(p.id)}: highlight them and their routes on the map`,
            ]
              .filter(Boolean)
              .join('\n')}
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
                <span className={styles.status}> (not in this chapter)</span>
              )}
              {elsewhere.includes(p) && (
                <span className={styles.status}> (on another map)</span>
              )}
            </span>
          </button>
          <JourneyLink
            id={p.id}
            name={nameOf(p.id)}
            found={journeys.get(p.id)}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <section className={styles.root} aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className={styles.title}>
        Chapter by chapter
      </h2>
      <SpoilerNotice scope={scope} spoilers={shown.spoilers} />

      <div
        ref={frame}
        className={[
          styles.frame,
          fullscreen.active ? styles.full : '',
          fullscreen.overlay ? styles.overlay : '',
        ].join(' ')}
        onKeyDown={onKey}
      >
        <div className={styles.view}>
          <div className={styles.stage} ref={stage}>
            <div className={styles.topLeft}>
              <button
                type="button"
                className={styles.round}
                aria-label="Full screen"
                aria-pressed={fullscreen.active}
                data-tooltip={
                  fullscreen.active
                    ? 'Leave full screen (Esc)'
                    : 'Show the map full screen'
                }
                onClick={fullscreen.toggle}
              >
                <FullscreenIcon exit={fullscreen.active} />
              </button>
              {maps.length > 1 && (
                <div className={styles.maps} role="group" aria-label="Map">
                  {maps.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={m.id === map.id}
                      data-tooltip={`Show the map of ${m.title}`}
                      onClick={() =>
                        setChoice({ chapter: chapter.id, mapId: m.id })
                      }
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
              className={
                castOpen ? `${styles.tools} ${styles.shifted}` : styles.tools
              }
            >
              <button
                type="button"
                className={styles.castButton}
                aria-expanded={castOpen}
                aria-controls={`${uid}-cast`}
                data-tooltip={
                  castOpen
                    ? 'Close the character list'
                    : 'Open the character list: follow characters on the map, or open their journeys'
                }
                onClick={() => setCastOpen(!castOpen)}
              >
                Characters
                <span className={styles.count}>
                  {following.size
                    ? ` · following ${following.size}`
                    : ` · ${here.length + away.length}`}
                </span>
              </button>
              <div role="group" aria-label="Routes">
                {trails.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={trail === t.id}
                    data-tooltip={t.tip}
                    onClick={() => setTrail(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-pressed={showAway}
                data-tooltip={
                  showAway
                    ? 'Hide the main characters who aren’t in this chapter'
                    : 'Show where the main characters not in this chapter were last seen'
                }
                onClick={() => setShowAway(!showAway)}
              >
                Others
              </button>
              {pins.length > 0 && (
                <button
                  type="button"
                  aria-pressed={showEvents}
                  data-tooltip={
                    showEvents
                      ? 'Hide the pins for key events'
                      : 'Show pins for key events: battles, deaths, discoveries and meetings'
                  }
                  onClick={() => setShowEvents(!showEvents)}
                >
                  Events
                </button>
              )}
            </div>
            {castOpen && (
              <section
                id={`${uid}-cast`}
                ref={drawer}
                aria-label="Characters"
                className={styles.drawer}
                onKeyDown={(e) => {
                  if (e.key !== 'Escape') return
                  e.stopPropagation()
                  setCastOpen(false)
                }}
              >
                <div className={styles.drawerHead}>
                  <h3>Characters</h3>
                  <button
                    type="button"
                    className={styles.close}
                    aria-label="Close the character list"
                    data-tooltip="Close the character list"
                    onClick={() => setCastOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <p className={styles.hint}>
                  {following.size ? (
                    <button
                      type="button"
                      data-tooltip="Stop following and show the usual characters on the map again"
                      onClick={() => setFollowing(new Set())}
                    >
                      Stop following
                    </button>
                  ) : (
                    'Pick characters to follow them on this map.'
                  )}
                </p>
                {here.length > 0 && (
                  <>
                    <h4>In this chapter</h4>
                    {castList(here)}
                  </>
                )}
                {away.length > 0 && (
                  <>
                    <h4>Elsewhere</h4>
                    {castList(away)}
                  </>
                )}
              </section>
            )}
            <SvgMapEngine
              key={map.id}
              ref={engine}
              image={map.image}
              label={`Map of ${map.title} at ${chapter.label}`}
              layers={layers}
            />
          </div>

          <section ref={card} aria-label="This chapter" className={styles.card}>
            <div className={styles.cardHead}>
              <h3 aria-live="polite">
                {chapter.part && (
                  <span className={styles.part}>{chapter.part}</span>
                )}
                {chapter.label}
                {chapter.date && (
                  <span
                    className={styles.date}
                    data-tooltip={
                      chapter.date.carried
                        ? 'About when: this chapter isn’t dated, so this is the last dated chapter’s date'
                        : chapter.date.circa
                          ? 'An estimated date'
                          : 'When this chapter happens'
                    }
                  >
                    {chapter.date.carried || chapter.date.circa ? '≈ ' : ''}
                    {chapter.date.text}
                  </span>
                )}
              </h3>
              <button
                type="button"
                className={styles.close}
                aria-expanded={cardOpen}
                aria-label={
                  cardOpen ? 'Hide what happens' : 'Show what happens'
                }
                data-tooltip={
                  cardOpen
                    ? 'Hide what happens in this chapter, to see more of the map'
                    : 'Show what happens in this chapter'
                }
                onClick={() => setCardOpen(!cardOpen)}
              >
                {cardOpen ? '–' : '+'}
              </button>
            </div>
            {cardOpen && (
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
            )}
          </section>
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
            data-tooltip="Go to the previous chapter"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={play}
            aria-label={playing ? 'Pause' : 'Play'}
            data-tooltip={
              playing ? 'Pause' : 'Play through the chapters one by one'
            }
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
                            data-tooltip={`Go to ${c.label}${part ? ` (${part})` : ''}`}
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
            data-tooltip="Go to the next chapter"
          >
            ›
          </button>
        </div>
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

/** A pin's mark for each kind of event. */
const PIN_GLYPHS: Record<ShownBookPin['kind'], string> = {
  battle: '\u2694\ufe0e',
  death: '\u2020',
  discovery: '\u2726',
  meeting: '\u2194',
  other: '\u2605',
}

/** "A", "A and B", "A, B and C". */
const listNames = (names: string[]) =>
  names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`

/** Four corners pointing out (enter full screen) or in (leave it). */
/** Opens the character's own journey, or their page if it shows none. */
function JourneyLink({
  id,
  name,
  found,
}: {
  id: string
  name: string
  found?: FoundFeature
}) {
  const label = found
    ? `${name}’s ${found.feature.label.toLowerCase()}`
    : `${name}’s page`
  return (
    <Link
      to={`/characters/${id}${found ? `#${found.section}` : ''}`}
      className={styles.page}
      aria-label={label}
      data-tooltip={`See ${label}`}
    >
      {found ? <FeatureIcon id={found.feature.id} /> : '↗'}
    </Link>
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
  label,
  description,
  tip,
  zooms,
  onClick,
}: {
  x: number
  y: number
  zoom: number
  name: string
  colour: string
  here: boolean
  portrait?: string
  uid: string
  label: string
  /** What they do in this chapter, read after the name. */
  description?: string
  tip: string
  /** Opens the inner map (a city) this marker stands for. */
  zooms: boolean
  onClick: () => void
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${(here ? 1 : DIM_SCALE) / zoom})`}
      className={[
        styles.marker,
        here ? '' : styles.dim,
        zooms ? styles.opens : '',
      ].join(' ')}
      role="button"
      aria-label={label}
      aria-description={description}
      data-tooltip={tip}
      onClick={onClick}
    >
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
