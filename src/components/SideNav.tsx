import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { mainTabs, type MainTab } from '../navigation'
import { SearchIcon } from './SearchIcon'

/** The tabs split into runs, each starting at a tab with a `group` heading. */
const groups = mainTabs.reduce<MainTab[][]>((runs, tab) => {
  if (tab.group || !runs.length) runs.push([])
  runs[runs.length - 1].push(tab)
  return runs
}, [])

/**
 * The main navigation: a rail of section icons down the left that slides out
 * to show labels on hover, or stays out when pinned. On phones it's a drawer
 * the header's menu button opens.
 */
export function SideNav({
  open,
  pinned,
  onClose,
}: {
  /** The phone drawer is open. */
  open: boolean
  /** The rail is pinned open on wider screens. */
  pinned: boolean
  onClose: () => void
}) {
  const { pathname } = useLocation()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  const className = ['side-nav', open && 'is-open', pinned && 'is-pinned']
    .filter(Boolean)
    .join(' ')

  return (
    <nav
      id="side-nav"
      className={className}
      aria-label="Main"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {open && (
        <button
          type="button"
          className="side-nav-backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={onClose}
        />
      )}
      <div className="side-nav-panel">
        {open && (
          <div className="side-nav-head">
            <span className="side-nav-title">Cosmere Interactive Guide</span>
            <button
              ref={closeRef}
              type="button"
              className="side-nav-close"
              aria-label="Close menu"
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        )}
        {groups.map((tabs) => {
          const heading = tabs[0].group
          const headingId = heading && `side-nav-${tabs[0].id}-group`
          return (
            <div key={tabs[0].id} className="side-nav-group">
              {heading && (
                <p id={headingId} className="side-nav-heading">
                  <span>{heading}</span>
                </p>
              )}
              <ul aria-labelledby={headingId || undefined}>
                {tabs.map((tab) => {
                  const active = tab.isActive(pathname)
                  return (
                    <li key={tab.id}>
                      <Link
                        to={tab.path}
                        className={
                          active ? 'side-nav-link is-active' : 'side-nav-link'
                        }
                        aria-current={active ? 'page' : undefined}
                        onClick={onClose}
                      >
                        <SearchIcon name={tab.icon} />
                        <span className="side-nav-label">{tab.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
