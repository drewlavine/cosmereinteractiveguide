import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  BooksReadContext,
  loadBooksRead,
  saveBooksRead,
  type BooksRead,
} from '../state/booksRead'

/** Holds the reader's finished books, saved in this browser. */
export function BooksReadProvider({ children }: { children: ReactNode }) {
  // null until the reader makes a choice, so first-time visitors get asked.
  const [saved, setSaved] = useState(loadBooksRead)
  const [viewAnyway, setViewAnyway] = useState<ReadonlySet<string>>(new Set())
  const dialogRef = useRef<HTMLDialogElement>(null)

  const value = useMemo<BooksRead>(() => {
    const read = new Set(saved ?? [])
    const commit = (next: Set<string>) => {
      saveBooksRead(next)
      setSaved([...next])
    }
    return {
      read,
      chosen: saved !== null,
      hasRead: (bookId) => read.has(bookId),
      setBooks: (bookIds, isRead) => {
        const next = new Set(read)
        for (const id of bookIds) {
          if (isRead) next.add(id)
          else next.delete(id)
        }
        commit(next)
      },
      confirm: () => commit(read),
      viewAnyway,
      setViewAnyway: (systemId, on) =>
        setViewAnyway((current) => {
          const next = new Set(current)
          if (on) next.add(systemId)
          else next.delete(systemId)
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
