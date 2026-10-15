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
 * automatically; remove `comingSoon` once its real routes exist.
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
}

/** Matches each path itself and everything below it. */
export const underPath =
  (...paths: string[]) =>
  (pathname: string) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

export const mainTabs: MainTab[] = [
  {
    id: 'star-map',
    label: 'Star Map',
    path: '/',
    // Systems, planets and locations all live under the star map.
    isActive: (pathname) => pathname === '/' || underPath('/systems')(pathname),
  },
  {
    id: 'characters',
    label: 'Characters',
    path: '/characters',
    isActive: underPath('/characters'),
  },
  {
    id: 'books',
    label: 'Books',
    path: '/books',
    isActive: underPath('/books'),
  },
  {
    id: 'locations',
    label: 'Locations',
    path: '/locations',
    isActive: underPath('/locations'),
    comingSoon:
      'Browse cities, regions and landmarks across every world. For now, find them on the maps from the Star Map.',
  },
  {
    id: 'magic',
    label: 'Magic',
    path: '/magic',
    isActive: underPath('/magic'),
    comingSoon: 'The magic systems of the Cosmere and how they work.',
  },
  {
    id: 'events',
    label: 'Events',
    path: '/events',
    isActive: underPath('/events'),
    comingSoon: 'Key events across the Cosmere, in order.',
  },
]

export const comingSoonTabs = mainTabs.filter((tab) => tab.comingSoon)
