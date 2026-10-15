import type { ReactNode } from 'react'
import type { SearchIconName } from '../search/types'

const paths: Record<SearchIconName | 'search', ReactNode> = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  system: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4.5" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M4.8 9.5c3 1.6 11.4 1.6 14.4 0M4.8 14.5c3 1.6 11.4 1.6 14.4 0" />
    </>
  ),
  place: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 5.5c2.5-1.3 5-1.3 7.5 0v14c-2.5-1.3-5-1.3-7.5 0Z" />
      <path d="M19.5 5.5c-2.5-1.3-5-1.3-7.5 0v14c2.5-1.3 5-1.3 7.5 0Z" />
    </>
  ),
  character: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" />
    </>
  ),
}

export function SearchIcon({ name }: { name: SearchIconName | 'search' }) {
  return (
    <svg
      className="search-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  )
}
