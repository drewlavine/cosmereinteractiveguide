import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { bookSeries, seriesOf } from '../data/books'
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

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const anchor = (id: string) =>
  `characters-${id === '#' ? 'other' : fold(id).replace(/[^a-z0-9]+/g, '-')}`

interface Entry {
  character: Character
  /** Every name the reader may know them by, folded for matching. */
  names: string[]
  /** What the reader knows about them, for grouping. */
  shown: ShownCharacter
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
] as const
type GroupingId = (typeof groupings)[number]['id']

const isGrouping = (id: string | null): id is GroupingId =>
  groupings.some((g) => g.id === id)

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

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
          }
        }),
    [listed, canSee],
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
    // Series and book counts in their own order; the rest biggest first.
    groups = [...byId.values()].sort(
      (a, b) =>
        a.order - b.order ||
        (grouping === 'series' || grouping === 'books'
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
          <h2 id={anchor(id)}>{name}</h2>
          <ul>
            {items.map((character) => (
              <li key={character.id}>
                <Link to={`/characters/${character.id}`}>{character.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
