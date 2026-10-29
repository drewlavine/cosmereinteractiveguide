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
  calendars,
  COSMERE,
  formatYear,
  revealTimeline,
  type ShownTimelineEvent,
} from '../../data/timeline'
import {
  bookTimeline,
  layoutBooks,
  type BookSpan,
} from '../../data/bookTimeline'
import { bookSeries } from '../../data/books'
import { useBooksRead } from '../../state/booksRead'
import { assetUrl } from '../../data/assetUrl'
import { journeyAtlas, journeyMapsOn } from '../../data/journeyAtlas'
import { weight } from '../../data/notable'
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
import type {
  ExplorerEffect,
  ExplorerGoal,
  ExplorerPlace,
} from '../explorer/ExplorerCanvas'
import type { Level } from '../explorer/sky'
import { hasWebGL, reducedMotion } from '../explorer/webgl'
import {
  explorerPins,
  cityOn,
  insetMap,
  explorerWorlds,
  pointOn,
  type ExplorerWorld,
} from '../explorer/worlds'
import { worldStateAt } from '../../data/worldStates'
import { TitleStyleSwitcher } from './TitleStyleSwitcher'
import { WorldCard, WorldTitle } from './WorldCard'
import styles from './CosmereTimeline.module.css'

// Three.js is big: it loads with this view, not with the guide.
const ExplorerCanvas = lazy(() => import('../explorer/ExplorerCanvas'))

/** Close in on a city on its world's map, where its own map takes over. */
const CITY_CUT_H = 300

/** Bar pixels per step of an event's offset; markers are narrower. */
const STEP_PX = 76

const bookTitle = (id: string) =>
  bookSeries.flatMap((s) => s.books).find((b) => b.id === id)?.title ?? id

/**
 * The Cosmere Timeline: the explorer (the painted sky of the Cosmere, its
 * worlds and their maps) with a timeline of events along the bottom, in
 * the manner of the 17th Shard's Roshar map. Picking an event flies to its
 * world (and its place there); the reader can zoom out to the Cosmere at
 * any time and look in on other worlds. Only what the reader's books have
 * shown is ever drawn.
 */
/**
 * The place someone's pin is at, on the map shown: the city map their pin
 * is on, else the place named on the pin (with its own map, if any, to
 * open). Inside a city's own map the map is the place, so none.
 */
function placeOf(
  pin: { mapId: string; place?: string; placeId?: string } | undefined,
  shown: string | undefined,
  canSee: CanSee,
): ExplorerPlace | undefined {
  if (!pin || !shown) return undefined
  if (pin.mapId === shown) {
    if (cityOn(shown, canSee) || !pin.place) return undefined
    const own = journeyMapsOn(shown).find(
      (m) => m.parent?.placeId === pin.placeId && canSee(m.revealedIn),
    )
    return { name: pin.place, mapId: pin.placeId && own?.id }
  }
  for (
    let m = journeyAtlas.map(pin.mapId);
    m?.parent;
    m = journeyAtlas.map(m.parent.mapId)
  )
    if (m.parent.mapId === shown)
      return canSee(m.revealedIn) ? { name: m.title, mapId: m.id } : undefined
  return undefined
}

