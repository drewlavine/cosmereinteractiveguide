import { describe, expect, it } from 'vitest'
import { readerCanSee } from '../../data/reveal'
import { revealTimeline } from '../../data/timeline'
import { SKY } from './sky'
import { explorerPins, explorerWorlds } from './worlds'

const at = (read: string[], reading: Record<string, string> = {}) => {
  const canSee = readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })
  const timeline = revealTimeline(canSee)
  const worlds = explorerWorlds(timeline, canSee)
  return { worlds, pins: explorerPins(timeline, worlds) }
}
const ids = (w: { id: string }[]) => w.map((x) => x.id)

const ERA1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']
const BEFORE_WAT = [
  'elantris',
  ...ERA1,
  'secret-history',
  'warbreaker',
  'way-of-kings',
  'words-of-radiance',
  'oathbringer',
  'rhythm-of-war',
  'shadows-for-silence',
  'white-sand-omnibus',
  'arcanum-unbounded',
  'sunlit-man',
]

describe('explorer worlds', () => {
  it('has nothing to explore before the reader starts a book', () => {
    expect(at([]).worlds).toEqual([])
  })

  it('shows only Roshar, with its map, at the Way of Kings prelude', () => {
    const { worlds, pins } = at([], { 'way-of-kings': 'prelude' })
    expect(ids(worlds)).toEqual(['roshar'])
    expect(worlds[0].star).toBe(SKY.stars.rosharan)
    expect(worlds[0].map?.width).toBe(2560)
    expect(pins).toEqual([])
  })

  it('keeps worlds from other series hidden until their books', () => {
    const era1 = ids(at(ERA1).worlds)
    expect(era1).toContain('scadrial')
    expect(era1).not.toContain('roshar')
    expect(era1).not.toContain('sel')
    expect(era1).not.toContain('ashyn')
  })

  it("never shows Yolen at Wind and Truth chapter 17, but does once it's finished", () => {
    const drew = at(BEFORE_WAT, { 'wind-and-truth': '17' })
    expect(ids(drew.worlds)).not.toContain('yolen')
    expect(ids(drew.worlds)).toEqual(
      expect.arrayContaining(['roshar', 'ashyn', 'scadrial', 'sel', 'nalthis']),
    )
    expect(ids(drew.pins)).toEqual([
      'reod',
      'dalinar-born',
      'kaladin-born',
      'gavilar-assassinated',
    ])
    const after = at([...BEFORE_WAT, 'wind-and-truth'])
    expect(after.worlds.find((w) => w.id === 'yolen')?.star).toBe(
      SKY.stars.yolish,
    )
  })

  it("pins Kaladin's birth only once the book names Hearthstone", () => {
    expect(ids(at([], { 'way-of-kings': '15' }).pins)).not.toContain(
      'kaladin-born',
    )
    expect(ids(at([], { 'way-of-kings': '16' }).pins)).toContain('kaladin-born')
  })

  it("unrolls Sel into Sycla, or a city's map while an event is there", () => {
    const canSee = readerCanSee({
      read: new Set(['elantris']),
      reading: new Map(),
    })
    const timeline = revealTimeline(canSee)
    const sel = (current?: (typeof timeline.events)[number]) =>
      explorerWorlds(timeline, canSee, current).find((w) => w.id === 'sel')
    expect(sel()?.mapId).toBe('opelon')
    const reod = timeline.events.find((e) => e.id === 'reod')!
    expect(sel(reod)?.mapId).toBe('opelon')
    const inCity = {
      ...reod,
      map: { mapId: 'elantris-and-kae', at: [500, 500] as const },
    }
    expect(sel(inCity)?.map?.src).toMatch(/Elantris-Kae_Map\.jpg$/)
    const worlds = explorerWorlds(timeline, canSee, inCity)
    expect(explorerPins({ ...timeline, events: [inCity] }, worlds)).toEqual([
      expect.objectContaining({ id: 'reod', at: [500, 500] }),
    ])
  })

  it('draws Roshar as the Silver Kingdoms before the Recreance', () => {
    const canSee = readerCanSee({
      read: new Set(BEFORE_WAT),
      reading: new Map(),
    })
    const timeline = revealTimeline(canSee)
    const roshar = (id: string) =>
      explorerWorlds(
        timeline,
        canSee,
        timeline.events.find((e) => e.id === id),
      ).find((w) => w.id === 'roshar')
    // Even for an event without a map, it's the era's globe.
    expect(roshar('honor-cultivation-settle')).toMatchObject({
      mapId: 'silver-kingdoms',
      globe: { texture: expect.stringMatching(/Silver-Kingdoms-globe/) },
    })
    expect(roshar('gavilar-assassinated')).toMatchObject({
      mapId: 'roshar',
      globe: { texture: expect.stringMatching(/Roshar-globe/) },
    })
  })

  it("draws Yolen's features only once a book shows them", () => {
    const yolen = (read: string[]) =>
      at(read).worlds.find((w) => w.id === 'yolen')?.yolen
    expect(yolen([...BEFORE_WAT, 'wind-and-truth'])).toEqual({
      fain: true,
      greatstar: false,
    })
    // Isles alone: the place is known, but not what The Sunlit Man shows.
    expect(yolen(['secret-history', 'isles-of-the-emberdark'])).toEqual({
      fain: false,
      greatstar: true,
    })
    expect(
      yolen([...BEFORE_WAT, 'wind-and-truth', 'isles-of-the-emberdark']),
    ).toEqual({ fain: true, greatstar: true })
  })
})
