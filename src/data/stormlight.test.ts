import { describe, expect, it } from 'vitest'
import { locationDetails } from './locationDetails'
import { hasMet, readerCanSee, revealLocationDetails } from './reveal'

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
