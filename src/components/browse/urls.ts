/** The A–Z page's `?group=` value (as on the Culture list before). */
export const AZ = 'name'

/** Which page of a list the URL asks for. */
export type ListView =
  | { name: 'cards'; group: string | null }
  | { name: 'members'; group: string; of: string }
  | { name: 'az' }

/**
 * `?group=<grouping>&of=<group>` is a group's members; `?group=name` or a
 * typed `?q=` is the flat A–Z list; anything else is the cards, with the
 * grouping named by `?group=` in view (old links to one still land there).
 */
export function readView(
  params: URLSearchParams,
  groupings: readonly string[],
): ListView {
  const group = params.get('group')
  const of = params.get('of')
  const known = group !== null && groupings.includes(group)
  if (of && known) return { name: 'members', group, of }
  if (group === AZ || params.get('q')?.trim()) return { name: 'az' }
  return { name: 'cards', group: known ? group : null }
}

/** The element id of a grouping's section on the card page. */
export const sectionId = (path: string, grouping: string) =>
  `${path.slice(1)}-by-${grouping.replace(/[^a-z0-9]+/gi, '-')}`

/** A link to a page of a list, e.g. `/characters?group=series&of=x`. */
export function listHref(
  path: string,
  { group, of }: { group?: string; of?: string } = {},
) {
  const params = new URLSearchParams()
  if (group) params.set('group', group)
  if (group && of) params.set('of', of)
  const search = params.toString()
  return search ? `${path}?${search}` : path
}
