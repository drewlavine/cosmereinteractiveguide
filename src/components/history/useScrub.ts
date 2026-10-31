import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import type { ShownEra } from '../../data/planetHistory'
import { stepsOf, toneStyle, type ScrubEra } from './helpers'

/** How long Play lingers on each moment. */
const DWELL = 5000

/**
 * What every look of the scrubber shares: the moment it's on, Play, and a
 * slider that drags or keys to the nearest moment.
 *
 * Each look renders its strip as a grid of `--n` equal columns, one per
 * moment: era buttons (`eraButton`) span their moments' columns, and the
 * slider (`slider`) holds one `dot(n)` per moment.
 */
export function useScrub<E extends ScrubEra>(eras: E[]) {
  const steps = stepsOf(eras)
  const [at, setAt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const i = Math.min(at, steps.length - 1)
  const last = i === steps.length - 1
  const running = playing && !last
  const step = steps[i]
  useEffect(() => {
    if (!running) return
    const next = setTimeout(() => setAt((n) => n + 1), DWELL)
    return () => clearTimeout(next)
  }, [running, i])

  const go = (n: number) => {
    setAt(Math.max(0, Math.min(n, steps.length - 1)))
    setPlaying(false)
  }

  // Dragging along the dots lands on whichever moment is nearest.
  const pick = (e: PointerEvent<HTMLElement>) => {
    let best = 0
    let gap = Infinity
    e.currentTarget.querySelectorAll('[data-dot]').forEach((dot, n) => {
      const r = dot.getBoundingClientRect()
      const g = Math.abs(r.left + r.width / 2 - e.clientX)
      if (g < gap) [best, gap] = [n, g]
    })
    go(best)
  }

  const keys: Record<string, number> = {
    ArrowLeft: i - 1,
    ArrowDown: i - 1,
    ArrowRight: i + 1,
    ArrowUp: i + 1,
    Home: 0,
    End: steps.length - 1,
  }

  return {
    steps,
    i,
    step,
    last,
    running,
    go,
    play: () => {
      if (last) setAt(0)
      setPlaying(!running)
    },
    /** For the grid: `--n` moments, `--i` the current one. */
    track: { '--n': steps.length, '--i': i } as CSSProperties,
    slider: {
      role: 'slider',
      tabIndex: 0,
      'aria-label': 'Moment in history',
      'aria-valuemin': 0,
      'aria-valuemax': steps.length - 1,
      'aria-valuenow': i,
      'aria-valuetext': `${step.era.title}: ${step.moment.title}`,
      onKeyDown: (e: KeyboardEvent) => {
        if (!(e.key in keys)) return
        e.preventDefault()
        go(keys[e.key])
      },
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        pick(e)
      },
      onPointerMove: (e: PointerEvent<HTMLElement>) => {
        if (e.buttons) pick(e)
      },
    },
    /** An era's button: spans its moments, jumps to the first. */
    eraButton: (era: E) => ({
      type: 'button' as const,
      style: {
        ...toneStyle(era.tone),
        gridColumn: `span ${era.moments.length}`,
      },
      'aria-pressed': era === step.era,
      onClick: () => go(steps.findIndex((x) => x.era === era)),
    }),
    /** Moment `n`'s dot: in its era's tone, marked if passed or current. */
    dot: (n: number) => ({
      style: toneStyle(steps[n].era.tone),
      'data-dot': true,
      'data-past': n <= i || undefined,
      'data-at': n === i || undefined,
    }),
  }
}

export type Scrub<E extends ScrubEra = ShownEra> = ReturnType<
  typeof useScrub<E>
>

/**
 * A callback ref for a look's scrolling strip that keeps moment `i` in view
 * as it scrolls sideways: its era's tile, or just its dot if the tile is
 * wider than the strip, or with `centre` the dot in the middle. A strip's
 * scroll-padding-left marks anything pinned over its left edge.
 */
export function useFollow(i: number, { centre = false } = {}) {
  const [box, strip] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    const tile = box?.querySelector('[aria-pressed="true"]')
    const dot = box?.querySelector('[data-at]')
    if (!box || !tile || !dot) return
    const pad = parseFloat(getComputedStyle(box).scrollPaddingLeft) || 0
    const b = box.getBoundingClientRect()
    const left = b.left + pad
    const width = b.width - pad
    const t = tile.getBoundingClientRect()
    const r = !centre && t.width <= width ? t : dot.getBoundingClientRect()
    const by = r.left - left - (width - r.width) / 2
    if (centre ? Math.abs(by) > 1 : r.left < left || r.right > b.right)
      box.scrollBy?.({ left: by })
  }, [box, i, centre])
  return strip
}
