import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { ShownEra } from '../../data/planetHistory'
import type { CultureTopic } from '../../data/types'
import type { MetroHandle } from '../history/ScrubLooks'
import { jumpTo, type ShownTopic } from './placeTopics'

export interface NavPart {
  title: string
  /** DOM subsections have an id; timeline eras deliberately do not. */
  id?: string
  era?: number
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
  viewStart: 0,
  viewSize: 1,
  progress: 0,
}
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const rounded = (n: number) => Math.round(clamp(n) * 10000) / 10000

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
  hash,
}: {
  rootRef: RefObject<HTMLElement | null>
  metroRef: RefObject<MetroHandle | null>
  topics: ShownTopic[]
  eras: ShownEra[]
  version: object
  loading: boolean
  hash: string
}) {
  const [snapshot, setSnapshot] = useState<Snapshot>()
  const [reading, setReading] = useState<Reading>({ section: 'top' })
  const [era, setEra] = useState(0)
  const pinned = useRef<Reading>(undefined)
  const followed = useRef('')
  const jumpFrame = useRef<number>(undefined)
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

  // A previously visible heading can disappear when reading progress moves
  // backwards. Do not leave its title-derived fragment in the address bar.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || loading || !location.hash) return
    let id = ''
    try {
      id = decodeURIComponent(location.hash.slice(1))
    } catch {
      // An invalid fragment cannot name a visible heading.
    }
    const target = document.getElementById(id)
    if (id !== 'top' && (!target || !root.contains(target)))
      history.replaceState(
        history.state,
        '',
        location.pathname + location.search,
      )
  }, [rootRef, version, loading])

  useEffect(
    () => () => {
      if (jumpFrame.current !== undefined)
        cancelAnimationFrame(jumpFrame.current)
    },
    [],
  )

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
            parts.push(...eras.map((e, i) => ({ title: e.title, era: i })))
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
    }
    const manual = ['wheel', 'touchmove', 'pointerdown'] as const
    target.addEventListener('scroll', read, { passive: true })
    for (const event of manual) target.addEventListener(event, unpin)
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
      window.removeEventListener('keydown', unpin)
      window.removeEventListener('resize', schedule)
      root.removeEventListener('load', schedule, true)
      root.removeEventListener('click', schedule)
      root.removeEventListener('toggle', schedule, true)
    }
  }, [rootRef, topics, eras, version, loading])

  const jump = useCallback(
    (section: NavSection, part?: NavPart) => {
      if (jumpFrame.current !== undefined)
        cancelAnimationFrame(jumpFrame.current)
      const next = { section: section.id, part: part?.id }
      pinned.current = next
      setReading(next)
      if (part?.era !== undefined) {
        setEra(part.era)
        metroRef.current?.selectEra(part.era)
      }
      if (section.id === 'top') {
        const scroller = rootRef.current && scrollerOf(rootRef.current)
        if (scroller) moveScroller(scroller, 0)
        else window.scrollTo?.({ top: 0 })
        history.replaceState(
          history.state,
          '',
          location.pathname + location.search,
        )
      } else jumpFrame.current = jumpTo(part?.id ?? section.id)
    },
    [metroRef, rootRef],
  )

  // Follow existing section links after lazy content has arrived.
  useEffect(() => {
    let id = ''
    try {
      id = decodeURIComponent(hash.slice(1))
    } catch {
      return
    }
    if (!id || followed.current === id) return
    const section = sections.find(
      (s) => s.id === id || s.parts.some((p) => p.id === id),
    )
    if (!section) return
    const frame = requestAnimationFrame(() => {
      followed.current = id
      jump(
        section,
        section.parts.find((p) => p.id === id),
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, sections, jump])

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
      if (scroller) moveScroller(scroller, top)
      else window.scrollTo?.({ top, behavior: 'auto' })
    },
    [rootRef],
  )

  return { sections, geometry, current, jump, seek, setEra }
}

export type PageNavigation = ReturnType<typeof usePageNavigation>
