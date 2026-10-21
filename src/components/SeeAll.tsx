import { useState, type ReactNode } from 'react'
import { splitNotable } from '../data/notable'
import type { CanSee } from '../data/reveal'

/** A long list of people trimmed to its notable ones, with a See all button. */
export function SeeAll<T extends { characterId: string }>({
  list,
  canSee,
  noun,
  children,
}: {
  list: readonly T[]
  canSee: CanSee
  noun: string
  children: (shown: readonly T[]) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { notable, rest } = splitNotable(list, canSee)
  return (
    <>
      {children(open ? list : notable)}
      {rest.length > 0 && (
        <button
          type="button"
          className="see-all"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Show fewer' : `See all ${list.length} ${noun}`}
        </button>
      )}
    </>
  )
}
