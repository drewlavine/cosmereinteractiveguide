import type { CanSee } from './reveal'
import type { EntryAlias, EntryStory, Reveal, RevealPoint } from './types'
import { entryAliases } from './entryAliases'
import { entryReveals } from './entryReveals'

/**
 * Pages for Culture and Abilities entries, adapted from the Coppermind.
 * Generated into cultureStories/ and abilityStories/ by
 * ~/cig-entry-data/entry_emit.py; each file is its own chunk, loaded when its
 * page opens.
 */
export type EntryKind = 'culture' | 'ability'

const files: Record<EntryKind, Record<string, () => Promise<EntryStory>>> = {
  culture: import.meta.glob<EntryStory>('./cultureStories/*.json', {
    import: 'default',
  }),
  ability: import.meta.glob<EntryStory>('./abilityStories/*.json', {
    import: 'default',
  }),
}
const dirs: Record<EntryKind, string> = {
  culture: './cultureStories',
  ability: './abilityStories',
}
const path = (kind: EntryKind, id: string) => `${dirs[kind]}/${id}.json`
const loaded = new Map<string, EntryStory>()

export const hasEntryStory = (kind: EntryKind, id: string) =>
  path(kind, id) in files[kind]

/** The page if it's already loaded; undefined while loading or if none. */
export const cachedEntryStory = (kind: EntryKind, id: string) =>
  loaded.get(path(kind, id))

export async function loadEntryStory(kind: EntryKind, id: string) {
  const load = files[kind][path(kind, id)]
  if (!load) return undefined
  const story = loaded.get(path(kind, id)) ?? (await load())
  loaded.set(path(kind, id), story)
  return story
}

/**
 * When an entry first shows: the chapter its page's earliest intro is dated
 * to, if it has a page, or else the list's own (book-level) date.
 */
export const entryRevealedIn = (
  kind: EntryKind,
  entry: { id: string; revealedIn: Reveal },
): Reveal => entryReveals[kind][entry.id] ?? entry.revealedIn

/**
 * The entry's other names the reader may see (Coinshot for Steel), in the
 * order given; none until the entry itself shows.
 */
export const shownAliases = (
  kind: EntryKind,
  entry: { id: string; revealedIn: Reveal },
  canSee: CanSee,
): EntryAlias[] =>
  canSee(entryRevealedIn(kind, entry))
    ? (entryAliases[kind][entry.id] ?? []).filter((a) => canSee(a.revealedIn))
    : []

/** Books of the points in `reveal` the reader has reached. */
const reachedBooks = (reveal: Reveal, canSee: CanSee) =>
  reveal
    .filter((p) => canSee([p]))
    .flatMap((p: RevealPoint): string[] =>
      typeof p === 'string'
        ? [p]
        : 'all' in p
          ? p.all.map((q) => (typeof q === 'string' ? q : q.book))
          : [p.book],
    )

/**
 * The books an entry's page may list: those read, plus the book the reader
 * is in when the entry is revealed partway through it.
 */
export function entryBooks(
  kind: EntryKind,
  entry: { id: string; revealedIn: Reveal; books: string[] },
  canSee: CanSee,
) {
  return shownBooks(entry.books, entryRevealedIn(kind, entry), canSee)
}

/**
 * Of `books`, those a page revealed by `reveal` may list: the ones read,
 * plus the book the reader is in when it's revealed partway through.
 */
export function shownBooks(books: string[], reveal: Reveal, canSee: CanSee) {
  const reached = new Set(reachedBooks(reveal, canSee))
  return books.filter((b) => canSee([b]) || reached.has(b))
}
