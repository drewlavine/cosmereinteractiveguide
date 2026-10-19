import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FeatureLegend, FeatureLinks } from '../components/PageFeatures'
import { books, bookSeries, seriesOf } from '../data/books'
import { shownBooks } from '../data/entryStories'
import {
  listedKindLabels,
  listedLocations as locationList,
  placeHref,
  placeKnownIn,
  placeRevealedIn,
} from '../data/listedLocations'
import { featureGroups, featuresFor, featuresOf } from '../data/pageFeatures'
import { systems } from '../data/systems'
import type { ListedLocation } from '../data/types'
import { useCanSee } from '../state/reveal'
import { GroupJump, LetterJump } from '../components/ListJump'
import { anchorFor, byLetter, fold, plural } from './listHelpers'

const anchor = (id: string) => anchorFor('locations', id)

const kindOrder = Object.keys(listedKindLabels)

const groupings = [
  { id: 'type', label: 'Type' },
  { id: 'book', label: 'Book' },
  { id: 'world', label: 'World' },
  { id: 'series', label: 'Series' },
  { id: 'inside', label: 'Inside' },
  { id: 'feature', label: 'Page feature' },
] as const
type GroupingId = (typeof groupings)[number]['id']

const isGrouping = (id: string | null): id is GroupingId =>
  groupings.some((g) => g.id === id)

interface Group {
  id: string
  name: string
  items: ListedLocation[]
}

const byId = new Map(locationList.map((l) => [l.id, l]))

export function LocationList() {
  const canSee = useCanSee()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const groupParam = params.get('group')
  const grouping = isGrouping(groupParam) ? groupParam : undefined

  const shown = useMemo(
    () => locationList.filter((l) => canSee(placeRevealedIn(l))),
    [canSee],
  )
  const shownIds = useMemo(() => new Set(shown.map((l) => l.id)), [shown])
  const featuresById = useMemo(
    () =>
      new Map(shown.map((l) => [l.id, featuresOf('location', l, { canSee })])),
    [shown, canSee],
  )
  // The legend explains the icons any listed place has.
  const legend = useMemo(() => {
    const found = [...featuresById.values()].flat()
    return featuresFor('location').filter((f) =>
      found.some((x) => x.feature === f),
    )
  }, [featuresById])
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

  const booksById = useMemo(
    () =>
      new Map(
        shown.map((l) => [
          l.id,
          shownBooks(l.books, placeRevealedIn(l), canSee),
        ]),
      ),
    [shown, canSee],
  )
  const matches = shown.filter((l) => !query || fold(l.name).includes(query))
  const hidden = locationList.length - shown.length

  const parentOf = (l: ListedLocation) => {
    const parent = l.parentId ? byId.get(l.parentId) : undefined
    return parent && shownIds.has(parent.id) ? parent : undefined
  }
  // Categories a place falls under, as [id, name, order]; only what the
  // reader may see is used.
  const categories = (l: ListedLocation): [string, string, number][] => {
    // A place only named so far isn't sorted by what it is or where.
    const known = canSee(placeKnownIn(l))
    if (!known && grouping !== 'book' && grouping !== 'series') return []
    switch (grouping) {
      case 'type':
        return [[l.kind, listedKindLabels[l.kind], kindOrder.indexOf(l.kind)]]
      case 'book': {
        const read = booksById.get(l.id) ?? []
        return books
          .map((b, i): [string, string, number] => [b.id, b.title, i])
          .filter(([id]) => read.includes(id))
      }
      case 'world': {
        const name = l.world && planets.get(l.world)
        return name && l.world ? [[l.world, name, 0]] : []
      }
      case 'series': {
        const ids = new Set(
          l.books.filter((b) => canSee([b])).map((b) => seriesOf(b)?.id),
        )
        return bookSeries
          .map((s, i): [string, string, number] => [s.id, s.name, i])
          .filter(([id]) => ids.has(id))
      }
      case 'inside': {
        const parent = parentOf(l)
        return parent ? [[parent.id, parent.name, 0]] : []
      }
      case 'feature':
        return featureGroups('location', featuresById.get(l.id) ?? [])
      default:
        return []
    }
  }

  let groups: Group[]
  let unsorted = 0
  if (grouping) {
    const groupsById = new Map<string, Group & { order: number }>()
    for (const l of matches) {
      const cats = categories(l)
      if (cats.length === 0) unsorted++
      for (const [id, name, order] of cats) {
        const group = groupsById.get(id) ?? { id, name, order, items: [] }
        group.items.push(l)
        groupsById.set(id, group)
      }
    }
    // Types, books, series and features in their own order; the rest biggest first.
    groups = [...groupsById.values()].sort(
      (a, b) =>
        a.order - b.order ||
        (grouping === 'type' ||
        grouping === 'book' ||
        grouping === 'series' ||
        grouping === 'feature'
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

  const hrefOf = (l: ListedLocation) => placeHref(l, (id) => planets.has(id))

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
      className="character-list location-list"
      aria-labelledby="locations-title"
    >
      <h1 id="locations-title">Locations</h1>
      <p className="character-count">
        {matches.length < shown.length
          ? `${matches.length} of ${shown.length} places`
          : `${shown.length} places`}
        {hidden > 0 && ` · ${hidden} hidden based on books you've read`}
      </p>

      <div className="character-filters">
        <input
          type="search"
          className="character-filter-input"
          placeholder="Filter by name…"
          aria-label="Filter locations by name"
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
      <FeatureLegend features={legend} />

      {!grouping && <LetterJump groups={groups} anchor={anchor} />}
      {unsorted > 0 && (
        <p className="character-count">
          {plural(unsorted, 'more place')} not sorted by {label}.
        </p>
      )}
      {matches.length === 0 && <p>No places match.</p>}
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
            {items.map((l) => (
              <li key={l.id}>
                <Link to={hrefOf(l)}>{l.name}</Link>
                <FeatureLinks
                  name={l.name}
                  href={hrefOf(l)}
                  features={featuresById.get(l.id) ?? []}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
