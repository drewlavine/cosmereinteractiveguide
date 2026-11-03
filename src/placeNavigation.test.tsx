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
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BooksReadProvider } from './components/BooksReadProvider'
import { PlacePage as DesignD } from './components/look-d/PlacePage'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const ALETHKAR = '/systems/rosharan/planets/roshar/locations/alethkar'
const THROUGH_WOR = ['way-of-kings', 'words-of-radiance', 'edgedancer']

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
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

async function plateNav(mode: 'contents' | 'map' = 'contents') {
  const plate = await screen.findByRole('complementary', { name: 'Plate' })
  return within(plate).findByRole('navigation', {
    name: mode === 'contents' ? 'On this page' : 'Page map',
  })
}

async function openParts(nav: HTMLElement, section: string) {
  const toggle = await within(nav).findByRole('button', {
    name: new RegExp(`^(Show|Hide) ${section} (topics|eras|parts)$`),
  })
  if (toggle.getAttribute('aria-expanded') === 'false')
    await userEvent.click(toggle)
  return document.getElementById(toggle.getAttribute('aria-controls')!)!
}

beforeEach(() => wideScreen(true))
afterEach(() => {
  cleanup()
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
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual(metroTitles)
      expect(history).toHaveTextContent('The Hierocracy and Sadees')
      expect(history).not.toHaveTextContent('The Hierocracy and the Sunmaker')

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
      const count = within(earlier).getAllByRole('button').length
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
        within(await openParts(nav, 'History')).getAllByRole('button'),
      ).toHaveLength(count + 1)
      expect(nav.innerHTML).not.toContain('long-ago')
      await user.click(within(settings).getByRole('button', { name: 'Done' }))
      await user.click(within(nav).getByRole('button', { name: 'Long ago' }))
      expect(window.location.hash).toBe('#history')

      await user.click(screen.getByRole('button', { name: /Books Read/ }))
      await user.selectOptions(
        within(screen.getByRole('dialog', { name: 'Books Read' })).getByRole(
          'combobox',
          { name: 'Last chapter finished in Oathbringer' },
        ),
        '112',
      )
      await waitFor(() => expect(nav).not.toHaveTextContent('Long ago'))
      expect(
        within(await openParts(nav, 'History')).getAllByRole('button'),
      ).toHaveLength(count)
    },
  )

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
      await user.click(within(eras).getByRole('button', { name: targetTitle }))
      expect(historyToggle).toHaveAttribute('aria-expanded', 'true')
      expect(
        within(metro).getByRole('button', { name: targetTitle }),
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        within(eras).getByRole('button', { name: targetTitle }),
      ).toHaveAttribute('aria-current', 'location')
      expect(window.location.hash).toBe('#history')

      await user.click(within(metro).getByRole('button', { name: lastTitle }))
      await waitFor(() =>
        expect(
          within(eras).getByRole('button', { name: lastTitle }),
        ).toHaveAttribute('aria-current', 'location'),
      )
      expect(
        within(eras).getByRole('button', { name: targetTitle }),
      ).not.toHaveAttribute('aria-current')
      fireEvent.keyDown(within(history).getByRole('slider'), { key: 'Home' })
      const firstTitle = metroButtons[0].textContent!
      await waitFor(() =>
        expect(
          within(eras).getByRole('button', { name: firstTitle }),
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
    const track = slider.parentElement!
    track.getBoundingClientRect = () => rect(100, 400)
    const bars = track.querySelectorAll<HTMLElement>('span[aria-hidden]')
    expect(bars[0]).toHaveStyle({ height: '10%' })
    expect(bars[bars.length - 1]).toHaveStyle({
      top: '37.5%',
      height: '25%',
    })

    fireEvent.pointerDown(slider, { clientY: 300, pointerId: 1, buttons: 1 })
    fireEvent.pointerMove(slider, { clientY: 380, pointerId: 1, buttons: 1 })
    fireEvent.pointerUp(slider, { clientY: 380, pointerId: 1 })
    expect(scroll).toHaveBeenLastCalledWith({
      top: 1150,
      behavior: 'auto',
    })
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
    fireEvent.pointerUp(edge, { clientY: 320, pointerId: 1 })
    fireEvent.click(edge)
    expect(scroll).toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Page map' })).toBeNull()
    await userEvent.click(edge)
    expect(screen.getByRole('dialog', { name: 'Page map' })).toBeInTheDocument()
  })
})
