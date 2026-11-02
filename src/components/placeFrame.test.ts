import { describe, expect, it } from 'vitest'
import { areaCentre, type Hotspot } from '../data/maps'
import { contextBox, ringRadius, spotsBox } from './placeFrame'

describe('placeFrame', () => {
  it('boxes every piece of a place, and a pin as a point', () => {
    const pieces: Hotspot[] = [
      { locationId: 'a', shape: 'area', points: '10,20 30,20 30,40' },
      { locationId: 'a', shape: 'area', points: '50,5 60,5 60,15' },
    ]
    expect(spotsBox(pieces)).toEqual({ x: 10, y: 5, width: 50, height: 35 })
    expect(spotsBox([{ locationId: 'p', shape: 'pin', x: 7, y: 9 }])).toEqual({
      x: 7,
      y: 9,
      width: 0,
      height: 0,
    })
  })

  it('frames a place with its neighbourhood, at least a quarter of the map', () => {
    // Big: ×2.2 about its centre.
    const big = contextBox(
      { x: 400, y: 300, width: 300, height: 200 },
      1000,
      800,
    )
    expect(Object.values(big).map(Math.round)).toEqual([220, 180, 660, 440])
    // Small (or a pin): a quarter of the map each way, centred on it.
    expect(
      contextBox({ x: 500, y: 400, width: 0, height: 0 }, 1000, 800),
    ).toEqual({ x: 375, y: 300, width: 250, height: 200 })
  })

  it('rings a pin just outside the printed symbol, at least 9 screen px', () => {
    const printed = (2560 / 110) * 0.3
    expect(ringRadius(2560, 1600, 0.2)).toBeCloseTo(9 / 0.2)
    expect(ringRadius(2560, 1600, 0.75)).toBeCloseTo(printed + 5 / 0.75)
    expect(ringRadius(2560, 1600, 2)).toBeCloseTo(printed + 2.5)
  })

  it('centres a place drawn in pieces on its largest piece', () => {
    // Hallandren Jungle's top-left piece, though it's listed last.
    const [x, y] = areaCentre('t-telir', 'hallandren-jungle')!
    expect(x).toBeGreaterThan(27)
    expect(x).toBeLessThan(310)
    expect(y).toBeGreaterThan(27)
    expect(y).toBeLessThan(188)
  })
})
