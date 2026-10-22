import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { comingSoonTabs } from './navigation'
import { AbilityDetail } from './routes/AbilityDetail'
import { AbilityList } from './routes/AbilityList'
import { BookDetail } from './routes/BookDetail'
import { Books } from './routes/Books'
import { CharacterDetail } from './routes/CharacterDetail'
import { CharacterList } from './routes/CharacterList'
import { ComingSoon } from './routes/ComingSoon'
import { CultureDetail } from './routes/CultureDetail'
import { CultureList } from './routes/CultureList'
import { EventDetail } from './routes/EventDetail'
import { EventList } from './routes/EventList'
import { LifeformDetail } from './routes/LifeformDetail'
import { LifeformList } from './routes/LifeformList'
import { ListedLocationDetail } from './routes/ListedLocationDetail'
import { LocationDetail } from './routes/LocationDetail'
import { LocationList } from './routes/LocationList'
import { NotFound } from './routes/NotFound'
import { PlanetDetail } from './routes/PlanetDetail'
import { RouteError } from './routes/RouteError'
import { SearchPage } from './routes/SearchPage'
import { StarMap } from './routes/StarMap'
import { ToMagic } from './routes/ToMagic'
import { Timeline } from './routes/Timeline'
import { SystemView } from './routes/SystemView'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <StarMap /> },
      { path: 'systems/:systemId', element: <SystemView /> },
      {
        path: 'systems/:systemId/planets/:planetId',
        element: <PlanetDetail />,
      },
      {
        path: 'systems/:systemId/planets/:planetId/locations/:locationId',
        element: <LocationDetail />,
      },
      { path: 'books', element: <Books /> },
      { path: 'books/:bookId', element: <BookDetail /> },
      { path: 'characters', element: <CharacterList /> },
      { path: 'characters/:characterId', element: <CharacterDetail /> },
      {
        path: 'characters/:characterId/:tab',
        element: <CharacterDetail />,
      },
      { path: 'magic', element: <AbilityList /> },
      { path: 'magic/:abilityId', element: <AbilityDetail /> },
      // The tab was called Abilities; keep old links working.
      { path: 'abilities/*', element: <ToMagic /> },
      { path: 'abilities', element: <ToMagic /> },
      { path: 'culture', element: <CultureList /> },
      { path: 'culture/:cultureId', element: <CultureDetail /> },
      { path: 'lifeforms', element: <LifeformList /> },
      { path: 'lifeforms/:lifeformId', element: <LifeformDetail /> },
      { path: 'events', element: <EventList /> },
      { path: 'events/:eventId', element: <EventDetail /> },
      { path: 'locations', element: <LocationList /> },
      { path: 'locations/:locationId', element: <ListedLocationDetail /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'timeline', element: <Timeline /> },
      ...comingSoonTabs.map((tab) => ({
        path: tab.path.slice(1),
        element: <ComingSoon tab={tab} />,
      })),
      { path: '*', element: <NotFound /> },
    ],
  },
]
