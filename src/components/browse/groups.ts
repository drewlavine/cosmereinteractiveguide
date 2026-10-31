import { hashString } from '../chartTheme'
import type { Category, Group } from './types'

/** Where items that fall under no category go: its card, "Not sorted yet". */
export const UNSORTED = 'unsorted'

/** How many hues a symbol's panel can take (see GroupCard.module.css). */
export const TONES = 8

/**
 * The panel hue of a grouping's `index`th card: neighbours differ, and each
 * grouping starts from a hue of its own. It comes from what is listed only,
 * so a group whose art is hidden looks just like one that has none.
 */
export const toneOf = (grouping: string, index: number) =>
  (hashString(grouping) + index) % TONES

/**
 * Splits items into one group per category they fall under, in the order the
 * categories ask for (then biggest first, if wanted, then by name). Items
 * with no category are returned apart. Items keep the order they came in.
 */
export function buildGroups<T>(
  items: readonly T[],
  categories: (item: T) => readonly Category[],
  biggestFirst = false,
) {
  const byId = new Map<string, Group<T> & { order: number }>()
  const unsorted: T[] = []
  for (const item of items) {
    const cats = categories(item)
    if (cats.length === 0) unsorted.push(item)
    for (const [id, name, order] of cats) {
      const group = byId.get(id) ?? { id, name, order, items: [] }
      // The same category twice must not list the item twice.
      if (group.items.at(-1) !== item) group.items.push(item)
      byId.set(id, group)
    }
  }
  const groups = [...byId.values()].sort(
    (a, b) =>
      a.order - b.order ||
      (biggestFirst ? b.items.length - a.items.length : 0) ||
      a.name.localeCompare(b.name),
  )
  return { groups: groups as Group<T>[], unsorted }
}
