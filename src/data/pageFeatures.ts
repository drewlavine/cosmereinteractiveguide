/**
 * Page features: special parts of a detail page (a map, a Travels journey...)
 * that the lists flag with an icon linking straight to that part.
 *
 * To add one:
 * 1. Add an entry to `pageFeatures` with an `id`, a short `label`, a
 *    spoiler-free `description` (shown in the legend), and a `section`
 *    finder for each kind of page that can have it.
 * 2. Draw its icon in `src/components/PageFeatures.tsx` (the type checker
 *    asks for one).
 *
 * The lists' icons, legend and "Page feature" grouping all follow from it.
 *
 * A finder gets the subject of a list entry and returns the id of the
 * section on its page that shows the feature, or undefined when the page
 * doesn't show it to this reader by their books alone. Build it from the
 * same `reveal*` / map helpers the page uses, so an icon shows exactly when
 * its section does (tests in `pageFeatures.test.ts` and the list tests check
 * the section is there).
 */
import { characterDetails } from './characterDetails'
import { journeyAtlas } from './journeyAtlas'
import { journeyIndex } from './journeyIndex'
import { mapPlaceOf, placeRevealedIn, systemOfPlanet } from './listedLocations'
import { interactiveMaps, placeMaps, unlockedMaps } from './maps'
import {
  findPersona,
  hasMet,
  journeyShown,
  revealCharacterTravels,
  seenThrough,
  type CanSee,
} from './reveal'
import type { Character, ListedAbility, ListedLocation } from './types'

/** What a finder may know about the reader. */
export interface FeatureContext {
  /** What the reader may see by their books alone (never Show anyway). */
  canSee: CanSee
}

/** The kinds of list entry, and what each list passes to a finder. */
export interface FeatureSubjects {
  character: Character
  location: ListedLocation
  ability: ListedAbility
}
export type FeatureKind = keyof FeatureSubjects

type Finders = {
  [K in FeatureKind]?: (
    subject: FeatureSubjects[K],
    ctx: FeatureContext,
  ) => string | undefined
}

export interface PageFeature {
  id: string
  /** e.g. "Map"; also the tooltip. */
  label: string
  /** One generic line for the legend; must never hint at a spoiler. */
  description: string
  /** Which kinds of page can have it, and where it is on each. */
  section: Finders
}

const hasRead = (canSee: CanSee) => (bookId: string) => canSee([bookId])

const planetShown = (canSee: CanSee, planetId: string) =>
  !!systemOfPlanet
    .get(planetId)
    ?.planets.some((p) => p.id === planetId && canSee(p.revealedIn))

/** As LocationMaps on a map place's page (see LocationDetail, PlacePage). */
function placeMapSection(place: ListedLocation, canSee: CanSee) {
  if (!canSee(placeRevealedIn(place))) return undefined
  const mapPlace = mapPlaceOf(place)
  // A map place's page (see placeHref) shows only on a world the reader knows.
  if (mapPlace)
    return planetShown(canSee, mapPlace.planetId)
      ? placeMaps(mapPlace.planetId, place.id, hasRead(canSee))?.section
      : undefined
  // A planet's page, as PlanetDetail: interactive maps first, then the rest.
  const world = place.kind === 'planet' ? place.world : undefined
  if (!world || !planetShown(canSee, world)) return undefined
  if (
    interactiveMaps(world, hasRead(canSee), (l) => canSee(l.revealedIn)).length
  )
    return 'interactive-map'
  return unlockedMaps(world, hasRead(canSee)).length ? 'maps' : undefined
}

/**
 * The id of the page a character list entry opens, if that page shows its
 * sections (CharacterDetail): a persona the reader has seen through opens
 * the character's page.
 */
function characterPage(character: Character, canSee: CanSee) {
  const persona = findPersona(character.id)
  const id =
    persona && seenThrough(persona, canSee) ? persona.characterId : character.id
  if (!characterDetails[persona?.characterId ?? id] || !hasMet(id, canSee))
    return undefined
  return id
}

/** As CharacterDetail's Travels section. */
function travelsSection(character: Character, canSee: CanSee) {
  const id = characterPage(character, canSee)
  if (!id) return undefined
  return revealCharacterTravels(id, canSee).stops.length ? 'travels' : undefined
}

/** As CharacterDetail's Journey section. */
function journeySection(character: Character, canSee: CanSee) {
  const id = characterPage(character, canSee)
  if (!id) return undefined
  return journeyShown(id, journeyIndex, journeyAtlas, canSee)
    ? 'journey'
    : undefined
}

export const pageFeatures = [
  {
    id: 'journey',
    label: 'Journey',
    description:
      'What happens to them and where, event by event, on an interactive map',
    section: {
      character: (character, { canSee }) => journeySection(character, canSee),
    },
  },
  {
    id: 'map',
    label: 'Map',
    description: 'Maps from the books, showing the place or where it lies',
    section: {
      location: (place, { canSee }) => placeMapSection(place, canSee),
    },
  },
  {
    id: 'travels',
    label: 'Travels',
    description: 'Their journey across the Cosmere on an animated star map',
    section: {
      character: (character, { canSee }) => travelsSection(character, canSee),
    },
  },
] as const satisfies readonly PageFeature[]

export type PageFeatureId = (typeof pageFeatures)[number]['id']

/** A feature a page has, and the id of the section showing it. */
export interface FoundFeature {
  feature: PageFeature & { id: PageFeatureId }
  section: string
}

/** The features a kind of page can have, in registry order. */
export const featuresFor = (kind: FeatureKind) =>
  pageFeatures.filter((f) => kind in f.section)

/** The features a list entry's page shows the reader, in registry order. */
export function featuresOf<K extends FeatureKind>(
  kind: K,
  subject: FeatureSubjects[K],
  ctx: FeatureContext,
): FoundFeature[] {
  return pageFeatures.flatMap((feature) => {
    const find = (feature.section as Finders)[kind]
    const section = find?.(subject, ctx)
    return section ? [{ feature, section }] : []
  })
}

/**
 * The "Page feature" groups a list entry falls under, as [id, name, order]:
 * one per feature its page shows, in registry order, else "No special
 * features" (last).
 */
export function featureGroups(
  kind: FeatureKind,
  found: FoundFeature[],
): [string, string, number][] {
  const order: readonly PageFeature[] = featuresFor(kind)
  return found.length
    ? found.map(({ feature }) => [
        feature.id,
        feature.label,
        order.indexOf(feature),
      ])
    : [['no-features', 'No special features', order.length]]
}
