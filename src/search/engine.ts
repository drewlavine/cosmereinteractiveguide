import MiniSearch from 'minisearch'
import type { CanSee } from '../data/reveal'
import { searchSources } from './sources'
import type { SearchEntry, SearchSource } from './types'

export type SearchHit = SearchEntry & { source: SearchSource }

export interface SearchGroup {
  source: SearchSource
  hits: SearchHit[]
}

export interface SearchResults {
  /** Groups by kind, best match first, holding only what the reader may see. */
  groups: SearchGroup[]
  total: number
  /** Matches left out because they come from unread books. */
  hidden: number
}

export interface Search {
  search: (query: string) => SearchResults
  /** A visible entry by key, e.g. for recent searches. */
  get: (key: string) => SearchHit | undefined
}

// Accents and case don't matter, and "T'Telir" matches "ttelir".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, '')
    .toLowerCase()

const tokenize = (text: string) =>
  normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)

/** A search over every source, for a reader who can see `canSee`. */
export function createSearch(
  canSee: CanSee,
  sources: SearchSource[] = searchSources,
): Search {
  const entries = new Map<string, SearchHit>()
  const names: { id: number; key: string; name: string }[] = []
  for (const source of sources)
    for (const entry of source.entries(canSee)) {
      entries.set(entry.key, { ...entry, source })
      for (const name of [entry.title, ...(entry.aliases ?? [])])
        names.push({ id: names.length, key: entry.key, name })
    }

  const index = new MiniSearch<(typeof names)[number]>({
    fields: ['name'],
    storeFields: ['key', 'name'],
    tokenize,
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length > 3 ? 0.25 : false),
      combineWith: 'AND',
    },
  })
  index.addAll(names)

  const visible = (hit: SearchHit) => !hit.revealedIn || canSee(hit.revealedIn)

  return {
    get: (key) => {
      const hit = entries.get(key)
      return hit && visible(hit) ? hit : undefined
    },
    search: (query) => {
      const q = normalize(query.trim())
      const best = new Map<string, number>()
      if (q)
        for (const result of index.search(q)) {
          const name = normalize(result.name as string)
          // Whole-name and starts-with matches beat matches mid-name.
          const bonus = name === q ? 4 : name.startsWith(q) ? 2 : 1
          const score = result.score * bonus
          const key = result.key as string
          best.set(key, Math.max(best.get(key) ?? 0, score))
        }

      const words = tokenize(query).join(' ')
      const typedExactly = (hit: SearchHit) =>
        words !== '' &&
        !!hit.exactMatch?.names.some((n) => tokenize(n).join(' ') === words)

      let hidden = 0
      const groups = new Map<string, SearchGroup & { top: number }>()
      for (const [key, score] of [...best].sort((a, b) => b[1] - a[1])) {
        let hit = entries.get(key)!
        if (!visible(hit)) {
          if (!typedExactly(hit)) {
            hidden++
            continue
          }
          hit = { ...hit, subtitle: hit.exactMatch!.subtitle }
        }
        const group = groups.get(hit.source.id)
        if (group) group.hits.push(hit)
        else
          groups.set(hit.source.id, {
            source: hit.source,
            hits: [hit],
            top: score,
          })
      }
      const sorted = [...groups.values()].sort((a, b) => b.top - a.top)
      return {
        groups: sorted.map(({ source, hits }) => ({ source, hits })),
        total: sorted.reduce((n, g) => n + g.hits.length, 0),
        hidden,
      }
    },
  }
}
