import { locationList } from './locationList'
import { locations } from './locations'
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
