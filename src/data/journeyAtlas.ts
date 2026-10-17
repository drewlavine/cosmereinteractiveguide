/**
 * The Cosmere's Atlas for journeys: which map images journeys are drawn on
 * (from maps.ts) and the places they can name (the Locations list). The
 * journey code itself only sees the generic Atlas interface.
 */
import type { Atlas, AtlasMap, AtlasPlace } from './journey'
import { findListed, placeHref, placeRevealedIn } from './listedLocations'
import { mapImageUrl, mapSourceUrl, mapThumbUrl, planetMaps } from './maps'
import type { Reveal } from './types'

interface JourneyMapSource {
  /** Journey map id, as the importers' events use. */
  id: string
  planetId: string
  /** planetMaps id and version file the events' pixels are in. */
  mapId: string
  file: string
  /**
   * When the reader may see the map. Maps printed in a book's front matter
   * are in the reader's hands from its first pages, so journeys show them
   * from the start of that book (the Maps sections still wait for the end).
   */
  revealedIn: Reveal
}

const sources: JourneyMapSource[] = [
  {
    id: 'roshar',
    planetId: 'roshar',
    mapId: 'roshar',
    file: 'Roshar.jpg',
    revealedIn: [{ book: 'way-of-kings', chapter: 'prelude' }],
  },
]

const maps = new Map<string, AtlasMap>(
  sources.flatMap((s) => {
    const map = planetMaps[s.planetId]?.find((m) => m.id === s.mapId)
    const version = map?.versions.find((v) => v.file === s.file)
    if (!map || !version) return []
    return [
      [
        s.id,
        {
          id: s.id,
          title: map.title,
          image: {
            src: mapImageUrl(version.file),
            thumb: mapThumbUrl(version, 640),
            width: version.width,
            height: version.height,
            alt: `Map of ${map.title}`,
          },
          credit: {
            text: `Map by ${version.artist}, via the Coppermind`,
            url: mapSourceUrl(version.file),
          },
          revealedIn: s.revealedIn,
        },
      ],
    ]
  }),
)

export const journeyAtlas: Atlas = {
  map: (id) => maps.get(id),
  place(id): AtlasPlace | undefined {
    const listed = findListed(id)
    if (!listed) return undefined
    return {
      id,
      name: listed.name,
      revealedIn: placeRevealedIn(listed),
      // Only planets' pages depend on the reader; journeys name none yet.
      href: placeHref(listed, () => false),
    }
  },
}
