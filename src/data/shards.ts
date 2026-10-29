import { assetUrl } from './assetUrl'
import type { CanSee } from './reveal'
import { COSMERE, type ShownTimeline } from './timeline'
import type { ChapterPoint, Reveal } from './types'

/**
 * Where a Shard is and how it fares, from one point on the timeline on:
 * `from` is a timeline event id, so the entry holds from that event until
 * the Shard's next entry the reader can see.
 */
export interface ShardEntry {
  from: string
  /** The planet it's at, to fly to. */
  world: string
  status: string
  /** Who holds it, once the reader may know. */
  /** `id`: the Vessel's character page, for their art, if they have one. */
  vessel?: { name: string; id?: string; wob?: boolean; revealedIn: Reveal }
  /** Splintered, Shattered or its Vessel dead: its art is greyed out. */
  faded?: boolean
  revealedIn: Reveal
}

/**
 * The Shards of Adonalsium for the timeline's Shards drawer.
 * Hand-maintained placeholders: add Shards and entries only where they can
 * be dated and gated safely.
 */
export interface Shard {
  id: string
  name: string
  /** Cam Kuta's stained-glass portrait (Coppermind). */
  art: string
  entries: ShardEntry[]
}

const ch = (book: string, chapter: string): ChapterPoint => ({ book, chapter })
/** As the timeline's "Ruin and Preservation make Scadrial". */
const SCADRIAL_SHARDS = [{ all: ['hero-of-ages', ch('secret-history', '3-2')] }]
/** As "Devotion and Dominion settle on Sel". */
const SEL_SHARDS = [{ all: ['arcanum-unbounded', ch('secret-history', '3-2')] }]
/** As "Odium splinters Devotion and Dominion". */
const SPLINTERED = ['arcanum-unbounded']
/** As "Honor and Cultivation settle on Roshar". */
const ROSHAR_SHARDS = [ch('secret-history', '3-2')]
/** "The Almighty is dead", the end of The Way of Kings. */
const HONOR_DEAD = ['way-of-kings']
const TANAVAST = ch('wind-and-truth', '63')
// No character page. Dated late: unsure where the books first name her.
const KORAVELLIUM = {
  name: 'Koravellium Avast',
  revealedIn: ['wind-and-truth'],
}
const RAYSE = {
  name: 'Rayse',
  id: 'rayse',
  revealedIn: [ch('words-of-radiance', '71')],
}
/** As "Endowment settles on Nalthis". */
const WB = 'warbreaker'
const NALTHIS_SHARD = [{ all: [WB, ch('secret-history', '3-2')] }]
/** As "Autonomy settles on Taldain". */
const TALDAIN_SHARD = [
  { all: ['arcanum-unbounded', ch('secret-history', '3-2')] },
  { all: ['white-sand-omnibus', ch('secret-history', '3-2')] },
]
const BAVADIN = {
  name: 'Bavadin',
  id: 'bavadin',
  revealedIn: [{ all: ['lost-metal', 'wind-and-truth'] }],
}
const HARMONY = ch('hero-of-ages', '82')
const SAZED = { name: 'Sazed', id: 'sazed', revealedIn: [HARMONY] }
const ULI_DA = { id: 'uli-da', revealedIn: [ch('wind-and-truth', '104')] }
/** As Harmony's letters to Hoid (Rhythm of War) leave them. */
const UNSETTLED = 'Whole; where it settled is unknown'
const art = (id: string) => assetUrl(`/shards/${id}.webp`)

