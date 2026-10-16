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
      src: '/portraits/dalinar-kholin-uniform.webp',
      alt: 'Dalinar, grey-templed, in a blue Kholin uniform coat with gold epaulettes',
      artist: 'Guilherme Castro',
      artistUrl:
        'https://coppermind.net/wiki/Coppermind:Artists/Guilherme_Castro',
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
      // Kholin uniform, from WoR; no bridgeman-era art suitable.
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
}
