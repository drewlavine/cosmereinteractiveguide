import type { ReactNode } from 'react'
import type { Planet } from '../../data/types'
import type { SearchIconName } from '../../search/types'

/** What a browsable list needs to know about each item. */
export interface Listed {
  id: string
  name: string
}

/** A category an item falls under in one grouping, as [id, name, order]. */
export type Category = readonly [id: string, name: string, order: number]

export interface Group<T> {
  id: string
  name: string
  items: T[]
}

/** Just enough to name a group when picking its art. */
export interface GroupRef {
  id: string
  name: string
}

/** The art on a group's card, already trimmed to what the reader may see. */
export type CardArt =
  | {
      type: 'image'
      src: string
      alt: string
      credit?: { text: string; href?: string }
      /** Shown whole on a plain panel (a glyph) instead of cropped to fill. */
      contain?: boolean
    }
  | { type: 'planet'; planet: Planet }

/** One way to group a list: each of its groups gets a card. */
export interface Grouping<T> {
  /** In the URL, as `?group=`. Never `name`: that is the A–Z list. */
  id: string
  /** On the chip, e.g. "Series". */
  label: string
  /** The member page's way back, e.g. "All series". */
  all: string
  /** What the reader may see of an item's categories; none = not sorted yet. */
  categories: (item: T) => readonly Category[]
  /** Within one `order`, the biggest groups first (else by name). */
  biggestFirst?: boolean
  /** Art that describes a group; leave out (or return nothing) for a symbol. */
  art?: (group: GroupRef) => CardArt | undefined
  /** The symbol on a card without art; the list's own icon if left out. */
  symbol?: (group: GroupRef) => ReactNode
}

/** A card: one group of a grouping, or its "Not sorted yet". */
export interface Card {
  id: string
  name: string
  count: number
  art?: CardArt
  symbol: ReactNode
  /** The hue of its panel when it has no art; see `toneOf`. */
  tone: number
}

/** A grouping with its groups built from what the reader may see. */
export interface Built<T> {
  grouping: Grouping<T>
  groups: Group<T>[]
  unsorted: T[]
  cards: Card[]
}

/** A list's whole description: what BrowseList needs to show it. */
export interface BrowseProps<T extends Listed> {
  /** Where the list lives, e.g. "/characters". */
  path: string
  title: string
  /** What an item is called, for counts: "character", "characters". */
  noun: { one: string; many: string }
  icon: SearchIconName
  /** Everything the reader may see, A–Z. */
  items: readonly T[]
  /** How many more exist but are hidden by what the reader has read. */
  hidden: number
  /** Keep this stable (useMemo): groups and art are built from it. */
  groupings: readonly Grouping<T>[]
  /** Whether an item matches what was typed (already folded and trimmed). */
  match: (item: T, needle: string) => boolean
  /** An item's row on the member and A–Z pages. */
  row: (item: T, needle: string) => ReactNode
  /** Explains icons on those rows. */
  legend?: ReactNode
  /** The filter's accessible name. */
  filterLabel: string
  /** Shown when nothing is left to list. */
  noMatch: string
}
