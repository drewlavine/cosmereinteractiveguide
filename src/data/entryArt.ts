import type { Portrait } from './characterPortraits'

/**
 * Art for Magic and Culture entries, by `<kind>:<id>`, earliest first; the
 * page shows the latest piece the reader may see. Same rules as
 * `characterPortraits`: credited, dated by the latest thing it shows.
 * `glyph` art is a symbol, shown whole on a plain panel.
 */
export interface EntryArt extends Portrait {
  glyph?: boolean
}

const ISAAC = 'https://coppermind.net/wiki/Coppermind:Artists/Isaac_Stewart'
const ARGYLE = 'https://coppermind.net/wiki/Coppermind:Artists/Steve_Argyle'

const order = (
  id: string,
  name: string,
  glyphFrom: Portrait['revealedIn'],
  paintingAlt: string,
  paintingFrom: Portrait['revealedIn'],
): [string, EntryArt[]] => [
  `ability:order-of-${id}`,
  [
    {
      src: `/entries/order-of-${id}-glyph.svg`,
      alt: `The glyph of the ${name}`,
      artist: 'Isaac Stewart (traced by Cuaiir)',
      artistUrl: ISAAC,
      revealedIn: glyphFrom,
      glyph: true,
    },
    {
      src: `/entries/order-of-${id}-argyle.webp`,
      alt: paintingAlt,
      artist: 'Steve Argyle',
      artistUrl: ARGYLE,
      revealedIn: paintingFrom,
    },
  ],
]

export const entryArt: Record<string, EntryArt[]> = Object.fromEntries([
  // Paintings from The Way of Kings leatherbound edition. Those of unnamed
  // Radiants show from the order's first mention; those showing modern
  // Radiants wait until the books have shown them in that order (and in
  // Plate, where they wear it).
  // Kaladin as a Windrunner, from Words of Radiance's end; shown with his flying portrait
  order(
    'windrunners',
    'Windrunners',
    [{ book: 'way-of-kings', chapter: '52' }],
    'Two Windrunners in blue uniforms flying through the clouds, one holding a spear',
    [{ all: ['words-of-radiance', { book: 'oathbringer', chapter: '7' }] }],
  ),
  // Unnamed Radiants of the order in Shardplate
  order(
    'skybreakers',
    'Skybreakers',
    [{ book: 'words-of-radiance', chapter: '55' }],
    'Two Skybreakers in silver Shardplate leaping through purple storm light, one with a sword',
    [{ book: 'words-of-radiance', chapter: '55' }],
  ),
  // Unnamed Radiants of the order in Shardplate
  order(
    'dustbringers',
    'Dustbringers',
    [{ book: 'words-of-radiance', chapter: '36' }],
    'Two Dustbringers in glowing red Shardplate, one raising a sword',
    [{ book: 'words-of-radiance', chapter: '36' }],
  ),
  // Unnamed Radiants of the order in Shardplate
  order(
    'edgedancers',
    'Edgedancers',
    [{ book: 'words-of-radiance', chapter: 'i-9' }],
    'Two Edgedancers in silver Shardplate sweeping a glowing blue blade over snow',
    [{ book: 'words-of-radiance', chapter: 'i-9' }],
  ),
  // Shows a modern Truthwatcher in Plate; dated late to be safe
  order(
    'truthwatchers',
    'Truthwatchers',
    [{ book: 'words-of-radiance', chapter: '52' }],
    'Two Truthwatchers in green and gold Shardplate, one holding a curved golden blade',
    ['rhythm-of-war'],
  ),
  // Shows a modern Lightweaver in Plate; dated late to be safe
  order(
    'lightweavers',
    'Lightweavers',
    [{ book: 'words-of-radiance', chapter: '49' }],
    'Two Lightweavers, one in red Shardplate holding a fiery blade, beside a white-haired man in a waistcoat',
    ['wind-and-truth'],
  ),
  // Shows a modern Elsecaller; dated late to be safe
  order(
    'elsecallers',
    'Elsecallers',
    [{ book: 'words-of-radiance', chapter: '53' }],
    'A woman in a dark blue gown with a glowing sword, beside a towering figure in blue Shardplate',
    ['rhythm-of-war'],
  ),
  // Shows a modern Willshaper; dated late to be safe
  order(
    'willshapers',
    'Willshapers',
    [{ book: 'words-of-radiance', chapter: '50' }],
    'Two Willshapers, one in dark gold Shardplate with a jagged blade and one glowing purple',
    ['rhythm-of-war'],
  ),
  // Unnamed Radiants of the order in Shardplate
  order(
    'stonewards',
    'Stonewards',
    [{ book: 'words-of-radiance', chapter: '37' }],
    'Two Stonewards in bronze Shardplate among red rock, holding a polearm and a hammer',
    [{ book: 'words-of-radiance', chapter: '37' }],
  ),
  // Shows modern Bondsmiths; dated late to be safe
  order(
    'bondsmiths',
    'Bondsmiths',
    [{ book: 'words-of-radiance', chapter: '44' }],
    'Two Bondsmiths, a man in a blue uniform and a woman in a white and gold gown with a golden blade',
    ['rhythm-of-war'],
  ),
])
