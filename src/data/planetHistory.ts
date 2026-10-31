import { books, findBook } from './books'
import { characterPortraits, type Portrait } from './characterPortraits'
import { entryArt } from './entryArt'
import { findLocation } from './locations'
import { chapterIndex, chapterLabel } from './progress'
import type { CanSee } from './reveal'
import type { Location, Reveal, RevealPoint } from './types'

/**
 * A planet's history, told in eras and moments for its page's History
 * section. Hand-written from the Coppermind (in our own words, Cosmere-only)
 * and dated like every other fact: each telling shows from the chapter that
 * reveals it, and later tellings retell a moment as the books reveal more.
 *
 * Eras run in the planet's own order, worded relative to its own events
 * ("about three centuries before the Manywar"), never in shared Cosmere
 * years. A moment that is also an event in the shared chronology names it in
 * `chrono`, so the two can be checked against each other.
 */

export type MomentKind = 'legend' | 'magic' | 'war' | 'realm'

/** Some words and the books that reveal them. */
interface Dated {
  text: string
  revealedIn: Reveal
}

/**
 * One telling of a moment. Of the tellings the reader has reached, the last
 * is current; whatever it leaves out carries over from the ones before.
 */
interface Told {
  revealedIn: Reveal
  title?: string
  text?: string
  /** Where it happened: location ids on this planet. */
  places?: string[]
  /** Moments that led to it, by id. */
  after?: string[]
  /** `character:<id>` for a portrait, else an `entryArt` key. */
  art?: string
}

interface Moment {
  id: string
  kind: MomentKind
  told: Told[]
  /** The shared chronology's event for it, if it has one. */
  chrono?: string
}

interface Era {
  id: string
  /** A plain title, or titles revealed in turn (the last one reached wins). */
  title: string | Dated[]
  when?: Dated[]
  /** A colour for the era (hex). */
  tone: string
  moments: Moment[]
}

const wb = (chapter: string) => ({ book: 'warbreaker', chapter })
const fe = (chapter: string) => ({ book: 'final-empire', chapter })
const woa = (chapter: string) => ({ book: 'well-of-ascension', chapter })
const hoa = (chapter: string) => ({ book: 'hero-of-ages', chapter })

