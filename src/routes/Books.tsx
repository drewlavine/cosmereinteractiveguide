import { Link } from 'react-router'
import { bookMeta, books, bookSeries } from '../data/books'
import { chapterLabel } from '../data/progress'
import { useBooksRead } from '../state/booksRead'

export function Books() {
  const { hasRead, reading } = useBooksRead()
  const readCount = books.filter((b) => hasRead(b.id)).length
  const readingBadge = (bookId: string) => {
    const chapter = reading.get(bookId)
    const label = chapter && chapterLabel(bookId, chapter)
    return label ? `Reading · up to ${label}` : 'Reading'
  }

  return (
    <article className="book-index" aria-labelledby="books-title">
      <h1 id="books-title">Books</h1>
      <p className="character-count">
        {books.length} books · {readCount} read
        {reading.size > 0 && ` · ${reading.size} in progress`}
      </p>

      {bookSeries.map((series) => (
        <section
          key={series.id}
          className="book-series"
          aria-labelledby={`series-${series.id}`}
        >
          <h2 id={`series-${series.id}`}>{series.name}</h2>
          <ul>
            {series.books.map((book) => (
              <li key={book.id}>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
                <span className="book-meta">{bookMeta(book)}</span>
                {hasRead(book.id) && (
                  <span className="book-read-badge">Read</span>
                )}
                {reading.has(book.id) && (
                  <span className="book-read-badge">
                    {readingBadge(book.id)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
