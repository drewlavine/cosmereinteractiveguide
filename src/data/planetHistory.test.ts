import { describe, expect, it } from 'vitest'
import { findBook } from './books'
import { chapters } from './chapters'
import { characterPortraits } from './characterPortraits'
import data from './chronology.json'
import { entryArt } from './entryArt'
import { findLocation } from './locations'
import { planetHistory, revealPlanetHistory, sinceLabel } from './planetHistory'
import { chapterIndex } from './progress'
import { readerCanSee } from './reveal'
import type { Reveal } from './types'

const canSeeAt = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })

const stormlight = [
  'way-of-kings',
  'words-of-radiance',
  'edgedancer',
  'oathbringer',
  'dawnshard',
  'rhythm-of-war',
]

const history = (planetId: string, read: string[], at = {}) =>
  revealPlanetHistory(planetId, canSeeAt(read, at)).eras
const momentIds = (planetId: string, read: string[], at = {}) =>
  history(planetId, read, at).flatMap((e) => e.moments.map((m) => m.id))
/** Everything the page would show, as one string to search. */
const words = (planetId: string, read: string[], at = {}) =>
  history(planetId, read, at)
    .flatMap((e) => [
      ...e.titles.map((t) => t.text),
      e.when,
      ...e.moments.flatMap((m) => [
        ...m.versions.flatMap((v) => [v.title, v.text]),
        ...m.places.map((p) => p.name),
        m.art?.alt,
      ]),
    ])
    .join('\n')
const moment = (planetId: string, id: string, read: string[], at = {}) =>
  history(planetId, read, at)
    .flatMap((e) => e.moments)
    .find((m) => m.id === id)

describe('planet history data', () => {
  it('only points at books, chapters, places, art, events and moments that exist', () => {
    const events = new Set((data as { id: string }[]).map((e) => e.id))
    const bad: string[] = []
    const checkReveal = (where: string, reveal: Reveal) => {
      for (const point of reveal.flatMap((p) =>
        typeof p === 'object' && 'all' in p ? p.all : [p],
      )) {
        const book = typeof point === 'string' ? point : point.book
        if (!findBook(book)) bad.push(`${where}: book ${book}`)
        else if (
          typeof point === 'object' &&
          (!chapters[book] || chapterIndex(book, point.chapter) === undefined)
        )
          bad.push(`${where}: ${book} chapter ${point.chapter}`)
      }
    }
    for (const [planetId, eras] of Object.entries(planetHistory)) {
      const ids = eras.flatMap((e) => e.moments.map((m) => m.id))
      if (new Set(ids).size !== ids.length) bad.push(`${planetId}: repeated id`)
      for (const era of eras) {
        if (typeof era.title !== 'string')
          era.title.forEach((t) => checkReveal(era.id, t.revealedIn))
        era.when?.forEach((t) => checkReveal(era.id, t.revealedIn))
        for (const m of era.moments) {
          const where = `${planetId}/${m.id}`
          if (m.chrono && !events.has(m.chrono))
            bad.push(`${where}: ${m.chrono}`)
          if (!m.told[0].title || !m.told[0].text)
            bad.push(`${where}: untitled`)
          for (const told of m.told) {
            checkReveal(where, told.revealedIn)
            for (const place of told.places ?? [])
              if (!findLocation(planetId, place)) bad.push(`${where}: ${place}`)
            for (const id of told.after ?? [])
              if (!ids.includes(id)) bad.push(`${where}: after ${id}`)
            const art = told.art?.startsWith('character:')
              ? characterPortraits[told.art.slice('character:'.length)]
              : told.art && entryArt[told.art]
            if (told.art && !art?.length) bad.push(`${where}: art ${told.art}`)
          }
        }
      }
    }
    expect(bad).toEqual([])
  })
})

