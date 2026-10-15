import { useEffect } from 'react'
import { books, bookSeries, type Book, type BookSeries } from '../data/books'
import { chapters, type Chapter } from '../data/chapters'
import { useBooksRead } from '../state/booksRead'

const allBookIds = books.map((book) => book.id)

/** Header button that opens the reader's "Books Read" checklist. */
export function BooksReadSettings() {
  const { read, chosen, setBooks, confirm, dialogRef } = useBooksRead()
  const readCount = allBookIds.filter((id) => read.has(id)).length

  // First-time visitors are asked straight away.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !chosen && !dialog.open) dialog.showModal()
  }, [chosen, dialogRef])

  return (
    <>
      <button
        type="button"
        className="books-read-button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <BookIcon />
        Books Read
        <span className="books-read-count" aria-hidden>
          {readCount}/{allBookIds.length}
        </span>
        <span className="visually-hidden">
          , {readCount} of {allBookIds.length} read
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="books-read-dialog"
        aria-labelledby="books-read-title"
        // Closing counts as a choice, even with nothing ticked, so we don't nag.
        onClose={() => !chosen && confirm()}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
      >
        <div className="books-read-panel">
          <header className="books-read-header">
            <h2 id="books-read-title">Books Read</h2>
            <p>
              Tick the Cosmere books you have finished. For a book you're
              partway through, choose Reading and the last chapter you finished.
              The guide uses this to keep spoilers out of sight.
            </p>
            <div className="books-read-actions">
              <button type="button" onClick={() => setBooks(allBookIds, true)}>
                Select all
              </button>
              <button type="button" onClick={() => setBooks(allBookIds, false)}>
                Clear all
              </button>
            </div>
          </header>

          <div className="books-read-list">
            {bookSeries.map((series) => (
              <SeriesGroup key={series.id} series={series} />
            ))}
          </div>

          <footer className="books-read-footer">
            <span>
              {readCount} of {allBookIds.length} read
            </span>
            <button
              type="button"
              className="books-read-done"
              onClick={() => dialogRef.current?.close()}
            >
              Done
            </button>
          </footer>
        </div>
      </dialog>
    </>
  )
}

function SeriesGroup({ series }: { series: BookSeries }) {
  const { read, setBooks } = useBooksRead()
  const ids = series.books.map((book) => book.id)
  const readCount = ids.filter((id) => read.has(id)).length
  const all = readCount === ids.length

  return (
    <fieldset className="books-read-series">
      <legend>
        {ids.length > 1 ? (
          <label>
            <input
              type="checkbox"
              aria-label={`All of ${series.name}`}
              checked={all}
              ref={(input) => {
                if (input) input.indeterminate = readCount > 0 && !all
              }}
              onChange={(event) => setBooks(ids, event.target.checked)}
            />
            {series.name}
          </label>
        ) : (
          series.name
        )}
        <span className="books-read-series-count">
          {readCount}/{ids.length}
        </span>
      </legend>
      <ul>
        {series.books.map((book) => (
          <BookRow key={book.id} book={book} />
        ))}
      </ul>
    </fieldset>
  )
}

function BookRow({ book }: { book: Book }) {
  const { read, reading, setBooks, setReading } = useBooksRead()
  const isReading = reading.has(book.id)

  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={read.has(book.id)}
          onChange={(event) => setBooks([book.id], event.target.checked)}
        />
        <span className="books-read-title">{book.title}</span>
        <span className="books-read-meta">
          {[book.number && `#${book.number}`, book.kind, book.year]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </label>
      {chapters[book.id] && (
        <button
          type="button"
          className="books-read-reading"
          aria-pressed={isReading}
          aria-label={`Reading ${book.title}`}
          onClick={() =>
            isReading ? setBooks([book.id], false) : setReading(book.id, null)
          }
        >
          Reading
        </button>
      )}
      {isReading && (
        <ChapterPicker
          book={book}
          chapter={reading.get(book.id) ?? null}
          onChange={(chapter) => setReading(book.id, chapter)}
        />
      )}
    </li>
  )
}

/** Chapters grouped by part, keeping reading order. */
function chapterGroups(list: readonly Chapter[]) {
  const groups: { part?: string; chapters: Chapter[] }[] = []
  for (const chapter of list) {
    const last = groups.at(-1)
    if (last && last.part === chapter.part) last.chapters.push(chapter)
    else groups.push({ part: chapter.part, chapters: [chapter] })
  }
  return groups
}

function ChapterPicker({
  book,
  chapter,
  onChange,
}: {
  book: Book
  chapter: string | null
  onChange: (chapter: string | null) => void
}) {
  const options = (list: Chapter[]) =>
    list.map((c) => (
      <option key={c.id} value={c.id}>
        {c.label}
      </option>
    ))

  return (
    <label className="books-read-chapter">
      Last chapter finished
      <select
        value={chapter ?? ''}
        aria-label={`Last chapter finished in ${book.title}`}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">None yet</option>
        {chapterGroups(chapters[book.id] ?? []).map((group) =>
          group.part ? (
            <optgroup key={group.chapters[0].id} label={group.part}>
              {options(group.chapters)}
            </optgroup>
          ) : (
            options(group.chapters)
          ),
        )}
      </select>
    </label>
  )
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
      <path d="M12 6.5v13" />
    </svg>
  )
}
