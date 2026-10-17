import { describe, expect, it } from 'vitest'
import { fitTransform } from './fitTransform'
import { boundsOf, pathData, tracks } from './journey/journeyGeometry'

describe('fitTransform', () => {
  const viewport = { width: 800, height: 400 }

  it('centres and fits a box', () => {
    const t = fitTransform(
      { x: 100, y: 100, width: 200, height: 100 },
      viewport,
      { padding: 0 },
    )
    expect(t.scale).toBe(4)
    // The box's centre (200, 150) lands in the viewport's centre.
    expect(200 * t.scale + t.x).toBe(400)
    expect(150 * t.scale + t.y).toBe(200)
  })

  it('zooms no further than asked, nor past the limits', () => {
    const box = { x: 0, y: 0, width: 1, height: 1 }
    expect(fitTransform(box, viewport, { maxScale: 2 }).scale).toBe(2)
    expect(fitTransform(box, viewport).scale).toBe(8)
    expect(
      fitTransform({ x: 0, y: 0, width: 1e5, height: 1e5 }, viewport).scale,
    ).toBe(0.5)
  })

  it('keeps the content covering the viewport when it knows its size', () => {
    const content = { width: 1000, height: 500 }
    // A corner box: centring it would show empty space beyond the edge.
    const t = fitTransform({ x: 0, y: 0, width: 100, height: 100 }, viewport, {
      maxScale: 1,
      content,
    })
    expect(t).toEqual({ scale: 1, x: 0, y: 0 })
    // A whole small map is zoomed to cover the viewport, not letterboxed.
    const small = fitTransform(
      { x: 0, y: 0, width: 400, height: 100 },
      viewport,
      { maxScale: 0.5, content: { width: 800, height: 200 } },
    )
    expect(small.scale).toBe(2)
    expect(small.x).toBeLessThanOrEqual(0)
    expect(small.x + 800 * small.scale).toBeGreaterThanOrEqual(800)
  })

  it('centres the box in the part of the view left clear by panels', () => {
    const view = { width: 1000, height: 600 }
    const box = { x: 90, y: 90, width: 20, height: 20 }
    const t = fitTransform(box, view, {
      maxScale: 2,
      inset: { left: 400, bottom: 100 },
    })
    expect(t.scale).toBe(2)
    // The box's centre (100, 100) lands mid-way in x 400-1000, y 0-500.
    expect(100 * t.scale + t.x).toBe(700)
    expect(100 * t.scale + t.y).toBe(250)
  })
})

describe('journey geometry', () => {
  const a = { mapId: 'm', path: [[0, 0]] as const }
  const b = { mapId: 'm', path: [[10, 0]] as const }
  const route = {
    mapId: 'm',
    path: [
      [20, 0],
      [20, 30],
    ] as const,
  }
  const elsewhere = { mapId: 'other', path: [[5, 5]] as const }

  it('joins each stop to the one before on the same map', () => {
    expect(tracks([a, b, route, elsewhere, a])).toEqual([
      [[0, 0]],
      [
        [0, 0],
        [10, 0],
      ],
      [
        [10, 0],
        [20, 0],
        [20, 30],
      ],
      [[5, 5]],
      [[0, 0]],
    ])
  })

  it('skips a stop with no place yet, joining the ones either side', () => {
    const a = { mapId: 'm', path: [[0, 0]] as [number, number][] }
    const unknown = { mapId: 'm', path: [] }
    const b = { mapId: 'm', path: [[10, 0]] as [number, number][] }
    expect(tracks([unknown, a, unknown, b])).toEqual([
      [],
      [[0, 0]],
      [],
      [
        [0, 0],
        [10, 0],
      ],
    ])
  })

  it('frames points in a box no smaller than asked', () => {
    expect(boundsOf([[50, 50]], 20)).toEqual({
      x: 40,
      y: 40,
      width: 20,
      height: 20,
    })
    expect(
      boundsOf(
        [
          [0, 0],
          [100, 10],
        ],
        20,
      ),
    ).toEqual({ x: 0, y: -5, width: 100, height: 20 })
  })

  it('draws a path through the points', () => {
    expect(
      pathData([
        [1, 2],
        [3, 4],
      ]),
    ).toBe('M1 2 L3 4')
  })
})
