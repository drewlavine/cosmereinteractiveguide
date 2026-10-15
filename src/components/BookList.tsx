import { Fragment } from 'react'
import { books } from '../data/books'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

/** A row of book titles, left out when the reader has read none of them. */
export function BookList({
  label,
  bookIds,
}: {
  label: string
  bookIds: string[]
}) {
  if (!bookIds.length) return null
  return (
    <>
      <dt>{label}</dt>
      <dd>
        {bookIds.map((id, i) => (
          <Fragment key={id}>
            {i > 0 && ', '}
            <cite>{bookTitle(id)}</cite>
          </Fragment>
        ))}
      </dd>
    </>
  )
}
