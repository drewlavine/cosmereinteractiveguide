/**
 * Official in-world maps, hosted by the Coppermind and shown with credit.
 * Each map lists its versions in publication order. A version stays hidden
 * until the reader has read `bookId`: the later of the book the map is
 * printed in and the book whose events it shows.
 */

export interface MapVersion {
  bookId: string
  /** Pill label when two versions come from the same book, e.g. "Color". */
  edition?: string
  /** Collections that reprint the map, e.g. Arcanum Unbounded; reading one also unlocks it. */
  alsoIn?: string[]
  /** File name on the Coppermind, e.g. "OB_Roshar.jpg". */
  file: string
  width: number
  height: number
  caption: string
  artist: string
}

export interface PlanetMap {
  id: string
  title: string
  versions: MapVersion[]
}

const STEWART = 'Isaac Stewart'

const UPLOADS = 'https://uploads.coppermind.net'

export const mapImageUrl = (file: string) => `${UPLOADS}/${encodeURI(file)}`

/** A small copy of the map; images no wider than that are used whole. */
export const mapThumbUrl = (version: MapVersion, width = 320) =>
  version.width <= width
    ? mapImageUrl(version.file)
    : `${UPLOADS}/thumb/${encodeURI(version.file)}/${width}px-${encodeURI(version.file)}`

export const mapSourceUrl = (file: string) =>
  `https://coppermind.net/wiki/File:${encodeURI(file)}`

