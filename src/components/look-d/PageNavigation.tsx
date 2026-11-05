import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
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

function SectionList({
  nav,
  onJump,
  lit,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
  /** Rows on screen, for the page map. */
  lit?: Set<string>
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
              data-lit={lit?.has(section.id) || undefined}
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
                        data-lit={(part.id && lit?.has(part.id)) || undefined}
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

/**
 * The page drawn to scale beside its outline. Bars, ticks and the window sit
 * at measured positions; the labels are the ordinary list beside them, so
 * none collide or go missing, and the rows now on screen are lit.
 */
function PageMap({
  nav,
  onJump,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
}) {
  // The track can move while the page scrolls under it, so a drag follows
  // the pointer's travel from where it started rather than the track's box.
  const drag = useRef<{
    origin: number
    height: number
    start: number
    moved: boolean
  }>(undefined)
  const { geometry } = nav
  const markers = mapMarkers(nav)
  const viewEnd = geometry.viewStart + geometry.viewSize
  const overlaps = (start: number, end: number) =>
    start < viewEnd && end > geometry.viewStart
  const lit = new Set(
    geometry.segments
      .filter((s) => overlaps(s.start, s.start + s.size))
      .map((s) => s.id),
  )
  markers.forEach((marker, i) => {
    if (marker.part && overlaps(marker.start, markers[i + 1]?.start ?? 1))
      lit.add(marker.part.id!)
  })
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
        <span>Drag the bar or choose</span>
      </div>
      <div className={styles.map}>
        <div
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
            const box = event.currentTarget.getBoundingClientRect()
            if (!box.height) return
            event.preventDefault()
            event.currentTarget.focus({ preventScroll: true })
            const y = (event.clientY - box.top) / box.height
            drag.current = {
              start: event.clientY,
              moved: false,
              height: box.height,
              origin:
                y >= geometry.viewStart && y <= viewEnd
                  ? geometry.viewStart
                  : y - geometry.viewSize / 2,
            }
            event.currentTarget.setPointerCapture?.(event.pointerId)
          }}
          onPointerMove={(event) => {
            const current = drag.current
            if (!current) return
            if (Math.abs(event.clientY - current.start) > 4)
              current.moved = true
            if (current.moved)
              nav.seek(
                current.origin +
                  (event.clientY - current.start) / current.height,
              )
          }}
          onPointerUp={() => {
            // A click outside the window centres it there.
            if (drag.current && !drag.current.moved)
              nav.seek(drag.current.origin)
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
          {markers.map((marker) => (
            <span
              key={marker.key}
              className={styles.mapTick}
              data-marker={marker.part?.id ?? marker.section.id}
              data-part={!!marker.part || undefined}
              aria-hidden
              style={{ top: `${marker.start * 100}%` }}
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
        </div>
        <SectionList nav={nav} onJump={onJump} lit={lit} />
      </div>
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

/**
 * Phone: a thin edge track. A tap opens the sheet; a drag unfolds every
 * section and topic down the edge, and letting go lands on the row under the
 * finger.
 */
function EdgeScrubber({
  nav,
  open,
}: {
  nav: PageNavigation
  open: (trigger: HTMLButtonElement) => void
}) {
  const pointer = useRef<{ start: number; moved: boolean }>(undefined)
  const suppressClick = useRef(false)
  const list = useRef<HTMLOListElement>(null)
  const [target, setTarget] = useState<{ index: number; y: number }>()
  const rows = nav.sections.flatMap((section) => [
    { section, part: undefined as NavPart | undefined },
    ...section.parts.map((part) => ({ section, part })),
  ])
  const aim = rows[target?.index ?? -1]
  const end = () => {
    pointer.current = undefined
    setTarget(undefined)
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
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!pointer.current) return
          if (Math.abs(event.clientY - pointer.current.start) > 6)
            pointer.current.moved = true
          if (!pointer.current.moved) return
          const box = list.current?.getBoundingClientRect()
          const top = box?.top ?? 0
          const height = box?.height || window.innerHeight
          const index = Math.floor(
            ((event.clientY - top) / height) * rows.length,
          )
          setTarget({
            index: Math.min(rows.length - 1, Math.max(0, index)),
            y: Math.min(top + height, Math.max(top, event.clientY)),
          })
        }}
        onPointerUp={() => {
          suppressClick.current = !!pointer.current?.moved
          if (pointer.current?.moved && aim) nav.jump(aim.section, aim.part)
          end()
        }}
        onPointerCancel={() => {
          suppressClick.current = false
          end()
        }}
        onClick={(event) => {
          if (suppressClick.current) suppressClick.current = false
          else open(event.currentTarget)
        }}
      >
        <span className={styles.edgeTrack} aria-hidden />
        <span
          className={styles.edgeThumb}
          aria-hidden
          style={{
            top: `${(nav.geometry.viewStart + nav.geometry.viewSize / 2) * 100}%`,
          }}
        />
      </button>
      {target &&
        // Out of the sticky bar's stacking context, over the whole page.
        createPortal(
          <div className={styles.edgeOverlay} aria-hidden>
            <span className={styles.edgeRail}>
              {nav.geometry.segments.map((segment) => (
                <span
                  key={segment.id}
                  style={{
                    top: `${segment.start * 100}%`,
                    height: `${segment.size * 100}%`,
                  }}
                />
              ))}
            </span>
            <ol ref={list} style={{ '--rows': rows.length } as CSSProperties}>
              {rows.map((row, i) => (
                <li
                  key={`${row.section.id}:${row.part?.id ?? row.part?.title ?? ''}`}
                  data-part={!!row.part || undefined}
                  data-target={i === target.index || undefined}
                >
                  {row.part ? (
                    <TopicIcon
                      topic={row.part.topic}
                      className={styles.partIcon}
                    />
                  ) : (
                    <span className={styles.sectionIcon}>
                      {row.section.id === 'top' ? '↑' : '✦'}
                    </span>
                  )}
                  <span>{row.part?.title ?? row.section.title}</span>
                </li>
              ))}
            </ol>
            {aim && (
              <span className={styles.edgeCard} style={{ top: target.y }}>
                {aim.part && <small>{aim.section.title}</small>}
                {aim.part?.title ?? aim.section.title}
              </span>
            )}
          </div>,
          document.body,
        )}
      <span className="visually-hidden" role="status" aria-live="polite">
        {aim
          ? [aim.section.title, aim.part?.title].filter(Boolean).join(' · ')
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
