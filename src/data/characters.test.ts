import { describe, expect, it } from 'vitest'
import { characters, findCharacter } from './characters'

const pages = new Set(characters.map((c) => c.coppermindPage))

describe('characters', () => {
  it('has unique kebab-case ids, unique names and unique pages', () => {
    for (const { id } of characters)
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(new Set(characters.map((c) => c.id)).size).toBe(characters.length)
    expect(new Set(characters.map((c) => c.name)).size).toBe(characters.length)
    expect(pages.size).toBe(characters.length)
  })

  it('is sorted by name', () => {
    const names = characters.map((c) => c.name)
    expect(names).toEqual([...names].sort(new Intl.Collator('en').compare))
  })

  it('includes Cosmere characters', () => {
    for (const page of [
      'Kaladin',
      'Vin',
      'Hoid',
      'Sarene',
      'Vivenna',
      'Kenton',
      'Nikaro',
      'Tress',
      'Yumi',
      'Sixth of the Dusk',
    ])
      expect(pages).toContain(page)
  })

  it('leaves out characters from non-Cosmere books', () => {
    for (const page of [
      'David Charleston',
      'Spensa Nightshade',
      'Alcatraz Smedry',
      'Joel Saxon',
      'Stephen Leeds',
      'Mitosis (Epic)',
      'Hoid (Riftwake)',
    ])
      expect(pages).not.toContain(page)
  })

  it('strips disambiguation unless the name would clash', () => {
    expect(findCharacter('blackthorn')?.coppermindPage).toBe(
      'Blackthorn (spren)',
    )
    expect(findCharacter('ati-seon')?.name).toBe('Ati (seon)')
    expect(findCharacter('ati')?.name).toBe('Ati')
  })

  it('finds characters by id', () => {
    expect(findCharacter('kaladin')?.name).toBe('Kaladin')
    expect(findCharacter('nope')).toBeUndefined()
    expect(findCharacter(undefined)).toBeUndefined()
  })
})
