import { useEffect, useState, useSyncExternalStore } from 'react'

/** Whether a media query matches, kept up to date; false where unsupported. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia?.(query)
      list?.addEventListener('change', onChange)
      return () => list?.removeEventListener('change', onChange)
    },
    () => !!window.matchMedia?.(query).matches,
    () => false,
  )
}

/**
 * Which of the page parts (`ids`, in page order) is being read: the last
 * whose top has passed a line a third of the way down the screen. Starts at
 * the part named in the URL's hash, if any. Watched with an
 * IntersectionObserver, so it costs nothing between crossings; where there
 * is none (tests), it changes only through the returned setter.
 */
export function useReadingPart(ids: string[]) {
  // Null once the reader is above every part; undefined until first seen.
  const [seen, setActive] = useState<string | null>()
  const hash = decodeURIComponent(location.hash.slice(1))
  const active =
    seen === undefined ? (ids.includes(hash) ? hash : undefined) : seen
  const key = ids.join(' ')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const els = key
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const pick = () => {
      clearTimeout(timer)
      // Settle first, so a fast scroll past several parts doesn't flicker.
      timer = setTimeout(() => {
        const line = window.innerHeight * 0.34
        const passed = els.filter(
          (el) => el.offsetParent && el.getBoundingClientRect().top <= line,
        )
        setActive(passed.at(-1)?.id ?? null)
      }, 90)
    }
    // Fires as a part's top crosses the line, either way.
    const watch = new IntersectionObserver(pick, {
      rootMargin: '0px 0px -66% 0px',
    })
    for (const el of els) watch.observe(el)
    return () => {
      clearTimeout(timer)
      watch.disconnect()
    }
  }, [key])
  return [active ?? undefined, setActive] as const
}
