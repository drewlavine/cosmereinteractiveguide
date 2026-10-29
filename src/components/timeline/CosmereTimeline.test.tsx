import {
  act,
  cleanup,
  fireEvent,
  getByText,
  render,
  within,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routes } from '../../routes'
import { BOOKS_READ_KEY } from '../../state/booksRead'
import type { ExplorerCanvasProps } from '../explorer/ExplorerCanvas'
import { titleStyles } from './worldTitleStyle'

const webgl = vi.hoisted(() => ({ ok: true }))
vi.mock('../explorer/webgl', () => ({
  hasWebGL: () => webgl.ok,
  reducedMotion: () => true,
}))
// jsdom has no WebGL: a stand-in shows where the camera was sent.
vi.mock('../explorer/ExplorerCanvas', async () => {
  const { placeGroups } = await import('../explorer/flags')
  return {
    default: (p: ExplorerCanvasProps) => (
      <div
        data-testid="explorer"
        data-goal={JSON.stringify(p.goal)}
        data-worlds={p.worlds.map((w) => w.id).join()}
        data-pins={p.pins.map((x) => x.id).join()}
        data-effect={p.effect && JSON.stringify(p.effect)}
        data-placed={p.people?.flatMap((o) => (o.at ? [o.id] : [])).join()}
        data-people={p.people?.map((o) => `${o.id}@${o.world}`).join()}
        data-flags={placeGroups(p.people ?? [])
          .map((g) => `${g.name}:${g.members.length}`)
          .join()}
        data-zoom-in={p.zoomIn}
      >
        {p.children}
        {p.globeTitle}
        <button type="button" onClick={() => p.onGlobe?.(true)}>
          down to the globe
        </button>
        <button type="button" onClick={p.onBackground}>
          click the map
        </button>
        <button type="button" onClick={() => p.onExplore(undefined)}>
          zoom out past the world
        </button>
        <button
          type="button"
          onClick={() => p.onView?.({ world: 'scadrial', level: 'world' })}
        >
          fly to Scadrial
        </button>
        <button
          type="button"
          onClick={() => p.onView?.({ world: 'sel', level: 'world' })}
        >
          fly to sel
        </button>
        <button
          type="button"
          onClick={() => p.onView?.({ world: 'scadrial', level: 'sky' })}
        >
          rise to the sky
        </button>
        {p.onReset && (
          <button
            type="button"
            aria-label="Reset the view"
            onClick={p.onReset}
          />
        )}
      </div>
    ),
  }
})

const renderAt = (
  path: string,
  read: string[] = [],
  reading: Record<string, string | null> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { ...render(<RouterProvider router={router} />), router }
}

const BEFORE_WAT = [
  'elantris',
  'final-empire',
  'well-of-ascension',
  'hero-of-ages',
  'secret-history',
  'warbreaker',
  'way-of-kings',
  'words-of-radiance',
  'oathbringer',
  'rhythm-of-war',
  'shadows-for-silence',
  'white-sand-omnibus',
  'arcanum-unbounded',
  'sunlit-man',
]

const markers = (c: HTMLElement) =>
  [...c.querySelectorAll('ol[aria-label="Events, earliest first"] button')].map(
    (b) => b.getAttribute('aria-label'),
  )
const cardTitle = (c: HTMLElement) => c.querySelector('section h2')?.textContent
const indicator = (c: HTMLElement) =>
  c.querySelector('p[aria-live]')?.textContent
const worldsToggle = (c: HTMLElement) =>
  c.querySelector('nav[aria-label="Worlds"] button[aria-expanded]')!
const openWorlds = (c: HTMLElement) => {
  if (worldsToggle(c).getAttribute('aria-expanded') === 'false')
    click(worldsToggle(c))
}
const worldButtons = (c: HTMLElement) => {
  openWorlds(c)
  // Not "Back to the event" while it's faded out.
  return [
    ...c.querySelectorAll(
      '#timeline-worlds button, nav[aria-label="Worlds"] > button:not([aria-hidden])',
    ),
  ].map((b) => b.textContent)
}
const goal = async (find: (id: string) => Promise<HTMLElement>) =>
  JSON.parse((await find('explorer')).dataset.goal!)
const effect = async (find: (id: string) => Promise<HTMLElement>) => {
  const e = (await find('explorer')).dataset.effect
  return e && JSON.parse(e)
}
const press = (el: Element, key: string) =>
  act(() => {
    fireEvent.keyDown(el, { key })
  })
