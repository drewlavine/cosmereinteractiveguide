import type { Reveal } from '../data/types'
import type { CanSee } from '../data/reveal'

/** One thing search can find: a page with a title. */
export interface SearchEntry {
  /** Unique across every source, e.g. "planet:roshar". */
  key: string
  title: string
  /** Other names that find it too, e.g. "Opelon" for Sycla. Spoiler-safe only. */
  aliases?: string[]
  /** Short spoiler-safe line under the title, e.g. "City · Arelon, Sel". */
  subtitle?: string
  href: string
  /** Books that reveal it; it's hidden until one is read. Omit if never hidden. */
  revealedIn?: Reveal
}

/** Icons available to search results; add an SVG in SearchIcon for new ones. */
export type SearchIconName = 'system' | 'planet' | 'place' | 'character'

/** A kind of data search covers, shown as one group of results. */
export interface SearchSource {
  id: string
  /** Group heading, e.g. "Characters". */
  label: string
  icon: SearchIconName
  /**
   * Every entry of this kind, hidden ones included (they're counted, not
   * shown). Use `canSee` to keep aliases and subtitles spoiler-safe.
   */
  entries: (canSee: CanSee) => SearchEntry[]
}
