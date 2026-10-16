import type { Passage, Reveal } from './types'

/**
 * One stay on a world, in the order the character lived it. A stop is shown
 * once any of its events is, so a world the reader hasn't learned they
 * visited stays hidden. Events and notes are dated like History items, by
 * the chapter that reveals them (Coppermind footnotes first).
 */
export interface TravelStop {
  planetId: string
  /** Where on the world, if it narrows things down. */
  place?: string
  /**
   * Set when the books don't say when this stay happened relative to the
   * stops around it; the note says what is and isn't known.
   */
  uncertain?: Passage
  /**
   * Set when only Brandon (not the books) says the character made this
   * trip; the note says so.
   */
  wob?: Passage
  /**
   * What else the reader must know before this stop shows at all, e.g. that
   * Zahel is Vasher. Kept apart from the events so they cite only their own
   * books.
   */
  needs?: Reveal
  events: Passage[]
}

const WB = 'warbreaker'
const ch = (book: string, chapter: string) => ({ book, chapter })

const SLM = 'sunlit-man'
/** Sigzil is Nomad: the persona's identityRevealedIn. */
const SIGZIL_IS_NOMAD = [{ all: ['way-of-kings', ch(SLM, '39')] }]

/**
 * Felt on Roshar is Felt from Mistborn only by Brandon's word (the books
 * just hint: Wind and Truth 7, Shallan wonders if he's from Roshar at all).
 * As with Vasher and Zahel, once the reader has met him on both worlds it's
 * fair to tell them, so each stop also needs his first scene on the other.
 */
const FELT_SCADRIAL = [ch('final-empire', '31'), ch('well-of-ascension', '42')]
const FELT_ROSHAR = [
  ch('words-of-radiance', '81'),
  ch('oathbringer', '114'),
  ch('rhythm-of-war', '21'),
  ch('wind-and-truth', '7'),
]

/** Hoid's ancient past, dated like its History paragraph. */
const HOID_ANCIENT = [
  {
    all: [
      ch('oathbringer', '121'),
      ch('rhythm-of-war', '84'),
      ch('wind-and-truth', '65'),
    ],
  },
]

/**
 * Worlds visited, in in-world order. Only stays told in the books are
 * listed; ones known only from Brandon's answers or annotations are left out,
 * as they are from History.
 */
