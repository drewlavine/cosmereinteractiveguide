import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { characters } from './data/characters'
import { routes } from './routes'

const renderAt = (path: string) =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )

describe('characters pages', () => {
  it('lists every character, grouped by letter', () => {
    renderAt('/characters')
    const list = screen.getByRole('article', { name: 'Characters' })
    expect(within(list).getByRole('link', { name: 'Kaladin' })).toHaveAttribute(
      'href',
      '/characters/kaladin',
    )
    const kGroup = screen.getByRole('region', { name: 'K' })
    expect(
      within(kGroup).getByRole('link', { name: 'Kaladin' }),
    ).toBeInTheDocument()
    expect(
      list.querySelectorAll('.character-group a[href^="/characters/"]'),
    ).toHaveLength(characters.length)
  })

  it('opens a character page from the list', async () => {
    renderAt('/characters')
    await userEvent.click(screen.getByRole('link', { name: 'Vin' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Vin' }),
    ).toBeInTheDocument()
  })

  it('shows a character name, placeholder and Coppermind link', () => {
    renderAt('/characters/blackthorn')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Blackthorn' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Details coming soon.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /on the Coppermind/ }),
    ).toHaveAttribute('href', 'https://coppermind.net/wiki/Blackthorn_(spren)')
    expect(
      screen.getByRole('link', { name: 'Back to all characters' }),
    ).toHaveAttribute('href', '/characters')
  })

  it('shows not found for unknown characters', () => {
    renderAt('/characters/nobody-at-all')
    expect(screen.getByText(/Lost in the Cognitive Realm/)).toBeInTheDocument()
  })
})
