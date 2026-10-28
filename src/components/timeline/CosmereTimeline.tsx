import {
  lazy,
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  COSMERE,
  revealTimeline,
  type ShownTimelineEvent,
} from '../../data/timeline'
import { assetUrl } from '../../data/assetUrl'
import { characterPortraits } from '../../data/characterPortraits'
import { CharacterTiles, type CharacterTile } from '../CharacterTiles'
import { facePortraits } from '../../data/faces'
import { revealEntry, revealPortrait, type CanSee } from '../../data/reveal'
import { revealShards, type ShownShard } from '../../data/shards'
import {
  peopleAt,
  type PersonAt,
  type YearsApart,
} from '../../data/timelinePeople'
import { useCanSee } from '../../state/reveal'
import { useEntryStory } from '../../state/entryStory'
import { useLinkText } from '../LinkedText'
import { SourceMark } from '../SourceMark'
import { FullscreenIcon } from '../FullscreenIcon'
import { useFullscreen } from '../journey/useFullscreen'
import { initials } from '../bookMap/markers'
import type { ExplorerEffect, ExplorerGoal } from '../explorer/ExplorerCanvas'
import type { Level } from '../explorer/sky'
import { hasWebGL, reducedMotion } from '../explorer/webgl'
import {
  explorerPins,
  explorerWorlds,
  type ExplorerWorld,
} from '../explorer/worlds'
import styles from './CosmereTimeline.module.css'

// Three.js is big: it loads with this view, not with the guide.
const ExplorerCanvas = lazy(() => import('../explorer/ExplorerCanvas'))

/** Bar pixels per step of an event's offset; markers are narrower. */
const STEP_PX = 76

/**
 * The Cosmere Timeline: the explorer (the painted sky of the Cosmere, its
 * worlds and their maps) with a timeline of events along the bottom, in
 * the manner of the 17th Shard's Roshar map. Picking an event flies to its
 * world (and its place there); the reader can zoom out to the Cosmere at
 * any time and look in on other worlds. Only what the reader's books have
 * shown is ever drawn.
 */
