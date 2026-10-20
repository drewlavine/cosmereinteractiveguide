/**
 * The Cosmere's Atlas for journeys: which map images journeys are drawn on
 * (from maps.ts) and the places they can name (the Locations list). The
 * journey code itself only sees the generic Atlas interface.
 */
import type { Atlas, AtlasMap, AtlasPlace, MapPoint } from './journey'
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
  /** For a map inside another (a city): that map and the pin it zooms from. */
  parent?: { mapId: string; placeId?: string; at: MapPoint }
}

const sources: JourneyMapSource[] = [
  {
    id: 'roshar',
    planetId: 'roshar',
    mapId: 'roshar',
    file: 'Roshar.jpg',
    revealedIn: [{ book: 'way-of-kings', chapter: 'prelude' }],
  },
  // Roshar's city maps sit on the continent at their pins; each opens once
  // nothing printed on it spoils (some carry later notes, e.g. battles).
  {
    id: 'kharbranth',
    planetId: 'roshar',
    mapId: 'kharbranth',
    file: 'Kharbranth.jpg',
    revealedIn: [{ book: 'way-of-kings', chapter: 'prologue' }],
    parent: { mapId: 'roshar', placeId: 'kharbranth', at: [1441, 1176] },
  },
  {
    id: 'warcamps',
    planetId: 'roshar',
    mapId: 'warcamps',
    file: 'Warcamps.jpg',
    revealedIn: [{ book: 'way-of-kings', chapter: 'prologue' }],
    parent: { mapId: 'roshar', at: [1990, 1140] },
  },
  {
    id: 'shattered-plains',
    planetId: 'roshar',
    mapId: 'shattered-plains',
    file: 'Shattered_Plains.jpg',
    revealedIn: [{ book: 'way-of-kings', chapter: 'prologue' }],
    parent: { mapId: 'roshar', placeId: 'shattered-plains', at: [2045, 1110] },
  },
  {
    id: 'frostlands',
    planetId: 'roshar',
    mapId: 'frostlands',
    file: 'Frostlands_map.jpeg',
    revealedIn: [{ book: 'words-of-radiance', chapter: '11' }],
    parent: { mapId: 'roshar', placeId: 'frostlands', at: [1960, 1250] },
  },
  {
    id: 'kholinar',
    planetId: 'roshar',
    mapId: 'kholinar',
    file: 'Kholinar.jpg',
    revealedIn: [{ book: 'oathbringer', chapter: 'prologue' }],
    parent: { mapId: 'roshar', placeId: 'kholinar', at: [1934, 797] },
  },
  {
    id: 'thaylen-city',
    planetId: 'roshar',
    mapId: 'thaylen-city',
    file: 'Thaylen_City.jpg',
    revealedIn: [{ book: 'oathbringer', chapter: '119' }],
    parent: { mapId: 'roshar', placeId: 'thaylen-city', at: [1501, 1312] },
  },
  {
    id: 'narak-defenses',
    planetId: 'roshar',
    mapId: 'narak-defenses',
    file: 'Coalition_Stronghold_at_Narak.jpg',
    revealedIn: [{ book: 'wind-and-truth', chapter: 'prologue' }],
    parent: { mapId: 'roshar', at: [2050, 1105] },
  },
  {
    id: 'azimir',
    planetId: 'roshar',
    mapId: 'azimir',
    file: 'Plan_of_the_City_of_Azimir.jpg',
    revealedIn: ['wind-and-truth'],
    parent: { mapId: 'roshar', placeId: 'azimir', at: [937, 1042] },
  },
  {
    id: 'shadesmar',
    planetId: 'roshar',
    mapId: 'shadesmar',
    file: 'Shadesmar_(TWoK).jpg',
    revealedIn: [{ book: 'way-of-kings', chapter: 'prologue' }],
  },
  {
    id: 'sea-of-lost-lights',
    planetId: 'roshar',
    mapId: 'sea-of-lost-lights',
    file: 'Sea_of_Lost_Lights.jpg',
    revealedIn: [{ book: 'oathbringer', chapter: '89' }],
    parent: {
      mapId: 'shadesmar',
      placeId: 'sea-of-lost-lights',
      at: [864, 420],
    },
  },
  {
    id: 'sea-of-souls',
    planetId: 'roshar',
    mapId: 'sea-of-souls',
    file: 'Sea_of_Souls.jpg',
    revealedIn: [{ book: 'rhythm-of-war', chapter: '36' }],
    parent: { mapId: 'shadesmar', placeId: 'sea-of-souls', at: [612, 462] },
  },
  {
    id: 'final-empire',
    planetId: 'scadrial',
    mapId: 'final-empire',
    file: 'Final_Empire_Map.jpg',
    revealedIn: [{ book: 'final-empire', chapter: 'prologue' }],
  },
  {
    // The original front-matter map, not the later colour one.
    id: 'luthadel',
    planetId: 'scadrial',
    mapId: 'luthadel',
    file: 'Luthadel.png',
    revealedIn: [{ book: 'final-empire', chapter: 'prologue' }],
    parent: { mapId: 'final-empire', placeId: 'luthadel', at: [1273, 805] },
  },
  {
    id: 'fadrex-city',
    planetId: 'scadrial',
    mapId: 'fadrex-city',
    file: 'Fadrex_City.jpg',
    revealedIn: [{ book: 'hero-of-ages', chapter: 'prologue' }],
    parent: { mapId: 'final-empire', placeId: 'fadrex-city', at: [881, 752] },
  },
  {
    id: 'elendel-basin',
    planetId: 'scadrial',
    mapId: 'elendel-basin',
    file: 'Elendel_Basin.png',
    revealedIn: [{ book: 'alloy-of-law', chapter: 'prologue' }],
  },
  {
    id: 'dayside',
    planetId: 'taldain',
    mapId: 'dayside',
    file: 'Dayside_map.jpg',
    revealedIn: [{ book: 'white-sand-omnibus', chapter: 'prologue' }],
  },
  {
    // Interior art, page unknown; it shows only the city and the Megalith's
    // corpse, which the reader knows of by chapter X.
    id: 'kingseat',
    planetId: 'miral',
    mapId: 'kingseat',
    file: 'Map_of_Kingseat_by_Tran_Nguyen.jpg',
    revealedIn: [{ book: 'fires-of-december', chapter: 'x' }],
  },
  {
    id: 't-telir',
    planetId: 'nalthis',
    mapId: 't-telir',
    file: 'T-Telir.png',
    revealedIn: [{ book: 'warbreaker', chapter: 'prologue' }],
  },
  {
    // The original front-matter map; its pins are the Locations' ones.
    id: 'arelon',
    planetId: 'sel',
    mapId: 'arelon',
    file: 'Arelon.jpg',
    revealedIn: [{ book: 'elantris', chapter: 'prologue' }],
  },
  {
    id: 'elantris-and-kae',
    planetId: 'sel',
    mapId: 'elantris-and-kae',
    file: 'Elantris-Kae_Map.jpg',
    revealedIn: [{ book: 'elantris', chapter: 'prologue' }],
    parent: { mapId: 'arelon', placeId: 'elantris', at: [415, 404] },
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
          ...(s.parent && { parent: s.parent }),
        },
      ],
    ]
  }),
)

/** The world a journey map shows (part of), e.g. 'roshar' for Kholinar. */
export const journeyMapPlanet = (mapId: string) =>
  sources.find((s) => s.id === mapId)?.planetId

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
