// ponytail: temporary, to gather opinions on the way into the world card
// (see worldTitleStyle.ts); remove once a style is chosen. The ways in away
// from the title, which is then just the world's name: a chip with the
// world's state, or a node orbiting its globe.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import timeline from './CosmereTimeline.module.css'
import styles from './TitlePlacement.module.css'
import { PHONE, useMedia, type TitleStyle } from './worldTitleStyle'

interface PlacementProps {
  style: TitleStyle
  world: { name: string }
  /** The world's state now, and "Since …" (WorldCard's line). */
  state?: { label: string; since?: string }
  /** While the dialog is open (kept, to take the focus back). */
  hidden?: boolean
  onOpen: () => void
}

/** The way into the dialog for a placed style, if it has one. */
export function TitlePlacement(props: PlacementProps) {
  if (props.style === 'moon') return <Moon {...props} />
  if (props.style === 'state' && props.state) return <StateChip {...props} />
  return null
}

// Both live in the explorer's title slot, which the explorer moves to the
// globe's top each frame, the globe's radius in --globe-r.
const slotOf = (el: Element | null | undefined) =>
  el?.parentElement?.parentElement?.parentElement

/** The globe's edge on screen, past the radius the explorer gives. */
const EDGE = 1.06
/** Between the chip and the globe's edge, and the chip and the stage's. */
const GAP = 28
const MARGIN = 12

/**
 * `state`: the world's state on a glass chip. Left of the globe while
 * there's room, else under the toolbar; on phones, a bar under the name.
 */
