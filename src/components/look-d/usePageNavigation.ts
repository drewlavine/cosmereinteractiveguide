import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { ShownEra } from '../../data/planetHistory'
import type { CultureTopic } from '../../data/types'
import type { MetroHandle } from '../history/ScrubLooks'
import { jumpTo, type ShownTopic } from './placeTopics'

export interface NavPart {
  title: string
  /** DOM subsections have an id; timeline eras use an opaque fragment. */
  id?: string
  era?: number
  href?: string
  topic?: CultureTopic
  count?: number
}

export interface NavSection {
  id: string
  title: string
  parts: NavPart[]
}

interface Reading {
  section: string
  part?: string
}

interface Geometry {
  segments: { id: string; start: number; size: number }[]
  markers: { section: string; part?: string; start: number }[]
  viewStart: number
  viewSize: number
  progress: number
}

interface Snapshot {
  version: object
  sections: NavSection[]
  geometry: Geometry
}

const top: NavSection = { id: 'top', title: 'Top', parts: [] }
const topOnly = [top]
const emptyGeometry: Geometry = {
  segments: [],
  markers: [],
  viewStart: 0,
  viewSize: 1,
  progress: 0,
}
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const rounded = (n: number) => Math.round(clamp(n) * 10000) / 10000

/** A stable neutral link, never the data id or a title that may change. */
function eraHref(era: ShownEra) {
  let hash = 0xcbf29ce484222325n
  for (const char of era.id)
    hash = BigInt.asUintN(
      64,
      (hash ^ BigInt(char.codePointAt(0)!)) * 0x100000001b3n,
    )
  return `#history~${hash.toString(36)}`
}

/** The app scrolls its main area, not the browser window. */
const scrollerOf = (root: HTMLElement) => root.closest<HTMLElement>('.app-main')

function moveScroller(scroller: HTMLElement, top: number) {
  if (scroller.scrollTo) scroller.scrollTo({ top, behavior: 'auto' })
  else {
    scroller.scrollTop = top
    scroller.dispatchEvent(new Event('scroll'))
  }
}

/**
 * One model for both navigation looks. Section names come from rendered
 * headings, and era names only from the already-trimmed timeline. A new
 * visibility version invalidates the old snapshot before it can be painted.
 */
