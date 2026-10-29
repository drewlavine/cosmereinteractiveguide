import { describe, expect, it } from 'vitest'
import { readerCanSee } from './reveal'
import { revealTimeline, timelineEvents } from './timeline'
import { worldStateAt, worldStates, type WorldState } from './worldStates'

const ERA1 = [
  'final-empire',
  'well-of-ascension',
  'hero-of-ages',
  'secret-history',
]

function stateAt(
  read: string[],
  event: string,
  world: string,
  list = worldStates,
  reading: Record<string, string> = {},
) {
  const canSee = readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })
  const t = revealTimeline(canSee)
  const now = t.events.findIndex((e) => e.id === event)
  return worldStateAt(t.events, canSee, now, world, list)
}

describe('worldStates', () => {
  it('each starts at an event on its own world', () => {
    for (const s of worldStates)
      expect(timelineEvents.find((e) => e.id === s.from)?.world, s.from).toBe(
        s.world,
      )
  })

  it('drops the "since" line when the state starts at the current event', () => {
    expect(stateAt(ERA1, 'catacendre', 'scadrial')).toEqual({
      label: 'Harmony',
      text: expect.any(String),
      phrase: "Sazed's Ascension",
    })
  })

  it('keeps an earlier state, counting years after the Shattering', () => {
    const later = stateAt(
      [...ERA1, 'way-of-kings'],
      'gavilar-assassinated',
      'scadrial',
    )
    expect(later?.label).toBe('Harmony')
    expect(later?.since?.id).toBe('catacendre')
    expect(later?.years).toBeGreaterThan(0)
  })

  it('hides a state until its book is read', () => {
    const secret: WorldState = {
      world: 'scadrial',
      from: 'gavilar-assassinated',
      label: 'Secret',
      text: 'Not yet.',
      revealedIn: ['wind-and-truth'],
    }
    const list = [...worldStates, secret]
    const read = [...ERA1, 'way-of-kings']
    expect(stateAt(read, 'gavilar-assassinated', 'scadrial', list)?.label).toBe(
      'Harmony',
    )
    expect(
      stateAt(
        [...read, 'wind-and-truth'],
        'gavilar-assassinated',
        'scadrial',
        list,
      )?.label,
    ).toBe('Secret')
  })

  it('names the Vengeance Pact only from the chapter that does', () => {
    const at = (chapter: string) =>
      stateAt([], 'gavilar-assassinated', 'roshar', worldStates, {
        'way-of-kings': chapter,
      })
    expect(at('17')?.label).toBe('After the Heralds')
    expect(at('18')?.label).toBe('The Vengeance Pact')
  })

  it('has nothing to say of a world with no state', () => {
    const id = timelineEvents.find((e) => e.world === 'threnody')!.id
    expect(stateAt(ERA1, id, 'threnody')).toBeUndefined()
  })

  it("keeps Sel's state off until Elantris says it", () => {
    const at = (chapter: string) =>
      stateAt([], 'reod', 'sel', worldStates, { elantris: chapter })
    // Before, just the event itself: no state, nothing earlier on Sel.
    expect(at('7')).toBeUndefined()
    expect(at('8')?.label).toBe('After the Reod')
  })
})
