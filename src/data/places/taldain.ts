import type { Location } from '../types'
import { p, story, wiki } from './helpers'

const WS1 = 'white-sand-1'
const WS2 = 'white-sand-2'
const WS3 = 'white-sand-3'
const WSO = 'white-sand-omnibus'

export const taldainPlaces: Location[] = [
  // Taldain: Dayside (continent, parent of everything on both maps)
  {
    id: 'dayside',
    name: 'Dayside',
    planetId: 'taldain',
    kind: 'continent',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'The sunlit side of Taldain, where the sun hangs motionless in the sky and never sets. Its people are called Daysiders.',
        WS1,
        WSO,
      ),
      p(
        'A round continent covered in white sand, with Mount KraeDa near its centre. Its nations include Kerzta, Lossand and the Rim Kingdoms.',
        WSO,
      ),
    ],
    settingOf: [story(WS1), story(WS2), story(WS3), story(WSO)],
    coppermindUrl: wiki('Taldain#Dayside'),
  },

  // Taldain: Dayside map
  {
    id: 'kerzta',
    name: 'Kerzta',
    planetId: 'taldain',
    kind: 'nation',
    parentId: 'dayside',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'The largest and most powerful nation on Dayside, covering the west of the continent. Its capital is Ker Kedasha.',
        WSO,
      ),
      p(
        'Kerztians follow Ker’reen, which worships the Sand Lord and condemns sand mastery. They have often been at odds with neighbouring Lossand.',
        WS1,
        WSO,
      ),
      p(
        'Much of the land is Kerla: sand laced with dorim vines that hold water, so Kerztians do not count it as desert.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Kerzta'),
  },
  {
    id: 'lossand',
    name: 'Lossand',
    planetId: 'taldain',
    kind: 'nation',
    parentId: 'dayside',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'A wedge-shaped nation in the south of Dayside, running from Mount KraeDa to the southern coast. Its capital is Kezare.',
        WSO,
      ),
      p(
        'It is home to the Diem, the order of sand masters, and is governed by the Taishin, a council of the heads of its eight Professions.',
        WS1,
        WSO,
      ),
      p(
        'With no dorim vines, Lossand is a true desert; its people live on islands and irrigated banks along the Ry’DoAli River.',
        WSO,
      ),
    ],
    settingOf: [story(WS1), story(WS2), story(WS3), story(WSO)],
    coppermindUrl: wiki('Lossand'),
  },
  {
    id: 'rim-kingdoms',
    name: 'Rim Kingdoms',
    planetId: 'taldain',
    kind: 'region',
    parentId: 'dayside',
    revealedIn: [WS2, WSO],
    summary: [
      p(
        'The three nations along the eastern coast of Dayside: Denka, Seevis and Tallon.',
        WS2,
        WSO,
      ),
      p(
        'A mountain range east of Mount KraeDa separates them from the Kerla and Lossand.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Taldain#Rim_Kingdoms'),
  },
  {
    id: 'denka',
    name: 'Denka',
    planetId: 'taldain',
    kind: 'nation',
    parentId: 'rim-kingdoms',
    revealedIn: [WSO],
    summary: [
      p(
        'The northernmost of the Rim Kingdoms, on the northeast edge of Dayside, with deep sand to the west and Seevis to the south.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Denka'),
  },
  {
    id: 'seevis',
    name: 'Seevis',
    planetId: 'taldain',
    kind: 'nation',
    parentId: 'rim-kingdoms',
    revealedIn: [WS2, WSO],
    summary: [
      p(
        'One of the Rim Kingdoms, on the eastern coast of Dayside between Denka and Tallon. It is ruled by King Reven.',
        WS2,
        WSO,
      ),
      p('Its western border is mountainous.', WSO),
    ],
    coppermindUrl: wiki('Seevis'),
  },
  {
    id: 'tallon',
    name: 'Tallon',
    planetId: 'taldain',
    kind: 'nation',
    parentId: 'rim-kingdoms',
    revealedIn: [WSO],
    summary: [
      p(
        'The southernmost of the Rim Kingdoms, on the southeast coast of Dayside. Its capital is Nor’Tallon, in the mountains to the west.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Tallon'),
  },
  {
    id: 'deep-sand',
    name: 'Deep sand',
    planetId: 'taldain',
    kind: 'region',
    parentId: 'dayside',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'Stretches of Dayside where the sand lies especially deep. Few people dare enter them, because large sandlings live there.',
        WS1,
        WSO,
      ),
      p(
        'Dorim vines cannot grow in deep sand, so it holds no water. Most of northern Dayside is deep sand, and another tract lies east of Lossand.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Deep_sand'),
  },
  {
    id: 'border-ocean',
    name: 'Border Ocean',
    altName: 'Northern and Southern Border Ocean',
    planetId: 'taldain',
    kind: 'region',
    revealedIn: [WSO],
    summary: [
      p(
        'The vast ocean that surrounds Dayside and separates it from Darkside. The map labels its northern and southern reaches separately.',
        WSO,
      ),
      p(
        'Experienced sailors can cross it, but a perpetual storm, the terminal storm, rages along the middle of the ocean between the two continents.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Border_Ocean'),
  },
  {
    id: 'kraeda',
    name: 'Mount KraeDa',
    altName: 'KraeDa',
    planetId: 'taldain',
    kind: 'landmark',
    parentId: 'dayside',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'A mountain at the centre of Dayside, rising from the Kerla just north of Lossand. The sun stands straight overhead there.',
        WS1,
        WSO,
      ),
      p(
        'The Diem holds its contests and ceremonies, including the Mastrell’s Path, in a secluded spot near its base.',
        WS1,
        WSO,
      ),
    ],
    settingOf: [story(WS1), story(WSO)],
    coppermindUrl: wiki('KraeDa'),
  },
  {
    id: 'dosha-har-ken',
    name: 'Dosha-Har’Ken',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'kerzta',
    revealedIn: [WSO],
    summary: [
      p(
        'A Kerztian port on the northwest coast of Dayside. A few ships from Darkside dock there each week, and some of its merchants speak Dynastic.',
        WSO,
      ),
    ],
    settingOf: [story(WSO)],
    coppermindUrl: wiki("Dosha-Har'Ken"),
  },
  {
    id: 'esh-ker-losh',
    name: 'Esh’Ker’Losh',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'kerzta',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'A Kerztian tent city in the Kerla, northwest of Mount KraeDa.',
        WS1,
        WSO,
      ),
    ],
    coppermindUrl: wiki("Esh'Ker'Losh"),
  },
  {
    id: 'ker-kedasha',
    name: 'Ker Kedasha',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'kerzta',
    revealedIn: [WSO],
    summary: [
      p(
        'The capital of Kerzta, in the southwest of Dayside, west of Kezare.',
        WSO,
      ),
      p(
        'It is the seat of the Kerztian king, whom the nobility elect every fifty years.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Ker_Kedasha'),
  },
  {
    id: 'nor-tallon',
    name: 'Nor’Tallon',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'tallon',
    revealedIn: [WSO],
    summary: [
      p(
        'The capital of Tallon, high in the mountains east of Mount KraeDa, near the headwaters of the Nor’Tallon River.',
        WSO,
      ),
    ],
    coppermindUrl: wiki("Nor'Tallon"),
  },
  {
    id: 'reveln',
    name: 'Reveln',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'seevis',
    revealedIn: [WSO],
    summary: [
      p(
        'A city in a small bay on the coast of Seevis. It may be the country’s capital.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Reveln'),
  },
  {
    id: 'kezare',
    name: 'Kezare',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'lossand',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'The capital of Lossand, built on islands where the Nor’Tallon River joins the Ry’DoAli. Ferries carry people between the shore and the islands.',
        WS1,
        WSO,
      ),
      p(
        'Most of the Taishin live there, and it holds the headquarters of the Professions, including the Diem, the Hall of Judgement and the Tower.',
        WS1,
        WSO,
      ),
    ],
    settingOf: [story(WS1), story(WS2), story(WS3), story(WSO)],
    coppermindUrl: wiki('Kezare'),
  },
  {
    id: 'lraezare',
    name: 'Lraezare',
    planetId: 'taldain',
    kind: 'city',
    parentId: 'lossand',
    revealedIn: [WS3, WSO],
    summary: [
      p(
        'A port city in Lossand on the delta where the Ry’DoAli River meets the Southern Border Ocean, about a three-day round trip by boat from Kezare.',
        WS3,
        WSO,
      ),
      p(
        'It is home to the Shipowners’ Circle, the ruling council of the Helm.',
        WS3,
        WSO,
      ),
    ],
    settingOf: [story(WS3), story(WSO)],
    coppermindUrl: wiki('Lraezare'),
  },
  {
    id: 'ry-doali-river',
    name: 'Ry’DoAli River',
    altName: 'Ry’DoAli',
    planetId: 'taldain',
    kind: 'landmark',
    parentId: 'lossand',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'The great river of Lossand and its main source of water. Kerztians distrust it, because they believe so much water in one place is unholy.',
        WS1,
        WSO,
      ),
      p(
        'It flows south from the KraeDa mountains through the centre of Lossand, past Kezare, and into the Southern Border Ocean at Lraezare.',
        WSO,
      ),
    ],
    coppermindUrl: wiki("Ry'DoAli"),
  },
  {
    id: 'nor-tallon-river',
    name: 'Nor’Tallon River',
    planetId: 'taldain',
    kind: 'landmark',
    parentId: 'dayside',
    revealedIn: [WSO],
    summary: [
      p(
        'A river that rises in the mountains of Tallon and flows west through the deep sand, joining the Ry’DoAli at Kezare.',
        WSO,
      ),
    ],
    coppermindUrl: wiki("Nor'Tallon_River"),
  },

  // Taldain: Kezare map
  {
    id: 'the-diem',
    name: 'The Diem',
    planetId: 'taldain',
    kind: 'landmark',
    parentId: 'kezare',
    revealedIn: [WS1, WSO],
    summary: [
      p(
        'The headquarters and home of the sand masters, on the outskirts of Kezare. The building also gives its name to their Profession.',
        WS1,
        WSO,
      ),
      p(
        'It is carved from a single block of white sandstone that never wears down, and it is older than the sand masters themselves.',
        WS1,
        WSO,
      ),
    ],
    settingOf: [story(WS1), story(WSO)],
    coppermindUrl: wiki('Diem'),
  },
  {
    id: 'kelzin-district',
    name: 'Kelzin District',
    planetId: 'taldain',
    kind: 'region',
    parentId: 'kezare',
    revealedIn: [WSO],
    summary: [
      p(
        'An island district of Kezare, named for the Kelzin, the wealthy landowners who form Lossand’s upper class.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Kelzi'),
  },
  {
    id: 'kel-thrain',
    name: 'KelThrain',
    altName: 'Kel Thrain',
    planetId: 'taldain',
    kind: 'landmark',
    parentId: 'kezare',
    revealedIn: [WSO],
    summary: [
      p(
        'The main bridge of Kezare, linking the main island of the city to the Kelzin District.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Kezare'),
  },
  {
    id: 'portside',
    name: 'Portside',
    planetId: 'taldain',
    kind: 'region',
    parentId: 'kezare',
    revealedIn: [WSO],
    summary: [
      p(
        'The riverside part of Kezare along the western shore of its main island, home to the portside market.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Kezare'),
  },
  {
    id: 'lonzare',
    name: 'Lonzare',
    planetId: 'taldain',
    kind: 'region',
    parentId: 'kezare',
    revealedIn: [WSO],
    summary: [
      p(
        'The Darksider quarter of Kezare, at the southern end of the city’s main island.',
        WSO,
      ),
    ],
    coppermindUrl: wiki('Kezare#Landmarks'),
  },
]