function StateChip({ world, state, hidden, onOpen }: PlacementProps) {
  const phone = useMedia(PHONE)
  // In the title, wherever the chip is: finds the slot and the toolbar.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [wide, setWide] = useState(true)
  const chip = useRef<HTMLButtonElement>(null)
  const toolbar = anchor
    ?.closest(`.${timeline.stage}`)
    ?.querySelector<HTMLElement>(`.${timeline.toolbar}`)
  const mode = phone ? 'bar' : wide || !toolbar ? 'beside' : 'under'

  // Each frame: is there room beside the globe (clear of the toolbar)? And
  // under the toolbar, out of the title, fade with it.
  useEffect(() => {
    const slot = slotOf(anchor)
    if (phone || !slot || !toolbar) return
    let frame = 0
    let size = { w: 0, h: 0 }
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const el = chip.current
      if (!el) return
      const under = el.parentElement === toolbar
      if (under) {
        el.style.opacity = slot.style.opacity
        el.style.visibility = hidden ? 'hidden' : slot.style.visibility
      } else size = { w: el.offsetWidth, h: el.offsetHeight }
      // Settled only: not while the globe grows in or unrolls.
      if (Number(slot.style.opacity) < 0.9) return
      const [x, y] = slot.style.translate.split(' ').map(parseFloat)
      const r = parseFloat(slot.style.getPropertyValue('--globe-r'))
      if (!Number.isFinite(x + y + r)) return
      // The toolbar's own buttons, not the chip tucked under them.
      let right = 0
      let bottom = 0
      for (const b of toolbar.children as HTMLCollectionOf<HTMLElement>) {
        if (b === el) continue
        right = Math.max(right, b.offsetLeft + b.offsetWidth)
        bottom = Math.max(bottom, b.offsetTop + b.offsetHeight)
      }
      const top = y + r - size.h / 2
      const from =
        top < toolbar.offsetTop + bottom + 8 ? toolbar.offsetLeft + right : 0
      const room = x - r * EDGE - GAP - MARGIN - from
      setWide((was) => (was ? room >= size.w : room >= size.w + 24))
      // Tucked under the toolbar: narrow enough to stay off the globe.
      if (under)
        el.style.setProperty(
          '--room',
          `${x - r * EDGE - MARGIN - toolbar.offsetLeft}px`,
        )
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [anchor, phone, toolbar, hidden])

  const button = (
    <button
      ref={chip}
      type="button"
      className={styles.chip}
      data-mode={mode}
      style={hidden ? { visibility: 'hidden' } : undefined}
      aria-haspopup="dialog"
      data-world-title
      onClick={onOpen}
    >
      <span className={styles.kicker}>
        State<span className={styles.hide}> of {world.name}:</span>
      </span>
      <span className={styles.main}>{state!.label}</span>
      {state!.since && <span className={styles.sub}>{state!.since}</span>}
      <svg className={styles.chev} viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9.5 6 6 6-6 6" />
      </svg>
    </button>
  )
  return (
    <>
      <span ref={setAnchor} hidden />
      {mode === 'under' && toolbar ? createPortal(button, toolbar) : button}
    </>
  )
}

/** The orbit, as TitlePlacement.module.css draws it on wide screens. */
const ORBIT = { tilt: -20, rx: 1.32, ry: 0.36, from: -32, to: -6 }
/** Half the node's hit area, and the room kept round it and its label. */
const NODE = 22
const CLEAR = 6

type Box = { left: number; top: number; right: number; bottom: number }
/** How much of `a` lies on `b`. */
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
const area = (a: Box) => (a.right - a.left) * (a.bottom - a.top)

/**
 * `moon`: a small node on a thin, tilted gold orbit around the globe, at
 * about two o'clock, drifting a little along it. Its label shows on hover
 * or focus (always, on touch). Where that would run into the map's credit
 * or the zoom buttons, the orbit mirrors to ten o'clock (wide screens).
 * Only the node is a button: a click on the globe already zooms in.
 */
function Moon({ world, hidden, onOpen }: PlacementProps) {
  const phone = useMedia(PHONE)
  const touch = useMedia('(hover: none), (any-pointer: coarse)')
  const moon = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const [left, setLeft] = useState(false)

  // Every few frames, once the globe has settled: which side is clear?
  useEffect(() => {
    const el = moon.current
    const slot = slotOf(el)
    const stage = el?.closest(`.${timeline.stage}`)
    if (phone || hidden || !el || !slot || !stage) return
    let frame = 0
    let n = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (n++ % 12 || Number(slot.style.opacity) < 0.9) return
      const r = parseFloat(slot.style.getPropertyValue('--globe-r'))
      if (!Number.isFinite(r)) return
      const c = el.getBoundingClientRect()
      const s = stage.getBoundingClientRect()
      // The explorer's zoom buttons and map credit, and the toolbar's
      // buttons (not its Back while it's put away).
      const keep = [
        ...stage.querySelectorAll(
          `[data-keep-clear], .${timeline.toolbar} > *`,
        ),
      ]
        .filter((b) => getComputedStyle(b).visibility === 'visible')
        .map((b) => b.getBoundingClientRect())
        .filter((b) => b.width && b.height)
      const lw = label.current?.offsetWidth ?? 0
      const lh = label.current?.offsetHeight ?? 0
      const tilt = (ORBIT.tilt * Math.PI) / 180
      // How much of the node (weighted) and its label land on those or off
      // the stage, along the drift. The label counts only where it always
      // shows (touch): on hover it's there just for a moment.
      const lost = (b: Box) =>
        area(b) - overlap(b, s) + keep.reduce((n, k) => n + overlap(b, k), 0)
      const clash = (dir: 1 | -1) => {
        let sum = 0
        for (let i = 0; i <= 4; i++) {
          const t =
            ((ORBIT.from + ((ORBIT.to - ORBIT.from) * i) / 4) * Math.PI) / 180
          const px = r * ORBIT.rx * Math.cos(t)
          const py = r * ORBIT.ry * Math.sin(t)
          const x = c.left + dir * (px * Math.cos(tilt) - py * Math.sin(tilt))
          const y = c.top + px * Math.sin(tilt) + py * Math.cos(tilt)
          const node = {
            left: x - NODE - CLEAR,
            right: x + NODE + CLEAR,
            top: y - NODE - CLEAR,
            bottom: y + NODE + CLEAR,
          }
          const near = x + dir * (NODE + 4)
          const far = near + dir * (lw + CLEAR)
          const tag = {
            left: Math.min(near, far),
            right: Math.max(near, far),
            top: y - lh / 2 - CLEAR,
            bottom: y + lh / 2 + CLEAR,
          }
          sum += 10 * lost(node) + (touch ? lost(tag) : 0)
        }
        return sum
      }
      // Moves only for a clearly better side, so it doesn't flicker.
      setLeft((was) => {
        const here = clash(was ? -1 : 1)
        return here && clash(was ? 1 : -1) < here / 2 ? !was : was
      })
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [phone, hidden, touch])

  return (
    <div
      ref={moon}
      className={styles.moon}
      data-side={left && !phone ? 'left' : undefined}
      style={hidden ? { visibility: 'hidden' } : undefined}
    >
      <span className={styles.ring} aria-hidden="true" />
      <span className={styles.moonAt}>
        <button
          type="button"
          className={styles.node}
          aria-haspopup="dialog"
          data-world-title
          onClick={onOpen}
        >
          <span className={styles.disc} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 10.6v6.9" />
              <path className={styles.dotI} d="M12 6.9v.1" />
            </svg>
          </span>
          <span ref={label} className={styles.moonLabel}>
            State of {world.name}
          </span>
        </button>
      </span>
    </div>
  )
}
