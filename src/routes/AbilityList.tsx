import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  entryArtOf,
  seriesArt,
  shardArt,
  useVisiblePlanets,
  worldArt,
} from '../components/browse/art'
import { BrowseList } from '../components/browse/BrowseList'
import type { Category, Grouping } from '../components/browse/types'
import { abilityKindLabels, abilityList } from '../data/abilities'
import { bookSeries, seriesOf } from '../data/books'
import { entryBooks, entryRevealedIn, shownAliases } from '../data/entryStories'
import type { ListedAbility } from '../data/types'
import { useCanSee } from '../state/reveal'
import { fold } from './listHelpers'

const kindOrder = Object.keys(abilityKindLabels)

/** Magic and other abilities, as cards by type, system, world, Shard and series. */
export function AbilityList() {
  const canSee = useCanSee()
  const planets = useVisiblePlanets()

  const shown = useMemo(
    () => abilityList.filter((a) => canSee(entryRevealedIn('ability', a))),
    [canSee],
  )

  const groupings = useMemo((): Grouping<ListedAbility>[] => {
    const shownById = new Map(shown.map((a) => [a.id, a]))
    return [
      {
        id: 'type',
        label: 'Type',
        all: 'All types',
        categories: (a) => [
          [a.kind, abilityKindLabels[a.kind], kindOrder.indexOf(a.kind)],
        ],
      },
      {
        id: 'system',
        label: 'Magic system',
        all: 'All magic systems',
        biggestFirst: true,
        categories: (a) =>
          (a.kind === 'system'
            ? [a.id]
            : (a.systems ?? [])
                .filter((t) => canSee(t.revealedIn))
                .map((t) => t.id)
          ).flatMap((id): Category[] => {
            const system = shownById.get(id)
            return system ? [[system.id, system.name, 0]] : []
          }),
        // A system's group is its own entry, so it shows that entry's art.
        art: ({ id }) => entryArtOf(`ability:${id}`, canSee),
      },
      {
        id: 'world',
        label: 'World',
        all: 'All worlds',
        biggestFirst: true,
        categories: (a) => {
          const planet = a.world ? planets.get(a.world) : undefined
          return planet ? [[planet.id, planet.name, 0]] : []
        },
        art: worldArt(planets),
      },
      {
        id: 'shard',
        label: 'Shard',
        all: 'All Shards',
        biggestFirst: true,
        categories: (a) =>
          (a.shards ?? [])
            .filter((s) => canSee(s.revealedIn))
            .map((s): Category => [fold(s.name), s.name, 0]),
        art: shardArt(canSee),
      },
      {
        id: 'series',
        label: 'Series',
        all: 'All series',
        categories: (a) => {
          const ids = new Set(
            entryBooks('ability', a, canSee).map((b) => seriesOf(b)?.id),
          )
          return bookSeries
            .map((s, i): Category => [s.id, s.name, i])
            .filter(([id]) => ids.has(id))
        },
        art: seriesArt,
      },
    ]
  }, [canSee, planets, shown])

  // An entry matched only by another name shows that name too (Mistborn).
  const aliasHit = (a: ListedAbility, needle: string) =>
    fold(a.name).includes(needle)
      ? undefined
      : shownAliases('ability', a, canSee).find((x) =>
          fold(x.name).includes(needle),
        )?.name

  return (
    <BrowseList
      path="/magic"
      title="Magic"
      noun={{ one: 'entry', many: 'entries' }}
      icon="ability"
      items={shown}
      hidden={abilityList.length - shown.length}
      groupings={groupings}
      match={(a, needle) =>
        fold(a.name).includes(needle) || aliasHit(a, needle) !== undefined
      }
      row={(a, needle) => {
        const alias = aliasHit(a, needle)
        return (
          <>
            <Link to={`/magic/${a.id}`}>{a.name}</Link>
            {alias && <span className="list-alias"> ({alias})</span>}
          </>
        )
      }}
      filterLabel="Filter abilities by name"
      noMatch="Nothing matches."
    />
  )
}
