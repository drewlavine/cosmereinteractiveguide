import { useMemo } from 'react'
import { readerCanSee, revealSystem } from '../data/reveal'
import { systems } from '../data/systems'
import { useBooksRead } from './booksRead'

/** Every system trimmed to the reader's books (or shown in full on request). */
export function useShownSystems() {
  const { read, viewAnyway } = useBooksRead()
  return useMemo(() => {
    const canSee = readerCanSee(read)
    return systems.map((system) =>
      revealSystem(system, canSee, viewAnyway.has(system.id)),
    )
  }, [read, viewAnyway])
}

export const useShownSystem = (systemId?: string) =>
  useShownSystems().find((s) => s.id === systemId)
