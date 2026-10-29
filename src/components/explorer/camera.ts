import {
  artOffset,
  clampAxis,
  distFor,
  ease,
  GLOBE_H,
  lerp,
  lerpH,
  levelFades,
  PLANE_Z,
  PLANET_R,
  SKY,
  SKY_FLIGHT_H,
  SKY_MIN_H,
  skyScale,
  type Fades,
  type Level,
} from './sky'

/** What the camera knows of a world: its star, and its map's size. */
export interface CamWorld {
  /** Art pixel of its system's star in the painted sky. */
  star: readonly [number, number]
  /** Its map in world units, if it has one. */
  map?: readonly [number, number]
  /** A city's map: zooming out past it hands over to the map it's on. */
  city?: boolean
  /** For a city: its scale and centre on the map it's on (that map's units). */
  inset?: { k: number; at: readonly [number, number] }
}

/** Where to end up: a world (none for the sky), and a view on it. */
export interface CamTarget {
  world?: string
  c?: readonly [number, number]
  h?: number
  /** A set duration for the last leg. */
  ms?: number
}

/** One flight of a journey; `anchor` re-centres on that world first. */
export interface Leg {
  c: readonly [number, number]
  h: number
  level: Level
  anchor?: string
  ms?: number
}

interface Flight {
  from: [number, number, number]
  to: [number, number, number]
  t0: number
  ms: number
  fromLevel: Level
  toLevel: Level
  k: number
}

/**
 * Where the globe should sit at its globe view instead of the screen's
 * middle: in a box (centre and radius, in screen pixels), or just lower
 * and smaller to leave `top` pixels clear above it.
 */
export type CamDock = { x: number; y: number; r: number } | { top: number }

/** The farthest out you can zoom on a world. */
export const WORLD_MAX_H = 6400

/**
 * A 2D camera over the explorer: a centre (world units, y up), a view
 * height, the level (sky or world) and the anchor world drawn at the
 * origin. Flights go one leg at a time; between worlds they rise to the
 * sky, re-centre on the next world's star there (invisibly: worlds aren't
 * drawn on the sky) and dive in.
 */
export class Cam {
  cx = 0
  cy = 0
  h = 43000
  /** Screen size in CSS pixels. */
  W = 1
  H = 1
  level: Level = 'sky'
  anchor: string
  worlds: Record<string, CamWorld>
  /** Reduced motion: every journey is a single cut. */
  reduced = false
  flight?: Flight
  legs: Leg[] = []
  onLevel?: (level: Level) => void
  onAnchor?: (anchor: string) => void
  /** Zooming out past a world's farthest view: back to the Cosmere. */
  onZoomOutEdge?: () => void
  /** Zooming in past a map's closest view, about a screen point. */
  onZoomInEdge?: (sx: number, sy: number) => void
  private pointers = new Map<number, { x: number; y: number }>()
  private skyMaxFor = ''
  private skyMaxH = Infinity
  /** A wheel zoom still to play out: its log factor, about a point. */
  private glide?: {
    log: number
    x: number
    y: number
    edge?: boolean
    wait?: number
  }
  private last?: number
  /**
   * A framing for the globe view, set from outside (e.g. the globe beside
   * a panel). It eases in and out, and gives way as the globe unrolls into
   * its map, so the map and sky are never framed.
   */
  dock?: CamDock
  private docking?: CamDock
  private docked = 0
  /**
   * The framing in use: the view scaled by k about the screen's middle,
   * then moved by (x, y) screen pixels. The renderer and toScreen apply it.
   */
  frame = { k: 1, x: 0, y: 0 }

  constructor(worlds: Record<string, CamWorld>, anchor: string) {
    this.worlds = worlds
    this.anchor = anchor
    const [cx, cy, h] = this.skyLeg()
    ;[this.cx, this.cy, this.h] = this.limit(cx, cy, h, 'sky')
  }

