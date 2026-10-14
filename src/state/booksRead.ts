import { createContext, useContext } from 'react'

export const BOOKS_READ_KEY = 'cosmere-guide:books-read'

export interface BooksRead {
  /** Ids of the books the reader has finished. */
  read: ReadonlySet<string>
  /** False until the reader has made a choice, even "none yet". */
  chosen: boolean
  hasRead: (bookId: string) => boolean
  /** Mark books read or unread. */
  setBooks: (bookIds: string[], isRead: boolean) => void
  /** Record the current selection as the reader's choice. */
  confirm: () => void
}

export const BooksReadContext = createContext<BooksRead | null>(null)

export function useBooksRead() {
  const context = useContext(BooksReadContext)
  if (!context)
    throw new Error('useBooksRead must be used inside BooksReadProvider')
  return context
}

/** The saved selection, or null if the reader has never chosen. */
export function loadBooksRead(): string[] | null {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(BOOKS_READ_KEY) ?? 'null',
    )
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === 'string')
      : null
  } catch {
    return null
  }
}

export function saveBooksRead(bookIds: Iterable<string>) {
  try {
    localStorage.setItem(BOOKS_READ_KEY, JSON.stringify([...bookIds]))
  } catch {
    // Private browsing or full storage: the choice lasts for this visit only.
  }
}
