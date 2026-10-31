import { findBook } from './books'
import { findCharacter } from './characters'
import { chapterLabel } from './progress'
import { hasMet, type CanSee } from './reveal'
import { systems } from './systems'
import { calendars, type TimelineText } from './timeline'
import type { Reveal } from './types'

/**
 * The researched chronology: the Cosmere's history at the granularity of
 * the best community timelines, behind the secret `/chronology` page for
 * review. `chronology.json` is emitted by `~/cig-chronology` (see its
 * SCHEMA.md); change the research files there, never the JSON.
 */

/** How much an event matters: `headline` is what a recap (Catch Me Up) keeps. */
export const chronoTiers = ['headline', 'major', 'minor'] as const
export type ChronoTier = (typeof chronoTiers)[number]

/** What sort of event it is, for filters; one each, more in `tags`. */
export const chronoKinds = {
  cosmology: 'Cosmology',
  shard: 'Shards',
  war: 'War',
  politics: 'Politics',
  order: 'Orders & faiths',
  magic: 'Magic & discovery',
  disaster: 'Disaster',
  journey: 'Journeys',
  birth: 'Births',
  death: 'Deaths',
  story: 'Story',
} as const
export type ChronoKind = keyof typeof chronoKinds

export interface ChronoEvent {
  /** Stable, prefixed with its world: what Drew quotes to ask for a change. */
  id: string
  /** Planet id, or "cosmere". */
  world: string
  /** When the reader may know where it happened, if later than the event. */
  worldRevealedIn?: Reveal
  /** Years after the Shattering, on Drew's sheet's shared scale; sorts. */
  year: number
  /** Plausible span on the same scale, when uncertain. */
  range?: [number, number]
  /** Tie-break within a year, lower first. */
  order?: number
  /** The date in the world's own terms, e.g. "1173". */
  local?: string
  certainty: 'exact' | 'derived' | 'estimate'
  /** What the date rests on: a book, Brandon's word, or fan reckoning. */
  basis: 'text' | 'wob' | 'community'
  /** Its name as the reader knows it then; the last visible wins. */
  title: TimelineText[]
  /** Every visible passage, in order. */
  summary: TimelineText[]
  tier: ChronoTier
  kind: ChronoKind
  tags?: string[]
  characters?: string[]
  /** Where it happens on-page, if it does. */
  inBook?: { book: string; chapter?: string }
  /** When the reader may know the event and its date. */
  revealedIn: Reveal
  /** Known only from Words of Brandon. */
  wob?: boolean
  sources: { label: string; url: string }[]
}

export interface ShownChronoEvent extends Pick<
  ChronoEvent,
  | 'id'
  | 'local'
  | 'certainty'
  | 'basis'
  | 'tier'
  | 'kind'
  | 'tags'
  | 'wob'
  | 'sources'
> {
  title: string
  summary: string[]
  world: { id: string; name: string }
  /** Years after the Shattering, once the reader knows of it. */
  year?: number
  range?: [number, number]
  characters: { id: string; name: string }[]
  /** "The Way of Kings, Prologue". */
  inBook?: string
}

const planets = new Map(systems.flatMap((s) => s.planets).map((p) => [p.id, p]))

/** The chronology as the reader may see it, in order; the rest is dropped. */
export function revealChronology(
  events: readonly ChronoEvent[],
  canSee: CanSee,
): ShownChronoEvent[] {
  const yearsKnown = canSee(calendars.shattering.revealedIn)
  const seen = (list: readonly TimelineText[]) =>
    list.filter((x) => canSee(x.revealedIn)).map((x) => x.text)
  return [...events]
    .sort((a, b) => a.year - b.year || (a.order ?? 0) - (b.order ?? 0))
    .flatMap((e) => {
      const title = seen(e.title).at(-1)
      if (!canSee(e.revealedIn) || !title) return []
      const planet = planets.get(e.world)
      const placed =
        planet &&
        canSee(planet.revealedIn) &&
        (!e.worldRevealedIn || canSee(e.worldRevealedIn))
      const location = e.inBook
      const book = location && findBook(location.book)
      const inBook =
        location &&
        book &&
        canSee(
          location.chapter
            ? [{ book: location.book, chapter: location.chapter }]
            : [location.book],
        )
          ? [
              book.title,
              location.chapter && chapterLabel(book.id, location.chapter),
            ]
              .filter(Boolean)
              .join(', ')
          : undefined
      return [
        {
          id: e.id,
          title,
          summary: seen(e.summary),
          world: placed
            ? { id: planet.id, name: planet.name }
            : { id: 'cosmere', name: 'The Cosmere' },
          ...(yearsKnown && { year: e.year, range: e.range }),
          local: e.local,
          certainty: e.certainty,
          basis: e.basis,
          tier: e.tier,
          kind: e.kind,
          tags: e.tags,
          wob: e.wob,
          sources: e.sources,
          characters: (e.characters ?? []).flatMap((id) => {
            const c = findCharacter(id)
            return c && hasMet(id, canSee) ? [{ id, name: c.name }] : []
          }),
          inBook,
        },
      ]
    })
}
