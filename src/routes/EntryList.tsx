import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { bookSeries, books, seriesOf } from '../data/books'
import { systems } from '../data/systems'
import type { Reveal } from '../data/types'
import {
  entryBooks,
  entryRevealedIn,
  type EntryKind,
} from '../data/entryStories'
import { useCanSee } from '../state/reveal'
import { GroupJump, LetterJump } from '../components/ListJump'
import { anchorFor, byLetter, fold, plural } from './listHelpers'

const groupings = [
  { id: 'type', label: 'Type' },
  { id: 'book', label: 'Book' },
  { id: 'world', label: 'World' },
  { id: 'series', label: 'Series' },
] as const
type GroupingId = (typeof groupings)[number]['id']

const isGrouping = (id: string | null): id is GroupingId =>
  groupings.some((g) => g.id === id)

/** An entry on a Culture-style list. */
interface Listed<K extends string> {
  id: string
  name: string
  kind: K
  world?: string
  revealedIn: Reveal
  books: string[]
}

interface Group<T> {
  id: string
  name: string
  items: T[]
}

/**
 * A list of entries that can be grouped by type, book, world or series, or
 * shown A–Z, with the choice saved in the URL (Culture, Events).
 */
export function EntryList<K extends string, T extends Listed<K>>({
  kind,
  list,
  kindLabels,
  title,
  path,
  noun,
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
}) {
  const anchor = (id: string) => anchorFor(path, id)
  const kindOrder: string[] = Object.keys(kindLabels)
  const canSee = useCanSee()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const groupParam = params.get('group')
  // Grouped by type unless the reader picks Name (A–Z).
  const grouping =
    groupParam === null
      ? 'type'
      : isGrouping(groupParam)
        ? groupParam
        : undefined

  const shown = useMemo(
    () => list.filter((c) => canSee(entryRevealedIn(kind, c))),
    [canSee, kind, list],
  )
  const planets = useMemo(
    () =>
      new Map(
        systems
          .flatMap((s) => s.planets)
          .filter((p) => canSee(p.revealedIn))
          .map((p) => [p.id, p.name]),
      ),
    [canSee],
  )

  const matches = shown.filter((c) => !query || fold(c.name).includes(query))
  const hidden = list.length - shown.length

  // Categories an entry falls under, as [id, name, order]; only what the
  // reader may see is used.
  const categories = (c: T): [string, string, number][] => {
    const read = entryBooks(kind, c, canSee)
    switch (grouping) {
      case 'type':
        return [[c.kind, kindLabels[c.kind], kindOrder.indexOf(c.kind)]]
      case 'book':
        return books
          .map((b, i): [string, string, number] => [b.id, b.title, i])
          .filter(([id]) => read.includes(id))
      case 'world': {
        const name = c.world && planets.get(c.world)
        return name && c.world ? [[c.world, name, 0]] : []
      }
      case 'series': {
        const ids = new Set(read.map((b) => seriesOf(b)?.id))
        return bookSeries
          .map((s, i): [string, string, number] => [s.id, s.name, i])
          .filter(([id]) => ids.has(id))
      }
      default:
        return []
    }
  }

  let groups: Group<T>[]
  let unsorted = 0
  if (grouping) {
    const groupsById = new Map<string, Group<T> & { order: number }>()
    for (const c of matches) {
      const cats = categories(c)
      if (cats.length === 0) unsorted++
      for (const [id, name, order] of cats) {
        const group = groupsById.get(id) ?? { id, name, order, items: [] }
        group.items.push(c)
        groupsById.set(id, group)
      }
    }
    // Worlds biggest first; the rest in their own order.
    groups = [...groupsById.values()].sort(
      (a, b) =>
        a.order - b.order ||
        (grouping === 'world' ? b.items.length - a.items.length : 0) ||
        a.name.localeCompare(b.name),
    )
  } else
    groups = byLetter(matches).map((g) => ({
      id: g.letter,
      name: g.letter,
      items: g.items,
    }))

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
  const label = groupings.find((g) => g.id === grouping)?.label.toLowerCase()

  return (
    <article
      className={`character-list ${path}-list`}
      aria-labelledby={`${path}-title`}
    >
      <h1 id={`${path}-title`}>{title}</h1>
      <p className="character-count">
        {matches.length < shown.length
          ? `${matches.length} of ${plural(shown.length, 'entry', 'entries')}`
          : plural(shown.length, 'entry', 'entries')}
        {hidden > 0 && ` · ${hidden} hidden based on what you've read so far`}
      </p>

      <div className="character-filters">
        <input
          type="search"
          className="character-filter-input"
          placeholder="Filter by name…"
          aria-label={`Filter ${noun} by name`}
          value={params.get('q') ?? ''}
          onChange={(event) => setParam('q', event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <label className="character-group-by">
          Group by
          <select
            value={grouping ?? 'name'}
            onChange={(event) =>
              setParam(
                'group',
                event.target.value === 'type' ? '' : event.target.value,
              )
            }
          >
            <option value="name">Name (A–Z)</option>
            {groupings.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        {grouping && label && (
          <GroupJump groups={groups} anchor={anchor} label={label} />
        )}
      </div>

      {!grouping && <LetterJump groups={groups} anchor={anchor} />}
      {unsorted > 0 && (
        <p className="character-count">
          {plural(unsorted, 'more entry', 'more entries')} not sorted by {label}
          .
        </p>
      )}
      {matches.length === 0 && <p>Nothing matches.</p>}
      {groups.map(({ id, name, items }) => (
        <section
          key={id}
          className="character-group"
          aria-labelledby={anchor(id)}
        >
          <h2 id={anchor(id)} data-count={grouping ? items.length : undefined}>
            {name}
          </h2>
          <ul>
            {items.map((c) => (
              <li key={c.id}>
                <Link to={`/${path}/${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
