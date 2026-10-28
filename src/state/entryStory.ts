import { useEffect, useState } from 'react'
import {
  cachedEntryStory,
  hasEntryStory,
  loadEntryStory,
  type EntryKind,
} from '../data/entryStories'

/** An entry's page, loaded on demand; `loading` until it arrives. */
export function useEntryStory(kind: EntryKind, id: string) {
  const [, setLoaded] = useState<string>()
  const story = cachedEntryStory(kind, id)
  useEffect(() => {
    let live = true
    if (!cachedEntryStory(kind, id))
      void loadEntryStory(kind, id).then(() => live && setLoaded(id))
    return () => {
      live = false
    }
  }, [kind, id])
  return { story, loading: hasEntryStory(kind, id) && !story }
}
