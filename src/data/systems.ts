import type { Story, Fact, Passage, RevealPoint, StarSystem } from './types'

const wiki = (page: string) => `https://coppermind.net/wiki/${page}`

const ordinal = (n: number) =>
  `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n] ?? 'th'}`

// Spoiler tags: book ids from books.ts, earliest published first. Anything
// tagged shows once the reader has read any one of its books.
const p = (text: string, ...revealedIn: RevealPoint[]): Passage => ({
  text,
  revealedIn,
})
const f = (name: string, ...revealedIn: RevealPoint[]): Fact => ({
  name,
  revealedIn,
})
/** Reached chapter `chapter` of `book` (chapter ids from chapters.ts). */
const ch = (book: string, chapter: string) => ({ book, chapter })
/** A book set on a planet; `alsoIn` lists collections that reprint it. */
const story = (bookId: string, ...alsoIn: string[]): Story => ({
  bookId,
  revealedIn: [bookId, ...alsoIn],
})

const ELA = 'elantris'
const HOPE = 'hope-of-elantris'
const FE = 'final-empire'
const WOA = 'well-of-ascension'
const HOA = 'hero-of-ages'
const ELEVEN = 'eleventh-metal'
const SH = 'secret-history'
const AOL = 'alloy-of-law'
const JAK = 'allomancer-jak'
const SOS = 'shadows-of-self'
const BOM = 'bands-of-mourning'
const LM = 'lost-metal'
const WOK = 'way-of-kings'
const WOR = 'words-of-radiance'
const EDGE = 'edgedancer'
const OB = 'oathbringer'
const DAWN = 'dawnshard'
const ROW = 'rhythm-of-war'
const WAT = 'wind-and-truth'
const ELSE = 'elsecaller'
const LOPEN = 'king-lopen'
const WS1 = 'white-sand-1'
const WS2 = 'white-sand-2'
const WS3 = 'white-sand-3'
const WSO = 'white-sand-omnibus'
const TRESS = 'tress'
const YUMI = 'yumi'
const FOD = 'fires-of-december'
const WB = 'warbreaker'
const ES = 'emperors-soul'
const S4S = 'shadows-for-silence'
const S6D = 'sixth-of-the-dusk'
const SLM = 'sunlit-man'
const ISLES = 'isles-of-the-emberdark'
const AU = 'arcanum-unbounded'

// Every Stormlight book, and just the main novels.
const SA = [WOK, WOR, EDGE, AU, OB, DAWN, ROW, WAT, ELSE, LOPEN]
const SL = [WOK, WOR, OB, ROW, WAT]
// Every Mistborn book.
const MB = [FE, WOA, HOA, AOL, ELEVEN, JAK, SOS, BOM, SH, AU, LM]
// Mistborn books that reveal Harmony and Hemalurgy (from The Hero of Ages on).
const HARMONY = [HOA, AOL, SOS, BOM, SH, AU, LM]
// Books set on Sel, and on Taldain.
const SEL = [ELA, HOPE, ES, AU]
const TAL = [WS1, AU, WS2, WS3, WSO]
// Books that name Yolen.
const YOLEN = [AU, SLM, WAT, ISLES]

