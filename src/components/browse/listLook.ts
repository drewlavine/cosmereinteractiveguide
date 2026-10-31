// ponytail: temporary, to gather opinions on how the group cards are drawn.
// Once Drew picks, delete this file, TryLayout.tsx and its CSS,
// drop the mount in BrowseList, and keep just the chosen card style
// (the `data-card` look is plain CSS in GroupCard.module.css).
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

/** How a group's card is drawn. */
export const cardStyles = [
  { id: 'poster', label: 'Poster', tip: 'Art on top, name and count below' },
  { id: 'banner', label: 'Banner', tip: 'Art fills the card, name on a fade' },
  {
    id: 'tile',
    label: 'Tile',
    tip: 'Small art beside the name, for long lists',
  },
] as const

export type CardStyle = (typeof cardStyles)[number]['id']

const KEYS = {
  cards: 'cosmere-guide:list-cards',
} as const

// Blocked or full storage must never break a list: the pick then lasts only
// as long as its `?param` does.
const recall = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const keep = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Nothing to do: see above.
  }
}

/**
 * A choice made by `?<param>=<id>` (so a link can share it), else the last
 * pick, else the default. Its setter puts the pick in the URL too.
 */
function useChoice<T extends string>(
  param: keyof typeof KEYS,
  options: readonly { id: T }[],
  fallback: T,
) {
  const [params, setParams] = useSearchParams()
  const valid = (s: string | null): s is T => options.some((o) => o.id === s)
  const asked = params.get(param)
  const kept = recall(KEYS[param])
  const value = valid(asked) ? asked : valid(kept) ? kept : fallback
  useEffect(() => {
    if (options.some((o) => o.id === asked)) keep(KEYS[param], asked!)
  }, [asked, options, param])
  const pick = (id: T) => {
    keep(KEYS[param], id)
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        next.set(param, id)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }
  return [value, pick] as const
}

export const useCardStyle = () => useChoice('cards', cardStyles, 'poster')
