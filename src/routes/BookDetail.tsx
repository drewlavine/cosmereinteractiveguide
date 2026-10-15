import { Link, useParams } from 'react-router'
import { bookMeta, findBook, seriesOf } from '../data/books'
import { NotFound } from './NotFound'

const coppermindSearch = (title: string) =>
  `https://coppermind.net/wiki/Special:Search?go=Go&search=${encodeURIComponent(title)}`

export function BookDetail() {
  const { bookId } = useParams()
  const book = findBook(bookId)

  if (!book) return <NotFound />
  const series = seriesOf(book.id)

  return (
    <article className="character-detail" aria-labelledby="book-title">
      <h1 id="book-title">{book.title}</h1>
      <p className="character-count">
        {series && `${series.name} · `}
        {bookMeta(book)}
      </p>
      <p>Details coming soon.</p>
      <p>
        <a href={coppermindSearch(book.title)} target="_blank" rel="noreferrer">
          Read about {book.title} on the Coppermind
        </a>
      </p>
      <Link to="/books">Back to all books</Link>
    </article>
  )
}