  private star(world = this.anchor) {
    return this.worlds[world]?.star ?? [SKY.w / 2, SKY.h / 2]
  }

  /** How much bigger the far-off sky looks than the plane, at view h. */
  private skyGrow = (h: number) => (PLANE_Z + distFor(h)) / distFor(h)

  /**
   * At view h: units of the centre per screen pixel, and per art pixel (on
   * the sky, which lies farther off) or map unit.
   */
  private units(h: number, level: Level): [number, number] {
    return level === 'sky'
      ? [(h * this.skyGrow(h)) / this.H, skyScale(h)]
      : [h / this.H, 1]
  }

  /** Furthest zoom-out at which the art still fills the screen. */
  skyMax() {
    const size = `${this.W}x${this.H}`
    if (size !== this.skyMaxFor) {
      this.skyMaxFor = size
      this.skyMaxH = this.fit(this.H)
    }
    return this.skyMaxH
  }

  /** Furthest zoom-out at which the art covers the width and `tall` px. */
  private fit(tall: number) {
    const covers = (h: number) => {
      const k = skyScale(h)
      const g = (this.skyGrow(h) * h) / this.H
      return k * SKY.w >= this.W * g && k * SKY.h >= tall * g
    }
    let lo = 1000
    let hi = 1e6
    for (let i = 0; i < 50; i++)
      if (covers((lo + hi) / 2)) lo = (lo + hi) / 2
      else hi = (lo + hi) / 2
    return lo
  }

  /** Zoom range (min, max view height) on a level. */
  range(level: Level, anchor = this.anchor): [number, number] {
    if (level === 'sky') {
      const max = this.skyMax()
      return [Math.min(SKY_MIN_H, max), max]
    }
    return this.worlds[anchor]?.map ? [300, WORLD_MAX_H] : [2200, WORLD_MAX_H]
  }

  /**
   * The zoom range for the wheel and buttons: a city's map only until all
   * of it is in view, where the map around it takes over.
   */
  private zoomRange(level: Level): [number, number] {
    const [lo, hi] = this.range(level)
    const inset = level === 'world' && this.worlds[this.anchor]?.inset
    // Past the whole of a city's map (fitH), the map it's on shows around
    // it; at the closest that map zooms, it takes over.
    return [
      lo,
      inset
        ? lo / inset.k
        : (level === 'world' && this.fitH(this.anchor)) || hi,
    ]
  }

  /** For a city's map, the view height that shows all of it, with a margin. */
  fitH(world: string) {
    const w = this.worlds[world]
    if (!w?.city || !w.map) return undefined
    return this.fitFor(w.map)
  }

  /** The view height that shows all of a map of this size, with a margin. */
  fitFor([mw, mh]: readonly [number, number]) {
    return Math.max(mh, (mw * this.H) / this.W) * 1.15
  }

  /** For a city's map, the view height at which it just fills the screen. */
  fillH(world: string) {
    const w = this.worlds[world]
    if (!w?.city || !w.map) return undefined
    return this.fillFor(w.map)
  }

  /** The view height at which a map of this size just fills the screen. */
  fillFor([mw, mh]: readonly [number, number]) {
    const [lo] = this.range('world')
    return Math.max(lo, Math.min(mh, (mw * this.H) / this.W))
  }

  /**
   * Swaps between a city's map and the map it's on without moving what's
   * on screen: both are drawn in either, one inside the other.
   */
  rebase(
    into: 'city' | 'parent',
    inset: { k: number; at: readonly [number, number] },
  ) {
    const { k, at } = inset
    this.flight = undefined
    this.legs = []
    if (this.glide) this.glide.edge = this.glide.wait = undefined
    if (into === 'city') {
      this.cx = (this.cx - at[0]) / k
      this.cy = (this.cy - at[1]) / k
      this.h /= k
    } else {
      this.cx = at[0] + this.cx * k
      this.cy = at[1] + this.cy * k
      this.h *= k
    }
  }

