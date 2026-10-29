import type { CanSee } from './reveal'
import type { ShownTimelineEvent } from './timeline'
import type { ChapterPoint, Reveal } from './types'

/**
 * The state of a world, from one point on the timeline on, for the world
 * card: `from` is a timeline event id, so it holds from that event until
 * the world's next entry the reader can see (as Shard entries do).
 * Hand-maintained; never ahead of the event it starts at.
 */
export interface WorldState {
  world: string
  from: string
  /** A short name for the period, the card's heading. */
  label: string
  /** One sentence: how the world stands. */
  text: string
  /** Its start as a noun phrase, for "Since Gavilar's assassination". */
  since?: string
  revealedIn: Reveal
}

const ch = (book: string, chapter: string): ChapterPoint => ({ book, chapter })
const WOK = 'way-of-kings'
const OB = 'oathbringer'
const AU = 'arcanum-unbounded'
const WB = 'warbreaker'
const ELA = 'elantris'
const HOA = 'hero-of-ages'
const SHARDS = ch('secret-history', '3-2')

// Each dated no earlier than its event, and mirroring the event's own
// dated lines in timeline.ts. A state needs an event to start at, so a
// period with none on the timeline (all of Era 2, for now) has none.
export const worldStates: WorldState[] = [
  {
    world: 'roshar',
    from: 'honor-cultivation-settle',
    label: 'Honor and Cultivation',
    text: 'Honor and Cultivation have made their home on Roshar, Investing it equally.',
    since: "Honor and Cultivation's arrival",
    revealedIn: [SHARDS],
  },
  {
    world: 'roshar',
    from: 'humans-arrive',
    label: 'Humans on Roshar',
    text: 'Humans, refugees from another world, have settled on Roshar.',
    since: "the humans' arrival",
    revealedIn: [ch(OB, '111'), AU, 'sunlit-man'],
  },
  {
    world: 'roshar',
    from: 'first-desolation',
    label: 'The Desolations',
    text: 'Again and again, the Desolations nearly end humankind on Roshar.',
    since: 'the first Desolation',
    revealedIn: [WOK],
  },
  {
    world: 'roshar',
    from: 'oathpact-abandoned',
    label: 'After the Heralds',
    text: 'The Heralds have ended the Oathpact, leaving their Honorblades in the stone.',
    since: "the Heralds' departure",
    revealedIn: [ch(WOK, 'prelude')],
  },
  {
    world: 'roshar',
    from: 'gavilar-assassinated',
    label: 'The Vengeance Pact',
    text: "Alethkar's highprinces fight the Parshendi on the Shattered Plains to avenge Gavilar.",
    since: "Gavilar's assassination",
    revealedIn: [ch(WOK, '18')],
  },
  {
    world: 'scadrial',
    from: 'ruin-preservation-scadrial',
    label: 'Ruin and Preservation',
    text: 'Ruin and Preservation have made Scadrial and its people, working together.',
    since: "Scadrial's making",
    revealedIn: [{ all: [HOA, SHARDS] }],
  },
  {
    world: 'scadrial',
    from: 'catacendre',
    label: 'Harmony',
    text: 'Sazed, now Harmony, has restored the dying world and its people.',
    since: "Sazed's Ascension",
    revealedIn: [ch(HOA, '82')],
  },
  {
    world: 'sel',
    from: 'devotion-dominion-settle',
    label: 'Devotion and Dominion',
    text: 'Devotion and Dominion have both made their home on Sel.',
    since: "Devotion and Dominion's arrival",
    revealedIn: [{ all: [AU, SHARDS] }],
  },
  {
    world: 'sel',
    from: 'devotion-dominion-splintered',
    label: 'Splintered',
    text: 'Odium has Splintered both Devotion and Dominion.',
    since: 'their Splintering',
    revealedIn: [AU],
  },
  {
    world: 'sel',
    from: 'reod',
    label: 'After the Reod',
    text: 'Elantris has fallen, and King Iadon, raised by the merchants who backed him, rules Arelon from Kae.',
    since: 'the Reod',
    revealedIn: [ch(ELA, '8')],
  },
  {
    world: 'nalthis',
    from: 'endowment-settles',
    label: 'Endowment',
    text: 'The Shard Endowment has made its home on Nalthis.',
    since: "Endowment's arrival",
    revealedIn: [{ all: [WB, SHARDS] }],
  },
  {
    world: 'nalthis',
    from: 'manywar',
    label: 'After the Manywar',
    text: "Hallandren's God Kings hold Peacegiver's Breath, and the old royal line rules Idris.",
    since: 'the Manywar',
    revealedIn: [ch(WB, '15')],
  },
  {
    world: 'taldain',
    from: 'autonomy-settles',
    label: 'Autonomy',
    text: 'The Shard Autonomy has made its home on Taldain.',
    since: "Autonomy's arrival",
    revealedIn: [
      { all: [AU, SHARDS] },
      { all: ['white-sand-omnibus', SHARDS] },
    ],
  },
]

export interface ShownWorldState {
  label: string
  text: string
  /** The state's `since` phrase. */
  phrase?: string
  /** The earlier event it holds from; none at that event itself. */
  since?: ShownTimelineEvent
  /** Whole years since then, when both dates share a calendar. */
  years?: number
}

/**
 * How a world stands at the timeline's point: its latest state the reader
 * may see. Undefined with none.
 */
export function worldStateAt(
  events: readonly ShownTimelineEvent[],
  canSee: CanSee,
  current: number,
  world: string,
  list: readonly WorldState[] = worldStates,
): ShownWorldState | undefined {
  const now = events[current]
  const state = list
    .filter((s) => s.world === world && canSee(s.revealedIn))
    .map((s) => ({ s, i: events.findIndex((e) => e.id === s.from) }))
    .filter(({ i }) => i >= 0 && i <= current)
    .sort((a, b) => a.i - b.i)
    .at(-1)
  if (!state) return undefined
  const found = events[state.i]
  const since = found === now ? undefined : found
  const a = since && (since.when ?? since.date)
  const b = now && (now.when ?? now.date)
  const years =
    a && b && a.calendar === b.calendar
      ? Math.floor(b.year - a.year)
      : undefined
  return {
    label: state.s.label,
    text: state.s.text,
    phrase: state.s.since,
    since,
    years,
  }
}
