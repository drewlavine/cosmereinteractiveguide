import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  BooksReadContext,
  loadBooksRead,
  saveBooksRead,
  type BooksRead,
} from '../state/booksRead'

/** Holds the reader's progress through the books, saved in this browser. */
export function BooksReadProvider({ children }: { children: ReactNode }) {
  // null until the reader makes a choice, so first-time visitors get asked.
  const [saved, setSaved] = useState(loadBooksRead)
  const [viewAnyway, setViewAnyway] = useState<ReadonlySet<string>>(new Set())
  const dialogRef = useRef<HTMLDialogElement>(null)

  const value = useMemo<BooksRead>(() => {
    const read = new Set(saved?.read)
    const reading = new Map(Object.entries(saved?.reading ?? {}))
    const commit = (nextRead: Set<string>, nextReading: typeof reading) => {
      const progress = {
        read: [...nextRead],
        reading: Object.fromEntries(nextReading),
      }
      saveBooksRead(progress)
      setSaved(progress)
    }
    return {
      read,
      reading,
      chosen: saved !== null,
      hasRead: (bookId) => read.has(bookId),
      setBooks: (bookIds, isRead) => {
        const nextRead = new Set(read)
        const nextReading = new Map(reading)
        for (const id of bookIds) {
          nextReading.delete(id)
          if (isRead) nextRead.add(id)
          else nextRead.delete(id)
        }
        commit(nextRead, nextReading)
      },
      setReading: (bookId, chapter) => {
        const nextRead = new Set(read)
        nextRead.delete(bookId)
        commit(nextRead, new Map(reading).set(bookId, chapter))
      },
      confirm: () => commit(read, reading),
      viewAnyway,
      setViewAnyway: (scope, on) =>
        setViewAnyway((current) => {
          const next = new Set(current)
          if (on) next.add(scope)
          else next.delete(scope)
          return next
        }),
      dialogRef,
    }
  }, [saved, viewAnyway])

  return (
    <BooksReadContext.Provider value={value}>
      {children}
    </BooksReadContext.Provider>
  )
}