  /**
   * Keeps a view on the map it's on: on the sky the painting always fills
   * the screen; on a world the globe stays in view, and the screen's middle
   * stays on the map.
   */
  limit(
    cx: number,
    cy: number,
    h: number,
    level: Level,
    anchor = this.anchor,
  ): [number, number, number] {
    const [lo, hi] = this.range(level, anchor)
    h = Math.min(hi, Math.max(lo, h))
    const [u, k] = this.units(h, level)
    if (level === 'sky') {
      const [ax, ay] = this.star(anchor)
      return [
        clampAxis(cx, (this.W / 2) * u, -ax * k, (SKY.w - ax) * k),
        clampAxis(cy, (this.H / 2) * u, (ay - SKY.h) * k, ay * k),
        h,
      ]
    }
    const map = this.worlds[anchor]?.map
    if (!map) {
      const e = 700
      return [Math.max(-e, Math.min(e, cx)), Math.max(-e, Math.min(e, cy)), h]
    }
    // The screen's middle can reach the map's edge, so a coast can be
    // brought to the centre.
    // Out past a city's map, the map around it can be looked over too.
    // Past all of it, the reach grows with the view, so the swap to that
    // map, anywhere on screen, never needs a clamp.
    const fit = this.worlds[anchor]?.inset && this.fitFor(map)
    const out = fit ? Math.max(0, h - fit) * 2 : 0
    const [w, mh] = [map[0] + (out * this.W) / this.H, map[1] + out]
    return [
      Math.max(-w / 2, Math.min(w / 2, cx)),
      Math.max(-mh / 2, Math.min(mh / 2, cy)),
      h,
    ]
  }

  /** The whole sky, its middle on screen. */
  private skyLeg(anchor = this.anchor): [number, number, number] {
    const h = this.skyMax()
    const [ax, ay] = this.star(anchor)
    const k = skyScale(h)
    return [(SKY.w / 2 - ax) * k, (ay - SKY.h / 2) * k, h]
  }

  /** A sky view framing the anchor's star and another's. */
  private framing(to: string): Leg {
    const [ox, oy] = artOffset(this.star(to), this.star())
    const fits = (h: number) => {
      const [u, k] = this.units(h, 'sky')
      return (
        Math.abs(ox) * k <= 0.55 * this.W * u &&
        Math.abs(oy) * k <= 0.55 * this.H * u
      )
    }
    // The closest view that fits both (wider views always fit more), far
    // enough out to see where you are.
    let [a, h] = this.range('sky')
    a = Math.min(h, Math.max(a, SKY_FLIGHT_H))
    if (fits(a)) h = a
    else if (fits(h))
      for (let i = 0; i < 40; i++) {
        const mid = (a + h) / 2
        if (fits(mid)) h = mid
        else a = mid
      }
    const k = skyScale(h)
    return { c: [(ox * k) / 2, (oy * k) / 2], h, level: 'sky' }
  }

  /** Out in space by a world, its whole globe on screen. */
  globeH() {
    const room = Math.max(1, Math.min(this.H, this.W))
    return Math.min(
      WORLD_MAX_H,
      Math.max(GLOBE_H, (2 * PLANET_R * this.H) / room),
    )
  }

