import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  bookArt,
  seriesArt,
  useVisiblePlanets,
  worldArt,
} from '../components/browse/art'
import { BrowseList } from '../components/browse/BrowseList'
import type { Category, Grouping } from '../components/browse/types'
import { bookSeries, books, seriesOf } from '../data/books'
import {
  entryBooks,
  entryRevealedIn,
  type EntryKind,
} from '../data/entryStories'
import type { Reveal } from '../data/types'
import { useCanSee } from '../state/reveal'
import { fold } from './listHelpers'

/** An entry on a Culture-style list. */
interface Listed<K extends string> {
  id: string
  name: string
  kind: K
  world?: string
  revealedIn: Reveal
  books: string[]
}

/**
 * A list of entries (Culture, Lifeforms, Events) as cards by type, book,
 * world and series, with every name A–Z one click away.
 */
export function EntryList<K extends string, T extends Listed<K>>({
  kind,
  list,
  kindLabels,
  title,
  path,
  noun,
  entry,
}: {
  kind: EntryKind
  list: readonly T[]
  /** Type labels, in the order their groups appear. */
  kindLabels: Record<K, string>
  title: string
  /** Where entry pages live, e.g. 'culture' for /culture/:id. */
  path: string
  /** What the name filter filters, e.g. 'culture' or 'events'. */
  noun: string
  /** What one entry is called, for counts. */
  entry: { one: string; many: string }
}) {
  const canSee = useCanSee()
  const planets = useVisiblePlanets()

  // A–Z, whatever order the data comes in: the member and A–Z pages list in it.
  const shown = useMemo(
    () =>
      list
        .filter((c) => canSee(entryRevealedIn(kind, c)))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [canSee, kind, list],
  )

  const groupings = useMemo((): Grouping<T>[] => {
    const kindOrder: string[] = Object.keys(kindLabels)
    return [
      {
        id: 'type',
        label: 'Type',
        all: 'All types',
        categories: (c) => [
          [c.kind, kindLabels[c.kind], kindOrder.indexOf(c.kind)],
        ],
      },
      {
        id: 'book',
        label: 'Book',
        all: 'All books',
        categories: (c) => {
          const read = entryBooks(kind, c, canSee)
          return books
            .map((b, i): Category => [b.id, b.title, i])
            .filter(([id]) => read.includes(id))
        },
        art: bookArt,
      },
      {
        id: 'world',
        label: 'World',
        all: 'All worlds',
        biggestFirst: true,
        categories: (c) => {
          const planet = c.world ? planets.get(c.world) : undefined
          return planet ? [[planet.id, planet.name, 0]] : []
        },
        art: worldArt(planets),
      },
      {
        id: 'series',
        label: 'Series',
        all: 'All series',
        categories: (c) => {
          const ids = new Set(
            entryBooks(kind, c, canSee).map((b) => seriesOf(b)?.id),
          )
          return bookSeries
            .map((s, i): Category => [s.id, s.name, i])
            .filter(([id]) => ids.has(id))
        },
        art: seriesArt,
      },
    ]
  }, [canSee, kind, kindLabels, planets])

  return (
    <BrowseList
      path={`/${path}`}
      title={title}
      noun={entry}
      icon={kind}
      items={shown}
      hidden={list.length - shown.length}
      groupings={groupings}
      match={(c, needle) => fold(c.name).includes(needle)}
      row={(c) => <Link to={`/${path}/${c.id}`}>{c.name}</Link>}
      filterLabel={`Filter ${noun} by name`}
      noMatch="Nothing matches."
    />
  )
}