export const shards: Shard[] = [
  {
    id: 'preservation',
    name: 'Preservation',
    art: art('preservation'),
    entries: [
      {
        from: 'ruin-preservation-scadrial',
        world: 'scadrial',
        status: 'Settled on Scadrial, with Ruin',
        vessel: { name: 'Leras', id: 'leras', revealedIn: ['secret-history'] },
        revealedIn: SCADRIAL_SHARDS,
      },
      {
        from: 'catacendre',
        world: 'scadrial',
        status: 'Joined with Ruin as Harmony',
        vessel: SAZED,
        revealedIn: [HARMONY],
      },
    ],
  },
  {
    id: 'ruin',
    name: 'Ruin',
    art: art('ruin'),
    entries: [
      {
        from: 'ruin-preservation-scadrial',
        world: 'scadrial',
        status: 'Settled on Scadrial, with Preservation',
        vessel: {
          name: 'Ati',
          id: 'ati',
          revealedIn: [
            ch('secret-history', '4-4'),
            ch('wind-and-truth', '115'),
          ],
        },
        revealedIn: SCADRIAL_SHARDS,
      },
      {
        from: 'catacendre',
        world: 'scadrial',
        status: 'Joined with Preservation as Harmony',
        vessel: SAZED,
        revealedIn: [HARMONY],
      },
    ],
  },
  {
    id: 'devotion',
    name: 'Devotion',
    art: art('devotion'),
    entries: [
      {
        from: 'devotion-dominion-settle',
        world: 'sel',
        status: 'Settled on Sel, with Dominion',
        vessel: { name: 'Aona', id: 'aona', revealedIn: ['wind-and-truth'] },
        revealedIn: SEL_SHARDS,
      },
      {
        from: 'devotion-dominion-splintered',
        world: 'sel',
        status: 'Splintered by Odium',
        vessel: {
          name: 'Aona (dead)',
          id: 'aona',
          revealedIn: ['wind-and-truth'],
        },
        faded: true,
        revealedIn: SPLINTERED,
      },
    ],
  },
  {
    id: 'dominion',
    name: 'Dominion',
    art: art('dominion'),
    entries: [
      {
        from: 'devotion-dominion-settle',
        world: 'sel',
        status: 'Settled on Sel, with Devotion',
        vessel: { name: 'Skai', id: 'skai', revealedIn: ['wind-and-truth'] },
        revealedIn: SEL_SHARDS,
      },
      {
        from: 'devotion-dominion-splintered',
        world: 'sel',
        status: 'Splintered by Odium',
        vessel: {
          name: 'Skai (dead)',
          id: 'skai',
          revealedIn: ['wind-and-truth'],
        },
        faded: true,
        revealedIn: SPLINTERED,
      },
    ],
  },
  {
    id: 'honor',
    name: 'Honor',
    art: art('honor'),
    entries: [
      {
        from: 'honor-cultivation-settle',
        world: 'roshar',
        status: 'Settled on Roshar, with Cultivation',
        vessel: { name: 'Tanavast', id: 'tanavast', revealedIn: [TANAVAST] },
        revealedIn: ROSHAR_SHARDS,
      },
      {
        // ponytail: Honor died around the Recreance (about -825 RY); Reod
        // (-690 RY) is the nearest event after it. Add a Recreance event to
        // date it exactly.
        from: 'reod',
        world: 'roshar',
        status: 'Dead: its Vessel killed by Odium',
        vessel: {
          name: 'Tanavast (dead)',
          id: 'tanavast',
          revealedIn: [TANAVAST],
        },
        faded: true,
        revealedIn: HONOR_DEAD,
      },
    ],
  },
  {
    id: 'cultivation',
    name: 'Cultivation',
    art: art('cultivation'),
    entries: [
      {
        from: 'honor-cultivation-settle',
        world: 'roshar',
        status: 'Settled on Roshar, with Honor',
        vessel: KORAVELLIUM,
        revealedIn: ROSHAR_SHARDS,
      },
      {
        from: 'reod',
        world: 'roshar',
        status: 'On Roshar, Honor dead',
        vessel: KORAVELLIUM,
        revealedIn: HONOR_DEAD,
      },
    ],
  },
  {
    id: 'odium',
    name: 'Odium',
    art: art('odium'),
    entries: [
      {
        from: 'odium-ashyn',
        world: 'ashyn',
        status: 'On Ashyn',
        vessel: RAYSE,
        revealedIn: ['wind-and-truth'],
      },
      {
        from: 'first-desolation',
        world: 'roshar',
        status: 'Bound to Roshar, warring on it through the Desolations',
        vessel: RAYSE,
        revealedIn: ['oathbringer'],
      },
    ],
  },
  {
    id: 'endowment',
    name: 'Endowment',
    art: art('endowment'),
    entries: [
      {
        from: 'endowment-settles',
        world: 'nalthis',
        status: 'Settled on Nalthis',
        vessel: { name: 'Edgli', id: 'edgli', wob: true, revealedIn: [WB] },
        revealedIn: NALTHIS_SHARD,
      },
    ],
  },
  {
    id: 'autonomy',
    name: 'Autonomy',
    art: art('autonomy'),
    entries: [
      {
        from: 'autonomy-settles',
        world: 'taldain',
        status: 'Settled on Taldain',
        vessel: BAVADIN,
        revealedIn: TALDAIN_SHARD,
      },
    ],
  },
  {
    id: 'ambition',
    name: 'Ambition',
    art: art('ambition'),
    entries: [
      {
        from: 'ambition-wounded',
        world: 'threnody',
        status: 'Mortally wounded by Odium near Threnody; it escapes',
        vessel: { name: 'Uli Da', ...ULI_DA },
        revealedIn: ['arcanum-unbounded'],
      },
      {
        // ponytail: when it died is unknown; shown with the wounding.
        from: 'ambition-wounded',
        world: 'threnody',
        status: 'Destroyed after clashing with Odium and Mercy',
        vessel: { name: 'Uli Da (dead)', ...ULI_DA },
        faded: true,
        revealedIn: [ch('rhythm-of-war', '27')],
      },
    ],
  },
  {
    id: 'invention',
    name: 'Invention',
    art: art('invention'),
    entries: [
      {
        from: 'shattering',
        world: COSMERE,
        status: UNSETTLED,
        vessel: {
          name: 'Chan Ko Sar',
          id: 'chan-ko-sar',
          revealedIn: [ch('wind-and-truth', '115')],
        },
        revealedIn: [ch('rhythm-of-war', '24')],
      },
    ],
  },
  {
    id: 'whimsy',
    name: 'Whimsy',
    art: art('whimsy'),
    entries: [
      {
        from: 'shattering',
        world: COSMERE,
        status: UNSETTLED,
        revealedIn: [ch('rhythm-of-war', '25')],
      },
    ],
  },
  {
    id: 'mercy',
    name: 'Mercy',
    art: art('mercy'),
    entries: [
      {
        from: 'shattering',
        world: COSMERE,
        status: UNSETTLED,
        revealedIn: [ch('rhythm-of-war', '25')],
      },
    ],
  },
  {
    id: 'valor',
    name: 'Valor',
    art: art('valor'),
    entries: [
      {
        from: 'shattering',
        world: COSMERE,
        status: UNSETTLED,
        vessel: {
          name: 'Medelantorius',
          id: 'medelantorius',
          revealedIn: [ch('wind-and-truth', '115')],
        },
        revealedIn: [ch('rhythm-of-war', '25')],
      },
    ],
  },
  {
    id: 'virtuosity',
    name: 'Virtuosity',
    art: art('virtuosity'),
    entries: [
      {
        // ponytail: no event dates her Splintering; add one to split this.
        from: 'shattering',
        world: COSMERE,
        status: 'Splinters itself near Komashi, at a time unknown',
        revealedIn: ['yumi'],
      },
    ],
  },
]

