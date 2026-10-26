import type { ReactNode } from 'react'
import type { IconName } from '../search/types'

const paths: Record<IconName, ReactNode> = {
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
  ability: (
    <path d="M12 3.5 14.2 9.8 20.5 12l-6.3 2.2L12 20.5l-2.2-6.3L3.5 12l6.3-2.2Z" />
  ),
  culture: (
    <>
      <path d="M5.5 20.5v-16" />
      <path d="M5.5 4.5h12l-2.5 4 2.5 4h-12" />
    </>
  ),
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  'star-map': (
    <>
      <path d="m5 18 5-10.5 6 4.5 3.5-6.5" />
      <circle cx="5" cy="18" r="1.6" />
      <circle cx="10" cy="7.5" r="1.6" />
      <circle cx="16" cy="12" r="1.6" />
      <circle cx="19.5" cy="5.5" r="1.6" />
    </>
  ),
  timeline: (
    <>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M8 3.5v2.8l4 5.7 4-5.7V3.5M8 20.5v-2.8l4-5.7 4 5.7v2.8" />
    </>
  ),
  event: <path d="M13.5 3 5.5 13.5h6L10.5 21l8-10.5h-6Z" />,
  recap: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" />
      <path d="M4.5 4.5V9H9" />
      <path d="M12 8v4l2.8 1.8" />
    </>
  ),
  lifeform: (
    <>
      <path d="M6 18.5c0-7.5 4.5-12.5 13-13-.5 8.5-5.5 13-13 13Z" />
      <path d="M6 18.5 13 11.5" />
    </>
  ),
  character: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" />
    </>
  ),
}

export function SearchIcon({ name }: { name: IconName }) {
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
