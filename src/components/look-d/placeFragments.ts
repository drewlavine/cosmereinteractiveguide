import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'

// Keep unverified fragments out of the URL and browser history state while a
// story loads. History keys let Back/Forward retain each pending destination.
const pending = new Map<string, string>()
const nativePush = history.pushState
const nativeReplace = history.replaceState
const entryKey = () => {
  const state = history.state as { key?: string; idx?: number } | null
  return JSON.stringify([
    location.pathname,
    location.search,
    window.navigation?.currentEntry?.key ?? state?.key ?? state?.idx ?? null,
  ])
}

function replaceFragment(hash: string) {
  nativeReplace.call(
    history,
    history.state,
    '',
    location.pathname + location.search + hash,
  )
}

export function quarantineFragment() {
  if (!location.hash) return
  pending.set(entryKey(), location.hash)
  replaceFragment('')
}

export const pendingFragment = () => pending.get(entryKey())

export function releaseFragment(hash: string) {
  pending.delete(entryKey())
  if (location.hash !== hash) replaceFragment(hash)
}

export function discardFragment() {
  pending.delete(entryKey())
  if (location.hash) replaceFragment('')
}

function placePath(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  if (base && !pathname.toLowerCase().startsWith(`${base.toLowerCase()}/`))
    return false
  let path = pathname.slice(base.length)
  try {
    path = path
      .split('/')
      .map((part) => decodeURIComponent(part).replaceAll('/', '%2F'))
      .join('/')
  } catch {
    // Match the router's fallback for malformed paths.
  }
  return (
    /^\/locations\/[^/]+\/*$/i.test(path) ||
    /^\/systems\/[^/]+\/planets\/[^/]+\/locations\/[^/]+\/*$/i.test(path)
  )
}

function destination(url?: string | URL | null) {
  try {
    if (url == null || localStorage.getItem('placeLook') !== 'd') return
    const target = new URL(url, location.href)
    if (
      target.origin === location.origin &&
      target.hash &&
      placePath(target.pathname)
    )
      return target
  } catch {
    // Let the browser handle invalid URLs or unavailable storage.
  }
}

// A route transition can delay mounting its destination. Quarantine before
// a push/replace or Back/Forward can show an unverified place fragment.
function pushState(
  this: History,
  data: unknown,
  unused: string,
  url?: string | URL | null,
) {
  const target = this === history ? destination(url) : undefined
  if (!target) return nativePush.call(this, data, unused, url)
  const hash = target.hash
  target.hash = ''
  nativePush.call(this, data, unused, target.href)
  pending.set(entryKey(), hash)
}

function replaceState(
  this: History,
  data: unknown,
  unused: string,
  url?: string | URL | null,
) {
  const target = this === history ? destination(url) : undefined
  if (!target || target.href === location.href)
    return nativeReplace.call(this, data, unused, url)
  const previous = entryKey()
  const hash = target.hash
  target.hash = ''
  nativeReplace.call(this, data, unused, target.href)
  pending.delete(previous)
  pending.set(entryKey(), hash)
}

history.pushState = pushState
history.replaceState = replaceState
const quarantineIncoming = () => {
  if (destination(location.href)) quarantineFragment()
}
window.addEventListener('popstate', quarantineIncoming)
window.addEventListener('hashchange', quarantineIncoming)
queueMicrotask(quarantineIncoming)
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    if (history.pushState === pushState) history.pushState = nativePush
    if (history.replaceState === replaceState)
      history.replaceState = nativeReplace
    window.removeEventListener('popstate', quarantineIncoming)
    window.removeEventListener('hashchange', quarantineIncoming)
  })

/** A hidden place has no valid page fragments, even on Back or Forward. */
export function useHiddenPlaceFragment(hidden: boolean) {
  const route = useLocation()
  const path = useRef(location.pathname)
  useLayoutEffect(() => {
    if (!hidden || !path.current.endsWith(route.pathname)) return
    const discard = () => {
      if (location.pathname === path.current) discardFragment()
    }
    discard()
    window.addEventListener('popstate', discard)
    window.addEventListener('hashchange', discard)
    return () => {
      window.removeEventListener('popstate', discard)
      window.removeEventListener('hashchange', discard)
    }
  }, [hidden, route.pathname, route.hash, route.key])
}
