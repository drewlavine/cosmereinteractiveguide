/**
 * Official in-world maps, hosted by the Coppermind and shown with credit.
 * Each map lists its versions in publication order. A version stays hidden
 * until the reader has read `bookId`: the later of the book the map is
 * printed in and the book whose events it shows.
 */

export interface MapVersion {
  bookId: string
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

export const mapThumbUrl = (file: string, width = 320) =>
  `${UPLOADS}/thumb/${encodeURI(file)}/${width}px-${encodeURI(file)}`

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
}

/** Maps with at least one version the reader has unlocked, trimmed to those versions. */
export function unlockedMaps(
  planetId: string,
  hasRead: (bookId: string) => boolean,
): PlanetMap[] {
  return (planetMaps[planetId] ?? []).flatMap((map) => {
    const versions = map.versions.filter((v) => hasRead(v.bookId))
    return versions.length ? [{ ...map, versions }] : []
  })
}
