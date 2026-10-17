import { locationList } from './locationList'
import { findLocation, locations } from './locations'
import { systems } from './systems'
import type { ListedLocation, Location, ListedLocationKind } from './types'

const kindOf: Record<Location['kind'], ListedLocationKind> = {
  continent: 'continent',
  nation: 'nation',
  region: 'region',
  city: 'settlement',
  landmark: 'other',
}

const listedIds = new Set(locationList.map((l) => l.id))

/**
 * Every place for the Locations list: the Coppermind's places, plus map
 * places it has no page of their own for (e.g. a section of a bigger page).
 */
export const listedLocations: ListedLocation[] = [
  ...locationList,
  ...locations
    .filter((l) => !listedIds.has(l.id))
    .map((l): ListedLocation => ({
      id: l.id,
      name: l.name,
      kind: kindOf[l.kind],
      world: l.planetId,
      parentId: l.parentId,
      revealedIn: l.revealedIn,
      books: [
        ...new Set(
          [...(l.settingOf ?? []), ...(l.mentionedIn ?? [])].map(
            (s) => s.bookId,
          ),
        ),
      ],
      coppermindPage: decodeURIComponent(
        l.coppermindUrl.replace(/^.*\/wiki\//, ''),
      ).replace(/_/g, ' '),
      mapPlanetId: l.planetId,
    })),
].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))

/** Labels for each kind, in the order the Type grouping lists them. */
export const listedKindLabels: Record<ListedLocationKind, string> = {
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

/** One of a kind, for a place's own page. */
export const listedKindNames: Record<ListedLocationKind, string> = {
  system: 'Planetary system',
  planet: 'Planet',
  moon: 'Moon',
  celestial: 'Celestial body',
  continent: 'Continent',
  nation: 'Nation',
  region: 'Region',
  settlement: 'Settlement',
  building: 'Building',
  water: 'Body of water',
  island: 'Island',
  mountain: 'Mountain',
  forest: 'Forest',
  plain: 'Plain',
  cave: 'Cave',
  perpendicularity: 'Perpendicularity',
  other: 'Place',
}

const byId = new Map(listedLocations.map((l) => [l.id, l]))

export const findListed = (id?: string) =>
  id === undefined ? undefined : byId.get(id)

/** Map place for a listed place, if it has one. */
export const mapPlaceOf = (l: ListedLocation) =>
  l.mapPlanetId ? findLocation(l.mapPlanetId, l.id) : undefined

/** Hand-tagged map places keep their own reveal; the rest use their page's. */
export const placeRevealedIn = (l: ListedLocation) =>
  mapPlaceOf(l)?.revealedIn ?? l.revealedIn

export const systemOfPlanet = new Map(
  systems.flatMap((s) => s.planets.map((p) => [p.id, s] as const)),
)

/**
 * The page for a listed place: its map place's, its planet's (when
 * `planetShown`), else its own under /locations.
 */
export function placeHref(
  l: ListedLocation,
  planetShown: (planetId: string) => boolean,
) {
  const mapPlace = mapPlaceOf(l)
  const system = mapPlace && systemOfPlanet.get(mapPlace.planetId)
  if (mapPlace && system)
    return `/systems/${system.id}/planets/${mapPlace.planetId}/locations/${l.id}`
  const world = l.kind === 'planet' ? l.world : undefined
  const planetSystem = world && systemOfPlanet.get(world)
  if (world && planetSystem && planetShown(world))
    return `/systems/${planetSystem.id}/planets/${world}`
  return `/locations/${l.id}`
}
