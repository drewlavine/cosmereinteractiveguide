import { useMemo } from 'react'
import { assetUrl } from '../../data/assetUrl'
import { bookTimeline } from '../../data/bookTimeline'
import { bookSeries, findBook } from '../../data/books'
import { entryArt } from '../../data/entryArt'
import { revealFigures, type CanSee } from '../../data/reveal'
import { shards } from '../../data/shards'
import { systems } from '../../data/systems'
import type { Planet } from '../../data/types'
import { fold } from '../../routes/listHelpers'
import { useCanSee } from '../../state/reveal'
import type { CardArt, GroupRef, Listed } from './types'

// A group's card shows art that describes the group, never a member's
// portrait. Everything here takes what the reader may see (or only
// publisher-level facts) and returns nothing otherwise: the card then shows
// its symbol, which looks the same whether art is missing or still hidden.

const covers = new Map(bookTimeline.map((b) => [b.id, b]))

/** A book's cover. Titles and covers are publisher-level, never gated. */
function cover(bookId: string, alt: string): CardArt | undefined {
  const span = covers.get(bookId)
  return (
    span && {
      type: 'image',
      src: assetUrl(span.cover),
      alt,
      credit: { text: span.coverArtist, href: span.coverSource },
    }
  )
}

/** A book's cover, for a group that is one book. */
export const bookArt = (group: GroupRef) =>
  cover(group.id, `Cover of ${findBook(group.id)?.title ?? group.name}`)

/** A series, by the cover of its first novel. */
export function seriesArt(group: GroupRef) {
  const series = bookSeries.find((s) => s.id === group.id)
  if (!series || series.id === 'collections') return undefined
  const first =
    series.books.find((b) => b.kind === 'Novel' && covers.has(b.id)) ??
    series.books.find((b) => covers.has(b.id))
  return first && cover(first.id, `Cover art for ${series.name}`)
}

/** The worlds the reader may see, by id. */
export function useVisiblePlanets() {
  const canSee = useCanSee()
  return useMemo(
    () =>
      new Map(
        systems
          .flatMap((s) => s.planets)
          .filter((p) => canSee(p.revealedIn))
          .map((p): [string, Planet] => [p.id, p]),
      ),
    [canSee],
  )
}

/** A world, as its planet is painted on the star charts. */
export const worldArt =
  (planets: ReadonlyMap<string, Planet>) =>
  (group: GroupRef): CardArt | undefined => {
    const planet = planets.get(group.id)
    return planet && { type: 'planet', planet }
  }

/** A Shard's stained-glass portrait, once its timeline entries show. */
export const shardArt =
  (canSee: CanSee) =>
  (group: GroupRef): CardArt | undefined => {
    const shard = shards.find((s) => s.name === group.name)
    if (!shard?.entries.some((e) => canSee(e.revealedIn))) return undefined
    return {
      type: 'image',
      src: shard.art,
      alt: `Stained-glass portrait of ${shard.name}`,
      credit: { text: 'Cam Kuta' },
    }
  }

/**
 * The art of an entry page (`lifeform:x`, `ability:x`, `place:x`) the reader
 * may see: its emblem if it has one, else the latest piece.
 */
export function entryArtOf(key: string, canSee: CanSee): CardArt | undefined {
  const { figures } = revealFigures(entryArt[key], canSee)
  const art = figures.find((f) => f.glyph) ?? figures.at(-1)
  return (
    art && {
      type: 'image',
      src: assetUrl(art.src),
      alt: art.alt,
      credit: { text: art.artist, href: art.artistUrl },
      contain: art.glyph,
    }
  )
}

/** The art of the entry a group is named for, found by name. */
export function namedEntryArt(
  kind: 'lifeform' | 'ability' | 'place',
  named: readonly Listed[],
  canSee: CanSee,
) {
  const idByName = new Map(named.map((e) => [fold(e.name), e.id]))
  return (group: GroupRef) => {
    const id = idByName.get(fold(group.name))
    return id ? entryArtOf(`${kind}:${id}`, canSee) : undefined
  }
}