  /** Eases the framing toward the dock, if any, as the globe shows. */
  private reframe(dt: number) {
    if (this.dock) this.docking = this.dock
    const want = this.dock ? 1 : 0
    this.docked = this.reduced
      ? want
      : this.docked + (want - this.docked) * (1 - Math.exp(-dt / 160))
    if (Math.abs(this.docked - want) < 1e-3) this.docked = want
    const f = this.fades()
    const g = this.docked * f.planetIn * (1 - f.flat)
    const d = this.docking
    if (!d || g < 1e-4) {
      this.frame = { k: 1, x: 0, y: 0 }
      return
    }
    // The globe as it is now, unframed: zooming out can leave it smaller.
    const h = this.h
    const s0 = (distFor(h) / (PLANE_Z + distFor(h))) * (this.H / h)
    const r0 = PLANET_R * s0
    const c0 = { x: this.W / 2 - this.cx * s0, y: this.H / 2 + this.cy * s0 }
    let to = { ...c0, r: r0 }
    if ('top' in d) {
      // Keep its bottom; bring its top down to clear the room above.
      const bottom = c0.y + r0
      if (c0.y - r0 < d.top)
        to = { x: c0.x, y: (d.top + bottom) / 2, r: (bottom - d.top) / 2 }
    } else to = d
    const k = 1 + (to.r / r0 - 1) * g
    this.frame = {
      k,
      x: (to.x - this.W / 2 + this.cx * s0 * k) * g,
      y: (to.y - this.H / 2 - this.cy * s0 * k) * g,
    }
  }

  /** The level the camera is on or heading for. */
  private get heading(): Level {
    const f = this.flight
    return f && (f.fromLevel === 'world' || f.toLevel === 'world')
      ? 'world'
      : (f?.toLevel ?? this.level)
  }

  /** Cuts straight to a target, with no flight. */
  jump(target: CamTarget) {
    const reduced = this.reduced
    this.reduced = true
    this.planTo(target)
    this.reduced = reduced
  }

  /** Plans and starts the journey to a target. */
  planTo(target: CamTarget) {
    this.glide = undefined
    const legs: Leg[] = []
    if (!target.world) {
      const [cx, cy, h] = this.skyLeg()
      legs.push({ c: target.c ?? [cx, cy], h: target.h ?? h, level: 'sky' })
    } else {
      const to = target.world
      const globe = this.globeH()
      const there: Leg = {
        c: target.c ?? [0, 0],
        h: target.h ?? globe,
        level: 'world',
        ms: target.ms,
      }
      const sameWorld = to === this.anchor
      if (!(sameWorld && this.heading === 'world')) {
        // Rise to see both stars first, from a world or from close in.
        if (!sameWorld && (this.heading === 'world' || this.h < SKY_FLIGHT_H))
          legs.push(this.framing(to))
        legs.push({ c: [0, 0], h: globe, level: 'world', anchor: to })
      }
      const last = legs.at(-1)
      if (
        last &&
        Math.abs(last.h - there.h) < 1 &&
        Math.hypot(there.c[0], there.c[1]) < 1
      )
        legs.pop()
      legs.push(sameWorld ? there : { ...there, anchor: to })
      // Only the first leg that changes worlds re-centres.
      let seen = false
      for (const leg of legs)
        if (leg.anchor) {
          if (seen) delete leg.anchor
          seen = true
        }
    }
    if (this.reduced) {
      const leg = legs.at(-1)!
      const anchor = legs.find((l) => l.anchor)?.anchor
      this.flight = undefined
      this.legs = []
      if (anchor && anchor !== this.anchor) {
        this.anchor = anchor
        this.onAnchor?.(anchor)
      }
      ;[this.cx, this.cy, this.h] = this.limit(
        leg.c[0],
        leg.c[1],
        leg.h,
        leg.level,
      )
      if (this.level !== leg.level) {
        this.level = leg.level
        this.onLevel?.(this.level)
      }
      return
    }
    const f = this.flight
    if (f) {
      // Mid-flight: carry on from here, crossfading from where it was.
      this.level = f.k < 0.5 ? f.fromLevel : f.toLevel
      this.flight = undefined
    }
    this.legs = legs
    this.nextLeg()
  }

  /**
   * Re-centres on another world's star. Only on the sky, where no world is
   * drawn, so the view doesn't change: the same art stays on screen.
   */
  reanchor(to: string) {
    if (to === this.anchor) return
    const [ox, oy] = artOffset(this.star(to), this.star())
    const k = skyScale(this.h)
    this.cx -= ox * k
    this.cy -= oy * k
    this.anchor = to
    this.onAnchor?.(to)
  }

