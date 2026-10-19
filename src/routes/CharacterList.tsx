import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FeatureLegend, FeatureLinks } from '../components/PageFeatures'
import { bookSeries, seriesOf } from '../data/books'
import {
  featureGroups,
  featuresFor,
  featuresOf,
  type FoundFeature,
} from '../data/pageFeatures'
import { people as characters } from '../data/people'
import {
  findPersona,
  hasMet,
  revealCharacter,
  seenThrough,
  type ShownCharacter,
} from '../data/reveal'
import type { Character } from '../data/types'
import { useCanSee, useShownSystems } from '../state/reveal'
import { GroupJump, LetterJump } from '../components/ListJump'
import { anchorFor, byLetter, fold, plural } from './listHelpers'

const anchor = (id: string) => anchorFor('characters', id)

interface Entry {
  character: Character
  /** Every name the reader may know them by, folded for matching. */
  names: string[]
  /** What the reader knows about them, for grouping. */
  shown: ShownCharacter
  /** Special parts of their page the reader can see. */
  features: FoundFeature[]
}

interface Group {
  id: string
  name: string
  items: Character[]
}

/** Ways to group the list, besides A–Z; each gives an entry's categories. */
const groupings = [
  { id: 'series', label: 'Series' },
  { id: 'world', label: 'World' },
  { id: 'species', label: 'Species' },
  { id: 'ability', label: 'Ability' },
  { id: 'books', label: 'Number of books' },
  { id: 'feature', label: 'Page feature' },
] as const
type GroupingId = (typeof groupings)[number]['id']

const isGrouping = (id: string | null): id is GroupingId =>
  groupings.some((g) => g.id === id)

export function CharacterList() {
  const canSee = useCanSee()
  const systems = useShownSystems()
  const [params, setParams] = useSearchParams()
  const query = fold(params.get('q') ?? '').trim()
  const groupParam = params.get('group')
  const grouping = isGrouping(groupParam) ? groupParam : undefined

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
            shown,
            features: featuresOf('character', character, { canSee }),
          }
        }),
    [listed, canSee],
  )
  const featuresById = useMemo(
    () => new Map(met.map((e) => [e.character.id, e.features])),
    [met],
  )
  // The legend explains the icons any listed character has.
  const legend = useMemo(
    () =>
      featuresFor('character').filter((f) =>
        met.some((e) => e.features.some((found) => found.feature === f)),
      ),
    [met],
  )

  const matches = met.filter(
    (e) => !query || e.names.some((n) => n.includes(query)),
  )
  const hidden = listed.length - met.length

  // Categories an entry falls under, as [id, name, order]; a character can be
  // under several (e.g. two abilities). Only what the reader knows is used.
  const planetName = (id: string) =>
    systems.flatMap((s) => s.planets).find((p) => p.id === id)?.name ?? id
  const categories = (e: Entry): [string, string, number][] => {
    const { shown } = e
    switch (grouping) {
      case 'series': {
        const ids = new Set(shown.appearsIn.map((a) => seriesOf(a.bookId)?.id))
        return bookSeries
          .map((s, i): [string, string, number] => [s.id, s.name, i])
          .filter(([id]) => ids.has(id))
      }
      case 'world':
        return shown.world ? [[shown.world, planetName(shown.world), 0]] : []
      case 'species':
        return shown.species.map((n) => [n, n, 0])
      case 'ability':
        return shown.abilities.map((n) => [n, n, 0])
      case 'books': {
        const n = shown.appearsIn.length
        return n > 0 ? [[String(n), `In ${plural(n, 'book')}`, -n]] : []
      }
      case 'feature':
        return featureGroups('character', e.features)
      default:
        return []
    }
  }

  let groups: Group[]
  let unsorted = 0
  if (grouping) {
    const byId = new Map<string, Group & { order: number }>()
    for (const e of matches) {
      const cats = categories(e)
      if (cats.length === 0) unsorted++
      for (const [id, name, order] of cats) {
        const group = byId.get(id) ?? { id, name, order, items: [] }
        group.items.push(e.character)
        byId.set(id, group)
      }
    }
    // Series, book counts and features in their own order; the rest
    // biggest first.
    groups = [...byId.values()].sort(
      (a, b) =>
        a.order - b.order ||
        (grouping === 'series' || grouping === 'books' || grouping === 'feature'
          ? 0
          : b.items.length - a.items.length) ||
        a.name.localeCompare(b.name),
    )
  } else
    groups = byLetter(matches.map((e) => e.character)).map((g) => ({
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
          {plural(unsorted, 'more character')} not sorted by {label} yet.
        </p>
      )}
      {matches.length === 0 && <p>No characters match.</p>}
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
            {items.map((character) => (
              <li key={character.id}>
                <Link to={`/characters/${character.id}`}>{character.name}</Link>
                <FeatureLinks
                  name={character.name}
                  href={`/characters/${character.id}`}
                  features={featuresById.get(character.id) ?? []}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
