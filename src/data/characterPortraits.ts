import type { Reveal } from './types'

/**
 * Art of a character, shown above their Key facts. Art belongs to its
 * artist: add a portrait only with the artist's (or Dragonsteel's)
 * permission, never copied from the Coppermind, whose images are "only to be
 * used with their permission".
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
}