export const characterTravels: Record<string, TravelStop[]> = {
  vasher: [
    {
      planetId: 'nalthis',
      events: [
        {
          text: 'Born, died and Returned; joined the Five Scholars.',
          revealedIn: [ch(WB, 'epilogue')],
        },
        {
          text: 'Awakened Nightblood with Shashara.',
          revealedIn: [ch(WB, '51')],
        },
        {
          text: 'Fought in the Manywar as Kalad and ended it with the Phantoms.',
          revealedIn: [ch(WB, 'epilogue')],
        },
      ],
    },
    {
      planetId: 'miral',
      uncertain: {
        text: 'The books don’t say when this was, only that it was long ago.',
        revealedIn: [ch('fires-of-december', 'xli')],
      },
      events: [
        {
          text: 'Became the Prophet and imprisoned the Megalith, leaving months after arriving.',
          revealedIn: [ch('fires-of-december', 'xli')],
        },
      ],
    },
    {
      planetId: 'nalthis',
      place: 'T’Telir',
      events: [
        {
          text: 'Worked in secret to stop a war between Hallandren and Idris.',
          revealedIn: [ch(WB, 'prologue')],
        },
        {
          text: 'Trained Vivenna and defeated Denth.',
          revealedIn: [ch(WB, '57')],
        },
        {
          text: 'Gave Susebron the Phantoms to stop the Lifeless army.',
          revealedIn: [ch(WB, '58')],
        },
        {
          text: 'Left with Vivenna to hunt Yesteel.',
          revealedIn: [ch(WB, 'epilogue')],
        },
      ],
    },
    {
      planetId: 'roshar',
      // As Zahel: the reader must also know he's Vasher.
      needs: [WB],
      events: [
        {
          text: 'Recruited by Gavilar Kholin as a scholar.',
          revealedIn: [ch('wind-and-truth', 'prologue')],
        },
        {
          text: 'Lived as Zahel, an ardent and swordmaster in the Kholin warcamp.',
          revealedIn: [ch('words-of-radiance', '16')],
        },
        {
          text: 'Watched the Everstorm and sent a vision of himself to Miral.',
          revealedIn: [ch('fires-of-december', 'epilogue')],
        },
        {
          text: 'Held captive in Urithiru until Lift freed him.',
          revealedIn: [ch('wind-and-truth', 'i-13')],
        },
      ],
    },
  ],
  vivenna: [
    {
      planetId: 'nalthis',
      events: [
        {
          text: 'Grew up in Idris, raised to marry the God King of Hallandren.',
          revealedIn: [ch(WB, '1')],
        },
        {
          text: 'Went to T’Telir to rescue Siri and fell in with Denth’s mercenaries.',
          revealedIn: [ch(WB, '43')],
        },
        {
          text: 'Learned to use Breath from Vasher.',
          revealedIn: [ch(WB, '49')],
        },
        {
          text: 'Left with Vasher to hunt Yesteel.',
          revealedIn: [ch(WB, 'epilogue')],
        },
      ],
    },
    {
      planetId: 'roshar',
      place: 'Kholinar',
      // As Azure: the reader must also know she's Vivenna.
      needs: [WB],
      events: [
        {
          text: 'Became Highmarshal of the Wall Guard as Azure.',
          revealedIn: [ch('oathbringer', '108')],
        },
        {
          text: 'Fled into Shadesmar with Kaladin, Shallan and Adolin, and stayed a while at Lasting Integrity.',
          revealedIn: [
            { all: [ch('oathbringer', '110'), ch('rhythm-of-war', '78')] },
          ],
        },
      ],
    },
  ],
  /**
   * Hoid's trips in the order of his Coppermind History, each event dated
   * like the History paragraph it comes from (cameos need the reader to
   * know it's him). Left out: Yolen (not in the books), Canticle (he's only
   * an illusion there) and his years aboard the Dynamic (no world, and
   * their place in his travels is unknown).
   */
  hoid: [
    {
      planetId: 'ashyn',
      events: [
        {
          text: 'Lived through the scouring of Ashyn, then called Alaswha, and left with its people for Roshar.',
          revealedIn: HOID_ANCIENT,
        },
      ],
    },
    {
      planetId: 'roshar',
      events: [
        {
          text: 'Known as Midius, taught the beings who became the Heralds to use Investiture to enhance their memories.',
          revealedIn: HOID_ANCIENT,
        },
        {
          text: 'Was at the founding of the Oathpact but declined to join it.',
          revealedIn: HOID_ANCIENT,
        },
      ],
    },
    {
      planetId: 'taldain',
      events: [
        {
          text: 'Sailed with Khriss back to Darkside, singing the passengers a song about art.',
          revealedIn: [ch('white-sand-omnibus', '18')],
        },
      ],
    },
    {
      planetId: 'sel',
      events: [
        {
          text: 'Disguised as a beggar, helped Sarene smuggle weapons into Elantris.',
          revealedIn: ['elantris'],
        },
        {
          text: 'Betrayed the forger Wan ShaiLu to get the Moon Scepter.',
          revealedIn: [ch('emperors-soul', 'day-2')],
        },
      ],
    },
    {
      planetId: 'scadrial',
      events: [
        {
          text: 'Worked as an informant in Luthadel and met Kelsier.',
          revealedIn: [
            { all: [ch('final-empire', '19'), ch('hero-of-ages', '27')] },
          ],
        },
        {
          text: 'Reached the Well of Ascension through the Cognitive Realm and stole a bead of lerasium.',
          revealedIn: [ch('secret-history', '3-2')],
        },
        {
          text: 'Studied Feruchemy in the Terris Dominance and led Terris refugees to the Central Dominance.',
          revealedIn: [
            {
              all: [ch('well-of-ascension', '56'), ch('secret-history', '2-2')],
            },
          ],
        },
        {
          text: 'Worked as an informant again in Fadrex City.',
          revealedIn: [
            { all: [ch('hero-of-ages', '27'), ch('secret-history', '6-1')] },
          ],
        },
      ],
    },
    {
      planetId: 'nalthis',
      events: [
        {
          text: 'Told stories at the Court of Gods as a master storyteller.',
          revealedIn: [
            {
              all: [
                ch(WB, '52'),
                ch('words-of-radiance', '59'),
                ch('rhythm-of-war', 'epilogue'),
              ],
            },
          ],
        },
        {
          text: 'Gambled heavily, rigging things so he could never lose.',
          revealedIn: [ch('rhythm-of-war', '99')],
        },
      ],
    },
    {
      planetId: 'threnody',
      events: [
        {
          text: 'Stopped at Silence Montane’s waystop.',
          revealedIn: ['shadows-for-silence'],
        },
      ],
    },
    {
      planetId: 'roshar',
      events: [
        {
          text: 'Warned the Unkalaki about the Gods Who Sleep Not.',
          revealedIn: [ch('dawnshard', '15')],
        },
        {
          text: 'Comforted a young Shallan at the Middlefest Fair in Jah Keved.',
          revealedIn: [ch('words-of-radiance', '55')],
        },
        {
          text: 'Became King Elhokar’s Wit on the Shattered Plains.',
          revealedIn: [ch('way-of-kings', '57')],
        },
        {
          text: 'Met Jasnah as she returned from the Cognitive Realm, as the Everstorm reached Shinovar.',
          revealedIn: [ch('words-of-radiance', 'epilogue')],
        },
        {
          text: 'Went to war in Emul with Jasnah.',
          revealedIn: [ch('rhythm-of-war', '99')],
        },
        {
          text: 'Helped Jasnah draft the contract for the contest of champions.',
          revealedIn: [
            {
              all: [
                ch('rhythm-of-war', 'epilogue'),
                ch('yumi', 'another-epilogue'),
              ],
            },
          ],
        },
        {
          text: 'Gave his Dawnshard to Sigzil before Retribution destroyed his body.',
          revealedIn: [ch('wind-and-truth', '146')],
        },
      ],
    },
    {
      planetId: 'scadrial',
      events: [
        {
          text: 'Regenerated from a cell culture of his flesh kept by Ulaam.',
          revealedIn: [
            { all: [ch('yumi', '21'), ch('wind-and-truth', 'epilogue')] },
          ],
        },
        {
          text: 'Became Wax’s carriage driver and befriended Wayne.',
          revealedIn: [
            { all: [ch('alloy-of-law', '4'), ch('shadows-of-self', '7')] },
          ],
        },
        {
          text: 'Begged outside the Shores mansion in New Seran and threw Wax a metalmind.',
          revealedIn: [ch('bands-of-mourning', '11')],
        },
        {
          text: 'Rescued Wax from the ocean after the fight in Bilming.',
          revealedIn: [ch('lost-metal', '72')],
        },
      ],
    },
    {
      planetId: 'miral',
      events: [
        {
          text: 'Came looking for Valor and accidentally gave December a vision of a possible life.',
          revealedIn: [
            {
              all: [
                ch('wind-and-truth', 'epilogue'),
                ch('fires-of-december', 'epilogue'),
              ],
            },
          ],
        },
        {
          text: 'Burned nearly to nothing by Valor’s temple trap in Kingseat, then helped December.',
          revealedIn: [ch('fires-of-december', 'epilogue')],
        },
      ],
    },
    {
      planetId: 'lumar',
      uncertain: {
        text: 'The books don’t say when this was among his other travels.',
        revealedIn: ['tress'],
      },
      events: [
        {
          text: 'Cursed by the Sorceress after a bet with her.',
          revealedIn: [ch('tress', '64')],
        },
        {
          text: 'Wandered the seas with Ulaam while cursed, then served as cabin boy on the Crow’s Song.',
          revealedIn: [ch('tress', '42')],
        },
        {
          text: 'Broke the curse aboard the Sorceress’s ship and became an Elantrian.',
          revealedIn: [ch('tress', 'epilogue')],
        },
      ],
    },
    {
      planetId: 'komashi',
      uncertain: {
        text: 'The books don’t say exactly when this was.',
        revealedIn: [ch('yumi', 'another-epilogue')],
      },
      events: [
        {
          text: 'Frozen in place when the father machine tried to absorb his Investiture; Design used him as a coatrack.',
          revealedIn: [
            {
              all: [
                ch('rhythm-of-war', 'epilogue'),
                ch('yumi', 'another-epilogue'),
              ],
            },
          ],
        },
      ],
    },
  ],
  felt: [
    {
      planetId: 'scadrial',
      place: 'Luthadel',
      needs: FELT_ROSHAR,
      events: [
        {
          text: 'Spied on Kelsier’s crew for House Venture.',
          revealedIn: [ch('final-empire', '31')],
        },
        {
          text: 'Found how a poisoner was getting into besieged Luthadel.',
          revealedIn: [ch('well-of-ascension', '42')],
        },
      ],
    },
    {
      planetId: 'roshar',
      needs: FELT_SCADRIAL,
      wob: {
        text: 'The books never say this is the Felt from Scadrial; Brandon Sanderson has confirmed it.',
        revealedIn: FELT_ROSHAR,
      },
      events: [
        {
          text: 'Guided Dalinar Kholin to the Nightwatcher.',
          revealedIn: [ch('oathbringer', '114')],
        },
        {
          text: 'Scouted the plateaus before the Battle of Narak.',
          revealedIn: [ch('words-of-radiance', '81')],
        },
        {
          text: 'Crossed Shadesmar with Adolin and Shallan to Lasting Integrity.',
          revealedIn: [ch('rhythm-of-war', '21')],
        },
        {
          text: 'Captured the Herald Kalak for the Ghostbloods.',
          revealedIn: [ch('wind-and-truth', 'i-1')],
        },
      ],
    },
  ],
  sigzil: [
    {
      planetId: 'roshar',
      // He's Nomad in The Sunlit Man: the reader must also know who Nomad is.
      needs: SIGZIL_IS_NOMAD,
      events: [
        {
          text: 'Travelled widely as a Worldsinger’s apprentice.',
          revealedIn: [ch('way-of-kings', '55')],
        },
        {
          text: 'Served as a bridgeman in Bridge Four.',
          revealedIn: [ch('way-of-kings', '14')],
        },
        {
          text: 'Became a Windrunner and later companylord of the Windrunners.',
          revealedIn: [ch('rhythm-of-war', '19')],
        },
        {
          text: 'Renounced his oaths to save his spren.',
          revealedIn: [ch('wind-and-truth', '118')],
        },
        {
          text: 'Took Wit’s Dawnshard and fled into Shadesmar.',
          revealedIn: [ch('wind-and-truth', '147')],
        },
      ],
    },
    {
      planetId: 'ashyn',
      uncertain: {
        text: 'The books say only that he came here during his decades on the run.',
        revealedIn: [ch(SLM, '15')],
      },
      events: [
        {
          text: 'Visited while fleeing the Night Brigade.',
          revealedIn: [ch(SLM, '15')],
        },
      ],
    },
    {
      planetId: 'threnody',
      uncertain: {
        text: 'The books say only that he came here during his decades on the run.',
        revealedIn: [ch(SLM, '15')],
      },
      events: [
        {
          text: 'Visited while fleeing the Night Brigade.',
          revealedIn: [ch(SLM, '15')],
        },
      ],
    },
    {
      planetId: 'canticle',
      events: [
        {
          text: 'Arrived as Nomad with almost no Investiture and was captured.',
          revealedIn: [ch(SLM, '1')],
        },
        {
          text: 'Helped bring down the Cinder King.',
          revealedIn: [ch(SLM, 'epilogue')],
        },
      ],
    },
    {
      planetId: 'utol',
      events: [
        {
          text: 'Skipped here after leaving Canticle.',
          revealedIn: [ch(SLM, 'epilogue')],
        },
      ],
    },
  ],
}
