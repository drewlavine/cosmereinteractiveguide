import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { AtlasMap } from '../data/journey'
import { journeyByWorld, type ShownJourney } from '../data/reveal'
import { TravelMap } from './TravelMap'
import { BooksReadProvider } from './BooksReadProvider'

const map = (id: string, title: string): AtlasMap => ({
  id,
  title,
  image: { src: `${id}.jpg`, width: 1000, height: 500, alt: 'Map' },
  credit: { text: 'Map' },
  revealedIn: [],
})
const city = {
  ...map('city', 'Citytown'),
  parent: { mapId: 'r', at: [5, 5] as const },
}

const journey: ShownJourney = {
  maps: [map('r', 'Roshar map'), city, map('s', 'Scadrial map')],
  credits: [],
  spoilers: false,
  stops: [
    { id: 'a', mapId: 'r', path: [[1, 1]], approximate: false, summary: [] },
    { id: 'b', mapId: 'city', path: [[2, 2]], approximate: false, summary: [] },
    { id: 'c', mapId: 's', path: [[3, 3]], approximate: false, summary: [] },
  ],
}
const worldOf = (id: string) =>
  ({ r: 'roshar', city: 'roshar', s: 'scadrial' })[id]

describe('journeyByWorld', () => {
  it('cuts a journey into one per world, with only its own maps', () => {
    const parts = journeyByWorld(journey, worldOf)
    expect(Object.keys(parts)).toEqual(['roshar', 'scadrial'])
    expect(parts.roshar.stops.map((s) => s.id)).toEqual(['a', 'b'])
    expect(parts.roshar.maps.map((m) => m.id)).toEqual(['r', 'city'])
    expect(parts.scadrial.maps.map((m) => m.id)).toEqual(['s'])
  })
})

describe('TravelMap', () => {
  it('zooms in to a world with a journey, and back out to the stars', async () => {
    const parts = journeyByWorld(journey, worldOf)
    render(
      <RouterProvider
        router={createMemoryRouter(
          [
            {
              path: '/',
              element: (
                <BooksReadProvider>
                  <TravelMap
                    characterId="hoid"
                    name="Hoid"
                    systems={[]}
                    stops={[
                      { planetId: 'nalthis', events: [] },
                      { planetId: 'roshar', events: [] },
                    ]}
                    worldJourneys={{ roshar: parts.roshar }}
                  />
                </BooksReadProvider>
              ),
            },
          ],
          { initialEntries: ['/'] },
        )}
      />,
    )
    // No journey on the first world: nothing to zoom into.
    expect(screen.queryByRole('button', { name: /^Zoom in/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Next stop' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in to Roshar' }))
    expect(
      await screen.findByRole('group', { name: 'Hoid’s journey' }),
    ).toBeInTheDocument()
    expect(document.querySelector('.journey-heading')).toHaveTextContent(
      'Roshar map',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back to the stars' }))
    expect(screen.queryByRole('group', { name: 'Hoid’s journey' })).toBeNull()
    expect(document.querySelector('.travel-card')).toHaveTextContent('Roshar')
  })
})
