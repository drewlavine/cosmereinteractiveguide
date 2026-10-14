import type { StarSystem } from './types'

const wiki = (page: string) => `https://coppermind.net/wiki/${page}`

const ordinal = (n: number) =>
  `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n] ?? 'th'}`

// Seed data so the UI has something to render. Replace or extend with
// curated output from `npm run data:fetch`. Map positions are stylized.
export const systems: StarSystem[] = [
  {
    id: 'rosharan',
    name: 'Rosharan System',
    star: 'Large white sun (unnamed)',
    summary:
      'Also called Greater Roshar: three terrestrial planets and ten gas giants, divided by an asteroid belt. Roshar is orbited by three moons.',
    mapPosition: { x: 22, y: 62 },
    color: '#e8f6ff',
    coppermindUrl: wiki('Rosharan_system'),
    asteroidBelt: {
      orbit: 4,
      description: 'Between Braize and Jes',
    },
    planets: [
      {
        id: 'ashyn',
        name: 'Ashyn',
        summary:
          'The innermost planet, formerly called Alaswha. A cataclysm forced most of its humans to flee to Roshar; the rest live in floating cities. Known in Rosharan myth as the Tranquiline Halls.',
        shards: [],
        magicSystems: ['Surge-granting diseases'],
        moons: [],
        orbit: 1,
        color: '#b0283c',
        coppermindUrl: wiki('Ashyn'),
      },
      {
        id: 'roshar',
        name: 'Roshar',
        summary:
          'The second planet, with a single supercontinent swept by highstorms. Home to the Shards Honor and Cultivation, and to most of the system’s sentient life.',
        shards: ['Honor', 'Cultivation'],
        magicSystems: ['Surgebinding', 'Voidbinding', 'Old Magic'],
        moons: [
          { name: 'Salas', color: '#9a7ad8' },
          { name: 'Nomon', color: '#d8ecff' },
          { name: 'Mishim', color: '#8fd07a' },
        ],
        orbit: 2,
        color: '#b9d7e6',
        coppermindUrl: wiki('Roshar'),
      },
      {
        id: 'braize',
        name: 'Braize',
        summary:
          'A cold, barren, wind-swept world where the Shard Odium resides. Known in Rosharan myth as Damnation.',
        shards: ['Odium'],
        magicSystems: [],
        moons: [],
        orbit: 3,
        color: '#4a4f5c',
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
        summary: `A gas giant beyond the asteroid belt, the ${ordinal(i + 4)} planet from the sun. Named for the Vorin numeral ${i + 1}. Uninhabited, with no known moons or rings.`,
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
    star: 'Unnamed',
    summary: 'Home to Scadrial, the setting of the Mistborn series.',
    mapPosition: { x: 70, y: 30 },
    color: '#ffb36b',
    coppermindUrl: wiki('Scadrian_system'),
    planets: [
      {
        id: 'scadrial',
        name: 'Scadrial',
        summary:
          'A world shaped by Preservation and Ruin, where metals fuel the Metallic Arts.',
        shards: ['Harmony'],
        magicSystems: ['Allomancy', 'Feruchemy', 'Hemalurgy'],
        moons: [],
        orbit: 1,
        color: '#c98a4b',
        coppermindUrl: wiki('Scadrial'),
      },
    ],
  },
  {
    id: 'nalthian',
    name: 'Nalthian System',
    star: 'Unnamed',
    summary: 'Home to Nalthis, the setting of Warbreaker.',
    mapPosition: { x: 48, y: 78 },
    color: '#c58cff',
    coppermindUrl: wiki('Nalthian_system'),
    planets: [
      {
        id: 'nalthis',
        name: 'Nalthis',
        summary:
          'A vibrant world where Breath and color power the magic of Awakening.',
        shards: ['Endowment'],
        magicSystems: ['Awakening'],
        moons: [],
        orbit: 1,
        color: '#e46fa8',
        coppermindUrl: wiki('Nalthis'),
      },
    ],
  },
  {
    id: 'selish',
    name: 'Selish System',
    star: 'Mashe, whose name contains the Aon Ashe (“light”)',
    summary:
      'Four planets and one dwarf planet orbit Mashe, with an asteroid belt beyond Sel and a comet belt beyond Ralen. Home to Sel, the setting of Elantris and The Emperor’s Soul.',
    mapPosition: { x: 34, y: 28 },
    color: '#9fe3c0',
    coppermindUrl: wiki('Selish_system'),
    asteroidBelt: { orbit: 3, description: 'Between Sel and Ky' },
    cometBelt: { orbit: 6, description: 'Beyond Ralen' },
    palette: {
      wash: ['#f6f3d8', '#e2e3cb', '#5d7280', '#2c4352'],
      sky: '#c9d0d8',
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
        altName: 'Doo',
        summary:
          'The planet closest to Mashe. Though within the habitable zone, it is barren, uncomfortably warm and prone to terrible dust storms.',
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
        altName: 'Seol',
        summary:
          'The second planet, home to the Splintered Shards Devotion and Dominion and to thriving human empires. Its other name may come from the Aon Seo, “loyalty”.',
        shards: ['Devotion', 'Dominion'],
        magicSystems: ['AonDor', 'Forgery', 'Dakhor', 'ChayShan'],
        moons: [{ name: 'Oem', color: '#e3d6bd' }],
        orbit: 2,
        color: '#b8323a',
        coppermindUrl: wiki('Sel'),
      },
      {
        id: 'ky',
        name: 'Ky',
        altName: 'Kii',
        summary:
          'Beyond the asteroid belt, apparently a gas giant with four moons. Kii is the Aon for “justice”.',
        shards: [],
        magicSystems: [],
        moons: [
          { color: '#a3685a' },
          { color: '#d7dde3' },
          { color: '#cfd6dc' },
          { color: '#8ea2b6' },
        ],
        orbit: 4,
        color: '#8f8eab',
        size: 1.3,
        coppermindUrl: wiki('Selish_system#Celestial_Bodies'),
      },
      {
        id: 'ralen',
        name: 'Ralen',
        altName: 'Raa',
        summary:
          'Apparently the largest planet in the system: a ringed gas giant with five moons. A comet belt lies beyond it.',
        shards: [],
        magicSystems: [],
        moons: [
          { color: '#dde3e6' },
          { color: '#d9d2b0' },
          { color: '#cfd8de' },
          { color: '#dde3e6' },
          { color: '#c9c2b5' },
        ],
        orbit: 5,
        color: '#c77db3',
        size: 1.9,
        rings: true,
        coppermindUrl: wiki('Selish_system#Celestial_Bodies'),
      },
      {
        id: 'dwarf-planet',
        name: 'Dwarf planet',
        summary:
          'An unnamed dwarf planet lying just outside the comet belt, at the edge of the Selish system.',
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
    star: 'Unnamed',
    summary: 'Home to Taldain, the setting of White Sand.',
    mapPosition: { x: 86, y: 62 },
    color: '#fff3b0',
    coppermindUrl: wiki('Taldain_system'),
    planets: [
      {
        id: 'taldain',
        name: 'Taldain',
        summary:
          'A tidally locked world split between a sunlit Dayside and a shadowed Darkside.',
        shards: ['Autonomy'],
        magicSystems: ['Sand mastery'],
        moons: [],
        orbit: 1,
        color: '#e8cf8a',
        coppermindUrl: wiki('Taldain'),
      },
    ],
  },
  {
    id: 'threnodite',
    name: 'Threnodite System',
    star: 'Unnamed',
    summary: 'Home to Threnody, the setting of Shadows for Silence.',
    mapPosition: { x: 62, y: 54 },
    color: '#b8c4d9',
    coppermindUrl: wiki('Threnodite_system'),
    planets: [
      {
        id: 'threnody',
        name: 'Threnody',
        summary: 'A dark, dangerous world whose forests are haunted by shades.',
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 1,
        color: '#5d6b6b',
        coppermindUrl: wiki('Threnody'),
      },
    ],
  },
  {
    id: 'drominad',
    name: 'Drominad System',
    star: 'Unnamed',
    summary: 'Home to First of the Sun, the setting of Sixth of the Dusk.',
    mapPosition: { x: 12, y: 30 },
    color: '#ffd27f',
    coppermindUrl: wiki('Drominad_system'),
    planets: [
      {
        id: 'first-of-the-sun',
        name: 'First of the Sun',
        summary:
          'An ocean world of deadly islands, where Aviar birds grant their bonded companions Talents.',
        shards: [],
        magicSystems: ['Aviar Talents'],
        moons: [],
        orbit: 1,
        color: '#3f9ec9',
        coppermindUrl: wiki('First_of_the_Sun'),
      },
    ],
  },
  {
    id: 'yolish',
    name: 'Yolish System',
    star: 'Unnamed',
    summary: 'Home to Yolen, where Adonalsium was Shattered.',
    mapPosition: { x: 50, y: 14 },
    color: '#ffffff',
    coppermindUrl: wiki('Yolish_system'),
    planets: [
      {
        id: 'yolen',
        name: 'Yolen',
        summary:
          'The world where the Shattering of Adonalsium took place and the sixteen Shards were created.',
        shards: [],
        magicSystems: [],
        moons: [],
        orbit: 1,
        color: '#c7b6e8',
        coppermindUrl: wiki('Yolen'),
      },
    ],
  },
  {
    id: 'utol',
    name: 'UTol System',
    star: 'Unnamed',
    // TODO: confirm planets in this system on the Coppermind.
    summary: 'Planet data not yet curated.',
    mapPosition: { x: 78, y: 86 },
    color: '#ff8f8f',
    coppermindUrl: wiki('UTol_system'),
    planets: [],
  },
]

export const getSystem = (systemId?: string) =>
  systems.find((s) => s.id === systemId)

export const getPlanet = (systemId?: string, planetId?: string) =>
  getSystem(systemId)?.planets.find((p) => p.id === planetId)
