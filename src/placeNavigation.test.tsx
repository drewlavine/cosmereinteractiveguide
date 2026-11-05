import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserRouter, MemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BooksReadProvider } from './components/BooksReadProvider'
import { PlacePage as DesignD } from './components/look-d/PlacePage'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const ALETHKAR = '/systems/rosharan/planets/roshar/locations/alethkar'
const KHOLINAR = '/systems/rosharan/planets/roshar/locations/kholinar'
const THROUGH_WOR = ['way-of-kings', 'words-of-radiance', 'edgedancer']
let browserRouter: ReturnType<typeof createBrowserRouter> | undefined

function wideScreen(wide: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: wide && query === '(min-width: 1024px)',
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function renderAt(
  path = ALETHKAR,
  read = THROUGH_WOR,
  reading: Record<string, string> = { oathbringer: '8' },
) {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  browserRouter?.dispose()
  window.history.replaceState({ idx: 0 }, '', path)
  browserRouter = createBrowserRouter(routes)
  render(<RouterProvider router={browserRouter} />)
  return browserRouter
}

async function plateNav() {
  const plate = await screen.findByRole('complementary', { name: 'Plate' })
  return within(plate).findByRole('navigation', { name: 'On this page' })
}

async function openParts(nav: HTMLElement, section: string) {
  const toggle = await within(nav).findByRole('button', {
    name: new RegExp(`^(Show|Hide) ${section} (topics|eras|parts)$`),
  })
  if (toggle.getAttribute('aria-expanded') === 'false')
    await userEvent.click(toggle)
  return document.getElementById(toggle.getAttribute('aria-controls')!)!
}

async function setChapter(
  user: ReturnType<typeof userEvent.setup>,
  book: string,
  chapter: string,
) {
  await user.click(screen.getByRole('button', { name: /Books Read/ }))
  const settings = screen.getByRole('dialog', { name: 'Books Read' })
  await user.selectOptions(
    within(settings).getByRole('combobox', {
      name: `Last chapter finished in ${book}`,
    }),
    chapter,
  )
  await user.click(within(settings).getByRole('button', { name: 'Done' }))
}

beforeEach(() => wideScreen(true))
afterEach(() => {
  cleanup()
  browserRouter?.dispose()
  browserRouter = undefined
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('place page Contents', { timeout: 20000 }, () => {
  it('lists only rendered sections and current titles at specific chapters', async () => {
    const user = userEvent.setup()
    renderAt(ALETHKAR, ['way-of-kings'], { 'words-of-radiance': '11' })
    const nav = await plateNav()
    const article = screen.getByRole('article', { name: 'Alethkar' })
    const sections = [...article.querySelectorAll<HTMLElement>('[data-toc]')]
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['#top', ...sections.map((section) => `#${section.id}`)])
    for (const section of sections)
      expect(
        within(nav).getByRole('link', { name: section.dataset.toc }),
      ).toBeInTheDocument()

    const culture = await openParts(nav, 'Culture')
    const visibleTopics = within(
      screen.getByRole('region', { name: 'Culture' }),
    )
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(
      within(culture)
        .getAllByRole('link')
        .map((link) => link.textContent?.replace(/\d+$/, '')),
    ).toEqual(visibleTopics)
    expect(culture).not.toHaveTextContent('Music and art')

    const history = await openParts(nav, 'History')
    const metro = within(
      screen.getByRole('region', { name: 'History' }),
    ).getByRole('group', { name: 'Jump to an era' })
    const metroTitles = within(metro)
      .getAllByRole('button')
      .map((button) => button.textContent)
    expect(
      within(history)
        .getAllByRole('link')
        .map((button) => button.textContent),
    ).toEqual(metroTitles)
    expect(history).toHaveTextContent('The Hierocracy and Sadees')
    expect(history).not.toHaveTextContent('The Hierocracy and the Sunmaker')
    const earlyEra = within(history).getByRole('link', {
      name: 'The Hierocracy and Sadees',
    })
    const eraLink = earlyEra.getAttribute('href')
    await user.click(earlyEra)
    expect(window.location.hash).toBe(eraLink)

    await user.click(screen.getByRole('button', { name: /Books Read/ }))
    const settings = screen.getByRole('dialog', { name: 'Books Read' })
    await user.selectOptions(
      within(settings).getByRole('combobox', {
        name: 'Last chapter finished in Words of Radiance',
      }),
      '12',
    )
    await waitFor(() =>
      expect(nav).toHaveTextContent('The Hierocracy and the Sunmaker'),
    )
    expect(nav).not.toHaveTextContent('The Hierocracy and Sadees')
    const laterEra = within(await openParts(nav, 'History')).getByRole('link', {
      name: 'The Hierocracy and the Sunmaker',
    })
    expect(laterEra).toHaveAttribute('href', eraLink)
    expect(laterEra).toHaveAttribute('aria-current', 'location')
    expect(
      within(metro).getByRole('button', {
        name: 'The Hierocracy and the Sunmaker',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(window.location.hash).toBe(eraLink)
    await user.selectOptions(
      within(settings).getByRole('combobox', {
        name: 'Last chapter finished in Words of Radiance',
      }),
      '11',
    )
    await waitFor(() =>
      expect(nav).toHaveTextContent('The Hierocracy and Sadees'),
    )
    expect(nav).not.toHaveTextContent('The Hierocracy and the Sunmaker')
    expect(window.location.hash).toBe(eraLink)
  })

  it('adds and removes a topic exactly at its chapter', async () => {
    const user = userEvent.setup()
    renderAt(ALETHKAR, THROUGH_WOR, { oathbringer: '7' })
    const nav = await plateNav()
    await openParts(nav, 'Culture')
    expect(nav).not.toHaveTextContent('Music and art')

    await user.click(screen.getByRole('button', { name: /Books Read/ }))
    const picker = within(
      screen.getByRole('dialog', { name: 'Books Read' }),
    ).getByRole('combobox', { name: 'Last chapter finished in Oathbringer' })
    await user.selectOptions(picker, '8')
    await waitFor(() => expect(nav).toHaveTextContent('Music and art'))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Books Read' })).getByRole(
        'button',
        { name: 'Done' },
      ),
    )
    await user.click(
      within(await openParts(nav, 'Culture')).getByRole('link', {
        name: /Music and art/,
      }),
    )
    expect(window.location.hash).toContain('music-and-art')
    await user.click(screen.getByRole('button', { name: /Books Read/ }))
    await user.selectOptions(
      within(screen.getByRole('dialog', { name: 'Books Read' })).getByRole(
        'combobox',
        { name: 'Last chapter finished in Oathbringer' },
      ),
      '7',
    )
    await waitFor(() => expect(nav).not.toHaveTextContent('Music and art'))
    expect(window.location.hash).toBe('')
  })

  it('includes a newly visible era only from its chapter', async () => {
    const user = userEvent.setup()
    renderAt(ALETHKAR, THROUGH_WOR, { oathbringer: '112' })
    const nav = await plateNav()
    const earlier = await openParts(nav, 'History')
    const count = within(earlier).getAllByRole('link').length
    expect(nav).not.toHaveTextContent('Long ago')

    await user.click(screen.getByRole('button', { name: /Books Read/ }))
    const settings = screen.getByRole('dialog', { name: 'Books Read' })
    await user.selectOptions(
      within(settings).getByRole('combobox', {
        name: 'Last chapter finished in Oathbringer',
      }),
      '113',
    )
    await waitFor(() => expect(nav).toHaveTextContent('Long ago'))
    expect(
      within(await openParts(nav, 'History')).getAllByRole('link'),
    ).toHaveLength(count + 1)
    expect(nav.innerHTML).not.toContain('long-ago')
    await user.click(within(settings).getByRole('button', { name: 'Done' }))
    await user.click(within(nav).getByRole('link', { name: 'Long ago' }))
    expect(window.location.hash).toMatch(/^#history~[a-z0-9]+$/)

    await user.click(screen.getByRole('button', { name: /Books Read/ }))
    await user.selectOptions(
      within(screen.getByRole('dialog', { name: 'Books Read' })).getByRole(
        'combobox',
        { name: 'Last chapter finished in Oathbringer' },
      ),
      '112',
    )
    await waitFor(() => expect(nav).not.toHaveTextContent('Long ago'))
    expect(window.location.hash).toBe('')
    expect(
      within(await openParts(nav, 'History')).getAllByRole('link'),
    ).toHaveLength(count)
  })

  it('restores era links on refresh, Back and Forward after Metro changes', async () => {
    const user = userEvent.setup()
    const path = `${ALETHKAR}?comparison=on`
    renderAt(path)
    const nav = await plateNav()
    const eras = await openParts(nav, 'History')
    const links = within(eras).getAllByRole('link')
    const chosen = links.at(-1)!
    const first = links[0]
    const chosenName = chosen.textContent!
    const firstName = first.textContent!
    const chosenHref = chosen.getAttribute('href')!
    const firstHref = first.getAttribute('href')!
    expect(chosenHref).toMatch(/^#history~[a-z0-9]+$/)
    expect(chosenHref).not.toContain(
      chosenName.toLowerCase().replaceAll(' ', '-'),
    )
    expect(chosenHref).not.toBe(firstHref)
    const metro = within(
      screen.getByRole('region', { name: 'History' }),
    ).getByRole('group', { name: 'Jump to an era' })
    await user.click(chosen)
    expect(window.location.hash).toBe(chosenHref)
    expect(
      within(metro).getByRole('button', { name: chosenName }),
    ).toHaveAttribute('aria-pressed', 'true')
    await user.click(within(metro).getByRole('button', { name: firstName }))
    await waitFor(() => expect(window.location.hash).toBe(firstHref))
    await act(async () => window.history.back())
    await waitFor(() => {
      expect(window.location.hash).toBe(chosenHref)
      expect(
        within(metro).getByRole('button', { name: chosenName }),
      ).toHaveAttribute('aria-pressed', 'true')
      expect(chosen).toHaveAttribute('aria-current', 'location')
    })
    await act(async () => window.history.forward())
    await waitFor(() => {
      expect(window.location.hash).toBe(firstHref)
      expect(
        within(metro).getByRole('button', { name: firstName }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
    expect(window.location.search).toBe('?comparison=on')

    cleanup()
    renderAt(`${path}${chosenHref}`)
    const restoredNav = await plateNav()
    const restoredEras = await openParts(restoredNav, 'History')
    const restoredMetro = within(
      screen.getByRole('region', { name: 'History' }),
    ).getByRole('group', { name: 'Jump to an era' })
    await waitFor(() => {
      expect(
        within(restoredMetro).getByRole('button', { name: chosenName }),
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        within(restoredEras).getByRole('link', { name: chosenName }),
      ).toHaveAttribute('aria-current', 'location')
    })
    expect(window.location.hash).toBe(chosenHref)
  })

  it('fails closed for an era after rollback, including Back and a cold link', async () => {
    const user = userEvent.setup()
    const path = `${ALETHKAR}?comparison=on`
    renderAt(path, THROUGH_WOR, { oathbringer: '113' })
    const nav = await plateNav()
    const eras = await openParts(nav, 'History')
    const link = within(eras).getByRole('link', { name: 'Long ago' })
    const href = link.getAttribute('href')!
    await user.click(link)
    const savedState = { ...window.history.state, marker: 'preserve-state' }
    window.history.replaceState(savedState, '', window.location.href)
    await user.click(within(nav).getByRole('link', { name: 'About' }))
    await setChapter(user, 'Oathbringer', '112')
    expect(nav).not.toHaveTextContent('Long ago')

    await act(async () => window.history.back())
    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(window.location.search).toBe('?comparison=on')
    expect(window.history.state).toEqual(savedState)
    expect(nav.innerHTML).not.toContain(href)
    await act(async () => window.history.forward())
    await waitFor(() => expect(window.location.hash).toBe('#about'))

    cleanup()
    renderAt(`${path}${href}`, THROUGH_WOR, { oathbringer: '112' })
    const hidden = await plateNav()
    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(window.location.search).toBe('?comparison=on')
    expect(hidden).not.toHaveTextContent('Long ago')

    cleanup()
    renderAt(`${path}${href}`, THROUGH_WOR, { oathbringer: '113' })
    const unlocked = await plateNav()
    const unlockedEras = await openParts(unlocked, 'History')
    const metro = within(
      screen.getByRole('region', { name: 'History' }),
    ).getByRole('group', { name: 'Jump to an era' })
    await waitFor(() => {
      expect(
        within(metro).getByRole('button', { name: 'Long ago' }),
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        within(unlockedEras).getByRole('link', { name: 'Long ago' }),
      ).toHaveAttribute('aria-current', 'location')
    })
    expect(window.location.hash).toBe(href)
  })

  it('realigns a cold subsection link after reflows, until the reader takes control', async () => {
    const previous = HTMLElement.prototype.scrollIntoView
    const scroll = vi.fn(function (this: HTMLElement) {
      return this.id
    })
    HTMLElement.prototype.scrollIntoView = scroll
    try {
      renderAt(`${ALETHKAR}#culture-music-and-art`)
      await plateNav()
      const calls = () =>
        scroll.mock.instances.filter(
          (element) => element.id === 'culture-music-and-art',
        ).length
      await waitFor(() => expect(calls()).toBeGreaterThan(0))
      expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' })
      // A slow image can arrive after the initial fade-alignment timers.
      await new Promise((resolve) => setTimeout(resolve, 2700))
      const beforeImage = calls()
      const image = document.querySelector('article.location-detail img')!
      fireEvent.load(image)
      await waitFor(() => expect(calls()).toBeGreaterThan(beforeImage))
      fireEvent.pointerDown(document.body)
      const afterUser = calls()
      fireEvent.load(image)
      await new Promise((resolve) => setTimeout(resolve, 300))
      expect(calls()).toBe(afterUser)
    } finally {
      HTMLElement.prototype.scrollIntoView = previous
    }
  }, 10000)

  it('stops following a cold link when navigation clears its fragment', async () => {
    const previous = HTMLElement.prototype.scrollIntoView
    const scroll = vi.fn()
    HTMLElement.prototype.scrollIntoView = scroll
    try {
      const router = renderAt(`${ALETHKAR}#culture-music-and-art`)
      await plateNav()
      await waitFor(() => expect(scroll).toHaveBeenCalled())
      await act(async () => router.navigate(ALETHKAR))
      const afterNavigation = scroll.mock.calls.length
      fireEvent.load(document.querySelector('article.location-detail img')!)
      await new Promise((resolve) => setTimeout(resolve, 300))
      expect(scroll).toHaveBeenCalledTimes(afterNavigation)
    } finally {
      HTMLElement.prototype.scrollIntoView = previous
    }
  })

  it('opens folded sections and synchronizes era selection both ways', async () => {
    const user = userEvent.setup()
    renderAt()
    const nav = await plateNav()
    const culture = screen.getByRole('region', { name: 'Culture' })
    const cultureToggle = within(culture).getByRole('button', {
      name: 'Culture',
    })
    await user.click(cultureToggle)
    expect(cultureToggle).toHaveAttribute('aria-expanded', 'false')
    const topics = await openParts(nav, 'Culture')
    const topic = within(topics).getByRole('link', { name: /Music and art/ })
    await user.click(topic)
    expect(cultureToggle).toHaveAttribute('aria-expanded', 'true')
    expect(topic).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('region', { name: 'Music and art' })).toBeVisible()

    const history = screen.getByRole('region', { name: 'History' })
    const historyToggle = within(history).getByRole('button', {
      name: 'History',
    })
    const metro = within(history).getByRole('group', {
      name: 'Jump to an era',
    })
    const metroButtons = within(metro).getAllByRole('button')
    const targetTitle = metroButtons[1].textContent!
    const lastTitle = metroButtons.at(-1)!.textContent!
    await user.click(historyToggle)
    expect(historyToggle).toHaveAttribute('aria-expanded', 'false')
    const eras = await openParts(nav, 'History')
    await user.click(within(eras).getByRole('link', { name: targetTitle }))
    expect(historyToggle).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(metro).getByRole('button', { name: targetTitle }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(eras).getByRole('link', { name: targetTitle }),
    ).toHaveAttribute('aria-current', 'location')
    expect(window.location.hash).toMatch(/^#history~[a-z0-9]+$/)

    await user.click(within(metro).getByRole('button', { name: lastTitle }))
    await waitFor(() =>
      expect(
        within(eras).getByRole('link', { name: lastTitle }),
      ).toHaveAttribute('aria-current', 'location'),
    )
    expect(
      within(eras).getByRole('link', { name: targetTitle }),
    ).not.toHaveAttribute('aria-current')
    fireEvent.keyDown(within(history).getByRole('slider'), { key: 'Home' })
    const firstTitle = metroButtons[0].textContent!
    await waitFor(() =>
      expect(
        within(eras).getByRole('link', { name: firstTitle }),
      ).toHaveAttribute('aria-current', 'location'),
    )
  })

  it('links prose history and handles a page without culture or a timeline', async () => {
    const user = userEvent.setup()
    renderAt('/locations/kholinar')
    const nav = await plateNav()
    expect(within(nav).queryByRole('link', { name: 'Culture' })).toBeNull()
    const history = await screen.findByRole('region', { name: 'History' })
    expect(within(history).queryByRole('slider')).toBeNull()
    const title = within(history).getAllByRole('heading', { level: 3 })[0]
      .textContent!
    const toggle = within(history).getByRole('button', { name: 'History' })
    await user.click(toggle)
    const parts = await openParts(nav, 'History')
    await user.click(within(parts).getByRole('link', { name: title }))
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: title })).toBeVisible()
  })

  it('still offers Top on a page without any optional sections', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    render(
      <MemoryRouter>
        <BooksReadProvider>
          <DesignD
            id="empty-place"
            name="A place"
            scope="empty-place"
            showAll={false}
            breadcrumb={<span>Places</span>}
            spoilers={false}
            coppermindUrl="https://coppermind.net"
          />
        </BooksReadProvider>
      </MemoryRouter>,
    )
    const nav = await plateNav()
    expect(within(nav).getAllByRole('link')).toHaveLength(1)
    expect(within(nav).getByRole('link', { name: 'Top' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    await userEvent.click(within(nav).getByRole('link', { name: 'Top' }))
  })

  it('reopens a folded section when Contents jumps into it', async () => {
    renderAt(KHOLINAR, [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    const nav = await plateNav()
    const history = screen.getByRole('region', { name: 'History' })
    const fold = within(history).getByRole('button', { name: 'History' })
    await userEvent.click(fold)
    expect(fold).toHaveAttribute('aria-expanded', 'false')
    const parts = await openParts(nav, 'History')
    await userEvent.click(
      within(parts).getByRole('link', { name: 'Occupation' }),
    )
    expect(fold).toHaveAttribute('aria-expanded', 'true')
    expect(window.location.hash).toBe('#history-occupation')
  })
})

describe('phone navigation', { timeout: 20000 }, () => {
  beforeEach(() => wideScreen(false))

  it('opens a sheet, traps focus, dismisses with Escape and returns focus', async () => {
    const user = userEvent.setup()
    renderAt()
    const trigger = await screen.findByRole('button', { name: /^Contents/ })
    await user.click(trigger)
    const sheet = screen.getByRole('dialog', { name: 'On this page' })
    const close = within(sheet).getByRole('button', {
      name: 'Close navigation',
    })
    expect(close).toHaveFocus()
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(sheet.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Tab}')
    expect(close).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(sheet).not.toHaveAttribute('open')
    expect(trigger).toHaveFocus()
  })

  it('jumps from the sheet and returns focus to its trigger', async () => {
    const user = userEvent.setup()
    renderAt()
    const trigger = await screen.findByRole('button', { name: /^Contents/ })
    await user.click(trigger)
    const sheet = screen.getByRole('dialog', { name: 'On this page' })
    const nav = within(sheet).getByRole('navigation', { name: 'On this page' })
    await user.click(within(nav).getByRole('link', { name: 'History' }))
    expect(sheet).not.toHaveAttribute('open')
    expect(trigger).toHaveFocus()
    expect(window.location.hash).toBe('#history')
  })

  it('can open and dismiss the sheet without native dialog methods', async () => {
    const user = userEvent.setup()
    renderAt()
    const trigger = await screen.findByRole('button', { name: /^Contents/ })
    const sheet = document.querySelector<HTMLDialogElement>(
      '[data-place-nav] dialog',
    )!
    Object.defineProperty(sheet, 'showModal', { value: undefined })
    Object.defineProperty(sheet, 'close', { value: undefined })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'On this page' })).toBe(sheet)
    await user.click(
      within(sheet).getByRole('button', { name: 'Close navigation' }),
    )
    expect(sheet).not.toHaveAttribute('open')
    expect(trigger).toHaveFocus()
  })
})

describe('prose History spoiler boundary', { timeout: 30000 }, () => {
  it.each([[false], [true]] as const)(
    'navigation on phone=%s hides a subsection before its chapter',
    async (phone) => {
      wideScreen(!phone)
      const user = userEvent.setup()
      renderAt(`${KHOLINAR}?comparison=on`, [...THROUGH_WOR, 'oathbringer'], {
        'rhythm-of-war': '43',
      })
      const open = async () => {
        if (!phone) {
          const nav = await plateNav()
          await openParts(nav, 'History')
          return nav
        }
        await user.click(
          await screen.findByRole('button', { name: /^Contents/ }),
        )
        const sheet = screen.getByRole('dialog', { name: 'On this page' })
        const nav = within(sheet).getByRole('navigation', {
          name: 'On this page',
        })
        await openParts(nav, 'History')
        return nav
      }
      const close = async () => {
        if (phone)
          await user.click(
            screen.getByRole('button', { name: 'Close navigation' }),
          )
      }

      let nav = await open()
      expect(nav).not.toHaveTextContent('Occupation')
      expect(nav.innerHTML).not.toContain('history-occupation')
      expect(screen.queryByRole('heading', { name: 'Occupation' })).toBeNull()
      await close()
      await user.click(screen.getByRole('button', { name: 'Show anyway' }))
      nav = await open()
      const revealed = within(nav).getByRole('link', { name: 'Occupation' })
      expect(revealed).toHaveAttribute('href', '#history-occupation')
      await user.click(revealed)
      expect(window.location.hash).toBe('#history-occupation')
      await user.click(screen.getByRole('button', { name: 'Hide again' }))
      await waitFor(() => expect(window.location.hash).toBe(''))
      nav = await open()
      expect(nav).not.toHaveTextContent('Occupation')
      expect(nav.innerHTML).not.toContain('history-occupation')
      await close()

      await setChapter(user, 'Rhythm of War', 'i-4')
      nav = await open()
      expect(
        within(nav).getByRole('link', { name: 'Occupation' }),
      ).toBeVisible()
      await close()
      expect(screen.getByRole('heading', { name: 'Occupation' })).toBeVisible()
      await setChapter(user, 'Rhythm of War', '43')
      nav = await open()
      expect(nav).not.toHaveTextContent('Occupation')
      expect(screen.queryByRole('heading', { name: 'Occupation' })).toBeNull()
      await close()
    },
  )

  it('scrubs a previously visited hidden subsection on Back and Forward', async () => {
    const user = userEvent.setup()
    renderAt(`${KHOLINAR}?comparison=on`, [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    const nav = await plateNav()
    const history = await openParts(nav, 'History')
    await user.click(within(history).getByRole('link', { name: 'Occupation' }))
    const savedState = { ...window.history.state, marker: 'preserve-state' }
    window.history.replaceState(savedState, '', window.location.href)
    await user.click(within(nav).getByRole('link', { name: 'About' }))
    await setChapter(user, 'Rhythm of War', '43')
    await act(async () => window.history.back())
    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(window.location.search).toBe('?comparison=on')
    expect(window.history.state).toEqual(savedState)
    expect(nav.innerHTML).not.toContain('history-occupation')
    expect(screen.queryByRole('heading', { name: 'Occupation' })).toBeNull()
    await act(async () => window.history.forward())
    await waitFor(() => expect(window.location.hash).toBe('#about'))
    await act(async () => window.history.back())
    await waitFor(() => expect(window.location.hash).toBe(''))
  })
})