  private nextLeg() {
    const leg = this.legs.shift()
    if (!leg) return
    if (leg.anchor && leg.anchor !== this.anchor) {
      if (this.level !== 'sky') {
        // Can't swap worlds in view: rise to the sky first.
        this.legs.unshift(leg)
        return this.fly(this.framing(leg.anchor))
      }
      this.reanchor(leg.anchor)
    }
    this.fly(leg)
  }

  private fly(leg: Leg) {
    const [cx, cy, h] = this.limit(leg.c[0], leg.c[1], leg.h, leg.level)
    const zoom = Math.abs(Math.log(h / this.h))
    const pan = Math.hypot(cx - this.cx, cy - this.cy) / Math.max(h, this.h)
    this.flight = {
      from: [this.cx, this.cy, this.h],
      to: [cx, cy, h],
      t0: performance.now(),
      ms: leg.ms ?? 650 + zoom * 260 + Math.min(3, pan) * 180,
      fromLevel: this.level,
      toLevel: leg.level,
      k: 0,
    }
  }

  /** Zooms about the middle of the screen (the + and − buttons). */
  zoomBy(factor: number) {
    this.zoomAt(this.W / 2, this.H / 2, factor)
  }

  /**
   * Zooms by `factor` (over 1: out) about screen point (sx, sy); `smooth`
   * glides there over the next frames.
   */
  zoomAt(sx: number, sy: number, factor: number, smooth = !this.reduced) {
    if (this.flight) return
    const [lo, hi] = this.zoomRange(this.level)
    if (factor > 1 && this.level === 'world' && this.h >= hi * 0.999) {
      this.glide = undefined
      this.onZoomOutEdge?.()
      return
    }
    if (factor < 1 && this.level === 'world' && this.h <= lo * 1.001) {
      this.glide = undefined
      this.onZoomInEdge?.(sx, sy)
      return
    }
    if (!smooth) {
      this.glide = undefined
      this.zoomNow(sx, sy, factor)
      return
    }
    this.glide = {
      log: (this.glide?.log ?? 0) + Math.log(factor),
      x: sx,
      y: sy,
    }
  }

  /** Hands a glide that reached the end of the range to the next map. */
  private glideOver(g: { log: number; x: number; y: number; edge: boolean }) {
    if (this.level !== 'world') return
    if (g.log > 0 && this.worlds[this.anchor]?.inset) {
      this.glide = g
      this.onZoomOutEdge?.()
    } else if (g.log < 0 && this.worlds[this.anchor]?.map) {
      this.glide = g
      this.onZoomInEdge?.(g.x, g.y)
    }
  }

  /**
   * Zooms at once, keeping what's under (sx, sy) there: the art on the sky,
   * which grows more slowly than the view (skyScale), the map on a world.
   * True if it reached the end of the range.
   */
  private zoomNow(sx: number, sy: number, factor: number) {
    const [lo, hi] = this.zoomRange(this.level)
    // ponytail: the pointer is taken unframed (see frame). Only the globe
    // view is framed, where limit() keeps the globe centred anyway.
    const dx = sx - this.W / 2
    const dy = this.H / 2 - sy
    const [u0, k0] = this.units(this.h, this.level)
    const px = (this.cx + dx * u0) / k0
    const py = (this.cy + dy * u0) / k0
    // Screen pixels per art pixel (or map unit): smaller further out.
    const scale = (h: number) => {
      const [u, k] = this.units(h, this.level)
      return k / u
    }
    const want = scale(this.h) / factor
    let h: number
    if (want >= scale(lo)) h = lo
    else if (want <= scale(hi)) h = hi
    else {
      let a = Math.log(lo)
      let b = Math.log(hi)
      for (let i = 0; i < 40; i++) {
        const m = (a + b) / 2
        if (scale(Math.exp(m)) > want) a = m
        else b = m
      }
      h = Math.exp((a + b) / 2)
    }
    const [u1, k1] = this.units(h, this.level)
    // Zooming out as the map rolls up into its globe (drawn at the origin)
    // brings the globe to the middle; once it's a globe, it drags freely.
    const was = levelFades(this.level, this.h).flat
    const pull =
      this.level === 'world' &&
      !this.worlds[this.anchor]?.inset &&
      h > this.h &&
      was > 0
        ? levelFades(this.level, h).flat / was
        : 1
    this.h = h
    this.cx = (px * k1 - dx * u1) * pull
    this.cy = (py * k1 - dy * u1) * pull
    return factor < 1 ? h === lo : factor > 1 && h === hi
  }

