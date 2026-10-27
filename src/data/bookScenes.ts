import type { JourneyPack } from './journey'

/**
 * Each book's chapter-map scenes (generated into bookScenes/<book>.json by
 * ~/cig-journey-data/emit.py): journey events with `happensIn`, one pack per
 * book, loaded when its page needs it. Kept apart from journeys, which hold
 * turning points only.
 */
const files = import.meta.glob<JourneyPack>('./bookScenes/*.json', {
  import: 'default',
})
const path = (bookId: string) => `./bookScenes/${bookId}.json`
const loaded = new Map<string, JourneyPack>()

export const hasBookScenes = (bookId: string) => path(bookId) in files

/** The book's scenes if already loaded; undefined while loading or if none. */
export const cachedBookScenes = (bookId: string) => loaded.get(bookId)

export async function loadBookScenes(bookId: string) {
  const load = files[path(bookId)]
  if (!load) return undefined
  const pack = loaded.get(bookId) ?? (await load())
  loaded.set(bookId, pack)
  return pack
}
