import { useEffect, useState } from 'react'

/**
 * Loads what `missing` says isn't loaded yet, all together; true once it
 * has all arrived.
 */
export function useLoadAll(missing: () => (() => Promise<unknown>)[]) {
  const [ready, setReady] = useState(() => !missing().length)
  useEffect(() => {
    let live = true
    void Promise.all(missing().map((load) => load())).then(
      () => live && setReady(true),
    )
    return () => {
      live = false
    }
  }, [missing])
  return ready
}
