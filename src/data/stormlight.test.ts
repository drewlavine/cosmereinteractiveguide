import { describe, expect, it } from 'vitest'
import { locationDetails } from './locationDetails'
import { entryReveals } from './entryReveals'
import { chapters } from './chapters'
import { journeyAtlas } from './journeyAtlas'
import rosharJourney from './journeys/roshar.json'
import renarin from './stories/renarin-kholin.json'
import dieno from './stories/dieno.json'
import nightblood from './stories/nightblood.json'
import winn from './stories/winn.json'
import artifabrication from './cultureStories/artifabrication.json'
import edgedancerMonastery from './locationStories/edgedancer-monastery.json'
import type { JourneyPack } from './journey'
import type { CharacterStory, EntryStory, LocationStory } from './types'
import {
  hasMet,
  readerCanSee,
  revealCharacterJourney,
  revealEntry,
  revealLocationDetails,
  revealLocationStory,
  revealStory,
} from './reveal'

// The Stormlight Archive: people are met where they first appear, and
// personas keep their own page until the books make clear who they are.
const at = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })

describe('Stormlight Archive reveals', () => {
  it('meets bridgemen at the chapter they first appear', () => {
    expect(hasMet('teft', at([], { 'way-of-kings': '10' }))).toBe(false)
    expect(hasMet('teft', at([], { 'way-of-kings': '11' }))).toBe(true)
  })

  it('keeps a persona on its own page until the identity is revealed', () => {
    const early = ['way-of-kings', 'words-of-radiance', 'edgedancer']
    const edgedancer = at(early)
    expect(hasMet('stump', edgedancer)).toBe(true)
    expect(hasMet('arshqqam', edgedancer)).toBe(false)
    const before = at([...early, 'oathbringer', 'dawnshard'], {
      'rhythm-of-war': '21',
    })
    expect(hasMet('arshqqam', before)).toBe(false)
    const after = at([...early, 'oathbringer', 'dawnshard'], {
      'rhythm-of-war': '22',
    })
    expect(hasMet('stump', after)).toBe(false)
    expect(hasMet('arshqqam', after)).toBe(true)
  })

  it('hides Urithiru residents until Words of Radiance is finished', () => {
    const residents = (canSee: ReturnType<typeof at>) =>
      revealLocationDetails(
        locationDetails.urithiru,
        canSee,
        () => true,
      ).people.map((p) => p.characterId)
    const reading = at(['way-of-kings'], { 'words-of-radiance': '80' })
    expect(residents(reading)).not.toContain('adolin-kholin')
    const finished = at(['way-of-kings', 'words-of-radiance'])
    expect(residents(finished)).toContain('adolin-kholin')
  })
})

describe('Wind and Truth additions', () => {
  const wat = 'wind-and-truth'
  const earlier = [
    'way-of-kings',
    'words-of-radiance',
    'edgedancer',
    'oathbringer',
    'dawnshard',
    'rhythm-of-war',
  ]
  const reading = (chapter: string) => at(earlier, { [wat]: chapter })
  const story = (chapter: string) =>
    JSON.stringify(
      revealStory(
        'renarin-kholin',
        renarin as CharacterStory,
        reading(chapter),
      ),
    )

  it('reveals a new relationship decision and its heading only at its chapter', () => {
    expect(story('120')).not.toContain('entered Rlain')
    expect(story('121')).toContain("entered Rlain's vision to kiss him")
    expect(story('unknown-chapter')).not.toContain('A shared path')
    expect(
      JSON.stringify(
        revealStory('renarin-kholin', renarin as CharacterStory, at(earlier)),
      ),
    ).not.toContain('A shared path')
  })

  it('keeps the late political outcome hidden until its own reveal', () => {
    expect(story('145')).not.toContain('representative government')
    expect(story('146')).toContain('representative government')
    expect(
      JSON.stringify(
        revealStory(
          'renarin-kholin',
          renarin as CharacterStory,
          at([...earlier, wat]),
        ),
      ),
    ).toContain('representative government')
  })

  it('uses the real interlude boundary rather than an invented numeric chapter', () => {
    const index = chapters[wat].findIndex((chapter) => chapter.id === 'i-17')
    const prose = (chapter: string) =>
      JSON.stringify(
        revealStory('dieno', dieno as CharacterStory, reading(chapter)),
      )
    expect(prose(chapters[wat][index - 1].id)).not.toContain(
      'stalled his executioners',
    )
    expect(prose('i-17')).toContain('stalled his executioners')
  })

  it('keeps a conservatively dated location hidden even after the postlude', () => {
    expect(
      revealLocationStory(
        edgedancerMonastery as LocationStory,
        reading('postlude'),
      ).intro,
    ).toBeUndefined()
    expect(
      revealLocationStory(edgedancerMonastery as LocationStory, at([wat]))
        .intro,
    ).toContain('Shin monastery')
  })

  it('does not expose a new character page before the first meeting', () => {
    expect(hasMet('winn', reading('46'))).toBe(false)
    expect(hasMet('winn', reading('47'))).toBe(true)
    expect(
      revealStory('winn', winn as CharacterStory, at(earlier)).intro,
    ).toBeUndefined()
    expect(
      revealStory('winn', winn as CharacterStory, reading('47')).intro,
    ).toBeTruthy()
  })

  it('gates the new cultural entry and its author at the same boundary', () => {
    const prose = (chapter: string) =>
      JSON.stringify(
        revealEntry(
          artifabrication as EntryStory,
          reading(chapter),
          () => true,
        ),
      )
    expect(reading('100')(entryReveals.culture.artifabrication)).toBe(false)
    expect(prose('100')).not.toContain('Britt')
    expect(reading('101')(entryReveals.culture.artifabrication)).toBe(true)
    expect(prose('101')).toContain('Britt')
  })

  it('preserves a reviewed later name even when its phenomenon was shown earlier', () => {
    const reveal = entryReveals.culture['death-rattle']
    expect(at(['way-of-kings'])(reveal)).toBe(false)
    expect(at(['words-of-radiance'])(reveal)).toBe(true)
  })

  it('does not give another-series-only readers the new abilities', () => {
    const shown = revealStory(
      'nightblood',
      nightblood as CharacterStory,
      at(['warbreaker']),
    )
    expect(shown.abilities).toEqual([])
    expect(
      revealStory('nightblood', nightblood as CharacterStory, at([wat]))
        .abilities,
    ).not.toEqual([])
  })

  it('reveals an unplaced journey event without inventing a map marker', () => {
    const unplaced = (chapter: string) =>
      revealCharacterJourney(
        'renarin-kholin',
        (rosharJourney as JourneyPack).events,
        journeyAtlas,
        reading(chapter),
      ).stops.filter((stop) => stop.path.length === 0)
    expect(unplaced('139')).toEqual([])
    expect(unplaced('140')).toHaveLength(1)
    expect(unplaced('140')[0].title).toMatch(/Mishram/)
    expect(unplaced('unknown-chapter')).toEqual([])
  })
})
