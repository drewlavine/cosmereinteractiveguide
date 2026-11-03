import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { TopicIcon } from './TopicIcon'
import type { NavPart, NavSection, PageNavigation } from './usePageNavigation'
import styles from './PageNavigation.module.css'

export type NavigationStyle = 'contents' | 'map'

interface NavigationProps {
  nav: PageNavigation
  mode: NavigationStyle
  onMode: (mode: NavigationStyle) => void
}

function NavigationSwitch({ mode, onMode }: Omit<NavigationProps, 'nav'>) {
  return (
    <div className={styles.switcher} role="group" aria-label="Navigation style">
      <span className={styles.switchLabel}>Navigation</span>
      {(
        [
          ['contents', 'A', 'Contents'],
          ['map', 'C', 'Page map'],
        ] as const
      ).map(([value, letter, title]) => (
        <button
          key={value}
          type="button"
          aria-label={`Navigation ${letter}: ${title}`}
          aria-pressed={mode === value}
          onClick={() => onMode(value)}
        >
          {letter} <span className={styles.switchName}>{title}</span>
        </button>
      ))}
    </div>
  )
}

function Progress({ nav }: { nav: PageNavigation }) {
  return (
    <div className={styles.progress} aria-hidden>
      <span style={{ width: `${nav.geometry.progress * 100}%` }} />
    </div>
  )
}

/** The current name is made from the same visible entries as the list. */
function currentLabel(nav: PageNavigation) {
  const section = nav.sections.find((s) => s.id === nav.current.section)
  const part = section?.parts.find((p) =>
    p.era === undefined ? p.id === nav.current.part : p.era === nav.current.era,
  )
  return part ? `${section?.title} › ${part.title}` : (section?.title ?? 'Top')
}

/** Only measured DOM headings get positions; Metro eras share History. */
function mapMarkers(nav: PageNavigation) {
  return nav.geometry.markers.flatMap((marker) => {
    const section = nav.sections.find((s) => s.id === marker.section)
    if (!section) return []
    const part = marker.part
      ? section.parts.find((p) => p.id === marker.part)
      : undefined
    if (marker.part && !part) return []
    const active =
      section.id === nav.current.section &&
      (!part || part.id === nav.current.part)
    return [
      {
        section,
        part,
        start: marker.start,
        active,
        key: `${section.id}:${part?.id ?? ''}`,
      },
    ]
  })
}

/**
 * Keep labels at their real positions. Where they collide, keep the active
 * label and section names first; every tick and the full list remain.
 */
function visibleMapLabels(
  markers: ReturnType<typeof mapMarkers>,
  height: number,
) {
  const picked: typeof markers = []
  const priority = (marker: (typeof markers)[number]) =>
    marker.active && marker.part ? 0 : marker.active ? 1 : !marker.part ? 2 : 3
  for (const marker of [...markers].sort((a, b) => priority(a) - priority(b))) {
    if (
      picked.every(
        (other) => Math.abs(other.start - marker.start) * height >= 19,
      )
    )
      picked.push(marker)
  }
  return new Set(picked.map((marker) => marker.key))
}