export const planetMaps: Record<string, PlanetMap[]> = {
  roshar: [
    {
      id: 'roshar',
      title: 'Roshar',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Roshar.jpg',
          width: 2560,
          height: 1600,
          caption: 'The great continent of Roshar.',
          artist: STEWART,
        },
        {
          bookId: 'words-of-radiance',
          file: 'Words_of_Radiance_endpaper.jpg',
          width: 2048,
          height: 1547,
          caption: 'A color map of Roshar from the endpapers.',
          artist: STEWART,
        },
        {
          bookId: 'oathbringer',
          file: 'OB_Roshar.jpg',
          width: 2628,
          height: 1521,
          caption: 'The great continent of Roshar.',
          artist: STEWART,
        },
        {
          bookId: 'wind-and-truth',
          file: 'WaT_Roshar.jpg',
          width: 1800,
          height: 1032,
          caption: 'The great continent of Roshar.',
          artist: 'Howard Lyon and Isaac Stewart',
        },
      ],
    },
    {
      id: 'silver-kingdoms',
      title: 'The Silver Kingdoms',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Silver_Kingdoms.jpg',
          width: 1200,
          height: 795,
          caption: 'The ancient Silver Kingdoms of Roshar.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'shadesmar',
      title: 'Shadesmar',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Shadesmar_(TWoK).jpg',
          width: 1200,
          height: 795,
          caption: 'Shadesmar around Roshar.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'alethkar',
      title: 'Alethkar',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Alethkar.jpg',
          width: 795,
          height: 1200,
          caption:
            "Alethkar and its neighbors, drawn by Gavilar Kholin's royal surveyors.",
          artist: STEWART,
        },
        {
          bookId: 'oathbringer',
          file: 'Alethkar_Color.jpg',
          width: 1613,
          height: 2479,
          caption: 'Alethkar, annotated by Nazh.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'kharbranth',
      title: 'Kharbranth',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Kharbranth.jpg',
          width: 1200,
          height: 795,
          caption: 'The City of Bells, from the port to the Conclave.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'shattered-plains',
      title: 'The Shattered Plains',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Shattered_Plains.jpg',
          width: 1200,
          height: 795,
          caption: 'The plateaus and chasms of the Shattered Plains.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'warcamps',
      title: 'The Warcamps',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Warcamps.jpg',
          width: 1200,
          height: 795,
          caption: 'The ten Alethi warcamps, painted by Vandonas.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'sadeas-warcamp',
      title: "Sadeas's Warcamp",
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Lumberyard_Map.jpg',
          width: 795,
          height: 1200,
          caption:
            "A spearman's map of Sadeas's warcamp, scratched on a shell.",
          artist: STEWART,
        },
      ],
    },
    {
      id: 'battle-of-the-tower',
      title: 'Battle of the Tower',
      versions: [
        {
          bookId: 'way-of-kings',
          file: 'Battle_of_the_Tower.jpg',
          width: 795,
          height: 1200,
          caption: 'The Battle of the Tower, drawn by Navani Kholin.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'frostlands',
      title: 'The Frostlands',
      versions: [
        {
          bookId: 'words-of-radiance',
          file: 'Frostlands_map.jpeg',
          width: 1368,
          height: 2048,
          caption: 'The southern Frostlands.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'battle-of-narak',
      title: 'Battle of Narak',
      versions: [
        {
          bookId: 'words-of-radiance',
          file: 'Battle_of_Narak.jpeg',
          width: 2048,
          height: 1359,
          caption: 'The Battle of Narak, drawn by Navani Kholin.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'kholinar',
      title: 'Kholinar',
      versions: [
        {
          bookId: 'oathbringer',
          file: 'Kholinar.jpg',
          width: 1627,
          height: 2457,
          caption: 'Kholinar and the main level of the palace.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'thaylen-city',
      title: 'Thaylen City',
      versions: [
        {
          bookId: 'oathbringer',
          file: 'Thaylen_City.jpg',
          width: 2475,
          height: 1616,
          caption:
            'Thaylen City, annotated by Navani Kholin with the Battle of Thaylen Field.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'oathgates',
      title: 'The Oathgates',
      versions: [
        {
          bookId: 'oathbringer',
          file: 'Oathgate_Locations.jpg',
          width: 1616,
          height: 2475,
          caption: 'The ten Oathgates around Urithiru, annotated by Nazh.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'sea-of-lost-lights',
      title: 'Sea of Lost Lights',
      versions: [
        {
          bookId: 'oathbringer',
          file: 'Sea_of_Lost_Lights.jpg',
          width: 1638,
          height: 2441,
          caption: "Part of Shadesmar's Sea of Lost Lights, annotated by Nazh.",
          artist: STEWART,
        },
      ],
    },
    {
      id: 'eastern-makabak',
      title: 'Eastern Makabak',
      versions: [
        {
          bookId: 'rhythm-of-war',
          file: 'Map_of_Eastern_Makabak.jpg',
          width: 1080,
          height: 1609,
          caption: 'Eastern Makabak, annotated with the war in Emul.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'sea-of-souls',
      title: 'Sea of Souls',
      versions: [
        {
          bookId: 'rhythm-of-war',
          file: 'Sea_of_Souls.jpg',
          width: 1080,
          height: 1609,
          caption: "Part of Shadesmar's southern Sea of Souls.",
          artist: STEWART,
        },
      ],
    },
    {
      id: 'shin-monasteries',
      title: 'Shin Monasteries',
      versions: [
        {
          bookId: 'wind-and-truth',
          file: 'Map_of_Shin_Monasteries.jpg',
          width: 1347,
          height: 2048,
          caption: 'The monasteries of the ten Honorbearers in Shinovar.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'azimir',
      title: 'Azimir',
      versions: [
        {
          bookId: 'wind-and-truth',
          file: 'Plan_of_the_City_of_Azimir.jpg',
          width: 1347,
          height: 2048,
          caption: 'Azimir, showing the path of an attacking thunderclast.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'narak-defenses',
      title: 'Narak Defenses',
      versions: [
        {
          bookId: 'wind-and-truth',
          file: 'Coalition_Stronghold_at_Narak.jpg',
          width: 2048,
          height: 1347,
          caption: "The coalition's defensive plan for Narak.",
          artist: STEWART,
        },
      ],
    },
  ],
  scadrial: [
    {
      id: 'scadrial',
      title: 'Scadrial',
      versions: [
        {
          bookId: 'lost-metal',
          file: 'Scadrial_map.png',
          width: 640,
          height: 997,
          caption:
            'Scadrial after the Catacendre, with the northern and southern continents.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'final-empire',
      title: 'The Final Empire',
      versions: [
        {
          bookId: 'final-empire',
          file: 'Final_Empire_Map.jpg',
          width: 2048,
          height: 1555,
          caption: 'A color map of the Final Empire.',
          artist: STEWART,
        },
        {
          bookId: 'hero-of-ages',
          file: 'Final_Empire.png',
          width: 1653,
          height: 2659,
          caption:
            'The dominances of the Final Empire and the historic location of the Well of Ascension.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'elendel-basin',
      title: 'The Elendel Basin',
      versions: [
        {
          bookId: 'alloy-of-law',
          file: 'Elendel_Basin.png',
          width: 795,
          height: 1200,
          caption: 'The Elendel Basin, from Elendel to the Roughs.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'luthadel',
      title: 'Luthadel',
      versions: [
        {
          bookId: 'final-empire',
          edition: 'Original',
          file: 'Luthadel.png',
          width: 1568,
          height: 1200,
          caption: 'Luthadel, capital of the Final Empire.',
          artist: STEWART,
        },
        {
          bookId: 'final-empire',
          edition: 'Color',
          file: 'Luthadel-color.jpg',
          width: 1482,
          height: 1200,
          caption: 'A color map of Luthadel.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'urteau',
      title: 'Urteau',
      versions: [
        {
          bookId: 'hero-of-ages',
          file: 'Urteau.jpg',
          width: 1200,
          height: 800,
          caption:
            'Urteau and its canals after the collapse of the Final Empire.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'fadrex-city',
      title: 'Fadrex City',
      versions: [
        {
          bookId: 'hero-of-ages',
          file: 'Fadrex_City.jpg',
          width: 800,
          height: 1200,
          caption: 'Fadrex City among its rock formations.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'elendel',
      title: 'Elendel',
      versions: [
        {
          bookId: 'alloy-of-law',
          file: 'Elendel.jpg',
          width: 1589,
          height: 1200,
          caption: 'The city of Elendel and its eight octants.',
          artist: STEWART,
        },
        {
          bookId: 'lost-metal',
          file: 'Elendel_Map_(The_Lost_Metal).jpeg',
          width: 1949,
          height: 1472,
          caption: 'Elendel and its octants, with landmarks.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'new-seran',
      title: 'New Seran',
      versions: [
        {
          bookId: 'bands-of-mourning',
          file: 'New_seran.png',
          width: 523,
          height: 800,
          caption: 'The city of New Seran.',
          artist: STEWART,
        },
      ],
    },
  ],
  sel: [
    {
      id: 'opelon',
      title: 'Opelon',
      versions: [
        {
          bookId: 'elantris',
          edition: 'Original',
          file: 'Opelon.gif',
          width: 749,
          height: 486,
          caption: 'The continent of Opelon, from Teod to Fjorden.',
          artist: 'Jeff Creer',
        },
        {
          bookId: 'elantris',
          edition: 'Tenth anniversary',
          file: 'Sycla-Opelon_Map.jpg',
          width: 1640,
          height: 2438,
          caption:
            'Sycla, called Opelon by the Aonic peoples, hand-painted for the tenth-anniversary edition.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'arelon',
      title: 'Arelon',
      versions: [
        {
          bookId: 'elantris',
          edition: 'Original',
          file: 'Arelon.jpg',
          width: 923,
          height: 1384,
          caption: 'The kingdom of Arelon.',
          artist: 'Jeff Creer',
        },
        {
          bookId: 'elantris',
          edition: 'Tenth anniversary',
          file: 'Arelon_Map.jpg',
          width: 1640,
          height: 2438,
          caption: 'Arelon, hand-painted for the tenth-anniversary edition.',
          artist: STEWART,
        },
      ],
    },
    {
      id: 'elantris-and-kae',
      title: 'Elantris and Kae',
      versions: [
        {
          bookId: 'elantris',
          file: 'Elantris-Kae_Map.jpg',
          width: 2323,
          height: 1721,
          caption:
            'Elantris as it was before the Reod, and the neighboring city of Kae.',
          artist: STEWART,
        },
      ],
    },
  ],
  nalthis: [
    {
      id: 't-telir',
      title: "T'Telir",
      versions: [
        {
          bookId: 'warbreaker',
          file: 'T-Telir.png',
          width: 1024,
          height: 634,
          caption:
            "T'Telir, copied from a tapestry in the palace of Lightsong the Bold.",
          artist: 'Shawn Boyles',
        },
      ],
    },
  ],
  taldain: [
    {
      id: 'dayside',
      title: 'Dayside',
      versions: [
        {
          bookId: 'white-sand-omnibus',
          file: 'Dayside_map.jpg',
          width: 1138,
          height: 1750,
          caption: 'The Dayside of Taldain.',
          artist: 'Jian Guo',
        },
      ],
    },
    {
      id: 'kezare',
      title: 'Kezare',
      versions: [
        {
          bookId: 'white-sand-omnibus',
          file: 'Kezare_Map.jpg',
          width: 484,
          height: 346,
          caption: 'A rough map of Kezare and its surroundings.',
          artist: 'Ben McSweeney',
        },
      ],
    },
  ],
  miral: [
    {
      id: 'kingseat',
      title: 'Kingseat',
      versions: [
        {
          bookId: 'fires-of-december',
          file: 'Map_of_Kingseat_by_Tran_Nguyen.jpg',
          width: 2048,
          height: 1556,
          caption: 'Kingseat, built around the corpse of the Megalith.',
          artist: 'Tran Nguyen',
        },
      ],
    },
  ],
}

export const versionUnlocked = (
  version: MapVersion,
  hasRead: (bookId: string) => boolean,
) => [version.bookId, ...(version.alsoIn ?? [])].some(hasRead)

/** Maps with at least one version the reader has unlocked, trimmed to those versions. */
export function unlockedMaps(
  planetId: string,
  hasRead: (bookId: string) => boolean,
): PlanetMap[] {
  return (planetMaps[planetId] ?? []).flatMap((map) => {
    const versions = map.versions.filter((v) => versionUnlocked(v, hasRead))
    return versions.length ? [{ ...map, versions }] : []
  })
}
