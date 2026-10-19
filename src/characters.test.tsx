import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { books } from './data/books'
import { characters } from './data/characters'
import { characterDetails } from './data/characterDetails'
import { characterPortraits } from './data/characterPortraits'
import { loadStory, storyIds } from './data/characterStories'
import { loadPack } from './data/journeyPacks'
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
  document.querySelectorAll(
    '.character-group a[href^="/characters/"]:not(.feature-link)',
  )

describe('character stories', () => {
  // Runs before the stories below are preloaded.
  it('loads a story when its page opens, at the old tab asked for', async () => {
    renderAt('/characters/kaladin/description', ['way-of-kings'])
    expect(
      // Loading the story is slow when the whole suite runs at once.
      await screen.findByRole(
        'region',
        { name: 'Description' },
        { timeout: 5000 },
      ),
    ).toHaveTextContent(/surgeon/)
  })
})

describe('characters pages', () => {
  beforeAll(() => Promise.all([...storyIds.map(loadStory), loadPack('roshar')]))

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

  it('puts a character on one page of sections, with a Contents', async () => {
    renderAt('/characters/kaladin', allBooks)
    const main = document.querySelector('.character-main') as HTMLElement
    expect(
      within(main)
        .getAllByRole('heading', { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(['Journey', 'History', 'Description', 'Appearances'])
    // Key facts sit beside the sections.
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).getByText(/Human/)).toBeInTheDocument()
    expect(within(facts).getByText('Alethi')).toBeInTheDocument()
    expect(within(facts).getByText(/Bridge Four/)).toBeInTheDocument()
    expect(within(facts).getAllByText(/Windrunner/).length).toBeGreaterThan(0)
    // His life in in-world order, like the Coppermind's History.
    const history = screen.getByRole('region', { name: 'History' })
    expect(
      within(history)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
        .slice(0, 4),
    ).toEqual(['Early life', "Amaram's army", 'Slavery', 'Bridgeman'])
    const appearances = screen.getByRole('region', { name: 'Appearances' })
    const wayOfKings = within(appearances)
      .getByRole('link', { name: 'The Way of Kings' })
      .closest('li')
    expect(
      within(appearances).getByRole('link', { name: 'The Way of Kings' }),
    ).toHaveAttribute('href', '/books/way-of-kings')
    expect(wayOfKings).toHaveTextContent(/first appears in Chapter 1$/)

    // The Contents lists each section, and the history's parts under it.
    const contents = await screen.findByRole('navigation', { name: 'Contents' })
    const links = within(contents)
      .getAllByRole('link')
      .map((l) => [l.textContent, l.getAttribute('href')])
    expect(links.slice(0, 4)).toEqual([
      ['(Top)', '#top'],
      ['Journey', '#journey'],
      ['History', '#history'],
      ['Early life', '#history-early-life'],
    ])
    expect(links).toContainEqual(['Appearances', '#appearances'])
    expect(links).toContainEqual(['Personality', '#description-personality'])

    // A section folds away from its heading.
    const toggle = within(history).getByRole('button', { name: 'History' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(history).queryByText(/Bridgeman/)).not.toBeVisible()
    // Following its Contents link opens it again.
    await userEvent.click(
      within(contents).getByRole('link', { name: 'Slavery' }),
    )
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // The part jumped to is marked, with its section, until the reader scrolls.
    const marked = () =>
      within(contents)
        .getAllByRole('link')
        .filter((l) => l.getAttribute('aria-current'))
        .map((l) => l.textContent)
    expect(marked()).toEqual(['History', 'Slavery'])
    await userEvent.click(
      within(contents).getByRole('link', { name: 'Appearances' }),
    )
    expect(marked()).toEqual(['Appearances'])

    // Scrolled to the very bottom, the last section is the one marked.
    const scroller = document.querySelector('.app-main') as HTMLElement
    for (const [key, value] of Object.entries({
      scrollHeight: 3000,
      clientHeight: 800,
      scrollTop: 2200,
    }))
      Object.defineProperty(scroller, key, { configurable: true, value })
    await userEvent.click(within(contents).getByRole('link', { name: '(Top)' }))
    expect(marked()).toEqual(['(Top)'])
    fireEvent.wheel(scroller)
    fireEvent.scroll(scroller)
    await waitFor(() => expect(marked()).toEqual(['Appearances']))
  })

  it('lists only what is shown in the Contents', async () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '6' })
    const contents = await screen.findByRole('navigation', { name: 'Contents' })
    expect(
      within(contents)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual([
      '(Top)',
      'Journey',
      'History',
      'Slavery',
      'Bridgeman',
      'Appearances',
    ])
  })

  it('lists close family in the key facts once the books reveal them', () => {
    const before = ['way-of-kings', 'words-of-radiance']
    renderAt('/characters/dalinar-kholin', before, { oathbringer: '3' })
    let facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).getByText('Sibling')).toBeInTheDocument()
    expect(within(facts).getByText(/Gavilar/)).toBeInTheDocument()
    // Dalinar and Navani marry in Oathbringer chapter 4.
    expect(within(facts).queryByText('Navani')).toBeNull()
    cleanup()
    // The old Relationships tab's URL goes to the first tab.
    renderAt('/characters/dalinar-kholin/relationships', before, {
      oathbringer: '4',
    })
    facts = screen.getByRole('complementary', { name: 'Key facts' })
    const spouse = within(facts).getByText('Spouse').nextElementSibling!
    expect(
      within(spouse as HTMLElement).getByRole('link', { name: 'Navani' }),
    ).toHaveAttribute('href', '/characters/navani-kholin')
    expect(screen.getByRole('region', { name: 'History' })).toBeInTheDocument()
  })

  it('lets phones collapse the key facts', async () => {
    renderAt('/characters/kaladin', allBooks)
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    const toggle = within(facts).getByRole('button', { name: 'Key facts' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(facts).toHaveClass('collapsed')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(facts).not.toHaveClass('collapsed')
  })

  it('splits Description into Appearance and Personality', async () => {
    renderAt('/characters/kaladin/description', allBooks)
    const panel = await screen.findByRole('region', { name: 'Description' })
    expect(
      within(panel)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Appearance', 'Personality'])
    expect(within(panel).getByText(/slave brands/)).toBeInTheDocument()
  })

  it('keeps Zahel apart from Vasher until the reader has read both', async () => {
    const stormlight = (to: string) =>
      renderAt(to, ['way-of-kings'], { 'words-of-radiance': '44' })
    // Stormlight only: Zahel, with only what Stormlight reveals.
    stormlight('/characters/zahel')
    expect(screen.getByRole('heading', { name: 'Zahel' })).toBeInTheDocument()
    expect(screen.getByText(/Ardent, Swordmaster/)).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'History' }))
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Ardent and swordmaster'])
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
    for (const spoiler of [/Zahel/, /Ardent/, /Worldhopper/, /Roshar/])
      expect(screen.getByRole('article').textContent).not.toMatch(spoiler)
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
    // His history runs from Nalthis to Roshar once both are read.
    renderAt('/characters/vasher', [
      'warbreaker',
      'way-of-kings',
      'words-of-radiance',
    ])
    expect(
      within(screen.getByRole('region', { name: 'History' }))
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Becoming a Returned', 'The Manywar', "In T'Telir", 'On Roshar'])
    cleanup()
    both('/characters')
    expect(screen.getByRole('link', { name: 'Vasher' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Zahel' })).toBeNull()
  })

  it('keeps Nomad apart from Sigzil until the reader has read both', async () => {
    // The Sunlit Man only: Nomad, with nothing from Stormlight.
    const sunlit = (to: string) => renderAt(to, ['sunlit-man'])
    sunlit('/characters/nomad')
    expect(screen.getByRole('heading', { name: 'Nomad' })).toBeInTheDocument()
    const page = () => screen.getByRole('article').textContent
    for (const spoiler of [
      /Sigzil/,
      /Roshar/,
      /Azi[rs]h?/,
      /Bridge Four/,
      /Windrunner/,
      /Worldsinger/,
      /Kaladin/,
      /Vienta/,
      /Stormlight Archive/,
      /Shadesmar/,
    ])
      expect(page()).not.toMatch(spoiler)
    expect(screen.queryByRole('region', { name: 'Travels' })).toBeNull()
    expect(screen.getByRole('img', { name: /Nomad/ })).toHaveAttribute(
      'src',
      expect.not.stringMatching(/sigzil/),
    )
    await userEvent.click(screen.getByRole('link', { name: 'Appearances' }))
    expect(page()).not.toMatch(/Way of Kings|Radiance|Oathbringer|Rhythm/)
    cleanup()
    sunlit('/characters')
    expect(screen.getByRole('link', { name: 'Nomad' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sigzil' })).toBeNull()
    cleanup()

    // Stormlight only: Sigzil, with nothing from The Sunlit Man.
    renderAt('/characters/sigzil', [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
      'rhythm-of-war',
      'wind-and-truth',
    ])
    expect(screen.getByRole('heading', { name: 'Sigzil' })).toBeInTheDocument()
    expect(screen.getAllByText(/Worldsinger/).length).toBeGreaterThan(0)
    for (const spoiler of [/Nomad/, /Zellion/, /Canticle/, /Cinder King/])
      expect(page()).not.toMatch(spoiler)
    expect(screen.queryByRole('region', { name: 'Travels' })).toBeNull()
    cleanup()

    // Both: one page, Sigzil's, with Nomad as another name.
    renderAt('/characters/nomad', ['way-of-kings'], { 'sunlit-man': '39' })
    expect(
      await screen.findByRole('heading', { name: 'Sigzil' }),
    ).toBeInTheDocument()
    expect(document.querySelector('.character-persona')).toHaveTextContent(
      'Known as Nomad in The Sunlit Man',
    )
    cleanup()
    // Short of the chapter that tells who he is, they stay apart.
    renderAt('/characters/nomad', ['way-of-kings'], { 'sunlit-man': '38' })
    expect(screen.getByRole('heading', { name: 'Nomad' })).toBeInTheDocument()
    expect(page()).not.toMatch(/Sigzil|Roshar/)
  })

  it('leaves family out of the key facts until a tie is revealed', () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '1' })
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).queryByText(/Parent|Sibling/)).toBeNull()
  })

  it('reveals abilities at their chapter, and sends unknown tabs to the first', async () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '56' })
    const article = screen.getByRole('article')
    expect(within(article).queryByText(/Abilities|Surgebinder/)).toBeNull()
    cleanup()
    // Kaladin learns he's a Surgebinder in chapter 57 (Coppermind footnote).
    renderAt('/characters/kaladin', [], { 'way-of-kings': '57' })
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(within(facts).getByText('Surgebinder')).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Windrunner/)
    cleanup()
    renderAt('/characters/kaladin/abilities', allBooks)
    expect(
      await screen.findByRole('region', { name: 'History' }),
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

  it('tells his history only as far as the reader has read', async () => {
    const headings = () =>
      within(screen.getByRole('region', { name: 'History' }))
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
    // Footnotes date his slavery to chapter 2 and Bridge Four to chapter 6;
    // his childhood is told in flashbacks from chapter 16.
    renderAt('/characters/kaladin', [], { 'way-of-kings': '6' })
    expect(document.querySelector('.character-intro')).not.toBeNull()
    expect(headings()).toEqual(['Slavery', 'Bridgeman'])
    cleanup()
    // Once read, the flashbacks take their place in his life, first.
    renderAt('/characters/kaladin', [], { 'way-of-kings': '20' })
    expect(headings()).toEqual(['Early life', 'Slavery', 'Bridgeman'])
    expect(
      within(screen.getByRole('region', { name: 'History' })).getAllByRole(
        'link',
        { name: 'The Way of Kings' },
      ).length,
    ).toBeGreaterThan(0)
    cleanup()
    // A section's title grows with it, never ahead of it.
    renderAt('/characters/kaladin', ['way-of-kings', 'words-of-radiance'], {
      oathbringer: '60',
    })
    expect(headings()).toContain('Kholinar')
    expect(headings().join()).not.toMatch(/Shadesmar|Thaylen/)
    cleanup()
    renderAt('/characters/kaladin', ['way-of-kings'])
    expect(headings()).not.toContain("Dalinar's guard")
    await userEvent.click(screen.getByRole('button', { name: 'Show anyway' }))
    expect(headings()).toContain("Dalinar's guard")
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
  })

  it('groups the list by series, world, species, ability or book count', async () => {
    renderAt('/characters', allBooks)
    const groupBy = screen.getByRole('combobox', { name: 'Group by' })
    await userEvent.selectOptions(groupBy, 'series')
    const region = (name: string) => screen.getByRole('region', { name })
    expect(
      within(region('The Stormlight Archive')).getByRole('link', {
        name: 'Kaladin',
      }),
    ).toBeInTheDocument()
    expect(
      within(region('Standalones')).getByRole('link', { name: 'Vivenna' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/not sorted by series yet/)).toBeInTheDocument()
    await userEvent.selectOptions(groupBy, 'world')
    expect(
      within(region('Roshar')).getByRole('link', { name: 'Kaladin' }),
    ).toBeInTheDocument()
    await userEvent.selectOptions(groupBy, 'books')
    expect(
      within(region('In 6 books')).getByRole('link', { name: 'Kaladin' }),
    ).toBeInTheDocument()
  })

  it('groups only by what the reader knows', async () => {
    // Kaladin learns he's a Surgebinder in chapter 57 (Coppermind footnote).
    renderAt('/characters?group=ability', [], { 'way-of-kings': '56' })
    expect(screen.queryByRole('region', { name: 'Surgebinder' })).toBeNull()
    cleanup()
    renderAt('/characters?group=ability', [], { 'way-of-kings': '57' })
    expect(
      within(screen.getByRole('region', { name: 'Surgebinder' })).getByRole(
        'link',
        { name: 'Kaladin' },
      ),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/characters?group=series', ['warbreaker'])
    // One group: nothing to jump between.
    expect(
      screen.queryByRole('combobox', { name: 'Jump to series' }),
    ).toBeNull()
    expect(
      screen.getByRole('region', { name: 'Standalones' }),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/characters?group=series', ['warbreaker', 'way-of-kings'])
    expect(
      within(screen.getByRole('combobox', { name: 'Jump to series' }))
        .getAllByRole('option')
        .slice(1)
        .map((o) => o.textContent),
    ).toEqual(['The Stormlight Archive', 'Standalones'])
    expect(
      screen.queryByRole('navigation', { name: 'Jump to letter' }),
    ).toBeNull()
  })

  it('shows not found for unknown characters', () => {
    renderAt('/characters/nobody-at-all')
    expect(screen.getByText(/Lost in the Cognitive Realm/)).toBeInTheDocument()
  })
})

describe('character portraits', () => {
  beforeAll(() => Promise.all([loadStory('kaladin'), loadStory('vasher')]))
  const real = characterPortraits.kaladin

  it("shows Zahel's art without giving away that he's Vasher", () => {
    const art = () => screen.getByRole('img', { name: /Zahel|Vasher/ })
    renderAt('/characters/zahel', ['way-of-kings'], {
      'words-of-radiance': '34',
    })
    expect(document.querySelector('.character-portrait')).toBeNull()
    cleanup()
    renderAt('/characters/zahel', ['way-of-kings'], {
      'words-of-radiance': '35',
    })
    expect(art()).toHaveAttribute('alt', expect.stringMatching(/sparring/))
    expect(document.querySelector('.character-portrait')).not.toHaveTextContent(
      /Vasher|Nightblood|sword on his back/,
    )
    cleanup()
    renderAt(
      '/characters/zahel',
      ['way-of-kings', 'words-of-radiance', 'oathbringer'],
      { 'rhythm-of-war': '15' },
    )
    expect(art()).toHaveAttribute('alt', expect.stringMatching(/laundry/))
  })

  it("follows Vasher from Warbreaker to Zahel's books", () => {
    const alt = (read: string[], reading: Record<string, string> = {}) => {
      cleanup()
      renderAt('/characters/vasher', read, reading)
      return screen
        .getByRole('img', { name: /Zahel|Vasher/ })
        .getAttribute('alt')
    }
    expect(alt([], { warbreaker: 'prologue' })).toMatch(/^Vasher/)
    expect(alt(['warbreaker'], { 'words-of-radiance': '34' })).toMatch(
      /^Vasher/,
    )
    expect(alt(['warbreaker'], { 'words-of-radiance': '35' })).toMatch(
      /sparring/,
    )
    expect(
      alt(['warbreaker', 'words-of-radiance', 'oathbringer'], {
        'rhythm-of-war': '15',
      }),
    ).toMatch(/laundry/)
  })
  afterEach(() => {
    characterPortraits.kaladin = real
  })

  it("shows Kaladin's art only once the reader reaches what it shows", () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '48' })
    expect(document.querySelector('.character-portrait')).toBeNull()
    cleanup()
    renderAt('/characters/kaladin', [], { 'way-of-kings': '75' })
    expect(
      screen.getByRole('img', { name: /as a bridgeman/ }),
    ).toBeInTheDocument()
    cleanup()
    // Finishing WoK keeps the bridgeman until WoR shows him in uniform.
    renderAt('/characters/kaladin', ['way-of-kings'])
    expect(
      screen.getByRole('img', { name: /as a bridgeman/ }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Exmakina' })).toHaveLength(1)
    const latest = (read: string[], reading: Record<string, string>) => {
      cleanup()
      renderAt('/characters/kaladin', read, reading)
      return screen.getByRole('img', { name: /Kaladin/ }).getAttribute('alt')
    }
    expect(latest(['way-of-kings'], { 'words-of-radiance': '2' })).toMatch(
      /Kholin uniform/,
    )
    expect(
      latest(['way-of-kings', 'words-of-radiance'], { oathbringer: '6' }),
    ).toMatch(/Kholin uniform/)
    expect(
      latest(['way-of-kings', 'words-of-radiance'], { oathbringer: '7' }),
    ).toMatch(/flying/)
    const toRow = ['way-of-kings', 'words-of-radiance', 'oathbringer']
    expect(latest(toRow, { 'rhythm-of-war': '116' })).toMatch(/flying/)
    expect(latest([...toRow, 'rhythm-of-war'], {})).toMatch(/Shardplate/)
    expect(
      latest([...toRow, 'rhythm-of-war'], { 'wind-and-truth': '12' }),
    ).toMatch(/Shinovar/)
  })

  it('shows the latest art the reader has reached, with its artist', () => {
    characterPortraits.kaladin = [
      {
        src: '/portraits/early.webp',
        alt: 'Kaladin as a bridgeman',
        artist: 'Artist A',
        artistUrl: 'https://example.com/a',
        revealedIn: [{ book: 'way-of-kings', chapter: '1' }],
      },
      {
        src: '/portraits/late.webp',
        alt: 'Kaladin in Shardplate',
        artist: 'Artist B',
        revealedIn: ['rhythm-of-war'],
      },
    ]
    renderAt('/characters/kaladin', ['way-of-kings'])
    const art = screen.getByRole('img', { name: 'Kaladin as a bridgeman' })
    expect(art).toHaveAttribute('src', '/portraits/early.webp')
    expect(screen.getByRole('link', { name: 'Artist A' })).toHaveAttribute(
      'href',
      'https://example.com/a',
    )
    expect(screen.queryByAltText('Kaladin in Shardplate')).toBeNull()
  })

  it('shows no art until the reader reaches any', () => {
    characterPortraits.kaladin = [
      {
        src: '/portraits/late.webp',
        alt: 'Kaladin in Shardplate',
        artist: 'Artist B',
        revealedIn: ['rhythm-of-war'],
      },
    ]
    renderAt(
      '/characters/kaladin',
      allBooks.filter((b) => b !== 'rhythm-of-war'),
    )
    expect(document.querySelector('.character-portrait')).toBeNull()
  })
})

describe('character journey', () => {
  beforeAll(() => Promise.all([loadStory('kaladin'), loadPack('roshar')]))
  const journey = () => screen.queryByRole('region', { name: 'Journey' })

  it('shows no Journey to a reader who has not reached its first event', () => {
    // His birth starts it, so it shows as soon as he's met.
    renderAt('/characters/kaladin', [], { 'way-of-kings': 'prologue' })
    expect(journey()).toBeNull()
    cleanup()
    renderAt('/characters/kaladin', ['final-empire'])
    expect(journey()).toBeNull()
  })

  const explore = () =>
    within(journey()!).getByRole('button', { name: /^Explore journey/ })
  const openMap = async () => {
    await userEvent.click(explore())
    return screen.findByRole('group', { name: 'Kaladin’s journey' })
  }
  const events = (map: HTMLElement) =>
    within(within(map).getByRole('list', { name: 'Events' }))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'))

  it('opens the page with the Journey so far, growing chapter by chapter', () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '10' })
    const main = document.querySelector('.character-main') as HTMLElement
    expect(
      within(main).getAllByRole('heading', { level: 2 })[0],
    ).toHaveTextContent('Journey')
    // The starting state is the blurred map and one button, no event text.
    expect(explore()).toHaveAccessibleName(
      'Explore journey: 2 events on the map of Roshar',
    )
    expect(journey()).not.toHaveTextContent('Sold to Bridge Four')
    // Later stops are hidden, so the reader is told some is.
    expect(screen.getByText(/Some information hidden/)).toBeInTheDocument()
    cleanup()
    renderAt('/characters/kaladin', [], { 'way-of-kings': '30' })
    expect(explore()).toHaveAccessibleName(/4 events/)
    cleanup()
    renderAt('/characters/kaladin', ['way-of-kings'])
    expect(explore()).toHaveAccessibleName(/13 events/)
  })

  it('reveals each event at the later of the source and our History dates', async () => {
    // The source dates Roshone's arrival to chapter 25; our History, to 37.
    renderAt('/characters/kaladin', [], { 'way-of-kings': '36' })
    expect(explore()).toHaveAccessibleName(/4 events/)
    expect((await openMap()).textContent).not.toMatch(/Roshone/)
    cleanup()
    renderAt('/characters/kaladin', [], { 'way-of-kings': '37' })
    expect(explore()).toHaveAccessibleName(/5 events/)
    expect(events(await openMap())).toContain(
      '4. Roshone becomes citylord, Chapter 37',
    )
  })

  it('shows his birth with no place before the book says where', async () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '1' })
    // The key facts give the year, with its Word of Brandon linked.
    const facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(facts).toHaveTextContent('Age19 in The Way of Kings')
    expect(facts).toHaveTextContent('BornLate 1153')
    expect(facts).not.toHaveTextContent('Hearthstone')
    // Its source sits behind a small mark, opened by a tap.
    const born = within(facts).getByText('Born')
      .nextElementSibling as HTMLElement
    const mark = within(born).getByRole('button', {
      name: 'Source: Word of Brandon',
    })
    expect(mark).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(mark)
    expect(mark).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(born).getByRole('link', { name: 'Word of Brandon' }),
    ).toHaveAttribute('href', expect.stringContaining('wob.coppermind.net'))
    expect(explore()).toHaveAccessibleName(/1 event/)
    const map = await openMap()
    const card = within(map).getByRole('region', { name: 'Event' })
    expect(card).toHaveTextContent('Born')
    expect(card).not.toHaveTextContent(/Lirin|Hesina|Hearthstone/)
    expect(map.querySelector('.journey-here')).toBeNull()
    expect(map.querySelector('.journey-dot')).toBeNull()
  })

  it('gives his birthplace and age as the reader goes on', () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '16' })
    let facts = screen.getByRole('complementary', { name: 'Key facts' })
    // One mark: the date's source is the Word of Brandon; the place's, the book.
    const born = within(facts).getByText('Born')
      .nextElementSibling as HTMLElement
    expect(born).toHaveTextContent(/^Late 1153.*Hearthstone/)
    expect(
      within(born)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual([
      'Sources: Word of Brandon (date), The Way of Kings chapter 16 (place)',
    ])
    // History paragraphs name the chapter they come from, like footnotes.
    expect(
      screen.getAllByRole('button', {
        name: /^Sources?: The Way of Kings chapter \d+/,
      }).length,
    ).toBeGreaterThan(0)
    // Chapter 16 names it, so its page is open (saying only that).
    expect(
      within(facts).getByRole('link', { name: 'Hearthstone' }),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/characters/kaladin', [], { 'way-of-kings': '15' })
    facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(
      within(facts).queryByRole('link', { name: 'Hearthstone' }),
    ).toBeNull()
    cleanup()
    renderAt('/characters/kaladin', ['way-of-kings'])
    facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(facts).toHaveTextContent('Age20 in The Way of Kings')
    expect(
      within(facts).getByRole('link', { name: 'Hearthstone' }),
    ).toHaveAttribute('href', expect.stringContaining('hearthstone'))
    cleanup()
    renderAt(
      '/characters/kaladin',
      ['way-of-kings', 'words-of-radiance', 'oathbringer'],
      { 'rhythm-of-war': '1' },
    )
    facts = screen.getByRole('complementary', { name: 'Key facts' })
    expect(facts).toHaveTextContent('Age21 in Rhythm of War')
  })

  it('opens the interactive map from the preview', async () => {
    renderAt('/characters/kaladin', [], { 'way-of-kings': '45' })
    const map = await openMap()
    expect(within(map).getAllByRole('listitem')).toHaveLength(7)
    expect(within(map).getByRole('slider', { name: 'Event' })).toHaveAttribute(
      'aria-valuetext',
      'Event 1 of 7: Born',
    )
    // His birth: the year (citing its Word of Brandon) and his parents.
    const card = within(map).getByRole('region', { name: 'Event' })
    expect(within(card).getByRole('link', { name: 'Lirin' })).toHaveAttribute(
      'href',
      '/characters/lirin',
    )
    expect(
      within(card).getByRole('link', { name: 'Word of Brandon' }),
    ).toHaveAttribute('href', expect.stringContaining('wob.coppermind.net'))
    expect(card).toHaveTextContent('Chapter 1')
    expect(map).not.toHaveTextContent(/Spears in the chasms|Tien’s last/)
    expect(
      within(map).getByRole('link', {
        name: /Journey data adapted from the 17th Shard/,
      }),
    ).toHaveAttribute('href', 'https://github.com/17thshard/roshar-map')
    // The card can be hidden and brought back.
    await userEvent.click(
      within(card).getByRole('button', { name: 'Hide event details' }),
    )
    expect(within(map).queryByRole('region', { name: 'Event' })).toBeNull()
    await userEvent.click(
      within(map).getByRole('button', { name: 'Show event' }),
    )
    expect(
      within(map).getByRole('region', { name: 'Event' }),
    ).toBeInTheDocument()
  })
})

