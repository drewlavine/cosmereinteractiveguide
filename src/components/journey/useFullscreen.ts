import { useCallback, useEffect, useState, type RefObject } from 'react'

/**
 * Full screen for an element. It's laid over the page at once (a fixed
 * overlay, styled by the caller from `active`/`overlay`), and the
 * Fullscreen API is asked to take it truly full screen where there is one;
 * without it (e.g. iPhone Safari), or if the browser says no, the overlay
 * is all there is. Escape leaves either.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false)
  const [native, setNative] = useState(false)

  useEffect(() => {
    const onChange = () => {
      const now = !!ref.current && document.fullscreenElement === ref.current
      setNative(now)
      // Leaving real full screen (Escape, the browser's own controls) leaves.
      if (!now) setActive(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [ref])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false)
    }
    document.addEventListener('keydown', onKey)
    // Keep the page behind from scrolling under the overlay.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [active])

  // Leave real full screen too, however the overlay was left.
  useEffect(() => {
    if (!active && document.fullscreenElement && ref.current)
      if (document.fullscreenElement === ref.current)
        void document.exitFullscreen?.().catch(() => {})
  }, [active, ref])

  const enter = useCallback(() => {
    setActive(true)
    const el = ref.current
    if (el && document.fullscreenEnabled && el.requestFullscreen)
      el.requestFullscreen().catch(() => {})
  }, [ref])

  const exit = useCallback(() => setActive(false), [])

  const toggle = useCallback(
    () => (active ? exit() : enter()),
    [active, enter, exit],
  )
  return { active, overlay: active && !native, toggle, exit }
}
