import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { bookSeries, seriesOf } from '../data/books'
import { people as characters } from '../data/people'
import {
  findPersona,
  hasMet,
  metIn,
  revealCharacter,
  seenThrough,
} from '../data/reveal'
import type { Character } from '../data/types'
import { useCanSee } from '../state/reveal'

// First letter without accents, or "#" for names that start with a digit etc.
const letterOf = (name: string) => {
  const letter = name.normalize('NFD').charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

// The list is already sorted, so each letter's names arrive together.
const byLetter = (list: Character[]) =>
  list.reduce<{ letter: string; items: Character[] }[]>((acc, character) => {
    const letter = letterOf(character.name)
    const last = acc.at(-1)
    if (last?.letter === letter) last.items.push(character)
    else acc.push({ letter, items: [character] })
    return acc
  }, [])

const anchor = (letter: string) =>
  `characters-${letter === '#' ? 'other' : letter.toLowerCase()}`

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

interface Entry {
  character: Character
  /** Every name the reader may know them by, folded for matching. */
  names: string[]
  /** Books the reader has met them in. */
  books: string[]
  /** Whether we know which books they're in yet. */
  sorted: boolean
}

export function CharacterList() {
  const canSee = useCanSee()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const seriesId = params.get('series') ?? ''
  const byBooks = params.get('sort') === 'books'

  // A persona the reader has seen through is listed as the character.
  const listed = useMemo(
    () =>
      characters.filter((c) => {
        const persona = findPersona(c.id)
        return !persona || !seenThrough(persona, canSee)
      }),
    [canSee],
  )
  const met = useMemo(
    () =>
      listed
        .filter((c) => hasMet(c.id, canSee))
        .map((character): Entry => {
          const shown = revealCharacter(character.id, canSee)
          return {
            character,
            names: [
              character.name,
              ...shown.aliases,
              ...shown.personas.map((p) => p.name),
            ].map(fold),
            books: shown.appearsIn.map((a) => a.bookId),
            sorted: metIn(character.id, canSee) !== undefined,
          }
        }),
    [listed, canSee],
  )
  const seriesOptions = useMemo(() => {
    const ids = new Set(met.flatMap((e) => e.books.map((b) => seriesOf(b)?.id)))
    return bookSeries.filter((s) => ids.has(s.id))
  }, [met])

  const matches = met.filter(
    (e) =>
      (!query || e.names.some((n) => n.includes(query))) &&
      (!seriesId || e.books.some((b) => seriesOf(b)?.id === seriesId)),
  )
  const unsorted = seriesId
    ? met.filter(
        (e) => !e.sorted && (!query || e.names.some((n) => n.includes(query))),
      ).length
    : 0
  const groups = byLetter(matches.map((e) => e.character))
  const ranked = [...matches].sort((a, b) => b.books.length - a.books.length)
  const hidden = listed.length - met.length

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  return (
    <article className="character-list" aria-labelledby="characters-title">
      <h1 id="characters-title">Characters</h1>
      <p className="character-count">
        {matches.length < met.length
          ? `${matches.length} of ${met.length} characters`
          : `${met.length} characters`}
        {hidden > 0 && ` · ${hidden} hidden based on books you've read`}
      </p>

      <div className="character-filters">
        <input
          type="search"
          className="character-filter-input"
          placeholder="Filter by name…"
          aria-label="Filter characters by name"
          value={params.get('q') ?? ''}
          onChange={(event) => setParam('q', event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {seriesOptions.length > 0 && (
          <div className="filter-chips" role="group" aria-label="Series">
            {[{ id: '', name: 'All series' }, ...seriesOptions].map((s) => (
              <button
                key={s.id}
                type="button"
                className="filter-chip"
                aria-pressed={seriesId === s.id}
                onClick={() => setParam('series', s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        <div className="filter-chips" role="group" aria-label="Sort">
          <button
            type="button"
            className="filter-chip"
            aria-pressed={!byBooks}
            onClick={() => setParam('sort', '')}
          >
            A–Z
          </button>
          <button
            type="button"
            className="filter-chip"
            aria-pressed={byBooks}
            onClick={() => setParam('sort', 'books')}
          >
            Most books
          </button>
        </div>
      </div>
      {unsorted > 0 && (
        <p className="character-count">
          {unsorted} more characters aren’t sorted by series yet.
        </p>
      )}

      {matches.length === 0 ? (
        <p>No characters match.</p>
      ) : byBooks ? (
        <ol className="character-ranked">
          {ranked.map(({ character, books }) => (
            <li key={character.id}>
              <Link to={`/characters/${character.id}`}>{character.name}</Link>
              {books.length > 0 && (
                <span className="character-first-chapter">
                  {' '}
                  · {books.length} {books.length === 1 ? 'book' : 'books'}
                </span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <>
          <nav aria-label="Jump to letter" className="letter-index">
            {groups.map(({ letter }) => (
              <a key={letter} href={`#${anchor(letter)}`}>
                {letter}
              </a>
            ))}
          </nav>
          {groups.map(({ letter, items }) => (
            <section
              key={letter}
              className="character-group"
              aria-labelledby={anchor(letter)}
            >
              <h2 id={anchor(letter)}>{letter}</h2>
              <ul>
                {items.map((character) => (
                  <li key={character.id}>
                    <Link to={`/characters/${character.id}`}>
                      {character.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </article>
  )
}
