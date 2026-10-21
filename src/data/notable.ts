import { prominence } from './prominence'
import type { CanSee } from './reveal'

/** Lists longer than this show only their notable people until asked. */
export const LIST_CAP = 10
/** How many notable people such a list shows. */
export const NOTABLE = 8

/** Chapters a character is in across the books the reader has finished. */
export const weight = (id: string, canSee: CanSee) =>
  Object.entries(prominence[id] ?? {}).reduce(
    (n, [book, chapters]) => n + (canSee([book]) ? chapters : 0),
    0,
  )

/**
 * A long list split into its most prominent people and the rest, each kept in
 * the list's order. Ranked by finished books only, so a character who matters
 * more later isn't singled out early.
 */
export function splitNotable<T extends { characterId: string }>(
  list: readonly T[],
  canSee: CanSee,
): { notable: readonly T[]; rest: readonly T[] } {
  if (list.length <= LIST_CAP) return { notable: list, rest: [] }
  const top = new Set(
    list
      .map((p) => ({ id: p.characterId, w: weight(p.characterId, canSee) }))
      .sort((a, b) => b.w - a.w)
      .slice(0, NOTABLE)
      .map((p) => p.id),
  )
  return {
    notable: list.filter((p) => top.has(p.characterId)),
    rest: list.filter((p) => !top.has(p.characterId)),
  }
}
