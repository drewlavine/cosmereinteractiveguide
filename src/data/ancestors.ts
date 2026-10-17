/**
 * Walks `parentId` up from a place, outermost first, stopping at the first
 * ancestor the reader can't see (and at any loop).
 */
export function ancestorTrail<T extends { id: string; parentId?: string }>(
  place: T,
  find: (id?: string) => T | undefined,
): T[] {
  const trail: T[] = []
  const seen = new Set([place.id])
  for (let p = find(place.parentId); p && !seen.has(p.id);) {
    trail.unshift(p)
    seen.add(p.id)
    p = find(p.parentId)
  }
  return trail
}
