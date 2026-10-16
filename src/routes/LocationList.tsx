import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { bookSeries, seriesOf } from '../data/books'
import { listedLocations as locationList } from '../data/listedLocations'
import { findLocation } from '../data/locations'
import { systems } from '../data/systems'
import type { ListedLocation, ListedLocationKind } from '../data/types'
import { useCanSee } from '../state/reveal'
import { anchorFor, byLetter, fold, plural } from './listHelpers'

const anchor = (id: string) => anchorFor('locations', id)

/** Labels for each kind, in the order the Type grouping lists them. */
const listedKindLabels: Record<ListedLocationKind, string> = {
  system: 'Planetary systems',
  planet: 'Planets',
  moon: 'Moons',
  celestial: 'Other celestial bodies',
  continent: 'Continents',
  nation: 'Nations',
  region: 'Regions',
  settlement: 'Cities and towns',
  building: 'Buildings',
  water: 'Seas, lakes and rivers',
  island: 'Islands',
  mountain: 'Mountains',
  forest: 'Forests',
  plain: 'Plains',
  cave: 'Caves',
  perpendicularity: 'Perpendicularities',
  other: 'Other places',
}
const kindOrder = Object.keys(listedKindLabels)

const groupings = [
  { id: 'type', label: 'Type' },
  { id: 'world', label: 'World' },
  { id: 'series', label: 'Series' },
  { id: 'inside', label: 'Inside' },
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

/** Map place for a listed place, if it has one. */
const mapPlaceOf = (l: ListedLocation) =>
  l.mapPlanetId ? findLocation(l.mapPlanetId, l.id) : undefined

const systemOfPlanet = new Map(
  systems.flatMap((s) => s.planets.map((p) => [p.id, s] as const)),
)

export function LocationList() {
  const canSee = useCanSee()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const groupParam = params.get('group')
  const grouping = isGrouping(groupParam) ? groupParam : undefined

  // Hand-tagged map places keep their own reveal; the rest use their page's.
  const shown = useMemo(
    () =>
      locationList.filter((l) =>
        canSee(mapPlaceOf(l)?.revealedIn ?? l.revealedIn),
      ),
    [canSee],
  )
  const shownIds = useMemo(() => new Set(shown.map((l) => l.id)), [shown])
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

  const matches = shown.filter((l) => !query || fold(l.name).includes(query))
  const hidden = locationList.length - shown.length

  const parentOf = (l: ListedLocation) => {
    const parent = l.parentId ? byId.get(l.parentId) : undefined
    return parent && shownIds.has(parent.id) ? parent : undefined
  }
  // Categories a place falls under, as [id, name, order]; only what the
  // reader may see is used.
  const categories = (l: ListedLocation): [string, string, number][] => {
    switch (grouping) {
      case 'type':
        return [[l.kind, listedKindLabels[l.kind], kindOrder.indexOf(l.kind)]]
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

  // Places with a page of their own so far: map places and planets.
  const hrefOf = (l: ListedLocation) => {
    const mapPlace = mapPlaceOf(l)
    if (mapPlace) {
      const system = systemOfPlanet.get(mapPlace.planetId)
      return (
        system &&
        `/systems/${system.id}/planets/${mapPlace.planetId}/locations/${l.id}`
      )
    }
    if (l.kind === 'planet' && l.world && planets.has(l.world)) {
      const system = systemOfPlanet.get(l.world)
      return system && `/systems/${system.id}/planets/${l.world}`
    }
    return undefined
  }

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
      </div>

      {groups.length > 0 && (
        <nav
          aria-label={grouping ? `Jump to ${label}` : 'Jump to letter'}
          className="letter-index"
        >
          {groups.map(({ id, name }) => (
            <a key={id} href={`#${anchor(id)}`}>
              {name}
            </a>
          ))}
        </nav>
      )}
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
          <h2 id={anchor(id)}>{name}</h2>
          <ul>
            {items.map((l) => {
              const href = hrefOf(l)
              return (
                <li key={l.id}>
                  {href ? <Link to={href}>{l.name}</Link> : l.name}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </article>
  )
}
