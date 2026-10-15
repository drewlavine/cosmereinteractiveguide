import { chapters } from './chapters'
import type { RevealPoint } from './types'

/** How far the reader has got through the books. */
export interface ReadingProgress {
  /** Ids of the books the reader has finished. */
  read: ReadonlySet<string>
  /**
   * Books the reader is partway through, with the id of the last chapter
   * they've finished, or null if they haven't finished one yet.
   */
  reading: ReadonlyMap<string, string | null>
}

const chapterOrder = new Map<string, ReadonlyMap<string, number>>()

/** Position of a chapter in its book, or undefined if it isn't listed. */
export function chapterIndex(bookId: string, chapterId: string) {
  let order = chapterOrder.get(bookId)
  if (!order) {
    order = new Map((chapters[bookId] ?? []).map((c, i) => [c.id, i]))
    chapterOrder.set(bookId, order)
  }
  return order.get(chapterId)
}

export const chapterLabel = (bookId: string, chapterId: string) =>
  chapters[bookId]?.find((c) => c.id === chapterId)?.label

/** Whether the reader has got as far as this point in the books. */
export function hasReached(progress: ReadingProgress, point: RevealPoint) {
  if (typeof point === 'string') return progress.read.has(point)
  if (progress.read.has(point.book)) return true
  const at = progress.reading.get(point.book)
  if (at == null) return false
  const reached = chapterIndex(point.book, at)
  const needed = chapterIndex(point.book, point.chapter)
  // Unknown chapters stay hidden rather than risk a spoiler.
  return reached !== undefined && needed !== undefined && needed <= reached
}
