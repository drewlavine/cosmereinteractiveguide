import type { Location } from '../types'
import { p, story, wiki } from './helpers'

const FOD = 'fires-of-december'

export const miralPlaces: Location[] = [
  // Miral: Mountaincrest (not drawn, parent of Kingseat)
  {
    id: 'mountaincrest',
    name: 'Mountaincrest',
    planetId: 'miral',
    kind: 'nation',
    revealedIn: [FOD],
    summary: [
      p(
        'A kingdom on Miral built on a huge, gently sloping mountain, with its capital, Kingseat, at the summit.',
        FOD,
      ),
      p(
        'Three rivers of blood flow down from Kingseat through the kingdom and have long served as its routes for transport.',
        FOD,
      ),
    ],
    settingOf: [story(FOD)],
    coppermindUrl: wiki('Miral#Mountaincrest'),
  },
  // Map of Kingseat (painted, no printed labels)
  {
    id: 'kingseat',
    name: 'Kingseat',
    planetId: 'miral',
    kind: 'city',
    parentId: 'mountaincrest',
    revealedIn: [FOD],
    summary: [
      p(
        'The walled capital of Mountaincrest, at the top of the kingdom’s mountain. The city grew up around the Megalith, whose body is as large as the city itself.',
        FOD,
      ),
      p('The city holds the royal palace and a temple to Valor.', FOD),
    ],
    settingOf: [story(FOD)],
    coppermindUrl: wiki('Miral#Mountaincrest'),
  },
  {
    id: 'megalith',
    name: 'The Megalith',
    planetId: 'miral',
    kind: 'landmark',
    parentId: 'kingseat',
    revealedIn: [FOD],
    summary: [
      p(
        'The corpse of a giant humanoid lying against the mountain at the heart of Kingseat, as large as the city that grew up around it.',
        FOD,
      ),
      p(
        'Its heart is the source of the three blood rivers that flow out through Mountaincrest, and its body is harvested for demonstone.',
        FOD,
      ),
    ],
    settingOf: [story(FOD)],
    coppermindUrl: wiki('Megalith'),
  },
]
