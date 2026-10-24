import type { Portrait } from './characterPortraits'

/**
 * Art for Magic, Culture and Lifeforms entries and for places (`place:<id>`),
 * by `<kind>:<id>`, earliest first; the
 * page shows the latest piece the reader may see. Same rules as
 * `characterPortraits`: credited, dated by the latest thing it shows.
 * `glyph` art is a symbol, shown whole on a plain panel.
 */
export interface EntryArt extends Portrait {
  glyph?: boolean
}

const ISAAC = 'https://coppermind.net/wiki/Coppermind:Artists/Isaac_Stewart'
const ARGYLE = 'https://coppermind.net/wiki/Coppermind:Artists/Steve_Argyle'
const artists = (name: string) =>
  `https://coppermind.net/wiki/Coppermind:Artists/${encodeURIComponent(name.replace(/ /g, '_'))}`
const HOLLY = "Holly D'Oench"
const ECCOS = 'EccoS'
const BRIGHT = 'BrightWatcher'
const BEN = 'Ben McSweeney'

type Point = Portrait['revealedIn']

const piece = (
  id: string,
  n: number,
  alt: string,
  artist: string,
  revealedIn: Point,
): EntryArt => ({
  src: `/entries/lifeform-${id}${n > 1 ? `-${n}` : ''}.webp`,
  alt,
  artist,
  artistUrl: artists(artist),
  revealedIn,
})

// Pages from Shallan's Sketchbook in Rhythm of War; they wait for its end.
const sketchbook = (id: string, n: number, name: string): EntryArt =>
  piece(id, n, `Shallan's sketchbook page on ${name}`, BEN, ['rhythm-of-war'])

const wok = (chapter: string): Point => [{ book: 'way-of-kings', chapter }]
const wor = (chapter: string): Point => [{ book: 'words-of-radiance', chapter }]
const ob = (chapter: string): Point => [{ book: 'oathbringer', chapter }]
const row = (chapter: string): Point => [{ book: 'rhythm-of-war', chapter }]