export const planetHistory: Record<string, Era[]> = {
  nalthis: [
    {
      id: 'long-ago',
      title: 'Long ago',
      tone: '#8c7ae6',
      moments: [
        {
          id: 'endowment',
          kind: 'magic',
          chrono: 'cosmere-endowment-settles-nalthis',
          told: [
            {
              revealedIn: [
                {
                  all: [
                    'warbreaker',
                    { book: 'secret-history', chapter: '3-2' },
                  ],
                },
              ],
              title: 'Endowment settles here',
              text: 'Endowment, one of the Shards, made its home on Nalthis, and it is the only Shard there.',
            },
          ],
        },
        {
          id: 'bargain',
          kind: 'legend',
          told: [
            {
              revealedIn: [{ book: 'wind-and-truth', chapter: '56' }],
              title: 'An old bargain',
              text: 'The power that dwells on Nalthis keeps to its own world under an old agreement, and grants its people gifts that make them seem like gods.',
            },
          ],
        },
      ],
    },
    {
      id: 'first-returned',
      title: [{ text: 'The First Returned', revealedIn: [wb('32')] }],
      when: [
        {
          text: 'About three centuries before the Manywar',
          revealedIn: [wb('32')],
        },
      ],
      tone: '#e0b25c',
      moments: [
        {
          id: 'vo',
          kind: 'legend',
          told: [
            {
              revealedIn: [wb('32')],
              title: 'Vo, the First Returned',
              text: 'Cheden sailors came upon the Tears of Edgli in a land the Pahn Kahl already lived in. One of them, Vo, died and came back as the first of the Returned, spoke the Five Visions and died again within a week. His shipmates founded a kingdom and crowned his widow, beginning the royal line that Siri’s family still carries.',
            },
          ],
        },
      ],
    },
    {
      id: 'scholars',
      title: [{ text: 'The Five Scholars', revealedIn: [wb('32')] }],
      when: [{ text: 'Just before the Manywar', revealedIn: [wb('32')] }],
      tone: '#5fb3c9',
      moments: [
        {
          id: 'awakening',
          kind: 'magic',
          told: [
            {
              revealedIn: [wb('32')],
              title: 'Awakening is worked out',
              text: 'Awakening, the art of putting Breath into things to bring them to life, was only worked out about four centuries ago.',
            },
          ],
        },
        {
          id: 'scholars',
          kind: 'magic',
          told: [
            {
              revealedIn: [wb('32')],
              title: 'The Five Scholars',
              text: 'Five scholars set off a flood of discoveries about how Awakening works.',
            },
            {
              revealedIn: [wb('epilogue')],
              text: 'Five scholars set off a flood of discoveries about how Awakening works. They were Vasher, Denth, Shashara, Arsteel and Yesteel.',
            },
          ],
        },
        {
          id: 'one-breath',
          kind: 'magic',
          told: [
            {
              revealedIn: [wb('32')],
              title: 'Lifeless from one Breath',
              text: 'One of the Scholars found how to make a Lifeless soldier with a single Breath.',
            },
            {
              revealedIn: [wb('51')],
              text: 'Shashara found how to make a Lifeless soldier with a single Breath.',
            },
            {
              revealedIn: [wb('epilogue')],
              text: 'Shashara found how to make a Lifeless soldier with a single Breath, and gave the secret to every nation.',
            },
          ],
        },
      ],
    },
    {
      id: 'manywar',
      title: [{ text: 'The Manywar', revealedIn: [wb('15')] }],
      when: [
        { text: 'Generations ago', revealedIn: [wb('15')] },
        { text: 'About three hundred years ago', revealedIn: [wb('32')] },
      ],
      tone: '#d9645a',
      moments: [
        {
          id: 'kalad-war',
          kind: 'war',
          chrono: 'nalthis-manywar-begins',
          told: [
            {
              revealedIn: [wb('15')],
              title: 'Kalad starts the Manywar',
              text: 'A man named Kalad started the Manywar, and the old royal family was driven out of Hallandren into Idris.',
            },
            {
              revealedIn: [wb('32')],
              text: 'Kalad, one of the Scholars, seized power in Hallandren, and the royal family broke with him and left. The war that followed was fought over Breath and Lifeless as much as over the dye flowers.',
              after: ['one-breath'],
            },
            {
              revealedIn: [wb('epilogue')],
              text: 'Kalad, one of the Scholars, seized power in Hallandren, and the royal family broke with him and left. He struck Kuth and Huth first; other nations joined against him and the Scholars split between the sides. By the end, both kingdoms were gone.',
            },
          ],
        },
        {
          id: 'phantoms',
          kind: 'war',
          told: [
            {
              revealedIn: [wb('32')],
              title: 'Kalad’s Phantoms',
              text: 'Kalad was said to have built a new, stronger kind of Lifeless, remembered as Kalad’s Phantoms.',
            },
            {
              revealedIn: [wb('58')],
              text: 'Kalad’s Phantoms were real: Lifeless of stone wrapped around Awakened bones. They still stand in T’Telir as the D’Denir statues, waiting for a Command.',
              places: ['d-denir-garden'],
            },
          ],
        },
        {
          id: 'nightblood',
          kind: 'magic',
          chrono: 'nalthis-nightblood-created',
          told: [
            {
              revealedIn: [{ all: [wb('51'), wb('57')] }],
              title: 'Nightblood is made',
              text: 'Vasher and Shashara Awakened a sword with a single Command: destroy evil.',
              art: 'character:nightblood',
            },
          ],
        },
        {
          id: 'twilight-falls',
          kind: 'war',
          chrono: 'nalthis-manywar-ends',
          told: [
            {
              revealedIn: [{ all: [wb('57'), wb('58')] }],
              title: 'Twilight Falls',
              text: 'The last great battle of the Manywar was fought at Twilight Falls, the first time Nightblood was drawn.',
              after: ['nightblood'],
            },
          ],
        },
        {
          id: 'peacegiver',
          kind: 'realm',
          told: [
            {
              revealedIn: [wb('15')],
              title: 'Peacegiver the Blessed',
              text: 'A Returned called Peacegiver ended the Manywar and left behind a great treasure of Breath, the source of the God King’s power.',
            },
            {
              revealedIn: [wb('32')],
              text: 'Peacegiver ended the Manywar and dispelled Kalad’s Phantoms. His great store of Breath passes from each God King to the next.',
              after: ['phantoms'],
            },
            {
              revealedIn: [wb('58')],
              text: 'Peacegiver never died: he is Vasher. To end the war he hid Kalad’s Phantoms in plain sight, as the D’Denir statues of T’Telir, and his store of Breath passes from each God King to the next.',
              places: ['d-denir-garden'],
              art: 'character:vasher',
            },
            {
              revealedIn: [wb('epilogue')],
              title: 'Kalad becomes Peacegiver',
              text: 'Kalad and Peacegiver were one man. The Scholar who started the Manywar ended it, founded the line of God Kings with his Breath and hid his own Phantoms as the D’Denir. He lives on as Vasher.',
            },
          ],
        },
        {
          id: 'idris',
          kind: 'realm',
          told: [
            {
              revealedIn: [wb('46')],
              title: 'Idris is founded',
              text: 'The royal family never came back. They built a new kingdom, Idris, in the northern highlands, where Austrism turned against Awakening and against worshipping the Returned.',
              after: ['kalad-war'],
            },
          ],
        },
      ],
    },
    {
      id: 'god-kings',
      title: [{ text: 'Under the God Kings', revealedIn: [wb('1')] }],
      when: [
        {
          text: 'The three centuries since the Manywar',
          revealedIn: [wb('32')],
        },
      ],
      tone: '#e3c35a',
      moments: [
        {
          id: 'court',
          kind: 'realm',
          told: [
            {
              revealedIn: [wb('3')],
              title: 'The Court of Gods',
              text: 'Hallandren worships its Returned as gods in the Court of Gods, with the God King ruling above them all.',
              places: ['court-of-gods', 'god-kings-palace'],
              art: 'character:lightsong',
            },
            { revealedIn: [wb('15')], after: ['peacegiver'] },
          ],
        },
        {
          id: 'pahn-kahl',
          kind: 'realm',
          told: [
            {
              revealedIn: [wb('54')],
              title: 'A conquered people',
              text: 'The Pahn Kahl, who lived in the land before Hallandren, became a people ruled by it.',
            },
            {
              revealedIn: [wb('57')],
              text: 'The Pahn Kahl, who lived in the land before Hallandren, became a people ruled by it, their own ways pressed almost out of sight.',
            },
          ],
        },
        {
          id: 'treaty',
          kind: 'realm',
          told: [
            {
              revealedIn: [wb('1')],
              title: 'An uneasy peace',
              text: 'Hallandren and Idris keep an uneasy peace, under a treaty that owes the God King an Idrian princess as his bride.',
            },
          ],
        },
        {
          id: 'vahr',
          kind: 'war',
          told: [
            {
              revealedIn: [wb('19')],
              title: 'Vahr’s rebellion',
              text: 'Vahr gathered Breath and followers against the throne. Once he was caught his rising fell apart, and Hallandren grew warier of Idris.',
            },
            {
              revealedIn: [wb('31')],
              text: 'Vahr, a Pahn Kahl, gathered Breath and followers against the throne. Once he was caught his rising fell apart, and Hallandren grew warier of Idris.',
            },
          ],
        },
      ],
    },
    {
      id: 'bride',
      title: [
        { text: 'The God King’s bride', revealedIn: [wb('1')] },
        { text: 'The Pahn Kahl rebellion', revealedIn: [wb('57')] },
      ],
      when: [
        { text: 'Three centuries after the Manywar', revealedIn: [wb('32')] },
      ],
      tone: '#e58fb8',
      moments: [
        {
          id: 'siri',
          kind: 'realm',
          chrono: 'nalthis-siri-sent-to-hallandren',
          told: [
            {
              revealedIn: [wb('1')],
              title: 'Siri is sent south',
              text: 'King Dedelin sends his youngest daughter, Siri, to marry the God King in place of her sister Vivenna, who had been raised for it.',
              places: ['god-kings-palace'],
              after: ['treaty'],
            },
          ],
        },
        {
          id: 'war-debate',
          kind: 'war',
          told: [
            {
              revealedIn: [wb('15')],
              title: 'Talk of war',
              text: 'In the Court of Gods, more and more voices argue for war with Idris.',
              places: ['court-of-gods'],
            },
          ],
        },
        {
          id: 'pahn-kahl-strike',
          kind: 'war',
          told: [
            {
              revealedIn: [wb('54')],
              title: 'Bluefingers strikes',
              text: 'Bluefingers, the palace’s chief scribe, springs his plot: he seizes the God King and the Commands of the Lifeless armies, and sends them against Idris.',
              places: ['god-kings-palace'],
            },
            {
              revealedIn: [wb('57')],
              title: 'The Pahn Kahl rebellion',
              text: 'Bluefingers, the palace’s chief scribe, seizes the God King and the Commands of the Lifeless armies and sends them against Idris, hoping the war will let his people, the Pahn Kahl, rise.',
              after: ['pahn-kahl'],
            },
          ],
        },
        {
          id: 'lightsong',
          kind: 'magic',
          chrono: 'nalthis-lightsong-sacrifices-himself',
          told: [
            {
              revealedIn: [wb('58')],
              title: 'Lightsong’s gift',
              text: 'Lightsong gives up his divine Breath to heal Susebron’s tongue, and dies.',
              places: ['god-kings-palace'],
              art: 'character:lightsong',
            },
          ],
        },
        {
          id: 'rebellion-stopped',
          kind: 'realm',
          chrono: 'nalthis-pahn-kahl-rebellion-stopped',
          told: [
            {
              revealedIn: [wb('58')],
              title: 'The rebellion fails',
              text: 'His voice restored, Susebron takes back his palace and has Bluefingers arrested. Vasher reveals that he is Peacegiver and gives Susebron the Command that wakes the D’Denir, to stop the Lifeless before they reach Idris.',
              places: ['god-kings-palace', 'd-denir-garden'],
              after: ['lightsong', 'pahn-kahl-strike', 'phantoms'],
              art: 'character:susebron',
            },
          ],
        },
      ],
    },
    {
      id: 'after',
      title: [
        { text: 'Later years', revealedIn: [{ book: 'tress', chapter: '15' }] },
        { text: 'After the rebellion', revealedIn: [wb('epilogue')] },
      ],
      tone: '#7cc78f',
      moments: [
        {
          id: 'd-denir-march',
          kind: 'war',
          told: [
            {
              revealedIn: [wb('epilogue')],
              title: 'The stone army marches',
              text: 'A thousand stone soldiers march out of T’Telir after the Lifeless armies.',
              places: ['d-denir-garden'],
              after: ['rebellion-stopped'],
            },
          ],
        },
        {
          id: 'north',
          kind: 'legend',
          told: [
            {
              revealedIn: [wb('epilogue')],
              title: 'Trouble in the north',
              text: 'Yesteel, another of the Scholars, has turned up north of the mountains with a stronger ichor-alcohol and plans to forge Kuth and Huth anew. Vasher and Vivenna head north after him.',
            },
          ],
        },
        {
          id: 'awakened-devices',
          kind: 'magic',
          told: [
            {
              revealedIn: [{ book: 'tress', chapter: '15' }],
              title: 'Awakened devices',
              text: 'In later years Nalthians master Awakened devices, such as ones that sense what their user means to write.',
            },
          ],
        },
      ],
    },
  ],

  scadrial: [
    {
      id: 'long-ago',
      title: 'Long ago',
      tone: '#8c7ae6',
      moments: [
        {
          id: 'made',
          kind: 'legend',
          told: [
            {
              revealedIn: [hoa('55')],
              title: 'Two powers make the world',
              text: 'Two opposed powers, Ruin and Preservation, made the world and its people together.',
            },
          ],
        },
      ],
    },
    {
      id: 'deepness',
      title: [{ text: 'The Deepness', revealedIn: [fe('5')] }],
      when: [{ text: 'Before the Final Empire', revealedIn: [fe('5')] }],
      tone: '#6c7a91',
      moments: [
        {
          id: 'deepness',
          kind: 'legend',
          told: [
            {
              revealedIn: [fe('5')],
              title: 'The Deepness',
              text: 'Long ago a terrible darkness, the Deepness, threatened to destroy the world.',
            },
            {
              revealedIn: [woa('37')],
              text: 'Long ago the Deepness threatened to destroy the world. It was the mists themselves, lingering through the day and killing.',
            },
          ],
        },
        {
          id: 'prophecy',
          kind: 'legend',
          told: [
            {
              revealedIn: [fe('15')],
              title: 'The Hero of Ages',
              text: 'Terris prophecies foretold a Hero of Ages who would come to save the world.',
            },
          ],
        },
        {
          id: 'logbook',
          kind: 'legend',
          chrono: 'scadrial-e1-rashek-at-well',
          told: [
            {
              revealedIn: [fe('14')],
              title: 'The hero’s journey',
              text: 'An ancient logbook, thought to be the Lord Ruler’s own, tells of a hero’s long journey north with Terris packmen to face the Deepness.',
            },
            {
              revealedIn: [fe('38')],
              title: 'The packman',
              text: 'The logbook’s hero never became the Lord Ruler. The Lord Ruler was Rashek, one of the Terris packmen on that journey.',
              art: 'character:rashek',
            },
            {
              revealedIn: [woa('50')],
              text: 'The hero was Alendi. Kwaan, the Terris scholar who first proclaimed him, came to doubt him and set Rashek to stop him. Rashek killed Alendi at the Well of Ascension and took its power for himself.',
            },
          ],
        },
      ],
    },
    {
      id: 'rise',
      title: [{ text: 'The Lord Ruler’s rise', revealedIn: [fe('8')] }],
      tone: '#c98f4a',
      moments: [
        {
          id: 'ascension',
          kind: 'magic',
          told: [
            {
              revealedIn: [fe('8')],
              title: 'The Ascension',
              text: 'The Ministry teaches that the Lord Ruler saved the world from the Deepness, and has ruled it as God ever since.',
            },
            {
              revealedIn: [hoa('15')],
              text: 'The Lord Ruler used the Well’s power to save the world from the Deepness, but each fix made new trouble: he pushed the world nearer its sun, raised ashmounts to cool it, and changed plants and people to live with the ash.',
            },
          ],
        },
        {
          id: 'conquest',
          kind: 'war',
          told: [
            {
              revealedIn: [{ all: [fe('11'), hoa('28')] }],
              title: 'One empire',
              text: 'He conquered the whole world, sparing only a few foreign kings, whom he made Mistborn to rule under him.',
            },
          ],
        },
      ],
    },
    {
      id: 'final-empire',
      title: [{ text: 'The Final Empire', revealedIn: [fe('prologue')] }],
      when: [{ text: 'A thousand years', revealedIn: [fe('8')] }],
      tone: '#a3443f',
      moments: [
        {
          id: 'nobles-skaa',
          kind: 'realm',
          told: [
            {
              revealedIn: [fe('prologue')],
              title: 'Nobles and skaa',
              text: 'The empire is split in two: nobles who own the land, and skaa who work it as slaves.',
            },
            {
              revealedIn: [hoa('25')],
              text: 'The empire is split in two: nobles who own the land, and skaa who work it as slaves. The Lord Ruler made them differ in body, too: nobles taller and stronger but less fertile, skaa smaller, hardier and more fertile.',
            },
          ],
        },
        {
          id: 'empire',
          kind: 'realm',
          told: [
            {
              revealedIn: [fe('8')],
              title: 'A thousand years of ash',
              text: 'For a thousand years the Lord Ruler has held an empire of ashfall and mist, built on the labour of skaa slaves.',
            },
          ],
        },
        {
          id: 'one-faith',
          kind: 'realm',
          told: [
            {
              revealedIn: [fe('29')],
              title: 'One faith',
              text: 'Every other religion has been stamped out under the Lord Ruler; Keepers like Sazed still carry hundreds of lost faiths in memory.',
            },
          ],
        },
      ],
    },
    {
      id: 'rebellion',
      title: [
        { text: 'Kelsier’s rebellion', revealedIn: [fe('3')] },
        { text: 'The fall of the Lord Ruler', revealedIn: [fe('38')] },
      ],
      tone: '#d4a540',
      moments: [
        {
          id: 'crew',
          kind: 'war',
          chrono: 'scadrial-e1-kelsier-rebellion',
          told: [
            {
              revealedIn: [fe('3')],
              title: 'Kelsier’s crew',
              text: 'Kelsier, a Mistborn thief, gathers a crew in Luthadel to bring down the Final Empire.',
              places: ['luthadel'],
            },
          ],
        },
        {
          id: 'pits',
          kind: 'war',
          chrono: 'scadrial-e1-pits-destroyed',
          told: [
            {
              revealedIn: [fe('33')],
              title: 'The Pits of Hathsin',
              text: 'Kelsier shatters the atium crystals at the Pits of Hathsin.',
              places: ['pits-of-hathsin'],
            },
          ],
        },
        {
          id: 'kelsier-dies',
          kind: 'war',
          chrono: 'scadrial-e1-kelsier-killed',
          told: [
            {
              revealedIn: [fe('34')],
              title: 'Kelsier’s death',
              text: 'The Lord Ruler kills Kelsier in Luthadel, in front of a crowd of skaa.',
              places: ['luthadel'],
            },
          ],
        },
        {
          id: 'lord-ruler-falls',
          kind: 'war',
          chrono: 'scadrial-e1-collapse',
          told: [
            {
              revealedIn: [fe('38')],
              title: 'The Lord Ruler falls',
              text: 'Vin kills the Lord Ruler.',
              art: 'character:lord-ruler',
              after: ['crew'],
            },
            {
              revealedIn: [fe('epilogue')],
              text: 'Vin kills the Lord Ruler, and his empire falls apart. Elend Venture takes the throne in Luthadel.',
              places: ['luthadel'],
            },
          ],
        },
      ],
    },
    {
      id: 'elend',
      title: [{ text: 'Elend’s kingdom', revealedIn: [woa('1')] }],
      tone: '#5f8fd9',
      moments: [
        {
          id: 'siege',
          kind: 'war',
          chrono: 'scadrial-e1-siege-of-luthadel',
          told: [
            {
              revealedIn: [woa('1')],
              title: 'Luthadel besieged',
              text: 'Armies close in on Luthadel, where Elend is trying to rule.',
              places: ['luthadel'],
              after: ['lord-ruler-falls'],
            },
          ],
        },
        {
          id: 'battle',
          kind: 'war',
          chrono: 'scadrial-e1-battle-of-luthadel',
          told: [
            {
              revealedIn: [woa('55')],
              title: 'The Battle of Luthadel',
              text: 'When koloss break into the city, Vin turns the battle.',
              places: ['luthadel'],
              after: ['siege'],
            },
          ],
        },
        {
          id: 'well',
          kind: 'magic',
          chrono: 'scadrial-e1-well-power-released',
          told: [
            {
              revealedIn: [woa('58')],
              title: 'The Well of Ascension',
              text: 'Vin finds the Well beneath Luthadel and lets its power go rather than take it.',
              places: ['luthadel'],
            },
            {
              revealedIn: ['hero-of-ages'],
              text: 'Vin finds the Well beneath Luthadel and lets its power go rather than take it, which sets Ruin free.',
            },
          ],
        },
        {
          id: 'elend-mistborn',
          kind: 'magic',
          chrono: 'scadrial-e1-elend-mistborn',
          told: [
            {
              revealedIn: [woa('59')],
              title: 'Elend becomes Mistborn',
              text: 'Elend survives a deadly wound and wakes as a Mistborn.',
            },
          ],
        },
      ],
    },
    {
      id: 'last-days',
      title: [{ text: 'The last days', revealedIn: [hoa('1')] }],
      tone: '#9bb36a',
      moments: [
        {
          id: 'ashfall',
          kind: 'war',
          chrono: 'scadrial-e1-catastrophe-escalates',
          told: [
            {
              revealedIn: [hoa('48')],
              title: 'The ash thickens',
              text: 'Ash falls ever heavier and the ashmounts erupt more and more, as the world nears its end.',
            },
          ],
        },
        {
          id: 'hathsin',
          kind: 'war',
          chrono: 'scadrial-e1-battle-of-hathsin',
          told: [
            {
              revealedIn: [hoa('81')],
              title: 'The Battle of Hathsin',
              text: 'The last battle is fought at the Pits of Hathsin.',
              places: ['pits-of-hathsin'],
            },
            {
              revealedIn: [hoa('82')],
              text: 'In the last battle, at the Pits of Hathsin, Elend falls. Vin takes up Preservation’s power and ends Ruin, dying with it.',
            },
          ],
        },
        {
          id: 'restored',
          kind: 'magic',
          chrono: 'scadrial-e1-scadrial-restored',
          told: [
            {
              revealedIn: [hoa('82')],
              title: 'The world remade',
              text: 'Sazed takes up both powers and remakes the world.',
              after: ['hathsin'],
            },
            {
              revealedIn: [hoa('epilogue')],
              text: 'Sazed takes up both powers and remakes the world, and the survivors walk out into a green land without ash.',
            },
          ],
        },
      ],
    },
  ],
}