  /**
   * Screen pixel of a world point at depth z (0: the globe's centre, where
   * the sky also seems to lie; PLANE_Z: the map).
   */
  toScreen(x: number, y: number, z: number): [number, number] {
    const s = this.scale(z)
    const { x: fx, y: fy } = this.frame
    return [
      this.W / 2 + fx + (x - this.cx) * s,
      this.H / 2 + fy - (y - this.cy) * s,
    ]
  }

  /** Screen pixels per world unit at depth z, from height h (framed). */
  scale(z: number, h = this.h) {
    const d = distFor(h)
    return (d / (PLANE_Z + d - z)) * (this.H / h) * this.frame.k
  }

  /** Screen pixel of a star in the painted sky. */
  starOnScreen(star: readonly [number, number]) {
    const [ox, oy] = artOffset(star, this.star())
    const k = skyScale(this.h)
    return this.toScreen(ox * k, oy * k, 0)
  }

  /** Mid-flight, crossfade from the level left to the one ahead. */
  fades(): Fades {
    const f = this.flight
    // A city's map is always unrolled, however far out over its parent.
    const h = this.worlds[this.anchor]?.inset ? Math.min(this.h, 1500) : this.h
    if (!f) return levelFades(this.level, h)
    const a = levelFades(f.fromLevel, h)
    const b = levelFades(f.toLevel, h)
    return Object.fromEntries(
      Object.entries(a).map(([key, v]) => [
        key,
        lerp(v, b[key as keyof Fades], f.k),
      ]),
    ) as Fades
  }

  /** Call once per frame. */
  tick(now: number) {
    const dt = Math.min(100, Math.max(0, now - (this.last ?? now)))
    this.last = now
    const f = this.flight
    if (f) {
      const t = f.ms > 0 ? Math.min(1, (now - f.t0) / f.ms) : 1
      const k = ease(t)
      this.h = lerpH(f.from[2], f.to[2], k)
      this.cx = f.from[0] + (f.to[0] - f.from[0]) * k
      this.cy = f.from[1] + (f.to[1] - f.from[1]) * k
      f.k = k
      if (t === 1) {
        this.flight = undefined
        if (this.level !== f.toLevel) {
          this.level = f.toLevel
          this.onLevel?.(this.level)
        }
        this.nextLeg()
      }
    }
    const g = this.glide
    // Waiting at the end of the range for the next map to take over.
    if (g?.edge) {
      g.wait = (g.wait ?? 0) + dt
      if (g.wait > 300) this.glide = undefined
    } else if (g && !this.flight) {
      const step =
        Math.abs(g.log) < 1e-3 ? g.log : g.log * (1 - Math.exp(-dt / 70))
      g.log -= step
      if (this.zoomNow(g.x, g.y, Math.exp(step)) || g.log === 0) {
        this.glide = undefined
        // A glide into a city's map, or out of one, carries on across the
        // swap rather than stopping dead at it.
        if (!g.edge && Math.abs(g.log) > 0.02)
          this.glideOver({ ...g, edge: true })
      }
    }
    // Bounds hold once landed; mid-flight you're between two maps.
    if (!this.flight)
      [this.cx, this.cy, this.h] = this.limit(
        this.cx,
        this.cy,
        this.h,
        this.level,
      )
    this.reframe(dt)
  }

