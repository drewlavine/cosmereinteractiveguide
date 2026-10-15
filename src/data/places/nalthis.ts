import type { Location } from '../types'
import { p, story, wiki } from './helpers'

const WB = 'warbreaker'

export const nalthisPlaces: Location[] = [
  // Nalthis: Hallandren (not drawn, parent of everything on the T'Telir map)
  {
    id: 'hallandren',
    name: 'Hallandren',
    planetId: 'nalthis',
    kind: 'nation',
    revealedIn: [WB],
    summary: [
      p(
        'The most powerful kingdom on Nalthis, set in a warm jungle valley beside the Bright Sea. Its capital is T’Telir.',
        WB,
      ),
      p(
        'A theocracy ruled from the Court of Gods by the Returned, who are worshipped as gods, with the God King at their head.',
        WB,
      ),
      p(
        'Known as the Kingdom of Iridescence for its love of bright color, it is the only place the Tears of Edgli flowers grow, and its dyes make it rich.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki('Hallandren'),
  },
  {
    id: 't-telir',
    name: 'T’Telir',
    planetId: 'nalthis',
    kind: 'city',
    parentId: 'hallandren',
    revealedIn: [WB],
    summary: [
      p(
        'The capital of Hallandren, built in a crescent around a sheltered bay of the Bright Sea, which makes it a prime port.',
        WB,
      ),
      p(
        'A tropical city famous for its blaze of color: painted buildings, brightly dressed people, and gardens full of palms and flowers.',
        WB,
      ),
      p(
        'An immense, ornate wall guards its landward side, and the walled Court of Gods sits on a plateau within it.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki("T'Telir"),
  },

  // Nalthis: T'Telir map
  {
    id: 'court-of-gods',
    name: 'Court of Gods',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'A walled complex on a plateau in T’Telir, home to the Returned and the seat of Hallandren’s government.',
        WB,
      ),
      p(
        'Each Returned has a palace in its color, set in a ring around the great black palace of the God King. The court also holds an arena.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki('Court_of_Gods'),
  },
  {
    id: 'god-kings-palace',
    name: 'God King’s Palace',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 'court-of-gods',
    revealedIn: [WB],
    summary: [
      p(
        'The home of the God King, a huge, stepped black pyramid at the far end of the Court of Gods, opposite its gates.',
        WB,
      ),
      p(
        'Its black stone walls are hidden inside by silks and tiles, so each room the God King uses has its own color.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki('Court_of_Gods'),
  },
  {
    id: 'the-highlands',
    name: 'The Highlands',
    planetId: 'nalthis',
    kind: 'region',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'A slum in the north of T’Telir and the city’s Idrian quarter, where most Idrians in the city live.',
        WB,
      ),
      p(
        'It is drabber than the rest of T’Telir and is run by a few slumlords.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki("T'Telir"),
  },
  {
    id: 'lemexs-house',
    name: 'Lemex’s House',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'The home of Lemex, an Idrian merchant in T’Telir who heads King Dedelin’s spies in Hallandren.',
        WB,
      ),
      p('Vivenna seeks him out here soon after she arrives in the city.', WB),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki('Lemex'),
  },
  {
    id: 'denths-safehouse',
    name: 'Denth’s Safehouse',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'A hideout near the waterfront used by the mercenary Denth and his crew.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki("T'Telir"),
  },
  {
    id: 't-telir-market',
    name: 'Market',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'One of T’Telir’s many open-air markets, crowded with tents, performers and merchants from across the Bright Sea and beyond.',
        WB,
      ),
      p(
        'Like most of the city’s markets, it is bright with color and decorated with D’Denir statues.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki("T'Telir"),
  },
  {
    id: 'd-denir-garden',
    name: 'D’Denir Garden',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'A quiet, grassy park in T’Telir filled with hundreds of weathered D’Denir statues of warriors, the oldest in the city.',
        WB,
      ),
      p(
        'The Hallandren believe Peacegiver the Blessed left the statues as a memorial to those who died in the Manywar. Unlike the city’s other gardens, it has no flowers or trees.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki("D'Denir_garden"),
  },
  {
    id: 'crossroads-garden',
    name: 'Crossroads Garden',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'A public park in T’Telir, livelier and greener than the solemn D’Denir garden.',
        WB,
      ),
    ],
    mentionedIn: [story(WB)],
    coppermindUrl: wiki('Crossroads_Garden'),
  },
  {
    id: 't-telir-docks',
    name: 'T’Telir Docks',
    planetId: 'nalthis',
    kind: 'landmark',
    parentId: 't-telir',
    revealedIn: [WB],
    summary: [
      p(
        'The city’s waterfront of piers, shipyards and warehouses, with dock slums between them where the dockhands live and drink.',
        WB,
      ),
      p(
        'Anyone fishing T’Telir’s waters must pay a fee, though some avoid it by fishing at night.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki("T'Telir"),
  },
  {
    id: 'bright-sea',
    name: 'Bright Sea',
    altName: 'Inner Sea',
    planetId: 'nalthis',
    kind: 'region',
    revealedIn: [WB],
    summary: [
      p(
        'A large inland sea beside Hallandren. T’Telir is built around a bay on its shore. Idrians call it the Inner Sea.',
        WB,
      ),
      p(
        'Hallandren holds about a third of its coast, and the sea’s trade routes help make the kingdom rich. Dangerous storms sweep it in spring.',
        WB,
      ),
    ],
    settingOf: [story(WB)],
    coppermindUrl: wiki('Bright_Sea'),
  },
  {
    id: 'hallandren-jungle',
    name: 'Hallandren Jungle',
    planetId: 'nalthis',
    kind: 'region',
    parentId: 'hallandren',
    revealedIn: [WB],
    summary: [
      p(
        'Past the palms and sandy soil just outside T’Telir’s walls, the land gives way to jungle, home to panthers, parrots, monkeys and snakes.',
        WB,
      ),
      p(
        'The jungle around T’Telir is the only place the Tears of Edgli grow; parts of it are cleared for food and dye crops.',
        WB,
      ),
    ],
    mentionedIn: [story(WB)],
    coppermindUrl: wiki('Hallandren'),
  },
]