describe('revealPlanetHistory', () => {
  it('tells a Stormlight reader nothing of Nalthis before Wind and Truth', () => {
    const shown = revealPlanetHistory('nalthis', canSeeAt(stormlight))
    expect(shown.eras).toEqual([])
    expect(shown.spoilers).toBe(true)
  })

  it('gives a Wind and Truth reader only what that book says of Nalthis', () => {
    const at = { 'wind-and-truth': '56' }
    expect(momentIds('nalthis', stormlight, at)).toEqual(['bargain'])
    expect(words('nalthis', stormlight, at)).not.toMatch(
      /Endowment|Hallandren|Returned/,
    )
    expect(
      momentIds('nalthis', stormlight, { 'wind-and-truth': '55' }),
    ).toEqual([])
  })

  it('gives a Tress reader only its glimpse of later Nalthis', () => {
    const eras = history('nalthis', ['tress'])
    expect(eras.map((e) => [e.title, e.moments.map((m) => m.id)])).toEqual([
      ['Later years', ['awakened-devices']],
    ])
  })

  it('shows a Warbreaker reader mid-book the eras up to their chapter', () => {
    const at = { warbreaker: '15' }
    const eras = history('nalthis', [], at)
    expect(eras.map((e) => [e.id, e.moments.map((m) => m.id)])).toEqual([
      ['manywar', ['kalad-war', 'peacegiver']],
      ['god-kings', ['court', 'treaty']],
      ['bride', ['siri', 'war-debate']],
    ])
    expect(eras[0].when).toBe('Generations ago')
    expect(eras[2].title).toBe('The God King’s bride')
    expect(words('nalthis', [], at)).not.toMatch(
      /Vasher|D’Denir|Kuth|Shashara|Phantom|Bluefingers|Pahn Kahl/,
    )
    // Places wait for the end of the book, like the map they're drawn on.
    expect(eras.flatMap((e) => e.moments.flatMap((m) => m.places))).toEqual([])
    expect(moment('nalthis', 'court', [], at)?.after).toEqual(['peacegiver'])
  })

  it('retells a moment as the book reveals more', () => {
    const at32 = { warbreaker: '32' }
    expect(history('nalthis', [], at32).map((e) => e.id)).toContain(
      'first-returned',
    )
    expect(moment('nalthis', 'peacegiver', [], at32)?.text).toMatch(
      /dispelled Kalad’s Phantoms/,
    )
    expect(words('nalthis', [], at32)).not.toMatch(/Vasher/)

    const at58 = { warbreaker: '58' }
    expect(moment('nalthis', 'peacegiver', [], at58)?.text).toMatch(
      /he is Vasher/,
    )
    expect(words('nalthis', [], at58)).not.toMatch(/Kuth/)
    expect(history('nalthis', [], at58).at(-1)?.title).toBe(
      'The Pahn Kahl rebellion',
    )

    const peacegiver = moment('nalthis', 'peacegiver', ['warbreaker'])
    expect(peacegiver?.title).toBe('Kalad becomes Peacegiver')
    expect(peacegiver?.versions.map((v) => sinceLabel(v.since))).toEqual([
      'Warbreaker, Chapter 15',
      'Warbreaker, Chapter 32',
      'Warbreaker, Chapter 58',
      'Warbreaker, Epilogue',
    ])
  })

  it('links places and causes once the reader has finished the book', () => {
    const stopped = moment('nalthis', 'rebellion-stopped', ['warbreaker'])
    expect(stopped?.places.map((p) => p.id)).toEqual([
      'god-kings-palace',
      'd-denir-garden',
    ])
    expect(stopped?.after).toEqual([
      'lightsong',
      'pahn-kahl-strike',
      'phantoms',
    ])
    expect(
      revealPlanetHistory('nalthis', canSeeAt(['warbreaker'])).spoilers,
    ).toBe(true)
  })

  it('keeps unknown chapters hidden', () => {
    expect(history('nalthis', [], { warbreaker: 'no-such-chapter' })).toEqual(
      [],
    )
  })

  it('shows everything when the reader asks to see anyway', () => {
    const shown = revealPlanetHistory('nalthis', canSeeAt([]), true)
    expect(shown.eras).toHaveLength(planetHistory.nalthis.length)
    expect(shown.spoilers).toBe(true)
  })

  it('names the Lord Ruler only once The Final Empire does', () => {
    expect(words('scadrial', [], { 'final-empire': '37' })).not.toMatch(
      /Rashek/,
    )
    expect(
      moment('scadrial', 'logbook', [], { 'final-empire': '38' }),
    ).toMatchObject({
      title: 'The packman',
      text: expect.stringMatching(/Rashek/),
    })
    expect(
      words('scadrial', ['final-empire', 'well-of-ascension', 'hero-of-ages']),
    ).not.toMatch(/Elendel|Wax|Harmony/)
  })
})