  /**
   * Wheel, trackpad, drag and pinch on the canvas. Returns a detach
   * function.
   */
  attach(el: HTMLElement) {
    const rect = () => el.getBoundingClientRect()
    let lastWheel = -Infinity
    let zooms = false
    let gesturing = false
    let gestureScale = 1
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = rect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const px = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.H : 1
      const dx = e.deltaX * px
      const dy = e.deltaY * px
      // A trackpad pinch comes as a wheel with ctrl held (but Safari's as
      // gesture events).
      if (e.ctrlKey) {
        if (!gesturing) this.zoomAt(x, y, Math.exp(dy * 0.01), false)
        return
      }
      // Mouse wheels zoom, trackpads pan: decided once per gesture, as a
      // trackpad's flick slows to wheel-like steps.
      // ponytail: Safari mouse wheels may read as panning; dragging still pans.
      if (e.timeStamp - lastWheel > 200)
        zooms =
          e.deltaMode !== 0 ||
          (!dx && !!dy && (Math.abs(dy) >= 50 || dy % 4.000244140625 === 0))
      lastWheel = e.timeStamp
      if (zooms) this.zoomAt(x, y, Math.exp(dy * 0.0022))
      else if (!this.flight) {
        const [u] = this.units(this.h, this.level)
        this.cx += dx * u
        this.cy -= dy * u
      }
    }
    const down = (e: PointerEvent) => {
      el.setPointerCapture?.(e.pointerId)
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    const move = (e: PointerEvent) => {
      const p = this.pointers.get(e.pointerId)
      if (!p) return
      if (!this.flight) {
        const pts = [...this.pointers.values()]
        const other = pts.length === 2 && pts.find((q) => q !== p)
        if (other) {
          const d0 = Math.hypot(p.x - other.x, p.y - other.y)
          const d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y)
          const r = rect()
          if (d1 > 0)
            this.zoomAt(
              (e.clientX + other.x) / 2 - r.left,
              (e.clientY + other.y) / 2 - r.top,
              d0 / d1,
              false,
            )
        } else {
          // The sky lies farther off than a map, so it moves more per pixel.
          const [u] = this.units(this.h, this.level)
          this.cx -= (e.clientX - p.x) * u
          this.cy += (e.clientY - p.y) * u
        }
      }
      p.x = e.clientX
      p.y = e.clientY
    }
    const up = (e: PointerEvent) => this.pointers.delete(e.pointerId)
    // Safari's trackpad pinch. Its touch pinches come as pointers too.
    const gesture = (e: Event) => {
      e.preventDefault()
      const g = e as Event & { scale: number; clientX: number; clientY: number }
      if (e.type === 'gesturestart') {
        gesturing = true
        gestureScale = 1
      } else if (e.type === 'gestureend') gesturing = false
      else if (this.pointers.size < 2 && g.scale > 0) {
        const r = rect()
        this.zoomAt(
          g.clientX - r.left,
          g.clientY - r.top,
          gestureScale / g.scale,
          false,
        )
        gestureScale = g.scale
      }
    }
    const listeners: [string, (e: never) => void, AddEventListenerOptions?][] =
      [
        ['wheel', onWheel, { passive: false }],
        ['pointerdown', down],
        ['pointermove', move],
        ['pointerup', up],
        ['pointercancel', up],
        ['gesturestart', gesture],
        ['gesturechange', gesture],
        ['gestureend', gesture],
      ]
    for (const [type, fn, opts] of listeners)
      el.addEventListener(type, fn as EventListener, opts)
    return () => {
      for (const [type, fn] of listeners)
        el.removeEventListener(type, fn as EventListener)
    }
  }
}
