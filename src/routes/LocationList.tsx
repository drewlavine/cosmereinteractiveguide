import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  bookArt,
  entryArtOf,
  seriesArt,
  useVisiblePlanets,
  worldArt,
} from '../components/browse/art'
import { BrowseList } from '../components/browse/BrowseList'
import type { Category, Grouping } from '../components/browse/types'
import {
  FeatureIcon,
  FeatureLegend,
  FeatureLinks,
} from '../components/PageFeatures'
import { bookSeries, books, seriesOf } from '../data/books'
import { shownBooks } from '../data/entryStories'
import {
  findListed,
  listedKindLabels,
  listedLocations,
  placeHref,
  placeKnownIn,
  placeRevealedIn,
} from '../data/listedLocations'
import {
  featureGroups,
  featuresFor,
  featuresOf,
  type FoundFeature,
} from '../data/pageFeatures'
import type { ListedLocation } from '../data/types'
import { useCanSee } from '../state/reveal'
import { fold } from './listHelpers'

const kindOrder = Object.keys(listedKindLabels)

/** A place the reader may see, with what they may know of it worked out once. */
interface Place extends ListedLocation {
  /** Whether the reader knows what it is, not only that a chapter named it. */
  known: boolean
  /** The books it is listed under: those read, plus the one being read. */
  listedUnder: string[]
  features: FoundFeature[]
  /** The place it lies within, if the reader can see that place. */
  parent?: ListedLocation
  href: string
}

/** A place only named so far isn't sorted by what it is or where. */
const whenKnown =
  (categories: (place: Place) => readonly Category[]) =>
  (place: Place): readonly Category[] =>
    place.known ? categories(place) : []

export function LocationList() {
  const canSee = useCanSee()
  const planets = useVisiblePlanets()

  const places = useMemo(() => {
    const seen = listedLocations.filter((l) => canSee(placeRevealedIn(l)))
    const seenIds = new Set(seen.map((l) => l.id))
    return seen.map((l): Place => {
      const parent = findListed(l.parentId)
      return {
        ...l,
        known: canSee(placeKnownIn(l)),
        listedUnder: shownBooks(l.books, placeRevealedIn(l), canSee),
        features: featuresOf('location', l, { canSee }),
        parent: parent && seenIds.has(parent.id) ? parent : undefined,
        href: placeHref(l, (id) => planets.has(id)),
      }
    })
  }, [canSee, planets])

  // The legend explains the icons any listed place has.
  const iconsShown = useMemo(() => {
    const found = places.flatMap((p) => p.features)
    return featuresFor('location').filter((f) =>
      found.some((x) => x.feature === f),
    )
  }, [places])

  const groupings = useMemo(
    (): Grouping<Place>[] => [
      {
        id: 'type',
        label: 'Type',
        all: 'All types',
        categories: whenKnown((p) => [
          [p.kind, listedKindLabels[p.kind], kindOrder.indexOf(p.kind)],
        ]),
      },
      {
        id: 'book',
        label: 'Book',
        all: 'All books',
        categories: (p) =>
          books
            .map((b, i): Category => [b.id, b.title, i])
            .filter(([id]) => p.listedUnder.includes(id)),
        art: bookArt,
      },
      {
        id: 'world',
        label: 'World',
        all: 'All worlds',
        biggestFirst: true,
        categories: whenKnown((p) => {
          const planet = p.world ? planets.get(p.world) : undefined
          return planet ? [[planet.id, planet.name, 0]] : []
        }),
        art: worldArt(planets),
      },
      {
        id: 'series',
        label: 'Series',
        all: 'All series',
        categories: (p) => {
          const ids = new Set(
            p.books.filter((b) => canSee([b])).map((b) => seriesOf(b)?.id),
          )
          return bookSeries
            .map((s, i): Category => [s.id, s.name, i])
            .filter(([id]) => ids.has(id))
        },
        art: seriesArt,
      },
      {
        id: 'inside',
        label: 'Inside',
        all: 'All places that hold others',
        biggestFirst: true,
        categories: whenKnown((p) =>
          p.parent ? [[p.parent.id, p.parent.name, 0]] : [],
        ),
        // The place's own art, as its page shows it.
        art: (group) => entryArtOf(`place:${group.id}`, canSee),
      },
      {
        id: 'feature',
        label: 'Page feature',
        all: 'All page features',
        categories: whenKnown((p) => featureGroups('location', p.features)),
        symbol: (group) => {
          const feature = featuresFor('location').find((f) => f.id === group.id)
          return feature && <FeatureIcon id={feature.id} />
        },
      },
    ],
    [canSee, planets],
  )

  return (
    <BrowseList
      path="/locations"
      title="Locations"
      noun={{ one: 'place', many: 'places' }}
      icon="place"
      items={places}
      hidden={listedLocations.length - places.length}
      groupings={groupings}
      match={(p, needle) => fold(p.name).includes(needle)}
      row={(p) => (
        <>
          <Link to={p.href}>{p.name}</Link>
          <FeatureLinks name={p.name} href={p.href} features={p.features} />
        </>
      )}
      legend={<FeatureLegend features={iconsShown} />}
      filterLabel="Filter locations by name"
      noMatch="No places match."
    />
  )
}