// Spren art from the Coppermind. Crops of Holly D'Oench's spren paintings
// show one spren each, dated by that spren's page. Cognitive Realm views
// wait for the chapter that shows them there.
const spren: Record<string, EntryArt[]> = {
  agonyspren: [
    piece(
      'agonyspren',
      1,
      'Agonyspren, dark writhing shapes with faces in them',
      BRIGHT,
      row('12'),
    ),
  ],
  alespren: [
    piece(
      'alespren',
      1,
      'Alespren, bubbles rising from a cup, labelled winespren',
      'Miranda Meeks',
      wok('i-5'),
    ),
  ],
  angerspren: [
    piece(
      'angerspren',
      1,
      'Angerspren, a boiling pool of red',
      HOLLY,
      wok('15'),
    ),
    piece(
      'angerspren',
      2,
      'Angerspren as they look in the Cognitive Realm',
      BRIGHT,
      ob('95'),
    ),
  ],
  anguishspren: [
    piece(
      'anguishspren',
      1,
      'Anguishspren, pale tooth-like shapes covering a hillside',
      BRIGHT,
      row('prologue'),
    ),
  ],
  anticipationspren: [
    piece(
      'anticipationspren',
      1,
      'Anticipationspren, red streamers rising from the ground',
      HOLLY,
      wok('6'),
    ),
    piece(
      'anticipationspren',
      2,
      'Anticipationspren in Shadesmar, red streamers rising from beasts, with riders behind',
      ECCOS,
      ob('97'),
    ),
  ],
  awespren: [
    piece('awespren', 1, 'Awespren, blue rings like smoke', HOLLY, wor('78')),
  ],
  bindspren: [
    piece(
      'bindspren',
      1,
      'Bindspren, dark blue blots like ink',
      HOLLY,
      wok('57'),
    ),
  ],
  coldspren: [
    piece('coldspren', 1, 'Coldspren, pale blue spikes', HOLLY, ob('8')),
  ],
  concentrationspren: [
    piece(
      'concentrationspren',
      1,
      'Concentrationspren, blue ripples in the air',
      HOLLY,
      [
        {
          all: [
            { book: 'edgedancer', chapter: '13' },
            { book: 'oathbringer', chapter: '104' },
          ],
        },
      ],
    ),
  ],
  deathspren: [
    piece(
      'deathspren',
      1,
      'A deathspren, a black creature with many legs',
      'Marianne Eie',
      wok('45'),
    ),
  ],
  exhaustionspren: [
    piece(
      'exhaustionspren',
      1,
      'Exhaustionspren, brown jets rising like dust',
      HOLLY,
      [
        { book: 'words-of-radiance', chapter: '11' },
        { book: 'oathbringer', chapter: '49' },
      ],
    ),
  ],
  fearspren: [
    piece('fearspren', 1, 'Fearspren, violet globs', HOLLY, wok('prologue')),
  ],
  flamespren: [
    piece(
      'flamespren',
      1,
      'Flamespren, some held inside spheres',
      ECCOS,
      // Shows spren held in gems; waits for Oathbringer's end
      ['oathbringer'],
    ),
  ],
  gloomspren: [
    piece(
      'gloomspren',
      1,
      'Gloomspren, grey tattered streamers',
      HOLLY,
      ob('5'),
    ),
  ],
  gloryspren: [
    piece(
      'gloryspren',
      1,
      'Gloryspren, golden spheres of light',
      HOLLY,
      wok('12'),
    ),
  ],
  hungerspren: [
    piece('hungerspren', 1, 'Hungerspren, small brown flies', HOLLY, wok('2')),
  ],
  joyspren: [
    piece(
      'joyspren',
      1,
      'Joyspren, blue leaves blowing in a circle',
      HOLLY,
      ob('122'),
    ),
  ],
  laughterspren: [
    piece(
      'laughterspren',
      1,
      'Laughterspren, silvery fish darting in circles',
      HOLLY,
      wok('14'),
    ),
  ],
  lifespren: [
    piece('lifespren', 1, 'Lifespren, glowing green specks', HOLLY, wok('3')),
  ],
  logicspren: [
    piece(
      'logicspren',
      1,
      'Logicspren, small grey storm clouds',
      HOLLY,
      wok('7'),
    ),
  ],
  luckspren: [
    piece(
      'luckspren',
      1,
      "A luckspren, an arrow-like shape, from Shallan's sketchbook",
      BEN,
      wok('15'),
    ),
  ],
  mandra: [
    piece(
      'mandra',
      1,
      "Mandras, long arrow-like spren, from Shallan's sketchbook",
      BEN,
      [
        {
          all: [
            { book: 'words-of-radiance', chapter: '70' },
            { book: 'oathbringer', chapter: '99' },
          ],
        },
      ],
    ),
  ],
  musicspren: [
    piece(
      'musicspren',
      1,
      'Musicspren around a Ryshadium and its rider',
      ECCOS,
      ['oathbringer'],
    ),
  ],
  'oathgate-spren': [
    piece(
      'oathgate-spren',
      1,
      'Two Oathgate spren, one dark and one pale, either side of a gate',
      BEN,
      ob('112'),
    ),
  ],
  painspren: [
    piece('painspren', 1, 'Painspren, orange hands', HOLLY, wok('16')),
    piece(
      'painspren',
      2,
      'A painspren, an orange hand over a pale, bony one',
      'Elisgardor',
      ob('62'),
    ),
  ],
  passionspren: [
    piece(
      'passionspren',
      1,
      'Passionspren, crystal flakes like snow',
      HOLLY,
      wok('61'),
    ),
    piece(
      'passionspren',
      2,
      'Passionspren as they look in the Cognitive Realm',
      BRIGHT,
      row('29'),
    ),
  ],
  rainspren: [
    piece(
      'rainspren',
      1,
      'Rainspren, blue candles with a single eye on top',
      ECCOS,
      wok('44'),
    ),
  ],
  riverspren: [
    piece(
      'riverspren',
      1,
      'A riverspren, a long green eel-like creature',
      HOLLY,
      wok('i-1'),
    ),
  ],
  rotspren: [
    piece(
      'rotspren',
      1,
      'Rotspren, red specks on a wounded arm',
      'Emmy',
      wok('27'),
    ),
  ],
  shamespren: [
    piece(
      'shamespren',
      1,
      'Shamespren, red and white petals falling',
      HOLLY,
      ob('9'),
    ),
  ],
  shockspren: [
    piece(
      'shockspren',
      1,
      'Shockspren, pale yellow triangles breaking apart',
      BRIGHT,
      ob('19'),
    ),
  ],
  spren: [
    piece('spren', 1, 'A page of painted emotion spren, each labelled', HOLLY, [
      'oathbringer',
    ]),
  ],
  starspren: [
    piece(
      'starspren',
      1,
      'A starspren, a vast pale shape in the night sky above two people',
      'Connor Chamberlain',
      row('34'),
    ),
  ],
  windspren: [
    piece('windspren', 1, 'Windspren, blue ribbons of wind', HOLLY, wok('2')),
  ],
  // True spren
  ashspren: [
    piece(
      'ashspren',
      1,
      'A woman with glowing cracks in her skin, ash blowing from her hand',
      ECCOS,
      // May show a known Dustbringer; waits for Oathbringer's end
      ['oathbringer'],
    ),
    sketchbook('ashspren', 2, 'ashspren'),
  ],
  cryptic: [
    piece(
      'cryptic',
      1,
      'Figures with crystal-patterned heads in a doorway, from The Way of Kings',
      BEN,
      wor('3'),
    ),
    sketchbook('cryptic', 2, 'Cryptics'),
  ],
  cultivationspren: [sketchbook('cultivationspren', 1, 'cultivationspren')],
  deadeye: [
    piece(
      'deadeye',
      1,
      'A deadeye, with dark hollow eyes',
      'Evan Teuteberg',
      ob('101'),
    ),
  ],
  highspren: [sketchbook('highspren', 1, 'highspren')],
  honorspren: [sketchbook('honorspren', 1, 'honorspren')],
  inkspren: [sketchbook('inkspren', 1, 'inkspren')],
  mistspren: [
    piece(
      'mistspren',
      1,
      'A mistspren in robes, with a pale face',
      'FelCandy',
      row('22'),
    ),
    sketchbook('mistspren', 2, 'mistspren'),
  ],
  peakspren: [sketchbook('peakspren', 1, 'peakspren')],
  reacher: [
    piece('reacher', 1, 'A reacher at the wheel of a ship', ECCOS, ob('99')),
    sketchbook('reacher', 2, 'reachers'),
  ],
  // Shows all nine, so waits until Rhythm of War
  unmade: [
    piece(
      'unmade',
      1,
      'Nine roundels, one for each of the Unmade',
      'Marie Seeberger',
      ['rhythm-of-war'],
    ),
  ],
}

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
  // Shallan's sketchbook pages of the tower, Oathbringer interior art. The
  // Coppermind doesn't say which chapter; it names Oathgates, so it waits for
  // the book's end.
  [
    'place:urithiru',
    [
      {
        src: '/entries/place-urithiru.webp',
        alt: "Shallan's sketches of Urithiru: the tower from the west and east, from above with its ring of Oathgates, and in cutaway",
        artist: BEN,
        artistUrl: artists(BEN),
        revealedIn: ['oathbringer'],
      },
    ],
  ],
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
  ...Object.entries(spren).map(([id, art]) => [`lifeform:${id}`, art]),
])
