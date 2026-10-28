import type { JourneyPack, MapPoint } from './journey'
import type { Reveal } from './types'

/** When a chapter happens, in the world's own calendar. */
export interface BookDate {
  /** For display, e.g. "1173.5.2.4". */
  text: string
  /** An estimate. */
  circa?: boolean
  source?: string
}

/** A turning point drawn as a pin on the chapter map. */
export interface BookPin {
  id: string
  /** A few words, e.g. "Gavilar assassinated". */
  title: string
  kind: 'battle' | 'death' | 'discovery' | 'meeting' | 'other'
  mapId: string
  point: MapPoint
  /** The chapter it happens in. */
  chapter: string
  /** When the reader learns of it. */
  revealedIn: Reveal
  /** One factual sentence. */
  text: string
  characters: string[]
}

/** A book's scenes, with the dates and pins of its chapters. */
export interface BookScenesPack extends JourneyPack {
  /** Chapter id -> its date; chapters that can't be dated are left out. */
  dates?: Record<string, BookDate>
  pins?: BookPin[]
  /** Who Cosmere Maps tracks in this book: kept on the map when away. */
  notable?: string[]
}

/**
 * Each book's chapter-map scenes (generated into bookScenes/<book>.json by
 * ~/cig-journey-data/emit.py): journey events with `happensIn`, one pack per
 * book, loaded when its page needs it. Kept apart from journeys, which hold
 * turning points only.
 */
const files = import.meta.glob<BookScenesPack>('./bookScenes/*.json', {
  import: 'default',
})
const path = (bookId: string) => `./bookScenes/${bookId}.json`
const loaded = new Map<string, BookScenesPack>()

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
