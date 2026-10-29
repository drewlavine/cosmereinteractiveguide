import { useEffect, useId, useRef, useState, type Ref } from 'react'
import type { ShownShard } from '../../data/shards'
import type { PersonAt } from '../../data/timelinePeople'
import type { ShownWorldState } from '../../data/worldStates'
import { initials } from '../bookMap/markers'
import { SearchIcon } from '../SearchIcon'
import { TitlePlacement } from './TitlePlacement'
import styles from './WorldCard.module.css'
import {
  placedElsewhere,
  useTitleStyle,
  type TitleStyle,
} from './worldTitleStyle'

/**
 * The world card: the world's name over its globe opens a large dialog with
 * how the world stands at the timeline's point, its Shards and its notable
 * characters, the live globe docked at its right (the camera frames it into
 * `dockRef`'s box). A click on that globe closes it and zooms into the
 * world's map. Every list is already trimmed to what the reader may see.
 */
export interface WorldCardProps {
  world: { id: string; name: string; color: string }
  state?: ShownWorldState
  /** The Shards at this world. */
  shards: ShownShard[]
  /** Who's on this world, most notable first. */
  people: PersonAt[]
  face: (id: string) => string | undefined
  /** The character being shown on the map. */
  shown?: string
  onShard: (id: string) => void
  onPerson: (p: PersonAt) => void
  onClose: () => void
  /** Zoom into the world's map (absent if it has none). */
  onZoom?: () => void
  /** The globe's map credit, shown under it. */
  credit?: string
  /** The box the globe is framed into. */
  dockRef?: Ref<HTMLDivElement>
}

/** "Since Gavilar's assassination · 6 years ago": nothing without a phrase. */
function since(state: ShownWorldState) {
  const { years, phrase } = state
  if (!state.since || !phrase) return undefined
  const ago =
    years === undefined
      ? undefined
      : years === 0
        ? 'this year'
        : `${years} year${years === 1 ? '' : 's'} ago`
  return [`Since ${phrase}`, ago].filter(Boolean).join(' · ')
}

/**
 * The world's name above its globe, and the way into the dialog: in the
 * title, or (the `state` and `moon` styles) placed round the globe.
 */
export function WorldTitle({
  world,
  state,
  hidden,
  onOpen,
}: {
  world: WorldCardProps['world']
  state?: ShownWorldState
  /** While its dialog is open (kept, to take the focus back). */
  hidden?: boolean
  onOpen: () => void
}) {
  // ponytail: the style being tried (worldTitleStyle.ts); with no state
  // for the chip, the name is the way in.
  const [picked] = useTitleStyle()
  const style = picked === 'state' && !state ? 'name' : picked
  if (placedElsewhere(style))
    return (
      <div className={`${styles.titleWrap} ${styles.placed}`}>
        <div
          className={`${styles.title} ${styles.plain}`}
          style={hidden ? { visibility: 'hidden' } : undefined}
        >
          <span className={styles.titleName}>{world.name}</span>
        </div>
        <TitlePlacement
          style={style}
          world={world}
          state={state && { label: state.label, since: since(state) }}
          hidden={hidden}
          onOpen={onOpen}
        />
      </div>
    )
  // The wrapper, not the button, holds the room kept clear above it.
  return (
    <div className={styles.titleWrap}>
      <button
        type="button"
        className={styles.title}
        data-style={style}
        style={hidden ? { visibility: 'hidden' } : undefined}
        aria-haspopup="dialog"
        data-world-title
        aria-label={`${world.name}: state, Shards and characters`}
        data-tooltip={
          style === 'icon' || style === 'name'
            ? 'State, Shards and characters'
            : undefined
        }
        onClick={onOpen}
      >
        <span className={styles.titleName}>{world.name}</span>
        <TitleCue style={style} world={world.name} />
      </button>
    </div>
  )
}

