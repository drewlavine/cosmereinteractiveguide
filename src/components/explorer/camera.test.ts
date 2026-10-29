import { describe, expect, it, vi } from 'vitest'
import { Cam } from './camera'
import { drillFades, INSET_K, tagsFade } from './drill'
import {
  GLOBE_H,
  MAP_VIEW_H,
  PIN_H,
  PLANE_Z,
  PLANET_R,
  SKY,
  skyScale,
} from './sky'

const worlds = {
  roshar: { star: SKY.stars.rosharan, map: [2560, 1600] as const },
  sel: { star: SKY.stars.selish },
  threnody: { star: SKY.stars.threnodite },
}

const cam = (W = 1280, H = 800) => {
  const c = new Cam(worlds, 'roshar')
  c.W = W
  c.H = H
  c.tick(0)
  return c
}

/** Runs every leg of the current journey to its end. */
const land = (c: Cam) => {
  let now = 0
  for (let i = 0; i < 20 && (c.flight || c.legs.length); i++) {
    if (c.flight) now = c.flight.t0 + c.flight.ms + 1
    c.tick(now)
  }
}

describe('explorer camera', () => {
  it('zooming out to the globe centres it, which then still drags', () => {
    const c = cam()
    c.level = 'world'
    ;[c.cx, c.cy, c.h] = [1200, 700, 1800]
    c.zoomAt(100, 100, 50, false)
    expect(c.h).toBeGreaterThanOrEqual(2500)
    expect(Math.hypot(c.cx, c.cy)).toBe(0)
    expect(c.limit(1200, 700, GLOBE_H, 'world')).toEqual([1200, 700, GLOBE_H])
  })

  it('frames the globe into a dock, and only at its globe view', () => {
    const c = cam()
    c.reduced = true
    c.jump({ world: 'roshar' })
    c.dock = { x: 1000, y: 300, r: 150 }
    c.tick(16)
    const [x, y] = c.toScreen(0, 0, 0)
    expect([x, y]).toEqual([expect.closeTo(1000, 3), expect.closeTo(300, 3)])
    expect(PLANET_R * c.scale(0)).toBeCloseTo(150, 3)
    // However far out it is.
    c.jump({ world: 'roshar', h: c.globeH() * 1.6 })
    c.tick(16)
    expect(c.toScreen(0, 0, 0)).toEqual([
      expect.closeTo(1000, 3),
      expect.closeTo(300, 3),
    ])
    expect(PLANET_R * c.scale(0)).toBeCloseTo(150, 3)
    // Down on the map the dock gives way; undocked, nothing's framed.
    c.jump({ world: 'roshar', h: MAP_VIEW_H })
    c.tick(32)
    expect(c.frame).toEqual({ k: 1, x: 0, y: 0 })
    c.jump({ world: 'roshar' })
    c.dock = undefined
    c.tick(48)
    expect(c.frame).toEqual({ k: 1, x: 0, y: 0 })
  })

  it('re-centring on another star keeps the sky where it was', () => {
    const c = cam()
    const before = c.starOnScreen(SKY.stars.selish)
    c.reanchor('sel')
    const after = c.starOnScreen(SKY.stars.selish)
    expect(after[0]).toBeCloseTo(before[0], 6)
    expect(after[1]).toBeCloseTo(before[1], 6)
    expect(c.anchor).toBe('sel')
  })

  it('never zooms out past where the painting fills the screen', () => {
    for (const [W, H] of [
      [1280, 800],
      [500, 1000],
    ]) {
      const c = cam(W, H)
      c.zoomBy(50)
      c.tick(0)
      expect(c.h).toBeCloseTo(c.skyMax(), 3)
      // The corners of the screen still land on the art.
      const k = skyScale(c.h)
      for (const [sx, sy] of [
        [0, 0],
        [W, H],
      ]) {
        const tl = c.starOnScreen([0, 0])
        const br = c.starOnScreen([SKY.w, SKY.h])
        expect(tl[0]).toBeLessThanOrEqual(sx + 1e-6)
        expect(tl[1]).toBeLessThanOrEqual(sy + 1e-6)
        expect(br[0]).toBeGreaterThanOrEqual(sx - 1e-6)
        expect(br[1]).toBeGreaterThanOrEqual(sy - 1e-6)
      }
      expect(k).toBeGreaterThan(0)
    }
  })

  it('flies between worlds by way of the sky', () => {
    const c = cam()
    c.jump({ world: 'roshar' })
    expect(c.level).toBe('world')
    c.planTo({ world: 'threnody' })
    expect(c.flight?.toLevel).toBe('sky')
    expect(c.legs.map((l) => l.level)).toEqual(['world'])
    expect(c.legs[0].anchor).toBe('threnody')
    expect(c.anchor).toBe('roshar')
    land(c)
    expect(c.anchor).toBe('threnody')
    expect(c.level).toBe('world')
    expect(c.h).toBeCloseTo(GLOBE_H)
  })

  it('cuts straight there with reduced motion', () => {
    const c = cam()
    c.reduced = true
    const onAnchor = vi.fn()
    c.onAnchor = onAnchor
    c.planTo({ world: 'sel' })
    expect(c.flight).toBeUndefined()
    expect(c.anchor).toBe('sel')
    expect(c.level).toBe('world')
    expect(onAnchor).toHaveBeenCalledWith('sel')
  })

  it('zooming out past a world goes back to the Cosmere', () => {
    const c = cam()
    c.jump({ world: 'sel', h: 6400 })
    const edge = vi.fn()
    c.onZoomOutEdge = edge
    c.zoomBy(1.2)
    expect(edge).toHaveBeenCalledOnce()
  })

  it("hands a city's map over to the map around it, and back", () => {
    const c = cam()
    c.worlds = { ...worlds, roshar: { ...worlds.roshar, city: true } }
    // Out: past where the city's map fills the screen, until it's all in
    // view; not out to the globe.
    c.jump({ world: 'roshar', h: c.fillH('roshar') })
    const out = vi.fn()
    c.onZoomOutEdge = out
    c.zoomBy(1.2)
    expect(out).not.toHaveBeenCalled()
    c.jump({ world: 'roshar', h: c.fitH('roshar') })
    c.zoomBy(1.2)
    expect(out).toHaveBeenCalledOnce()
    // In: past the closest view, about the point zoomed at.
    c.jump({ world: 'roshar', h: 300 })
    const inward = vi.fn()
    c.onZoomInEdge = inward
    c.zoomAt(100, 200, 0.8)
    expect(inward).toHaveBeenCalledWith(100, 200)
  })

  describe("drilling into a city's map drawn on the map it's on", () => {
    const inset = { k: INSET_K, at: [1934, 797] as const }
    const onCity = { ...worlds.roshar, map: [1060, 1600] as const, inset }
    const city = () => {
      const c = cam()
      c.worlds = { ...worlds, roshar: onCity }
      return c
    }

    it('swaps maps without moving what is on screen', () => {
      const c = city()
      c.jump({ world: 'roshar', c: [120, -80], h: 5000 })
      const [x, y] = c.toScreen(120, -80, PLANE_Z)
      c.rebase('parent', inset)
      expect(c.h).toBeCloseTo(5000 * INSET_K)
      // The city's point is now where its footprint has it on Roshar.
      const [px, py] = c.toScreen(
        1934 + 120 * INSET_K,
        797 - 80 * INSET_K,
        PLANE_Z,
      )
      expect(px).toBeCloseTo(x)
      expect(py).toBeCloseTo(y)
      c.rebase('city', inset)
      expect([c.cx, c.cy, c.h].map((v) => +v.toFixed(6))).toEqual([
        120, -80, 5000,
      ])
    })

    it("zooms out past the whole city to the parent's closest, unclamped", () => {
      const c = city()
      const out = vi.fn()
      c.onZoomOutEdge = out
      // Past all of the city's map in view, on over the map around it.
      c.jump({ world: 'roshar', h: c.fitH('roshar')! })
      c.zoomAt(640, 400, 1.2, false)
      expect(out).not.toHaveBeenCalled()
      // Out to the closest the map it's on zooms, where that takes over:
      // anywhere on screen is in reach, so there's no jump as it hands over.
      const swap = c.range('world')[0] / INSET_K
      c.jump({ world: 'roshar', c: [2500, -1800], h: swap })
      expect([c.cx, c.cy, c.h]).toEqual([2500, -1800, swap])
      c.zoomAt(640, 400, 1.2, false)
      expect(out).toHaveBeenCalledOnce()
    })

    it('carries a wheel glide on across the swap', () => {
      const c = city()
      c.jump({ world: 'roshar', h: 5400 })
      c.onZoomOutEdge = () => {
        c.worlds = worlds
        c.rebase('parent', inset)
      }
      c.zoomAt(640, 400, 4)
      for (let t = 16; t < 2000; t += 16) c.tick(t)
      // Out over Roshar's map, on to near four times as far as it started
      // (in Roshar's units), not stopped at the swap.
      expect(c.h).toBeGreaterThan(5400 * 3 * INSET_K)
      expect(c.h).toBeLessThan(5400 * 4 * INSET_K)
    })

    it("fades the city's flags in only once the whole city is in view", () => {
      const lo = 300
      const fit = 1700 * INSET_K
      // The swap: neither map's flags show.
      expect(drillFades(lo, fit, lo)).toMatchObject({
        inside: 0,
        outside: 0,
        city: 1,
      })
      // The whole city in view: its flags, and the map around it dimmed.
      expect(drillFades(fit, fit, lo)).toMatchObject({
        inside: 1,
        parent: 0.35,
      })
      // Far out: just the map it's on.
      expect(drillFades(lo * 3, fit, lo)).toMatchObject({
        city: 0,
        outside: 1,
        parent: 1,
      })
    })

    it("shows cities' tags only zoomed in from the whole map", () => {
      expect(tagsFade(MAP_VIEW_H, false)).toBe(0)
      expect(tagsFade(PIN_H, false)).toBe(1)
      expect(tagsFade(MAP_VIEW_H, true)).toBe(1)
    })
  })

  it('pans a map until its edge reaches the middle of the screen', () => {
    const c = cam()
    c.jump({ world: 'roshar', c: [5000, 5000], h: 900 })
    expect(c.cx).toBeCloseTo(1280)
    expect(c.cy).toBeCloseTo(800)
  })

  it('zooms out to the whole sky, centred on screen', () => {
    const c = new Cam(worlds, 'roshar')
    c.W = 390
    c.H = 550
    c.jump({})
    const mid = c.starOnScreen([SKY.w / 2, SKY.h / 2])
    expect(mid[0]).toBeCloseTo(195, 0)
    expect(mid[1]).toBeCloseTo(275, 0)
  })
})
