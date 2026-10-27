import type { Reveal } from './types'

/**
 * Art of a character, shown above their Key facts. Art belongs to its
 * artist. The site is private for now, so art comes from the Coppermind's
 * galleries, credited; before any public release, get each artist's (or
 * Dragonsteel's) permission or remove their art, as the Coppermind's images
 * are "only to be used with their permission".
 */
export interface Portrait {
  /** Path under `public/`, e.g. `/portraits/kaladin.webp`. */
  src: string
  /** What it shows, without spoiling more than `revealedIn` allows. */
  alt: string
  artist: string
  /** The artist's page or the art's original post. */
  artistUrl?: string
  /**
   * When it's safe to show: art can spoil too (Shardplate, a scar, a
   * sword), so date it like a fact, by the latest thing it shows.
   */
  revealedIn: Reveal
}

/**
 * Portraits by page id (a character's, or a persona's for their persona
 * page), earliest first; the page shows the latest one the reader may see.
 */
export const characterPortraits: Record<string, Portrait[]> = {
  kaladin: [
    {
      // A spear: Bridge Four's secret training starts in chapter 49.
      src: '/portraits/kaladin-bridgeman.webp',
      alt: 'Kaladin as a bridgeman, branded and holding a spear, with Syl beside him',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'way-of-kings', chapter: '49' }],
    },
    {
      // The blue uniform of Dalinar's guard, from his first WoR chapter.
      src: '/portraits/kaladin-uniform.webp',
      alt: 'Kaladin, with the shash brand on his forehead, in a blue Kholin uniform',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
    {
      // Flying with a spear of light: he's a Windrunner and Syl a weapon
      // by the end of WoR; shown from his first Oathbringer chapter.
      src: '/portraits/kaladin-windrunner.webp',
      alt: 'Kaladin in a blue uniform, flying through swirling winds with a white spear',
      artist: 'Connor Chamberlain',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '7' }] },
      ],
    },
    {
      // His living Shardplate comes at the very end of RoW.
      src: '/portraits/kaladin-shardplate.webp',
      alt: 'Kaladin in glowing blue Shardplate, holding a spear',
      artist: 'Gerva Perez',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Gerva_Perez',
      revealedIn: ['rhythm-of-war'],
    },
    {
      // Official concept art: flying to Shinovar with Szeth (WaT ch 12).
      src: '/portraits/kaladin-shinovar.webp',
      alt: 'Kaladin flying above the green hills of Shinovar while Szeth sits on a ridge',
      artist: 'Randy Vargas',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Vargas',
      revealedIn: [
        { all: ['rhythm-of-war', { book: 'wind-and-truth', chapter: '12' }] },
      ],
    },
  ],
  vasher: [
    {
      // Nightblood and its smoke are there from the prologue.
      src: '/portraits/vasher.webp',
      alt: 'Vasher, bearded, with a rope tied across his chest and a smoking black sword on his back',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'warbreaker', chapter: 'prologue' }],
    },
    {
      // Zahel is Adolin's former sword teacher (WoR ch 35).
      src: '/portraits/zahel-swordmaster.webp',
      alt: 'Zahel, long-haired and bearded, sparring with a young Adolin',
      artist: 'Ari Ibarra',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ari_Ibarra',
      revealedIn: [
        { all: ['warbreaker', { book: 'words-of-radiance', chapter: '35' }] },
      ],
    },
    {
      // Among drying sheets, where he spars with Kaladin (RoW ch 15).
      src: '/portraits/zahel-laundry.webp',
      alt: 'Zahel in brown robes with a laundry basket, among drying sheets',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [
        { all: ['warbreaker', { book: 'rhythm-of-war', chapter: '15' }] },
      ],
    },
  ],
  // His persona page, for readers who don't yet know who he is: nothing
  // here may hint at Vasher or Nightblood.
  zahel: [
    {
      // Zahel is Adolin's former sword teacher (WoR ch 35).
      src: '/portraits/zahel-swordmaster.webp',
      alt: 'Zahel, long-haired and bearded, sparring with a young Adolin',
      artist: 'Ari Ibarra',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ari_Ibarra',
      revealedIn: [{ book: 'words-of-radiance', chapter: '35' }],
    },
    {
      // Among drying sheets, where he spars with Kaladin (RoW ch 15).
      src: '/portraits/zahel-laundry.webp',
      alt: 'Zahel in brown robes with a laundry basket, among drying sheets',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '15' }],
    },
  ],
  'shallan-davar': [
    {
      // Plain portrait in a havah; nothing beyond her first chapter (WoK 3).
      src: '/portraits/shallan-davar-havah.webp',
      alt: 'Shallan, red-haired, in a blue-violet havah, clutching a satchel',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'way-of-kings', chapter: '3' }],
    },
    {
      // WoR leatherbound art, no spoilers; swapped in at her first WoR chapter.
      src: '/portraits/shallan-davar-portrait.webp',
      alt: 'Shallan with curly red hair in an embroidered blue havah',
      artist: 'Maria Dimova',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Maria_Dimova',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '1' }] },
      ],
    },
    {
      // Veil's hat and coat and her Shardblade (Pattern) are WoR reveals, the Blade's nature at the very end; shown from her first OB chapter.
      src: '/portraits/shallan-davar-veil.webp',
      alt: 'Shallan in a wide-brimmed white hat and dark coat, crouched on a ledge with a long silver Shardblade',
      artist: 'Kyle Pearson',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Kyle_Pearson',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '2' }] },
      ],
    },
    {
      // Shows the Radiant persona (blonde, with a sword) alongside Veil; Radiant is an Oathbringer reveal, so after OB.
      src: '/portraits/shallan-davar-card.webp',
      alt: 'Shallan holding a book, with a blonde swordswoman and a woman in a hat beside her, on a playing card',
      artist: 'Rebecca Sorge Jensen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Rebecca_Sorge_Jensen',
      revealedIn: [
        { all: ['oathbringer', { book: 'rhythm-of-war', chapter: '2' }] },
      ],
    },
    {
      // Her Plate, with Pattern as a Blade, from the official WaT sketchbook page; she gains Plate in WaT 13, where Testament is first a Blade too.
      src: '/portraits/shallan-davar-shardplate.webp',
      alt: 'A pencil sketch of Shallan in full Shardplate with a satchel at her hip, a long Shardblade beside her',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [{ book: 'wind-and-truth', chapter: '13' }],
    },
  ],
  'dalinar-kholin': [
    {
      // Plate and Blade; he wears them on the chasmfiend hunt in his first POV chapter (WoK 12).
      src: '/portraits/dalinar-kholin-shardplate.webp',
      alt: 'Dalinar in Shardplate, raising a huge glowing Shardblade',
      artist: 'Alex Allen',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Alex_Allen',
      revealedIn: [{ book: 'way-of-kings', chapter: '12' }],
    },
    {
      // No Blade (he trades it away late in WoK); shown from WoR.
      src: '/portraits/dalinar-kholin-coat.webp',
      alt: 'Dalinar in profile, grey-templed, in a dark blue Kholin uniform coat with the Kholin glyph on the shoulder',
      artist: 'HW Lee',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/HW_Lee',
      revealedIn: [
        {
          all: [
            'way-of-kings',
            { book: 'words-of-radiance', chapter: 'prologue' },
          ],
        },
      ],
    },
    {
      // Bondsmith glow and the Stormfather's face; his powers peak at Thaylen Field, so after OB.
      src: '/portraits/dalinar-kholin-bondsmith.webp',
      alt: 'Dalinar glowing with golden light, holding a book, as a vast face in the storm looms behind him',
      artist: 'Connor Chamberlain',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
      revealedIn: [
        {
          all: ['oathbringer', { book: 'rhythm-of-war', chapter: 'prologue' }],
        },
      ],
    },
  ],
  'adolin-kholin': [
    {
      // Uniform portrait; first appearance (WoK 12).
      src: '/portraits/adolin-kholin-uniform.webp',
      alt: 'Adolin, blond and smiling, in an open blue Kholin uniform',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'way-of-kings', chapter: '12' }],
    },
    {
      // Arena dueling is his WoR storyline; Plate and Blade are known from WoK.
      src: '/portraits/adolin-kholin-duelist.webp',
      alt: 'Adolin in blue Shardplate, raising a Shardblade in a dueling arena',
      artist: 'Randy Vargas',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Vargas',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '4' }] },
      ],
    },
    {
      // Maya standing as a vivid, fiery spren (her awakening is at the end of RoW); dated after RoW.
      src: '/portraits/adolin-kholin-maya.webp',
      alt: 'Adolin in dark Shardplate in Shadesmar, guarding a spren woman wreathed in golden flame',
      artist: 'Petar Penev',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Petar_Penev',
      revealedIn: [
        { all: ['rhythm-of-war', { book: 'wind-and-truth', chapter: '1' }] },
      ],
    },
  ],
  'navani-kholin': [
    {
      // Just Navani as a lighteyed lady with a gem; first appearance WoK 22.
      src: '/portraits/navani-kholin-card.webp',
      alt: 'Navani in a red havah with braided hair, holding a small gem, on a playing card',
      artist: 'Rebecca Sorge Jensen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Rebecca_Sorge_Jensen',
      revealedIn: [{ book: 'way-of-kings', chapter: '22' }],
    },
    {
      // Her fabrial lab/scholar role (with arm fabrial) is the focus of RoW; shown from RoW.
      src: '/portraits/navani-kholin-scholar.webp',
      alt: 'Navani in a purple dress, writing at a desk cluttered with fabrials and scrolls',
      artist: 'Magali Villeneuve',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Magali_Villeneuve',
      revealedIn: [
        {
          all: ['oathbringer', { book: 'rhythm-of-war', chapter: 'prologue' }],
        },
      ],
    },
    {
      // Bondsmiths poster: Navani as a radiant Bondsmith (RoW 110); after RoW.
      src: '/portraits/navani-kholin-bondsmith.webp',
      alt: 'Navani glowing in golden robes beside Dalinar in a blue uniform with a golden blade',
      artist: 'Steve Argyle',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Steve_Argyle',
      revealedIn: [
        {
          all: [
            'rhythm-of-war',
            { book: 'wind-and-truth', chapter: 'prologue' },
          ],
        },
      ],
    },
  ],
  'jasnah-kholin': [
    {
      // Plain portrait; first appearance WoK 5.
      src: '/portraits/jasnah-kholin-portrait.webp',
      alt: 'Jasnah, dark-haired, in a maroon havah',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'way-of-kings', chapter: '5' }],
    },
    {
      // Her Shardblade (Ivory) and Radiant glow; she's revealed an Elsecaller at OB 119, Blade at Thaylen Field; after OB.
      src: '/portraits/jasnah-kholin-elsecaller.webp',
      alt: 'Jasnah in a purple havah, a crystalline Shardblade in hand, before a pillar of light',
      artist: 'Randy Vargas',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Vargas',
      revealedIn: [
        {
          all: ['oathbringer', { book: 'rhythm-of-war', chapter: 'prologue' }],
        },
      ],
    },
  ],
  'renarin-kholin': [
    {
      // Plain portrait; first appearance WoK 12.
      src: '/portraits/renarin-kholin-portrait.webp',
      alt: 'Renarin, in spectacles, in a blue Kholin uniform',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'way-of-kings', chapter: '12' }],
    },
    {
      // His Shardblade (WoR 56) and Truthwatcher card (WoR 89); shown from his first OB chapter.
      src: '/portraits/renarin-kholin-shardblade.webp',
      alt: 'Renarin in a torn blue uniform, holding a Shardblade under a stormy red sky',
      artist: 'Randy Vargas',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Vargas',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '2' }] },
      ],
    },
    {
      // Glys as a red, corrupted spren is revealed at OB 115; after OB.
      src: '/portraits/renarin-kholin-glys.webp',
      alt: 'Renarin in spectacles and a blue uniform, a red crystalline spren hovering over his hand',
      artist: 'clarinking',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/clarinking',
      revealedIn: [
        {
          all: ['oathbringer', { book: 'rhythm-of-war', chapter: 'prologue' }],
        },
      ],
    },
  ],
  szeth: [
    {
      // Honorblade and Lashings are all in the WoK prologue.
      src: '/portraits/szeth-assassin.webp',
      alt: 'A hooded assassin in white, sword raised, crackling with light',
      artist: 'Krystian Biskup',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Krystian_Biskup',
      revealedIn: [{ book: 'way-of-kings', chapter: 'prologue' }],
    },
    {
      // Nightblood, which he receives at the end of WoR.
      src: '/portraits/szeth-nightblood.webp',
      alt: 'Szeth, bald and in white, drawing a black sword trailing dark smoke',
      artist: 'Ari Ibarra',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ari_Ibarra',
      revealedIn: [
        {
          all: [
            'words-of-radiance',
            { book: 'oathbringer', chapter: 'prologue' },
          ],
        },
      ],
    },
    {
      // Skybreaker squires and Surgebinding; he becomes a Skybreaker in OB.
      src: '/portraits/szeth-skybreaker.webp',
      alt: 'Szeth in white, holding a sheathed black sword, flying amid lightning with others behind him',
      artist: 'Petar Penev',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Petar_Penev',
      revealedIn: [
        { all: ['oathbringer', { book: 'rhythm-of-war', chapter: '16' }] },
      ],
    },
  ],
  lift: [
    {
      // No powers or spren; her first appearance (WoR I-9).
      src: '/portraits/lift-portrait.webp',
      alt: 'Lift, a long-haired girl in a green shirt, holding bread and a fork',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-9' }],
    },
    {
      // Her glowing slide is in WoR I-9, but the vine trail is her spren, named in Edgedancer; shown from Edgedancer ch 1.
      src: '/portraits/lift-thief.webp',
      alt: 'Lift sliding barefoot across a palace floor on a streak of light, a trail of vines behind her',
      artist: 'Ari Ibarra',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ari_Ibarra',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'edgedancer', chapter: '1' }] },
      ],
    },
    {
      // Wyndle with a face; dated after the Edgedancer novella.
      src: '/portraits/lift-wyndle.webp',
      alt: 'Lift sliding across desert ground beside a vine creature with a face',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: ['edgedancer'],
    },
  ],
  venli: [
    {
      // Before any new form: no red eyes or stormform; Eshonai in her armour. Both are seen in WoR I-1.
      src: '/portraits/venli-listeners.webp',
      alt: 'Venli, a listener with marbled skin and long dark hair in a rust-coloured shawl, beside Eshonai in pale armour',
      artist: 'taratjah',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/taratjah',
      revealedIn: [
        {
          all: ['way-of-kings', { book: 'words-of-radiance', chapter: 'i-1' }],
        },
      ],
    },
    {
      // Stormform with red lightning; she has taken stormform by WoR I-11.
      src: '/portraits/venli-stormform.webp',
      alt: 'Venli, a listener with carapace and long dark hair, red lightning between her hands',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-11' }],
    },
    {
      // Envoyform, from OB Interlude I-7 "Envoy".
      src: '/portraits/venli-envoyform.webp',
      alt: 'Venli, marbled red and white, with carapace horns and long hair, in white and blue robes',
      artist: 'Connor Chamberlain',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: 'i-7' }] },
      ],
    },
    {
      // Card titled Willshaper, with Timbre glowing in her hand; she is named a Willshaper at RoW 67.
      src: '/portraits/venli-willshaper.webp',
      alt: 'Venli sitting on a rock ledge, a small glowing light cupped in her hand',
      artist: 'Nastya Lehn',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Nastya_Lehn',
      revealedIn: [
        { all: ['oathbringer', { book: 'rhythm-of-war', chapter: '67' }] },
      ],
    },
  ],
  sylphrena: [
    {
      // Just Syl as a small airy woman; named in WoK 6.
      src: '/portraits/sylphrena-card.webp',
      alt: 'Syl, a translucent blue-white young woman with long flowing hair, on a playing card',
      artist: 'Rebecca Sorge Jensen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Rebecca_Sorge_Jensen',
      revealedIn: [{ book: 'way-of-kings', chapter: '6' }],
    },
    {
      // Syl as a Shardblade in Kaladin's hand, with his glowing eyes: she returns as a Blade at WoR 84.
      src: '/portraits/sylphrena-storm.webp',
      alt: 'Kaladin, eyes glowing, as Syl forms into a glowing Shardblade in his hand',
      artist: 'botanicaxu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/botanicaxu',
      revealedIn: [{ book: 'words-of-radiance', chapter: '84' }],
    },
    {
      // Wearing a Bridge Four uniform jacket and a later look; dated after OB to be safe.
      src: '/portraits/sylphrena-uniform.webp',
      alt: 'Syl, blue and glowing, with billowing cloud-like hair and a jacket with a Bridge Four patch',
      artist: 'Connor Chamberlain',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
      revealedIn: [
        { all: ['oathbringer', { book: 'rhythm-of-war', chapter: '2' }] },
      ],
    },
  ],
  pattern: [
    {
      // Shallan's notes on Pattern; dated to when he's named and bonded in the app's data (WoR 15).
      src: '/portraits/pattern-sketch.webp',
      alt: "Pages from Shallan's sketchbook: studies of a complex, spiky pattern with handwritten notes",
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [{ book: 'words-of-radiance', chapter: '15' }],
    },
    {
      // Pattern as Shallan's Blade, a late-WoR reveal; shown from Pattern's first OB chapter.
      src: '/portraits/pattern-blade.webp',
      alt: 'Shallan in a teal havah, hefting a long, patterned Shardblade over her shoulder',
      artist: 'clarinking',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/clarinking',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '8' }] },
      ],
    },
    {
      // Pattern's full Cognitive Realm form; Shallan travels through Shadesmar from OB 87.
      src: '/portraits/pattern-cognitive.webp',
      alt: 'A tall robed figure with a shifting pattern for a head, standing beside Shallan as she kneels',
      artist: 'Xabi Gazte',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Xabi_Gazte',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '87' }] },
      ],
    },
  ],
  teft: [
    {
      // Bridgeman clothes; first appearance WoK 11.
      src: '/portraits/teft-bridgeman.webp',
      alt: 'Teft, grey-bearded, in a brown vest',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: [{ book: 'way-of-kings', chapter: '11' }],
    },
    {
      // Bridge Four as Dalinar's guard, from WoR.
      src: '/portraits/teft-uniform.webp',
      alt: 'Teft in a blue Kholin uniform with a patch on the sleeve',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
    {
      // Flying on a swirl of Stormlight: Windrunner, OB 41.
      src: '/portraits/teft-windrunner.webp',
      alt: 'A miniature of Teft in uniform with a spear, rising on a swirl of wind',
      artist: 'Isaac Stewart',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Isaac_Stewart',
      revealedIn: [{ book: 'oathbringer', chapter: '41' }],
    },
  ],
  moash: [
    {
      // Carrying a bridge in Bridge Four, where he is from his first appearance (WoK 14).
      src: '/portraits/moash-bridge.webp',
      alt: 'Moash, bearded, carrying a wooden bridge on his shoulder',
      artist: 'Sheep',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Sheep',
      revealedIn: [{ book: 'way-of-kings', chapter: '14' }],
    },
    {
      // Kholin uniform, from WoR.
      src: '/portraits/moash-uniform.webp',
      alt: 'Moash, curly-haired and scowling, in a blue Kholin uniform',
      artist: 'Jamie Knierim',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jamie_Knierim',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
    {
      // Receiving the knife from Hnanan, OB 121.
      src: '/portraits/moash-knife.webp',
      alt: 'Moash holding a knife, a hovering cloaked figure behind him',
      artist: 'Soph Peralta',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Soph_Peralta',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '121' }] },
      ],
    },
    {
      // His black Vyre look; the name is given at OB 122; after OB.
      src: '/portraits/moash-vyre.webp',
      alt: 'Moash in a black coat, arms crossed over his chest',
      artist: 'Connor Chamberlain',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
      revealedIn: [
        { all: ['oathbringer', { book: 'rhythm-of-war', chapter: '6' }] },
      ],
    },
  ],
  vin: [
    {
      // Plain sketch of her as she is when the book opens: nothing later.
      src: '/portraits/vin-street-urchin.webp',
      alt: 'Vin as a young street urchin, short-haired and wary',
      artist: 'Laura MacMahon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Laura_MacMahon',
      revealedIn: [{ book: 'final-empire', chapter: '1' }],
    },
    {
      // Mistcloak and Allomantic rooftop running: Kelsier gives her the cloak on her first night of training (FE ch 7).
      src: '/portraits/vin-mistcloak.webp',
      alt: 'Vin in a tasseled mistcloak, crouched on a ledge above the spires of Luthadel with a dagger',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [{ book: 'final-empire', chapter: '7' }],
    },
    {
      // Well of Ascension leatherbound art ("The Heir of the Survivor" title); nothing specific, dated to WoA start.
      src: '/portraits/vin-heir-of-the-survivor.webp',
      alt: 'Vin in a mistcloak leaping beneath a great domed ceiling, a dagger in hand',
      artist: 'Miranda Meeks',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Miranda_Meeks',
      revealedIn: [
        { all: ['final-empire', { book: 'well-of-ascension', chapter: '1' }] },
      ],
    },
    {
      // A koloss-sized sword: she fights the koloss with one in the siege of Luthadel (WoA ch 54).
      src: '/portraits/vin-koloss-sword.webp',
      alt: 'Vin in a mistcloak holding a huge, crude sword taller than she is, under a red sky',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [
        { all: ['final-empire', { book: 'well-of-ascension', chapter: '54' }] },
      ],
    },
  ],
  kelsier: [
    {
      // Mistcloak, Allomancy and his Pits scars are all in the prologue at Tresting.
      src: '/portraits/kelsier-survivor.webp',
      alt: 'Kelsier in a mistcloak leaping through the night over a city, his scarred arms bare',
      artist: 'Antti Hakosaari',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Antti_Hakosaari',
      revealedIn: [{ book: 'final-empire', chapter: 'prologue' }],
    },
    {
      // Secret History cover: Kelsier walking on after death through the mists; it opens on him clinging on at the Well (part 1 ch 1), after HoA.
      src: '/portraits/kelsier-cognitive-shadow.webp',
      alt: 'Kelsier in a dark cloak, a glass knife in hand, walking out of a grey mist that streams from him like tendrils',
      artist: 'Miranda Meeks',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Miranda_Meeks',
      revealedIn: [
        { all: ['hero-of-ages', { book: 'secret-history', chapter: '1-1' }] },
      ],
    },
    {
      // Arcanum Unbounded interior art: Kelsier after death, meeting Khriss and Nazh at the campfire (Secret History part 3 ch 2); shown after HoA like the novella.
      src: '/portraits/kelsier-campfire.webp',
      alt: 'Kelsier walking up to two strangers at a campfire amid strange mist-plants, one aiming a pistol at him',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [
        { all: ['hero-of-ages', { book: 'secret-history', chapter: '3-2' }] },
      ],
    },
    {
      // As the Sovereign, back in a body with a spiked right eye: first seen in the BoM epilogue's coppermind vision (scarred arms, "Survive").
      src: '/portraits/kelsier-sovereign.webp',
      alt: 'Kelsier, blond and stubbled, a metal spike capping his right eye, in a long coat and waistcoat',
      artist: 'Diego López',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Diego_L%C3%B3pez',
      revealedIn: [
        {
          all: [
            'final-empire',
            { book: 'bands-of-mourning', chapter: 'epilogue' },
          ],
        },
      ],
    },
    {
      // Drawn as Thaidakar (his Ghostbloods identity, revealed WaT prologue); eyepatch look unsure, so dated to the end of Wind and Truth. Not used on the thaidakar persona page since it shows Kelsier's face.
      src: '/portraits/kelsier-hooded.webp',
      alt: 'Kelsier, blond and stubbled, with an eyepatch, pulling up the hood of a dark cloak',
      artist: 'AntiQcho (Antonio Hernández)',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/AntiQcho_(Antonio_Hern%C3%A1ndez)',
      revealedIn: [{ all: ['final-empire', 'wind-and-truth'] }],
    },
  ],
  'elend-venture': [
    {
      // Bookish young lord at a ball, as Vin first meets him (FE ch 12).
      src: '/portraits/elend-venture-reading.webp',
      alt: 'Elend Venture, a young nobleman in a green waistcoat, reading a book with a glass of wine in hand',
      artist: 'Stephanie McCrea Rainosek',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Stephanie_McCrea_Rainosek',
      revealedIn: [{ book: 'final-empire', chapter: '12' }],
    },
    {
      // Circlet, white uniform, beard and an army: the emperor of HoA. Shows no Allomancy, so no Mistborn spoiler; dated to HoA start.
      src: '/portraits/elend-venture-horseback.webp',
      alt: 'Elend, bearded and crowned, in a white uniform on a rearing white horse, raising a sword before his soldiers',
      artist: 'Katerina Ladon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Katerina_Ladon',
      revealedIn: [
        { all: ['well-of-ascension', { book: 'hero-of-ages', chapter: '1' }] },
      ],
    },
  ],
  sazed: [
    {
      // Terris steward's robes, as he is when introduced (FE ch 8).
      src: '/portraits/sazed-steward.webp',
      alt: 'Sazed, a tall bald Terrisman in V-patterned steward robes, standing on a rain-soaked Luthadel rooftop',
      artist: 'Billy Christian',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Billy_Christian',
      revealedIn: [{ book: 'final-empire', chapter: '8' }],
    },
    {
      // Sazed ascended as Harmony amid the cosmos: end of The Hero of Ages.
      src: '/portraits/sazed-cosmos.webp',
      alt: 'Sazed, with glowing white eyes, in Terris robes among swirling stars and planets',
      artist: 'Chris Rallis',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Chris_Rallis',
      revealedIn: ['hero-of-ages'],
    },
  ],
  marsh: [
    {
      // Marsh before the Inquisitor spikes, as he first appears (FE ch 6).
      src: '/portraits/marsh.webp',
      alt: 'Marsh, a stern man with short hair and a hard face',
      artist: 'Laura MacMahon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Laura_MacMahon',
      revealedIn: [{ book: 'final-empire', chapter: '6' }],
    },
    {
      // Steel Inquisitor spikes: Marsh is revealed as an Inquisitor late in FE (ch 36–38); dated to ch 38.
      src: '/portraits/marsh-spy.webp',
      alt: 'Marsh as a Steel Inquisitor, with spikes through his eyes, in dark robes in a grand hall',
      artist: 'Ari Ibarra',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ari_Ibarra',
      revealedIn: [{ book: 'final-empire', chapter: '38' }],
    },
    {
      // Ironeyes meets Marasi (AoL epilogue); on Marsh's page needs the spikes (FE ch 38) and the persona's AoL scene, like Vasher/Zahel.
      src: '/portraits/ironeyes-alley.webp',
      alt: 'Marsh, hooded, with a spike through one eye, meeting Marasi in a sunlit alley',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: [
        {
          all: [
            { book: 'final-empire', chapter: '38' },
            { book: 'alloy-of-law', chapter: 'epilogue' },
          ],
        },
      ],
    },
    {
      // Lost Metal leatherbound, Era 2 hat and coat; spikes need FE ch 38; Ironeyes is known as Marsh in The Lost Metal from ch 27.
      src: '/portraits/marsh-hat.webp',
      alt: 'Marsh with Inquisitor spikes through his eyes, in a hat and a long coat with a high collar',
      artist: 'Maria Dimova',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Maria_Dimova',
      revealedIn: [
        {
          all: [
            { book: 'final-empire', chapter: '38' },
            { book: 'lost-metal', chapter: '27' },
          ],
        },
      ],
    },
  ],
  ironeyes: [
    {
      // Ironeyes meets Marasi in the AoL epilogue; nothing hints at his identity.
      src: '/portraits/ironeyes-alley.webp',
      alt: 'A hooded man with a spike through one eye meeting Marasi in a sunlit alley',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: [{ book: 'alloy-of-law', chapter: 'epilogue' }],
    },
  ],
  spook: [
    {
      // The young crew member as introduced (FE ch 5).
      src: '/portraits/spook.webp',
      alt: 'Spook, a gangly teenage boy in a loose shirt, holding a bottle',
      artist: 'Egilde Art',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Egilde_Art',
      revealedIn: [{ book: 'final-empire', chapter: '5' }],
    },
    {
      // Blindfold, sword-fighting and fire: his Urteau look, escaping the burning building in HoA ch 41.
      src: '/portraits/spook-blindfold.webp',
      alt: 'Spook, blindfolded and in a ragged cloak, holding a sword in a burning building',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [
        { all: ['well-of-ascension', { book: 'hero-of-ages', chapter: '41' }] },
      ],
    },
  ],
  'waxillium-ladrian': [
    {
      // Portrait from the AoL leatherbound; dressed as a lord in Elendel (AoL ch 1).
      src: '/portraits/waxillium-ladrian.webp',
      alt: 'Waxillium Ladrian, with long sideburns, in a high collar and cravat',
      artist: 'Maria Dimova',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Maria_Dimova',
      revealedIn: [{ book: 'alloy-of-law', chapter: '1' }],
    },
    {
      // Fight with Miles on top of the train (AoL ch 12–13).
      src: '/portraits/waxillium-ladrian-traintop.webp',
      alt: 'Wax, in a dusty mistcoat, firing a revolver on a train roof as a man with a knife steps toward him',
      artist: 'Randy Vargas',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Vargas',
      revealedIn: [{ book: 'alloy-of-law', chapter: '13' }],
    },
  ],
  wayne: [
    {
      // AoL leatherbound portrait; plain look as introduced (AoL ch 2).
      src: '/portraits/wayne.webp',
      alt: 'Wayne, smirking, in a bowler-style hat',
      artist: 'Maria Dimova',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Maria_Dimova',
      revealedIn: [{ book: 'alloy-of-law', chapter: '2' }],
    },
    {
      // Speed bubble aboard a train with Wax: the train attack in AoL ch 12.
      src: '/portraits/wayne-train.webp',
      alt: 'Wayne leaping inside a shimmering speed bubble in a train car while Wax fires a revolver behind him',
      artist: 'Katerina Ladon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Katerina_Ladon',
      revealedIn: [{ book: 'alloy-of-law', chapter: '12' }],
    },
  ],
  'marasi-colms': [
    {
      // Plain portrait; first appearance (AoL ch 2).
      src: '/portraits/marasi-colms.webp',
      alt: 'Marasi Colms, with short dark wavy hair, in a high-collared blouse and dark vest',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'alloy-of-law', chapter: '2' }],
    },
    {
      // AoL leatherbound endpaper; she first fights with a rifle in AoL ch 6.
      src: '/portraits/marasi-colms-rifle.webp',
      alt: 'Marasi in a dark dress holding a rifle beneath a streetlamp, swirling mists at her feet',
      artist: 'Dan Watson',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dan_Watson',
      revealedIn: [{ book: 'alloy-of-law', chapter: '6' }],
    },
    {
      // From the Shadows of Self leatherbound; nothing specific, dated to her first SoS chapter.
      src: '/portraits/marasi-colms-curls.webp',
      alt: 'Marasi with tousled curls, in a dark high-collared coat',
      artist: 'Maria Dimova',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Maria_Dimova',
      revealedIn: [
        { all: ['alloy-of-law', { book: 'shadows-of-self', chapter: '2' }] },
      ],
    },
  ],
  'steris-harms': [
    {
      // Plain portrait (SoS leatherbound art, but nothing book-specific); first appearance AoL ch 2.
      src: '/portraits/steris-harms.webp',
      alt: 'Steris Harms, with pinned-up blond curls and a feather in her hair',
      artist: 'Maria Dimova',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Maria_Dimova',
      revealedIn: [{ book: 'alloy-of-law', chapter: '2' }],
    },
    {
      // Planning at a desk with Wax's guns about: engaged to Wax after AoL; dated to her first SoS chapter.
      src: '/portraits/steris-harms-desk.webp',
      alt: 'Steris in a blue gown writing at a cluttered desk, revolvers lying beside her papers',
      artist: 'Anna Podedworna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Anna_Podedworna',
      revealedIn: [
        { all: ['alloy-of-law', { book: 'shadows-of-self', chapter: '2' }] },
      ],
    },
  ],
  raoden: [
    {
      // The morning the Shaod takes him: Elantris ch 1. Shows only the dark Elantrian splotches.
      src: '/portraits/raoden-shaod.webp',
      alt: 'Raoden staring at his blotched, Elantrian face in a mirror',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [{ book: 'elantris', chapter: '1' }],
    },
    {
      // Silver skin, white hair and a working glowing Aon = restored Elantrian, the ending of Elantris; dated to the whole book.
      src: '/portraits/raoden-restored.webp',
      alt: 'Raoden, silver-skinned and white-haired, in white and gold robes, drawing a glowing Aon in the air',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: ['elantris'],
    },
  ],
  sarene: [
    {
      // Plain portrait; her first POV chapter (ch 2).
      src: '/portraits/sarene.webp',
      alt: 'Sarene, blond and in a blue gown with a circlet, holding a book',
      artist: 'treefin',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Treefin',
      revealedIn: [{ book: 'elantris', chapter: '2' }],
    },
    {
      // The sword: she offers to teach fencing in ch 14 and starts in ch 17. Seon Ashe is known from ch 2. Long hair, nothing from the ending.
      src: '/portraits/sarene-fencing.webp',
      alt: 'Sarene in a blue dress holding a long sword, with her seon glowing behind her',
      artist: 'Shayndlart',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shayndlart',
      revealedIn: [{ book: 'elantris', chapter: '17' }],
    },
  ],
  hrathen: [
    {
      // Official Ukrainian-edition interior art; his standard gyorn armor from his first chapter (ch 3). No Dakhor elements.
      src: '/portraits/hrathen.webp',
      alt: 'Hrathen in red armor and a long red cloak before a stone keep',
      artist: 'Olena Vasina',
      artistUrl: 'https://coppermind.net/wiki/File:Hrathen_by_Olena_Vasina.jpg',
      revealedIn: [{ book: 'elantris', chapter: '3' }],
    },
  ],
  vivenna: [
    {
      // Plain Idrian princess look; her first POV chapter (ch 2).
      src: '/portraits/vivenna.webp',
      alt: 'Vivenna, dark-haired with a tidy ponytail, glancing over her shoulder',
      artist: 'winsbuck',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/winsbuckart',
      revealedIn: [{ book: 'warbreaker', chapter: '2' }],
    },
    {
      // Lemex gives her his Breath in ch 10.
      src: '/portraits/vivenna-breath.webp',
      alt: 'Vivenna kneeling in shock as rainbow-colored Breath flows into her from a dying man',
      artist: 'Jessica Liu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jessica_Liu',
      revealedIn: [{ book: 'warbreaker', chapter: '10' }],
    },
    {
      // Fear-white hair and only a shift after being robbed in the slums: ch 37.
      src: '/portraits/vivenna-slums.webp',
      alt: 'Vivenna, white-haired and in a ragged shift, huddled in the rain',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [{ book: 'warbreaker', chapter: '37' }],
    },
    {
      // Practising Awakening with rope (ch 46) and her first sword lesson from Vasher (ch 49).
      src: '/portraits/vivenna-awakening.webp',
      alt: 'Vivenna, hair blowing, with a sword at her belt and an Awakened rope coiling from her hand',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'warbreaker', chapter: '49' }],
    },
    {
      // Highmarshal Azure of the Kholinar Wall Guard; she first appears in OB ch 70 (persona identityRevealedIn is warbreaker + OB 70).
      src: '/portraits/azure-highmarshal.webp',
      alt: 'A short-haired woman with a scarred face in chain mail and a blue cloak, a sword at her hip',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['warbreaker', { book: 'oathbringer', chapter: '70' }] },
      ],
    },
  ],
  azure: [
    {
      // Highmarshal Azure of the Kholinar Wall Guard; she first appears in OB ch 70 (persona identityRevealedIn is warbreaker + OB 70).
      src: '/portraits/azure-highmarshal.webp',
      alt: 'A short-haired woman with a scarred face in chain mail and a blue cloak, a sword at her hip',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'oathbringer', chapter: '70' }],
    },
  ],
  lightsong: [
    {
      // Just his god-in-a-palace look with the Returned glow; his first chapter (ch 3).
      src: '/portraits/lightsong.webp',
      alt: 'Lightsong, tall and glowing faintly, seated on temple steps in red and gold',
      artist: 'Laurys L',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Laurys_L',
      revealedIn: [{ book: 'warbreaker', chapter: '3' }],
    },
  ],
  wit: [
    {
      // Persona-only art: Wit at court in black, first seen WoK ch 12. Nothing hints at Hoid.
      src: '/portraits/wit-kings-wit.webp',
      alt: 'Wit, smirking, in a black high-collared coat with a sword at his hip',
      artist: 'Randy Bishop',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Bishop',
      revealedIn: [{ book: 'way-of-kings', chapter: '12' }],
    },
  ],
  hoid: [
    {
      // Roshar Wit art on Hoid's page only once the reader can tell Wit is Hoid (persona identityRevealedIn: WoK ch 58; Wit first appears ch 12).
      src: '/portraits/wit-kings-wit.webp',
      alt: 'Wit, smirking, in a black high-collared coat with a sword at his hip',
      artist: 'Randy Bishop',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Randy_Bishop',
      revealedIn: [{ book: 'way-of-kings', chapter: '58' }],
    },
    {
      // Official Secret Projects promo (from the Tress art file). The planets show him as a world-traveling storyteller, which the narrator of Tress and Yumi says outright; dated to where those books name him (his appearsIn: Tress ch 4, Yumi ch 5).
      src: '/portraits/hoid-storyteller.webp',
      alt: 'Hoid, white-haired with a lute on his back, gesturing at a sky full of planets',
      artist: 'Howard Lyon',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Howard_Lyon',
      revealedIn: [
        { book: 'tress', chapter: '4' },
        { book: 'yumi', chapter: '5' },
      ],
    },
  ],
  tress: [
    {
      // Official interior art: Tress and her tea with the Verdant moon; nothing beyond her home life on the Rock (ch 1).
      src: '/portraits/tress.webp',
      alt: 'Tress in a simple dress, sipping from a cup on a wooden porch, her hair blowing against a green sky',
      artist: 'Howard Lyon',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Howard_Lyon',
      revealedIn: [{ book: 'tress', chapter: '1' }],
    },
    {
      // Huck (met ch 9) plus a coat and glowing cup that likely show her later seafaring/spore-craft role; unsure, so dated to the end of the book.
      src: '/portraits/tress-huck.webp',
      alt: 'Tress in a red coat holding a glowing cup, with a rat in a little hat on her shoulder',
      artist: 'Shayndlart',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shayndlart',
      revealedIn: ['tress'],
    },
  ],
  yumi: [
    {
      // Yoki-hijo with a stacking stone and hijo spirits: her first chapter (ch 2).
      src: '/portraits/yumi.webp',
      alt: 'Yumi holding a stone, softly lit by floating lights',
      artist: 'FelCandy',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/FelCandy',
      revealedIn: [{ book: 'yumi', chapter: '2' }],
    },
    {
      // Official interior art: shopping for clothes in Kilahito with Akane (ch 15), after the swap.
      src: '/portraits/yumi-dress-shopping.webp',
      alt: 'Yumi in a long dress looking back from a mirror, where Painter stands behind her',
      artist: 'Aliya Chen',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Aliya_Chen',
      revealedIn: [{ book: 'yumi', chapter: '15' }],
    },
    {
      // Official interior art: Yumi, physically in Painter's world, fleeing a nightmare with him (ch 29). Dated there, after the swap (ch 7-11) and Yumi's time in Kilahito.
      src: '/portraits/yumi-nightmare.webp',
      alt: 'Yumi and Painter running from a looming, glowing-eyed nightmare',
      artist: 'Aliya Chen',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Aliya_Chen',
      revealedIn: [{ book: 'yumi', chapter: '29' }],
    },
  ],
  nikaro: [
    {
      // Nightmare painter on his rounds in Kilahito: ch 1.
      src: '/portraits/nikaro.webp',
      alt: 'Painter in a long dark coat with brushes on his back, on a neon-lit street',
      artist: 'Gar leyva',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Gar_leyva',
      revealedIn: [{ book: 'yumi', chapter: '1' }],
    },
    {
      // The sign is the Noodle Pupil, first visited in ch 16.
      src: '/portraits/nikaro-noodle-pupil.webp',
      alt: 'Painter, hood up and hair in his face, under a pink neon sign',
      artist: 'FelCandy',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/FelCandy',
      revealedIn: [{ book: 'yumi', chapter: '16' }],
    },
    {
      // Official interior art: Yumi, physically in Painter's world, fleeing a nightmare with him (ch 29). Dated there, after the swap (ch 7-11) and Yumi's time in Kilahito.
      src: '/portraits/yumi-nightmare.webp',
      alt: 'Painter and Yumi running from a looming, glowing-eyed nightmare',
      artist: 'Aliya Chen',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Aliya_Chen',
      revealedIn: [{ book: 'yumi', chapter: '29' }],
    },
  ],
  felt: [
    {
      // Guiding Dalinar to the Valley to see the Nightwatcher (OB 114).
      src: '/portraits/felt-valley.webp',
      alt: 'Felt, in a hat and red cloak, beside Dalinar Kholin on a ridge below sunlit cliffs',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'oathbringer', chapter: '114' }],
    },
  ],
  sigzil: [
    {
      // Kholin blue uniform: Bridge Four joins Dalinar's army late in WoK.
      src: '/portraits/sigzil-bridgeman.webp',
      alt: 'Sigzil, with a forehead tattoo, in a blue uniform',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: ['way-of-kings'],
    },
    {
      // Uniform with a shoulder patch, taking notes; dated late to be safe.
      src: '/portraits/sigzil-clerk.webp',
      alt: 'Sigzil in a blue coat with a shoulder patch, writing in a notebook',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: ['oathbringer'],
    },
    {
      // Windrunner glyph on the patch: he speaks the Ideal in Dawnshard / RoW.
      src: '/portraits/sigzil-windrunner.webp',
      alt: 'Sigzil in a blue coat with a glyph patch, holding a book',
      artist: 'paintweaver',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Paintweaver',
      revealedIn: [
        { book: 'dawnshard', chapter: 'epilogue' },
        { book: 'rhythm-of-war', chapter: '10' },
      ],
    },
    {
      // As Nomad, once the reader knows who Nomad is.
      src: '/portraits/nomad-pin.webp',
      alt: 'Nomad in a red coat, raising a jagged sword',
      artist: 'Sandara Tang',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Sandara',
      revealedIn: [
        { all: ['way-of-kings', { book: 'sunlit-man', chapter: '39' }] },
      ],
    },
  ],
  // His persona page, for readers who don't yet know who he is: nothing
  // here may hint at Sigzil or his home world.
  nomad: [
    {
      // He fights with a Shardblade from SLM ch 3.
      src: '/portraits/nomad-pin.webp',
      alt: 'Nomad in a red coat, raising a jagged sword',
      artist: 'Sandara Tang',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Sandara',
      revealedIn: [{ book: 'sunlit-man', chapter: '3' }],
    },
  ],
  // Mistborn Era 1 (manifests in ~/cig-char-data/art/era1-a.json, era1-b.json).
  breeze: [
    {
      // Official Mistborn Deckbuilding Game card art (Brotherwise). Just Breeze in fine clothes with wine, as he is when introduced at the crew meeting (FE ch 4). Nothing about his real name.
      src: '/portraits/breeze-soother.webp',
      alt: 'Breeze, a portly gentleman in a dark coat and plum waistcoat, holding a glass of wine in a curtained study',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [{ book: 'final-empire', chapter: '4' }],
    },
    {
      // Official Deckbuilding Game "Charm" card: Breeze with Allrianne. Her pursuit of him is only plain from WoA ch 50 (Vin sees her seducing him), so dated there.
      src: '/portraits/breeze-charm.webp',
      alt: 'Breeze lounging on a sofa while a young blonde noblewoman in a pink gown leans flirtatiously against him',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [{ book: 'well-of-ascension', chapter: '50' }],
    },
  ],
  'edgard-ladrian': [
    {
      // Same as the Breeze persona's first piece (FE ch 4), gated on the identity reveal {all: [FE, SoS ch 19]} like Vasher/Zahel.
      src: '/portraits/breeze-soother.webp',
      alt: 'Breeze, a portly gentleman in a dark coat and plum waistcoat, holding a glass of wine in a curtained study',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [
        { all: ['final-empire', { book: 'shadows-of-self', chapter: '19' }] },
      ],
    },
    {
      // Same as the persona's Charm card (WoA ch 50) plus the identity reveal.
      src: '/portraits/breeze-charm.webp',
      alt: 'Breeze lounging on a sofa while a young blonde noblewoman in a pink gown leans flirtatiously against him',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [
        {
          all: [
            'final-empire',
            { book: 'shadows-of-self', chapter: '19' },
            { book: 'well-of-ascension', chapter: '50' },
          ],
        },
      ],
    },
  ],
  clubs: [
    {
      // Clubs in his carpentry shop, where the crew meets when he first appears (FE ch 4). Nothing later.
      src: '/portraits/clubs-pipe.webp',
      alt: 'Clubs, a scowling grey-haired old man in suspenders, smoking a pipe in his cluttered woodshop',
      artist: 'Ydunn Lopez',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ydunn_Lopez',
      revealedIn: [{ book: 'final-empire', chapter: '4' }],
    },
    {
      // Plain portrait the Coppermind files under The Well of Ascension; nothing specific shown, so dated to his first WoA chapter (6).
      src: '/portraits/clubs-hat.webp',
      alt: 'Clubs, weathered and scowling, arms crossed under a wide-brimmed hat and a long coat',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['final-empire', { book: 'well-of-ascension', chapter: '6' }] },
      ],
    },
  ],
  cladent: [
    {
      // Persona art (FE ch 4) gated on his real name's reveal (HoA), Vasher/Zahel pattern.
      src: '/portraits/clubs-pipe.webp',
      alt: 'Clubs, a scowling grey-haired old man in suspenders, smoking a pipe in his cluttered woodshop',
      artist: 'Ydunn Lopez',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ydunn_Lopez',
      revealedIn: [
        { all: ['hero-of-ages', { book: 'final-empire', chapter: '4' }] },
      ],
    },
    {
      // Persona art (WoA ch 6) gated on the HoA identity reveal.
      src: '/portraits/clubs-hat.webp',
      alt: 'Clubs, weathered and scowling, arms crossed under a wide-brimmed hat and a long coat',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['hero-of-ages', { book: 'well-of-ascension', chapter: '6' }] },
      ],
    },
  ],
  'lord-ruler': [
    {
      // Official Mistborn Handbook art (Cosmere RPG). He first appears on the page in Fountain Square at FE ch 34, arriving by carriage among the fallen rebels. No bracers, no Terris or packman hint. The page redirects to Rashek from ch 38, so one piece is enough.
      src: '/portraits/lord-ruler-carriage.webp',
      alt: 'The Lord Ruler, tall with long black hair, in a white coat and dark waistcoat, stepping from his black carriage over fallen bodies',
      artist: 'Mike Lim',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Mike_Lim',
      revealedIn: [{ book: 'final-empire', chapter: '34' }],
    },
  ],
  rashek: [
    {
      // Official Deckbuilding Game "Confrontation" card. The spears are from FE ch 34; showing Rashek as the Lord Ruler needs the identity reveal at FE ch 38.
      src: '/portraits/rashek-confrontation.webp',
      alt: 'Rashek as the Lord Ruler, in black, walking calmly with two spears through his chest before a burning city of spires',
      artist: 'Gal Or',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Gal_Or',
      revealedIn: [{ book: 'final-empire', chapter: '38' }],
    },
    {
      // Rashek betraying Alendi at the Well of Ascension. The Well and Alendi's name are late WoA, so it goes to the end of WoA, matching era1-b's Alendi entry. Reuses era1-b's file alendi-at-the-well.webp.
      src: '/portraits/alendi-at-the-well.webp',
      alt: 'Alendi, old and weary in furs, kneeling by a glowing light in the snow as a shadowed Rashek behind him raises a knife',
      artist: 'Hinumay',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Hinumay',
      revealedIn: ['well-of-ascension'],
    },
  ],
  dockson: [
    {
      // Dockson as the crew's organiser with his paperwork; nothing past his first chapter (FE ch 2).
      src: '/portraits/dockson-documents.webp',
      alt: 'Dockson, bearded, in a brown coat and cravat, carrying a stack of books and papers',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'final-empire', chapter: '2' }],
    },
    {
      // Plain portrait with nothing book-specific. Swapped in at his first WoA chapter (5) so the art changes with the book.
      src: '/portraits/dockson-waistcoat.webp',
      alt: 'Dockson, dark-haired with a goatee, in a green double-breasted waistcoat before red-lit gothic windows',
      artist: 'SiarexKH',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/SiarexKH',
      revealedIn: [
        { all: ['final-empire', { book: 'well-of-ascension', chapter: '5' }] },
      ],
    },
  ],
  hammond: [
    {
      // Ham as he is introduced at the crew meeting (FE ch 4): sleeveless vest and muscles, no Allomancy shown.
      src: '/portraits/hammond-thug.webp',
      alt: 'Ham, muscular and short-haired, in a sleeveless vest with arms crossed under a hazy red sky',
      artist: 'Egilde Art',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Egilde_Art',
      revealedIn: [{ book: 'final-empire', chapter: '4' }],
    },
  ],
  tensoon: [
    {
      // TenSoon in his wolfhound body. His page and the fact that he's the wolfhound only appear at WoA ch 47 (the impersonation reveal), so that's the earliest date.
      src: '/portraits/tensoon-wolfhound.webp',
      alt: 'TenSoon in the body of a great shaggy wolfhound, lying in front of a red backdrop',
      artist: 'Egilde Art',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Egilde_Art',
      revealedIn: [{ book: 'well-of-ascension', chapter: '47' }],
    },
    {
      // Shows his glowing bones/insides, which hints at kandra true bodies, Blessings and spikes (HoA reveals). Conservatively dated to the end of HoA.
      src: '/portraits/tensoon-glowing-bones.webp',
      alt: 'TenSoon as a pale wolfhound, his ribs glowing like embers through his fur, amid swirling sparks',
      artist: 'Shayndlart',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shayndlart',
      revealedIn: ['hero-of-ages'],
    },
  ],
  oreseur: [
    {
      // From the artist's "OreSeur in his bodies": the face looks not quite human, hinting at what a kandra is. Kandra species is dated FE epilogue, so this waits for the end of FE.
      src: '/portraits/oreseur-face.webp',
      alt: 'OreSeur, a gaunt bald man with an eerie, pale, almost translucent face',
      artist: 'Lydia Futral',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Lydia_Futral',
      revealedIn: ['final-empire'],
    },
    {
      // Official Mistborn: House War art (Crafty Games) titled OreSeur: the wolfhound body Vin gives him in WoA. Dated to WoA ch 20, where his page's wolfhound fact is dated. It looks the same as what the reader believes OreSeur to be, so it doesn't hint at TenSoon. No Coppermind artist page; links to the artist's site.
      src: '/portraits/oreseur-wolfhound.webp',
      alt: 'A shaggy wolfhound standing on a Luthadel rooftop at dusk beside a seated, cloaked figure',
      artist: 'Abigail Platter',
      artistUrl: 'http://abigailplatter.com/',
      revealedIn: [
        { all: ['final-empire', { book: 'well-of-ascension', chapter: '20' }] },
      ],
    },
  ],
  tindwyl: [
    {
      // Official Terris: Wrought of Copper art (Mistborn Adventure Game). Her bracers/metalminds suggest a Keeper, so dated to WoA ch 13, after she is guessed to be a Keeper and uses Feruchemy to snap her bonds, not her ch 10 arrival.
      src: '/portraits/tindwyl-keeper.webp',
      alt: 'Tindwyl, a stern Terriswoman in layered V-patterned robes and bracers, one finger raised as if lecturing',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [{ book: 'well-of-ascension', chapter: '13' }],
    },
    {
      // Spanish illustrated edition interior art. Shows her studying beside Sazed, closely and fondly, as on their night of study over his rubbing (WoA ch 37). Not dated earlier because it shows their closeness. No Coppermind artist page; links to the original post.
      src: '/portraits/tindwyl-with-sazed.webp',
      alt: 'Tindwyl, long braid and gold earrings, studying a glowing book alongside Sazed',
      artist: 'Eva Gutierrez',
      artistUrl: 'https://www.instagram.com/p/CUcxdHgqiT4/',
      revealedIn: [{ book: 'well-of-ascension', chapter: '37' }],
    },
  ],
  'straff-venture': [
    {
      // Official House War art: the high lord in his keep, as in FE (first appears FE ch 19). The artist isn't credited, so this links to the Kickstarter post.
      src: '/portraits/straff-venture-keep.webp',
      alt: 'Straff Venture, a stern nobleman in a dark suit with a cane, standing before tall stained-glass windows',
      artist: 'Mistborn: House War (Crafty Games)',
      artistUrl:
        'https://www.kickstarter.com/projects/craftygames/mistborn-house-war/posts/1607911',
      revealedIn: [{ book: 'final-empire', chapter: '19' }],
    },
    {
      // Official House War "Siege of Luthadel" art: Straff in uniform at his siege camp, dated to his first on-page WoA chapter (18). No Coppermind artist page.
      src: '/portraits/straff-venture-siege.webp',
      alt: 'Straff Venture in a dark military uniform with a sword, standing before an army camp of tents under a red sky',
      artist: 'Oliver Specht',
      artistUrl: 'https://oliver-specht.de/work',
      revealedIn: [
        { all: ['final-empire', { book: 'well-of-ascension', chapter: '18' }] },
      ],
    },
  ],
  'zane-venture': [
    {
      // Plain head-and-shoulders sketch. No Allomancy, madness, Straff or watcher hints. Safe at his first appearance (WoA ch 2).
      src: '/portraits/zane-venture-portrait.webp',
      alt: 'Zane, a narrow-faced young man with messy dark curly hair and a dark collar',
      artist: 'Laura MacMahon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Laura_MacMahon',
      revealedIn: [{ book: 'well-of-ascension', chapter: '2' }],
    },
    {
      // Official Deckbuilding Game "Precise Shot" card: Mistborn Allomancy (coin-throwing, leaping in the mists), dated to WoA ch 17 when he is revealed as the Mistborn watcher. Nothing about his madness or father.
      src: '/portraits/zane-venture-precise-shot.webp',
      alt: 'Zane, all in black, leaping through the misty night over a city of spires, a dagger in one hand as he flings a coin',
      artist: 'Gal Or',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Gal_Or',
      revealedIn: [{ book: 'well-of-ascension', chapter: '17' }],
    },
  ],
  'allrianne-cett': [
    {
      // Spanish illustrated WoA interior art, a plain portrait. Safe at her first appearance (WoA ch 21). No Coppermind artist page.
      src: '/portraits/allrianne-cett-pink.webp',
      alt: 'Allrianne, a young blonde noblewoman with a pink bow in her hair and a high-collared pink dress',
      artist: 'Ana Mateos',
      artistUrl: 'https://www.instagram.com/p/CUdLZWzKrmP/',
      revealedIn: [{ book: 'well-of-ascension', chapter: '21' }],
    },
    {
      // Official Deckbuilding Game "Charm" card: her flirting with Breeze, plain from WoA ch 50.
      src: '/portraits/breeze-charm.webp',
      alt: 'Allrianne, a young blonde noblewoman in a pink gown, leaning flirtatiously against Breeze on a sofa',
      artist: 'Deandra Scicluna',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Deandra_Scicluna',
      revealedIn: [{ book: 'well-of-ascension', chapter: '50' }],
    },
  ],
  'ashweather-cett': [
    {
      // Official Cosmere RPG (Mistborn) art: the scheming lord planning his campaign. Nothing past his arrival in Luthadel (WoA ch 31).
      src: '/portraits/ashweather-cett-map.webp',
      alt: 'Ashweather Cett, bearded and brooding, seated with clasped hands over a war map scattered with tokens',
      artist: 'Darko Stojanovic',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Darko_Stojanovic',
      revealedIn: [{ book: 'well-of-ascension', chapter: '31' }],
    },
  ],
  'aradan-yomen': [
    {
      // Obligator tattoos and his diadem with its bead. The bead is cited from HoA ch 43, so it's dated there and not to his ch 30 first mention. The alt doesn't say it's atium.
      src: '/portraits/aradan-yomen.webp',
      alt: 'Aradan Yomen, bald and round-faced, with intricate obligator tattoos around his eyes and a silver diadem set with a small bead',
      artist: 'LittleGreyDragon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/LittleGreyDragon',
      revealedIn: [{ book: 'hero-of-ages', chapter: '43' }],
    },
  ],
  beldre: [
    {
      // Her first meeting with Spook (eyes wrapped, as he is throughout Urteau): he slips through the crowd to speak to her at Quellion's side in HoA ch 16. Nothing of her Allomancy (ch 58).
      src: '/portraits/beldre-first-meeting.webp',
      alt: 'Beldre, auburn-haired in a plain dress, face to face in the mist with a cloaked young man whose eyes are bound with cloth',
      artist: 'Kate7h',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Kate7h',
      revealedIn: [{ book: 'hero-of-ages', chapter: '16' }],
    },
    {
      // Spook and Beldre together on the Field of Rebirth under a blue sky and green grass: the world after the Catacendre, so dated to the end of HoA.
      src: '/portraits/beldre-field-of-rebirth.webp',
      alt: 'Beldre embracing Spook in a sunny, grassy field under a blue sky',
      artist: 'Kate7h',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Kate7h',
      revealedIn: ['hero-of-ages'],
    },
  ],
  mare: [
    {
      // Kings Wild Project Mistborn deck card. Just her face, flowers and a dress: no Allomancy or Pits imagery. Safe where Kelsier first speaks of his wife (FE ch 4).
      src: '/portraits/mare-queen-of-hearts.webp',
      alt: 'Mare as the Queen of Hearts on a playing card, flowers in her hair',
      artist: 'Jackson Robinson',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Jackson_Robinson',
      revealedIn: [{ book: 'final-empire', chapter: '4' }],
    },
    {
      // The folded flower picture she treasured; Vin is given it in FE ch 35, so dated there.
      src: '/portraits/mare-flower.webp',
      alt: 'Mare, dark hair pinned up with white flowers, looking down at a folded paper with a drawing of a flower',
      artist: 'Egilde Art',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Egilde_Art',
      revealedIn: [{ book: 'final-empire', chapter: '35' }],
    },
  ],
  melaan: [
    {
      // Her female Era 2 body as she appears in Shadows of Self (tavern scene with Wayne, SoS ch 13). Nothing Era 1 shows her wooden True Body, so an HoA-only reader sees no art.
      src: '/portraits/melaan-portrait.webp',
      alt: 'MeLaan as a woman with short wavy hair and a dark, gold-trimmed dress',
      artist: 'Jamie Knierim',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jamie_Knierim',
      revealedIn: [{ book: 'shadows-of-self', chapter: '13' }],
    },
    {
      // Mistborn Adventure Game (Masks of the Past) art: her True Body bones showing through her face, an Era 2 look. Dated to the end of SoS to be safe.
      src: '/portraits/melaan-masks-of-the-past.webp',
      alt: 'MeLaan, tall in vest and trousers with a knife, half her face peeled away to show a skull of crystal bone',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: ['shadows-of-self'],
    },
  ],
  paalm: [
    {
      // This is Lessie's face, so on Paalm's page it only appears once Lessie is revealed as Paalm (alias revealedIn SoS ch 26). Paalm is only mentioned in HoA, with no art for that.
      src: '/portraits/paalm-lessie.webp',
      alt: 'Paalm in her Lessie form: a freckled, dark-haired woman with a sly grin',
      artist: 'Jamie Knierim',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jamie_Knierim',
      revealedIn: [{ book: 'shadows-of-self', chapter: '26' }],
    },
    {
      // Mistborn Adventure Game art of her as Bleeder, with the mask and Lessie's face; dated to the end of SoS.
      src: '/portraits/paalm-masks-of-the-past.webp',
      alt: 'Paalm in a long coat with a revolver, lowering a horned mask from her freckled face',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: ['shadows-of-self'],
    },
  ],
  'shan-elariel': [
    {
      // Just a noblewoman in a ball gown: Vin meets her at a ball in FE ch 18.
      src: '/portraits/shan-elariel-ball.webp',
      alt: 'Shan Elariel in a ruffled blue ball gown, auburn hair in curls, looking down her nose',
      artist: 'Jove',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jove',
      revealedIn: [{ book: 'final-empire', chapter: '18' }],
    },
    {
      // Mistborn: The Deckbuilding Game card. The mistcloak and coin show she is Mistborn, revealed when she tries to kill Elend and fights Vin (FE ch 30).
      src: '/portraits/shan-elariel-the-noble.webp',
      alt: 'Shan Elariel in a dark tasseled mistcloak on a balcony above a ballroom, flipping a coin',
      artist: 'Svetlana Kostina',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Svetlana_Kostina',
      revealedIn: [{ book: 'final-empire', chapter: '30' }],
    },
  ],
  khrissalla: [
    {
      // A plain scholarly portrait (from White Sand) with nothing tied to any plot point; safe wherever she first appears (BoM ch 12, Secret History part 3 ch 2, White Sand prologue).
      src: '/portraits/khrissalla-map.webp',
      alt: 'Khriss, a dark-skinned young woman with beaded braids, studying a large map beside stacks of books',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [
        { book: 'bands-of-mourning', chapter: '12' },
        { book: 'secret-history', chapter: '3-2' },
        { book: 'white-sand-omnibus', chapter: 'prologue' },
      ],
    },
    {
      // Nazh carrying Khriss's things, from Secret History, where they first appear together at the campfire (part 3 ch 2). Shows nothing else from the book.
      src: '/portraits/khriss-and-nazh.webp',
      alt: 'Khriss walking and writing notes while Nazh trudges behind her, laden with books and baggage',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [{ book: 'secret-history', chapter: '3-2' }],
    },
  ],
  nazrilof: [
    {
      // Secret History art; Nazh is first seen in person with Khriss at the campfire (part 3 ch 2). His WoR mention is only map notes, so no earlier art.
      src: '/portraits/khriss-and-nazh.webp',
      alt: 'Nazh, scowling under a huge pack of books and baggage, trudging after Khriss as she writes notes',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [{ book: 'secret-history', chapter: '3-2' }],
    },
    {
      // Nazh on his homeworld Threnody, which is only named in Isles of the Emberdark; dated to the end of that book.
      src: '/portraits/nazrilof-forest.webp',
      alt: 'Nazh sitting on a fallen log in a misty, dead forest, faint blue lights around him and pale ghostly figures among the trees',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: ['isles-of-the-emberdark'],
    },
  ],
  leras: [
    {
      // Cosmere RPG art of Leras as Preservation (his face dissolving into mist). His page and his identity as Preservation are only revealed by Secret History, so dated to its end.
      src: '/portraits/leras-preservation.webp',
      alt: 'Leras, a dark-haired man in a long fur-trimmed coat, floating before a blue stained-glass window, mist streaming from his face',
      artist: 'Nino Vecia',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Nino_Vecia',
      revealedIn: ['secret-history'],
    },
  ],
  alendi: [
    {
      // A plain portrait of the conqueror; safe where his page appears (WoA ch 12). Says nothing about the Hero.
      src: '/portraits/alendi-uniform.webp',
      alt: 'Alendi, a grey-haired young man in a green and gold military uniform, holding a sword upright',
      artist: 'Hinumay',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Hinumay',
      revealedIn: [{ book: 'well-of-ascension', chapter: '12' }],
    },
    {
      // Rashek betraying Alendi at the Well of Ascension; that and the Well itself are late-WoA revelations, so dated to the end of WoA.
      src: '/portraits/alendi-at-the-well.webp',
      alt: 'Alendi, old and weary in furs, kneeling by a glowing light in the snow as a shadowed figure behind him raises a knife',
      artist: 'Hinumay',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Hinumay',
      revealedIn: ['well-of-ascension'],
    },
  ],
  camon: [
    {
      // Just Camon as he is in FE ch 1.
      src: '/portraits/camon.webp',
      alt: 'Camon, a heavy, scowling man with slicked-back hair in a vest',
      artist: 'Egilde Art',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Egilde_Art',
      revealedIn: [{ book: 'final-empire', chapter: '1' }],
    },
  ],
  gemmel: [
    {
      // Cosmere RPG Mistborn Handbook art. The mistcloak implies an Allomancer; FE ch 8 says he trained Kelsier by pushing him off a wall. His being Mistborn is spelled out only in The Eleventh Metal, which also counts.
      src: '/portraits/gemmel-mistcloak.webp',
      alt: 'Gemmel, a wild-haired, white-bearded old man in a tasseled mistcloak, pointing up on a misty city street',
      artist: 'Nele Klumpe',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Nele_Klumpe',
      revealedIn: [{ book: 'final-empire', chapter: '8' }, 'eleventh-metal'],
    },
    {
      // Official interior art for The Eleventh Metal (Kelsier and Gemmel on the rooftops of Mantiz); dated to that story.
      src: '/portraits/gemmel-rooftops.webp',
      alt: 'Gemmel, wild-haired and wrapped in fluttering cloak tassels, on a rooftop with a young Kelsier at night',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: ['eleventh-metal'],
    },
  ],
  human: [
    {
      // Just Human as a koloss, as he is when Vin and Elend meet him in HoA ch 8. No spikes or later events.
      src: '/portraits/human-koloss.webp',
      alt: 'Human, a huge blue-skinned koloss with red eyes, wearing crossed ropes',
      artist: 'zelloss',
      artistUrl: 'https://coppermind.net/wiki/File:Human_Koloss.jpg',
      revealedIn: [{ book: 'hero-of-ages', chapter: '8' }],
    },
    {
      // Cosmere RPG art of Vin dominating Human with Allomancy; she Pushes him to learn how koloss are made in HoA ch 37.
      src: '/portraits/human-and-vin.webp',
      alt: 'Vin facing Human, a huge blue koloss kneeling by a giant sword, under a stormy orange sky',
      artist: 'Satoshi Kamanaka',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Satoshi_Kamanaka',
      revealedIn: [{ book: 'hero-of-ages', chapter: '37' }],
    },
  ],
  noorden: [
    {
      // Former obligator with his eye tattoos, as he is when he appears in WoA ch 34.
      src: '/portraits/noorden.webp',
      alt: 'Noorden, a bald, round-faced man with spectacles and swirling tattoos around his eyes',
      artist: 'Anna Korabelnikova',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Anna_Korabelnikova',
      revealedIn: [{ book: 'well-of-ascension', chapter: '34' }],
    },
  ],
  riina: [
    {
      // Official Tress interior art (cropped from the battle with Hoid): her as the Sorceress using AonDor. Both are revealed at Tress ch 64, where her page appears. Secret History readers see no art.
      src: '/portraits/riina-sorceress.webp',
      alt: 'Riina, a blond woman in a pale gown, drawing glowing symbols in the air in a library',
      artist: 'Howard Lyon',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Howard_Lyon',
      revealedIn: [{ book: 'tress', chapter: '64' }],
    },
  ],
  'teven-renoux': [
    {
      // Mistborn: House War board game art of Lord Renoux as the nobleman Vin sees in FE ch 13. Shows nothing of the kandra impostor.
      src: '/portraits/teven-renoux-house-war.webp',
      alt: 'Lord Renoux, a grey-haired nobleman with a monocle in a green coat, hand on his chest, on a grand staircase',
      artist: 'Mistborn: House War (Crafty Games)',
      artistUrl: 'https://coppermind.net/wiki/File:House_War_-_Lord_Renoux.jpg',
      revealedIn: [{ book: 'final-empire', chapter: '13' }],
    },
  ],
  'themos-tresting': [
    {
      // The opening scene of FE's prologue on Tresting's plantation.
      src: '/portraits/themos-tresting-ashfall.webp',
      alt: 'Lord Tresting on a balcony under red parasols with obligators, pointing out over skaa working in the ashfall',
      artist: 'Francis Goeltner',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Francis_Goeltner',
      revealedIn: [{ book: 'final-empire', chapter: 'prologue' }],
    },
  ],
  rlain: [
    {
      // Shown once he gives his own name in WoR 52.
      src: '/portraits/rlain-dullform.webp',
      alt: 'A listener with marbled skin in a ragged leather vest and trousers, standing barefoot',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '52' }],
    },
    {
      // Warform and Bridge Four uniform, from his Oathbringer scenes with the crew.
      src: '/portraits/rlain-warform.webp',
      alt: 'Rlain in warform, with orange carapace, in a blue Bridge Four uniform, holding a spear',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '37' }] },
      ],
    },
  ],
  stormfather: [
    {
      // The face in the storm, as Kaladin sees it in WoR 74.
      src: '/portraits/stormfather.webp',
      alt: 'A vast face formed from storm clouds, looking out of the dark',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'words-of-radiance', chapter: '74' }],
    },
  ],
  lopen: [
    {
      // One arm and a bridgeman's vest: Bridge Four in WoK.
      src: '/portraits/lopen-vest.webp',
      alt: "The Lopen, a grinning one-armed Herdazian in a bridgeman's vest",
      artist: 'Nat Rodgers',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Nat_Rodgers',
      revealedIn: [{ book: 'way-of-kings', chapter: '32' }],
    },
    {
      // Blue uniform, from Bridge Four's first WoR chapter.
      src: '/portraits/lopen-bridge-four.webp',
      alt: 'The Lopen laughing, in a blue Bridge Four uniform coat',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
  ],
  lunamor: [
    {
      // As a bridgeman in WoK.
      src: '/portraits/lunamor-vest.webp',
      alt: 'Rock, a big red-bearded Horneater, smiling, in a brown vest',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: [{ book: 'way-of-kings', chapter: '17' }],
    },
    {
      // Official Stormlight playing card (Brotherwise); blue uniform from WoR 2.
      src: '/portraits/lunamor-card.webp',
      alt: 'Playing card: Rock in a blue uniform stirring a big pot of stew',
      artist: 'Rebecca Sorge Jensen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Rebecca_Sorge_Jensen',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
  ],
  skar: [
    {
      // Bridge Four tattoo and uniform, from WoR 2.
      src: '/portraits/skar.webp',
      alt: 'Skar, with a shash-glyph tattoo on his forehead, in a blue Bridge Four uniform',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
  ],
  drehy: [
    {
      // Bridge Four tattoo and uniform; he is first in the WoR summaries at chapter 12.
      src: '/portraits/drehy.webp',
      alt: 'Drehy, fair-haired with a forehead tattoo, in a blue Bridge Four uniform',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '12' }] },
      ],
    },
  ],
  leyten: [
    {
      // Blue Bridge Four uniform, from WoR 2.
      src: '/portraits/leyten.webp',
      alt: 'Leyten, curly-haired and frowning, in a blue uniform coat',
      artist: 'Jamie Knierim',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jamie_Knierim',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
  ],
  peet: [
    {
      // Bridge Four tattoo and uniform, from WoR 2.
      src: '/portraits/peet.webp',
      alt: 'Peet, with a forehead tattoo, in a blue uniform, holding a mug',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
  ],
  hobber: [
    {
      // Bridge Four tattoo and uniform, from WoR 2.
      src: '/portraits/hobber.webp',
      alt: 'Hobber, smiling gap-toothed, with a forehead tattoo and blue uniform',
      artist: 'LittleGreyDragon',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/LittleGreyDragon',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '2' }] },
      ],
    },
  ],
  dabbid: [
    {
      // Plain portrait; dated to his Bridge Four scenes in WoK.
      src: '/portraits/dabbid.webp',
      alt: 'Dabbid, a young man with tousled brown hair, smiling faintly',
      artist: 'ShiroXIX',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/ShiroXIX',
      revealedIn: [{ book: 'way-of-kings', chapter: '32' }],
    },
  ],
  gaz: [
    {
      // Eyepatch and Sadeas green, as Kaladin meets him in WoK 6.
      src: '/portraits/gaz.webp',
      alt: 'Gaz, a scruffy one-eyed bridge sergeant with an eyepatch, in a green coat',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '6' }],
    },
  ],
  lirin: [
    {
      // The surgeon of Hearthstone from Kaladin's flashbacks in WoK.
      src: '/portraits/lirin.webp',
      alt: 'Lirin, a bald surgeon with spectacles in an apron, in a town street',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'way-of-kings', chapter: '10' }],
    },
  ],
  hesina: [
    {
      // From Kaladin's flashbacks in WoK.
      src: '/portraits/hesina.webp',
      alt: 'Hesina, smiling, with her hair tied up under a headscarf',
      artist: 'Jamie Knierim',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jamie_Knierim',
      revealedIn: [{ book: 'way-of-kings', chapter: '25' }],
    },
  ],
  gallant: [
    {
      // Dalinar's Ryshadium, as in WoK.
      src: '/portraits/gallant.webp',
      alt: 'A black Ryshadium horse trotting in the rain on a stony plain',
      artist: 'Bonnie Johnson',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Bonnie_Johnson',
      revealedIn: [{ book: 'way-of-kings', chapter: '56' }],
    },
  ],
  'torol-sadeas': [
    {
      // Portrait in his house green; he is first seen in WoK.
      src: '/portraits/torol-sadeas.webp',
      alt: 'Sadeas, a long-haired lighteyes in a green and gold coat with a white cravat',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'way-of-kings', chapter: '6' }],
    },
    {
      // Official Call to Adventure game art; his red Plate is from WoK.
      src: '/portraits/torol-sadeas-plate.webp',
      alt: 'Sadeas in red Shardplate, on horseback before an army',
      artist: 'Artur Felipe Mósca',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Artur_Felipe_M%C3%B3sca',
      revealedIn: ['way-of-kings'],
    },
  ],
  'elhokar-kholin': [
    {
      // The king, as first seen at the hunt in WoK 12.
      src: '/portraits/elhokar-kholin.webp',
      alt: 'Elhokar, wearing a golden crown and a blue cloak',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'way-of-kings', chapter: '12' }],
    },
    {
      // Official WoR interior art; his Plate and Blade are already known from WoK.
      src: '/portraits/elhokar-kholin-plate.webp',
      alt: 'Sketch of Elhokar in full Shardplate, leaning on his Shardblade',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [
        { all: ['way-of-kings', { book: 'words-of-radiance', chapter: '1' }] },
      ],
    },
  ],
  aladar: [
    {
      // Plain portrait from his WoK scenes.
      src: '/portraits/aladar.webp',
      alt: 'Aladar, a bald highprince with a goatee, arms crossed, in a green uniform and cloak',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '26' }],
    },
  ],
  'ialai-sadeas': [
    {
      // Plain portrait; she first appears in person in WoR.
      src: '/portraits/ialai-sadeas.webp',
      alt: 'Ialai, in a green havah, holding a fan',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '5' }],
    },
  ],
  'meridas-amaram': [
    {
      // Plain portrait, as the brightlord of WoK's first chapter.
      src: '/portraits/meridas-amaram.webp',
      alt: 'Amaram, a stern dark-haired officer in a green coat with gold epaulettes',
      artist: 'botanicaxu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/botanicaxu',
      revealedIn: [{ book: 'way-of-kings', chapter: '1' }],
    },
    {
      // Holding the Shardblade he takes in WoK 51.
      src: '/portraits/meridas-amaram-blade.webp',
      alt: 'Amaram, in a green and red coat, holding a Shardblade',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '51' }],
    },
  ],
  taravangian: [
    {
      // Plain portrait of the old king.
      src: '/portraits/taravangian.webp',
      alt: 'Taravangian, an old man with white hair and beard in orange robes, holding a book',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '5' }],
    },
  ],
  'gavilar-kholin': [
    {
      // Official art of Gavilar in Plate, as in the WoK prologue.
      src: '/portraits/gavilar-kholin.webp',
      alt: 'Sketch of a Shardbearer in full Plate beside a great Shardblade',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [{ book: 'way-of-kings', chapter: 'prologue' }],
    },
  ],
  'rysn-ftori': [
    {
      // As the trader's apprentice of WoK i-4.
      src: '/portraits/rysn-ftori.webp',
      alt: 'Rysn, a young Thaylen woman in a green skirt and orange vest, holding a small plant',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: 'i-4' }],
    },
    {
      // Official Dawnshard interior art; dated to when the Wandersail sets out.
      src: '/portraits/rysn-ftori-wandersail.webp',
      alt: 'Sketch of Rysn in her chair on the deck of a ship, a small winged creature by her',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [{ book: 'dawnshard', chapter: '5' }],
    },
  ],
  vathah: [
    {
      // From his WoR deserters scenes.
      src: '/portraits/vathah.webp',
      alt: 'Vathah, a scarred, bearded man in a long brown coat',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '20' }],
    },
  ],
  mraize: [
    {
      // Official art of Mraize; he first meets Shallan in WoR.
      src: '/portraits/mraize.webp',
      alt: 'A man in white lounging in a chair by a fire, a bird perched above him',
      artist: 'Soph Peralta',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Soph_Peralta',
      revealedIn: [{ book: 'words-of-radiance', chapter: '43' }],
    },
  ],
  'turinad-sebarial': [
    {
      // Plain portrait from his WoR scenes.
      src: '/portraits/turinad-sebarial.webp',
      alt: 'Sebarial, a stout bearded man in yellow and gold, arms spread',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '38' }],
    },
  ],
  yanagawn: [
    {
      // In the Prime's robes he gains in WoR i-9.
      src: '/portraits/yanagawn.webp',
      alt: 'Gawx, a young Azish boy in patterned robes and tall hat',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-9' }],
    },
  ],
  eshonai: [
    {
      // Official playing card; her Plate and Blade are shown from her first interlude.
      src: '/portraits/eshonai.webp',
      alt: 'Playing card: a listener Shardbearer in Plate holding a Shardblade',
      artist: 'Rebecca Sorge Jensen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Rebecca_Sorge_Jensen',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-1' }],
    },
  ],
  talenel: [
    {
      // The madman with a Shardblade, who names himself in WoR i-7.
      src: '/portraits/talenel.webp',
      alt: 'A ragged, bearded man with dark skin holding a Shardblade',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-7' }],
    },
  ],
  nale: [
    {
      // Shown once Szeth learns who he is in WoR 88.
      src: '/portraits/nale.webp',
      alt: 'Nale, a dark-skinned man in a dark uniform with silver embroidery',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'words-of-radiance', chapter: '88' }],
    },
  ],
  nightblood: [
    {
      // Official playing card; the plain black sword, shown once the reader can know it.
      src: '/portraits/nightblood.webp',
      alt: 'Playing card: a black sword in its sheath, with dark smoke curling around it',
      artist: 'Rebecca Sorge Jensen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Rebecca_Sorge_Jensen',
      revealedIn: [
        { book: 'warbreaker', chapter: 'prologue' },
        { book: 'edgedancer', chapter: '9' },
        { book: 'oathbringer', chapter: '90' },
      ],
    },
  ],
  wyndle: [
    {
      // As in Edgedancer.
      src: '/portraits/wyndle.webp',
      alt: 'Wyndle, a vine spren with a face of leaves and crystals',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'edgedancer', chapter: '1' }],
    },
  ],
  lyn: [
    {
      // A scout in Kholin blue, from her first appearance.
      src: '/portraits/lyn.webp',
      alt: 'Lyn, a woman with a dark ponytail in a blue Kholin uniform',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'words-of-radiance', chapter: '81' }],
    },
    {
      // Training with Bridge Four from OB 35; dated to OB 46.
      src: '/portraits/lyn-bridge-four.webp',
      alt: 'Lyn in a blue Bridge Four uniform, holding a staff, on a rocky slope',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [
        { all: ['words-of-radiance', { book: 'oathbringer', chapter: '46' }] },
      ],
    },
  ],
  ishnah: [
    {
      // From Shallan's Oathbringer scenes.
      src: '/portraits/ishnah.webp',
      alt: 'Ishnah, with a high black bun, in a green havah',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'oathbringer', chapter: '25' }],
    },
  ],
  'fen-rnamdi': [
    {
      // The Thaylen queen, as in Oathbringer.
      src: '/portraits/fen-rnamdi.webp',
      alt: 'Queen Fen, grey-haired, in a blue dress with jewelry',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'oathbringer', chapter: '28' }],
    },
  ],
  cord: [
    {
      // Plain portrait from her Oathbringer scenes.
      src: '/portraits/cord.webp',
      alt: 'Cord, a tall Horneater woman with a long braid, flexing an arm',
      artist: 'FelCandy',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/FelCandy',
      revealedIn: [{ book: 'oathbringer', chapter: '37' }],
    },
  ],
  rushu: [
    {
      // Plain portrait; she first appears in WoR.
      src: '/portraits/rushu.webp',
      alt: 'Rushu, a young bald ardent in grey robes, taking notes',
      artist: 'Treefin',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Treefin',
      revealedIn: [{ book: 'words-of-radiance', chapter: '4' }],
    },
  ],
  'gavinor-kholin': [
    {
      // Plain portrait from Oathbringer.
      src: '/portraits/gavinor-kholin.webp',
      alt: 'Gavinor, a small boy in a blue uniform jacket',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'oathbringer', chapter: '84' }],
    },
  ],
  ivory: [
    {
      // Plain portrait of the spren, as in Oathbringer.
      src: '/portraits/ivory.webp',
      alt: 'Ivory, a spren of ink-black skin, standing in a dark coat',
      artist: 'Jove',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jove',
      revealedIn: [{ book: 'oathbringer', chapter: '47' }],
    },
  ],
  timbre: [
    {
      // Timbre as she is named in OB i-11.
      src: '/portraits/timbre.webp',
      alt: 'Venli in a pale form, holding a glowing spren in her cupped hands',
      artist: 'Stivya',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Stivya',
      revealedIn: [{ book: 'oathbringer', chapter: 'i-11' }],
    },
  ],
  leshwi: [
    {
      // A Heavenly One, as in Oathbringer.
      src: '/portraits/leshwi.webp',
      alt: 'Leshwi, a Fused in flowing robes, holding a spear in the sky',
      artist: 'Connor Chamberlain',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
      revealedIn: [{ book: 'oathbringer', chapter: '54' }],
    },
  ],
  mayalaran: [
    {
      // Deadeye Maya, as in Oathbringer.
      src: '/portraits/mayalaran.webp',
      alt: 'A spren with a green, dimly lit face and scratched-out eyes, in a coat',
      artist: 'Nozomi',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Nozomi',
      revealedIn: [{ book: 'oathbringer', chapter: '93' }],
    },
  ],
  glys: [
    {
      // Red marks the spren as Odium's, shown at OB 116.
      src: '/portraits/glys.webp',
      alt: 'A cluster of red crystals glowing on a dark ground',
      artist: 'Bonnie Johnson',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Bonnie_Johnson',
      revealedIn: [{ book: 'oathbringer', chapter: '116' }],
    },
  ],
  notum: [
    {
      // Official sketch of Notum as in RoW.
      src: '/portraits/notum.webp',
      alt: 'Sketch of Notum, an honorspren of white light with a beard and a high collar',
      artist: 'Ben McSweeney',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '30' }],
    },
  ],
  raboniel: [
    {
      // Official Stormlight: War for Roshar game art.
      src: '/portraits/raboniel.webp',
      alt: 'Raboniel, a Fused with red carapace and long auburn hair, in white wraps',
      artist: 'Guilherme Castro',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Guilherme_Castro',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '14' }],
    },
  ],
  jaxlim: [
    {
      // Shown from when she is named in RoW 45.
      src: '/portraits/jaxlim.webp',
      alt: 'Jaxlim, an old listener, seated on a stone by a hut, weaving',
      artist: 'rspixart',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/rspixart',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '45' }],
    },
  ],
  kalak: [
    {
      // Official Herald endpaper art; the prelude names him.
      src: '/portraits/kalak.webp',
      alt: 'Kalak, a Herald in dark ornate armour, crystals and purple light around him',
      artist: 'Magali Villeneuve',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Magali_Villeneuve',
      revealedIn: [{ book: 'way-of-kings', chapter: 'prelude' }],
    },
  ],
  jezrien: [
    {
      // Official Herald endpaper art; the prelude names him.
      src: '/portraits/jezrien.webp',
      alt: 'Jezrien, a crowned Herald in gold under a stormy sky, a sword in his hand',
      artist: 'Howard Lyon',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Howard_Lyon',
      revealedIn: [{ book: 'way-of-kings', chapter: 'prelude' }],
    },
  ],
  shalash: [
    {
      // Official Herald endpaper art; shows nothing of her later life.
      src: '/portraits/shalash.webp',
      alt: 'Shalash, a Herald in a white gown, holding up a glowing stone',
      artist: 'Dan dos Santos',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Dan_dos_Santos',
      revealedIn: [{ book: 'oathbringer', chapter: 'prologue' }],
    },
  ],
  ishar: [
    {
      // Official Herald endpaper art; the worshippers suggest his later role, so shown from his page reveal in RoW 111.
      src: '/portraits/ishar.webp',
      alt: 'Ishar, a robed Herald with arms raised beneath a great blue moon, hooded figures before him',
      artist: 'Dan dos Santos',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Dan_dos_Santos',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '111' }],
    },
  ],
  'may-aladar': [
    {
      // Archer and scribe in Azimir: Adolin gives her the archers in WaT 39.
      src: '/portraits/may-aladar.webp',
      alt: 'May Aladar, with a bow and quiver, writing in a ledger before city soldiers',
      artist: 'cosmere play',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/cosmere_play',
      revealedIn: [{ book: 'wind-and-truth', chapter: '39' }],
    },
  ],
  lezian: [
    {
      // Shown once he is named, RoW 14.
      src: '/portraits/lezian-pursuer.webp',
      alt: 'A Fused warrior in a long, billowing dark cloak',
      artist: 'Gerard Segura',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Gerard_Segura',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '14' }],
    },
  ],
  iyatil: [
    {
      // Masked as she is described when she gives her name, WoR 63.
      src: '/portraits/iyatil-masked.webp',
      alt: 'A small woman wearing a carved mask',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '63' }],
    },
  ],
  palona: [
    {
      // Plain portrait from her first appearance, WoR 40.
      src: '/portraits/palona-portrait.webp',
      alt: 'A Herdazian woman with a confident smile',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '40' }],
    },
  ],
  rua: [
    {
      // His look (including the extra arms) is shown in OB 121.
      src: '/portraits/rua-glowing.webp',
      alt: 'A glowing, boyish spren with extra arms',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'oathbringer', chapter: '121' }],
    },
  ],
  dieno: [
    {
      // Plain portrait from his first appearance, RoW 1.
      src: '/portraits/dieno-portrait.webp',
      alt: 'A small, sharp-eyed Herdazian man',
      artist: 'triflingshadows',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/triflingshadows',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '1' }],
    },
  ],
  'chiri-chiri': [
    {
      // Small and sleeping, as she is when named in OB i-13.
      src: '/portraits/chiri-chiri-sleeping.webp',
      alt: 'A small winged creature curled up asleep beside spheres',
      artist: 'Casta',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Casta',
      revealedIn: [{ book: 'oathbringer', chapter: 'i-13' }],
    },
    {
      // Larger than in Oathbringer; dated to her Dawnshard growth (end of Dawnshard).
      src: '/portraits/chiri-chiri-grown.webp',
      alt: 'A larger, flying Chiri-Chiri',
      artist: 'Jennifer Mellen',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Jennifer_Mellen',
      revealedIn: ['dawnshard'],
    },
  ],
  'evi-kholin': [
    {
      // Plain portrait; she is first seen in the OB 16 flashback.
      src: '/portraits/evi-kholin-portrait.webp',
      alt: 'A pale-haired woman in a golden dress',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'oathbringer', chapter: '16' }],
    },
  ],
  'ba-ado-mishram': [
    {
      // Her look is shown in Rhythm of War; dated to the end of that book.
      src: '/portraits/ba-ado-mishram-spren.webp',
      alt: 'A vast, shadowy spren',
      artist: 'Anya',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Anya',
      revealedIn: ['rhythm-of-war'],
    },
    {
      // Official interior art from Wind and Truth; dated to the end of that book.
      src: '/portraits/ba-ado-mishram-mythica.webp',
      alt: 'An illustrated page about Ba-Ado-Mishram',
      artist: 'Miranda Meeks',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Miranda_Meeks',
      revealedIn: ['wind-and-truth'],
    },
  ],
  'balat-davar': [
    {
      // Plain portrait from his first appearance, WoK i-2.
      src: '/portraits/balat-davar-portrait.webp',
      alt: 'A young Veden man with red-flecked hair',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: 'i-2' }],
    },
  ],
  'wikim-davar': [
    {
      // Plain portrait from his first appearance, WoK i-2.
      src: '/portraits/wikim-davar-portrait.webp',
      alt: 'A thin young Veden man with red-flecked hair',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: 'i-2' }],
    },
  ],
  'jushu-davar': [
    {
      // Plain portrait from his first appearance, WoK 29.
      src: '/portraits/jushu-davar-portrait.webp',
      alt: 'A plump young Veden man with red-flecked hair',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '29' }],
    },
  ],
  'lin-davar': [
    {
      // Plain portrait; he is first seen in the WoR 10 flashback.
      src: '/portraits/lin-davar-portrait.webp',
      alt: 'A stern, red-bearded Veden lighteyes',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'words-of-radiance', chapter: '10' }],
    },
  ],
  'toralin-roshone': [
    {
      // Plain portrait from his WoK 25 introduction.
      src: '/portraits/toralin-roshone-portrait.webp',
      alt: 'A heavyset lighteyed man in fine clothes',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '25' }],
    },
  ],
  'laral-roshone': [
    {
      // Child sketch from her first appearance, WoK 16.
      src: '/portraits/laral-roshone-child.webp',
      alt: 'Laral as a girl',
      artist: 'Sheep',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Sheep',
      revealedIn: [{ book: 'way-of-kings', chapter: '16' }],
    },
    {
      // Adult look, from her Oathbringer reappearance (OB 7).
      src: '/portraits/laral-roshone-adult.webp',
      alt: 'Laral as a grown woman',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [
        { all: ['way-of-kings', { book: 'oathbringer', chapter: '7' }] },
      ],
    },
  ],
  'sja-anat': [
    {
      // Her mirror appearance, OB 84.
      src: '/portraits/sja-anat-mirror.webp',
      alt: 'A woman’s face in a mirror',
      artist: 'Anya',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Anya',
      revealedIn: [{ book: 'oathbringer', chapter: '84' }],
    },
    {
      // Official Oathbringer interior page; its text goes further, so dated to the end of the book.
      src: '/portraits/sja-anat-taker-of-secrets.webp',
      alt: 'An illustrated page about Sja-anat',
      artist: 'Miranda Meeks',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Miranda_Meeks',
      revealedIn: ['oathbringer'],
    },
  ],
  chanarach: [
    {
      // Plain portrait from where she is first named, WoR 59.
      src: '/portraits/chanarach-portrait.webp',
      alt: 'A dark-haired woman',
      artist: 'Caio Santos',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Caio_Santos',
      revealedIn: [{ book: 'words-of-radiance', chapter: '59' }],
    },
    {
      // Official Rhythm of War endsheet; nothing past the start of that book is shown.
      src: '/portraits/chanarach-endsheet.webp',
      alt: 'Official Herald portrait of Chanarach',
      artist: 'Karla Ortiz',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Karla_Ortiz',
      revealedIn: [
        {
          all: ['oathbringer', { book: 'rhythm-of-war', chapter: 'prologue' }],
        },
      ],
    },
  ],
  tien: [
    {
      // His childhood, shown in the WoK 9 flashback.
      src: '/portraits/tien-rocks.webp',
      alt: 'A smiling boy collecting rocks',
      artist: 'Elisgardor',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Elisgardor',
      revealedIn: [{ book: 'way-of-kings', chapter: '9' }],
    },
  ],
  tumi: [
    {
      // His fuller look is not described before Wind and Truth; dated to its end.
      src: '/portraits/tumi-portrait.webp',
      alt: 'A humanoid spren',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: ['wind-and-truth'],
    },
  ],
  oroden: [
    {
      // Tagged to OB 7, where Kaladin first meets him.
      src: '/portraits/oroden-child-of-peace.webp',
      alt: 'A toddler with Kaladin',
      artist: 'Vladora',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Vladora',
      revealedIn: [{ book: 'oathbringer', chapter: '7' }],
    },
  ],
  malata: [
    {
      // Plain portrait from her first appearance, OB 24.
      src: '/portraits/malata-portrait.webp',
      alt: 'A confident Alethi woman',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'oathbringer', chapter: '24' }],
    },
  ],
  khen: [
    {
      // Crop of a group portrait, as she appears in OB 14.
      src: '/portraits/khen-portrait.webp',
      alt: 'A parshwoman holding a club',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'oathbringer', chapter: '14' }],
    },
  ],
  sah: [
    {
      // Crop of a group portrait with his daughter, as in OB 14.
      src: '/portraits/sah-with-daughter.webp',
      alt: 'A bearded parshman beside a small girl',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'oathbringer', chapter: '14' }],
    },
  ],
  tyn: [
    {
      // Plain portrait from her first appearance, WoR 20.
      src: '/portraits/tyn-portrait.webp',
      alt: 'A confident woman in a coat',
      artist: 'Sheep',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Sheep',
      revealedIn: [{ book: 'words-of-radiance', chapter: '20' }],
    },
  ],
  uapam: [
    {
      // Tagged Rhythm of War; first met RoW 22.
      src: '/portraits/uapam-portrait.webp',
      alt: 'A peakspren',
      artist: 'FelCandy',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/FelCandy',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '22' }],
    },
  ],
  'zu-roshar': [
    {
      // Both are met together, RoW 22.
      src: '/portraits/zu-roshar-with-uapam.webp',
      alt: 'Zu with a peakspren companion',
      artist: 'Jessica Liu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jessica_Liu',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '22' }],
    },
  ],
  nohadon: [
    {
      // He is seen in the WoK 60 vision.
      src: '/portraits/nohadon-concept.webp',
      alt: 'Concept sketches of a king in long golden robes',
      artist: 'botanicaxu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/botanicaxu',
      revealedIn: [{ book: 'way-of-kings', chapter: '60' }],
    },
  ],
  nergaoul: [
    {
      // Dalinar confronting it, OB 120.
      src: '/portraits/nergaoul-thrill.webp',
      alt: 'A vast red mist with Dalinar facing it',
      artist: 'Ashley Coad',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
      revealedIn: [{ book: 'oathbringer', chapter: '120' }],
    },
  ],
  phendorana: [
    {
      // Honorspren look; plain clothing as described after her bond (dated with her RoW sightings).
      src: '/portraits/phendorana-portrait.webp',
      alt: 'A glowing honorspren woman with flowing hair',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '25' }],
    },
  ],
  teleb: [
    {
      // His braid and archery are described in OB 3.
      src: '/portraits/teleb-archer.webp',
      alt: 'A long-haired man with a braid, holding a bow',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'oathbringer', chapter: '3' }],
    },
  ],
  kadash: [
    {
      // Plain portrait from his first appearance, WoK 18.
      src: '/portraits/kadash-ardent.webp',
      alt: 'A tall, shaven-headed ardent in grey robes',
      artist: 'botanicaxu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/botanicaxu',
      revealedIn: [{ book: 'way-of-kings', chapter: '18' }],
    },
  ],
  nikliasorm: [
    {
      // Shows its true nature; dated to the end of Dawnshard.
      src: '/portraits/nikliasorm-portrait.webp',
      alt: 'Nikli, looking almost human',
      artist: 'Shuravf',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Shuravf',
      revealedIn: ['dawnshard'],
    },
  ],
  bisig: [
    {
      // Blue Kholin uniform, as in WoR 22.
      src: '/portraits/bisig-portrait.webp',
      alt: 'A bridgeman in a blue uniform',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: '22' }],
    },
  ],
  adrotagia: [
    {
      // Plain portrait from her first appearance, WoR i-14.
      src: '/portraits/adrotagia-portrait.webp',
      alt: 'An elderly woman in orange robes',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-14' }],
    },
  ],
  roion: [
    {
      // Plain portrait from his first appearance, WoK 22.
      src: '/portraits/roion-portrait.webp',
      alt: 'A bearded Alethi highprince in a red coat',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'way-of-kings', chapter: '22' }],
    },
  ],
  beryl: [
    {
      // Plain portrait from her first appearance, RoW 20.
      src: '/portraits/beryl-portrait.webp',
      alt: 'A smiling woman in a green dress',
      artist: 'Jove',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Jove',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '20' }],
    },
  ],
  'general-khal': [
    {
      // He gains his own Plate and Blade in WoR 66.
      src: '/portraits/general-khal-shardplate.webp',
      alt: 'A bald man in green Shardplate, holding a Shardblade',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'words-of-radiance', chapter: '66' }],
    },
  ],
  'avarak-matal': [
    {
      // Crop of the WoK 43 palanquin scene.
      src: '/portraits/avarak-matal-matal.webp',
      alt: 'An officer in a green uniform',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'way-of-kings', chapter: '43' }],
    },
  ],
  tag: [
    {
      // Plain portrait from his first appearance, WoK 4.
      src: '/portraits/tag-portrait.webp',
      alt: 'A young man in work clothes',
      artist: 'Graeme Brandham',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Graeme_Brandham',
      revealedIn: [{ book: 'way-of-kings', chapter: '4' }],
    },
  ],
  vstim: [
    {
      // In Shinovar, his WoK i-4 scene.
      src: '/portraits/vstim-shinovar.webp',
      alt: 'An old Thaylen merchant with long eyebrows and a conical hat',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'way-of-kings', chapter: 'i-4' }],
    },
  ],
  stargyle: [
    {
      // Plain portrait crop from his first appearance, RoW 20.
      src: '/portraits/stargyle-portrait.webp',
      alt: 'A young man with a topknot',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '20' }],
    },
  ],
  el: [
    {
      // His full look is not set out before Wind and Truth; dated to its end.
      src: '/portraits/el-sketch.webp',
      alt: 'A sketch of a Fused with spiky armour',
      artist: 'Irithyllians',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Irithyllians',
      revealedIn: ['wind-and-truth'],
    },
  ],
  dul: [
    {
      // Their forms are described in RoW 51.
      src: '/portraits/dul-with-mazish.webp',
      alt: 'Two singers with marbled carapace',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '51' }],
    },
  ],
  mazish: [
    {
      // Their forms are described in RoW 51.
      src: '/portraits/mazish-with-dul.webp',
      alt: 'Two singers with marbled carapace',
      artist: 'Dragontrill',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Dragontrill',
      revealedIn: [{ book: 'rhythm-of-war', chapter: '51' }],
    },
  ],
  kabsal: [
    {
      // Plain portrait from his first appearance, WoK 7.
      src: '/portraits/kabsal-portrait.webp',
      alt: 'A shaven-headed young ardent with a square beard',
      artist: 'Exmakina',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Exmakina',
      revealedIn: [{ book: 'way-of-kings', chapter: '7' }],
    },
  ],
  'yelig-nar': [
    {
      // Official Call to Adventure card; the bond it shows is revealed in OB 120.
      src: '/portraits/yelig-nar-servant-of-odium.webp',
      alt: 'A figure in dark armour wreathed in dark power, fighting Kaladin',
      artist: 'Petar Penev',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Petar_Penev',
      revealedIn: [{ book: 'oathbringer', chapter: '120' }],
    },
  ],
  yalb: [
    {
      // Plain portrait from his first appearance, WoK 3.
      src: '/portraits/yalb-bowing.webp',
      alt: 'A young sailor in a headband, bowing',
      artist: 'botanicaxu',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/botanicaxu',
      revealedIn: [{ book: 'way-of-kings', chapter: '3' }],
    },
  ],
  sureblood: [
    {
      // Official Stormlight World Guide art; nothing beyond his WoK 13 introduction.
      src: '/portraits/sureblood-with-adolin.webp',
      alt: 'Adolin riding a great white-and-grey horse',
      artist: 'Christina Kraus',
      artistUrl:
        'https://coppermind.net/wiki/File:SLWG_Ryshadium_by_Christina_Kraus.png',
      revealedIn: [{ book: 'way-of-kings', chapter: '13' }],
    },
  ],
  talik: [
    {
      // As described when he meets Rysn, WoR i-3.
      src: '/portraits/talik-portrait.webp',
      alt: 'A bare-shouldered man with two braids and a fringed wrap',
      artist: 'Laurys L',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Laurys_L',
      revealedIn: [{ book: 'words-of-radiance', chapter: 'i-3' }],
    },
  ],
  rayse: [
    {
      // Official Call to Adventure card; his human form is first seen in OB 56.
      src: '/portraits/rayse-human-form.webp',
      alt: 'An old king in gold robes and crown, holding a sceptre',
      artist: 'AnnDR',
      artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/AnnDR',
      revealedIn: [{ book: 'oathbringer', chapter: '56' }],
    },
  ],
  tanavast: [
    {
      // Shown from his first appearance, WaT 63.
      src: '/portraits/tanavast-portrait.webp',
      alt: 'A white-haired man in a fur-trimmed golden robe',
      artist: 'Marie Seeberger',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
      revealedIn: [{ book: 'wind-and-truth', chapter: '63' }],
    },
    {
      // Official Wind and Truth endsheet; dated to the end of the book to be safe.
      src: '/portraits/tanavast-endsheet.webp',
      alt: 'Official portrait of Tanavast amid swirling light',
      artist: 'Donato Giancola',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Donato_Giancola',
      revealedIn: ['wind-and-truth'],
    },
  ],
}