describe('character travels', () => {
  beforeAll(() =>
    Promise.all(['vasher', 'felt', 'vivenna', 'hoid'].map(loadStory)),
  )
  const worlds = () =>
    [...document.querySelectorAll('.travel-steps button')].map(
      (b) => b.textContent,
    )
  const card = () => document.querySelector('.travel-card')!

  it('adds worlds as the books reveal them', () => {
    renderAt('/characters/vasher/travels', [], { warbreaker: 'prologue' })
    expect(worlds()).toEqual(['Nalthis'])
    expect(card()).toHaveTextContent('T’Telir')
    cleanup()
    renderAt('/characters/vasher/travels', ['warbreaker'])
    expect(worlds()).toEqual(['Nalthis', 'Nalthis'])
    expect(document.body).not.toHaveTextContent(/Zahel|Roshar/)
    cleanup()
    renderAt('/characters/vasher/travels', ['warbreaker'], {
      'words-of-radiance': '16',
    })
    expect(worlds()).toEqual(['Nalthis', 'Nalthis', 'Roshar'])
    fireEvent.click(screen.getByRole('button', { name: 'Roshar' }))
    expect(card()).toHaveTextContent('Zahel')
    expect(card()).not.toHaveTextContent(/Gavilar|Lift freed/)
  })

  it('steps through the journey and flags a stay the books leave undated', () => {
    renderAt('/characters/vasher/travels', ['warbreaker', 'fires-of-december'])
    expect(worlds()).toEqual(['Nalthis', 'Miral', 'Nalthis', 'Roshar'])
    // The journey starts at the first stop.
    expect(card()).toHaveTextContent('Stop 1 of 4')
    fireEvent.click(screen.getByRole('button', { name: 'Miral' }))
    expect(card()).toHaveTextContent('Stop 2 of 4')
    expect(screen.getByText('Timing uncertain')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous stop' }))
    expect(card()).toHaveTextContent('Born, died and Returned')
  })

  it('shows a trip known only from Brandon once the reader has met him on both worlds', () => {
    renderAt('/characters/felt/travels', ['final-empire', 'well-of-ascension'])
    expect(screen.queryByRole('region', { name: 'Travels' })).toBeNull()
    cleanup()
    renderAt('/characters/felt/travels', ['oathbringer'])
    expect(screen.queryByRole('region', { name: 'Travels' })).toBeNull()
    cleanup()
    renderAt('/characters/felt/travels', ['final-empire'], {
      oathbringer: '114',
    })
    expect(worlds()).toEqual(['Scadrial', 'Roshar'])
    fireEvent.click(screen.getByRole('button', { name: 'Roshar' }))
    expect(card()).toHaveTextContent('Nightwatcher')
    expect(screen.getByText('Word of Brandon')).toBeInTheDocument()
  })

  it('adds Sigzil’s worlds beyond Roshar only once he’s known as Nomad', () => {
    const stormlight = [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
      'rhythm-of-war',
      'wind-and-truth',
    ]
    renderAt('/characters/sigzil/travels', stormlight)
    expect(document.querySelector('.travel-map')).toBeNull()
    cleanup()
    renderAt('/characters/sigzil/travels', [...stormlight, 'sunlit-man'])
    expect(worlds()).toEqual([
      'Roshar',
      'Ashyn',
      'Threnody',
      'Canticle',
      'UTol',
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Ashyn' }))
    expect(screen.getByText('Timing uncertain')).toBeInTheDocument()
    cleanup()
    renderAt('/characters/nomad/travels', ['sunlit-man'])
    expect(document.querySelector('.travel-map')).toBeNull()
  })

  it("gives a persona's page no travels", () => {
    renderAt('/characters/zahel/travels', ['way-of-kings'], {
      'words-of-radiance': '35',
    })
    expect(screen.queryByRole('region', { name: 'Travels' })).toBeNull()
    expect(document.querySelector('.travel-map')).toBeNull()
  })

  it('adds Azure’s Roshar to Vivenna’s travels once she can be recognized', () => {
    renderAt('/characters/vivenna/travels', [], { oathbringer: '108' })
    expect(document.querySelector('.travel-map')).toBeNull()
    cleanup()
    renderAt('/characters/vivenna/travels', ['warbreaker'], {
      oathbringer: '108',
    })
    expect(worlds()).toEqual(['Nalthis', 'Roshar'])
    fireEvent.click(screen.getByRole('button', { name: 'Roshar' }))
    expect(card()).toHaveTextContent('Highmarshal')
    expect(card()).not.toHaveTextContent('Lasting Integrity')
  })

  it('keeps Hoid’s cameos and Wit off his travels until the reader knows him', () => {
    renderAt('/characters/hoid/travels', ['elantris'], {
      'way-of-kings': '57',
    })
    expect(worlds()).toEqual(['Sel'])
    expect(document.body).not.toHaveTextContent('Elhokar')
    cleanup()
    renderAt('/characters/hoid/travels', ['elantris'], {
      'way-of-kings': '58',
    })
    expect(worlds()).toEqual(['Sel', 'Roshar'])
    fireEvent.click(screen.getByRole('button', { name: 'Roshar' }))
    expect(card()).toHaveTextContent('Elhokar')
    expect(document.body).not.toHaveTextContent(/Midius|Ashyn|Middlefest/)
  })
})
