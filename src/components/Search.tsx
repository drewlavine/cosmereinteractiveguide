import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { SearchHit } from '../search/engine'
import { addRecent, clearRecent, loadRecent } from '../search/recent'
import {
  hiddenNote,
  searchPageHref,
  SUGGESTED,
  useSearch,
} from '../search/useSearch'
import { SearchIcon } from './SearchIcon'

/** Results per group in the box; the results page shows them all. */
const PER_GROUP = 5

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/**
 * Header button and ⌘K / Ctrl+K / "/" shortcut that open the search box: a
 * centered dialog listing results by kind as you type.
 */
export function Search() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const { search, get } = useSearch()
  const navigate = useNavigate()
  const { pathname, search: urlSearch } = useLocation()

  const open = () => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    setQuery('')
    setActiveIndex(0)
    setRecent(loadRecent())
    dialog.showModal()
    inputRef.current?.focus()
  }
  const close = () => dialogRef.current?.close()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (dialog?.open) dialog.close()
        else open()
      } else if (
        event.key === '/' &&
        !isTyping(event.target) &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Following any link closes the box.
  useEffect(() => close(), [pathname, urlSearch])

  const results = useMemo(
    () => (query.trim() ? search(query) : undefined),
    [query, search],
  )

  // What the listbox shows: results, or recent picks and suggestions.
  const groups: { id: string; label: string; hits: SearchHit[] }[] = results
    ? results.groups.map((g) => ({
        id: g.source.id,
        label: g.source.label,
        hits: g.hits.slice(0, PER_GROUP),
      }))
    : (() => {
        const recentHits = recent.flatMap((key) => get(key) ?? [])
        if (recentHits.length)
          return [{ id: 'recent', label: 'Recent', hits: recentHits }]
        const suggested = SUGGESTED.flatMap((key) => get(key) ?? [])
        return suggested.length
          ? [{ id: 'suggested', label: 'Try', hits: suggested }]
          : []
      })()
  const options = groups.flatMap((g) => g.hits)
  const active = Math.min(activeIndex, options.length - 1)
  const optionId = (i: number) => `search-option-${i}`

  const choose = (hit: SearchHit) => {
    addRecent(hit.key)
    close()
    void navigate(hit.href)
  }

  const onInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!options.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((active + step + options.length) % options.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (options[active]) choose(options[active])
      else if (query.trim()) void navigate(searchPageHref(query))
    }
  }

  let index = -1
  return (
    <>
      <button
        type="button"
        className="search-button"
        aria-haspopup="dialog"
        aria-label="Search the Cosmere"
        aria-keyshortcuts="Meta+K Control+K /"
        onClick={open}
      >
        <SearchIcon name="search" />
        <span className="search-button-text">Search the Cosmere…</span>
        <kbd className="search-button-kbd">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="search-dialog"
        aria-label="Search"
        onClose={() => setQuery('')}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className="search-panel">
          <div className="search-field">
            <SearchIcon name="search" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              placeholder="Search planets, places, characters…"
              aria-label="Search the Cosmere"
              aria-autocomplete="list"
              aria-expanded={options.length > 0}
              aria-controls="search-listbox"
              aria-activedescendant={
                options.length ? optionId(active) : undefined
              }
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onInputKey}
            />
            <kbd className="search-esc">Esc</kbd>
          </div>

          <div
            id="search-listbox"
            role="listbox"
            aria-label={results ? 'Search results' : 'Suggestions'}
            className="search-results"
          >
            {groups.map((group) => (
              <div
                key={group.id}
                role="group"
                aria-labelledby={`search-group-${group.id}`}
                className="search-group"
              >
                <div
                  id={`search-group-${group.id}`}
                  role="presentation"
                  className="search-group-label"
                >
                  {group.label}
                  {group.id === 'recent' && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => {
                        clearRecent()
                        setRecent([])
                        inputRef.current?.focus()
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {group.hits.map((hit) => {
                  const i = ++index
                  return (
                    <div
                      key={hit.key}
                      id={optionId(i)}
                      role="option"
                      aria-selected={i === active}
                      className="search-option"
                      onMouseMove={() => i !== active && setActiveIndex(i)}
                      onClick={() => choose(hit)}
                    >
                      <SearchIcon name={hit.source.icon} />
                      <span className="search-option-text">
                        <span className="search-option-title">{hit.title}</span>
                        {hit.subtitle && (
                          <span className="search-option-subtitle">
                            {hit.subtitle}
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {results && !results.total && (
            <p className="search-empty">No results for “{query.trim()}”.</p>
          )}
          {results && results.hidden > 0 && (
            <p className="search-hidden">{hiddenNote(results.hidden)}</p>
          )}

          <footer className="search-footer">
            <span className="search-keys" aria-hidden>
              <kbd>↑</kbd>
              <kbd>↓</kbd> to move <kbd>Enter</kbd> to open <kbd>Esc</kbd> to
              close
            </span>
            {results && results.total > options.length && (
              <Link to={searchPageHref(query)} className="search-all">
                See all {results.total} results
              </Link>
            )}
          </footer>
        </div>
      </dialog>
    </>
  )
}