// Seed data so the UI has something to render. Replace or extend with
// curated output from `npm run data:fetch`. Map positions are stylized.
export const systems: StarSystem[] = [
  {
    id: 'rosharan',
    name: 'Rosharan System',
    star: [p('Large white sun (unnamed)', ...SA)],
    summary: [
      p(
        'Also called Greater Roshar: three terrestrial planets and ten gas giants, divided by an asteroid belt.',
        AU,
        WAT,
      ),
      p('Roshar is orbited by three moons.', ...SL),
    ],
    mapPosition: { x: 22, y: 62 },
    color: '#e8f6ff',
    coppermindUrl: wiki('Rosharan_system'),
    asteroidBelt: {
      orbit: 4,
      description: 'Between Braize and Jes',
      revealedIn: [AU, WAT],
    },
    planets: [
      {
        id: 'ashyn',
        name: 'Ashyn',
        revealedIn: [AU, ROW, SLM, ch(WAT, '4')],
        summary: [
          p('The innermost planet in the system.', AU, ROW, WAT),
          p('Its old name was Alaswha.', WAT),
          p(
            'A cataclysm forced most of its humans to flee to Roshar; the rest live in floating cities.',
            AU,
            SLM,
            WAT,
          ),
          p(
            'Ashyn is known in Rosharan myth as the Tranquiline Halls.',
            ROW,
            WAT,
          ),
        ],
        mentionedIn: [
          story(WOK),
          story(WOR),
          story(AU),
          story(OB),
          story(ROW),
          story(SLM),
          story(WAT),
          story(FOD),
        ],
        shards: [],
        magicSystems: [f('Surge-granting diseases', OB)],
        moons: [],
        orbit: 1,
        color: '#b0283c',
        surface: 'marbled',
        accent: '#6b2a8c',
        coppermindUrl: wiki('Ashyn'),
      },
      {
        id: 'roshar',
        name: 'Roshar',
        revealedIn: [
          ch(WOK, '46'),
          ch(WOR, '1'),
          EDGE,
          AU,
          ch(OB, '93'),
          ch(DAWN, '14'),
          ch(ROW, '13'),
          ch(WAT, 'prologue'),
          ELSE,
          LOPEN,
          ch(SLM, '9'),
          ch(ISLES, '36'),
        ],
        summary: [
          p('Roshar is the second planet from the sun.', AU, ROW, WAT),
          p('Its single supercontinent is swept by highstorms.', ...SA),
          p(
            'Home to the Shards Honor and Cultivation.',
            WOK,
            WOR,
            EDGE,
            AU,
            OB,
            ROW,
            WAT,
          ),
          p('Most of the system’s sentient life lives here.', ...SA),
        ],
        settingOf: [
          story(WOK),
          story(WOR),
          story(EDGE, AU),
          story(OB),
          story(DAWN),
          story(ROW),
          story(WAT),
          story(ELSE),
          story(LOPEN),
        ],
        mentionedIn: [story(LM), story(YUMI), story(SLM), story(ISLES)],
        shards: [f('Honor', ...SA), f('Cultivation', ...SA)],
        magicSystems: [
          f('Surgebinding', ...SA),
          f('Voidbinding', WOK, OB, ROW, WAT),
          f('Old Magic', WOK, WOR, EDGE, AU, OB, ROW, WAT),
        ],
        moons: [
          { name: 'Salas', color: '#9a7ad8', revealedIn: SL },
          { name: 'Nomon', color: '#d8ecff', revealedIn: SL },
          { name: 'Mishim', color: '#8fd07a', revealedIn: SL },
        ],
        orbit: 2,
        color: '#6a9fc0',
        surface: 'marbled',
        accent: '#f2f8ff',
        coppermindUrl: wiki('Roshar'),
      },
      {
        id: 'braize',
        name: 'Braize',
        revealedIn: [
          WOR,
          AU,
          ch(OB, '121'),
          ch(ROW, '73'),
          ch(WAT, 'prologue'),
        ],
        summary: [
          p('A cold, barren, wind-swept world.', ROW, WAT),
          p('The Shard Odium resides here.', AU, OB),
          p('Known in Rosharan myth as Damnation.', WOR, OB, ROW, WAT),
        ],
        mentionedIn: [
          story(WOK),
          story(WOR),
          story(EDGE, AU),
          story(AU),
          story(OB),
          story(ROW),
          story(WAT),
        ],
        shards: [f('Odium', AU, OB)],
        magicSystems: [],
        moons: [],
        orbit: 3,
        color: '#4a4f5c',
        surface: 'cratered',
        coppermindUrl: wiki('Braize'),
      },
      // Outer gas giants, named for the Vorin numerals one through ten.
      ...(
        [
          ['Jes', '#2f6fd0'],
          ['Nan', '#8a7f9e'],
          ['Chach', '#c0393b'],
          ['Vev', '#a7a7a7'],
          ['Palah', '#5e9e3c'],
          ['Shash', '#a3242a'],
          ['Betab', '#2fb5a5'],
          ['Kak', '#7a4cc2'],
          ['Tanat', '#c9632c'],
          ['Ishi', '#c9b02c'],
        ] as const
      ).map(([name, color], i) => ({
        id: name.toLowerCase(),
        name,
        revealedIn: [AU, WAT],
        summary: [
          p(
            `A gas giant beyond the asteroid belt, the ${ordinal(i + 4)} planet from the sun. Named for the Vorin numeral ${i + 1}.`,
            AU,
            WAT,
          ),
          p('Uninhabited, with no known moons or rings.', AU),
        ],
        mentionedIn: [story(AU), story(WAT)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: i + 5,
        color,
        coppermindUrl: wiki('Rosharan_system#Gas_Giants'),
      })),
    ],
  },
  {
    id: 'scadrian',
    name: 'Scadrian System',
    star: [p('Unnamed', ...MB)],
    summary: [
      p('Scadrial, two gas giants, a comet belt and two dwarf planets.', AU),
      p(
        'Rashek moved Scadrial nearer the sun to burn away the Deepness, and Harmony later set it on its current orbit.',
        HOA,
        AU,
      ),
      p(
        'The chart shows both of Scadrial’s orbits, with the old and new calendars.',
        AU,
      ),
      p('Roshar is the nearest system.', AU),
      p('Its Cognitive Realm is the Expanse of the Vapors.', OB),
    ],
    mapPosition: { x: 70, y: 30 },
    color: '#ffb36b',
    coppermindUrl: wiki('Scadrian_system'),
    cometBelt: { orbit: 5, description: 'Beyond Aagal Uch', revealedIn: [AU] },
    orbitNotes: [
      {
        orbit: 1,
        left: 'Old Orbit',
        right: 'Old Calendar',
        ink: 'blue',
        body: {
          color: '#c4434d',
          title: 'Scadrial’s old orbit, nearer the sun',
        },
        revealedIn: [AU],
      },
      { orbit: 2, right: 'New Calendar', revealedIn: [AU] },
    ],
    layout: {
      orbitRadii: [337, 567, 958, 1058, 1134, 1218, 1331],
      sunScale: 0.66,
      sunLift: 88,
    },
    palette: {
      wash: ['#f8f7f1', '#dce2e2', '#62809a', '#2b4664'],
      sky: '#dfe5ea',
      ring: '#24405e',
      band: 'rgba(120, 146, 166, 0.45)',
      sun: {
        style: 'spiky',
        halo: '#f4ddb4',
        rays: ['#dcae3a', '#efce6c'],
        core: '#f1df88',
        ink: '#6b5214',
      },
    },
    planets: [
      {
        id: 'scadrial',
        name: 'Scadrial',
        revealedIn: [...MB, ch(ROW, '21'), ch(ISLES, '28')],
        chartLabel: p('Scadrial New Orbit', AU),
        summary: [
          p('The first planet from its sun.', AU),
          p(
            'Scadrial was created entirely by Preservation and Ruin, and is now held by Harmony.',
            ...HARMONY,
          ),
          p(
            'Rashek moved it nearer the sun, needing ashmounts to block the light; Harmony corrected its orbit when he Ascended.',
            HOA,
            AU,
          ),
          p('It has no moon.', AU, LM),
        ],
        settingOf: [
          story(FE),
          story(WOA),
          story(HOA),
          story(AOL),
          story(ELEVEN, AU),
          story(JAK, AU),
          story(SOS),
          story(BOM),
          story(SH, AU),
          story(LM),
        ],
        mentionedIn: [story(ROW), story(SLM), story(WAT), story(ISLES)],
        shards: [f('Harmony', ...HARMONY)],
        magicSystems: [
          f('Allomancy', ...MB),
          f('Feruchemy', FE, WOA, HOA, AOL, SOS, BOM, AU, LM),
          f('Hemalurgy', ...HARMONY),
        ],
        moons: [],
        orbit: 2,
        color: '#dbe6ea',
        size: 0.5,
        coppermindUrl: wiki('Scadrial'),
      },
      {
        id: 'aagal-nod',
        name: 'Aagal Nod',
        revealedIn: [AU],
        summary: [
          p(
            'A blue gas giant with at least six moons, the largest planet in the system.',
            AU,
          ),
          p(
            'Its name means the Near Eye, given by the Nelazan of Classical Scadrial.',
            LM,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [
          '#e6eaee',
          '#cfd6dc',
          '#e6eaee',
          '#b9c3cb',
          '#e6eaee',
          '#cfd6dc',
        ].map((color) => ({ color, revealedIn: [AU] })),
        orbit: 3,
        color: '#8fb6e2',
        surface: 'banded',
        accent: '#4f7fb8',
        size: 1.05,
        coppermindUrl: wiki('Scadrian_system#Planets'),
      },
      {
        id: 'aagal-uch',
        name: 'Aagal Uch',
        revealedIn: [AU],
        summary: [
          p(
            'A red gas giant with at least five moons and a ring system; the comet belt lies beyond it.',
            AU,
          ),
          p(
            'Its name means the Far Eye, given by the Nelazan of Classical Scadrial.',
            LM,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: ['#9a2f34', '#b8474c', '#9a2f34', '#b8474c', '#9a2f34'].map(
          (color) => ({ color, revealedIn: [AU] }),
        ),
        orbit: 4,
        color: '#c23a43',
        surface: 'banded',
        accent: '#7c1f28',
        ringTilt: 90,
        size: 0.7,
        rings: true,
        coppermindUrl: wiki('Scadrian_system#Planets'),
      },
      ...[6, 7].map((orbit, i) => ({
        id: `dwarf-planet-${i + 1}`,
        name: `${i ? 'Outer' : 'Inner'} dwarf planet`,
        revealedIn: [AU],
        chartLabel: p('dwarf planet', AU),
        summary: [
          p(
            'One of two unnamed dwarf planets beyond the comet belt, at the edge of the Scadrian system.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit,
        color: '#d6f0f2',
        size: 0.25,
        dwarf: true,
        coppermindUrl: wiki('Scadrian_system#Planets'),
      })),
    ],
  },
  {
    // The Nalthian chart was shared online, not printed in a book, so its
    // details are gated behind Warbreaker.
    id: 'nalthian',
    name: 'Nalthian System',
    star: [p('Yellow sun (unnamed), like those of Scadrial and Sel', WB)],
    summary: [
      p(
        'Nalthis, a red gas giant, a small outer planet and a comet belt at the system’s edge, plus a cognitive anomaly that shows up in the Physical Realm.',
        WB,
      ),
      p('The two uninhabited planets are named like the Returned.', WB),
      p(
        'The system is hugely popular with worldhoppers, with a customs check near the perpendicularity in Hallandren.',
        LM,
      ),
      p(
        'It lies in “The Giver” constellation, closest to the Selish system.',
        WB,
      ),
    ],
    mapPosition: { x: 48, y: 78 },
    color: '#c58cff',
    coppermindUrl: wiki('Nalthian_system'),
    cometBelt: {
      orbit: 4,
      description: 'Beyond Nightstar, at the system’s edge',
      revealedIn: [WB],
    },
    markers: [
      {
        label: 'Cognitive Anomaly',
        description:
          'A Cognitive Realm anomaly manifesting in the Physical Realm, sharing Nalthis’s orbit.',
        orbit: 1,
        angle: 48,
        revealedIn: [WB],
      },
    ],
    layout: { orbitRadii: [371, 572, 972, 1380], sunScale: 0.85 },
    palette: {
      wash: ['#fbf3b6', '#a9d49b', '#3e5a78', '#1b2f4a'],
      sky: '#dfe3ea',
      ring: '#1c2e44',
      band: 'rgba(18, 44, 46, 0.42)',
      sun: {
        style: 'flame',
        halo: '#fbf2c2',
        rays: ['#e7a12a', '#f4cb48'],
        core: '#f6d445',
        ink: '#8a5a12',
      },
      comets: {
        fill: 'rgba(20, 36, 58, 0.85)',
        rocks: ['#f4f6f8', '#d6dde3', '#b4bfc9'],
        rockStroke: '#1c2a35',
      },
    },
    planets: [
      {
        id: 'nalthis',
        name: 'Nalthis',
        revealedIn: [WB, ch(TRESS, '15'), ch(WAT, '56')],
        summary: [
          p(
            'The only inhabited planet, home to a large human population and the Shard Endowment. Nalthians are born with Breath, Endowment’s Investiture, which fuels Awakening. Its one moon is Rrendos, and it shares its orbit with a cognitive anomaly.',
            WB,
          ),
        ],
        settingOf: [story(WB)],
        mentionedIn: [
          story(LM),
          story(TRESS),
          story(SLM),
          story(WAT),
          story(ISLES),
        ],
        shards: [f('Endowment', WB)],
        magicSystems: [f('Awakening', WB)],
        moons: [{ name: 'Rrendos', color: '#c7ccd6', revealedIn: [WB] }],
        orbit: 1,
        color: '#6e7cc4',
        size: 0.75,
        coppermindUrl: wiki('Nalthis'),
      },
      {
        id: 'farkeeper-the-bright',
        name: 'Farkeeper the Bright',
        revealedIn: [WB],
        summary: [
          p(
            'A red gas giant, the largest planet in the system, with at least six moons. Named in the style of the Returned.',
            WB,
          ),
        ],
        shards: [],
        magicSystems: [],
        moons: [
          '#8fb8c8',
          '#e6e9ec',
          '#a6c4d4',
          '#d4d9de',
          '#e6e9ec',
          '#c2cad1',
        ].map((color) => ({ color, revealedIn: [WB] })),
        orbit: 2,
        color: '#e08a35',
        surface: 'banded',
        accent: '#a8321e',
        size: 1.65,
        coppermindUrl: wiki('Nalthian_system#Planets'),
      },
      {
        id: 'nightstar-the-hidden',
        name: 'Nightstar the Hidden',
        revealedIn: [WB],
        summary: [
          p(
            'A small violet planet far beyond Farkeeper. The comet belt lies beyond it, marking the system’s edge. Named in the style of the Returned.',
            WB,
          ),
        ],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 3,
        color: '#c4b4e0',
        size: 0.45,
        coppermindUrl: wiki('Nalthian_system#Planets'),
      },
    ],
  },
  {
    id: 'selish',
    name: 'Selish System',
    star: [p('Mashe, whose name contains the Aon Ashe (“light”)', AU)],
    summary: [
      p(
        'Four planets and one dwarf planet orbit Mashe, with an asteroid belt beyond Sel and a comet belt beyond Ralen.',
        AU,
      ),
      p('Home to Sel, the setting of Elantris and The Emperor’s Soul.', ...SEL),
    ],
    mapPosition: { x: 34, y: 28 },
    color: '#9fe3c0',
    coppermindUrl: wiki('Selish_system'),
    asteroidBelt: {
      orbit: 3,
      description: 'Between Sel and Ky',
      revealedIn: [AU],
    },
    cometBelt: { orbit: 6, description: 'Beyond Ralen', revealedIn: [AU] },
    palette: {
      wash: ['#f6f3d8', '#e2e3cb', '#5d7280', '#2c4352'],
      sky: '#c9d0d8',
      ring: '#2d4352',
      band: 'rgba(58, 102, 110, 0.4)',
      sun: {
        style: 'flame',
        halo: '#f8f5d6',
        rays: ['#f3e27a', '#f1d3b8'],
        core: '#f7f1b8',
        ink: '#3a3320',
      },
      belt: {
        fill: '#5b7b84',
        rocks: ['#6b4a35', '#8a6447', '#4b3a31', '#2d2a29', '#7a6a5a'],
        rockStroke: '#1d1a18',
      },
    },
    planets: [
      {
        id: 'donne',
        name: 'Donne',
        revealedIn: [AU],
        altName: p('Doo', AU),
        summary: [
          p(
            'The planet closest to Mashe. Though within the habitable zone, it is barren, uncomfortably warm and prone to terrible dust storms.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 1,
        color: '#6a3352',
        size: 0.9,
        coppermindUrl: wiki('Selish_system#Celestial_Bodies'),
      },
      {
        id: 'sel',
        name: 'Sel',
        revealedIn: [...SEL, ch(WOK, '21'), AOL, SOS],
        altName: p('Seol', AU),
        summary: [
          p('A world of thriving human empires.', ...SEL),
          p('The second planet from Mashe.', AU),
          p('Home to the Splintered Shards Devotion and Dominion.', AU),
          p('Its other name, Seol, may come from the Aon Seo, “loyalty”.', AU),
        ],
        settingOf: [story(ELA), story(HOPE, AU), story(ES, AU)],
        mentionedIn: [
          story(WOK),
          story(AOL),
          story(SOS),
          story(SH, AU),
          story(BOM),
          story(LM),
        ],
        shards: [f('Devotion', AU), f('Dominion', AU)],
        magicSystems: [
          f('AonDor', ELA, HOPE, AU),
          f('Forgery', ES, AU),
          f('Dakhor', ELA),
          f('ChayShan', ELA),
        ],
        moons: [{ name: 'Oem', color: '#e3d6bd', revealedIn: [AU] }],
        orbit: 2,
        color: '#b8323a',
        coppermindUrl: wiki('Sel'),
      },
      {
        id: 'ky',
        name: 'Ky',
        revealedIn: [AU],
        altName: p('Kii', AU),
        summary: [
          p(
            'Beyond the asteroid belt, apparently a gas giant with four moons. Kii is the Aon for “justice”.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: ['#a3685a', '#d7dde3', '#cfd6dc', '#8ea2b6'].map((color) => ({
          color,
          revealedIn: [AU],
        })),
        orbit: 4,
        color: '#8f8eab',
        surface: 'cratered',
        size: 1.3,
        coppermindUrl: wiki('Selish_system#Celestial_Bodies'),
      },
      {
        id: 'ralen',
        name: 'Ralen',
        revealedIn: [AU],
        altName: p('Raa', AU),
        summary: [
          p(
            'Apparently the largest planet in the system: a ringed gas giant with five moons. A comet belt lies beyond it.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: ['#dde3e6', '#d9d2b0', '#cfd8de', '#dde3e6', '#c9c2b5'].map(
          (color) => ({ color, revealedIn: [AU] }),
        ),
        orbit: 5,
        color: '#c77db3',
        surface: 'banded',
        accent: '#8e44b5',
        ringTilt: 24,
        size: 1.9,
        rings: true,
        coppermindUrl: wiki('Selish_system#Celestial_Bodies'),
      },
      {
        id: 'dwarf-planet',
        name: 'Dwarf planet',
        revealedIn: [AU],
        summary: [
          p(
            'An unnamed dwarf planet lying just outside the comet belt, at the edge of the Selish system.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 7,
        color: '#d6f0f2',
        size: 0.5,
        dwarf: true,
        coppermindUrl: wiki('Selish_system#Celestial_Bodies'),
      },
    ],
  },
  {
    id: 'taldain',
    name: 'Taldain System',
    star: [p('AisDa, a blue-white supergiant', AU, WSO)],
    companionStar: p(
      'The Eye of Ridos, a faint white dwarf inside the Particulate Ring',
      AU,
      WSO,
    ),
    summary: [
      p(
        'A binary system: its one planet, Taldain, sits between the blue-white supergiant AisDa and the white dwarf known as the Eye of Ridos, which is wrapped in a dense cloud of particles called the Particulate Ring.',
        AU,
        WSO,
      ),
      p(
        'The system appears to have been deliberately arranged, presumably by Autonomy.',
        WSO,
      ),
      p('Home to Taldain, the setting of White Sand.', ...TAL),
    ],
    mapPosition: { x: 86, y: 62 },
    color: '#fff3b0',
    coppermindUrl: wiki('Taldain_system'),
    planets: [
      {
        id: 'taldain',
        name: 'Taldain',
        revealedIn: [
          ...TAL.filter((b) => b !== WSO),
          ch(WSO, '11'),
          ch(ISLES, '28'),
        ],
        summary: [
          p("The system's only planet.", AU),
          p(
            'A tidally locked world: Dayside lies under endless sun and Darkside in perpetual dusk.',
            ...TAL,
          ),
          p(
            'Taldain sits at a Lagrange point, so Dayside always faces AisDa and Darkside always faces the Eye of Ridos.',
            AU,
            WSO,
          ),
          p("It is held in an unstable orbit called Wombear's Saddle.", WSO),
        ],
        settingOf: [story(WS1), story(WS2), story(WS3), story(WSO)],
        mentionedIn: [
          story(AU),
          story(LM),
          story(SLM),
          story(WAT),
          story(ISLES),
        ],
        shards: [f('Autonomy', AU, WSO)],
        magicSystems: [f('Sand mastery', ...TAL)],
        // Polar orbit that always passes over the twilight line.
        moons: [{ name: 'Nizh Da', color: '#eef2f5', revealedIn: [AU, WSO] }],
        orbit: 1,
        color: '#dce8f1',
        surface: 'tidal',
        coppermindUrl: wiki('Taldain'),
      },
    ],
  },
  {
    id: 'threnodite',
    name: 'Threnodite System',
    star: [p('Unnamed', S4S, AU)],
    summary: [
      p('Four planets, most named for songs of mourning.', AU),
      p(
        'No Shard lives here, but Odium fought Ambition in its empty space, mortally wounding her.',
        AU,
      ),
      p('Mercy was also present when Odium and Ambition fought here.', ROW),
      p(
        'The clash between Odium and Ambition destroyed planets that once existed here.',
        WAT,
      ),
      p(
        'Home to Threnody, the setting of Shadows for Silence in the Forests of Hell.',
        S4S,
        AU,
      ),
    ],
    mapPosition: { x: 62, y: 54 },
    color: '#b8c4d9',
    coppermindUrl: wiki('Threnodite_system'),
    // Measured from the in-world chart: three close planets, Purity far out.
    layout: { centered: true, orbitRadii: [78, 139, 189, 523], sunScale: 0.3 },
    palette: {
      wash: ['#fdfaf0', '#eceee9', '#406888', '#2e2e78'],
      sky: '#e4e4ee',
      ring: '#2b2c74',
      band: 'rgba(120, 140, 175, 0.45)',
      sun: {
        style: 'spiky',
        halo: '#f7dcae',
        rays: ['#c96b2a', '#e3a457'],
        core: '#d6582f',
        ink: '#6e2c12',
      },
    },
    planets: [
      {
        id: 'monody',
        name: 'Monody',
        revealedIn: [AU],
        summary: [
          p(
            'The planet closest to the sun. A monody is a poem lamenting a death.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 1,
        color: '#e0a03a',
        size: 0.32,
        coppermindUrl: wiki('Threnodite_system#Planets'),
      },
      {
        id: 'elegy',
        name: 'Elegy',
        revealedIn: [AU],
        summary: [
          p(
            'The second planet, orbited by the moon Coronach (a Scottish Gaelic funeral lament). An elegy is a lament for the dead.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [{ name: 'Coronach', color: '#9fd6f0', revealedIn: [AU] }],
        orbit: 2,
        color: '#5b8fd6',
        size: 0.35,
        coppermindUrl: wiki('Threnodite_system#Planets'),
      },
      {
        id: 'threnody',
        name: 'Threnody',
        revealedIn: [S4S, AU, ch(ROW, '27'), ch(SLM, '15')],
        summary: [
          p('The third planet from the sun.', AU),
          p(
            'A dark and dangerous world with people on it and strong ambient Investiture, in the form of the shades that haunt the Forests on one of its two continents.',
            S4S,
            AU,
          ),
          p('It has no moon.', AU),
        ],
        settingOf: [story(S4S, AU)],
        mentionedIn: [
          story(SH, AU),
          story(ROW),
          story(TRESS),
          story(YUMI),
          story(SLM),
          story(WAT),
          story(ISLES),
        ],
        shards: [],
        magicSystems: [f('Shades', S4S, AU)],
        moons: [],
        orbit: 3,
        color: '#6f74b8',
        size: 0.35,
        coppermindUrl: wiki('Threnody'),
      },
      {
        id: 'purity',
        name: 'Purity',
        revealedIn: [AU],
        summary: [
          p(
            'The outermost planet, much farther out and much larger than the other three.',
            AU,
          ),
          p(
            'The exclamation “Purity’s Eye” likely comes from this planet.',
            OB,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 4,
        color: '#9e2430',
        size: 1.2,
        glow: '#d23a3a',
        coppermindUrl: wiki('Threnodite_system#Planets'),
      },
    ],
  },
  {
    id: 'drominad',
    name: 'Drominad System',
    star: [p('Pale white sun (unnamed)', AU)],
    summary: [
      p('“Drominad” is only a nickname; any official name is unknown.', AU),
      p('The system has seven planets and an asteroid belt.', AU),
      p(
        'All four planets in the habitable zone are water worlds, and three of them hold fully developed human societies, more than any other system.',
        AU,
      ),
      p(
        'The perpendicularity on First of the Sun draws the interest of cosmere scholars.',
        AU,
        ISLES,
      ),
      p('The planets on the chart follow the Eelakin number-based naming.', AU),
    ],
    mapPosition: { x: 12, y: 30 },
    color: '#ffd27f',
    coppermindUrl: wiki('Drominad_system'),
    asteroidBelt: {
      orbit: 5,
      description: 'Between Fourth and Fifth of the Sun',
      revealedIn: [AU],
    },
    layout: {
      centered: true,
      sunY: 1133,
      orbitRadii: [195, 281, 349, 428, 528, 660, 828, 965],
      sunScale: 0.72,
    },
    palette: {
      wash: ['#f1f6f9', '#d3e0e8', '#6f879c', '#4a6079'],
      sky: '#e1e8ed',
      ring: '#26384b',
      band: 'rgba(96, 126, 152, 0.38)',
      sun: {
        style: 'thorn',
        halo: '#eef5fa',
        rays: ['#1c2a35', '#1c2a35'],
        core: '#dbe9f3',
        ink: '#1c2a35',
      },
      belt: {
        fill: 'rgba(66, 82, 98, 0.6)',
        rocks: ['#c9d0d6', '#a7b2bc', '#8796a3'],
        rockStroke: '#1c2a35',
      },
    },
    planets: [
      {
        id: 'first-of-the-sun',
        name: 'First of the Sun',
        revealedIn: [S6D, AU, ISLES],
        summary: [
          p('The innermost planet and the first in the habitable zone.', AU),
          p(
            'An ocean world with many deadly islands, home to the Eelakin.',
            S6D,
            AU,
            ISLES,
          ),
          p('It also has a mainland.', ISLES),
          p(
            'Patji, an avatar of Autonomy, lives here, along with the perpendicularity Patji’s Eye.',
            ISLES,
          ),
          p(
            'Aviar from the Pantheon grant their bonded companions Talents.',
            S6D,
            AU,
            ISLES,
          ),
        ],
        settingOf: [story(S6D, AU), story(ISLES)],
        shards: [f('Autonomy', ISLES)],
        magicSystems: [f('Aviar Talents', S6D, AU, ISLES)],
        moons: [
          { name: 'First of the First', color: '#5c646b', revealedIn: [AU] },
        ],
        orbit: 1,
        color: '#3b444b',
        size: 0.62,
        coppermindUrl: wiki('First_of_the_Sun'),
      },
      {
        id: 'second-of-the-sun',
        name: 'Second of the Sun',
        revealedIn: [AU],
        summary: [
          p(
            'A water world in the habitable zone, smaller than First of the Sun. Possibly home to one of the system’s three fully developed human societies.',
            AU,
          ),
          p('Its people have their own name for it.', ISLES),
        ],
        mentionedIn: [story(AU), story(ISLES)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 2,
        color: '#a6c8de',
        size: 0.38,
        coppermindUrl: wiki('Drominad_system#Planets'),
      },
      {
        id: 'third-of-the-sun',
        name: 'Third of the Sun',
        revealedIn: [AU],
        summary: [
          p(
            'The smallest planet in the system. A water world in the habitable zone, and another possible home of a fully developed human society.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 3,
        color: '#93a8b4',
        size: 0.33,
        coppermindUrl: wiki('Drominad_system#Planets'),
      },
      {
        id: 'fourth-of-the-sun',
        name: 'Fourth of the Sun',
        revealedIn: [AU],
        summary: [
          p(
            'A ringed water world: the last planet in the habitable zone, and the last candidate for a fully developed human society. The asteroid belt lies beyond it.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 4,
        color: '#b8ad99',
        surface: 'banded',
        size: 0.32,
        rings: true,
        coppermindUrl: wiki('Drominad_system#Planets'),
      },
      {
        id: 'fifth-of-the-sun',
        name: 'Fifth of the Sun',
        revealedIn: [AU],
        summary: [
          p(
            'A ringed gas giant just beyond the asteroid belt, with three major moons.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: ['#b0574a', '#9aa4ad', '#c9b98a'].map((color) => ({
          color,
          revealedIn: [AU],
        })),
        orbit: 6,
        color: '#3fa79c',
        surface: 'banded',
        accent: '#1f6f6a',
        size: 0.9,
        rings: true,
        coppermindUrl: wiki('Drominad_system#Planets'),
      },
      {
        id: 'sixth-of-the-sun',
        name: 'Sixth of the Sun',
        revealedIn: [AU],
        summary: [
          p(
            'The largest planet in the system: a ringed gas giant with four major moons.',
            AU,
          ),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: ['#c9b46a', '#6dbb7c', '#9aa4ad', '#7d8892'].map((color) => ({
          color,
          revealedIn: [AU],
        })),
        orbit: 7,
        color: '#8fd1a6',
        surface: 'banded',
        accent: '#3f8f63',
        size: 1.25,
        rings: true,
        coppermindUrl: wiki('Drominad_system#Planets'),
      },
      {
        id: 'seventh-of-the-sun',
        name: 'Seventh of the Sun',
        revealedIn: [AU],
        summary: [
          p('The outermost planet: a gas giant with four major moons.', AU),
        ],
        mentionedIn: [story(AU)],
        shards: [],
        magicSystems: [],
        moons: ['#9a90b8', '#9aa4ad', '#7d8892', '#b7c2cb'].map((color) => ({
          color,
          revealedIn: [AU],
        })),
        orbit: 8,
        color: '#4f8fd0',
        surface: 'banded',
        accent: '#2b5f9e',
        size: 1,
        coppermindUrl: wiki('Drominad_system#Planets'),
      },
    ],
  },
  {
    id: 'yolish',
    name: 'Yolish System',
    star: [p('Unknown', ...YOLEN)],
    summary: [
      p('Almost nothing is known about this system.', ...YOLEN),
      p(
        'Its one known planet, Yolen, is where humans first appeared and where Adonalsium was Shattered.',
        WAT,
        ISLES,
      ),
      p(
        'The system’s astronomy would be impossible under ordinary physics.',
        ISLES,
      ),
      p(
        'By the time of the Catacendre, Yolen is hidden and inaccessible.',
        SH,
        AU,
      ),
      p(
        'No official star chart exists, so this one is drawn in the style of the others.',
        ...YOLEN,
      ),
    ],
    mapPosition: { x: 50, y: 14 },
    color: '#ffffff',
    // Coppermind has no Yolish system page yet.
    coppermindUrl: wiki('Yolen'),
    layout: { orbitRadii: [530], sunScale: 1.8 },
    palette: {
      wash: ['#fbf6e8', '#eadcbe', '#7b6a9a', '#3b3060'],
      sky: '#ece8f0',
      ring: '#2a2148',
      band: 'rgba(110, 95, 150, 0.35)',
      sun: {
        style: 'spiky',
        halo: '#f6ecd0',
        rays: ['#c9a24a', '#e8cf86'],
        core: '#e3c065',
        ink: '#5a4416',
      },
    },
    planets: [
      {
        id: 'yolen',
        name: 'Yolen',
        revealedIn: [AU, SLM, WAT, ch(ISLES, 'prologue')],
        summary: [
          p(
            'Where humans first appeared and where Adonalsium was Shattered.',
            WAT,
            ISLES,
          ),
          p('Home to humans, dragons and Sho Del.', SLM, WAT, ISLES),
          p(
            'The homeworld of Hoid, Frost and all the original Vessels.',
            WAT,
            ISLES,
          ),
          p(
            'Many of its trees are bone-white, overtaken by invasive fainlife.',
            SLM,
            WAT,
          ),
          p(
            'Its sky is dominated by the greatstar, a glowing hole in the upper atmosphere.',
            ISLES,
          ),
          p('Its gravity is the cosmere standard.', AU),
        ],
        mentionedIn: [
          story(AU),
          story(OB),
          story(ROW),
          story(SLM),
          story(WAT),
          story(ISLES),
        ],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 1,
        color: '#6f9a7a',
        size: 1.15,
        glow: '#f3ead2',
        coppermindUrl: wiki('Yolen'),
      },
    ],
  },
  {
    id: 'utol',
    name: 'UTol System',
    star: [p('Unnamed large red-orange sun', YUMI)],
    summary: [
      p(
        "UTol and Komashi form a double planet whose shared centre orbits a large red-orange sun, bigger than Roshar's and comparatively close. No Shard lives here, but Virtuosity Splintered herself nearby, filling the region with her Splinters. Home to Komashi, the setting of Yumi and the Nightmare Painter.",
        YUMI,
      ),
      p(
        'No official star chart exists, so this one is drawn from what is known.',
        YUMI,
      ),
    ],
    mapPosition: { x: 78, y: 86 },
    color: '#ff8f8f',
    coppermindUrl: wiki('UTol_system'),
    // No in-world chart; the big, close sun and the double planet come from the text.
    layout: { orbitRadii: [610], sunScale: 2.2 },
    palette: {
      wash: ['#fdebd6', '#f2c49c', '#c27a62', '#8a4651'],
      sky: '#f1e6df',
      ring: '#3a1424',
      band: 'rgba(150, 80, 60, 0.35)',
      sun: {
        style: 'flame',
        halo: '#f8cfa6',
        rays: ['#d9542b', '#f08a3c'],
        core: '#c8402a',
        ink: '#5a1a0e',
      },
    },
    planets: [
      {
        id: 'utol',
        name: 'UTol',
        revealedIn: [YUMI],
        summary: [
          p(
            'An ocean world with very few land masses, inhabited by the Sho Del, who mostly live on boats. From Komashi it shines as a pale, soft blue "daystar", the only light able to pierce the shroud.',
            YUMI,
          ),
          p('Nomad likely Skipped here after leaving Canticle.', SLM),
        ],
        mentionedIn: [story(YUMI), story(SLM)],
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 1,
        color: '#6fa8d6',
        surface: 'marbled',
        accent: '#ffffff',
        size: 1.15,
        glow: '#cfe8f7',
        coppermindUrl: wiki('UTol'),
      },
      {
        id: 'komashi',
        name: 'Komashi',
        revealedIn: [ch(YUMI, '6')],
        summary: [
          p(
            'A world of brown stone and oceans, home of the hijo: Splinters of Virtuosity that power hion. A machine wrapped the planet in a black shroud for about seventeen hundred years until Yumi destroyed it.',
            YUMI,
          ),
        ],
        settingOf: [story(YUMI)],
        shards: [],
        magicSystems: [f('Hion', YUMI), f('Yoki-hijo', YUMI)],
        moons: [],
        orbit: 1,
        color: '#9a6a45',
        size: 1.15,
        coppermindUrl: wiki('Komashi'),
      },
    ],
  },
  {
    id: 'uncharted',
    name: 'Uncharted Worlds',
    star: [
      p(
        'None shared: each world orbits its own star',
        LM,
        TRESS,
        SLM,
        ISLES,
        FOD,
      ),
    ],
    summary: [
      p(
        'Planets whose star systems are unknown or have no star chart. They are not neighbours: each lies in a separate system somewhere in the cosmere, so they are charted here without a sun or orbits.',
        LM,
        TRESS,
        SLM,
        ISLES,
        FOD,
      ),
    ],
    mapPosition: { x: 9, y: 88 },
    color: '#c9d6e3',
    coppermindUrl: wiki('Category:Cosmere_planets'),
    uncharted: true,
    palette: {
      wash: ['#3d5a74', '#2f4962', '#223a52', '#182b3f'],
      sky: '#e4e9ec',
      ring: '#13202c',
      band: 'rgba(214, 228, 238, 0.12)',
      // Unused: there is no sun on this chart.
      sun: {
        style: 'spiky',
        halo: '#ffffff',
        rays: ['#ffffff', '#ffffff'],
        core: '#ffffff',
        ink: '#000000',
      },
    },
    // Laid out top to bottom, alternating sides of the chart.
    planets: [
      {
        id: 'canticle',
        name: 'Canticle',
        revealedIn: [ch(SLM, '8')],
        summary: [
          p(
            'Its sunlight burns anything it touches, so its people keep moving to stay ahead of the dawn. They grow crops on the land just before dawn, lit by light that great rings around the planet reflect down, and can harvest every day.',
            ch(SLM, '8'),
          ),
          p(
            'Its people speak in a careful, courteous way meant to avoid giving offence, and are often named after emotions, virtues or ideas, such as Zeal or Confidence.',
            ch(SLM, '8'),
          ),
          p(
            'Its single sun is heavily Invested, and the rings reflect some of that Invested light onto the night side. People both fear and respect the sun, calling it names like the Sky Tyrant. Impassable mountains and highlands run along the southern band.',
            ch(SLM, '12'),
          ),
          p(
            'Plants grow quickly in the night, fed by the light reflected from the rings, and people sow seeds after the day has burned the land bare. Everyone speaks a single language, and many find the idea of foreign languages strange.',
            ch(SLM, '13'),
          ),
          p(
            'Its people came from Threnody, a world they regard as Hell, and their language is close to Threnody’s. There are around fifty cities, but most of the larger ones have been absorbed into Union; a number of small towns remain.',
            ch(SLM, '15'),
          ),
          p(
            'The Cinder King once found a sick worldhopper and killed him, fearing he was a demon. From the man’s books he learned of the wider cosmere, then set out to conquer the other cities and unite everyone in his capital.',
            ch(SLM, '16'),
          ),
          p(
            'Most of its people descend from Threnodites who left soon after the Evil attacked their ancestors. Many are pale, nearly as many have darker skin like the Azish, and some fall in between. Invested, gazelle-like animals live near the dawn.',
            ch(SLM, '17'),
          ),
          p(
            'People live in large flying cities, each keeping to its own corridor of latitude. A city is made of smaller ships that can link together, among them hovercycles, farming ships and prospectors that find sunhearts; all run on sunhearts.',
            ch(SLM, '23'),
          ),
          p(
            'The Cinder King rules through his monopoly on sunhearts and the threat of his Charred; cities he has not conquered have been pushed towards the poles. Each city has a Lodestar, its chief navigator. People tell many stories with morals, often about children eaten by shades.',
            ch(SLM, '26'),
          ),
          p(
            'Its rings are blue and gold. The atmosphere thins quickly with height and ends about a thousand feet up, so mountains reach into space and cannot be crossed.',
            ch(SLM, '28'),
          ),
          p(
            'It spins backwards, so the sun rises in the west and sets in the east, and a day lasts ten standard hours.',
            ch(SLM, '32'),
          ),
          p(
            'It is tiny, only about 100 miles in radius, but a huge, dense, Invested iron core gives it about 0.7 standard gravity and holds its rings in place. Behind the sunset line, a great maelstrom of fiery cyclones sweeps the land.',
            ch(SLM, '34'),
          ),
          p(
            'It was settled by Threnodites led by the preacher Zellion, driven from their homeworld by infighting, who devised the flying cities. The sunlight heats the land and air enough to melt anything nearby and vaporize a person.',
            ch(SLM, '39'),
          ),
          p(
            'No Shard lives there, and it has no perpendicularity.',
            ch(SLM, '44'),
          ),
          p(
            'Its atmosphere resists the flow of Investiture, so the Invested sunlight heats it fiercely, and melting stone and magma from the Invested core constantly reshape the land.',
            ch(SLM, '45'),
          ),
          p(
            'Its people worship Adonalsium, knowing he is dead and splintered into Shards, yet believing that everything follows his plan.',
            ch(SLM, '47'),
          ),
        ],
        settingOf: [story(SLM)],
        shards: [],
        magicSystems: [
          f('Charred', ch(SLM, '12')),
          f('Sunhearts', ch(SLM, '12')),
        ],
        moons: [],
        orbit: 1,
        color: '#c4652f',
        size: 0.85,
        rings: true,
        ringTilt: 16,
        surface: 'cratered',
        coppermindUrl: wiki('Canticle'),
      },
      {
        id: 'grand-apparatus',
        name: 'Grand Apparatus',
        revealedIn: [ch(ISLES, '25')],
        summary: [
          p(
            'A planet-sized megastructure: cities of thousands of communal rooms, forever on the move, run by a vast Invested mechanism. Its people count themselves Invention’s, though it was probably built before the Shattering. A ruling class of Sleepless keeps everyone inside, Lawnarks among them, and experiments on them. Rooms with windows are rare, and there are no birds.',
            ISLES,
          ),
        ],
        mentionedIn: [story(ISLES)],
        shards: [f('Invention (status unknown)', ISLES)],
        magicSystems: [],
        moons: [],
        orbit: 2,
        color: '#a8854f',
        accent: '#3f2f1c',
        surface: 'plated',
        coppermindUrl: wiki('Grand_Apparatus'),
      },
      {
        // The Lost Metal features this world unnamed; Isles of the Emberdark names it.
        id: 'dhatri',
        name: 'Dhatri',
        revealedIn: [LM, ch(ISLES, '22')],
        summary: [
          p(
            'Homeworld of the aethers, which its people worship as gods older than Adonalsium itself.',
            LM,
            ISLES,
          ),
          p('It has at least twelve kingdoms.', LM),
          p(
            'Its people have a flowing script of their own and a love of bright clothing.',
            ISLES,
          ),
          p(
            'Dhatri sells aethers, though they are expensive and heavily regulated.',
            ISLES,
          ),
          p('It once had a perpendicularity but lost it.', ISLES),
          p('The dark aether has struck the planet.', LM),
        ],
        mentionedIn: [story(LM), story(ISLES)],
        shards: [],
        magicSystems: [f('Aethers', LM, ISLES)],
        moons: [],
        orbit: 3,
        color: '#3f8f86',
        accent: '#1d1a33',
        surface: 'marbled',
        coppermindUrl: wiki('Dhatri'),
      },
      {
        id: 'lumar',
        name: 'Lumar',
        revealedIn: [ch(TRESS, '31')],
        summary: [
          p(
            'A backwater world ringed by twelve moons hanging in equidistant, geostationary orbits close above it. Each moon hosts an aggressive strain of aether whose spores rain down in lunagrees, so the whole planet is covered in seas of spores rather than water. Each day the sun passes behind one moon, casting a moonshadow.',
            TRESS,
          ),
          p(
            'Offworld powers now mine the moons for cheap aether spores.',
            ISLES,
          ),
        ],
        settingOf: [story(TRESS)],
        mentionedIn: [story(ISLES)],
        shards: [],
        magicSystems: [f('Aethers', TRESS, ISLES)],
        // Moons named for the seas beneath them; four are not yet named.
        moons: [
          { name: 'Emerald', color: '#2e9e5e' },
          { name: 'Sunlight', color: '#f1c84a' },
          { name: 'Crimson', color: '#b3262e' },
          { name: 'Rose', color: '#e08aa8' },
          { name: 'Midnight', color: '#25223f' },
          { name: 'Sapphire', color: '#2a5fb0' },
          { name: 'Verdant', color: '#78b83a' },
          { name: 'Zephyr', color: '#a9d4e0' },
          { color: '#b79ad0' },
          { color: '#e6e1d0' },
          { color: '#d07a3a' },
          { color: '#7a6248' },
        ].map((moon) => ({ ...moon, revealedIn: [TRESS] })),
        moonRing: true,
        orbit: 4,
        color: '#3e9a6a',
        coppermindUrl: wiki('Lumar'),
      },
      {
        id: 'miral',
        name: 'Miral',
        revealedIn: [FOD],
        summary: [
          p(
            'An isolated world away from common travel routes, reached only through an unusually irregular perpendicularity attuned to no Shard. Valor once lived here, building temples and founding a religion. Home to the mountain kingdom of Mountaincrest, whose rivers run with the Megalith’s blood, and to plains peoples who bind and serve great demons.',
            FOD,
          ),
        ],
        shards: [f('Valor (formerly)', FOD)],
        magicSystems: [f('Witchcraft', FOD)],
        moons: [],
        orbit: 5,
        color: '#7d8a58',
        accent: '#8a1f24',
        surface: 'marbled',
        coppermindUrl: wiki('Miral'),
      },
    ],
  },
]

export const getSystem = (systemId?: string) =>
  systems.find((s) => s.id === systemId)

export const getPlanet = (systemId?: string, planetId?: string) =>
  getSystem(systemId)?.planets.find((p) => p.id === planetId)
