import { describe, expect, it } from 'vitest'
import { spotFor, type Box } from './flags'

const view: Box = [0, 0, 400, 300]

describe('spotFor', () => {
  it('goes above its place, else the next free side, else compact', () => {
    expect(spotFor([200, 150], 100, 40, 34, view, [], [14])?.box).toEqual([
      150, 102, 250, 136,
    ])
    // Something above: round to the north-east.
    const above: Box = [0, 0, 400, 132]
    expect(spotFor([200, 150], 100, 40, 34, view, [above], [14])).toMatchObject(
      { dir: 2, compact: false },
    )
    // Only a narrow gap to the side: compact.
    const walls: Box[] = [
      above,
      [0, 168, 400, 300],
      [290, 0, 400, 300],
      [0, 0, 160, 300],
    ]
    expect(spotFor([200, 150], 100, 40, 34, view, walls, [14])).toMatchObject({
      dir: 2,
      compact: true,
    })
  })

  it('keeps its last spot while that still fits', () => {
    const last = spotFor(
      [200, 150],
      100,
      40,
      34,
      view,
      [[0, 0, 400, 132]],
      [14],
    )
    expect(spotFor([200, 150], 100, 40, 34, view, [], [14], last)).toEqual(last)
  })
})
