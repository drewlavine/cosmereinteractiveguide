import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { mapLabels } from '../data/mapLabels'
import { planetMaps } from '../data/maps'
import { routes } from '../routes'
import { BOOKS_READ_KEY } from '../state/booksRead'

const renderAt = (path: string, read: string[]) => {
  localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(read))
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}
const SEL = '/systems/selish/planets/sel'

const mapRegion = () => screen.getByRole('region', { name: /interactive map$/ })

describe('interactive map', () => {
  it('is left out for planets without clickable maps', () => {
    renderAt('/systems/threnodite/planets/threnody', ['shadows-for-silence'])
    expect(
      screen.queryByRole('heading', { name: 'Interactive map' }),
    ).not.toBeInTheDocument()
  })

  it('is hidden until the map’s book is read', () => {
    renderAt(SEL, ['emperors-soul'])
    expect(
      screen.queryByRole('heading', { name: 'Interactive map' }),
    ).not.toBeInTheDocument()
  })

  it('links places on the map and in the list to their pages', async () => {
    renderAt(SEL, ['elantris'])
    expect(
      within(mapRegion()).getByRole('link', { name: 'Arelon' }),
    ).toHaveAttribute('href', `${SEL}/locations/arelon`)
    const list = screen.getByRole('navigation', {
      name: 'Places on the Opelon map',
    })
    expect(
      within(list)
        .getAllByRole('heading')
        .map((h) => h.textContent),
    ).toEqual(['Continent', 'Nations', 'Cities', 'Landmarks'])
    expect(within(list).getByRole('link', { name: 'Svorden' })).toHaveAttribute(
      'href',
      `${SEL}/locations/svorden`,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Arelon' }))
    expect(
      within(mapRegion()).getByRole('link', { name: 'Kondeon' }),
    ).toBeInTheDocument()

    const kae = within(mapRegion()).getByRole('link', { name: 'Kae' })
    await userEvent.click(kae)
    expect(
      await screen.findByRole('heading', { name: 'Kae' }),
    ).toBeInTheDocument()
  })

  it('lights a place’s printed name when it is hovered', async () => {
    renderAt('/systems/rosharan/planets/roshar', ['way-of-kings'])
    const alethkar = within(mapRegion()).getByRole('link', { name: 'Alethkar' })
    const name = alethkar.querySelector('.map-label-hit')
    expect(name).not.toBeNull()
    // Only the name is pointed at: its region isn't drawn as a target.
    expect(alethkar.querySelector('polygon, circle')).toBeNull()
    expect(mapRegion().querySelector('.map-label-ink')).toBeNull()

    await userEvent.hover(name!)
    const ink = mapRegion().querySelector('.map-label-ink')
    expect(ink?.querySelectorAll('path')).toHaveLength(
      mapLabels['Roshar.jpg'].bands.alethkar.length,
    )
    // The printed name stands in for the floating label.
    expect(
      mapRegion().querySelector('.map-hotspot-label'),
    ).not.toBeInTheDocument()
  })
})

describe('map labels', () => {
  it('only name places marked on their map', () => {
    for (const [file, labels] of Object.entries(mapLabels)) {
      const version = Object.values(planetMaps)
        .flat()
        .flatMap((m) => m.versions)
        .find((v) => v.file === file)
      expect(version, file).toBeDefined()
      const marked = new Set(version!.hotspots?.map((h) => h.locationId))
      expect(
        Object.keys(labels.bands).filter((id) => !marked.has(id)),
        file,
      ).toEqual([])
    }
  })
})

describe('location page', () => {
  it('shows a place with its parent, stories and spoiler-free summary', () => {
    renderAt(`${SEL}/locations/svorden`, ['elantris'])
    expect(screen.getByRole('heading', { name: 'Svorden' })).toBeInTheDocument()
    expect(screen.getByText('Type').nextElementSibling).toHaveTextContent(
      'Nation',
    )
    expect(screen.getByText('Located in').nextElementSibling).toHaveTextContent(
      'Sycla',
    )
    expect(screen.queryByText(/Rose Empire/)).not.toBeInTheDocument()
    expect(screen.queryByText('Mentioned in')).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Spoilers' }),
    ).toHaveTextContent('Some information hidden due to spoilers.')
  })

  it('adds what later books reveal once they are read', () => {
    renderAt(`${SEL}/locations/svorden`, ['elantris', 'emperors-soul'])
    expect(screen.getByText(/Rose Empire/)).toBeInTheDocument()
    expect(
      screen.getByText('Mentioned in').nextElementSibling,
    ).toHaveTextContent(/^The Emperor’s Soul$/)
  })

  it('lists the places within it', () => {
    renderAt(`${SEL}/locations/arelon`, ['elantris'])
    const here = screen.getByText('Places here')
      .nextElementSibling as HTMLElement
    expect(within(here).getByRole('link', { name: 'Kae' })).toHaveAttribute(
      'href',
      `${SEL}/locations/kae`,
    )
    expect(
      screen.getByText('Stories set here').nextElementSibling,
    ).toHaveTextContent(/^Elantris$/)
  })

  it('stands in for a place the reader has not reached', async () => {
    renderAt(`${SEL}/locations/kae`, ['emperors-soul'])
    expect(screen.getByText('Not yet charted')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Show anyway' }))
    expect(screen.getByRole('heading', { name: 'Kae' })).toBeInTheDocument()
  })

  it('is not found for an unknown place', () => {
    renderAt(`${SEL}/locations/luthadel`, ['elantris'])
    expect(
      screen.queryByRole('heading', { name: 'Luthadel' }),
    ).not.toBeInTheDocument()
  })
})
