import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { ArtViewer } from '../ArtViewer'
import { useLinkText, type LinkTextFn } from '../LinkedText'
import { showOnPage } from '../pageOpen'
import { SourceMark } from '../SourceMark'
import { Link } from 'react-router'
import type { JourneyArt } from '../../data/journey'
import type { ShownJourney, ShownJourneyStop } from '../../data/reveal'
import { stopName, stopSource } from './journeyLabels'
import type { MapEngineHandle } from './MapEngine'
import { SvgMapEngine } from './SvgMapEngine'
import {
  anchorOn,
  boundsOf,
  pathData,
  pathsOn,
  rootOf,
  tracks,
} from './journeyGeometry'
import { useFullscreen } from './useFullscreen'
import { assetUrl } from '../../data/assetUrl'

const PLAY_MS = 2600
// The least a stop's view shows, as a share of the map's width.
const MIN_VIEW = 0.12
// Moving between a map and one inside it (a city): how long each step of
// the zoom takes, and how much of the outer map's width shows at the pin.
const ZOOM_MS = 800
const PIN_VIEW = 0.015

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * One character's journey on an interactive map: a timeline of stops to
 * step through (buttons, slider, list, arrow keys, or play), with the map
 * flying to each and the way so far drawn on it. Generic: it draws whatever
 * trimmed journey it's given, on the maps the journey names.
 */
