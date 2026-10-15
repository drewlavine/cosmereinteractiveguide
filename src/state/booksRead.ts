import { createContext, useContext, type RefObject } from 'react'
import type { ReadingProgress } from '../data/progress'

export const BOOKS_READ_KEY = 'cosmere-guide:books-read'

export interface BooksRead extends ReadingProgress {
  /** False until the reader has made a choice, even "none yet". */
  chosen: boolean
  hasRead: (bookId: string) => boolean
  /** Mark books read or unread. Either way they stop being "reading". */
  setBooks: (bookIds: string[], isRead: boolean) => void
  /**
   * Mark a book as being read, up to and including `chapter` (null if the
   * reader hasn't finished a chapter yet).
   */
  setReading: (bookId: string, chapter: string | null) => void
  /** Record the current selection as the reader's choice. */
  confirm: () => void
  /**
   * What the reader chose to see spoilers for this visit: system ids, or
   * e.g. `character:kaladin`.
   */
  viewAnyway: ReadonlySet<string>
  setViewAnyway: (scope: string, on: boolean) => void
  /** The Books Read dialog, so other parts of the page can open it. */
  dialogRef: RefObject<HTMLDialogElement | null>
}

export const BooksReadContext = createContext<BooksRead | null>(null)

export function useBooksRead() {
  const context = useContext(BooksReadContext)
  if (!context)
    throw new Error('useBooksRead must be used inside BooksReadProvider')
  return context
}

/** What's kept in the browser between visits. */
export interface SavedProgress {
  read: string[]
  reading: Record<string, string | null>
}

const isChapter = (value: unknown) =>
  value === null || typeof value === 'string'

/** The saved progress, or null if the reader has never chosen. */
export function loadBooksRead(): SavedProgress | null {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(BOOKS_READ_KEY) ?? 'null',
    )
    const ids = (list: unknown) =>
      Array.isArray(list)
        ? list.filter((id): id is string => typeof id === 'string')
        : []
    // Version 1 was a plain list of finished books.
    if (Array.isArray(saved)) return { read: ids(saved), reading: {} }
    if (!saved || typeof saved !== 'object') return null
    const { read, reading } = saved as Record<string, unknown>
    return {
      read: ids(read),
      reading: Object.fromEntries(
        Object.entries(
          reading && typeof reading === 'object' ? reading : {},
        ).filter(([, chapter]) => isChapter(chapter)),
      ) as SavedProgress['reading'],
    }
  } catch {
    return null
  }
}

export function saveBooksRead(progress: SavedProgress) {
  try {
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify({ version: 2, ...progress }),
    )
  } catch {
    // Private browsing or full storage: the choice lasts for this visit only.
  }
}
