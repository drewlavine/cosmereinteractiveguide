import { bookMeta, books, seriesOf } from '../data/books'
import { characterDetails } from '../data/characterDetails'
import { characters } from '../data/characters'
import { findLocation, kindLabels, locations } from '../data/locations'
import { firstMet } from '../data/reveal'
import { systems } from '../data/systems'
import type { SearchSource } from './types'

const systemOfPlanet = new Map(
  systems.flatMap((s) => s.planets.map((p) => [p.id, s] as const)),
)
const planetById = new Map(
  systems.flatMap((s) => s.planets.map((p) => [p.id, p] as const)),
)

const starSystems: SearchSource = {
  id: 'systems',
  label: 'Systems',
  icon: 'system',
  entries: () =>
    systems.map((system) => ({
      key: `system:${system.id}`,
      title: system.name,
      subtitle: system.uncharted
        ? 'Worlds without a charted system'
        : 'Star system',
      href: `/systems/${system.id}`,
      // A system is known once any of its worlds is.
      revealedIn: system.planets.flatMap((p) => p.revealedIn),
    })),
}

const planets: SearchSource = {
  id: 'planets',
  label: 'Planets',
  icon: 'planet',
  entries: (canSee) =>
    systems.flatMap((system) =>
      system.planets.map((planet) => ({
        key: `planet:${planet.id}`,
        title: planet.name,
        aliases:
          planet.altName && canSee(planet.altName.revealedIn)
            ? [planet.altName.text]
            : undefined,
        subtitle: system.uncharted ? 'Planet' : `Planet · ${system.name}`,
        href: `/systems/${system.id}/planets/${planet.id}`,
        revealedIn: planet.revealedIn,
      })),
    ),
}

const places: SearchSource = {
  id: 'places',
  label: 'Places',
  icon: 'place',
  entries: (canSee) =>
    locations.flatMap((location) => {
      const system = systemOfPlanet.get(location.planetId)
      const planet = planetById.get(location.planetId)
      if (!system || !planet) return []
      const parent = findLocation(location.planetId, location.parentId)
      const within = [
        parent && canSee(parent.revealedIn) ? parent.name : undefined,
        planet.name,
      ].filter(Boolean)
      return [
        {
          key: `place:${location.id}`,
          title: location.name,
          aliases: location.altName ? [location.altName] : undefined,
          subtitle: `${kindLabels[location.kind][0]} · ${within.join(', ')}`,
          href: `/systems/${system.id}/planets/${planet.id}/locations/${location.id}`,
          revealedIn: location.revealedIn,
        },
      ]
    }),
}

// Characters are hidden until the reader meets them. Those without details
// yet can't be checked, so they're always shown.
const people: SearchSource = {
  id: 'characters',
  label: 'Characters',
  icon: 'character',
  entries: (canSee) =>
    characters.map((character) => {
      const details = characterDetails[character.id]
      return {
        key: `character:${character.id}`,
        title: character.name,
        aliases: details?.aliases
          .filter((a) => canSee(a.revealedIn))
          .map((a) => a.name),
        subtitle: 'Character',
        href: `/characters/${character.id}`,
        revealedIn: details && firstMet(details),
      }
    }),
}

// Book titles aren't spoilers, so every book is listed.
const bookPages: SearchSource = {
  id: 'books',
  label: 'Books',
  icon: 'book',
  entries: () =>
    books.map((book) => ({
      key: `book:${book.id}`,
      title: book.title,
      subtitle: [seriesOf(book.id)?.name, bookMeta(book)]
        .filter(Boolean)
        .join(' · '),
      href: `/books/${book.id}`,
    })),
}

/**
 * Everything search covers, in the order groups are listed when they rank
 * equally.
 *
 * To make new data searchable (e.g. magic systems): write a `SearchSource`
 * whose `entries` lists one entry per page, with its spoiler tags in
 * `revealedIn`, and add it here. The search box, results page, spoiler
 * filtering and hidden-result count all pick it up automatically.
 */
export const searchSources: SearchSource[] = [
  starSystems,
  planets,
  places,
  people,
  bookPages,
]
