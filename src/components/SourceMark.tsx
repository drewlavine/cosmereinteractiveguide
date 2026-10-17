import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react'
import { Link } from 'react-router'
import { findBook } from '../data/books'
import { chapterLabel } from '../data/progress'
import type { BookSource } from '../data/types'

const lowerFirst = (s?: string) => s && s[0].toLowerCase() + s.slice(1)

/** Where a fact comes from: a book, or an out-of-book source with a link. */
export interface Source {
  text: string
  url?: string
}

/**
 * A small book badge after a fact that names its sources: shown on hover or
 * focus, and pinned open by a tap where there's no hover. `books` are book
 * ids or {bookId, chapter}, linked to the book's page with the chapter named; `sources` are anything else (a Word of
 * Brandon...).
 */
export function SourceMark({
  books = [],
  sources = [],
}: {
  books?: readonly (string | BookSource)[]
  sources?: readonly Source[]
}) {
  const [pinned, setPinned] = useState(false)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [shift, setShift] = useState(0)
  const root = useRef<HTMLSpanElement>(null)
  const tip = useRef<HTMLSpanElement>(null)
  const tipId = useId()
  const open = pinned || hover || focus

  // Keep the tip on screen: measured unshifted, then nudged in from an edge.
  useLayoutEffect(() => {
    if (!open || !tip.current) return
    const r = tip.current.getBoundingClientRect()
    const right = document.documentElement.clientWidth - 8
    setShift(r.left < 8 ? 8 - r.left : r.right > right ? right - r.right : 0)
    return () => setShift(0)
  }, [open])

  // A tap elsewhere closes a pinned tip.
  useEffect(() => {
    if (!pinned) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setPinned(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [pinned])

  const cited = books.map((b) => {
    const { bookId, chapter } = typeof b === 'string' ? { bookId: b } : b
    return {
      bookId,
      title: findBook(bookId)?.title ?? bookId,
      // Lower case mid-line, like the Coppermind: "chapter 16", "prologue".
      chapter: chapter && lowerFirst(chapterLabel(bookId, chapter)),
    }
  })
  const names = [
    ...cited.map((b) => (b.chapter ? `${b.title} ${b.chapter}` : b.title)),
    ...sources.map((s) => s.text),
  ]
  if (!names.length) return null
  const label = `${names.length > 1 ? 'Sources' : 'Source'}: ${names.join(', ')}`
  const items: ReactNode[] = [
    ...cited.map((b) => (
      <span key={`${b.bookId}/${b.chapter}`}>
        <Link to={`/books/${b.bookId}`}>
          <cite>{b.title}</cite>
        </Link>
        {b.chapter && ` ${b.chapter}`}
      </span>
    )),
    ...sources.map((s) =>
      s.url ? (
        <a key={s.text} href={s.url} target="_blank" rel="noreferrer">
          {s.text}
        </a>
      ) : (
        <span key={s.text}>{s.text}</span>
      ),
    ),
  ]

  return (
    <span
      ref={root}
      className={`source-mark${open ? ' is-open' : ''}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e: FocusEvent) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setFocus(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setPinned(false)
          setFocus(false)
          ;(e.target as HTMLElement).blur()
        }
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => setPinned((p) => !p)}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M2 3.2C3.8 2.4 5.8 2.4 8 3.6v9.6c-2.2-1.2-4.2-1.2-6-.4zM14 3.2c-1.8-.8-3.8-.8-6 .4v9.6c2.2-1.2 4.2-1.2 6-.4z" />
        </svg>
      </button>
      <span
        ref={tip}
        className="source-tip"
        id={tipId}
        role="tooltip"
        style={shift ? { translate: `${shift}px 0` } : undefined}
      >
        {names.length > 1 ? 'Sources: ' : 'Source: '}
        {items.map((item, i) => (
          <span key={i}>
            {i > 0 && ', '}
            {item}
          </span>
        ))}
      </span>
    </span>
  )
}
