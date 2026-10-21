import { abilityKindNames, abilityList } from '../data/abilities'
import { bookMeta, books, seriesOf } from '../data/books'
import { cultureKindNames, cultureList } from '../data/culture'
import { eventKindNames, eventList } from '../data/events'
import { lifeformKindNames, lifeformList } from '../data/lifeforms'
import { entryRevealedIn, shownAliases } from '../data/entryStories'
import { people as characters } from '../data/people'
import { findLocation, kindLabels, locations } from '../data/locations'
import {
  type CanSee,
  findPersona,
  metIn,
  revealCharacter,
  seenThrough,
} from '../data/reveal'
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

const firstWord = (name: string) => name.split(' ')[0]
const firstWordCounts = new Map<string, number>()
for (const { name } of characters)
  firstWordCounts.set(
    firstWord(name),
    (firstWordCounts.get(firstWord(name)) ?? 0) + 1,
  )

/**
 * Names that find a character the reader hasn't met: the full name, or the
 * first name ("Shallan") if no other character shares it.
 */
const exactNames = (name: string) =>
  name.includes(' ') && firstWordCounts.get(firstWord(name)) === 1
    ? [name, firstWord(name)]
    : [name]

// Characters are hidden until the reader meets them, unless searched for by
// name. Those without details yet can't be checked, so they're always shown.
const people: SearchSource = {
  id: 'characters',
  label: 'Characters',
  icon: 'character',
  entries: (canSee) =>
    characters.flatMap((character) => {
      const persona = findPersona(character.id)
      // Once the reader can tell who a persona is, the character's own entry
      // finds them under that name.
      if (persona && seenThrough(persona, canSee)) return []
      const revealedIn = metIn(character.id, canSee)
      const shown = persona ? undefined : revealCharacter(character.id, canSee)
      const personaNames = shown?.personas.map((p) => p.name) ?? []
      return {
        key: `character:${character.id}`,
        // "Vasher (Zahel)", so a search for either shows they're one person.
        title: personaNames.length
          ? `${character.name} (${personaNames.join(', ')})`
          : character.name,
        aliases: shown ? [...personaNames, ...shown.aliases] : [],
        subtitle: 'Character',
        href: `/characters/${character.id}`,
        revealedIn,
        exactMatch: revealedIn && {
          names: exactNames(character.name),
          subtitle: 'Character · not met yet',
        },
      }
    }),
}

const worldName = (canSee: CanSee, id?: string) => {
  const planet = id ? planetById.get(id) : undefined
  return planet && canSee(planet.revealedIn) ? planet.name : undefined
}

const abilities: SearchSource = {
  id: 'abilities',
  label: 'Magic',
  icon: 'ability',
  entries: (canSee) =>
    abilityList.flatMap((a) => [
      {
        key: `ability:${a.id}`,
        title: a.name,
        subtitle: [abilityKindNames[a.kind], worldName(canSee, a.world)]
          .filter(Boolean)
          .join(' · '),
        href: `/magic/${a.id}`,
        revealedIn: entryRevealedIn('ability', a),
      },
      // Coinshot, Skimmer...: their own results, leading to the metal.
      ...shownAliases('ability', a, canSee).map((alias) => ({
        key: `ability:${a.id}:${alias.name}`,
        title: alias.name,
        subtitle: `${alias.role} · ${a.name}`,
        href: `/magic/${a.id}`,
        revealedIn: alias.revealedIn,
      })),
    ]),
}

const culture: SearchSource = {
  id: 'culture',
  label: 'Culture',
  icon: 'culture',
  entries: (canSee) =>
    cultureList.map((c) => ({
      key: `culture:${c.id}`,
      title: c.name,
      subtitle: [cultureKindNames[c.kind], worldName(canSee, c.world)]
        .filter(Boolean)
        .join(' · '),
      href: `/culture/${c.id}`,
      revealedIn: entryRevealedIn('culture', c),
    })),
}

const lifeforms: SearchSource = {
  id: 'lifeforms',
  label: 'Lifeforms',
  icon: 'lifeform',
  entries: (canSee) =>
    lifeformList.flatMap((e) => [
      {
        key: `lifeform:${e.id}`,
        title: e.name,
        subtitle: [lifeformKindNames[e.kind], worldName(canSee, e.world)]
          .filter(Boolean)
          .join(' · '),
        href: `/lifeforms/${e.id}`,
        revealedIn: entryRevealedIn('lifeform', e),
      },
      ...shownAliases('lifeform', e, canSee).map((alias) => ({
        key: `lifeform:${e.id}:${alias.name}`,
        title: alias.name,
        subtitle: `${alias.role} · ${e.name}`,
        href: `/lifeforms/${e.id}`,
        revealedIn: alias.revealedIn,
      })),
    ]),
}

const events: SearchSource = {
  id: 'events',
  label: 'Events',
  icon: 'event',
  entries: (canSee) =>
    eventList.flatMap((e) => [
      {
        key: `event:${e.id}`,
        title: e.name,
        subtitle: [eventKindNames[e.kind], worldName(canSee, e.world)]
          .filter(Boolean)
          .join(' · '),
        href: `/events/${e.id}`,
        revealedIn: entryRevealedIn('event', e),
      },
      // Last Desolation for Aharietiam...
      ...shownAliases('event', e, canSee).map((alias) => ({
        key: `event:${e.id}:${alias.name}`,
        title: alias.name,
        subtitle: `${alias.role} · ${e.name}`,
        href: `/events/${e.id}`,
        revealedIn: alias.revealedIn,
      })),
    ]),
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
  abilities,
  culture,
  lifeforms,
  events,
  bookPages,
]
