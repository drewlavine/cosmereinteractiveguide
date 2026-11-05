import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'

// A pending fragment belongs to its history entry, so it survives reloads
// and Back/Forward even when the browser provides no navigation keys.
const prefix = '__cosmereGuidePendingFragment'
const marker = 'cosmere-guide:pending-fragment-v1'
const nativePush = history.pushState
const nativeReplace = history.replaceState

interface Pending {
  marker: typeof marker
  hash: string
  boxed: boolean
  original?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

function findPending(state: unknown) {
  if (!isObject(state)) return
  for (const key of Object.keys(state)) {
    const value = state[key]
    if (
      key.startsWith(prefix) &&
      /^_*$/.test(key.slice(prefix.length)) &&
      isObject(value) &&
      value.marker === marker &&
      typeof value.hash === 'string' &&
      value.hash.startsWith('#') &&
      typeof value.boxed === 'boolean'
    )
      return { key, value: value as unknown as Pending }
  }
}

function cloneObject(state: Record<string, unknown>) {
  if (typeof structuredClone === 'function') return structuredClone(state)
  return Array.isArray(state)
    ? Object.assign(state.slice(), state)
    : { ...state }
}

/** Remove our metadata without changing user fields, arrays or primitives. */
function withoutPending(state: unknown): unknown {
  const found = findPending(state)
  if (!found || !isObject(state)) return state
  const copy = cloneObject(state)
  const info = copy[found.key] as Pending
  delete copy[found.key]
  if (info.boxed) {
    const original = Object.assign({}, info.original) as Record<string, unknown>
    const keys = Object.keys(copy)
    if (
      keys.length === Object.keys(original).length &&
      keys.every((key) => Object.is(copy[key], original[key]))
    )
      return info.original
  }
  return copy
}

function withPending(state: unknown, hash: string) {
  const original = withoutPending(state)
  const plain =
    isObject(original) &&
    (Array.isArray(original) ||
      Object.getPrototypeOf(original) === Object.prototype ||
      Object.getPrototypeOf(original) === null)
  const copy: Record<string, unknown> = plain
    ? cloneObject(original)
    : Object.assign({}, original)
  let key = prefix
  while (Object.hasOwn(copy, key)) key += '_'
  copy[key] = {
    marker,
    hash,
    boxed: !plain,
    ...(!plain ? { original } : {}),
  } satisfies Pending
  return copy
}

function replaceFragment(hash: string, state: unknown) {
  nativeReplace.call(
    history,
    state,
    '',
    location.pathname + location.search + hash,
  )
}

export function quarantineFragment() {
  if (!location.hash) return
  replaceFragment('', withPending(history.state, location.hash))
}

export const pendingFragment = () => findPending(history.state)?.value.hash

export function releaseFragment(hash: string) {
  if (pendingFragment() || location.hash !== hash)
    replaceFragment(hash, withoutPending(history.state))
}

export function discardFragment() {
  if (pendingFragment() || location.hash)
    replaceFragment('', withoutPending(history.state))
}

/** Move an alias entry without exposing or discarding its pending target. */
export function redirectPendingFragment(
  pathname: string,
  search: string,
  hash: string,
) {
  if (pendingFragment() !== hash) return false
  nativeReplace.call(history, history.state, '', pathname + search)
  return true
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
  if (target) {
    const hash = target.hash
    target.hash = ''
    return nativePush.call(this, withPending(data, hash), unused, target.href)
  }
  if (this !== history) return nativePush.call(this, data, unused, url)
  const hash = url == null || url === '' ? pendingFragment() : undefined
  return nativePush.call(
    this,
    hash ? withPending(data, hash) : withoutPending(data),
    unused,
    url,
  )
}

function replaceState(
  this: History,
  data: unknown,
  unused: string,
  url?: string | URL | null,
) {
  const target = this === history ? destination(url) : undefined
  if (target && target.href !== location.href) {
    const hash = target.hash
    target.hash = ''
    return nativeReplace.call(
      this,
      withPending(data, hash),
      unused,
      target.href,
    )
  }
  if (this !== history) return nativeReplace.call(this, data, unused, url)
  const hash = url == null || url === '' ? pendingFragment() : undefined
  return nativeReplace.call(
    this,
    hash ? withPending(data, hash) : withoutPending(data),
    unused,
    url,
  )
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