/** Where the reader first learned something, in reading order. */
export interface Since {
  order: number
  book: string
  chapter?: string
}

export interface Telling {
  since: Since
  title: string
  text: string
}

export interface ShownMoment {
  id: string
  kind: MomentKind
  title: string
  text: string
  places: Location[]
  /** Shown moments that led to this one. */
  after: string[]
  art?: Portrait
  chrono?: string
  /** Each telling the reader has reached, oldest first, as it read then. */
  versions: Telling[]
}

export interface ShownEra {
  id: string
  title: string
  /** Each title the reader has reached, oldest first. */
  titles: { since?: Since; text: string }[]
  when?: string
  tone: string
  moments: ShownMoment[]
}

const bookRank = new Map(books.map((b, i) => [b.id, b.year * 1e6 + i * 1e3]))

/** A reveal point's place in reading order: by publication, then chapter. */
function order(point: RevealPoint): number {
  if (typeof point === 'string') return (bookRank.get(point) ?? Infinity) + 999
  if ('all' in point) return Math.max(...point.all.map(order))
  const rank = bookRank.get(point.book) ?? Infinity
  return rank + (chapterIndex(point.book, point.chapter) ?? 998)
}

/** The first point of a visible reveal the reader has reached. */
function since(reveal: Reveal, show: CanSee): Since {
  let point = reveal
    .filter((p) => show([p]))
    .reduce((a, b) => (order(b) < order(a) ? b : a))
  if (typeof point !== 'string' && 'all' in point)
    point = point.all.reduce((a, b) => (order(b) > order(a) ? b : a))
  if (typeof point === 'string')
    return { order: order(point), book: findBook(point)?.title ?? point }
  return {
    order: order(point),
    book: findBook(point.book)?.title ?? point.book,
    chapter: chapterLabel(point.book, point.chapter) ?? point.chapter,
  }
}

