/**
 * Place flags on the explorer's maps: one flag per place, naming it and
 * counting who's there (see docs/cosmere-timeline.md). Grouping, and the
 * greedy search for a free spot around each place, kept apart from the
 * canvas so they can be tested.
 */
import type { ExplorerFloatPerson } from './ExplorerCanvas'

export interface FlagGroup {
  /** The place's name, else its point: stable while the event's on. */
  key: string
  world: string
  name?: string
  /** Its own map, to open. */
  mapId?: string
  /** Most recognisable first: the stack shows the first few. */
  members: ExplorerFloatPerson[]
  /** Where on the world's map (the middle of its people). */
  at: [number, number]
}

/**
 * The people placed on each world's map, by place: one group per place
 * name (or, unnamed, per spot). Only the people given are counted, so
 * anyone the reader hasn't met (left out upstream) never adds to a count,
 * and a place with nobody shown has no group at all.
 */
export function placeGroups(
  people: readonly ExplorerFloatPerson[],
  shown?: string,
): FlagGroup[] {
  const groups = new Map<string, FlagGroup>()
  for (const p of people) {
    if (!p.at) continue
    const key = `${p.world}:${p.place?.name ?? p.at.join(',')}`
    const g = groups.get(key)
    if (g) g.members.push(p)
    else
      groups.set(key, {
        key,
        world: p.world,
        name: p.place?.name,
        mapId: p.place?.mapId,
        members: [p],
        at: [0, 0],
      })
  }
  return [...groups.values()].map((g) => {
    // People come most notable first; those with a face lead the stack,
    // and whoever the reader asked to see leads it all.
    const members = [...g.members].sort(
      (a, b) =>
        Number(b.id === shown) - Number(a.id === shown) ||
        Number(!!b.face) - Number(!!a.face),
    )
    const n = members.length
    const x = members.reduce((s, p) => s + p.at![0], 0) / n
    const y = members.reduce((s, p) => s + p.at![1], 0) / n
    return { ...g, members, at: [x, y] }
  })
}

/** A screen rectangle: left, top, right, bottom. */
export type Box = readonly [number, number, number, number]

export const hits = (a: Box, b: Box) =>
  a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]

const within = (a: Box, b: Box) =>
  a[0] >= b[0] && a[1] >= b[1] && a[2] <= b[2] && a[3] <= b[3]

/** Around a place: N, NE, E, SE, S, SW, W, NW, in that order. */
const DIRS = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
] as const

export interface FlagSpot {
  dir: number
  gap: number
  compact: boolean
  /** The flag's box on screen. */
  box: Box
}

/**
 * Where a flag of width `w` (`cw` compact) and height `h` goes around its
 * place at `a`: the first of eight spots, at each gap in turn, that's in
 * `view` and clear of everything `taken`; compact if only that fits. Keeps
 * `last` while it still fits, so flags don't jump about as the map moves.
 */
export function spotFor(
  a: readonly [number, number],
  w: number,
  cw: number,
  h: number,
  view: Box,
  taken: readonly Box[],
  gaps: readonly number[],
  last?: FlagSpot,
): FlagSpot | undefined {
  const at = (dir: number, gap: number, compact: boolean) => {
    const [dx, dy] = DIRS[dir]
    const fw = compact ? cw : w
    const g = dx && dy ? gap * Math.SQRT1_2 : gap
    const x = a[0] + dx * (g + fw / 2)
    const y = a[1] + dy * (g + h / 2)
    const box: Box = [x - fw / 2, y - h / 2, x + fw / 2, y + h / 2]
    return within(box, view) && !taken.some((t) => hits(box, t))
      ? { dir, gap, compact, box }
      : undefined
  }
  for (const compact of [false, true]) {
    if (last?.compact === compact) {
      const kept = at(last.dir, last.gap, compact)
      if (kept) return kept
    }
    for (const gap of gaps)
      for (let dir = 0; dir < DIRS.length; dir++) {
        const s = at(dir, gap, compact)
        if (s) return s
      }
  }
  return undefined
}

/**
 * A flag for a place off screen: on the edge of `view` (inset by half the
 * flag, plus a margin), on the line from the middle toward the place, with
 * the arrow that points there.
 */
export function edgeSpot(
  a: readonly [number, number],
  w: number,
  h: number,
  view: Box,
): { x: number; y: number; arrow: string } {
  const m = 8
  const cx = (view[0] + view[2]) / 2
  const cy = (view[1] + view[3]) / 2
  const hx = (view[2] - view[0]) / 2 - w / 2 - m
  const hy = (view[3] - view[1]) / 2 - h / 2 - m
  const dx = a[0] - cx
  const dy = a[1] - cy
  const tx = dx ? hx / Math.abs(dx) : Infinity
  const ty = dy ? hy / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty)
  const arrow = tx < ty ? (dx > 0 ? '▶' : '◀') : dy > 0 ? '▼' : '▲'
  return { x: cx + dx * t, y: cy + dy * t, arrow }
}

/** The point of box `b` nearest `a`: where a stem from `a` meets it. */
export const nearest = (
  a: readonly [number, number],
  b: Box,
): [number, number] => [
  Math.min(Math.max(a[0], b[0]), b[2]),
  Math.min(Math.max(a[1], b[1]), b[3]),
]
