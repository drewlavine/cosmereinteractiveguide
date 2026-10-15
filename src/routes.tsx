import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { LocationDetail } from './routes/LocationDetail'
import { NotFound } from './routes/NotFound'
import { PlanetDetail } from './routes/PlanetDetail'
import { RouteError } from './routes/RouteError'
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
      { path: '*', element: <NotFound /> },
    ],
  },
]
