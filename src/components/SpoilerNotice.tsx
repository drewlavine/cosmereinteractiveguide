import { Fragment } from 'react'
import { books } from '../data/books'
import { useBooksRead } from '../state/booksRead'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

/**
 * "Spoilers for (books)" with a button that shows a system's hidden details
 * anyway, or hides them again. Renders nothing when nothing is hidden.
 */
export function SpoilerNotice({
  systemId,
  spoilers,
}: {
  systemId: string
  spoilers: string[]
}) {
  const { viewAnyway, setViewAnyway } = useBooksRead()
  if (!spoilers.length) return null
  const showing = viewAnyway.has(systemId)

  return (
    <aside
      className={`spoiler-notice${showing ? ' is-showing' : ''}`}
      aria-label="Spoilers"
    >
      <p>
        {showing ? 'Showing spoilers' : 'Spoilers hidden'} for{' '}
        {spoilers.map((id, i) => (
          <Fragment key={id}>
            {i > 0 && (i === spoilers.length - 1 ? ' and ' : ', ')}
            <cite>{bookTitle(id)}</cite>
          </Fragment>
        ))}
        .
      </p>
      <button type="button" onClick={() => setViewAnyway(systemId, !showing)}>
        {showing ? 'Hide again' : 'View anyway'}
      </button>
    </aside>
  )
}
