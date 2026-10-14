import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { systems } from './data/systems'
import { routes } from './routes'

const renderAt = (path: string) =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )

describe('routes', () => {
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

  it('shows not found for unknown systems', () => {
    renderAt('/systems/nope')
    expect(screen.getByText(/Lost in the Cognitive Realm/)).toBeInTheDocument()
  })
})
