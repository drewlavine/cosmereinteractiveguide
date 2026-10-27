import { useEffect, useState } from 'react'
import {
  cachedBookScenes,
  hasBookScenes,
  loadBookScenes,
} from '../../data/bookScenes'

/** A book's chapter-map scenes, loaded on demand; undefined until then. */
export function useBookScenes(bookId: string) {
  const [, setLoaded] = useState<string>()
  useEffect(() => {
    let live = true
    if (hasBookScenes(bookId) && !cachedBookScenes(bookId))
      void loadBookScenes(bookId).then(() => live && setLoaded(bookId))
    return () => {
      live = false
    }
  }, [bookId])
  return cachedBookScenes(bookId)
}
