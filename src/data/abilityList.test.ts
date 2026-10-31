import { describe, expect, it } from 'vitest'
import { abilityList } from './abilityList'
import { books } from './books'
import { cultureList } from './cultureList'
import { entryRevealedIn, loadEntryStory } from './entryStories'
import { eventList } from './eventList'
import { readerCanSee } from './reveal'
import { systems } from './systems'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const planetIds = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))
const byId = new Map(abilityList.map((a) => [a.id, a]))

const pointsOf = (reveal: Reveal): string[] =>
  reveal.flatMap((p) =>
    typeof p === 'string' ? [p] : 'all' in p ? pointsOf(p.all) : [p.book],
  )

describe('ability list', () => {
  it('has unique ids', () => {
    expect(byId.size).toBe(abilityList.length)
  })

  it('dates every ability by a known book its page cites', () => {
    for (const a of abilityList) {
      expect(a.books.length, a.id).toBeGreaterThan(0)
      for (const b of a.books) expect(bookIds, `${a.id}: ${b}`).toContain(b)
      for (const b of pointsOf(a.revealedIn))
        expect(bookIds, `${a.id}: ${b}`).toContain(b)
    }
  })

  it('ties abilities only to listed systems, never before the ability itself', () => {
    for (const a of abilityList) {
      if (a.world) expect(planetIds, a.id).toContain(a.world)
      for (const t of a.systems ?? []) {
        expect(byId.get(t.id)?.kind, `${a.id} → ${t.id}`).toBe('system')
        expect(pointsOf(t.revealedIn), a.id).toEqual(
          expect.arrayContaining(pointsOf(a.revealedIn)),
        )
      }
      for (const s of a.shards ?? [])
        expect(pointsOf(s.revealedIn), a.id).toEqual(
          expect.arrayContaining(pointsOf(a.revealedIn)),
        )
    }
  })
})

describe('magic grouping', () => {
  const at = (read: string[], reading: Record<string, string> = {}) =>
    readerCanSee({
      read: new Set(read),
      reading: new Map(Object.entries(reading)),
    })
  const tie = (id: string, system: string) =>
    byId.get(id)?.systems?.find((t) => t.id === system)?.revealedIn ?? []
  const shards = (id: string) => byId.get(id)?.shards?.map((s) => s.name) ?? []

  it('shows an entry only once the books reveal what kind of thing it is', () => {
    const mist = entryRevealedIn('ability', byId.get('mist')!)
    expect(at([], { 'final-empire': '7' })(mist)).toBe(false)
    expect(at([], { 'final-empire': '38' })(mist)).toBe(true)
    const aether = entryRevealedIn('ability', byId.get('aether')!)
    expect(at([], { oathbringer: 'i-8' })(aether)).toBe(false)
    expect(at(['oathbringer'])(aether)).toBe(false)
    expect(at(['oathbringer', 'tress'])(aether)).toBe(true)
  })

  it('lists the Reod as an event, named before its cause is known', async () => {
    expect(byId.has('reod')).toBe(false)
    const reod = eventList.filter((e) => e.id === 'reod')
    expect(reod.map((e) => e.kind)).toEqual(['cataclysm'])
    const shown = entryRevealedIn('event', reod[0])
    expect(at([], { elantris: 'prologue' })(shown)).toBe(false)
    expect(at([], { elantris: '4' })(shown)).toBe(true)
    const intro = (await loadEntryStory('event', 'reod'))!.intro
    const intros = (chapter: string) =>
      intro.filter((i) => at([], { elantris: chapter })(i.revealedIn)).length
    expect(intros('4')).toBeGreaterThan(0)
    expect(intros('49')).toBeGreaterThan(intros('4'))
  })

  it('lists what is not Investiture where it belongs', () => {
    for (const id of ['sprouter', 'steel-alphabet', 'silajana', 'aon'])
      expect(byId.has(id), id).toBe(false)
    const kinds = {
      sprouter: 'title',
      'steel-alphabet': 'language',
      aon: 'language',
    }
    expect(
      Object.fromEntries(
        cultureList.filter((c) => c.id in kinds).map((c) => [c.id, c.kind]),
      ),
    ).toEqual(kinds)
  })

  it('types each entry by what it is', () => {
    const kinds = {
      'essence-mark': 'item',
      excisor: 'item',
      'shade-prison': 'item',
      'ichor-alcohol': 'item',
      luminist: 'investiture',
      hion: 'investiture',
      'peacegivers-treasure': 'investiture',
      godsflame: 'investiture',
      skeletal: 'user',
      seon: 'user',
      initiation: 'concept',
      fortune: 'concept',
      shaod: 'concept',
      'royal-locks': 'concept',
      soulcasting: 'concept',
      compounding: 'concept',
      heightening: 'concept',
      command: 'concept',
      steelfield: 'concept',
    }
    expect(
      Object.fromEntries(
        Object.keys(kinds).map((id) => [id, byId.get(id)?.kind]),
      ),
    ).toEqual(kinds)
  })

  it('ties a Shard only through the source the books give, once they give it', () => {
    expect(shards('fused')).not.toContain('Honor')
    expect(shards('fused')).not.toContain('Cultivation')
    expect(shards('seon')).not.toContain('Dominion')
    expect(shards('father-machine')).not.toContain('Endowment')
    expect(shards('atium')).toEqual(['Ruin'])
    const ruin = byId.get('atium')!.shards![0].revealedIn
    expect(at(['final-empire', 'well-of-ascension'])(ruin)).toBe(false)
    expect(at(['final-empire'], { 'hero-of-ages': '78' })(ruin)).toBe(true)
  })

  it('ties an entry to its system from the chapter that does, in any series', () => {
    expect(at([], { 'final-empire': '17' })(tie('brass', 'allomancy'))).toBe(
      false,
    )
    expect(at([], { 'final-empire': '18' })(tie('brass', 'allomancy'))).toBe(
      true,
    )
    expect(at(['alloy-of-law'])(tie('nicrosil', 'allomancy'))).toBe(true)
    // Savants span worlds: each series ties its own system, and only that.
    expect(byId.get('savant')?.world).toBeUndefined()
    expect(at(['hero-of-ages'])(tie('savant', 'allomancy'))).toBe(true)
    expect(at(['hero-of-ages'])(tie('savant', 'surgebinding'))).toBe(false)
    expect(at(['words-of-radiance'])(tie('savant', 'allomancy'))).toBe(false)
    expect(at(['words-of-radiance'])(tie('savant', 'surgebinding'))).toBe(true)
  })

  it('keeps a former power that is now a concept under its magic system', () => {
    expect(at(['way-of-kings'])(tie('soulcasting', 'surgebinding'))).toBe(true)
    expect(at(['hero-of-ages'])(tie('compounding', 'allomancy'))).toBe(true)
    expect(at(['hero-of-ages'])(tie('compounding', 'feruchemy'))).toBe(true)
    expect(at(['warbreaker'])(tie('heightening', 'awakening'))).toBe(true)
  })
})