export function usePageNavigation({
  rootRef,
  metroRef,
  topics,
  eras,
  version,
  loading,
}: {
  rootRef: RefObject<HTMLElement | null>
  metroRef: RefObject<MetroHandle | null>
  topics: ShownTopic[]
  eras: ShownEra[]
  version: object
  loading: boolean
}) {
  const route = useLocation()
  const navigate = useNavigate()
  const [snapshot, setSnapshot] = useState<Snapshot>()
  const [reading, setReading] = useState<Reading>({ section: 'top' })
  const [era, setEra] = useState(0)
  const pinned = useRef<Reading>(undefined)
  const followed = useRef<{ hash: string; version: object }>(undefined)
  const ownHash = useRef<string>(undefined)
  const requestedEra = useRef<number>(undefined)
  const lastMetro = useRef<number>(undefined)
  const suppressMetro = useRef(true)
  const jumpFrame = useRef<number>(undefined)
  const following = useRef<{
    id: string
    timers: ReturnType<typeof setTimeout>[]
  }>(undefined)
  const sections = snapshot?.version === version ? snapshot.sections : topOnly
  const geometry =
    snapshot?.version === version ? snapshot.geometry : emptyGeometry
  const currentSection = sections.find((s) => s.id === reading.section) ?? top
  const currentPart = currentSection.parts.find((p) => p.id === reading.part)
  const current = {
    section: currentSection.id,
    part: currentPart?.id,
    era: Math.min(era, Math.max(0, eras.length - 1)),
  }

  const stopFollowing = useCallback(() => {
    following.current?.timers.forEach(clearTimeout)
    following.current = undefined
    if (jumpFrame.current !== undefined) {
      cancelAnimationFrame(jumpFrame.current)
      jumpFrame.current = undefined
    }
  }, [])

  const align = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (el && rootRef.current?.contains(el))
        el.scrollIntoView?.({ block: 'start', behavior: 'auto' })
    },
    [rootRef],
  )

  const writeHash = useCallback(
    (hash: string) => {
      if (route.hash === hash && location.hash === hash) return
      ownHash.current = hash
      void navigate(
        { pathname: route.pathname, search: route.search, hash },
        { state: route.state, preventScrollReset: true },
      )
    },
    [navigate, route.hash, route.pathname, route.search, route.state],
  )

  const selectEra = useCallback(
    (index: number) => {
      requestedEra.current = index
      setEra(index)
      metroRef.current?.selectEra(index)
    },
    [metroRef],
  )

  // Metro reports on mount as well as on user changes. Only the latter
  // create a history entry; selecting an era from a link is not a new edit.
  useLayoutEffect(() => {
    suppressMetro.current = true
    if (!eras.length) lastMetro.current = undefined
  }, [eras.length, version])
  useEffect(() => {
    suppressMetro.current = false
  }, [version])
  const onEraChange = useCallback(
    (index: number) => {
      if (lastMetro.current === index) return
      const first = lastMetro.current === undefined
      lastMetro.current = index
      setEra(index)
      const requested = requestedEra.current
      requestedEra.current = undefined
      if (first || suppressMetro.current || requested === index) return
      const selected = eras[index]
      if (selected) writeHash(eraHref(selected))
    },
    [eras, writeHash],
  )

  // Validate again on navigation, not just progress changes. Back can
  // restore an old fragment after its heading has become a spoiler.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || loading) return
    const path = location.pathname
    const validate = () => {
      if (location.pathname !== path || !location.hash) return
      let id = ''
      try {
        id = decodeURIComponent(location.hash.slice(1))
      } catch {
        // An invalid fragment cannot name a visible heading.
      }
      const target = document.getElementById(id)
      const valid = id.startsWith('history~')
        ? eras.filter((entry) => eraHref(entry) === `#${id}`).length === 1 &&
          root.contains(document.getElementById('history'))
        : id === 'top' || (target && root.contains(target))
      if (valid) return
      history.replaceState(
        history.state,
        '',
        location.pathname + location.search,
      )
      followed.current = undefined
      ownHash.current = undefined
      stopFollowing()
    }
    validate()
    window.addEventListener('popstate', validate)
    window.addEventListener('hashchange', validate)
    return () => {
      window.removeEventListener('popstate', validate)
      window.removeEventListener('hashchange', validate)
    }
  }, [rootRef, eras, version, loading, route.hash, stopFollowing])

  useEffect(() => stopFollowing, [stopFollowing])

  useEffect(() => {
    const root = rootRef.current
    if (!root || loading) return
    const content = root.querySelector('.character-main')
    const scroller = scrollerOf(root)
    const target: EventTarget = scroller ?? window
    let frame = 0
    let live = true
    pinned.current = undefined

    const read = () => {
      if (!live) return
      const els = [...root.querySelectorAll<HTMLElement>('[data-toc]')]
      const next: NavSection[] = [
        top,
        ...els.map((el) => {
          const parts: NavPart[] = [
            ...el.querySelectorAll<HTMLElement>('[data-toc-sub]'),
          ].map((sub) => {
            const topic = topics.find((t) => t.id === sub.id)
            return {
              id: sub.id,
              title: sub.dataset.tocSub ?? '',
              topic: topic?.topic,
              count: topic?.count,
            }
          })
          if (el.id === 'history' && eras.length)
            parts.push(
              ...eras.map((e, i) => ({
                title: e.title,
                era: i,
                href: eraHref(e),
              })),
            )
          return { id: el.id, title: el.dataset.toc ?? '', parts }
        }),
      ]

      const page = root.getBoundingClientRect()
      const box = scroller?.getBoundingClientRect()
      const scrollTop = scroller?.scrollTop ?? window.scrollY
      const viewHeight = scroller?.clientHeight ?? window.innerHeight
      const pageTop = scrollTop + page.top - (box?.top ?? 0)
      const height = page.height
      let geometry = emptyGeometry
      if (height > 0) {
        const starts = [
          0,
          ...els.map((el) =>
            clamp((el.getBoundingClientRect().top - page.top) / height),
          ),
        ]
        const viewStart = clamp((scrollTop - pageTop) / height)
        const viewEnd = clamp((scrollTop + viewHeight - pageTop) / height)
        geometry = {
          segments: next.map((s, i) => ({
            id: s.id,
            start: rounded(starts[i]),
            size: rounded((starts[i + 1] ?? 1) - starts[i]),
          })),
          markers: [
            { section: 'top', start: 0 },
            ...els.flatMap((el) => [
              {
                section: el.id,
                start: rounded(
                  (el.getBoundingClientRect().top - page.top) / height,
                ),
              },
              ...[...el.querySelectorAll<HTMLElement>('[data-toc-sub]')]
                .filter((sub) => !sub.closest('[hidden]'))
                .map((sub) => ({
                  section: el.id,
                  part: sub.id,
                  start: rounded(
                    (sub.getBoundingClientRect().top - page.top) / height,
                  ),
                })),
            ]),
          ],
          viewStart: rounded(viewStart),
          viewSize: rounded(Math.max(0, viewEnd - viewStart)),
          progress: rounded(
            (scrollTop - pageTop) / Math.max(1, height - viewHeight),
          ),
        }

        if (!pinned.current) {
          const line = (box?.top ?? 0) + Math.min(96, viewHeight * 0.3)
          const passed = (el: HTMLElement) =>
            !el.closest('[hidden]') && el.getBoundingClientRect().top <= line
          const atBottom =
            !!scroller &&
            scroller.scrollHeight > scroller.clientHeight &&
            scroller.scrollTop + scroller.clientHeight >=
              scroller.scrollHeight - 4
          const section = atBottom ? els.at(-1) : els.findLast(passed)
          const subs = section
            ? [...section.querySelectorAll<HTMLElement>('[data-toc-sub]')]
            : []
          const part = atBottom
            ? subs.filter((sub) => !sub.closest('[hidden]')).at(-1)
            : subs.findLast(passed)
          const nextReading = section
            ? { section: section.id, part: part?.id }
            : { section: 'top' }
          setReading((old) =>
            old.section === nextReading.section && old.part === nextReading.part
              ? old
              : nextReading,
          )
        }
      }

      setSnapshot((old) => {
        const sameSections =
          old?.version === version &&
          JSON.stringify(old.sections) === JSON.stringify(next)
        const sameGeometry =
          old?.version === version &&
          JSON.stringify(old.geometry) === JSON.stringify(geometry)
        if (sameSections && sameGeometry) return old
        return {
          version,
          sections: sameSections ? old.sections : next,
          geometry,
        }
      })
    }

    const schedule = () => {
      if (live && !frame)
        frame = requestAnimationFrame(() => {
          frame = 0
          read()
          if (following.current) align(following.current.id)
        })
    }
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(schedule)
    const observeSizes = () => {
      resize?.disconnect()
      resize?.observe(root)
      if (scroller) resize?.observe(scroller)
      root
        .querySelectorAll('[data-toc], [data-toc-sub]')
        .forEach((el) => resize?.observe(el))
    }
    const changes =
      typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            observeSizes()
            schedule()
          })
    if (content)
      changes?.observe(content, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['hidden', 'open', 'data-toc', 'data-toc-sub'],
      })
    const unpin = () => {
      pinned.current = undefined
      stopFollowing()
    }
    const manual = ['wheel', 'touchmove'] as const
    target.addEventListener('scroll', read, { passive: true })
    for (const event of manual) target.addEventListener(event, unpin)
    window.addEventListener('pointerdown', unpin)
    window.addEventListener('keydown', unpin)
    window.addEventListener('resize', schedule)
    root.addEventListener('load', schedule, true)
    root.addEventListener('click', schedule)
    root.addEventListener('toggle', schedule, true)
    document.fonts?.ready.then(schedule).catch(() => {})
    observeSizes()
    read()
    return () => {
      live = false
      if (frame) cancelAnimationFrame(frame)
      resize?.disconnect()
      changes?.disconnect()
      target.removeEventListener('scroll', read)
      for (const event of manual) target.removeEventListener(event, unpin)
      window.removeEventListener('pointerdown', unpin)
      window.removeEventListener('keydown', unpin)
      window.removeEventListener('resize', schedule)
      root.removeEventListener('load', schedule, true)
      root.removeEventListener('click', schedule)
      root.removeEventListener('toggle', schedule, true)
    }
  }, [rootRef, topics, eras, version, loading, align, stopFollowing])

  const jump = useCallback(
    (section: NavSection, part?: NavPart, updateHash = true) => {
      stopFollowing()
      const next = { section: section.id, part: part?.id }
      pinned.current = next
      setReading(next)
      if (part?.era !== undefined) selectEra(part.era)
      if (section.id === 'top') {
        const scroller = rootRef.current && scrollerOf(rootRef.current)
        if (scroller) moveScroller(scroller, 0)
        else window.scrollTo?.({ top: 0 })
      } else jumpFrame.current = jumpTo(part?.id ?? section.id)
      if (updateHash)
        writeHash(
          section.id === 'top'
            ? ''
            : (part?.href ?? `#${part?.id ?? section.id}`),
        )
    },
    [rootRef, selectEra, stopFollowing, writeHash],
  )

  // Follow links after lazy content has arrived. Keep the target aligned
  // through the initial fade and image reflows until the reader intervenes.
  useEffect(() => {
    if (loading || snapshot?.version !== version) return
    const hash = location.hash
    if (!hash) {
      if (following.current) stopFollowing()
      followed.current = { hash, version }
      ownHash.current = undefined
      return
    }
    const section = sections.find(
      (s) =>
        `#${s.id}` === hash ||
        s.parts.some((p) => (p.href ?? `#${p.id}`) === hash),
    )
    if (!section) return
    const part = section.parts.find((p) => (p.href ?? `#${p.id}`) === hash)
    const changed = followed.current?.hash !== hash
    if (!changed && followed.current?.version === version) return
    followed.current = { hash, version }
    const ours = ownHash.current === hash
    ownHash.current = undefined
    if (ours) return
    if (!changed) {
      if (part?.era !== undefined) {
        requestedEra.current = part.era
        metroRef.current?.selectEra(part.era)
      }
      return
    }
    jump(section, part, false)
    if (section.id === 'top') return
    const id = part?.id ?? section.id
    const timers = [150, 500, 1000, 2000].map((ms) =>
      setTimeout(() => {
        if (following.current?.id === id) align(id)
      }, ms),
    )
    following.current = { id, timers }
  }, [
    route.hash,
    sections,
    snapshot,
    version,
    loading,
    jump,
    metroRef,
    align,
    stopFollowing,
  ])

  /** Move the actual page to a fraction of the rendered article. */
  const seek = useCallback(
    (fraction: number) => {
      const root = rootRef.current
      if (!root) return
      const scroller = scrollerOf(root)
      const page = root.getBoundingClientRect()
      const box = scroller?.getBoundingClientRect()
      const scrollTop = scroller?.scrollTop ?? window.scrollY
      const pageTop = scrollTop + page.top - (box?.top ?? 0)
      const top = pageTop + clamp(fraction) * page.height
      pinned.current = undefined
      stopFollowing()
      if (scroller) moveScroller(scroller, top)
      else window.scrollTo?.({ top, behavior: 'auto' })
    },
    [rootRef, stopFollowing],
  )

  return { sections, geometry, current, jump, seek, onEraChange }
}

export type PageNavigation = ReturnType<typeof usePageNavigation>
