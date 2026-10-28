import { describe, expect, it, vi } from 'vitest'
import { Cam } from './camera'
import { GLOBE_H, SKY, skyScale } from './sky'

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

  it('keeps a map on screen once it is up', () => {
    const c = cam()
    c.jump({ world: 'roshar', c: [5000, 5000], h: 900 })
    const half = (900 * c.W) / c.H / 2
    expect(c.cx).toBeCloseTo(1280 - half)
    expect(c.cy).toBeCloseTo(800 - 450)
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
