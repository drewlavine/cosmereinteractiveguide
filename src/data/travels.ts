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
}