function SectionList({
  nav,
  onJump,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
}) {
  const [opened, setOpened] = useState<Record<string, boolean>>({})
  const uid = useId()
  return (
    <ol className={styles.sections}>
      {nav.sections.map((section) => {
        const active = nav.current.section === section.id
        const expanded = opened[section.id] ?? active
        const listId = `${uid}-${section.id}`
        const countLabel =
          section.id === 'culture'
            ? 'topics'
            : section.parts.some((p) => p.era !== undefined)
              ? 'eras'
              : 'parts'
        return (
          <li key={section.id}>
            <div
              className={styles.sectionRow}
              data-active={active || undefined}
            >
              <a
                href={`#${section.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  setOpened((old) => ({ ...old, [section.id]: true }))
                  onJump(section)
                }}
              >
                <span className={styles.sectionIcon} aria-hidden>
                  {section.id === 'top' ? '↑' : '✦'}
                </span>
                {section.title}
              </a>
              {section.parts.length > 0 && (
                <button
                  type="button"
                  className={styles.disclose}
                  aria-label={`${expanded ? 'Hide' : 'Show'} ${section.title} ${countLabel}`}
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() =>
                    setOpened((old) => ({
                      ...old,
                      [section.id]: !expanded,
                    }))
                  }
                >
                  <span>
                    {section.parts.length} {countLabel}
                  </span>
                  <span aria-hidden>{expanded ? '▾' : '▸'}</span>
                </button>
              )}
            </div>
            {section.parts.length > 0 && (
              <ol id={listId} className={styles.parts} hidden={!expanded}>
                {section.parts.map((part) => {
                  const partActive =
                    active &&
                    (part.era === undefined
                      ? part.id === nav.current.part
                      : part.era === nav.current.era)
                  const contents = (
                    <>
                      <TopicIcon
                        topic={part.topic}
                        className={styles.partIcon}
                      />
                      <span>{part.title}</span>
                      {part.count !== undefined && (
                        <span className={styles.partCount}>{part.count}</span>
                      )}
                    </>
                  )
                  return (
                    <li key={part.id ?? `era-${part.era}`}>
                      <a
                        href={part.href ?? `#${part.id}`}
                        aria-current={partActive ? 'location' : undefined}
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return
                          event.preventDefault()
                          onJump(section, part)
                        }}
                      >
                        {contents}
                      </a>
                    </li>
                  )
                })}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Contents({
  nav,
  onJump,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
}) {
  return (
    <nav aria-label="On this page">
      <div className={styles.cardHeading}>
        <span>On this page</span>
        <span>{currentLabel(nav)}</span>
      </div>
      <Progress nav={nav} />
      <SectionList nav={nav} onJump={onJump} />
    </nav>
  )
}

/** A scale drawing of the rendered article, with a draggable viewport. */
function PageMap({
  nav,
  onJump,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
}) {
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    offset: number
    start: number
    moved: boolean
    label?: string
  }>(undefined)
  const [height, setHeight] = useState(400)
  const { geometry } = nav
  const markers = mapMarkers(nav)
  const labels = visibleMapLabels(markers, height)
  useLayoutEffect(() => {
    const element = track.current
    if (!element) return
    const measure = () =>
      setHeight(element.getBoundingClientRect().height || 400)
    measure()
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    resize?.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      resize?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  const position = (event: PointerEvent<HTMLElement>) => {
    const box = track.current?.getBoundingClientRect()
    if (box?.height && drag.current)
      nav.seek((event.clientY - box.top - drag.current.offset) / box.height)
  }
  const key = (event: KeyboardEvent<HTMLElement>) => {
    const delta: Record<string, number> = {
      ArrowUp: -0.05,
      ArrowDown: 0.05,
      ArrowLeft: -0.05,
      ArrowRight: 0.05,
      PageUp: -geometry.viewSize,
      PageDown: geometry.viewSize,
    }
    if (event.key === 'Home') nav.seek(0)
    else if (event.key === 'End') nav.seek(1)
    else if (event.key in delta) nav.seek(geometry.viewStart + delta[event.key])
    else return
    event.preventDefault()
  }
  return (
    <nav aria-label="Page map">
      <div className={styles.cardHeading}>
        <span>Page map</span>
        <span>Choose a label or drag</span>
      </div>
      <div
        ref={track}
        className={styles.mapTrack}
        role="slider"
        tabIndex={0}
        aria-label="Page position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(geometry.progress * 100)}
        aria-orientation="vertical"
        aria-valuetext={`${Math.round(geometry.progress * 100)}% · ${currentLabel(nav)}`}
        onKeyDown={key}
        onPointerDown={(event) => {
          const box = track.current?.getBoundingClientRect()
          if (!box?.height) return
          event.preventDefault()
          event.currentTarget.focus({ preventScroll: true })
          const y = event.clientY - box.top
          const inWindow =
            y >= geometry.viewStart * box.height &&
            y <= (geometry.viewStart + geometry.viewSize) * box.height
          drag.current = {
            start: event.clientY,
            moved: false,
            label:
              event.target instanceof Element
                ? event.target.closest<HTMLElement>('[data-map-label]')?.dataset
                    .mapLabel
                : undefined,
            offset: inWindow
              ? y - geometry.viewStart * box.height
              : (geometry.viewSize * box.height) / 2,
          }
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          if (Math.abs(event.clientY - drag.current.start) > 4)
            drag.current.moved = true
          if (drag.current.moved) position(event)
        }}
        onPointerUp={(event) => {
          const box = track.current?.getBoundingClientRect()
          if (box?.height && drag.current && !drag.current.moved) {
            const y = event.clientY - box.top
            const label = markers.find(
              (marker) => marker.key === drag.current?.label,
            )
            const nearest =
              label ??
              markers.reduce<(typeof markers)[number] | undefined>(
                (best, marker) =>
                  !best ||
                  Math.abs(marker.start * box.height - y) <
                    Math.abs(best.start * box.height - y)
                    ? marker
                    : best,
                undefined,
              )
            if (
              nearest &&
              (label || Math.abs(nearest.start * box.height - y) <= 12)
            )
              onJump(nearest.section, nearest.part)
            else position(event)
          }
          drag.current = undefined
        }}
        onPointerCancel={() => {
          drag.current = undefined
        }}
      >
        {geometry.segments.map((segment) => (
          <span
            key={segment.id}
            className={styles.mapSegment}
            aria-hidden
            style={{
              top: `${segment.start * 100}%`,
              height: `${segment.size * 100}%`,
            }}
          />
        ))}
        <span
          className={styles.mapWindow}
          aria-hidden
          style={{
            top: `${geometry.viewStart * 100}%`,
            height: `${geometry.viewSize * 100}%`,
          }}
        />
        {markers.map((marker) => (
          <span
            key={marker.key}
            className={styles.mapMarker}
            data-active={marker.active || undefined}
            data-part={!!marker.part || undefined}
            aria-hidden
            style={{ top: `${marker.start * 100}%` }}
          >
            <span className={styles.mapTick} />
            {labels.has(marker.key) && (
              <span
                className={styles.mapMarkerLabel}
                data-map-label={marker.key}
              >
                {marker.part?.topic && (
                  <TopicIcon
                    topic={marker.part.topic}
                    className={styles.partIcon}
                  />
                )}
                <span>{marker.part?.title ?? marker.section.title}</span>
                {marker.part?.count !== undefined && (
                  <span className={styles.partCount}>{marker.part.count}</span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>
      <p className={styles.mapHint}>
        Labels follow the visible page. Closely spaced labels remain in the
        list.
      </p>
      <details className={styles.mapIndex}>
        <summary>Browse all sections, topics and eras</summary>
        <SectionList nav={nav} onJump={onJump} />
      </details>
    </nav>
  )
}

/** Desktop: both looks occupy the top of the existing plate. */
export function NavigationPanel({ nav, mode, onMode }: NavigationProps) {
  return (
    <div className={styles.panel} data-place-nav>
      <NavigationSwitch mode={mode} onMode={onMode} />
      {mode === 'contents' ? (
        <Contents nav={nav} onJump={nav.jump} />
      ) : (
        <PageMap nav={nav} onJump={nav.jump} />
      )}
    </div>
  )
}

/** Phone: a discoverable edge target which taps open and drags to skim. */
function EdgeScrubber({
  nav,
  open,
}: {
  nav: PageNavigation
  open: (trigger: HTMLButtonElement) => void
}) {
  const pointer = useRef<{ start: number; moved: boolean }>(undefined)
  const suppressClick = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [height, setHeight] = useState(600)
  const markers = mapMarkers(nav)
  const labels = visibleMapLabels(markers, height)
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!pointer.current) return
    if (Math.abs(event.clientY - pointer.current.start) > 6) {
      pointer.current.moved = true
      setDragging(true)
    }
    const box = event.currentTarget.getBoundingClientRect()
    if (pointer.current.moved && box.height)
      nav.seek(
        (event.clientY - box.top) / box.height - nav.geometry.viewSize / 2,
      )
  }
  return (
    <>
      <button
        type="button"
        className={styles.edge}
        aria-label="Open page map"
        aria-haspopup="dialog"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ')
            suppressClick.current = false
        }}
        onPointerDown={(event) => {
          // A drag may not generate a click at all. Never suppress the next
          // independent tap if the browser omitted that synthetic click.
          suppressClick.current = false
          pointer.current = { start: event.clientY, moved: false }
          setHeight(event.currentTarget.getBoundingClientRect().height || 600)
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={move}
        onPointerUp={() => {
          suppressClick.current = !!pointer.current?.moved
          pointer.current = undefined
          setDragging(false)
        }}
        onPointerCancel={() => {
          pointer.current = undefined
          suppressClick.current = false
          setDragging(false)
        }}
        onClick={(event) => {
          if (suppressClick.current) suppressClick.current = false
          else open(event.currentTarget)
        }}
      >
        <span className={styles.edgeName} aria-hidden>
          Map
        </span>
        <span className={styles.edgeTrack} aria-hidden />
        {dragging && (
          <span className={styles.edgePreview} aria-hidden>
            {markers.map((marker) => (
              <span
                key={marker.key}
                className={styles.edgeMarker}
                data-active={marker.active || undefined}
                data-part={!!marker.part || undefined}
                style={{ top: `${marker.start * 100}%` }}
              >
                {labels.has(marker.key) &&
                  (marker.part?.title ?? marker.section.title)}
              </span>
            ))}
          </span>
        )}
        <span
          className={styles.edgeThumb}
          aria-hidden
          style={{
            top: `${(nav.geometry.viewStart + nav.geometry.viewSize / 2) * 100}%`,
          }}
        />
        {dragging && (
          <span
            className={styles.edgeCurrent}
            aria-hidden
            style={{
              top: `${(nav.geometry.viewStart + nav.geometry.viewSize / 2) * 100}%`,
            }}
          >
            {currentLabel(nav)}
          </span>
        )}
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {dragging
          ? `${currentLabel(nav)} · ${Math.round(nav.geometry.progress * 100)}%`
          : ''}
      </span>
    </>
  )
}

/** The sticky context bar and a native, focus-trapping bottom sheet. */
export function MobileNavigation({ nav, mode, onMode }: NavigationProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const titleId = useId()

  const show = (trigger: HTMLButtonElement) => {
    const sheet = dialog.current
    if (!sheet || sheet.hasAttribute('open')) return
    returnTo.current = trigger
    if (sheet.showModal) sheet.showModal()
    else sheet.setAttribute('open', '')
    setOpen(true)
    closeButton.current?.focus()
  }
  const restore = () => {
    setOpen(false)
    returnTo.current?.focus({ preventScroll: true })
  }
  const close = () => {
    const sheet = dialog.current
    if (!sheet?.hasAttribute('open')) return
    if (sheet.close) sheet.close()
    else {
      sheet.removeAttribute('open')
      restore()
    }
  }
  const jump = (section: NavSection, part?: NavPart) => {
    close()
    nav.jump(section, part)
  }
  const trapKeys = (event: KeyboardEvent<HTMLDialogElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter(
      (el) =>
        !el.closest('[hidden]') &&
        (!el.closest('details:not([open])') || el.matches('summary')),
    )
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <div className={styles.mobile} data-place-nav>
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.context}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => show(event.currentTarget)}
        >
          <span>{mode === 'contents' ? 'Contents' : 'Page map'}</span>
          <strong>{currentLabel(nav)}</strong>
          <span aria-hidden>▾</span>
        </button>
        <NavigationSwitch mode={mode} onMode={onMode} />
      </div>
      <Progress nav={nav} />
      {mode === 'map' && <EdgeScrubber nav={nav} open={show} />}
      <dialog
        ref={dialog}
        className={styles.sheet}
        aria-labelledby={titleId}
        aria-modal="true"
        onClose={restore}
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onKeyDown={trapKeys}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className={styles.sheetHead}>
          <h2 id={titleId}>
            {mode === 'contents' ? 'On this page' : 'Page map'}
          </h2>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close navigation"
            onClick={close}
          >
            ×
          </button>
        </div>
        {mode === 'contents' ? (
          <Contents nav={nav} onJump={jump} />
        ) : (
          <PageMap nav={nav} onJump={jump} />
        )}
      </dialog>
    </div>
  )
}