export function CosmereTimeline() {
  const canSee = useCanSee()
  const timeline = useMemo(() => revealTimeline(canSee), [canSee])
  // Only books the reader has read or started: no hint of the rest.
  const { read, reading } = useBooksRead()
  const books = useMemo(
    () => bookTimeline.filter((b) => read.has(b.id) || reading.has(b.id)),
    [read, reading],
  )
  const { events } = timeline
  const [params, setParams] = useSearchParams()
  const found = events.findIndex((e) => e.id === params.get('event'))
  const current = found >= 0 ? found : 0
  const event = events[current]
  // A world the reader chose to look at (or the whole Cosmere), away from
  // the current event's, and a character they asked to see there.
  const [explore, setExploreTo] = useState<string>()
  const [person, setPerson] = useState<string>()
  const [cardOpen, setCardOpen] = useState(true)
  // A city map the reader zoomed out of: its world shows the map above it.
  const [up, setUp] = useState<{
    world: string
    mapId: string
    /** The city map zoomed out of, to start from. */
    from?: string
    /** Zoomed into, not picked: the view is already there. */
    zoomed?: boolean
  }>()
  const people = useMemo(
    () => peopleAt(timeline, canSee, current),
    [timeline, canSee, current],
  )
  const shown = people.find((p) => p.id === person && p.where)
  // Someone in a city with its own map: their world unrolls into it.
  const city = shown?.where?.map?.mapId
  const cityWorld = city && cityOn(city, canSee) && shown.where?.world
  const worlds = useMemo(
    () =>
      explorerWorlds(
        timeline,
        canSee,
        event,
        city && cityWorld ? { world: cityWorld, mapId: city } : up,
      ),
    [timeline, canSee, event, city, cityWorld, up],
  )
  const setExplore = useCallback((world?: string) => {
    setExploreTo(world)
    setPerson(undefined)
    setUp(undefined)
  }, [])
  // Zooming out of a city map steps up to the map it sits on.
  const zoomOut = (world: string) => {
    const at = worlds.find((w) => w.id === world)?.mapId
    const parent = at && cityOn(at, canSee)
    if (!parent) return false
    setExplore(world)
    setUp({ world, mapId: parent.mapId, from: at })
    return true
  }

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
      books={books}
      // Only the current event's marker.
      pins={explorerPins({ ...timeline, events: [events[current]] }, worlds)}
      current={current}
      explore={explore}
      setExplore={setExplore}
      people={people}
      shards={revealShards(timeline, canSee, current)}
      person={shown}
      showPerson={(p) => {
        setExploreTo(p.where?.world)
        setPerson(p.id)
        setUp(undefined)
      }}
      up={up}
      zoomOut={zoomOut}
      openMap={(world, mapId, zoomed) => {
        setExplore(world)
        setUp({ world, mapId, zoomed })
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
  up?: { world: string; mapId: string; from?: string; zoomed?: boolean },
): ExplorerGoal {
  const where = person?.where
  const there = worlds.find((w) => w.id === where?.world)
  if (where && there) {
    const key = `person:${person.id}`
    const pin = pointOn(there.mapId, where.map)
    return pin && there.map
      ? { world: where.world, view: 'pin', pin, key }
      : { world: where.world, view: 'globe', key }
  }
  if (explore === COSMERE) return { key: 'cosmere' }
  if (up && explore === up.world) {
    const key = `up:${up.world}:${up.mapId}`
    // Handing over between a city's map and the map it's on: out of the
    // city from close in on it; into one from the whole of it.
    const from = up.from && journeyAtlas.map(up.from)?.parent?.at
    return from
      ? { world: up.world, view: 'pin', pin: from, cut: CITY_CUT_H, key }
      : { world: up.world, view: 'map', key, ...(up.zoomed && { cut: true }) }
  }
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
  books,
  pins,
  current,
  explore,
  setExplore,
  people,
  shards,
  person,
  showPerson,
  up,
  zoomOut,
  openMap,
  canSee,
  cardOpen,
  setCardOpen,
  go,
}: {
  events: ShownTimelineEvent[]
  worlds: ExplorerWorld[]
  /** The reader's books, earliest in the Cosmere first. */
  books: BookSpan[]
  pins: ReturnType<typeof explorerPins>
  current: number
  explore?: string
  setExplore: (world?: string) => void
  people: PersonAt[]
  shards: ShownShard[]
  /** The character being shown on the map, if any. */
  person?: PersonAt
  /** A map the reader zoomed out to, from a city on it. */
  up?: { world: string; mapId: string; from?: string; zoomed?: boolean }
  /** Steps a world up from its city map; false if it isn't on one. */
  zoomOut: (world: string) => boolean
  openMap: (world: string, mapId: string, zoomed?: boolean) => void
  showPerson: (p: PersonAt) => void
  canSee: CanSee
  cardOpen: boolean
  setCardOpen: (open: boolean) => void
  go: (i: number) => void
}) {
  const event = events[current]
  // The maps someone's on now (and the maps those sit on): only their cities
  // get a tag to open.
  const occupied = new Set<string>()
  for (const id of [
    ...people.map((p) => p.where?.map?.mapId),
    event?.map?.mapId,
  ])
    for (
      let m = id && journeyAtlas.map(id);
      m;
      m = m.parent && journeyAtlas.map(m.parent.mapId)
    )
      occupied.add(m.id)
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
  // The world card's dialog, open over its globe, and the box it frames
  // the globe into; bumping zoomIn flies into the world's map.
  const [onGlobe, setOnGlobe] = useState(false)
  const [worldDialog, setWorldDialog] = useState(false)
  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null)
  const [zoomIn, setZoomIn] = useState(0)
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
  // The books view: the bar lists the reader's books instead of events, and
  // picking one flies to its world (if the reader knows it; else the sky).
  const [book, setBook] = useState<number>()
  const shownBook = book === undefined ? undefined : books[book]
  const bookLayout = useMemo(() => layoutBooks(books), [books])
  const showBook = (i: number) => {
    const to = Math.max(0, Math.min(books.length - 1, i))
    const b = books[to]
    if (!b) return
    setBook(to)
    setPanel(undefined)
    pick(worlds.some((w) => w.id === b.world) ? b.world : COSMERE)
  }
  // Opens on the book nearest the current event.
  const openBooks = () =>
    showBook(
      books.reduce(
        (best, b, i) =>
          Math.abs(b.start - event.year) <
          Math.abs(books[best].start - event.year)
            ? i
            : best,
        0,
      ),
    )
  const closeBooks = () => {
    setBook(undefined)
    go(current)
  }
  // Reset flies to the same goal again, under a fresh key.
  const [reset, setReset] = useState({ key: '', n: 0 })
  const aimed = goalFor(event, explore, worlds, person, up)
  const goal =
    reset.key === aimed.key
      ? { ...aimed, key: `${aimed.key}#reset${reset.n}` }
      : aimed
  const where = person?.where
  // The whereabouts label, until the reader clicks elsewhere on the map.
  const [whereShut, setWhereShut] = useState(false)
  // A wrapped note leaves the label as wide as it may be, its lines short
  // of the edge; shrink it to its longest line.
  const whereEl = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    const el = whereEl.current
    // jsdom has no layout.
    if (!el || !document.createRange().getClientRects) return
    el.style.width = ''
    const text = el.lastElementChild!
    const range = document.createRange()
    const walk = document.createTreeWalker(text, NodeFilter.SHOW_TEXT)
    let right = 0
    while (walk.nextNode()) {
      range.selectNodeContents(walk.currentNode)
      for (const r of range.getClientRects()) right = Math.max(right, r.right)
    }
    const lines = text.getClientRects()[0]
    if (right < lines.right - 1)
      el.style.width = `${el.offsetWidth - (lines.right - right)}px`
  })
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
  // Switching between events and books jumps: the track changes under a
  // glide and cuts it short.
  const placed = useRef<boolean>(undefined)
  const drag = useRef<{ x: number; left: number; moved?: boolean }>(undefined)
  useLayoutEffect(() => {
    const el = strip.current
    if (!el) return
    const left =
      book === undefined ? event.offset * STEP_PX : bookLayout.rows[book].x
    const smooth = placed.current === (book !== undefined) && !reducedMotion()
    placed.current = book !== undefined
    if (typeof el.scrollTo === 'function')
      el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
    else el.scrollLeft = left
  }, [event.offset, book, bookLayout])

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('a, input')) return
    const at = book ?? current
    const to = {
      ArrowLeft: at - 1,
      ArrowRight: at + 1,
      Home: 0,
      End: (shownBook ? books : events).length - 1,
    }[e.key]
    if (to !== undefined) {
      e.preventDefault()
      if (shownBook) showBook(to)
      else go(to)
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
  // The world card: its title over the globe (not the sky, nor its map).
  const cardWorld =
    onGlobe && shownWorld?.id !== COSMERE ? shownWorld : undefined
  const cardMap = worlds.find((w) => w.id === cardWorld?.id)?.map
  const worldOpen = !!cardWorld && worldDialog
  const cardState =
    cardWorld && worldStateAt(events, canSee, current, cardWorld.id)
  if (worldDialog && !cardWorld) setWorldDialog(false)
  // The cards over the scene would show through the dialog's globe window.
  const underDialog = worldOpen ? { visibility: 'hidden' as const } : undefined
  const span = shownBook ? bookLayout.width : events.at(-1)!.offset * STEP_PX
  const groups = [
    ...new Set(events.flatMap((e) => (e.group ? [e.group.id] : []))),
  ]
    .map((id) => events.filter((e) => e.group?.id === id))
    .filter((g) => g.length > 1)
  const shattering = calendars.shattering
  const yearsShown = canSee(shattering.revealedIn)
  const bookYears = (b: BookSpan) => {
    const [from, to] = [b.start, b.end].map((year) =>
      formatYear({ year, circa: b.circa }),
    )
    return from === to ? from : `${from}\u2013${to.replace('ca. ', '')}`
  }
  const date = !shownBook
    ? event.when
    : yearsShown
      ? {
          text: bookYears(shownBook),
          label: shattering.label,
          note: shattering.note,
        }
      : undefined
  const bookWorld = shownBook && worlds.find((w) => w.id === shownBook.world)
  // Whole years on the books' scale, spaced out and clear of the breaks'
  // labels (both centred on their spot).
  const bookTicks = useMemo(() => {
    const first = books[0]?.start ?? 0
    const last = Math.max(...books.map((b) => b.end))
    const out: number[] = []
    let prev = -Infinity
    for (let y = Math.ceil(first); y <= last; y++) {
      const at = bookLayout.x(y)
      if (
        at - prev >= 64 &&
        !bookLayout.breaks.some(
          (g) => (y > g.from && y < g.to) || Math.abs(at - g.x) < 76,
        )
      ) {
        out.push(y)
        prev = at
      }
    }
    return out
  }, [books, bookLayout])
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
        shownBook && styles.booksMode,
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
            pins={shownBook ? [] : pins}
            goal={goal}
            current={explore ? undefined : event.id}
            effect={effectFor(event, explore)}
            onExplore={(w) => {
              if (!w && view && zoomOut(view.world)) return
              setExplore(w ?? COSMERE)
              setQuietOn(undefined)
            }}
            onPin={(id) => go(events.findIndex((e) => e.id === id))}
            onBackground={() => {
              setWhereShut(true)
              setPanel(undefined)
            }}
            globeTitle={
              cardWorld && (
                <WorldTitle
                  world={cardWorld}
                  state={cardState}
                  hidden={worldOpen}
                  onOpen={() => {
                    setPanel(undefined)
                    setWorldDialog(true)
                  }}
                />
              )
            }
            dock={worldOpen ? dockEl : null}
            zoomIn={zoomIn}
            onView={setView}
            onGlobe={setOnGlobe}
            // Main characters first.
            people={[...people]
              .sort((a, b) => weight(b.id, canSee) - weight(a.id, canSee))
              .flatMap((p) => {
                if (!p.where) return []
                const map = worlds.find((w) => w.id === p.where?.world)?.mapId
                const at = pointOn(map, p.where.map)
                return [
                  {
                    id: p.id,
                    name: p.name,
                    world: p.where.world,
                    at,
                    // Placed, but on a map not drawn (another city's).
                    elsewhere: !at && !!p.where.map,
                    face: face(p.id),
                    initials: initials(p.name),
                    place: placeOf(p.where.map, map, canSee),
                    note: p.where.note,
                  },
                ]
              })}
            onPlace={openMap}
            cities={worlds.flatMap((w) =>
              w.mapId
                ? journeyMapsOn(w.mapId).flatMap((m) =>
                    m.parent?.at &&
                    !m.parent.whole &&
                    canSee(m.revealedIn) &&
                    occupied.has(m.id)
                      ? [
                          {
                            world: w.id,
                            mapId: m.id,
                            title: m.title,
                            at: m.parent.at,
                            src: m.image.src,
                            map: insetMap(m.id),
                          },
                        ]
                      : [],
                  )
                : [],
            )}
            onPerson={(id) => {
              const p = people.find((o) => o.id === id)
              if (p) seePerson(p)
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
        <div className={styles.modes} role="group" aria-label="Timeline">
          <button
            type="button"
            className={styles.tool}
            aria-pressed={!shownBook}
            data-tooltip="Events across the Cosmere"
            onClick={() => shownBook && closeBooks()}
          >
            Events
          </button>
          <button
            type="button"
            className={styles.tool}
            aria-pressed={!!shownBook}
            disabled={books.length === 0}
            data-tooltip="Where your books fall in the Cosmere's history"
            onClick={() => !shownBook && openBooks()}
          >
            Books
          </button>
        </div>
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
        {/* Kept, and faded, rather than popping in and out. */}
        {!shownBook && (
          <button
            type="button"
            className={`${styles.tool} ${styles.back}`}
            data-tooltip="Fly back to the event on the timeline"
            data-shown={explore || undefined}
            aria-hidden={!explore || undefined}
            tabIndex={explore ? undefined : -1}
            onClick={() => go(current)}
          >
            ↩ Back to the event
          </button>
        )}
      </nav>

      {/* ponytail: temporary, to gather opinions on the way into the
          world card (worldTitleStyle.ts); remove once a style is chosen. */}
      <TitleStyleSwitcher hidden={!cardWorld || worldOpen} />
      {worldOpen && (
        <WorldCard
          world={cardWorld}
          state={cardState}
          shards={shards.filter((sh) => sh.world === cardWorld.id)}
          people={people
            .filter((p) => p.where?.world === cardWorld.id)
            .sort((a, b) => weight(b.id, canSee) - weight(a.id, canSee))}
          face={face}
          shown={person?.id}
          onShard={(id) => {
            setWorldDialog(false)
            setShardId(id)
            setPanel('shard')
          }}
          onPerson={(p) => {
            setWorldDialog(false)
            seePerson(p)
          }}
          onClose={() => setWorldDialog(false)}
          dockRef={setDockEl}
          credit={cardMap?.credit}
          onZoom={
            cardMap
              ? () => {
                  setWorldDialog(false)
                  setZoomIn((n) => n + 1)
                }
              : undefined
          }
        />
      )}

      {person && where && !whereShut && (
        <p
          ref={whereEl}
          className={styles.whereabouts}
          style={underDialog}
          aria-live="polite"
        >
          {face(person.id) ? (
            <img className={styles.face} src={face(person.id)} alt="" />
          ) : (
            <span className={styles.face} aria-hidden="true">
              {initials(person.name)}
            </span>
          )}
          <span className={styles.whereText}>
            <strong>{person.name}</strong> is{' '}
            {pointOn(worlds.find((w) => w.id === where.world)?.mapId, where.map)
              ? 'here'
              : 'somewhere'}{' '}
            on {where.worldName}
            {where.note && (
              <span className={`${styles.status} ${styles.note}`}>
                {where.note}
                {where.assumed && ' (assumed)'}
                {where.wob && ' (Word of Brandon)'}
              </span>
            )}
            {where.event.index !== current && (
              <span className={`${styles.status} ${styles.seen}`}>
                last seen: {where.event.title}
              </span>
            )}
          </span>
        </p>
      )}

      {shownBook ? (
        <section
          className={`${styles.card} ${styles.bookCard}`}
          style={underDialog}
          aria-live="polite"
          aria-label="Book"
        >
          <img
            className={styles.cover}
            src={assetUrl(shownBook.cover)}
            alt=""
          />
          <div>
            <h2 className={styles.title}>
              <Link to={`/books/${shownBook.id}`}>
                {bookTitle(shownBook.id)}
              </Link>
            </h2>
            {bookWorld && (
              <p className={styles.blurb}>Set on {bookWorld.name}</p>
            )}
            <p className={styles.credit}>
              Cover:{' '}
              <a href={shownBook.coverSource} target="_blank" rel="noreferrer">
                {shownBook.coverArtist}
              </a>
            </p>
          </div>
        </section>
      ) : quiet ? null : cardOpen ? (
        <section
          className={styles.card}
          style={underDialog}
          aria-live="polite"
          aria-label="Event"
        >
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
          worlds={worlds}
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
          aria-label={shownBook ? 'Previous book' : 'Previous event'}
          data-tooltip={shownBook ? 'Previous book (←)' : 'Previous event (←)'}
          disabled={(book ?? current) === 0}
          onClick={() => (shownBook ? showBook(book! - 1) : go(current - 1))}
        >
          ‹
        </button>
        <div
          className={styles.strip}
          ref={strip}
          // Mouse drag scrolls it, like touch; a drag isn't a click.
          onPointerDown={(e) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return
            drag.current = { x: e.clientX, left: strip.current!.scrollLeft }
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d || !(e.buttons & 1)) return
            const dx = e.clientX - d.x
            if (!d.moved && Math.abs(dx) < 5) return
            if (!d.moved) strip.current!.setPointerCapture(e.pointerId)
            d.moved = true
            strip.current!.scrollLeft = d.left - dx
          }}
          onPointerUp={() => {
            // Clear after the click this release fires, which it cancels.
            setTimeout(() => (drag.current = undefined))
          }}
          onClickCapture={(e) => {
            if (drag.current?.moved) e.stopPropagation()
          }}
        >
          <div
            className={`${styles.track} ${shownBook ? styles.bookTrack : ''}`}
            style={{ width: span }}
          >
            {shownBook && (
              <div className={styles.axis} aria-hidden>
                {yearsShown &&
                  bookTicks.map((y) => (
                    <span
                      key={y}
                      className={styles.axisYear}
                      style={{ left: bookLayout.x(y) }}
                    >
                      {formatYear({ year: y })}
                    </span>
                  ))}
                {bookLayout.breaks.map((g) => (
                  <span
                    key={g.from}
                    className={styles.gap}
                    style={{ left: g.x }}
                  >
                    {yearsShown && `\u2248 ${years(Math.round(g.years))}`}
                  </span>
                ))}
              </div>
            )}
            {shownBook && (
              <ol className={styles.ticks} aria-label="Books, earliest first">
                {bookLayout.rows.map((r, i) => (
                  <li
                    key={r.book.id}
                    className={[
                      styles.span,
                      r.side && styles.side,
                      r.point && styles.point,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={
                      {
                        left: r.x,
                        '--w': `${r.w}px`,
                        '--world':
                          worlds.find((w) => w.id === r.book.world)?.color ??
                          'var(--gold)',
                      } as CSSProperties
                    }
                  >
                    <button
                      type="button"
                      className={styles.book}
                      aria-current={i === book}
                      aria-label={`${bookTitle(r.book.id)}${yearsShown ? `, ${bookYears(r.book)}` : ''}`}
                      data-tooltip={bookTitle(r.book.id)}
                      onClick={() => showBook(i)}
                    >
                      <img src={assetUrl(r.book.cover)} alt="" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {!shownBook &&
              groups.map((g) => (
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
            {!shownBook && (
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
            )}
          </div>
        </div>
        <button
          type="button"
          className={styles.step}
          aria-label={shownBook ? 'Next book' : 'Next event'}
          data-tooltip={shownBook ? 'Next book (→)' : 'Next event (→)'}
          disabled={
            shownBook
              ? book === books.length - 1
              : current === events.length - 1
          }
          onClick={() => (shownBook ? showBook(book! + 1) : go(current + 1))}
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
  worlds,
  shown,
  face,
  onShow,
  go,
  onClose,
}: {
  people: PersonAt[]
  worlds: ExplorerWorld[]
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
        [p.name, ...p.aliases, ...p.personas].some((n) =>
          n.toLowerCase().includes(q),
        ),
      )
    : people
  const alive = found.filter((p) => p.where)
  const byWorld = new Map<string, PersonAt[]>()
  for (const p of alive)
    byWorld.set(p.where!.worldName, [
      ...(byWorld.get(p.where!.worldName) ?? []),
      p,
    ])
  const colour = (id: string) => worlds.find((w) => w.id === id)?.color
  const lost = found.filter((p) => !p.where && !p.unborn && !p.died)
  const others = found.filter((p) => !p.where && (p.unborn || p.died))
  const row = (p: PersonAt) => {
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
        <span className={styles.who}>
          {p.name}
          {p.personas.length > 0 && (
            <>
              {' '}
              <span className={styles.aka}>({p.personas.join(', ')})</span>
            </>
          )}
          {p.unborn && (
            <span className={styles.status}>{unbornText(p.unborn)}</span>
          )}
          {p.died && <span className={styles.status}>{diedText(p.died)}</span>}
        </span>
      </>
    )
    // A presumed death has no event of its own to jump to.
    const jump = p.unborn ?? (p.died?.assumed ? undefined : p.died)
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
            className={styles.jump}
            data-tooltip="Move the timeline there"
            onClick={() => go(jump.event)}
          >
            {p.unborn ? 'Jump to their birth' : 'Jump to their death'}
          </button>
        )}
      </li>
    )
  }
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
      {alive.length + lost.length > 0 && (
        <details className={styles.group} open>
          <summary>
            <h3>Known alive</h3>
            <span className={styles.tally}>{alive.length + lost.length}</span>
          </summary>
          {[...byWorld].map(([world, here]) => (
            <details key={world} className={styles.subgroup} open>
              <summary>
                <h4>
                  <span
                    className={styles.dot}
                    style={{ background: colour(here[0].where!.world) }}
                    aria-hidden="true"
                  />
                  On {world}
                </h4>
                <span className={styles.tally}>{here.length}</span>
              </summary>
              <ul className={styles.cast}>{here.map(row)}</ul>
            </details>
          ))}
          {lost.length > 0 && (
            <details className={styles.subgroup} open>
              <summary>
                <h4>
                  <span className={styles.dot} aria-hidden="true" />
                  Location unknown
                </h4>
                <span className={styles.tally}>{lost.length}</span>
              </summary>
              <ul className={styles.cast}>{lost.map(row)}</ul>
            </details>
          )}
        </details>
      )}
      {others.length > 0 && (
        <details className={styles.group} open>
          <summary>
            <h3>Everyone else</h3>
            <span className={styles.tally}>{others.length}</span>
          </summary>
          <ul className={styles.cast}>{others.map(row)}</ul>
        </details>
      )}
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
          {shard.vesselWob && (
            <small className={styles.artCredit}>Word of Brandon</small>
          )}
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