export default function JourneyMap({
  name,
  journey,
  onClose,
  closeLabel = 'Close',
  selfKey,
  more,
}: {
  /** Whose journey, for labels. */
  name: string
  journey: ShownJourney
  onClose?: () => void
  closeLabel?: string
  /** The page it's on (e.g. "character:shallan-davar"), never linked. */
  selfKey?: string
  /** The id of the part of the page telling more about an event, if any. */
  more?: (where: ShownJourneyStop['where']) => string | undefined
}) {
  const link = useLinkText(selfKey)
  const { stops, maps, credits } = journey
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [cardOpen, setCardOpen] = useState(true)
  const [viewing, setViewing] = useState(false)
  // The outer map (e.g. Roshar) the reader asked to see a city event on.
  const [outer, setOuter] = useState<string>()
  // The past event under the pointer, named at once (a <title> waits ~1s).
  const [hovered, setHovered] = useState<number>()
  const frame = useRef<HTMLDivElement>(null)
  const engine = useRef<MapEngineHandle>(null)
  const fullscreen = useFullscreen(frame)

  const stop = stops[current]
  const moreId = stop && more?.(stop.where)
  // The map on screen. It trails the stop's own map while zooming between
  // a map and one inside it (a city), and starts on the outermost one.
  const [view, setView] = useState(() =>
    stops[0] ? rootOf(maps, stops[0].mapId) : undefined,
  )
  const map = maps.find((m) => m.id === view) ?? maps[0]
  const paths = useMemo(
    () => (map ? pathsOn(stops, maps, map.id) : []),
    [stops, maps, map],
  )
  const lines = useMemo(() => tracks(paths), [paths])
  // The map just left, to zoom out of its pin on the new one.
  const left = useRef<string>(undefined)
  // A stop whose way there waits until the zoom out of a city is done.
  const [arriving, setArriving] = useState<number>()
  // The last stop drawn: the one before while still changing maps, so the
  // way to a stop on another map only shows once that map is on screen.
  const target = outer ?? stop?.mapId
  const drawn =
    (target && map && target !== map.id) || arriving === current
      ? current - 1
      : current

  // Moving to an event opens its card again.
  const go = useCallback(
    (i: number) => {
      setCurrent(Math.max(0, Math.min(stops.length - 1, i)))
      setCardOpen(true)
      setViewing(false)
      setOuter(undefined)
    },
    [stops.length],
  )

  // Screen pixels the card and timeline cover, so the event is centred in
  // the bigger clear part: beside the card or below it.
  const covered = useCallback(() => {
    const stage = frame.current?.querySelector('.journey-stage')
    if (!stage) return {}
    const s = stage.getBoundingClientRect()
    const card = stage
      .querySelector('.journey-card, .journey-card-show')
      ?.getBoundingClientRect()
    const panel = stage.querySelector('.journey-panel')?.getBoundingClientRect()
    const bottom = panel ? s.bottom - panel.top : 0
    if (!card) return { bottom }
    const free = s.height - bottom
    const beside = (s.right - card.right) * free
    const below = s.width * (free - (card.bottom - s.top))
    return beside >= below
      ? { left: card.right - s.left, bottom }
      : { top: card.bottom - s.top, bottom }
  }, [])

  // The event's own place (a route's whole length), never the way there;
  // the whole map while where it happened is still unknown.
  const fly = useCallback(
    (animate: boolean) => {
      const path = paths[current]
      if (!path || !map) return
      const { width, height } = map.image
      const box = path.length
        ? boundsOf(path, width * MIN_VIEW)
        : { x: 0, y: 0, width, height }
      engine.current?.flyTo(box, {
        animate: animate && !reducedMotion(),
        maxZoom: 1.2,
        inset: covered(),
      })
    },
    [paths, current, map, covered],
  )

  // Opened from a preview: take focus so the arrow keys work straight away.
  useEffect(() => frame.current?.focus({ preventScroll: true }), [])

  // Fly to each stop as it comes, the first from the whole map, and again
  // when the card opens or closes over it. A stop on another map swaps maps.
  // Into a city: fly to its pin, then the city flies in to the stop. Out of
  // one: show the whole city, then the outer map zooms out from the city's
  // pin, then pans to the stop.
  useEffect(() => {
    if (!target || !map) return
    const motion = !reducedMotion()
    const whole = {
      x: 0,
      y: 0,
      width: map.image.width,
      height: map.image.height,
    }
    if (target !== map.id) {
      const into = motion && anchorOn(maps, map.id, target)
      const outOf = motion && anchorOn(maps, target, map.id)
      // Between two cities on one map: out to that map, then in to the other.
      const up = map.parent?.mapId
      if (motion && !into && !outOf && up && anchorOn(maps, up, target)) {
        engine.current?.flyTo(whole, { inset: covered() })
        const timer = setTimeout(() => setView(up), ZOOM_MS)
        return () => clearTimeout(timer)
      }
      const swap = () => {
        left.current = map.id
        if (outOf) setArriving(current)
        setView(target)
      }
      if (!into && !outOf) return swap()
      engine.current?.flyTo(
        into ? boundsOf([into], map.image.width * PIN_VIEW) : whole,
        { maxZoom: into ? 8 : undefined, inset: covered() },
      )
      const timer = setTimeout(swap, ZOOM_MS)
      return () => clearTimeout(timer)
    }
    const from = left.current
    left.current = undefined
    const pin = from && motion && anchorOn(maps, map.id, from)
    if (!pin) {
      fly(true)
      if (arriving === undefined) return
      // Cut short (e.g. the card closed): draw the way at once.
      const timer = setTimeout(() => setArriving(undefined))
      return () => clearTimeout(timer)
    }
    engine.current?.flyTo(boundsOf([pin], map.image.width * PIN_VIEW), {
      animate: false,
      maxZoom: 8,
      inset: covered(),
    })
    // Two frames, so the jump to the pin is drawn before the zoom out.
    let timer: ReturnType<typeof setTimeout> | undefined
    let frameId = requestAnimationFrame(() => {
      frameId = requestAnimationFrame(() => {
        engine.current?.flyTo(boundsOf([pin], map.image.width * MIN_VIEW * 2), {
          maxZoom: 1.2,
          inset: covered(),
        })
        timer = setTimeout(() => setArriving(undefined), ZOOM_MS)
      })
    })
    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(timer)
    }
  }, [target, current, arriving, map, maps, fly, covered, cardOpen])

  // Re-centre when the frame changes size (full screen, rotation...).
  const flyNow = useRef(fly)
  const sized = useRef(false)
  useEffect(() => {
    flyNow.current = fly
  })
  useEffect(() => {
    const again = () => flyNow.current(false)
    // Not on opening: that's the fly in from the whole map above.
    if (sized.current) again()
    sized.current = true
    window.addEventListener('resize', again)
    document.addEventListener('fullscreenchange', again)
    return () => {
      window.removeEventListener('resize', again)
      document.removeEventListener('fullscreenchange', again)
    }
  }, [fullscreen.active])

  useEffect(() => {
    if (!playing || current >= stops.length - 1) return
    const timer = setTimeout(() => {
      go(current + 1)
      if (current + 1 >= stops.length - 1) setPlaying(false)
    }, PLAY_MS)
    return () => clearTimeout(timer)
  }, [playing, current, stops.length, go])

  if (!stop || !map) return null

  const pick = (i: number) => {
    setPlaying(false)
    setHovered(undefined)
    go(i)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    // The slider steps itself.
    if ((e.target as HTMLElement).matches('input')) return
    const to = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: stops.length - 1,
    }[e.key]
    if (to === undefined) return
    e.preventDefault()
    pick(to)
  }

  // A city event can be seen where it sits on the world map, and back.
  const world = maps.find((m) => m.id === stop.mapId)?.parent
    ? rootOf(maps, stop.mapId)
    : undefined

  const source = stopSource(stop)
  const place = stopName(stop, current)

  const layers = (zoom: number) => {
    const px = (n: number) => n / zoom
    const here = lines[drawn]?.at(-1)
    return (
      <>
        {lines.map((line, i) => {
          if (i > drawn || !line.length) return null
          const dash = stops[i].approximate ? `${px(7)} ${px(6)}` : undefined
          return (
            <Fragment key={stops[i].id}>
              {line.length > 1 && (
                <path
                  d={pathData(line)}
                  className={
                    i === drawn ? 'journey-track-now' : 'journey-track-past'
                  }
                  strokeWidth={px(i === drawn ? 4 : 3)}
                  strokeDasharray={dash}
                />
              )}
              <circle
                cx={line.at(-1)![0]}
                cy={line.at(-1)![1]}
                r={px(4.5)}
                strokeWidth={px(1.5)}
                className="journey-dot"
              />
              {/* A bigger, unseen target that goes to the event. The
                  numbered events below do the same from the keyboard. */}
              {i !== current && (
                <circle
                  cx={line.at(-1)![0]}
                  cy={line.at(-1)![1]}
                  r={px(12)}
                  className="journey-dot-hit"
                  data-event={i}
                  onClick={() => pick(i)}
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(undefined)}
                />
              )}
            </Fragment>
          )
        })}
        {hovered !== undefined &&
        hovered !== current &&
        lines[hovered]?.length ? (
          <DotTip
            at={lines[hovered].at(-1)!}
            zoom={zoom}
            text={stopName(stops[hovered], hovered)}
          />
        ) : null}
        {here && (
          <>
            <circle
              key={`pulse-${current}`}
              cx={here[0]}
              cy={here[1]}
              r={px(16)}
              strokeWidth={px(2)}
              className="journey-pulse"
            />
            <circle
              cx={here[0]}
              cy={here[1]}
              r={px(8)}
              strokeWidth={px(2.5)}
              className="journey-here"
            />
          </>
        )}
      </>
    )
  }

  return (
    <div
      ref={frame}
      className={`journey-map${fullscreen.active ? ' is-fullscreen' : ''}${fullscreen.overlay ? ' is-overlay' : ''}`}
      role="group"
      aria-label={`${name}’s journey`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="journey-toolbar">
        <p className="journey-heading">
          {name}’s journey · {map.title}
        </p>
      </div>

      <div className="journey-stage">
        <div className="journey-map-actions">
          <button
            type="button"
            className="journey-button"
            onClick={fullscreen.toggle}
            aria-pressed={fullscreen.active}
          >
            {fullscreen.active ? 'Exit full screen' : 'Full screen'}
          </button>
          {world && (
            <button
              type="button"
              className="journey-button"
              onClick={() => {
                setPlaying(false)
                setOuter(outer ? undefined : world)
              }}
            >
              {outer ? 'See location view' : 'Show on world map'}
            </button>
          )}
          {onClose && !fullscreen.active && (
            <button type="button" className="journey-button" onClick={onClose}>
              {closeLabel}
            </button>
          )}
        </div>
        <SvgMapEngine
          key={map.id}
          ref={engine}
          image={map.image}
          label={`Map of ${map.title}: drag to pan, pinch or scroll to zoom`}
          layers={layers}
        />

        {cardOpen ? (
          <section
            className={`journey-card${stop.art ? ' has-art' : ''}`}
            aria-live="polite"
            aria-label="Event"
          >
            <button
              type="button"
              className="journey-card-close"
              onClick={() => setCardOpen(false)}
              aria-label="Hide event details"
            >
              ×
            </button>
            {stop.art && (
              <figure className="journey-art" key={stop.id}>
                <button
                  type="button"
                  className="journey-art-open"
                  onClick={() => {
                    setPlaying(false)
                    setViewing(true)
                  }}
                  aria-label="View the whole picture"
                >
                  <img
                    src={assetUrl(stop.art.src)}
                    alt={stop.art.alt}
                    style={
                      stop.art.position
                        ? { objectPosition: stop.art.position }
                        : undefined
                    }
                  />
                  <span className="journey-art-hint" aria-hidden>
                    ⤢
                  </span>
                </button>
                <figcaption>
                  Art by <ArtCredit credit={stop.art.credit} />
                </figcaption>
              </figure>
            )}
            <p className="travel-card-step">
              Event {current + 1} of {stops.length}
              {stop.approximate && (
                <span className="travel-badge journey-approx">Approximate</span>
              )}
            </p>
            <h3>
              {!stop.title && stop.place?.href ? (
                <Link to={stop.place.href}>{place}</Link>
              ) : (
                place
              )}
            </h3>
            {(source || (stop.title && stop.place)) && (
              <p className="journey-source">
                {stop.title && stop.place && (
                  <>
                    {stop.place.href ? (
                      <Link to={stop.place.href}>{stop.place.name}</Link>
                    ) : (
                      stop.place.name
                    )}
                    {source && ' · '}
                  </>
                )}
                {source && (
                  <>
                    <Link to={`/books/${source.bookId}`}>
                      <cite>{source.title}</cite>
                    </Link>
                    {source.chapter && `, ${source.chapter}`}
                  </>
                )}
              </p>
            )}
            {stop.summary.map(({ text, cite, links }) => (
              <p key={text}>
                {linked(text, links, link, selfKey)}
                {cite && <SourceMark sources={[cite]} />}
              </p>
            ))}
            {moreId && (
              <button
                type="button"
                className="journey-more"
                onClick={() => {
                  if (fullscreen.active) fullscreen.exit()
                  showOnPage(moreId)
                }}
              >
                More in History
              </button>
            )}
          </section>
        ) : (
          <button
            type="button"
            className="journey-button journey-card-show"
            onClick={() => setCardOpen(true)}
          >
            Show event
          </button>
        )}

        <div className="journey-panel">
          <div className="travel-controls journey-controls">
            <button
              type="button"
              onClick={() => {
                if (playing) setPlaying(false)
                else {
                  if (current >= stops.length - 1) setCurrent(0)
                  setCardOpen(true)
                  setPlaying(true)
                }
              }}
              aria-label={playing ? 'Pause journey' : 'Play journey'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <button
              type="button"
              onClick={() => pick(current - 1)}
              disabled={current === 0}
              aria-label="Previous event"
            >
              ‹
            </button>
            <input
              type="range"
              min={0}
              max={stops.length - 1}
              value={current}
              onChange={(e) => pick(Number(e.target.value))}
              aria-label="Event"
              aria-valuetext={`Event ${current + 1} of ${stops.length}: ${place}`}
            />
            <button
              type="button"
              onClick={() => pick(current + 1)}
              disabled={current === stops.length - 1}
              aria-label="Next event"
            >
              ›
            </button>
          </div>

          <ol className="journey-steps" aria-label="Events">
            {stops.map((s, i) => {
              const from = stopSource(s)
              const label = `${stopName(s, i)}${from?.chapter ? `, ${from.chapter}` : ''}`
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={i === current ? 'step' : undefined}
                    aria-label={`${i + 1}. ${label}`}
                    title={label}
                    onClick={() => pick(i)}
                  >
                    {i + 1}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {viewing && stop.art && (
        <ArtViewer
          src={stop.art.src}
          alt={stop.art.alt}
          credit={<ArtCredit credit={stop.art.credit} />}
          onClose={() => setViewing(false)}
        />
      )}

      <p className="journey-credits">
        {credits.map((c) => (
          <Fragment key={c.url}>
            <a href={c.url} target="_blank" rel="noreferrer">
              {c.text}
            </a>
            {'. '}
          </Fragment>
        ))}
        {map.credit.url ? (
          <a href={map.credit.url} target="_blank" rel="noreferrer">
            {map.credit.text}
          </a>
        ) : (
          map.credit.text
        )}
        .
      </p>
    </div>
  )
}

/**
 * The text with each given link's first mention, in order, made a link, and
 * the other pages it names linked as in prose; never the page it's on.
 */
function linked(
  text: string,
  links: readonly { text: string; href: string }[] = [],
  link: LinkTextFn,
  selfKey?: string,
): ReactNode[] {
  const out: ReactNode[] = []
  const done = new Set<string>()
  const self = selfKey?.replace(/^character:/, '/characters/')
  let rest = text
  for (const l of links) {
    if (l.href === self) continue
    const at = rest.indexOf(l.text)
    if (at < 0) continue
    out.push(
      <Fragment key={`${l.href}-text`}>
        {link(rest.slice(0, at), done)}
      </Fragment>,
      <Link key={l.href} to={l.href}>
        {l.text}
      </Link>,
    )
    rest = rest.slice(at + l.text.length)
  }
  return [...out, <Fragment key="rest">{link(rest, done)}</Fragment>]
}

function ArtCredit({ credit }: { credit: JourneyArt['credit'] }) {
  return credit.url ? (
    <a href={credit.url} target="_blank" rel="noreferrer">
      {credit.text}
    </a>
  ) : (
    credit.text
  )
}

/**
 * A tooltip above a point on the map, the size it would be on screen at any
 * zoom: a box sized to its text, with a pointer down to the point.
 */
function DotTip({
  at: [x, y],
  zoom,
  text,
}: {
  at: readonly number[]
  zoom: number
  text: string
}) {
  const label = useRef<SVGTextElement>(null)
  const [width, setWidth] = useState(text.length * 7)
  // The text's width on screen; jsdom can't measure, so it keeps the guess.
  useLayoutEffect(() => {
    const t = label.current
    if (t?.getComputedTextLength) setWidth(t.getComputedTextLength() * zoom)
  }, [text, zoom])
  const px = (n: number) => n / zoom
  const r = px(5)
  const w = px(width + 20)
  const h = px(26)
  const top = y - px(14) - h
  const left = x - w / 2
  return (
    <g className="journey-dot-tip">
      <path
        d={[
          `M${left} ${top + r}`,
          `a${r} ${r} 0 0 1 ${r} ${-r}`,
          `h${w - 2 * r}`,
          `a${r} ${r} 0 0 1 ${r} ${r}`,
          `v${h - 2 * r}`,
          `a${r} ${r} 0 0 1 ${-r} ${r}`,
          `H${x + px(6)} l${-px(6)} ${px(7)} l${-px(6)} ${-px(7)}`,
          `H${left + r}`,
          `a${r} ${r} 0 0 1 ${-r} ${-r} z`,
        ].join(' ')}
        strokeWidth={px(1)}
      />
      <text
        ref={label}
        x={x}
        y={top + h / 2}
        fontSize={px(13)}
        dominantBaseline="central"
      >
        {text}
      </text>
    </g>
  )
}