const click = (el: Element | null) =>
  act(() => {
    fireEvent.click(el!)
  })

afterEach(() => {
  cleanup()
  localStorage.clear()
  webgl.ok = true
})

describe('Cosmere Timeline page', () => {
  it('shows no event before the reader starts a book', async () => {
    const { container, findByText } = renderAt('/timeline')
    expect(await findByText(/Nothing on the timeline yet/)).toBeInTheDocument()
    expect(markers(container)).toEqual([])
  })

  it('shows only the prelude, undated, at the start of The Way of Kings', async () => {
    const { container, findByRole, findByTestId } = renderAt('/timeline', [], {
      'way-of-kings': 'prelude',
    })
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(markers(container)).toEqual([
      'The Heralds abandon the Oathpact, on Roshar',
    ])
    expect(cardTitle(container)).toBe('The Heralds abandon the Oathpact')
    expect(indicator(container)).toBe('UndatedRoshar')
    expect(worldButtons(container)).toEqual(['✦ The Cosmere', 'Roshar'])
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'map',
      key: 'event:oathpact-abandoned',
    })
    expect(stage.textContent).not.toMatch(/Gavilar|Shattering|Elantris|Sel/)
  })

  it("steps through Drew's timeline, flying to each event's world", async () => {
    const { container, findByRole, findByTestId } = renderAt(
      '/timeline',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(cardTitle(container)).toBe('Adonalsium creates Roshar')
    // One count for every world, once the reader knows of the Shattering.
    expect(indicator(container)).toBe('ca. 1050before the ShatteringRoshar')
    // The card keeps to one line; the rest is under More.
    expect(container.querySelector('section')?.textContent).not.toMatch(
      /Word of Brandon/,
    )
    click(container.querySelector('section button[aria-expanded]'))
    expect(container.querySelector('aside')?.textContent).toMatch(
      /Word of Brandon/,
    )
    // The world's own date, too.
    expect(container.querySelector('aside')?.textContent).toMatch(
      /ca\. \u22129742 · Rosharan year/,
    )
    press(stage, 'Escape')
    expect(container.querySelector('aside')).toBeNull()

    press(stage, 'ArrowRight')
    expect(cardTitle(container)).toBe('The Shattering of Adonalsium')
    expect(await goal(findByTestId)).toEqual({ key: 'event:shattering' })
    // The burst plays out in open space, pointing at no world.
    expect(await effect(findByTestId)).toEqual({
      kind: 'shattering',
      key: 'effect:shattering',
    })
    press(stage, 'ArrowRight')
    expect(await effect(findByTestId)).toBeUndefined()

    press(stage, 'End')
    expect(cardTitle(container)).toBe('Eshonai takes control from the Five')
    press(stage, 'ArrowLeft')
    expect(cardTitle(container)).toBe('Gavilar is assassinated')
    expect(indicator(container)).toBe('ca. 10958after the ShatteringRoshar')
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'pin',
      pin: [1936, 796],
      key: 'event:gavilar-assassinated',
    })

    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('Kaladin is born')
    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('Dalinar Kholin is born')
    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('Sazed becomes Harmony')
    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('The Manywar ends')
    expect(container.textContent).toMatch(/The Shards settle/)
    // Nothing from past chapter 17 of Wind and Truth, anywhere.
    expect(stage.textContent).not.toMatch(/Yolen/)
    expect(markers(container)).toHaveLength(20)
    expect((await findByTestId('explorer')).dataset.worlds).not.toMatch(/yolen/)
  })

  it('bursts the Shattering from its world once Wind and Truth is finished', async () => {
    const { findByRole, findByTestId } = renderAt('/timeline', [
      ...BEFORE_WAT,
      'wind-and-truth',
    ])
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    press(stage, 'ArrowRight')
    expect(await goal(findByTestId)).toEqual({
      world: 'yolen',
      view: 'globe',
      key: 'event:shattering',
    })
    expect(await effect(findByTestId)).toEqual({
      kind: 'shattering',
      world: 'yolen',
      key: 'effect:shattering',
    })
  })

  it('zooms out to the Cosmere and looks in on another world', async () => {
    const { container, findByRole, findByTestId, findByText } = renderAt(
      '/timeline',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    // The worlds start tucked away behind the planet button.
    expect(container.querySelector('#timeline-worlds')).toBeNull()
    click(await findByText('zoom out past the world'))
    expect(await goal(findByTestId)).toEqual({ key: 'cosmere' })
    expect(worldButtons(container)).toContain('↩ Back to the event')

    openWorlds(container)
    const scadrial = [
      ...container.querySelectorAll('nav[aria-label="Worlds"] button'),
    ].find((b) => b.textContent === 'Scadrial')
    click(scadrial!)
    expect(worldsToggle(container)).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('#timeline-worlds')).toBeNull()
    expect(await goal(findByTestId)).toEqual({
      world: 'scadrial',
      view: 'globe',
      key: 'world:scadrial',
    })
    // Off on another world: no event card, just the world's name.
    expect(container.querySelector('section')).toBeNull()

    click(container.querySelector('[aria-label="Next event"]'))
    expect(cardTitle(container)).toBe('The Shattering of Adonalsium')
    expect(worldButtons(container)).not.toContain('↩ Back to the event')
  })

  it('never opens a hidden event from the address', async () => {
    const { container, findByRole } = renderAt(
      '/timeline?event=gavilar-assassinated',
      [],
      { 'way-of-kings': 'prelude' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(cardTitle(container)).toBe('The Heralds abandon the Oathpact')
    expect(stage.textContent).not.toMatch(/Gavilar/)
  })

  it('keeps the timeline working without WebGL', async () => {
    webgl.ok = false
    const { container, findByRole, queryByTestId } = renderAt('/timeline', [], {
      'way-of-kings': 'prologue',
    })
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(stage.textContent).toMatch(/needs WebGL/)
    expect(queryByTestId('explorer')).toBeNull()
    expect(cardTitle(container)).toBe('The Heralds abandon the Oathpact')
  })

  it('goes full screen, and Escape leaves it without zooming out', async () => {
    const { findByRole, findByTestId } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    const button = stage.querySelector('[aria-label="Full screen"]')!
    const before = await goal(findByTestId)
    click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    press(stage, 'Escape')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(await goal(findByTestId)).toEqual(before)
  })

  it("reads an event's page in place, without leaving the timeline", async () => {
    const { container, findByRole } = renderAt(
      '/timeline?event=oathpact-abandoned',
      ['way-of-kings', 'words-of-radiance', 'oathbringer'],
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    const card = container.querySelector('section')!
    expect(card.textContent).toMatch(/Heralds leave their Honorblades/)
    expect(card.textContent).not.toMatch(/Kalak/)
    click(card.querySelector('button[aria-expanded]'))
    const details = container.querySelector('aside')!
    expect(details.textContent).toMatch(/Kalak and Jezrien meet/)
    // The Last Desolation's own page, loaded into the panel.
    // The story loads lazily, slower under the full suite.
    await vi.waitFor(
      () => expect(details.textContent).toMatch(/Vorin tradition says mankind/),
      { timeout: 5000 },
    )
    expect(details.textContent).not.toMatch(/Wind and Truth/)
    // Moving to another event closes the panel.
    click(container.querySelector('[aria-label="Next event"]'))
    expect(container.querySelector('aside')).toBeNull()
  })

  it('names the world on screen, wherever the reader flies', async () => {
    const { container, findByRole, getByText } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    const on = () =>
      container.querySelector('[data-tooltip="Where the map is"]')
    expect(on()?.textContent).toBe('Roshar')
    click(getByText('fly to Scadrial'))
    expect(on()?.textContent).toBe('Scadrial')
    click(getByText('rise to the sky'))
    expect(on()?.textContent).toBe('The Cosmere')
  })

  it("tiles an event's characters in its panel", async () => {
    const { container, findByRole } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    click(container.querySelector('section button[aria-expanded]'))
    const details = container.querySelector('aside')!
    expect(getByText(details, 'Characters').tagName).toBe('H3')
    expect(
      details.querySelector('a[href="/characters/szeth"]')?.textContent,
    ).toMatch(/Szeth/)
  })

  it('resets the view to the default for what the reader is looking at', async () => {
    const { findByRole, findByTestId } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    const explorer = await findByTestId('explorer')
    // Full screen sits with the zoom and reset buttons, on top.
    expect(explorer.querySelector('[aria-label="Full screen"]')).not.toBeNull()
    click(explorer.querySelector('[aria-label="Reset the view"]'))
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'pin',
      pin: [1936, 796],
      key: 'event:gavilar-assassinated#reset1',
    })
  })

  it('lists the Shards only once the reader knows them', async () => {
    const before = renderAt('/timeline', ['way-of-kings', 'hero-of-ages'])
    await before.findByRole('group', { name: 'Cosmere Timeline' })
    expect(before.container.querySelector('[aria-label="Shards"]')).toBeNull()
    cleanup()

    const { container, findByRole, findByTestId, router } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    click(container.querySelector('[aria-label="Shards"]'))
    const [list, unknown] = container.querySelectorAll('#timeline-shards ul')
    const names = (ul: Element) =>
      [...ul.querySelectorAll('button > span')].map(
        (n) => n.firstChild?.textContent,
      )
    expect(names(list)).toEqual([
      'Preservation',
      'Ruin',
      'Devotion',
      'Dominion',
      'Honor',
      'Cultivation',
      'Odium',
      'Endowment',
      'Autonomy',
      'Ambition',
    ])
    expect(list.previousElementSibling?.textContent).toBe('Location known')
    // Each row: the Shard's art, name and planet.
    expect(list.querySelector('li')?.textContent).toBe(
      'PreservationOn Scadrial',
    )
    // Shards with no known home come last, under their own heading.
    expect(unknown.previousElementSibling?.textContent).toBe('Location unknown')
    expect(names(unknown)).toEqual(['Invention', 'Whimsy', 'Mercy', 'Valor'])
    expect(unknown.querySelector('li')?.textContent).toBe('Invention')
    // One zooms out to the whole Cosmere and opens its details.
    click(unknown.querySelector('button'))
    expect(container.querySelector('#timeline-shard h2')?.textContent).toBe(
      'Invention',
    )
    expect(await goal(findByTestId)).toEqual({ key: 'cosmere' })
    expect(container.querySelector('#timeline-shards')).toBeNull()
    click(container.querySelector('[aria-label="Shards"]'))
    click(
      container.querySelector('#timeline-shards button[data-tooltip^="Fly"]'),
    )
    // It flies there and opens the Shard's details.
    expect(container.querySelector('#timeline-shard h2')?.textContent).toBe(
      'Preservation',
    )
    expect(await goal(findByTestId)).toEqual({
      world: 'scadrial',
      view: 'globe',
      key: 'world:scadrial',
    })
    // Only the camera moves: the timeline stays where it was.
    expect(router.state.location.search).toBe('?event=gavilar-assassinated')
    // Just the Shards: no event card over the world.
    expect(container.querySelector('section[aria-live]')).toBeNull()
    // Any other move brings the event card back.
    click(container.querySelector('button[aria-label="Worlds"]'))
    click(container.querySelector('#timeline-worlds button'))
    expect(container.querySelector('section[aria-live]')).not.toBeNull()
  })

  it("opens the world card from the globe's title, and closes it every way", async () => {
    const { container, findByTestId, getByText } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const explorer = await findByTestId('explorer')
    const title = () =>
      container.querySelector<HTMLElement>('[data-world-title]')
    // Only once the globe is in view.
    expect(title()).toBeNull()
    click(getByText('down to the globe'))
    // By default, a chip with the world's state.
    expect(title()?.textContent).toBe('State of Roshar:The Vengeance Pact')
    const dialog = () => container.querySelector('[role="dialog"]')
    const open = () => {
      title()!.focus()
      click(title())
      return dialog()!
    }
    const shut = (how: () => void) => {
      open()
      expect(document.activeElement).toHaveAttribute('aria-label', 'Close')
      how()
      expect(dialog()).toBeNull()
      expect(document.activeElement).toBe(title())
    }
    shut(() => {
      expect(dialog()).toHaveAccessibleName('Roshar')
      press(document.activeElement!, 'Escape')
    })
    shut(() => click(dialog()!.querySelector('[aria-label="Close"]')))
    shut(() => click(dialog()!.previousElementSibling))
    // A click on the planet zooms into its map.
    click(open().querySelector('[aria-label="Zoom into Roshar\'s map"]'))
    expect(dialog()).toBeNull()
    expect(explorer.dataset.zoomIn).toBe('1')
    // A Shard opens its details; Honor is dead by now, greyed out.
    const honor = open().querySelector('[data-tooltip="About Honor"]')!
    expect(honor.querySelector('img')).toHaveAttribute('data-faded')
    click(honor)
    expect(dialog()).toBeNull()
    expect(container.querySelector('#timeline-shard h2')?.textContent).toBe(
      'Honor',
    )
    const shardAt = (world: string, id: string) => {
      click(getByText(`fly to ${world}`))
      click(open().querySelector(`[data-tooltip="About ${id}"]`))
      return container.querySelector('#timeline-shard')!.textContent
    }
    // Gavilar dies after Mistborn's first era: Sazed holds both by then.
    expect(shardAt('Scadrial', 'Preservation')).toBe(
      '×PreservationArt: Cam KutaStatusJoined with Ruin as Harmony' +
        'VesselSazedArt: Chris Rallis',
    )
    // Splintered; Aona's name and art wait for Wind and Truth.
    expect(shardAt('sel', 'Devotion')).toBe(
      '×DevotionArt: Cam KutaStatusSplintered by Odium',
    )
  })

  it('tries each style of the way into the world card', async () => {
    const at = async (path: string) => {
      const r = renderAt(path, BEFORE_WAT, { 'wind-and-truth': '17' })
      await r.findByTestId('explorer')
      click(r.getByText('down to the globe'))
      const way = r.container.querySelector('[data-world-title]')!
      const switcher = () =>
        r.queryByRole('group', { name: /^Try a style/ }) as HTMLElement
      return { ...r, way, switcher }
    }
    const ways = new Set<string>()
    for (const { id, label } of titleStyles) {
      const { container, way, switcher } = await at(
        `/timeline?event=gavilar-assassinated&title=${id}`,
      )
      ways.add(way.outerHTML)
      click(within(switcher()).getByRole('button', { expanded: false }))
      expect(
        within(switcher()).getByRole('button', { pressed: true }),
      ).toHaveTextContent(label)
      click(way)
      expect(container.querySelector('[role="dialog"]')).toHaveAccessibleName(
        'Roshar',
      )
      // Put away under the dialog.
      expect(switcher()).toBeNull()
      cleanup()
    }
    // A different way in for each.
    expect(ways.size).toBe(titleStyles.length)
    // The last pick is kept; the switcher picks another, into the URL too.
    const { way, switcher, router, container } = await at(
      '/timeline?event=gavilar-assassinated',
    )
    expect(way.textContent).toBe('State of Roshar')
    click(within(switcher()).getByRole('button', { expanded: false }))
    click(within(switcher()).getByRole('button', { name: /Pill/ }))
    expect(router.state.location.search).toContain('title=current')
    expect(container.querySelector('[data-world-title]')?.textContent).toBe(
      'RosharDetails ›',
    )
  })

  it('makes the name the way in where the chip has no state to show', async () => {
    const { container, findByTestId, getByText } = renderAt(
      '/timeline?event=gavilar-assassinated&title=state',
      ['final-empire', 'way-of-kings'],
    )
    await findByTestId('explorer')
    click(getByText('down to the globe'))
    const way = () => container.querySelector('[data-world-title]')
    expect(way()?.textContent).toMatch(/^State of Roshar:/)
    // Scadrial's states wait for The Hero of Ages.
    click(getByText('fly to Scadrial'))
    expect(way()?.textContent).toBe('Scadrial')
    click(way())
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toHaveAccessibleName('Scadrial')
    expect(dialog?.querySelector('[aria-label="State"]')).toBeNull()
  })

  it('lists on the world card only what the reader knows by then', async () => {
    const card = async (
      read: string[],
      reading: Record<string, string>,
      event: string,
    ) => {
      const { container, findByTestId, getByText } = renderAt(
        `/timeline?event=${event}`,
        read,
        reading,
      )
      await findByTestId('explorer')
      click(getByText('down to the globe'))
      click(container.querySelector('[data-world-title]'))
      const d = container.querySelector('[role="dialog"]')!
      const out = {
        state: d.querySelector('[aria-label="State"]')?.textContent,
        shards: [...d.querySelectorAll('[aria-label="Shards"] strong')].map(
          (n) => n.textContent,
        ),
        people: [
          ...d.querySelectorAll('[aria-label="Notable characters"] strong'),
        ].map((n) => n.textContent),
      }
      cleanup()
      return out
    }
    // Drew, partway through Wind and Truth.
    expect(
      await card(
        BEFORE_WAT,
        { 'wind-and-truth': '17' },
        'gavilar-assassinated',
      ),
    ).toEqual({
      state:
        "StateThe Vengeance PactAlethkar's highprinces fight the Parshendi" +
        ' on the Shattered Plains to avenge Gavilar.',
      shards: ['Honor', 'Cultivation', 'Odium'],
      people: [
        'Dalinar Kholin',
        'Kaladin',
        'Adolin Kholin',
        'Shallan Davar',
        'Navani Kholin',
        'Jasnah Kholin',
        'Torol Sadeas',
        'Elhokar Kholin',
        'Renarin Kholin',
        'Meridas Amaram',
        'Szeth',
        'Lirin',
        'Eshonai',
        'Jezrien',
        'Kalak',
        'Hesina',
      ],
    })
    // Partway through The Way of Kings: no Shards yet, nor the Vengeance
    // Pact, nor anyone not yet met.
    expect(
      await card([], { 'way-of-kings': '17' }, 'gavilar-assassinated'),
    ).toEqual({
      state:
        'StateAfter the HeraldsThe Heralds have ended the Oathpact, leaving' +
        " their Honorblades in the stone.Since the Heralds' departure",
      shards: [],
      people: [
        'Dalinar Kholin',
        'Elhokar Kholin',
        'Hesina',
        'Jezrien',
        'Kaladin',
        'Kalak',
        'Lirin',
        'Szeth',
        'Torol Sadeas',
      ],
    })
  })

  it('passes the notable characters alive at this point to the map', async () => {
    const { findByTestId } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const people = (await findByTestId('explorer')).dataset.people!.split(',')
    // Only those alive, with known whereabouts, by Gavilar's death (the
    // feast's guests from the prologues, the Hearthstone family, and Era 1's
    // immortals as last seen); the main characters first.
    expect(people).toEqual([
      'dalinar-kholin@roshar',
      'kaladin@roshar',
      'adolin-kholin@roshar',
      'shallan-davar@roshar',
      'navani-kholin@roshar',
      'kelsier@scadrial',
      'jasnah-kholin@roshar',
      'torol-sadeas@roshar',
      'elhokar-kholin@roshar',
      'sazed@scadrial',
      'renarin-kholin@roshar',
      'meridas-amaram@roshar',
      'szeth@roshar',
      'lirin@roshar',
      'tensoon@scadrial',
      'eshonai@roshar',
      'jezrien@roshar',
      'kalak@roshar',
      'hesina@roshar',
    ])
  })

  it('finds a notable character and where they are at this point', async () => {
    const { container, findByRole, findByTestId } = renderAt(
      '/timeline?event=oathpact-abandoned',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    const panel = () => container.querySelector('#timeline-people')!
    const rows = () =>
      [...panel().querySelectorAll('li')].map((li) => li.textContent)
    // Moving to another event closes the panel, so each search reopens it.
    const find = (value: string) => {
      if (!panel())
        click(container.querySelector('[aria-label="Notable characters"]'))
      act(() => {
        fireEvent.change(panel().querySelector('input')!, { target: { value } })
      })
    }
    find('kal')
    expect(rows()).toEqual([
      'Kalak',
      'Vasher (Zahel)',
      'KaladinNot born for about another 4486 yearsJump to their birth',
    ])
    // The living, by world and then those whose world isn't known, in
    // groups that fold away, each with a count.
    const heads = (sel: string) =>
      [...panel().querySelectorAll(sel)].map((h) => h.textContent)
    expect(heads('h3')).toEqual(['Known alive', 'Everyone else'])
    expect(heads('h4')).toEqual(['On Roshar', 'Location unknown'])
    expect(heads('summary')).toEqual([
      'Known alive2',
      'On Roshar1',
      'Location unknown1',
      'Everyone else1',
    ])
    expect(panel().querySelectorAll('details[open]')).toHaveLength(4)
    click(panel().querySelector('summary'))
    expect(panel().querySelectorAll('details[open]')).toHaveLength(3)
    click(panel().querySelector('summary'))
    click(
      [...panel().querySelectorAll('button')].find(
        (b) => b.textContent === 'Jump to their birth',
      ) ?? null,
    )
    expect(cardTitle(container)).toBe('Kaladin is born')
    expect(panel()).toBeNull()
    find('kal')
    click(
      [...panel().querySelectorAll('li button')].find((b) =>
        b.textContent?.startsWith('Kaladin'),
      ) ?? null,
    )
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'pin',
      pin: [1922, 631],
      key: 'person:kaladin',
    })
    expect(container.textContent).toMatch(/Kaladin is here on Roshar/)
    // Clicking elsewhere on the map closes it.
    click(getByText(container, 'click the map'))
    expect(container.textContent).not.toMatch(/Kaladin is here/)

    press(stage, 'End')
    press(stage, 'ArrowLeft')
    find('gavilar')
    expect(rows()).toEqual([
      expect.stringMatching(/Gavilar KholinDied this yearJump to their death$/),
    ])
    find('szeth')
    click(panel().querySelector('li button'))
    expect(await goal(findByTestId)).toMatchObject({
      view: 'pin',
      pin: [1936, 796],
      key: 'person:szeth',
    })
    // On the map with everyone else whose spot is known, picked or not.
    expect((await findByTestId('explorer')).dataset.placed!.split(',')).toEqual(
      expect.arrayContaining(['szeth', 'kaladin']),
    )
  })

  it('flags each place with only the people the reader has met', async () => {
    const flags = async (read: string[], reading = {}) => {
      const { findByTestId } = renderAt(
        '/timeline?event=eshonai-takes-control',
        read,
        reading,
      )
      const out = (await findByTestId('explorer')).dataset.flags!.split(',')
      cleanup()
      return out
    }
    const drew = await flags(BEFORE_WAT, { 'wind-and-truth': '17' })
    expect(drew).toEqual(
      expect.arrayContaining([
        'The Warcamps:23',
        'The Shattered Plains:3',
        'Hearthstone:2',
      ]),
    )
    // Felt and Vasher aren't met yet, so the warcamps count two fewer.
    // Lirin and Hesina are where The Way of Kings last shows them, at home
    // in Hearthstone.
    const early = await flags(['way-of-kings', 'words-of-radiance'])
    expect(early).toContain('The Warcamps:21')
    expect(early).toContain('Hearthstone:2')
  })

  it("never lists a character the reader hasn't met", async () => {
    const { container, findByRole } = renderAt('/timeline', [], {
      'way-of-kings': 'prologue',
    })
    await findByRole('group', { name: 'Cosmere Timeline' })
    click(container.querySelector('[aria-label="Notable characters"]'))
    const text = container.querySelector('#timeline-people')!.textContent
    expect(text).toMatch(/Szeth/)
    expect(text).not.toMatch(/Kaladin|Vin|Shallan/)
  })

  it('pins only the current event', async () => {
    const pins = async (event: string) => {
      const { findByTestId } = renderAt(`/timeline?event=${event}`, [
        'way-of-kings',
      ])
      const ids = (await findByTestId('explorer')).dataset.pins!.split(',')
      cleanup()
      return ids
    }
    expect(await pins('dalinar-born')).toEqual(['dalinar-born'])
    expect(await pins('gavilar-assassinated')).toEqual(['gavilar-assassinated'])
  })

  it("lines up only the reader's books, and flies to each one's world", async () => {
    const { container, findByRole, findByTestId } = renderAt(
      '/timeline',
      ['final-empire', 'way-of-kings'],
      { 'words-of-radiance': null },
    )
    click(await findByRole('button', { name: 'Books' }))
    const covers = container.querySelector(
      '[aria-label="Books, earliest first"]',
    )!
    expect(
      [...covers.querySelectorAll('button')].map((b) => b.ariaLabel),
    ).toEqual([
      'Mistborn: The Final Empire',
      'The Way of Kings',
      'Words of Radiance',
    ])
    click(await findByRole('button', { name: 'Mistborn: The Final Empire' }))
    expect(await goal(findByTestId)).toMatchObject({ world: 'scadrial' })
    expect(container.querySelector('[aria-label="Book"]')!.textContent).toMatch(
      /Final Empire.*Set on Scadrial/,
    )
    fireEvent.keyDown(await findByRole('group', { name: 'Cosmere Timeline' }), {
      key: 'ArrowRight',
    })
    expect(await goal(findByTestId)).toMatchObject({ world: 'roshar' })
    click(await findByRole('button', { name: 'Events' }))
    expect(container.querySelector('[aria-label="Book"]')).toBeNull()
  })
})