export interface ShownShard {
  id: string
  name: string
  art: string
  world: string
  status: string
  vessel?: string
  vesselId?: string
  /** The Vessel is known only from Word of Brandon. */
  vesselWob?: boolean
  faded: boolean
}

/**
 * The Shards as of the timeline's `current` event: each one's latest entry
 * the reader can see at or before it. A Shard with none isn't listed.
 */
export function revealShards(
  timeline: ShownTimeline,
  canSee: CanSee,
  current: number,
  list: readonly Shard[] = shards,
): ShownShard[] {
  const at = (id: string) => timeline.events.findIndex((e) => e.id === id)
  return list.flatMap((s) => {
    const entry = s.entries
      .filter((e) => canSee(e.revealedIn))
      .map((e) => ({ e, i: at(e.from) }))
      .filter(({ i }) => i >= 0 && i <= current)
      .sort((a, b) => a.i - b.i)
      .at(-1)?.e
    if (!entry) return []
    const vessel = entry.vessel && canSee(entry.vessel.revealedIn)
    return [
      {
        id: s.id,
        name: s.name,
        art: s.art,
        world: entry.world,
        status: entry.status,
        ...(vessel && {
          vessel: entry.vessel!.name,
          vesselId: entry.vessel!.id,
          vesselWob: entry.vessel!.wob,
        }),
        faded: !!entry.faded,
      },
    ]
  })
}
