import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'

/** Sent to a section to open it, e.g. when its Contents link is followed. */
const OPEN = 'page-section-open'

interface SectionProps {
  id: string
  title: string
  className?: string
  children: ReactNode
}

/** A top-level part of a page, which the reader can fold away. */
export function PageSection({ id, title, className, children }: SectionProps) {
  const [open, setOpen] = useState(true)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    const show = () => setOpen(true)
    el?.addEventListener(OPEN, show)
    return () => el?.removeEventListener(OPEN, show)
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      className={`page-section${className ? ` ${className}` : ''}`}
      aria-labelledby={`${id}-title`}
      data-toc={title}
    >
      <h2 id={`${id}-title`}>
        <button
          type="button"
          className="page-section-toggle"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={() => setOpen((o) => !o)}
        >
          {title}
        </button>
      </h2>
      <div id={`${id}-body`} className="page-section-body" hidden={!open}>
        {children}
      </div>
    </section>
  )
}

/** A titled part within a section, listed under it in the Contents. */
export function PageSubsection({
  id,
  title,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`page-subsection${className ? ` ${className}` : ''}`}
      aria-labelledby={`${id}-title`}
      data-toc-sub={title}
    >
      <h3 id={`${id}-title`}>{title}</h3>
      {children}
    </section>
  )
}

interface Entry {
  id: string
  title: string
  subs: { id: string; title: string }[]
}

const TOP = 'top'

/** The page that scrolls: the app's main area, or the window. */
const scrollerOf = (el: Element) => el.closest('.app-main')

/**
 * The page's Contents: its sections, read from the page itself so hidden
 * (spoiler) parts are never listed, with the one being read highlighted.
 */
export function PageContents() {
  const ref = useRef<HTMLElement>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [active, setActive] = useState<string[]>([TOP])
  // Only phones fold the Contents away (see the stylesheet).
  const [open, setOpen] = useState(false)
  const { hash } = useLocation()
  const jumped = useRef(false)
  // A part the reader jumped to stays marked until they scroll themselves,
  // even if the page can't scroll far enough to bring it to the top.
  const pinned = useRef<string[]>(undefined)

  useEffect(() => {
    const root = ref.current?.closest('article')
    if (!root) return
    const read = () => {
      const next: Entry[] = []
      for (const el of root.querySelectorAll<HTMLElement>(
        '[data-toc], [data-toc-sub]',
      )) {
        if (el.dataset.toc)
          next.push({ id: el.id, title: el.dataset.toc, subs: [] })
        else next.at(-1)?.subs.push({ id: el.id, title: el.dataset.tocSub! })
      }
      setEntries((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      )
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Highlight the last section (and part) whose top has scrolled past.
  useEffect(() => {
    const root = ref.current
    if (!root || !entries.length) return
    const scroller = scrollerOf(root)
    const target: EventTarget = scroller ?? window
    const box = scroller ?? document.scrollingElement
    const update = () => {
      if (pinned.current) {
        const next = pinned.current
        setActive((prev) => (prev.join() === next.join() ? prev : next))
        return
      }
      // At the very bottom, the last part is the one being read, however
      // short it is.
      if (
        box &&
        box.scrollHeight > box.clientHeight &&
        box.scrollTop + box.clientHeight >= box.scrollHeight - 4
      ) {
        const last = entries.at(-1)!
        const next = [last.id, ...last.subs.slice(-1).map((s) => s.id)]
        setActive((prev) => (prev.join() === next.join() ? prev : next))
        return
      }
      const line = (scroller?.getBoundingClientRect().top ?? 0) + 96
      const passed = (id: string) => {
        const el = document.getElementById(id)
        return !!el?.offsetParent && el.getBoundingClientRect().top <= line
      }
      const top = entries.findLast((e) => passed(e.id))
      const sub = top?.subs.findLast((s) => passed(s.id))
      const next = top ? [top.id, ...(sub ? [sub.id] : [])] : [TOP]
      setActive((prev) => (prev.join() === next.join() ? prev : next))
    }
    // A handful of measurements, cheap enough for every scroll event.
    const onScroll = update
    // Scrolling by hand (wheel, touch, keys or the scrollbar) unpins.
    const unpin = () => {
      pinned.current = undefined
    }
    const manual = ['wheel', 'touchmove', 'pointerdown'] as const
    update()
    target.addEventListener('scroll', onScroll, { passive: true })
    for (const type of manual)
      target.addEventListener(type, unpin, { passive: true })
    window.addEventListener('keydown', unpin)
    return () => {
      target.removeEventListener('scroll', onScroll)
      for (const type of manual) target.removeEventListener(type, unpin)
      window.removeEventListener('keydown', unpin)
    }
  }, [entries])

  const jump = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      // Mark the section (and part) the id names.
      const top = entries.find(
        (e) => e.id === id || e.subs.some((s) => s.id === id),
      )
      pinned.current = top && top.id !== id ? [top.id, id] : [id]
      setActive(pinned.current)
      el.closest('[data-toc]')?.dispatchEvent(new Event(OPEN))
      requestAnimationFrame(() => el.scrollIntoView?.({ block: 'start' }))
    },
    [entries],
  )

  // A link to a part of the page (or an old tab's URL) opens at that part.
  // The page is still fading in (scaled) and its images loading, which moves
  // the part, so keep it in view a little while unless the reader scrolls.
  const follow = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (jumped.current || !id) return
    if (entries.some((e) => e.id === id || e.subs.some((s) => s.id === id))) {
      jumped.current = true
      jump(id)
      const pin = pinned.current
      follow.current = [150, 500, 1000, 2000].map((ms) =>
        setTimeout(() => {
          if (pinned.current === pin)
            document.getElementById(id)?.scrollIntoView?.({ block: 'start' })
        }, ms),
      )
    }
  }, [entries, hash, jump])
  useEffect(() => () => follow.current.forEach(clearTimeout), [])

  const link = (id: string, title: string) => (
    <a
      href={`#${id}`}
      aria-current={active.includes(id) ? 'location' : undefined}
      onClick={(e) => {
        e.preventDefault()
        setOpen(false)
        if (id === TOP) {
          pinned.current = [TOP]
          setActive(pinned.current)
          const scroller = ref.current && scrollerOf(ref.current)
          ;(scroller ?? window).scrollTo?.({ top: 0 })
          history.replaceState(history.state, '', location.pathname)
          return
        }
        jump(id)
        history.replaceState(history.state, '', `#${id}`)
      }}
    >
      {title}
    </a>
  )

  return (
    <nav
      ref={ref}
      className={`page-contents${open ? '' : ' collapsed'}`}
      aria-label="Contents"
      hidden={!entries.length}
    >
      <div className="page-contents-inner">
        <button
          type="button"
          className="page-contents-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Contents
        </button>
        <p className="page-contents-title" aria-hidden>
          Contents
        </p>
        <ol>
          <li>{link(TOP, '(Top)')}</li>
          {entries.map((e) => (
            <li key={e.id}>
              {link(e.id, e.title)}
              {e.subs.length > 0 && (
                <ol>
                  {e.subs.map((s) => (
                    <li key={s.id}>{link(s.id, s.title)}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
