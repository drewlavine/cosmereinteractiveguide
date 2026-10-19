import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { abilityKindLabels, abilityList } from '../data/abilities'
import { bookSeries, seriesOf } from '../data/books'
import { systems } from '../data/systems'
import type { ListedAbility } from '../data/types'
import { entryBooks, entryRevealedIn, shownAliases } from '../data/entryStories'
import { useCanSee } from '../state/reveal'
import { GroupJump, LetterJump } from '../components/ListJump'
import { anchorFor, byLetter, fold, plural } from './listHelpers'

const anchor = (id: string) => anchorFor('abilities', id)

const kindOrder = Object.keys(abilityKindLabels)

const groupings = [
  { id: 'type', label: 'Type' },
  { id: 'system', label: 'Magic system' },
  { id: 'world', label: 'World' },
  { id: 'shard', label: 'Shard' },
  { id: 'series', label: 'Series' },
] as const
type GroupingId = (typeof groupings)[number]['id']

const isGrouping = (id: string | null): id is GroupingId =>
  groupings.some((g) => g.id === id)

interface Group {
  id: string
  name: string
  items: ListedAbility[]
}

export function AbilityList() {
  const canSee = useCanSee()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const groupParam = params.get('group')
  const grouping = isGrouping(groupParam) ? groupParam : undefined

  const shown = useMemo(
    () => abilityList.filter((a) => canSee(entryRevealedIn('ability', a))),
    [canSee],
  )
  const shownById = useMemo(() => new Map(shown.map((a) => [a.id, a])), [shown])
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

  // An entry matched only by another name shows that name too (Coinshot).
  const aliasHit = (a: ListedAbility) =>
    query && !fold(a.name).includes(query)
      ? shownAliases('ability', a, canSee).find((x) =>
          fold(x.name).includes(query),
        )?.name
      : undefined
  const matches = shown.filter(
    (a) => !query || fold(a.name).includes(query) || aliasHit(a),
  )
  const hidden = abilityList.length - shown.length

  // Categories an ability falls under, as [id, name, order]; only what the
  // reader may see is used.
  const categories = (a: ListedAbility): [string, string, number][] => {
    switch (grouping) {
      case 'type':
        return [[a.kind, abilityKindLabels[a.kind], kindOrder.indexOf(a.kind)]]
      case 'system': {
        const ids =
          a.kind === 'system'
            ? [a.id]
            : (a.systems ?? [])
                .filter((t) => canSee(t.revealedIn))
                .map((t) => t.id)
        return ids.flatMap((id): [string, string, number][] => {
          const system = shownById.get(id)
          return system ? [[system.id, system.name, 0]] : []
        })
      }
      case 'world': {
        const name = a.world && planets.get(a.world)
        return name && a.world ? [[a.world, name, 0]] : []
      }
      case 'shard':
        return (a.shards ?? [])
          .filter((s) => canSee(s.revealedIn))
          .map((s) => [s.name, s.name, 0])
      case 'series': {
        const ids = new Set(
          entryBooks('ability', a, canSee).map((b) => seriesOf(b)?.id),
        )
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
    for (const a of matches) {
      const cats = categories(a)
      if (cats.length === 0) unsorted++
      for (const [id, name, order] of cats) {
        const group = groupsById.get(id) ?? { id, name, order, items: [] }
        group.items.push(a)
        groupsById.set(id, group)
      }
    }
    // Types and series in their own order; the rest biggest first.
    groups = [...groupsById.values()].sort(
      (a, b) =>
        a.order - b.order ||
        (grouping === 'type' || grouping === 'series'
          ? 0
          : b.items.length - a.items.length) ||
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
      className="character-list ability-list"
      aria-labelledby="abilities-title"
    >
      <h1 id="abilities-title">Magic</h1>
      <p className="character-count">
        {matches.length < shown.length
          ? `${matches.length} of ${shown.length} entries`
          : `${shown.length} entries`}
        {hidden > 0 && ` · ${hidden} hidden based on books you've read`}
      </p>

      <div className="character-filters">
        <input
          type="search"
          className="character-filter-input"
          placeholder="Filter by name…"
          aria-label="Filter abilities by name"
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
            {items.map((a) => (
              <li key={a.id}>
                <Link to={`/magic/${a.id}`}>{a.name}</Link>
                {aliasHit(a) && (
                  <span className="list-alias"> ({aliasHit(a)})</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
