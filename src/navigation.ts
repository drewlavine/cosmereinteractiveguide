import { findPersona } from './data/reveal'
import type { IconName } from './search/types'

/**
 * Main navigation sections shown in the side nav, in display order.
 *
 * To add a tab (e.g. "Locations"):
 * 1. Add an entry below with a unique `id`, its `label`, a side-nav `icon`
 *    (drawn in `SearchIcon.tsx`), the root `path` the
 *    tab links to, and `isActive`, which says whether the tab is highlighted
 *    for a given pathname (usually `underPath('/locations')`).
 * 2. Add the tab's routes as children of the layout route in `routes.tsx`.
 *
 * A tab with `comingSoon` set gets a placeholder page at its `path`
 * automatically; remove `comingSoon` once its real routes exist.
 */
export interface MainTab {
  id: string
  label: string
  /** Starts a new group in the side nav, under this heading. */
  group?: string
  /** Its icon in the side nav. */
  icon: IconName
  /** The tab's root URL, where its link goes. */
  path: string
  /** Whether the tab is the current section for this pathname. */
  isActive: (pathname: string) => boolean
  /** Placeholder text for a section that isn't built yet. */
  comingSoon?: string
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
    group: 'Explore the Cosmere',
    icon: 'star-map',
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
    icon: 'book',
    path: '/books',
    isActive: underPath('/books'),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: 'timeline',
    path: '/timeline',
    isActive: underPath('/timeline'),
  },
  {
    id: 'characters',
    label: 'Characters',
    group: 'People & powers',
    icon: 'character',
    path: '/characters',
    isActive: underPath('/characters'),
  },
  {
    id: 'abilities',
    label: 'Magic',
    icon: 'ability',
    path: '/magic',
    isActive: underPath('/magic'),
  },
  {
    id: 'culture',
    label: 'Culture',
    icon: 'culture',
    path: '/culture',
    isActive: underPath('/culture'),
  },
  {
    id: 'locations',
    label: 'Locations',
    group: 'World',
    icon: 'place',
    path: '/locations',
    isActive: (pathname) =>
      underPath('/locations')(pathname) || isStarMapPlace(pathname),
  },
  {
    id: 'lifeforms',
    label: 'Lifeforms',
    icon: 'lifeform',
    path: '/lifeforms',
    isActive: underPath('/lifeforms'),
  },
  {
    id: 'events',
    label: 'Events',
    group: 'History',
    icon: 'event',
    path: '/events',
    isActive: underPath('/events'),
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
