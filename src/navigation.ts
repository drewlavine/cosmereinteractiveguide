import { findPersona } from './data/reveal'

/**
 * Main navigation tabs shown in the header, in display order.
 *
 * To add a tab (e.g. "Locations"):
 * 1. Add an entry below with a unique `id`, its `label`, the root `path` the
 *    tab links to, and `isActive`, which says whether the tab is highlighted
 *    for a given pathname (usually `underPath('/locations')`).
 * 2. Add the tab's routes as children of the layout route in `routes.tsx`.
 *
 * A tab with `comingSoon` set gets a placeholder page at its `path`
 * automatically; remove `comingSoon` once its real routes exist. Set
 * `hidden` to take a tab out of the header without dropping its page.
 */
export interface MainTab {
  id: string
  label: string
  /** The tab's root URL, where its link goes. */
  path: string
  /** Whether the tab is the current section for this pathname. */
  isActive: (pathname: string) => boolean
  /** Placeholder text for a section that isn't built yet. */
  comingSoon?: string
  /** Left out of the header for now; its page still works at `path`. */
  hidden?: boolean
}

/** Matches each path itself and everything below it. */
export const underPath =
  (...paths: string[]) =>
  (pathname: string) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

/** A place page on the star map, e.g. `/systems/x/planets/y/locations/z`. */
const isStarMapPlace = (pathname: string) =>
  /^\/systems\/[^/]+\/planets\/[^/]+\/locations\//.test(pathname)

export const mainTabs: MainTab[] = [
  {
    id: 'star-map',
    label: 'Star Map',
    path: '/',
    // Systems and planets live under the star map; their places belong to
    // the Locations tab.
    isActive: (pathname) =>
      pathname === '/' ||
      (underPath('/systems')(pathname) && !isStarMapPlace(pathname)),
  },
  {
    id: 'books',
    label: 'Books',
    path: '/books',
    isActive: underPath('/books'),
  },
  {
    id: 'characters',
    label: 'Characters',
    path: '/characters',
    isActive: underPath('/characters'),
  },
  {
    id: 'locations',
    label: 'Locations',
    path: '/locations',
    isActive: (pathname) =>
      underPath('/locations')(pathname) || isStarMapPlace(pathname),
  },
  {
    id: 'abilities',
    label: 'Abilities',
    path: '/abilities',
    isActive: underPath('/abilities'),
  },
  {
    id: 'culture',
    label: 'Culture',
    path: '/culture',
    isActive: underPath('/culture'),
  },
  {
    id: 'events',
    label: 'Events',
    path: '/events',
    isActive: underPath('/events'),
    comingSoon: 'Key events across the Cosmere, in order.',
    hidden: true,
  },
]

export const comingSoonTabs = mainTabs.filter((tab) => tab.comingSoon)

/**
 * The page a URL belongs to, for page transitions. Tabs within one entity's
 * page (e.g. `/characters/kaladin/abilities`) are the same page, so
 * switching tabs is instant instead of replaying the page transition. So is
 * a persona's page, which turns into its character's (Zahel into Vasher).
 */
export const pageKey = (pathname: string) => {
  const id = pathname.match(/^\/characters\/([^/]+)/)?.[1]
  if (id === undefined) return pathname
  return `/characters/${findPersona(id)?.characterId ?? id}`
}
