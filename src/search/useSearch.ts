import { useMemo } from 'react'
import { useCanSee } from '../state/reveal'
import { createSearch, type Search } from './engine'

/**
 * Search for the current reader, rebuilt when their books change. The index
 * is built on first use, so pages that never search don't pay for it.
 */
export function useSearch(): Search {
  const canSee = useCanSee()
  return useMemo(() => {
    let search: Search | undefined
    const get = () => (search ??= createSearch(canSee))
    return {
      search: (query) => get().search(query),
      get: (key) => get().get(key),
    }
  }, [canSee])
}

/** Entries to suggest before the reader types, if they may see them. */
export const SUGGESTED = [
  'planet:roshar',
  'planet:scadrial',
  'planet:sel',
  'planet:nalthis',
  'character:hoid',
]

/** "3 results hidden based on what you've read so far" */
export const hiddenNote = (count: number) =>
  `${count} ${count === 1 ? 'result' : 'results'} hidden based on what you've read so far`

export const searchPageHref = (query: string) =>
  `/search?q=${encodeURIComponent(query.trim())}`
