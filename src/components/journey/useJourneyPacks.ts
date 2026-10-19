import { useEffect, useState } from 'react'
import type { JourneyIndex, JourneyPack } from '../../data/journey'
import { cachedPack, hasPack, loadPack } from '../../data/journeyPacks'

/**
 * The packs holding the journey of a character (and their personas, see
 * journeyIds), loaded on demand: `loading` until they've all arrived. Packs
 * are small local files, like stories.
 */
export function useJourneyPacks(
  index: JourneyIndex,
  characterIds: readonly string[],
) {
  const ids = [
    ...new Set(characterIds.flatMap((c) => index[c] ?? []).map((e) => e.pack)),
  ]
    .filter(hasPack)
    .toSorted()
  const key = ids.join(' ')
  const [, setLoaded] = useState<string>()
  const packs = ids.map(cachedPack)
  useEffect(() => {
    let live = true
    const wanted = key ? key.split(' ') : []
    if (wanted.some((p) => !cachedPack(p)))
      void Promise.all(wanted.map(loadPack)).then(() => live && setLoaded(key))
    return () => {
      live = false
    }
  }, [key])
  const ready = packs.filter((p): p is JourneyPack => !!p)
  return {
    packs: ready,
    loading: ready.length < ids.length,
  }
}
