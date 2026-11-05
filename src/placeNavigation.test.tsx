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
  localStorage.setItem('placeLook', 'd')
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

async function plateNav(mode: 'contents' | 'map' = 'contents') {
  const plate = await screen.findByRole('complementary', { name: 'Plate' })
  return within(plate).findByRole('navigation', {
    name: mode === 'contents' ? 'On this page' : 'Page map',
  })
}

async function openMapList(nav: HTMLElement) {
  const summary = within(nav).queryByText(
    'Browse all sections, topics and eras',
  )
  if (summary && !summary.closest('details')?.open)
    await userEvent.click(summary)
}

async function openParts(nav: HTMLElement, section: string) {
  await openMapList(nav)
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

describe('Design D navigation comparison', { timeout: 20000 }, () => {
  it('remembers navigation independently through page navigation and reload', async () => {
    const user = userEvent.setup()
    const router = renderAt()
    await plateNav()
    const design = screen.getByRole('group', { name: 'Page design' })
    const choice = screen.getByRole('group', { name: 'Navigation style' })
    await user.click(
      within(choice).getByRole('button', { name: /Navigation C/ }),
    )
    expect(await plateNav('map')).toBeInTheDocument()
    expect(localStorage.getItem('placeNavigation')).toBe('map')
    expect(
      within(design).getByRole('button', { name: 'Design D' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(within(design).getByRole('button', { name: 'Design A' }))
    expect(screen.queryByRole('group', { name: 'Navigation style' })).toBeNull()
    await user.click(within(design).getByRole('button', { name: 'Design D' }))
    expect(await plateNav('map')).toBeInTheDocument()

    await act(async () => router.navigate('/locations/kholinar'))
    expect(await plateNav('map')).toBeInTheDocument()
    cleanup()
    renderAt()
    expect(await plateNav('map')).toBeInTheDocument()
    expect(localStorage.getItem('placeLook')).toBe('d')
  })

  it.each(['contents', 'map'] as const)(
    '%s lists only rendered sections and current titles at specific chapters',
    async (mode) => {
      const user = userEvent.setup()
      localStorage.setItem('placeNavigation', mode)
      renderAt(ALETHKAR, ['way-of-kings'], { 'words-of-radiance': '11' })
      const nav = await plateNav(mode)
      await openMapList(nav)
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
      const laterEra = within(await openParts(nav, 'History')).getByRole(
        'link',
        { name: 'The Hierocracy and the Sunmaker' },
      )
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
    },
  )

  it.each(['contents', 'map'] as const)(
    '%s adds and removes a topic exactly at its chapter',
    async (mode) => {
      const user = userEvent.setup()
      localStorage.setItem('placeNavigation', mode)
      renderAt(ALETHKAR, THROUGH_WOR, { oathbringer: '7' })
      const nav = await plateNav(mode)
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
    },
  )

  it.each(['contents', 'map'] as const)(
    '%s includes a newly visible era only from its chapter',
    async (mode) => {
      const user = userEvent.setup()
      localStorage.setItem('placeNavigation', mode)
      renderAt(ALETHKAR, THROUGH_WOR, { oathbringer: '112' })
      const nav = await plateNav(mode)
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
    },
  )

  it.each(['contents', 'map'] as const)(
    '%s restores era links on refresh, Back and Forward after Metro changes',
    async (mode) => {
      const user = userEvent.setup()
      localStorage.setItem('placeNavigation', mode)
      const path = `${ALETHKAR}?comparison=on`
      renderAt(path)
      const nav = await plateNav(mode)
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
      const restoredNav = await plateNav(mode)
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
    },
  )

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

  it.each(['contents', 'map'] as const)(
    '%s opens folded sections and synchronizes era selection both ways',
    async (mode) => {
      const user = userEvent.setup()
      localStorage.setItem('placeNavigation', mode)
      renderAt()
      const nav = await plateNav(mode)
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
      expect(
        screen.getByRole('region', { name: 'Music and art' }),
      ).toBeVisible()

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
    },
  )

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

  it('scales and moves the page map using the app scroller, including reflow', async () => {
    vi.stubGlobal('PointerEvent', MouseEvent)
    const windowScroll = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {})
    let height = 2000
    const positions: Record<string, number> = {
      about: 200,
      culture: 500,
      history: 1400,
      people: 1700,
      map: 1850,
      'where-it-is': 1850,
    }
    const rect = (top: number, height: number) =>
      ({
        x: 0,
        y: top,
        top,
        left: 0,
        right: 500,
        bottom: top + height,
        width: 500,
        height,
        toJSON: () => ({}),
      }) as DOMRect
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const main = document.querySelector<HTMLElement>('.app-main')
        const scroll = main?.scrollTop ?? 0
        if (this === main) return rect(0, 500)
        if (this.matches('article.location-detail'))
          return rect(-scroll, height)
        if (this.hasAttribute('data-toc'))
          return rect((positions[this.id] ?? 1800) - scroll, 100)
        if (this.hasAttribute('data-toc-sub')) {
          const section = this.closest<HTMLElement>('[data-toc]')!
          const parts = [...section.querySelectorAll('[data-toc-sub]')]
          return rect(
            (positions[section.id] ?? 1800) +
              60 +
              parts.indexOf(this) * 100 -
              scroll,
            100,
          )
        }
        return rect(0, 0)
      },
    )
    localStorage.setItem('placeNavigation', 'map')
    renderAt()
    const nav = await plateNav('map')
    const main = document.querySelector<HTMLElement>('.app-main')!
    Object.defineProperty(main, 'clientHeight', {
      configurable: true,
      value: 500,
    })
    Object.defineProperty(main, 'scrollHeight', {
      configurable: true,
      get: () => height,
    })
    const scroll = vi.fn((options: ScrollToOptions) => {
      main.scrollTop = options.top ?? 0
      fireEvent.scroll(main)
    })
    Object.defineProperty(main, 'scrollTo', {
      configurable: true,
      value: scroll,
    })
    main.scrollTop = 750
    fireEvent.scroll(main)

    const slider = within(nav).getByRole('slider', { name: 'Page position' })
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '50'))
    slider.getBoundingClientRect = () => rect(100, 400)
    const marker = (text: string) =>
      within(slider).getByText(text).closest<HTMLElement>('[style]')!
    expect(marker('Culture')).toHaveStyle({ top: '25%' })
    const topic = screen.getByRole('region', { name: 'Music and art' })
    const top =
      ((topic.getBoundingClientRect().top + main.scrollTop) / height) * 100
    expect(marker('Music and art')).toHaveStyle({ top: `${top}%` })
    expect(
      [...slider.querySelectorAll<HTMLElement>('span[style]')].some(
        (el) => el.style.top === '37.5%' && el.style.height === '25%',
      ),
    ).toBe(true)
    fireEvent.pointerDown(slider, {
      clientY: 100 + (top / 100) * 400,
      pointerId: 1,
      buttons: 1,
    })
    fireEvent.pointerUp(slider, {
      clientY: 100 + (top / 100) * 400,
      pointerId: 1,
    })
    expect(window.location.hash).toBe('#culture-music-and-art')
    fireEvent.wheel(main)

    fireEvent.pointerDown(slider, { clientY: 300, pointerId: 1, buttons: 1 })
    // A plate that sticks while the page scrolls moves the track mid-drag.
    slider.getBoundingClientRect = () => rect(-200, 400)
    fireEvent.pointerMove(slider, { clientY: 380, pointerId: 1, buttons: 1 })
    fireEvent.pointerUp(slider, { clientY: 380, pointerId: 1 })
    expect(scroll).toHaveBeenLastCalledWith({
      top: 1150,
      behavior: 'auto',
    })
    slider.getBoundingClientRect = () => rect(100, 400)
    expect(windowScroll).not.toHaveBeenCalled()
    fireEvent.keyDown(slider, { key: 'End' })
    expect(scroll).toHaveBeenLastCalledWith({
      top: 2000,
      behavior: 'auto',
    })

    main.scrollTop = 750
    height = 3000
    const image = document.querySelector('article.location-detail img')!
    fireEvent.load(image)
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '30'))
    const faith = screen.getByRole('region', { name: 'Faith' })
    const faithTop =
      ((faith.getBoundingClientRect().top + main.scrollTop) / height) * 100
    await waitFor(() =>
      expect(parseFloat(marker('Faith').style.top)).toBeCloseTo(faithTop, 2),
    )
    expect(within(slider).queryByText('Music and art')).toBeNull()
    height = 4000
    fireEvent.resize(window)
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '21'))
    height = 1200
    positions.history = 600
    await userEvent.click(
      within(screen.getByRole('region', { name: 'Culture' })).getByRole(
        'button',
        { name: 'Culture' },
      ),
    )
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '100'))
    expect(within(slider).queryByText('Music and art')).toBeNull()
    const topics = await openParts(nav, 'Culture')
    expect(
      within(topics).getByRole('link', { name: /Music and art/ }),
    ).toBeVisible()
  })

  it('maps prose History headings at their measured positions and reopens folds', async () => {
    localStorage.setItem('placeNavigation', 'map')
    renderAt(KHOLINAR, [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    const nav = await plateNav('map')
    const main = document.querySelector<HTMLElement>('.app-main')!
    const article = screen.getByRole('article', { name: 'Kholinar' })
    const history = screen.getByRole('region', { name: 'History' })
    const rect = (top: number, height: number) =>
      ({ top, height, bottom: top + height }) as DOMRect
    Object.defineProperty(main, 'clientHeight', {
      configurable: true,
      value: 500,
    })
    main.getBoundingClientRect = () => rect(0, 500)
    article.getBoundingClientRect = () => rect(-main.scrollTop, 3000)
    article.querySelectorAll<HTMLElement>('[data-toc]').forEach((section) => {
      const top =
        section.id === 'history' ? 800 : section.id === 'about' ? 200 : 2700
      section.getBoundingClientRect = () => rect(top - main.scrollTop, 200)
    })
    const headings = [
      ...history.querySelectorAll<HTMLElement>('[data-toc-sub]'),
    ]
    headings.forEach((section, index) => {
      section.getBoundingClientRect = () =>
        rect(1000 + index * 250 - main.scrollTop, 200)
    })
    fireEvent.resize(window)
    const slider = within(nav).getByRole('slider', { name: 'Page position' })
    const target = screen.getByRole('region', { name: 'Occupation' })
    const expected =
      ((target.getBoundingClientRect().top + main.scrollTop) / 3000) * 100
    await waitFor(() => {
      const marker = within(slider)
        .getByText('Occupation')
        .closest<HTMLElement>('[style]')!
      expect(parseFloat(marker.style.top)).toBeCloseTo(expected, 2)
    })
    await userEvent.click(
      within(history).getByRole('button', { name: 'History' }),
    )
    await waitFor(() =>
      expect(within(slider).queryByText('Occupation')).toBeNull(),
    )
    const parts = await openParts(nav, 'History')
    await userEvent.click(
      within(parts).getByRole('link', { name: 'Occupation' }),
    )
    expect(
      within(history).getByRole('button', { name: 'History' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() =>
      expect(within(slider).getByText('Occupation')).toBeInTheDocument(),
    )
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

  it('opens the page map without dragging and jumps from its sheet', async () => {
    const user = userEvent.setup()
    renderAt()
    await screen.findByRole('button', { name: /^Contents/ })
    await user.click(
      within(screen.getByRole('group', { name: 'Navigation style' })).getByRole(
        'button',
        { name: /Navigation C/ },
      ),
    )
    const edge = screen.getByRole('button', { name: 'Open page map' })
    await user.click(edge)
    const sheet = screen.getByRole('dialog', { name: 'Page map' })
    const nav = within(sheet).getByRole('navigation', { name: 'Page map' })
    const browse = within(nav).getByText('Browse all sections, topics and eras')
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(browse).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(
      within(sheet).getByRole('button', { name: 'Close navigation' }),
    ).toHaveFocus()
    await openMapList(nav)
    await user.click(within(nav).getByRole('link', { name: 'History' }))
    expect(sheet).not.toHaveAttribute('open')
    expect(edge).toHaveFocus()
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

  it('drags the edge through the app and does not open the sheet by accident', async () => {
    vi.stubGlobal('PointerEvent', MouseEvent)
    localStorage.setItem('placeNavigation', 'map')
    renderAt()
    const edge = await screen.findByRole('button', { name: 'Open page map' })
    const main = document.querySelector<HTMLElement>('.app-main')!
    const article = screen.getByRole('article', { name: 'Alethkar' })
    const rect = (top: number, height: number) =>
      ({ top, height, bottom: top + height }) as DOMRect
    main.getBoundingClientRect = () => rect(0, 500)
    article.getBoundingClientRect = () => rect(-main.scrollTop, 2000)
    edge.getBoundingClientRect = () => rect(100, 400)
    Object.defineProperty(main, 'clientHeight', {
      configurable: true,
      value: 500,
    })
    const scroll = vi.fn((options: ScrollToOptions) => {
      main.scrollTop = options.top ?? 0
      fireEvent.scroll(main)
    })
    Object.defineProperty(main, 'scrollTo', {
      configurable: true,
      value: scroll,
    })
    fireEvent.scroll(main)
    fireEvent.pointerDown(edge, { clientY: 200, pointerId: 1, buttons: 1 })
    fireEvent.pointerMove(edge, { clientY: 320, pointerId: 1, buttons: 1 })
    expect(screen.getByRole('status')).toHaveTextContent(/%/)
    fireEvent.pointerUp(edge, { clientY: 320, pointerId: 1 })
    fireEvent.click(edge)
    expect(scroll).toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Page map' })).toBeNull()
    await userEvent.click(edge)
    expect(screen.getByRole('dialog', { name: 'Page map' })).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Close navigation' }),
    )
    fireEvent.pointerDown(edge, { clientY: 200, pointerId: 2, buttons: 1 })
    fireEvent.pointerMove(edge, { clientY: 320, pointerId: 2, buttons: 1 })
    fireEvent.pointerUp(edge, { clientY: 320, pointerId: 2 })
    // Some browsers omit the synthetic click after a drag.
    await userEvent.click(edge)
    expect(screen.getByRole('dialog', { name: 'Page map' })).toBeInTheDocument()
  })
})

describe('prose History spoiler boundary', { timeout: 30000 }, () => {
  it.each([
    ['contents', false],
    ['map', false],
    ['contents', true],
    ['map', true],
  ] as const)(
    '%s navigation on phone=%s hides a subsection before its chapter',
    async (mode, phone) => {
      wideScreen(!phone)
      const user = userEvent.setup()
      localStorage.setItem('placeNavigation', mode)
      renderAt(`${KHOLINAR}?comparison=on`, [...THROUGH_WOR, 'oathbringer'], {
        'rhythm-of-war': '43',
      })
      const open = async () => {
        if (!phone) {
          const nav = await plateNav(mode)
          await openParts(nav, 'History')
          return nav
        }
        const trigger = await screen.findByRole('button', {
          name: mode === 'contents' ? /^Contents/ : /^Page map/,
        })
        await user.click(trigger)
        const sheet = screen.getByRole('dialog', {
          name: mode === 'contents' ? 'On this page' : 'Page map',
        })
        const nav = within(sheet).getByRole('navigation', {
          name: mode === 'contents' ? 'On this page' : 'Page map',
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
