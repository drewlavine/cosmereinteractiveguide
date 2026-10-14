import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (path: string, read: string[]) => {
  localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(read))
  return render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const planetNames = () =>
  screen
    .queryAllByRole('link', { name: /: view details$/ })
    .map((link) =>
      link.getAttribute('aria-label')?.replace(': view details', ''),
    )

describe('spoilers', () => {
  it('shows an empty star map that asks for books read', async () => {
    const { container } = renderAt('/', [])
    expect(container.querySelector('.chart-system')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose Books Read' }),
    )
    expect(screen.getByRole('dialog', { name: 'Books Read' })).toHaveAttribute(
      'open',
    )
  })

  it('charts only the systems the reader has reached', () => {
    renderAt('/', ['final-empire'])
    expect(
      screen.getByRole('link', { name: 'Scadrian System' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Rosharan System' }),
    ).not.toBeInTheDocument()
  })

  it('hides star chart details until Arcanum Unbounded, unless viewed anyway', async () => {
    renderAt('/systems/scadrian', ['final-empire'])
    expect(planetNames()).toEqual(['Scadrial'])
    const notice = screen.getByRole('complementary', { name: 'Spoilers' })
    expect(notice).toHaveTextContent(/Spoilers hidden for .*Arcanum Unbounded/)

    await userEvent.click(screen.getByRole('button', { name: 'View anyway' }))
    expect(planetNames()).toContain('Aagal Nod')
    expect(notice).toHaveTextContent(/Showing spoilers for/)

    await userEvent.click(screen.getByRole('button', { name: 'Hide again' }))
    expect(planetNames()).toEqual(['Scadrial'])
  })

  it('stands in for a system the reader has not reached', async () => {
    renderAt('/systems/rosharan', ['final-empire'])
    expect(screen.getByText('Not yet charted')).toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Spoilers' }),
    ).toHaveTextContent('The Way of Kings')

    await userEvent.click(screen.getByRole('button', { name: 'View anyway' }))
    expect(planetNames()).toContain('Roshar')
  })

  it('lists only the stories set on a planet that the reader has read', () => {
    renderAt('/systems/scadrian/planets/scadrial', [
      'final-empire',
      'arcanum-unbounded',
    ])
    const stories = screen.getByText('Stories set here').nextElementSibling
    expect(stories).toHaveTextContent(
      /^Mistborn: The Final Empire, The Eleventh Metal, Allomancer Jak and the Pits of Eltania, Mistborn: Secret History$/,
    )
    expect(
      screen.getByRole('complementary', { name: 'Spoilers' }),
    ).toHaveTextContent('The Well of Ascension')
  })

  it('lists books that mention a planet once the reader has read them', () => {
    renderAt('/systems/rosharan/planets/roshar', ['way-of-kings'])
    expect(screen.queryByText('Mentioned in')).not.toBeInTheDocument()
  })

  it('lists a read book that mentions a planet without being set there', () => {
    renderAt('/systems/rosharan/planets/roshar', ['way-of-kings', 'sunlit-man'])
    expect(
      screen.getByText('Mentioned in').nextElementSibling,
    ).toHaveTextContent(/^The Sunlit Man$/)
    expect(
      screen.getByText('Stories set here').nextElementSibling,
    ).toHaveTextContent(/^The Way of Kings$/)
  })

  it('stands in for a planet the reader has not reached', () => {
    renderAt('/systems/rosharan/planets/braize', ['way-of-kings'])
    expect(screen.getByText('Not yet charted')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Braize' }),
    ).not.toBeInTheDocument()
  })

  it('counts unread maps among a planet’s spoilers and shows them anyway', async () => {
    renderAt('/systems/rosharan/planets/roshar', ['way-of-kings'])
    const notice = screen.getByRole('complementary', { name: 'Spoilers' })
    expect(notice).toHaveTextContent('Words of Radiance')
    expect(screen.queryByText('Sea of Souls')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'View anyway' }))
    expect(screen.getAllByText('Sea of Souls')).not.toHaveLength(0)
  })
})