export const sinceLabel = (s: Since) =>
  s.chapter ? `${s.book}, ${s.chapter}` : s.book

const artFor = (key: string, show: CanSee) =>
  (key.startsWith('character:')
    ? characterPortraits[key.slice('character:'.length)]
    : entryArt[key]
  )?.find((piece) => show(piece.revealedIn))

/**
 * A planet's history trimmed to what the reader may see: eras with their
 * latest titles, and moments as last told, with their places, causes and
 * art cut to what is visible too. `viewAnyway` shows everything; `spoilers`
 * still says whether anything is hidden from the reader's books.
 */
export function revealPlanetHistory(
  planetId: string,
  canSee: CanSee,
  viewAnyway = false,
): { eras: ShownEra[]; spoilers: boolean } {
  const show: CanSee = viewAnyway ? () => true : canSee
  let spoilers = false
  const visible = <T extends { revealedIn: Reveal }>(list: readonly T[]) => {
    if (list.some((x) => !canSee(x.revealedIn))) spoilers = true
    return list.filter((x) => show(x.revealedIn))
  }

  const eras = (planetHistory[planetId] ?? []).flatMap((era): ShownEra[] => {
    const titles =
      typeof era.title === 'string'
        ? [{ text: era.title }]
        : visible(era.title).map((t) => ({
            since: since(t.revealedIn, show),
            text: t.text,
          }))
    const when = visible(era.when ?? []).at(-1)?.text
    const moments = era.moments.flatMap((moment): ShownMoment[] => {
      let current: Omit<Told, 'revealedIn'> = {}
      const versions = visible(moment.told).flatMap((told): Telling[] => {
        current = { ...current, ...told }
        const { title, text } = current
        return title && text
          ? [{ since: since(told.revealedIn, show), title, text }]
          : []
      })
      const { title, text, places = [], after = [], art } = current
      if (!title || !text) return []
      return [
        {
          id: moment.id,
          kind: moment.kind,
          title,
          text,
          places: places.flatMap((id) => {
            const place = findLocation(planetId, id)
            return place && show(place.revealedIn) ? [place] : []
          }),
          after,
          art: art ? artFor(art, show) : undefined,
          chrono: moment.chrono,
          versions,
        },
      ]
    })
    const title = titles.at(-1)?.text
    return title && moments.length
      ? [{ id: era.id, title, titles, when, tone: era.tone, moments }]
      : []
  })

  const shown = new Set(eras.flatMap((e) => e.moments.map((m) => m.id)))
  for (const era of eras)
    for (const moment of era.moments)
      moment.after = moment.after.filter((id) => shown.has(id))
  return { eras, spoilers }
}
