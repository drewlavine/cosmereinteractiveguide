import { describe, expect, it } from 'vitest'
import { abilityList } from './abilityList'
import { books } from './books'
import { chapters } from './chapters'
import { cultureList } from './cultureList'
import { entryArt } from './entryArt'
import { generatedEntryArt } from './entryArtGenerated'
import { eventList } from './eventList'
import { lifeformList } from './lifeformList'
import { locationList } from './locationList'
import type { Reveal } from './types'

const bookIds = new Set(books.map((b) => b.id))
const listed = new Set([
  ...abilityList.map((e) => `ability:${e.id}`),
  ...cultureList.map((e) => `culture:${e.id}`),
  ...lifeformList.map((e) => `lifeform:${e.id}`),
  ...eventList.map((e) => `event:${e.id}`),
  ...locationList.map((e) => `place:${e.id}`),
])

const expectValidReveal = (reveal: Reveal, where: string) => {
  expect(reveal.length, where).toBeGreaterThan(0)
  const points = reveal.flatMap((p) =>
    typeof p !== 'string' && 'all' in p ? p.all : [p],
  )
  for (const point of points) {
    const book = typeof point === 'string' ? point : point.book
    expect(bookIds, where).toContain(book)
    if (typeof point !== 'string')
      expect(
        chapters[point.book]?.map((c) => c.id),
        `${where}: ${point.book} ${point.chapter}`,
      ).toContain(point.chapter)
  }
}

describe('entry art', () => {
  it('dates and credits every piece and finds its image', () => {
    const files = Object.keys(import.meta.glob('../../public/entries/*'))
    for (const [key, list] of Object.entries(entryArt)) {
      expect(list.length, key).toBeGreaterThan(0)
      for (const art of list) {
        const where = `${key} ${art.src}`
        expect(files, where).toContain(`../../public${art.src}`)
        expect(art.alt.trim(), where).not.toBe('')
        expect(art.artist.trim(), where).not.toBe('')
        expect(art.artistUrl, where).toMatch(/^https:\/\//)
        expectValidReveal(art.revealedIn, where)
      }
    }
  })

  it('gives generated art only to listed entries, one to three pieces each', () => {
    for (const [key, list] of Object.entries(generatedEntryArt)) {
      expect(listed, key).toContain(key)
      expect(list.length, key).toBeGreaterThan(0)
      expect(list.length, key).toBeLessThanOrEqual(3)
      for (const art of list)
        expect(art.src, key).toMatch(
          new RegExp(
            `^/entries/${key.replace(':', '-')}(-\\d+)?\\.(webp|svg)$`,
          ),
        )
    }
  })
})
