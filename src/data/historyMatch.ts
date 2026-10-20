import type { BookSource } from './types'
import { chapters } from './chapters'

/** How many chapters apart an event and a paragraph may be and still match. */
const NEAR = 4

/**
 * The History paragraph telling more about an event that happened in a
 * chapter: the one from that chapter, or else the nearest one in the same
 * book within a few chapters. Undefined when none is close.
 */
export function historyParagraphFor(
  where: { bookId: string; chapter?: string } | undefined,
  paragraphs: readonly { id: string; books: readonly BookSource[] }[],
): string | undefined {
  if (!where) return undefined
  const order = chapters[where.bookId] ?? []
  const at = (chapter?: string) => order.findIndex((c) => c.id === chapter)
  const target = at(where.chapter)
  let best: { id: string; distance: number } | undefined
  for (const { id, books } of paragraphs)
    for (const s of books) {
      if (s.bookId !== where.bookId) continue
      if (s.chapter === where.chapter) return id
      const here = at(s.chapter)
      if (target < 0 || here < 0) continue
      const distance = Math.abs(here - target)
      if (distance <= NEAR && (!best || distance < best.distance))
        best = { id, distance }
    }
  return best?.id
}
