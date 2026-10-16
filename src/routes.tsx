import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { comingSoonTabs } from './navigation'
import { BookDetail } from './routes/BookDetail'
import { Books } from './routes/Books'
import { CharacterDetail } from './routes/CharacterDetail'
import { CharacterList } from './routes/CharacterList'
import { ComingSoon } from './routes/ComingSoon'
import { LocationDetail } from './routes/LocationDetail'
import { LocationList } from './routes/LocationList'
import { NotFound } from './routes/NotFound'
import { PlanetDetail } from './routes/PlanetDetail'
import { RouteError } from './routes/RouteError'
import { SearchPage } from './routes/SearchPage'
import { StarMap } from './routes/StarMap'
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
      { path: 'locations', element: <LocationList /> },
      { path: 'search', element: <SearchPage /> },
      ...comingSoonTabs.map((tab) => ({
        path: tab.path.slice(1),
        element: <ComingSoon tab={tab} />,
      })),
      { path: '*', element: <NotFound /> },
    ],
  },
]
