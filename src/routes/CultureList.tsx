import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { bookSeries, books, seriesOf } from '../data/books'
import { cultureKindLabels, cultureList } from '../data/culture'
import { systems } from '../data/systems'
import type { ListedCulture } from '../data/types'
import { entryBooks, entryRevealedIn } from '../data/entryStories'
import { useCanSee } from '../state/reveal'
import { GroupJump, LetterJump } from '../components/ListJump'
import { anchorFor, byLetter, fold, plural } from './listHelpers'

const anchor = (id: string) => anchorFor('culture', id)

const kindOrder = Object.keys(cultureKindLabels)

const groupings = [
  { id: 'type', label: 'Type' },
  { id: 'book', label: 'Book' },
  { id: 'world', label: 'World' },
  { id: 'series', label: 'Series' },
] as const
type GroupingId = (typeof groupings)[number]['id']

const isGrouping = (id: string | null): id is GroupingId =>
  groupings.some((g) => g.id === id)

interface Group {
  id: string
  name: string
  items: ListedCulture[]
}

export function CultureList() {
  const canSee = useCanSee()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const groupParam = params.get('group')
  const grouping = isGrouping(groupParam) ? groupParam : undefined

  const shown = useMemo(
    () => cultureList.filter((c) => canSee(entryRevealedIn('culture', c))),
    [canSee],
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
  const hidden = cultureList.length - shown.length

  // Categories an entry falls under, as [id, name, order]; only what the
  // reader may see is used.
  const categories = (c: ListedCulture): [string, string, number][] => {
    const read = entryBooks('culture', c, canSee)
    switch (grouping) {
      case 'type':
        return [[c.kind, cultureKindLabels[c.kind], kindOrder.indexOf(c.kind)]]
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

  let groups: Group[]
  let unsorted = 0
  if (grouping) {
    const groupsById = new Map<string, Group & { order: number }>()
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
      className="character-list culture-list"
      aria-labelledby="culture-title"
    >
      <h1 id="culture-title">Culture</h1>
      <p className="character-count">
        {matches.length < shown.length
          ? `${matches.length} of ${plural(shown.length, 'entry', 'entries')}`
          : plural(shown.length, 'entry', 'entries')}
        {hidden > 0 && ` · ${hidden} hidden based on books you've read`}
      </p>

      <div className="character-filters">
        <input
          type="search"
          className="character-filter-input"
          placeholder="Filter by name…"
          aria-label="Filter culture by name"
          value={params.get('q') ?? ''}
          onChange={(event) => setParam('q', event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <label className="character-group-by">
          Group by
          <select
            value={grouping ?? ''}
            onChange={(event) => setParam('group', event.target.value)}
          >
            <option value="">Name (A–Z)</option>
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
                <Link to={`/culture/${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
