import type { Location } from './types'
import { miralPlaces } from './places/miral'
import { nalthisPlaces } from './places/nalthis'
import { rosharPlaces } from './places/roshar'
import { scadrialPlaces } from './places/scadrial'
import { selPlaces } from './places/sel'
import { taldainPlaces } from './places/taldain'

/** Every place, one file per planet in ./places. */
export const locations: Location[] = [
  ...rosharPlaces,
  ...scadrialPlaces,
  ...selPlaces,
  ...nalthisPlaces,
  ...taldainPlaces,
  ...miralPlaces,
]

const byId = new Map(locations.map((l) => [l.id, l]))

export const findLocation = (planetId?: string, locationId?: string) => {
  const location = locationId ? byId.get(locationId) : undefined
  return location?.planetId === planetId ? location : undefined
}

/** Places within `parentId`, in data order. */
export const childLocations = (parentId: string) =>
  locations.filter((l) => l.parentId === parentId)

export const kindLabels: Record<Location['kind'], [string, string]> = {
  continent: ['Continent', 'Continents'],
  nation: ['Nation', 'Nations'],
  region: ['Region', 'Regions'],
  city: ['City', 'Cities'],
  landmark: ['Landmark', 'Landmarks'],
}
