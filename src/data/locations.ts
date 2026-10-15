import type { Location, Passage, Story } from './types'

const wiki = (page: string) => `https://coppermind.net/wiki/${page}`

// Spoiler tags work as in systems.ts: book ids, earliest published first.
const p = (text: string, ...revealedIn: string[]): Passage => ({
  text,
  revealedIn,
})
const story = (bookId: string, ...alsoIn: string[]): Story => ({
  bookId,
  revealedIn: [bookId, ...alsoIn],
})

const ELA = 'elantris'
const HOPE = 'hope-of-elantris'
const ES = 'emperors-soul'
const AU = 'arcanum-unbounded'

// Places in Elantris, and in The Hope of Elantris too.
const ELANTRIS = [ELA]
const ELANTRIS_HOPE = [ELA, HOPE, AU]

export const locations: Location[] = [
  // Sel: Opelon (Sycla) and Teod
  {
    id: 'sycla',
    name: 'Sycla',
    altName: 'Opelon',
    planetId: 'sel',
    kind: 'continent',
    revealedIn: ELANTRIS_HOPE,
    summary: [
      p(
        'The continent of Sel where Elantris takes place. Aonic peoples call it Opelon; the Fjordell call it Sycla.',
        ...ELANTRIS,
      ),
      p(
        'Apart from Arelon, nearly every nation on it now answers to the Fjordell Empire. A vast desert lies to the south.',
        ...ELANTRIS,
      ),
    ],
    settingOf: [story(ELA), story(HOPE, AU)],
    mentionedIn: [story(ES, AU)],
    coppermindUrl: wiki('Sel#Opelon.2FSycla'),
  },
  {
    id: 'teod',
    name: 'Teod',
    planetId: 'sel',
    kind: 'nation',
    revealedIn: [ELA, ES, AU],
    summary: [
      p(
        'A small, cold, forested kingdom on a peninsula of the northern continent, across the Sea of Fjorden from Opelon. Its capital is Teoras.',
        ...ELANTRIS,
      ),
      p(
        'Teod’s strength is its navy, which rules the northern sea and guards it against the Fjordell.',
        ...ELANTRIS,
      ),
      p(
        'Its people are of nearly pure Aonic descent, and it is the heartland of the Shu-Korath faith.',
        ...ELANTRIS,
      ),
      p(
        'Mountains crossed by little-used passes separate Teod from the Rose Empire to its north.',
        ES,
        AU,
      ),
    ],
    mentionedIn: [story(ES, AU)],
    coppermindUrl: wiki('Teod'),
  },
  {
    id: 'arelon',
    name: 'Arelon',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS_HOPE,
    summary: [
      p(
        'The northwesternmost kingdom of Opelon, bounded by the northern sea and the Atad Mountains. The shining city of Elantris once sat at its heart.',
        ...ELANTRIS,
      ),
      p(
        'Before the Reod, the Elantrians governed Arelon. After their fall, wealthy merchants seized power, crowned Iadon king, and moved the capital to Kae.',
        ...ELANTRIS,
      ),
      p(
        'Under Iadon, noble rank depends on wealth, and peasants are bound to plantations, each named after an Aon.',
        ...ELANTRIS,
      ),
      p(
        'Its people are mostly Korathi, and its currency is the deo.',
        ...ELANTRIS,
      ),
    ],
    settingOf: [story(ELA), story(HOPE, AU)],
    coppermindUrl: wiki('Arelon'),
  },
  {
    id: 'duladel',
    name: 'Duladel',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A kingdom directly south of Arelon, bordered by Fjorden and JinDo, with steppes, caves and swamps. Its capital is Fellavoo.',
        ...ELANTRIS,
      ),
      p(
        'The Dula are a mixed Aonic and JinDo people, known as easygoing, flamboyant dressers and the finest fencers on Opelon.',
        ...ELANTRIS,
      ),
      p(
        'Long a republic that followed the nature faith Jesker, Duladel fell to a bloody revolution about six months before the story, leaving a Derethi monarchy under Fjordell influence.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Duladel'),
  },
  {
    id: 'atad-mountains',
    name: 'Atad Mountains',
    altName: 'Dathreki Mountains',
    planetId: 'sel',
    kind: 'landmark',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A mountain range along the border between Arelon and Fjorden. The Arelene call it the Atad; the Fjordell, the Dathreki.',
        ...ELANTRIS,
      ),
      p(
        'For generations the range shielded Arelon from Fjordell invasion.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Atad_Mountains'),
  },
  {
    id: 'fjorden',
    name: 'Fjorden',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'The largest and strongest nation of Opelon, east of the Atad Mountains, with a harsh, cold climate. Its capital is Widor.',
        ...ELANTRIS,
      ),
      p(
        'A theocracy led by the Wyrn, head of Shu-Dereth. About three centuries ago it turned from conquering by army to conquering by conversion.',
        ...ELANTRIS,
      ),
      p(
        'Most of the continent’s nations are now Derethi client states of the Fjordell Empire, each keeping its own ruler but bowing to the Wyrn.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Fjorden'),
  },
  {
    id: 'jindo',
    name: 'JinDo',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: [ELA, ES, AU],
    summary: [
      p(
        'A nation in southern Opelon, south of Duladel and west of Jaador, now part of the Fjordell Empire.',
        ...ELANTRIS,
      ),
      p(
        'The JinDo chose to submit peacefully and outwardly convert to Shu-Dereth rather than fight. Shu-Keseg, parent of both the Derethi and Korathi faiths, began here.',
        ...ELANTRIS,
      ),
      p(
        'JinDo is known for its philosophers and mathematicians, its spicy cooking, and the meditative martial art ChayShan.',
        ...ELANTRIS,
      ),
      p(
        'JinDo artists are known and admired even in the distant Rose Empire.',
        ES,
        AU,
      ),
    ],
    mentionedIn: [story(ES, AU)],
    coppermindUrl: wiki('JinDo'),
  },
  {
    id: 'jaador',
    name: 'Jaador',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A landlocked Fjordell client state in southern Opelon, between JinDo and Hraggen, with desert to its south. Kjaard is a notable city.',
        ...ELANTRIS,
      ),
      p(
        'Its people are ethnically JinDo and renowned as chefs. They invented the light dueling sword called the jedaver.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Jaador'),
  },
  {
    id: 'hraggen',
    name: 'Hraggen',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A small, mountainous Fjordell client state southeast of Fjorden, bordering Jaador, Hrovell and Geant. Gmordsom is its main city.',
        ...ELANTRIS,
      ),
      p(
        'Hraggish chefs and foods, like the pink kathari fruit, are well known.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Hraggen'),
  },
  {
    id: 'geant',
    name: 'Geant',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A coastal Fjordell client state at the eastern edge of the empire, south of Svorden.',
        ...ELANTRIS,
      ),
      p(
        'Unlike Svorden, Geant has lost its own language and identity; its people speak Fjordell.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Geant'),
  },
  {
    id: 'svorden',
    name: 'Svorden',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: [ELA, ES, AU],
    summary: [
      p(
        'A wealthy kingdom on the northeastern peninsula of Opelon, with its capital at Seraven. Though a Fjordell vassal, it keeps its own language.',
        ...ELANTRIS,
      ),
      p(
        'Svorden is the cultural and scholarly center of the east, home to a respected university and a powerful navy.',
        ...ELANTRIS,
      ),
      p(
        'Svordish books are read in the Rose Empire, though relations between the two realms have cooled.',
        ES,
        AU,
      ),
    ],
    mentionedIn: [story(ES, AU)],
    coppermindUrl: wiki('Svorden'),
  },
  {
    id: 'hrovell',
    name: 'Hrovell',
    planetId: 'sel',
    kind: 'nation',
    parentId: 'sycla',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A remote, rural Fjordell client state in the empire’s southeast, cut off from world events.',
        ...ELANTRIS,
      ),
      p(
        'Its people speak a heavily drifted Fjordell dialect, and old faiths like the Jeskeri Mysteries survive there in secret.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Hrovell'),
  },

  // Sel: Arelon's cities and landmarks
  {
    id: 'elantris',
    name: 'Elantris',
    planetId: 'sel',
    kind: 'city',
    parentId: 'arelon',
    revealedIn: ELANTRIS_HOPE,
    summary: [
      p(
        'Once the glowing “city of the gods” and capital of Arelon, home to the Elantrians who ruled the land.',
        ...ELANTRIS_HOPE,
      ),
      p(
        'Ten years ago it fell in the Reod. It now lies dark and grimy, sealed off as a prison for anyone taken by the Shaod.',
        ...ELANTRIS_HOPE,
      ),
      p(
        'Four outer cities ring it at the points of the compass; only Kae is still well populated.',
        ...ELANTRIS,
      ),
      p(
        'The Hope of Elantris follows a night inside the city with Matisse, a young Elantrian who looks after its children.',
        HOPE,
        AU,
      ),
    ],
    settingOf: [story(ELA), story(HOPE, AU)],
    coppermindUrl: wiki('Elantris_(city)'),
  },
  {
    id: 'kae',
    name: 'Kae',
    planetId: 'sel',
    kind: 'city',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'One of the four cities around Elantris, just east of it. After the Reod it became Arelon’s capital and the seat of its new nobility.',
        ...ELANTRIS,
      ),
      p(
        'A well-kept, sprawling, lightly walled city on the Aredel River near the Atad foothills, with the finest port on the northern coast.',
        ...ELANTRIS,
      ),
    ],
    settingOf: [story(ELA)],
    coppermindUrl: wiki('Kae'),
  },
  {
    id: 'kondeon',
    name: 'Kondeon',
    planetId: 'sel',
    kind: 'city',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A town on the Aredel River, about halfway between Elantris and Lake Alonoe.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Kondeon'),
  },
  {
    id: 'kaltii',
    name: 'Kaltii',
    planetId: 'sel',
    kind: 'city',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [p('A town in southern Arelon, beside the Chasm.', ...ELANTRIS)],
    coppermindUrl: wiki('Kaltii'),
  },
  {
    id: 'fellavoo',
    name: 'Fellavoo',
    planetId: 'sel',
    kind: 'city',
    parentId: 'duladel',
    revealedIn: ELANTRIS,
    summary: [p('The capital of Duladel.', ...ELANTRIS)],
    coppermindUrl: wiki('Fellavoo'),
  },
  {
    id: 'haiko',
    name: 'HaiKo',
    planetId: 'sel',
    kind: 'city',
    parentId: 'jindo',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A JinDo city on a river near the borders with Fjorden and Duladel.',
        ...ELANTRIS,
      ),
      p(
        'It lends its name to a greasy JinDo dish that Kiin cooks with shrimp.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('HaiKo'),
  },
  {
    id: 'the-chasm',
    name: 'The Chasm',
    planetId: 'sel',
    kind: 'landmark',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A long rift cutting across southern Arelon, near the Kalomo River and the town of Kaltii.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Chasm'),
  },
  {
    id: 'lake-alonoe',
    name: 'Lake Alonoe',
    planetId: 'sel',
    kind: 'landmark',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'One of the largest lakes on the continent, near the center of Arelon. Rivers from the southwestern mountains feed it, and the Aredel River flows from it.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Lake_Alonoe'),
  },
  {
    id: 'aredel-river',
    name: 'Aredel River',
    planetId: 'sel',
    kind: 'landmark',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'Arelon’s main river, flowing from Lake Alonoe past Elantris and Kae to the Sea of Fjorden, where it forms Kae’s bay.',
        ...ELANTRIS,
      ),
      p(
        'Kae sometimes diverts it to flush its sewers, whose plumbing stopped working after the Reod.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Aredel_River'),
  },
  {
    id: 'kalomo-river',
    name: 'Kalomo River',
    planetId: 'sel',
    kind: 'landmark',
    parentId: 'arelon',
    revealedIn: ELANTRIS,
    summary: [
      p(
        'A river in southern Arelon that forms the natural border with Duladel, running beside the Chasm.',
        ...ELANTRIS,
      ),
    ],
    coppermindUrl: wiki('Kalomo_River'),
  },
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
