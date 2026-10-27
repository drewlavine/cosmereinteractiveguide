import { describe, expect, it } from 'vitest'
import feScenes from './bookScenes/final-empire.json'
import { characterPortraits } from './characterPortraits'
import type { JourneyEvent, JourneyPack } from './journey'
import { journeyAtlas } from './journeyAtlas'
import { findPerson } from './people'
import { readerCanSee, revealBookChapters } from './reveal'

const fe = 'final-empire'
const pack = feScenes as unknown as JourneyPack
const person = (id: string) => {
  const p = findPerson(id)
  return p && { name: p.name, portraits: characterPortraits[id] }
}
const reader = (read: string[], chapter?: string) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(chapter ? [[fe, chapter]] : []),
  })
const reveal = (
  canSee: ReturnType<typeof reader>,
  options: { viewAnyway?: boolean; events?: JourneyEvent[] } = {},
) =>
  revealBookChapters(fe, options.events ?? pack.events, journeyAtlas, canSee, {
    viewAnyway: options.viewAnyway,
    credits: pack.credits,
    person,
  })
const chapter = (shown: ReturnType<typeof reveal>, id: string) =>
  shown.chapters.find((c) => c.id === id)!

describe('revealBookChapters', () => {
  it("stops at the reader's chapter", () => {
    const shown = reveal(reader([], '17'))
    expect(shown.chapters.map((c) => c.id).at(-1)).toBe('17')
    expect(shown.chapters[0].id).toBe('prologue')
    expect(shown.spoilers).toBe(true)
    expect(JSON.stringify(shown)).not.toMatch(/Shan Elariel could Soothe/)
  })

  it('shows nothing of a book not started', () => {
    const shown = reveal(reader([]))
    expect(shown.chapters).toEqual([])
    expect(shown.cast).toEqual([])
    expect(shown.maps).toEqual([])
    expect(shown.credits).toEqual([])
  })

  it('shows every chapter of a finished book, and all with Show anyway', () => {
    expect(reveal(reader([fe])).chapters).toHaveLength(40)
    expect(reveal(reader([fe])).spoilers).toBe(false)
    const anyway = reveal(reader([], '3'), { viewAnyway: true })
    expect(anyway.chapters).toHaveLength(40)
    expect(anyway.spoilers).toBe(true)
  })

  it('gives colours in order of first appearance among shown chapters', () => {
    const { cast } = reveal(reader([], '2'))
    expect(cast.map((c) => c.id)).toEqual([
      'kelsier',
      'vin',
      'camon',
      'dockson',
    ])
    expect(cast.map((c) => c.colour)).toEqual([0, 1, 2, 3])
  })

  it('keeps a persona apart until seen through, then shows the character', () => {
    const before = reveal(reader([], '37'))
    expect(before.cast.map((c) => c.id)).toContain('lord-ruler')
    expect(before.cast.map((c) => c.id)).not.toContain('rashek')
    const after = reveal(reader([], '38'))
    const ids = after.cast.map((c) => c.id)
    expect(ids).toContain('rashek')
    expect(ids).not.toContain('lord-ruler')
    // His chapter 34 scene now names Rashek, with art of that chapter only.
    const ch34 = chapter(after, '34')
    expect(ch34.scenes[0].characters).toContain('rashek')
    expect(ch34.positions.find((p) => p.id === 'rashek')?.portrait?.src).toBe(
      '/portraits/lord-ruler-carriage.webp',
    )
  })

  it('dims people not in the chapter at their last spot, until they leave', () => {
    const shown = reveal(reader([fe]))
    const kelsier = (ch: string) =>
      chapter(shown, ch).positions.find((p) => p.id === 'kelsier')
    expect(kelsier('1')).toMatchObject({ here: false, mapId: 'final-empire' })
    expect(kelsier('2')).toMatchObject({ here: true, mapId: 'luthadel' })
    expect(kelsier('34')?.here).toBe(true)
    expect(kelsier('35')).toBeUndefined()
    expect(chapter(shown, 'prologue').positions.map((p) => p.id)).toEqual([
      'kelsier',
    ])
  })

  it('never shows art from past the chapter on show', () => {
    const shown = reveal(reader([fe]))
    const vin = chapter(shown, '1').positions.find((p) => p.id === 'vin')
    expect(vin?.portrait?.src).toBe('/portraits/vin-street-urchin.webp')
    for (const ch of shown.chapters)
      for (const p of ch.positions)
        for (const point of p.portrait?.revealedIn ?? [])
          if (typeof point === 'object' && 'book' in point && point.book === fe)
            expect(
              shown.chapters.findIndex((c) => c.id === point.chapter),
            ).toBeLessThanOrEqual(shown.chapters.indexOf(ch))
  })

  it('names places and credits only the sources shown', () => {
    const early = reveal(reader([], '7'))
    expect(chapter(early, 'prologue').scenes[0].place?.name).toBe(
      'Tresting plantation',
    )
    expect(early.credits.map((c) => c.source)).toEqual(['final-empire-scenes'])
    const later = reveal(reader([], '8'))
    expect(later.credits.map((c) => c.source)).toContain('cosmere-maps')
  })

  it("doesn't move anyone for a flashback", () => {
    const base = pack.events.filter((e) => e.happensIn?.chapter === 'prologue')
    const flashback: JourneyEvent = {
      ...base[0],
      id: 'fb',
      order: 0.5,
      path: [[1, 1]],
      flashback: true,
      happensIn: { book: fe, chapter: '1' },
      revealedIn: [{ book: fe, chapter: '1' }],
    }
    const shown = reveal(reader([], '1'), { events: [...base, flashback] })
    const ch1 = chapter(shown, '1')
    expect(ch1.scenes[0].flashback).toBe(true)
    expect(ch1.positions[0]).toMatchObject({ id: 'kelsier', here: false })
    expect(ch1.positions[0].point).not.toEqual([1, 1])
  })
})
