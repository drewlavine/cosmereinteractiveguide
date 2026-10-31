import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  namedEntryArt,
  seriesArt,
  useVisiblePlanets,
  worldArt,
} from '../components/browse/art'
import { BrowseList } from '../components/browse/BrowseList'
import { Monogram } from '../components/browse/GroupCard'
import type { Category, Grouping } from '../components/browse/types'
import {
  FeatureIcon,
  FeatureLegend,
  FeatureLinks,
} from '../components/PageFeatures'
import { abilityList } from '../data/abilities'
import { bookSeries, seriesOf } from '../data/books'
import { entryRevealedIn } from '../data/entryStories'
import { lifeformList } from '../data/lifeforms'
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
import { fold, plural } from './listHelpers'

interface Entry extends Character {
  /** Every name the reader may know them by, folded for matching. */
  names: string[]
  /** What the reader knows about them, for grouping. */
  shown: ShownCharacter
  /** Special parts of their page the reader can see. */
  features: FoundFeature[]
}

export function CharacterList() {
  const canSee = useCanSee()
  const systems = useShownSystems()
  const planets = useVisiblePlanets()

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
            ...character,
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
  // The legend explains the icons any listed character has.
  const legend = useMemo(
    () =>
      featuresFor('character').filter((f) =>
        met.some((e) => e.features.some((found) => found.feature === f)),
      ),
    [met],
  )

  const groupings = useMemo((): Grouping<Entry>[] => {
    const planetNames = new Map(
      systems.flatMap((s) => s.planets).map((p) => [p.id, p.name]),
    )
    // A group is named for an entry (a species, an Order) only when the
    // reader may see that entry's own page, so its art never runs ahead.
    const lifeforms = lifeformList.filter((e) =>
      canSee(entryRevealedIn('lifeform', e)),
    )
    const abilities = abilityList.filter((a) =>
      canSee(entryRevealedIn('ability', a)),
    )
    // A Radiant goes by their Order's name in the singular.
    const orders = abilities
      .filter((a) => a.kind === 'order')
      .map((a) => ({
        id: a.id,
        name: a.name.replace(/^Order of (.+)s$/, '$1'),
      }))
    return [
      {
        id: 'series',
        label: 'Series',
        all: 'All series',
        categories: ({ shown }) => {
          const ids = new Set(
            shown.appearsIn.map((a) => seriesOf(a.bookId)?.id),
          )
          return bookSeries
            .map((s, i): Category => [s.id, s.name, i])
            .filter(([id]) => ids.has(id))
        },
        art: seriesArt,
      },
      {
        id: 'world',
        label: 'World',
        all: 'All worlds',
        biggestFirst: true,
        categories: ({ shown }) =>
          shown.world
            ? [[shown.world, planetNames.get(shown.world) ?? shown.world, 0]]
            : [],
        art: worldArt(planets),
      },
      {
        id: 'species',
        label: 'Species',
        all: 'All species',
        biggestFirst: true,
        categories: ({ shown }) =>
          shown.species.map((n): Category => [n, n, 0]),
        art: namedEntryArt('lifeform', lifeforms, canSee),
      },
      {
        id: 'ability',
        label: 'Ability',
        all: 'All abilities',
        biggestFirst: true,
        categories: ({ shown }) =>
          shown.abilities.map((n): Category => [n, n, 0]),
        art: namedEntryArt('ability', [...abilities, ...orders], canSee),
      },
      {
        id: 'books',
        label: 'Number of books',
        all: 'All book counts',
        categories: ({ shown }) => {
          const n = shown.appearsIn.length
          return n > 0 ? [[String(n), `In ${plural(n, 'book')}`, -n]] : []
        },
        symbol: ({ id }) => <Monogram>{id}</Monogram>,
      },
      {
        id: 'feature',
        label: 'Page feature',
        all: 'All page features',
        categories: (e) => featureGroups('character', e.features),
        symbol: ({ id }) => {
          const feature = featuresFor('character').find((f) => f.id === id)
          return feature && <FeatureIcon id={feature.id} />
        },
      },
    ]
  }, [canSee, planets, systems])

  return (
    <BrowseList
      path="/characters"
      title="Characters"
      noun={{ one: 'character', many: 'characters' }}
      icon="character"
      items={met}
      hidden={listed.length - met.length}
      groupings={groupings}
      match={(e, needle) => e.names.some((n) => n.includes(needle))}
      row={(e) => (
        <>
          <Link to={`/characters/${e.id}`}>{e.name}</Link>
          <FeatureLinks
            name={e.name}
            href={`/characters/${e.id}`}
            features={e.features}
          />
        </>
      )}
      legend={<FeatureLegend features={legend} />}
      filterLabel="Filter characters by name"
      noMatch="No characters match."
    />
  )
}