export function CosmereTimeline() {
  const canSee = useCanSee()
  const timeline = useMemo(() => revealTimeline(canSee), [canSee])
  const { events } = timeline
  const [params, setParams] = useSearchParams()
  const found = events.findIndex((e) => e.id === params.get('event'))
  const current = found >= 0 ? found : 0
  const event = events[current]
  const worlds = useMemo(
    () => explorerWorlds(timeline, canSee, event),
    [timeline, canSee, event],
  )
  // A world the reader chose to look at (or the whole Cosmere), away from
  // the current event's, and a character they asked to see there.
  const [explore, setExploreTo] = useState<string>()
  const [person, setPerson] = useState<string>()
  const [cardOpen, setCardOpen] = useState(true)
  const people = useMemo(
    () => peopleAt(timeline, canSee, current),
    [timeline, canSee, current],
  )
  const setExplore = useCallback((world?: string) => {
    setExploreTo(world)
    setPerson(undefined)
  }, [])

  const go = useCallback(
    (i: number) => {
      const to = events[Math.max(0, Math.min(events.length - 1, i))]
      if (!to) return
      setExplore(undefined)
      setCardOpen(true)
      setParams(
        (p) => {
          const next = new URLSearchParams(p)
          next.set('event', to.id)
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [events, setParams, setExplore],
  )

  if (!event)
    return (
      <p className={styles.empty}>
        Nothing on the timeline yet. Mark a book as read or reading to start it.
      </p>
    )

  return (
    <Timeline
      events={events}
      worlds={worlds}
      // Only the current event's marker.
      pins={explorerPins({ ...timeline, events: [events[current]] }, worlds)}
      current={current}
      explore={explore}
      setExplore={setExplore}
      people={people}
      shards={revealShards(timeline, canSee, current)}
      person={people.find((p) => p.id === person && p.where)}
      showPerson={(p) => {
        setExploreTo(p.where?.world)
        setPerson(p.id)
      }}
      canSee={canSee}
      cardOpen={cardOpen}
      setCardOpen={setCardOpen}
      go={go}
    />
  )
}

/** Where the camera goes for an event, or for a world being explored. */
function goalFor(
  event: ShownTimelineEvent,
  explore: string | undefined,
  worlds: ExplorerWorld[],
  person?: PersonAt,
): ExplorerGoal {
  const where = person?.where
  if (where && worlds.some((w) => w.id === where.world)) {
    const key = `person:${person.id}`
    const map = worlds.find((w) => w.id === where.world)?.map
    return where.at && map
      ? { world: where.world, view: 'pin', pin: where.at, key }
      : { world: where.world, view: 'globe', key }
  }
  if (explore === COSMERE) return { key: 'cosmere' }
  if (explore) return { world: explore, view: 'globe', key: `world:${explore}` }
  const world = worlds.find((w) => w.id === event.world.id)
  const key = `event:${event.id}`
  if (!world) return { key }
  const at = event.map?.mapId === world.mapId ? event.map?.at : undefined
  if (at && world.map) return { world: world.id, view: 'pin', pin: at, key }
  if (event.map && world.map) return { world: world.id, view: 'map', key }
  return { world: world.id, view: 'globe', key }
}

/**
 * The current event's effect on the map, at its world only once the reader
 * knows where it happened (revealTimeline leaves it in the open Cosmere).
 */
function effectFor(
  event: ShownTimelineEvent,
  explore: string | undefined,
): ExplorerEffect | undefined {
  if (!event.effect || explore) return undefined
  return {
    kind: event.effect,
    ...(event.world.id !== COSMERE && { world: event.world.id }),
    key: `effect:${event.id}`,
  }
}

function Timeline({
  events,
  worlds,
  pins,
  current,
  explore,
  setExplore,
  people,
  shards,
  person,
  showPerson,
  canSee,
  cardOpen,
  setCardOpen,
  go,
}: {
  events: ShownTimelineEvent[]
  worlds: ExplorerWorld[]
  pins: ReturnType<typeof explorerPins>
  current: number
  explore?: string
  setExplore: (world?: string) => void
  people: PersonAt[]
  shards: ShownShard[]
  /** The character being shown on the map, if any. */
  person?: PersonAt
  showPerson: (p: PersonAt) => void
  canSee: CanSee
  cardOpen: boolean
  setCardOpen: (open: boolean) => void
  go: (i: number) => void
}) {
  const event = events[current]
  const stage = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const [webgl] = useState(hasWebGL)
  // One drawer on the left and one panel on the right at a time.
  const [drawer, setDrawer] = useState<'worlds'>()
  const [panel, setPanel] = useState<
    'details' | 'people' | 'shards' | 'shard'
  >()
  const [shardId, setShardId] = useState<string>()
  // Moving to another event closes the right panel.
  const [panelAt, setPanelAt] = useState(current)
  if (panelAt !== current) {
    setPanelAt(current)
    setPanel(undefined)
  }
  const shard = panel === 'shard' && shards.find((sh) => sh.id === shardId)
  // A world flown to from the Shards list: just the Shards, no event card.
  const [quietOn, setQuietOn] = useState<string>()
  const [view, setView] = useState<{ world: string; level: Level }>()
  // Off on another world, the event card hides: just the world's name shows.
  const quiet =
    (!!quietOn && explore === quietOn) ||
    (!!explore && explore !== COSMERE && explore !== event.world.id)
  const toggle = <T,>(set: (f: (o?: T) => T | undefined) => void, to: T) =>
    set((o) => (o === to ? undefined : to))
  const fullscreen = useFullscreen(stage)
  const pick = (world: string, viaShard = false) => {
    setExplore(world)
    setQuietOn(viaShard ? world : undefined)
    setDrawer(undefined)
  }
  // Reset flies to the same goal again, under a fresh key.
  const [reset, setReset] = useState({ key: '', n: 0 })
  const aimed = goalFor(event, explore, worlds, person)
  const goal =
    reset.key === aimed.key
      ? { ...aimed, key: `${aimed.key}#reset${reset.n}` }
      : aimed
  const where = person?.where
  // The whereabouts label, until the reader clicks elsewhere on the map.
  const [whereShut, setWhereShut] = useState(false)
  const seePerson = (p: PersonAt) => {
    setWhereShut(false)
    showPerson(p)
  }
  const face = (id: string) => {
    const src = revealPortrait(
      facePortraits(id, characterPortraits[id]),
      canSee,
    ).portrait?.src
    return src && assetUrl(src)
  }
  // Keep the current event's marker under the notch: straight there on
  // arrival, gliding as the reader steps. The strip's half-width spacers
  // put an event at the middle when scrolled to its offset, at any width.
  const placed = useRef(false)
  useLayoutEffect(() => {
    const el = strip.current
    if (!el) return
    const left = event.offset * STEP_PX
    const smooth = placed.current && !reducedMotion()
    placed.current = true
    if (typeof el.scrollTo === 'function')
      el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
    else el.scrollLeft = left
  }, [event.offset])

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('a, input')) return
    const to = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: events.length - 1,
    }[e.key]
    if (to !== undefined) {
      e.preventDefault()
      go(to)
      // In full screen, Escape just leaves it.
    } else if (e.key === 'Escape' && panel) {
      e.preventDefault()
      setPanel(undefined)
    } else if (
      e.key === 'Escape' &&
      explore !== COSMERE &&
      !fullscreen.active
    ) {
      e.preventDefault()
      setExplore(COSMERE)
    }
  }

  // The world on screen, however the reader flew there; the sky is the
  // whole Cosmere.
  const shownWorld = !view
    ? event.world
    : view.level === 'sky'
      ? undefined
      : (worlds.find((w) => w.id === view.world) ?? event.world)
  const span = events.at(-1)!.offset * STEP_PX
  const groups = [
    ...new Set(events.flatMap((e) => (e.group ? [e.group.id] : []))),
  ]
    .map((id) => events.filter((e) => e.group?.id === id))
    .filter((g) => g.length > 1)
  const date = event.when
  const fullscreenButton = (
    <button
      type="button"
      className={`${styles.tool} ${styles.round}`}
      aria-label="Full screen"
      aria-pressed={fullscreen.active}
      data-tooltip={
        fullscreen.active
          ? 'Leave full screen (Esc)'
          : 'Show the timeline full screen'
      }
      onClick={fullscreen.toggle}
    >
      <FullscreenIcon exit={fullscreen.active} />
    </button>
  )

  return (
    <div
      className={[
        styles.stage,
        fullscreen.active && styles.full,
        fullscreen.overlay && styles.overlay,
      ]
        .filter(Boolean)
        .join(' ')}
      ref={stage}
      tabIndex={0}
      role="group"
      aria-label="Cosmere Timeline"
      aria-keyshortcuts="ArrowLeft ArrowRight Home End Escape"
      onKeyDown={onKeyDown}
    >
      {webgl ? (
        <Suspense
          fallback={<p className={styles.loading}>Charting the Cosmere…</p>}
        >
          <ExplorerCanvas
            worlds={worlds}
            pins={pins}
            goal={goal}
            current={explore ? undefined : event.id}
            effect={effectFor(event, explore)}
            onExplore={(w) => {
              setExplore(w ?? COSMERE)
              setQuietOn(undefined)
            }}
            onPin={(id) => go(events.findIndex((e) => e.id === id))}
            onBackground={() => setWhereShut(true)}
            onView={setView}
            shards={shards}
            people={people.flatMap((p) =>
              p.where
                ? [
                    {
                      id: p.id,
                      name: p.name,
                      world: p.where.world,
                      at: p.where.at,
                      face: face(p.id),
                      initials: initials(p.name),
                    },
                  ]
                : [],
            )}
            onPerson={(id) => {
              const p = people.find((o) => o.id === id)
              if (p) seePerson(p)
            }}
            onMorePeople={() => setPanel('people')}
            onShard={(id) => {
              setShardId(id)
              setPanel('shard')
            }}
            onReset={() =>
              setReset((r) => ({
                key: aimed.key,
                n: r.key === aimed.key ? r.n + 1 : 1,
              }))
            }
          >
            {fullscreenButton}
          </ExplorerCanvas>
        </Suspense>
      ) : (
        <>
          <p className={styles.loading}>
            Your browser can't draw the map of the Cosmere (it needs WebGL). The
            timeline below still works.
          </p>
          <div className={styles.controls}>{fullscreenButton}</div>
        </>
      )}

      <nav className={styles.toolbar} aria-label="Worlds">
        <div className={styles.row}>
          <button
            type="button"
            className={`${styles.tool} ${styles.round}`}
            aria-label="Worlds"
            aria-expanded={drawer === 'worlds'}
            aria-controls="timeline-worlds"
            data-tooltip={
              drawer === 'worlds' ? 'Hide the worlds' : 'Fly to a world'
            }
            onClick={() => toggle(setDrawer, 'worlds')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="6" fill="currentColor" />
              <ellipse
                cx="12"
                cy="12"
                rx="10.5"
                ry="3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                transform="rotate(-20 12 12)"
              />
            </svg>
          </button>
          {drawer === 'worlds' && (
            <div id="timeline-worlds" className={styles.drawer}>
              <button
                type="button"
                className={styles.tool}
                aria-pressed={explore === COSMERE}
                data-tooltip="Zoom out to the whole Cosmere (Esc)"
                onClick={() => pick(COSMERE)}
              >
                ✦ The Cosmere
              </button>
              {worlds.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={styles.tool}
                  aria-pressed={explore === w.id}
                  data-tooltip={`Fly to ${w.name}`}
                  onClick={() => pick(w.id)}
                >
                  <span
                    className={styles.dot}
                    style={{ background: w.color }}
                  />
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {shards.length > 0 && (
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.tool} ${styles.round}`}
              aria-label="Shards"
              aria-expanded={panel === 'shards'}
              aria-controls="timeline-shards"
              data-tooltip={
                panel === 'shards'
                  ? 'Hide the Shards'
                  : 'The Shards, and where they are'
              }
              onClick={() => toggle(setPanel, 'shards')}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  d="M12 2 19 9 12 22 5 9Z M5 9h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.row}>
          <button
            type="button"
            className={`${styles.tool} ${styles.round}`}
            aria-label="Notable characters"
            aria-expanded={panel === 'people'}
            aria-controls="timeline-people"
            data-tooltip={
              panel === 'people'
                ? 'Hide the characters'
                : 'Find where a notable character is at this point'
            }
            onClick={() => toggle(setPanel, 'people')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 21a8 8 0 0 1 16 0Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        {explore && (
          <button
            type="button"
            className={`${styles.tool} ${styles.back}`}
            data-tooltip="Fly back to the event on the timeline"
            onClick={() => go(current)}
          >
            ↩ Back to the event
          </button>
        )}
      </nav>

      {person && where && !whereShut && (
        <p className={styles.whereabouts} aria-live="polite">
          {face(person.id) ? (
            <img className={styles.face} src={face(person.id)} alt="" />
          ) : (
            <span className={styles.face} aria-hidden="true">
              {initials(person.name)}
            </span>
          )}
          <span>
            {person.name} is {where.at ? 'here' : 'somewhere'} on{' '}
            {where.worldName}
            {where.event.index !== current && (
              <span className={styles.status}>
                {' '}
                · last seen: {where.event.title}
              </span>
            )}
          </span>
        </p>
      )}

      {quiet ? null : cardOpen ? (
        <section className={styles.card} aria-live="polite" aria-label="Event">
          <button
            type="button"
            className={styles.close}
            aria-label="Hide the event card"
            data-tooltip="Hide the event card"
            onClick={() => setCardOpen(false)}
          >
            ×
          </button>
          <h2 className={styles.title}>{event.title}</h2>
          <p className={styles.blurb}>
            {event.summary}{' '}
            <button
              type="button"
              className={styles.more}
              aria-expanded={panel === 'details'}
              aria-controls="timeline-details"
              data-tooltip="Read more about this event"
              onClick={() => toggle(setPanel, 'details')}
            >
              More
            </button>
          </p>
        </section>
      ) : (
        <button
          type="button"
          className={`${styles.tool} ${styles.reopen}`}
          data-tooltip="Show the event card again"
          onClick={() => setCardOpen(true)}
        >
          Show event
        </button>
      )}

      {panel === 'details' && (
        <EventDetails
          event={event}
          canSee={canSee}
          onClose={() => setPanel(undefined)}
        />
      )}
      {shard && (
        <ShardPanel
          shard={shard}
          vessel={
            shard.vessel
              ? {
                  id: shard.vesselId,
                  name: shard.vessel,
                  portrait: shard.vesselId
                    ? revealPortrait(characterPortraits[shard.vesselId], canSee)
                        .portrait
                    : undefined,
                }
              : undefined
          }
          onClose={() => setPanel(undefined)}
        />
      )}
      {panel === 'shards' && (
        <ShardsPanel
          shards={shards}
          worlds={worlds}
          onShow={(sh, world) => {
            // No known home: out to the whole Cosmere, as its button does.
            if (world) pick(world, true)
            else pick(COSMERE)
            setShardId(sh.id)
            setPanel('shard')
          }}
          onClose={() => setPanel(undefined)}
        />
      )}
      {panel === 'people' && (
        <PeoplePanel
          people={people}
          shown={person?.id}
          face={face}
          onShow={(p) => {
            seePerson(p)
            // On a phone the panel covers the map: get out of the way.
            const width = stage.current?.clientWidth
            if (width && width < 640) setPanel(undefined)
          }}
          go={go}
          onClose={() => setPanel(undefined)}
        />
      )}

      <p className={styles.indicator} aria-live="polite">
        {date ? (
          <>
            <span className={styles.year}>{date.text}</span>
            {date.label && (
              <span
                className={styles.calendar}
                data-tooltip={date.note}
                tabIndex={date.note ? 0 : undefined}
              >
                {date.label}
              </span>
            )}
          </>
        ) : (
          <span className={styles.year}>Undated</span>
        )}
        <span className={styles.on} data-tooltip="Where the map is">
          {shownWorld && (
            <span
              className={styles.dot}
              style={{ background: shownWorld.color }}
            />
          )}
          {shownWorld?.name ?? 'The Cosmere'}
        </span>
      </p>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.step}
          aria-label="Previous event"
          data-tooltip="Previous event (←)"
          disabled={current === 0}
          onClick={() => go(current - 1)}
        >
          ‹
        </button>
        <div className={styles.strip} ref={strip}>
          <div className={styles.track} style={{ width: span }}>
            {groups.map((g) => (
              <span
                key={g[0].group!.id}
                className={styles.bracket}
                style={{
                  left: g[0].offset * STEP_PX - 30,
                  width: (g.at(-1)!.offset - g[0].offset) * STEP_PX + 60,
                }}
                aria-hidden
              >
                {g[0].group!.label}
              </span>
            ))}
            <ol className={styles.ticks} aria-label="Events, earliest first">
              {events.map((e) => (
                <li
                  key={e.id}
                  className={styles.tick}
                  style={{ left: e.offset * STEP_PX }}
                >
                  <button
                    type="button"
                    className={styles.marker}
                    aria-current={e.index === current}
                    aria-label={`${e.title}${e.when ? `, ${e.when.text}` : ''}, on ${e.world.name}`}
                    data-tooltip={`Go to: ${e.title}`}
                    style={{ '--world': e.world.color } as CSSProperties}
                    onClick={() => go(e.index)}
                  >
                    <span className={styles.diamond} aria-hidden />
                    <span className={styles.date} aria-hidden>
                      {e.when?.text ?? '?'}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <button
          type="button"
          className={styles.step}
          aria-label="Next event"
          data-tooltip="Next event (→)"
          disabled={current === events.length - 1}
          onClick={() => go(current + 1)}
        >
          ›
        </button>
      </div>
    </div>
  )
}

const years = (n: number) => `${n} year${n === 1 ? '' : 's'}`
const about = (y: YearsApart) => (y.circa ? 'about ' : '')

/** "Not born for another 14 years", from the shown dates where they allow. */
function unbornText(y: YearsApart) {
  if (y.years === undefined) return 'Not born yet'
  if (y.years === 0) return 'Born later this year'
  return `Not born for ${about(y)}another ${years(y.years)}`
}

function diedText(y: YearsApart) {
  if (y.years === undefined) return 'Has died'
  if (y.years === 0) return 'Died this year'
  return `Died ${about(y)}${years(y.years)} ago`
}

/**
 * The notable characters the reader has met, as of the timeline's point:
 * where each is, or when they're born or died, with a search to find one.
 */
function PeoplePanel({
  people,
  shown,
  face,
  onShow,
  go,
  onClose,
}: {
  people: PersonAt[]
  shown?: string
  face: (id: string) => string | undefined
  onShow: (p: PersonAt) => void
  go: (i: number) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const found = q
    ? people.filter((p) =>
        [p.name, ...p.aliases].some((n) => n.toLowerCase().includes(q)),
      )
    : people
  return (
    <aside
      id="timeline-people"
      className={styles.details}
      aria-label="Notable characters"
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close the characters"
        data-tooltip="Close (Esc)"
        onClick={onClose}
      >
        ×
      </button>
      <h2 className={styles.title}>Notable characters</h2>
      <input
        type="search"
        className={styles.search}
        placeholder="Find a character"
        aria-label="Find a character"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className={styles.cast}>
        {found.map((p) => {
          const src = face(p.id)
          const who = (
            <>
              {src ? (
                <img className={styles.face} src={src} alt="" />
              ) : (
                <span className={styles.face} aria-hidden="true">
                  {initials(p.name)}
                </span>
              )}
              <span>
                {p.name}
                {p.where && (
                  <span className={styles.status}>On {p.where.worldName}</span>
                )}
                {p.unborn && (
                  <span className={styles.status}>{unbornText(p.unborn)}</span>
                )}
                {p.died && (
                  <span className={styles.status}>{diedText(p.died)}</span>
                )}
              </span>
            </>
          )
          const jump = p.unborn ?? p.died
          return (
            <li key={p.id}>
              {p.where ? (
                <button
                  type="button"
                  className={styles.person}
                  aria-pressed={shown === p.id}
                  data-tooltip={`Show ${p.name} on the map`}
                  onClick={() => onShow(p)}
                >
                  {who}
                </button>
              ) : (
                <span className={styles.person}>{who}</span>
              )}
              {jump && (
                <button
                  type="button"
                  className={styles.more}
                  data-tooltip="Move the timeline there"
                  onClick={() => go(jump.event)}
                >
                  {p.unborn ? 'Jump to their birth' : 'Jump to their death'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {found.length === 0 && (
        <p className={styles.blurb}>No one you've met by that name.</p>
      )}
    </aside>
  )
}

/**
 * The Shards the reader knows, as of the timeline's point: each one's art
 * and planet. Picking one opens its details, flying to its world if known
 * and out to the whole Cosmere if not.
 */
function ShardsPanel({
  shards,
  worlds,
  onShow,
  onClose,
}: {
  shards: ShownShard[]
  worlds: ExplorerWorld[]
  onShow: (shard: ShownShard, world?: string) => void
  onClose: () => void
}) {
  const where = (sh: ShownShard) => worlds.find((w) => w.id === sh.world)
  const placed = shards.filter(where)
  const lost = shards.filter((sh) => !where(sh))
  const row = (sh: ShownShard) => {
    const world = where(sh)
    return (
      <li key={sh.id}>
        <button
          type="button"
          className={styles.person}
          data-tooltip={
            world
              ? `Fly to ${sh.name} on ${world.name}`
              : `Zoom out and read about ${sh.name}`
          }
          onClick={() => onShow(sh, world?.id)}
        >
          <img
            className={styles.face}
            src={sh.art}
            alt=""
            style={{
              objectPosition: '50% 22%',
              filter: sh.faded ? 'grayscale(1)' : undefined,
            }}
          />
          <span>
            {sh.name}
            {world && <span className={styles.status}>On {world.name}</span>}
          </span>
        </button>
      </li>
    )
  }
  return (
    <aside id="timeline-shards" className={styles.details} aria-label="Shards">
      <button
        type="button"
        className={styles.close}
        aria-label="Close the Shards"
        data-tooltip="Close (Esc)"
        onClick={onClose}
      >
        ×
      </button>
      <h2 className={styles.title}>Shards</h2>
      {placed.length > 0 && (
        <>
          <h3 className={styles.section}>Location known</h3>
          <ul className={styles.cast}>{placed.map(row)}</ul>
        </>
      )}
      {lost.length > 0 && (
        <>
          <h3 className={styles.section}>Location unknown</h3>
          <ul className={styles.cast}>{lost.map(row)}</ul>
        </>
      )}
    </aside>
  )
}

/** A Shard as of the current point, opened by clicking it on the map. */
function ShardPanel({
  shard,
  vessel,
  onClose,
}: {
  shard: ShownShard
  vessel?: CharacterTile
  onClose: () => void
}) {
  return (
    <aside
      id="timeline-shard"
      className={styles.details}
      aria-label={`About ${shard.name}`}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close the details"
        data-tooltip="Close (Esc)"
        onClick={onClose}
      >
        ×
      </button>
      <img
        className={styles.shardArt}
        src={shard.art}
        alt=""
        data-faded={shard.faded || undefined}
      />
      <h2 className={styles.title}>{shard.name}</h2>
      <small className={styles.artCredit}>Art: Cam Kuta</small>
      <h3 className={styles.section}>Status</h3>
      <p className={styles.blurb}>{shard.status}</p>
      {vessel && (
        <>
          <h3 className={styles.section}>Vessel</h3>
          <CharacterTiles characters={[vessel]} />
        </>
      )}
    </aside>
  )
}

/**
 * Everything about an event, in a panel over the map (the 17th Shard's
 * "More"): the reader never leaves the timeline to read it.
 */
function EventDetails({
  event,
  canSee,
  onClose,
}: {
  event: ShownTimelineEvent
  canSee: CanSee
  onClose: () => void
}) {
  const pageId = event.more?.split('/').at(-1)
  return (
    <aside
      id="timeline-details"
      className={styles.details}
      aria-label={`About ${event.title}`}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close the details"
        data-tooltip="Close (Esc)"
        onClick={onClose}
      >
        ×
      </button>
      <p className={styles.meta}>
        <span
          className={styles.dot}
          style={{ background: event.world.color }}
        />
        {event.world.name}
        {event.map?.place && ` · ${event.map.place}`}
      </p>
      <h2 className={styles.title}>{event.title}</h2>
      {[event.when, event.date].map(
        (d, i) =>
          d &&
          (i === 0 || d !== event.when) && (
            <p key={i} className={styles.when}>
              {d.text}
              {d.label && ` · ${d.label}`}
            </p>
          ),
      )}
      <p className={styles.blurb}>{event.blurb}</p>
      {event.notes.map((n) => (
        <p key={n.label} className={styles.note}>
          <span className={styles.badge}>{n.label}</span> {n.text}
        </p>
      ))}
      {event.characters.length > 0 && (
        <>
          <h3 className={styles.section}>Characters</h3>
          <CharacterTiles
            characters={event.characters.map((c) => ({
              id: c.id,
              name: c.name,
              portrait: revealPortrait(characterPortraits[c.id], canSee)
                .portrait,
            }))}
          />
        </>
      )}
      {pageId && <EventStory id={pageId} />}
      {event.more && (
        <p className={styles.page}>
          <Link to={event.more} data-tooltip="Open this event's own page">
            Open its page in the guide
          </Link>
        </p>
      )}
    </aside>
  )
}

/** The event's own page, trimmed to the reader's books, read in place. */
function EventStory({ id }: { id: string }) {
  const canSee = useCanSee()
  const link = useLinkText(`event:${id}`)
  const { story } = useEntryStory('event', id)
  if (!story) return null
  const shown = revealEntry(story, canSee, () => false)
  const paragraphs = [
    ...(shown.intro ? [shown.intro] : []),
    ...shown.description,
  ]
  return (
    <div className={styles.story}>
      {paragraphs.map((t) => (
        <p key={t}>{link(t)}</p>
      ))}
      {shown.history.map((h, i) => (
        <section key={h.title ?? i}>
          {h.title && <h3>{h.title}</h3>}
          {h.items.map((it) => (
            <p key={it.text}>
              {link(it.text)}
              <SourceMark books={it.books} />
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}
