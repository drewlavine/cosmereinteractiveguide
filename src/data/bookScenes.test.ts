import { describe, expect, it } from 'vitest'
import { chapters } from './chapters'
import type { JourneyPack } from './journey'
import { journeyAtlas } from './journeyAtlas'
import { findPerson } from './people'
import { findPersona, hasMet, readerCanSee } from './reveal'

const packs = import.meta.glob<JourneyPack>('./bookScenes/*.json', {
  import: 'default',
  eager: true,
})

describe.each(Object.values(packs).map((p) => [p.id, p] as const))(
  'book scenes: %s',
  (book, pack) => {
    const ids = chapters[book].map((c) => c.id)
    const at = (chapter: string) =>
      readerCanSee({ read: new Set(), reading: new Map([[book, chapter]]) })

    it('covers every chapter, in reading order', () => {
      const seen = pack.events.map((e) => e.happensIn?.chapter)
      expect(new Set(seen)).toEqual(new Set(ids))
      const pos = seen.map((c) => ids.indexOf(c!))
      expect(pos).toEqual([...pos].sort((a, b) => a - b))
    })

    it('reveals each scene at the chapter it happens in', () => {
      for (const e of pack.events) {
        expect(e.happensIn?.book).toBe(book)
        expect(e.revealedIn).toEqual([e.happensIn])
        for (const p of e.summary ?? [])
          expect(p.revealedIn).toEqual([e.happensIn])
      }
    })

    it('only puts in a scene characters the reader has met by then, as they know them', () => {
      for (const e of pack.events) {
        const canSee = at(e.happensIn!.chapter)
        for (const c of e.characters) {
          const where = `${c} in ${e.happensIn!.chapter}`
          const persona = findPersona(c)
          expect(persona ?? findPerson(c), where).toBeDefined()
          expect(hasMet(c, canSee), where).toBe(true)
          // A persona seen through is shown as the character instead.
          if (persona)
            expect(canSee(persona.identityRevealedIn), where).toBe(false)
        }
      }
    })

    it('draws on maps the reader has, inside them', () => {
      for (const e of pack.events) {
        const map = journeyAtlas.map(e.mapId)
        expect(map, e.mapId).toBeDefined()
        expect(at(e.happensIn!.chapter)(map!.revealedIn), e.mapId).toBe(true)
        for (const [x, y] of e.path) {
          expect(x).toBeGreaterThanOrEqual(0)
          expect(y).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThanOrEqual(map!.image.width)
          expect(y).toBeLessThanOrEqual(map!.image.height)
        }
        if (e.placeId)
          expect(journeyAtlas.place(e.placeId), e.placeId).toBeDefined()
        expect(e.placeId || e.placeName, e.id).toBeTruthy()
      }
    })

    it('never shows a character after they leave the book', () => {
      const gone = new Set<string>()
      for (const e of pack.events) {
        for (const c of e.characters) expect(gone.has(c), c).toBe(false)
        for (const c of e.leaves ?? []) {
          expect(e.characters).toContain(c)
          gone.add(c)
        }
      }
    })

    it('has one sentence of text per scene, travel legs excepted', () => {
      for (const e of pack.events) {
        const text = e.summary?.map((p) => p.text) ?? []
        expect(text.length, e.id).toBeLessThanOrEqual(1)
        if (text[0]) expect(text[0]).toMatch(/^[A-Z].*[.!?]$/)
        if (!text.length) expect(e.path.length, e.id).toBeGreaterThan(1)
      }
    })
  },
)