/** ponytail: what beside or under the name says it opens, per style. */
function TitleCue({ style, world }: { style: TitleStyle; world: string }) {
  switch (style) {
    case 'name':
      return <Chevron className={styles.nameChev} />
    case 'line':
      return (
        <span className={styles.cueLine} aria-hidden="true">
          State of the world <Chevron className={styles.cueChev} />
        </span>
      )
    case 'icon':
      return (
        <span className={styles.cueIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" {...stroke}>
            <path d="M12 10.5v7.5" strokeWidth="2.2" />
            <path d="M12 6.2v.1" strokeWidth="3" />
          </svg>
        </span>
      )
    case 'chip':
      return (
        <span className={styles.cueChip} aria-hidden="true">
          <SearchIcon name="planet" />
          Overview
        </span>
      )
    case 'hover':
      return (
        <span className={styles.cueHint} aria-hidden="true">
          See the state of {world}
          <Chevron className={styles.cueChev} />
        </span>
      )
    default:
      return (
        <span className={styles.more} aria-hidden="true">
          Details <span className={styles.chev}>›</span>
        </span>
      )
  }
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function Chevron({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...stroke}
    >
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  )
}

export function WorldCard({
  world,
  state,
  shards,
  people,
  face,
  shown,
  onShard,
  onPerson,
  onClose,
  onZoom,
  credit,
  dockRef,
}: WorldCardProps) {
  const heading = useId()
  const box = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLButtonElement>(null)
  // Where the focus was on opening (not once the dialog took it).
  const [before] = useState(() => document.activeElement as HTMLElement | null)
  const latest = useRef(onClose)
  useEffect(() => {
    latest.current = onClose
  })

  // Focus in on opening, back where it was on closing; Escape and Tab
  // stay within the dialog.
  useEffect(() => {
    first.current?.focus({ preventScroll: true })
    const keys = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        latest.current()
      } else if (e.key === 'Tab' && box.current) {
        const all = [
          ...box.current.querySelectorAll<HTMLElement>('button, [href]'),
        ].filter((el) => el.offsetParent !== null)
        const [a, z] = [all[0], all.at(-1)]
        if (!a || !z) return
        const on = document.activeElement
        if (!box.current.contains(on) || (e.shiftKey ? on === a : on === z)) {
          e.preventDefault()
          ;(e.shiftKey ? z : a).focus()
        }
      }
    }
    window.addEventListener('keydown', keys, true)
    return () => {
      window.removeEventListener('keydown', keys, true)
      if (before?.isConnected) before.focus({ preventScroll: true })
    }
  }, [before])

  const from = state && since(state)
  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" onClick={onClose} />
      <div
        ref={box}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
      >
        <div className={styles.info}>
          <header className={styles.head}>
            <h2 id={heading} className={styles.name}>
              <span
                className={styles.dot}
                style={{ background: world.color }}
                aria-hidden="true"
              />
              {world.name}
            </h2>
            <button
              ref={first}
              type="button"
              className={styles.close}
              aria-label="Close"
              data-tooltip="Close (Esc)"
              onClick={onClose}
            >
              ×
            </button>
          </header>
          <div className={styles.body}>
            {state && (
              <section className={styles.section} aria-label="State">
                <h3 className={styles.label}>State</h3>
                <p className={styles.era}>{state.label}</p>
                <p className={styles.stateText}>{state.text}</p>
                {from && <p className={styles.since}>{from}</p>}
              </section>
            )}
            {shards.length > 0 && (
              <section className={styles.section} aria-label="Shards">
                <h3 className={styles.label}>
                  Shards <span className={styles.tally}>{shards.length}</span>
                </h3>
                <ul className={styles.shards}>
                  {shards.map((sh) => (
                    <li key={sh.id}>
                      <button
                        type="button"
                        className={styles.tile}
                        data-tooltip={`About ${sh.name}`}
                        onClick={() => onShard(sh.id)}
                      >
                        <img
                          className={styles.art}
                          src={sh.art}
                          alt=""
                          decoding="async"
                          data-faded={sh.faded || undefined}
                        />
                        <span className={styles.tileText}>
                          <strong>{sh.name}</strong>
                          <span>{sh.status}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {people.length > 0 && (
              <section
                className={styles.section}
                aria-label="Notable characters"
              >
                <h3 className={styles.label}>
                  Notable characters{' '}
                  <span className={styles.tally}>{people.length}</span>
                </h3>
                <ul className={styles.people}>
                  {people.map((p) => {
                    const src = face(p.id)
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={styles.tile}
                          aria-label={`Show ${p.name} on the map`}
                          aria-pressed={shown === p.id}
                          onClick={() => onPerson(p)}
                        >
                          {src ? (
                            <img className={styles.face} src={src} alt="" />
                          ) : (
                            <span className={styles.face} aria-hidden="true">
                              {initials(p.name)}
                            </span>
                          )}
                          <span className={styles.tileText}>
                            <strong>{p.name}</strong>
                            {p.where?.note && <span>{p.where.note}</span>}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
        <div className={styles.planet}>
          <div ref={dockRef} className={styles.slot}>
            {onZoom && (
              <button
                type="button"
                className={styles.zoom}
                aria-label={`Zoom into ${world.name}'s map`}
                data-tooltip="Zoom in to the map"
                onClick={onZoom}
              />
            )}
          </div>
          <div className={styles.caption}>
            {onZoom && (
              <p className={styles.hint} aria-hidden="true">
                Click {world.name} to explore its map
              </p>
            )}
            {credit && <p className={styles.credit}>{credit}</p>}
          </div>
        </div>
      </div>
    </>
  )
}
