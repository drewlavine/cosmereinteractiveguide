import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { books } from '../data/books'
import { routes } from '../routes'
import { BOOKS_READ_KEY } from '../state/booksRead'

const renderApp = () =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: ['/'] })}
    />,
  )

const savedBooks = () =>
  JSON.parse(localStorage.getItem(BOOKS_READ_KEY) ?? 'null') as string[] | null

describe('Books Read', () => {
  it('asks first-time visitors and remembers that they answered', async () => {
    localStorage.clear()
    renderApp()
    const dialog = screen.getByRole('dialog', { name: 'Books Read' })
    expect(dialog).toHaveAttribute('open')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }))
    expect(dialog).not.toHaveAttribute('open')
    expect(savedBooks()).toEqual([])
  })

  it('stays closed for returning readers until the header button is pressed', async () => {
    renderApp()
    const dialog = document.querySelector<HTMLDialogElement>(
      'dialog.books-read-dialog',
    )!
    expect(dialog).not.toHaveAttribute('open')

    await userEvent.click(screen.getByRole('button', { name: /^Books Read/ }))
    expect(dialog).toHaveAttribute('open')
    expect(
      within(dialog).getAllByRole('checkbox', { name: /^(?!All of)/ }),
    ).toHaveLength(books.length)
  })

  it('ticks single books and whole series, and saves the choice', async () => {
    renderApp()
    await userEvent.click(screen.getByRole('button', { name: /^Books Read/ }))

    await userEvent.click(
      screen.getByRole('checkbox', { name: /The Way of Kings/ }),
    )
    expect(savedBooks()).toEqual(['way-of-kings'])
    const stormlight = screen.getByRole('checkbox', {
      name: 'All of The Stormlight Archive',
    })
    expect(stormlight).not.toBeChecked()
    expect((stormlight as HTMLInputElement).indeterminate).toBe(true)

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'All of Mistborn (Era 1)' }),
    )
    expect(savedBooks()).toHaveLength(6)
    expect(
      screen.getByRole('button', { name: /^Books Read.*6 of 35 read/ }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(savedBooks()).toEqual([])
    await userEvent.click(screen.getByRole('button', { name: 'Select all' }))
    expect(savedBooks()).toHaveLength(books.length)
  })
})
