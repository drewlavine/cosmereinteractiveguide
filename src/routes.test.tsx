import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { books } from './data/books'
import { systems } from './data/systems'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (path: string) =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )

describe('routes', () => {
  // A reader who has read everything sees every system in full.
  beforeEach(() =>
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify(books.map((b) => b.id)),
    ),
  )

  it('lists every system on the star map', () => {
    renderAt('/')
    for (const system of systems) {
      expect(
        screen.getByRole('link', { name: system.name }),
      ).toBeInTheDocument()
    }
    expect(new Set(systems.map((s) => s.id)).size).toBe(systems.length)
  })

  it('navigates from the star map to a system and shows its info panel', async () => {
    renderAt('/')
    await userEvent.click(screen.getByRole('link', { name: /Rosharan System/ }))
    const panel = await screen.findByRole('complementary', {
      name: 'System information',
    })
    expect(panel).toHaveTextContent('Rosharan System')
    expect(
      screen.getByRole('link', { name: 'Roshar: view details' }),
    ).toBeInTheDocument()
  })

  it('shows all 13 Rosharan planets in order with the asteroid belt', () => {
    renderAt('/systems/rosharan')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual([
      'Ashyn',
      'Roshar',
      'Braize',
      'Jes',
      'Nan',
      'Chach',
      'Vev',
      'Palah',
      'Shash',
      'Betab',
      'Kak',
      'Tanat',
      'Ishi',
    ])
    expect(screen.getByText('Between Braize and Jes')).toBeInTheDocument()
  })

  it('starts with the system info panel collapsed and toggles it', async () => {
    renderAt('/systems/rosharan')
    const details = screen
      .getByRole('complementary', { name: 'System information' })
      .querySelector('details')!
    expect(details.open).toBe(false)
    await userEvent.click(
      screen.getByRole('heading', { name: 'Rosharan System' }),
    )
    expect(details.open).toBe(true)
    await userEvent.click(
      screen.getByRole('heading', { name: 'Rosharan System' }),
    )
    expect(details.open).toBe(false)
  })

  it('shows planet details', () => {
    renderAt('/systems/rosharan/planets/roshar')
    expect(screen.getByRole('heading', { name: 'Roshar' })).toBeInTheDocument()
    expect(screen.getByText('Salas, Nomon, Mishim')).toBeInTheDocument()
  })

  it('shows the Selish bodies in order with both belts', async () => {
    renderAt('/systems/selish')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual(['Donne', 'Sel', 'Ky', 'Ralen', 'Dwarf planet'])
    expect(screen.getAllByText('Sel / Seol')).not.toHaveLength(0)
    expect(screen.getAllByText('comet belt')).not.toHaveLength(0)
    expect(screen.getByText('4 (plus 1 dwarf planet)')).toBeInTheDocument()
  })

  it('shows alternate names, unnamed moons and rings on planet details', () => {
    renderAt('/systems/selish/planets/ralen')
    expect(screen.getByText('Also called Raa')).toBeInTheDocument()
    expect(screen.getByText('5 unnamed moons')).toBeInTheDocument()
    expect(screen.getByText('Rings')).toBeInTheDocument()
  })

  it('paints the planet page globe like the chart, rings and all', () => {
    const { container } = renderAt('/systems/selish/planets/ralen')
    const globe = container.querySelector('svg.planet-detail-globe')
    expect(globe).not.toBeNull()
    // Banded gas giant whose ring passes behind and then in front of it,
    // each half inked over a pale edge.
    expect(globe?.querySelector('filter[id$="-brush"]')).not.toBeNull()
    expect(
      globe?.querySelectorAll('g[transform^="rotate"] > path'),
    ).toHaveLength(4)
  })

  it('shows the Threnodite planets in order', () => {
    renderAt('/systems/threnodite')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual(['Monody', 'Elegy', 'Threnody', 'Purity'])
  })

  it('lists Coronach as the moon of Elegy', () => {
    renderAt('/systems/threnodite/planets/elegy')
    expect(screen.getAllByText(/Coronach/)).not.toHaveLength(0)
  })

  it('shows UTol and Komashi as a double planet', () => {
    renderAt('/systems/utol')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual(['UTol', 'Komashi'])
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('draws the Taldain binary system and links to the planet', async () => {
    renderAt('/systems/taldain')
    expect(screen.getAllByText('The Particulate Ring')).not.toHaveLength(0)
    expect(screen.getByText('Nizh Da')).toBeInTheDocument()
    expect(screen.getByText('Stars')).toBeInTheDocument()
    expect(screen.getByText(/^AisDa/)).toBeInTheDocument()
    expect(screen.getByText(/^The Eye of Ridos/)).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('link', { name: 'Taldain: view details' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Taldain' }),
    ).toBeInTheDocument()
  })

  it('charts Yolen as the only known Yolish planet', async () => {
    renderAt('/systems/yolish')
    expect(
      screen.getAllByRole('link', { name: /: view details$/ }),
    ).toHaveLength(1)

    await userEvent.click(
      screen.getByRole('link', { name: 'Yolen: view details' }),
    )
    expect(
      await screen.findByText(/where Adonalsium was Shattered/),
    ).toBeInTheDocument()
  })

  it('charts all seven Drominad planets around the asteroid belt', () => {
    renderAt('/systems/drominad')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual(
      ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'].map(
        (n) => `${n} of the Sun`,
      ),
    )
    expect(screen.getAllByText('asteroid belt')).not.toHaveLength(0)
    expect(screen.getByText('First of the First')).toBeInTheDocument()
  })

  it('charts the Nalthian system with its comet belt and cognitive anomaly', () => {
    renderAt('/systems/nalthian')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual([
      'Nalthis',
      'Farkeeper the Bright',
      'Nightstar the Hidden',
    ])
    expect(screen.getAllByText('comet belt')).not.toHaveLength(0)
    expect(screen.getByText('Rrendos')).toBeInTheDocument()
    expect(screen.getByText('Anomaly')).toBeInTheDocument()
  })

  it('charts both of Scadrial’s orbits', () => {
    renderAt('/systems/scadrian')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual([
      'Scadrial',
      'Aagal Nod',
      'Aagal Uch',
      'Inner dwarf planet',
      'Outer dwarf planet',
    ])
    for (const text of [
      'Scadrial New Orbit',
      'New Calendar',
      'Old Orbit',
      'Old Calendar',
    ])
      expect(screen.getAllByText(text)).not.toHaveLength(0)
  })

  it('charts the planets with no known system, with no sun or orbits', async () => {
    const { container } = renderAt('/systems/uncharted')
    const names = screen
      .getAllByRole('link', { name: /: view details$/ })
      .map((link) =>
        link.getAttribute('aria-label')?.replace(': view details', ''),
      )
    expect(names).toEqual([
      'Canticle',
      'Grand Apparatus',
      'Dhatri',
      'Lumar',
      'Miral',
    ])
    expect(container.querySelector('#orbit-arc-uncharted-1')).toBeNull()
    expect(
      screen.getAllByText('each world orbits its own unknown star'),
    ).not.toHaveLength(0)

    await userEvent.click(
      screen.getByRole('link', { name: 'Lumar: view details' }),
    )
    expect(
      await screen.findByText(/^Emerald, Sunlight, .*4 more unnamed moons$/),
    ).toBeInTheDocument()
  })

  it('shows not found for unknown systems', () => {
    renderAt('/systems/nope')
    expect(screen.getByText(/Lost in the Cognitive Realm/)).toBeInTheDocument()
  })
})
