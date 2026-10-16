import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { books } from './data/books'
import { characters } from './data/characters'
import { characterDetails } from './data/characterDetails'
import { personas } from './data/reveal'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (
  path: string,
  read: string[] = [],
  reading: Record<string, string | null> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const allBooks = books.map((b) => b.id)
const characterLinks = () =>
  document.querySelectorAll('.character-group a[href^="/characters/"]')

describe('characters pages', () => {
  it('lists every character, grouped by letter', () => {
    renderAt('/characters', allBooks)
    const list = screen.getByRole('article', { name: 'Characters' })
    expect(within(list).getByRole('link', { name: 'Kaladin' })).toHaveAttribute(
      'href',
      '/characters/kaladin',
    )
    const kGroup = screen.getByRole('region', { name: 'K' })
    expect(
      within(kGroup).getByRole('link', { name: 'Kaladin' }),
    ).toBeInTheDocument()
    expect(characterLinks()).toHaveLength(characters.length)
    expect(screen.queryByText(/hidden based on books/)).toBeNull()
  })

  it('hides characters the reader has not met', () => {
    renderAt('/characters')
    const hidden = Object.keys(characterDetails).length + personas.length
    expect(characterLinks()).toHaveLength(
      characters.length + personas.length - hidden,
    )
    expect(screen.queryByRole('link', { name: 'Kaladin' })).toBeNull()
    expect(
      screen.getByText(new RegExp(`· ${hidden} hidden based on books`)),
    ).toBeInTheDocument()
    // Characters without details yet are still listed.
    expect(screen.getByRole('link', { name: 'Blackthorn' })).toBeInTheDocument()
  })

  it('shows a character once the reader reaches their first chapter', () => {
    renderAt('/characters', [], { 'way-of-kings': 'prologue' })
    expect(screen.queryByRole('link', { name: 'Kaladin' })).toBeNull()
    cleanup()
    renderAt('/characters', [], { 'way-of-kings': '1' })
    expect(screen.getByRole('link', { name: 'Kaladin' })).toBeInTheDocument()
  })

  it('shows nothing but the name of an unmet character until shown anyway', async () => {
    renderAt('/characters/kaladin')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Kaladin' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Not met yet/)).toBeInTheDocument()
    expect(screen.queryByText(/Roshar|Windrunner|Kal,/)).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Show anyway' }))
    expect(screen.queryByText(/Not met yet/)).toBeNull()
    expect(screen.getAllByText(/Windrunner/).length).toBeGreaterThan(0)
  })

  it('splits a character page into tabs, each at its own URL', async () => {
    renderAt('/characters/kaladin', allBooks)
    const tabs = screen.getByRole('navigation', { name: 'About Kaladin' })
    expect(
      within(tabs)
        .getAllByRole('link')
        .map((l) => [l.textContent, l.getAttribute('href')]),
    ).toEqual([
      ['Story', '/characters/kaladin'],
      ['Personality', '/characters/kaladin/personality'],
      ['Relationships', '/characters/kaladin/relationships'],
      ['Appearances', '/characters/kaladin/appearances'],
    ])
    expect(within(tabs).getByRole('link', { name: 'Story' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    // Key facts sit beside the tabs, whichever tab is open.
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).getByText(/Human/)).toBeInTheDocument()
    expect(within(facts).getByText('Alethi')).toBeInTheDocument()
    expect(within(facts).getByText(/Bridge Four/)).toBeInTheDocument()
    expect(within(facts).getAllByText(/Windrunner/).length).toBeGreaterThan(0)
    const story = screen.getByRole('region', { name: 'Story' })
    expect(
      within(story).getByRole('heading', { name: 'The Way of Kings' }),
    ).toBeInTheDocument()

    await userEvent.click(
      within(tabs).getByRole('link', { name: 'Appearances' }),
    )
    // Switching tabs is instant: no page transition within a character.
    const appearances = screen.getByRole('region', { name: 'Appearances' })
    expect(screen.queryByRole('region', { name: 'Story' })).toBeNull()
    const wayOfKings = within(appearances)
      .getByRole('link', { name: 'The Way of Kings' })
      .closest('li')
    expect(
      within(appearances).getByRole('link', { name: 'The Way of Kings' }),
    ).toHaveAttribute('href', '/books/way-of-kings')
    expect(wayOfKings).toHaveTextContent(/first appears in Chapter 1$/)
  })

  it('lists family ties once the books reveal them', async () => {
    const before = ['way-of-kings', 'words-of-radiance']
    renderAt('/characters/dalinar-kholin', before, { oathbringer: '3' })
    await userEvent.click(screen.getByRole('link', { name: 'Relationships' }))
    let family = screen.getByRole('region', { name: 'Relationships' })
    expect(within(family).getByText('Siblings')).toBeInTheDocument()
    expect(within(family).getByText('Gavilar')).toBeInTheDocument()
    // Dalinar and Navani marry in Oathbringer chapter 4.
    expect(within(family).queryByText('Navani')).toBeNull()
    cleanup()
    renderAt('/characters/dalinar-kholin/relationships', before, {
      oathbringer: '4',
    })
    family = screen.getByRole('region', { name: 'Relationships' })
    const spouse = within(family).getByText('Spouse').closest('div')!
    expect(
      within(spouse).getByRole('link', { name: 'Navani' }),
    ).toHaveAttribute('href', '/characters/navani-kholin')
  })

  it('keeps Zahel apart from Vasher until the reader has read both', async () => {
    const stormlight = (to: string) =>
      renderAt(to, ['way-of-kings'], { 'words-of-radiance': '44' })
    // Stormlight only: Zahel, with only what Stormlight reveals.
    stormlight('/characters/zahel')
    expect(screen.getByRole('heading', { name: 'Zahel' })).toBeInTheDocument()
    expect(screen.getByText(/Ardent, Swordmaster/)).toBeInTheDocument()
    // Nothing on the page, story included, gives him away.
    for (const spoiler of [
      /Vasher/,
      /Awakener/,
      /Awaken/,
      /Nalthis/,
      /Nightblood/,
      /Warbreaker/,
      /Worldhopper/,
    ])
      expect(screen.getByRole('article').textContent).not.toMatch(spoiler)
    await userEvent.click(screen.getByRole('link', { name: 'Appearances' }))
    expect(
      within(screen.getByRole('region', { name: 'Appearances' }))
        .getByRole('link', { name: 'Words of Radiance' })
        .closest('li'),
    ).toHaveTextContent(/first appears in Chapter 16$/)
    expect(screen.queryByRole('link', { name: 'Warbreaker' })).toBeNull()
    cleanup()
    stormlight('/characters/vasher')
    expect(screen.getByText(/Not met yet/)).toBeInTheDocument()
    cleanup()
    stormlight('/characters')
    expect(screen.getByRole('link', { name: 'Zahel' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Vasher' })).toBeNull()
    cleanup()

    // Warbreaker only: Vasher, with nothing from Stormlight.
    renderAt('/characters/vasher', ['warbreaker'])
    expect(screen.getByText(/Awakener/)).toBeInTheDocument()
    for (const spoiler of [/Zahel/, /Ardent/, /Worldhopper/])
      expect(screen.queryByText(spoiler)).toBeNull()
    cleanup()

    // Both: one page, Vasher's, with Zahel as another name.
    const both = (to: string) =>
      renderAt(to, ['warbreaker', 'way-of-kings'], {
        'words-of-radiance': '16',
      })
    both('/characters/zahel')
    expect(
      await screen.findByRole('heading', { name: 'Vasher' }),
    ).toBeInTheDocument()
    // Both main names up top; Zahel isn't buried among the minor aliases.
    expect(document.querySelector('.character-persona')).toHaveTextContent(
      'Known as Zahel in The Stormlight Archive',
    )
    expect(screen.getByText(/Also known as/)).not.toHaveTextContent('Zahel')
    expect(screen.getByText(/Worldhopper/)).toBeInTheDocument()
    expect(screen.getByText(/Ardent, Swordmaster/)).toBeInTheDocument()
    cleanup()
    both('/characters')
    expect(screen.getByRole('link', { name: 'Vasher' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Zahel' })).toBeNull()
  })

  it('hides the Relationships tab when no tie is revealed yet', () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '1' })
    expect(screen.queryByRole('link', { name: 'Relationships' })).toBeNull()
  })

  it('reveals abilities at their chapter, and sends unknown tabs to the first', async () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '56' })
    expect(screen.queryByText(/Abilities|Surgebinder/)).toBeNull()
    cleanup()
    // Kaladin learns he's a Surgebinder in chapter 57 (Coppermind footnote).
    renderAt('/characters/kaladin', [], { 'way-of-kings': '57' })
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).getByText('Surgebinder')).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Windrunner/)
    cleanup()
    renderAt('/characters/kaladin/abilities', allBooks)
    expect(
      await screen.findByRole('region', { name: 'Story' }),
    ).toBeInTheDocument()
  })

  it('shows only what the books read so far reveal', () => {
    renderAt('/characters/kaladin', ['way-of-kings'])
    expect(
      screen.getByRole('heading', { level: 1, name: 'Kaladin' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Also known as/)).toHaveTextContent('Kal')
    expect(screen.getByText(/Also known as/)).toHaveTextContent('Stormblessed')
    expect(screen.getByRole('link', { name: 'Roshar' })).toHaveAttribute(
      'href',
      '/systems/rosharan/planets/roshar',
    )
    expect(screen.getByText('Human')).toBeInTheDocument()
    // He swears a Windrunner Ideal in this book, but only becomes one in the next.
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).queryByText(/Windrunner/)).toBeNull()
    expect(screen.getByRole('article').textContent).not.toMatch(/Herald/)
    expect(screen.getByText(/Some information hidden/)).toBeInTheDocument()
  })

  it('opens a character page from the list', async () => {
    renderAt('/characters', ['final-empire'])
    await userEvent.click(screen.getByRole('link', { name: 'Vin' }))
    // The list stays while its exit transition plays.
    expect(
      screen.getByRole('article', { name: 'Characters' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: 'Vin' })).toBeNull()
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
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole(
        'link',
        { name: 'Characters' },
      ),
    ).toHaveAttribute('href', '/characters')
  })

  it('tells the story only as far as the reader has read', async () => {
    // Footnotes date his first summary to chapter 6 and his first story beat to chapter 2.
    renderAt('/characters/kaladin', [], { 'way-of-kings': '6' })
    const early = screen.getByRole('region', { name: 'Story' }).textContent
    expect(document.querySelector('.character-intro')).not.toBeNull()
    expect(
      screen.queryByRole('heading', { name: 'Words of Radiance' }),
    ).toBeNull()
    cleanup()
    renderAt('/characters/kaladin', ['way-of-kings'])
    const story = screen.getByRole('region', { name: 'Story' })
    expect(story.textContent!.length).toBeGreaterThan(early!.length)
    expect(
      screen.queryByRole('heading', { name: 'Words of Radiance' }),
    ).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Show anyway' }))
    expect(
      screen.getByRole('heading', { name: 'Words of Radiance' }),
    ).toBeInTheDocument()
  })

  it('filters the list by name and series', async () => {
    renderAt('/characters', allBooks)
    await userEvent.type(
      screen.getByRole('searchbox', { name: /Filter characters/ }),
      'kalad',
    )
    expect(screen.getByRole('link', { name: 'Kaladin' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Vin' })).toBeNull()
    await userEvent.clear(
      screen.getByRole('searchbox', { name: /Filter characters/ }),
    )
    // Other names count too.
    await userEvent.type(
      screen.getByRole('searchbox', { name: /Filter characters/ }),
      'stormblessed',
    )
    expect(screen.getByRole('link', { name: 'Kaladin' })).toBeInTheDocument()
    await userEvent.clear(
      screen.getByRole('searchbox', { name: /Filter characters/ }),
    )
    const series = screen.getByRole('group', { name: 'Series' })
    await userEvent.click(
      within(series).getByRole('button', { name: 'Standalones' }),
    )
    expect(screen.getByRole('link', { name: 'Vivenna' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Kaladin' })).toBeNull()
    expect(screen.getByText(/aren’t sorted by series yet/)).toBeInTheDocument()
  })

  it('offers only series the reader has met characters in', () => {
    renderAt('/characters', ['warbreaker'])
    const series = screen.getByRole('group', { name: 'Series' })
    expect(
      within(series)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['All series', 'Standalones'])
  })

  it('shows not found for unknown characters', () => {
    renderAt('/characters/nobody-at-all')
    expect(screen.getByText(/Lost in the Cognitive Realm/)).toBeInTheDocument()
  })
})
