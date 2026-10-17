import { findBook } from '../../data/books'
import { chapterLabel } from '../../data/progress'
import type { ShownJourneyStop } from '../../data/reveal'

/** Where in the books a stop is revealed, e.g. "The Way of Kings, Chapter 6". */
export function stopSource(stop: ShownJourneyStop) {
  if (!stop.where) return undefined
  const { bookId, chapter } = stop.where
  return {
    bookId,
    title: findBook(bookId)?.title ?? bookId,
    chapter: chapter ? chapterLabel(bookId, chapter) : undefined,
  }
}

/** A stop's short name: what happens, else its place once revealed, else its number. */
export const stopName = (stop: ShownJourneyStop, i: number) =>
  stop.title ?? stop.place?.name ?? `Event ${i + 1}`
