// ponytail: temporary, to gather opinions on the way into the world card.
// Once a style is chosen, delete this file and TitleStyleSwitcher, and keep
// just that style in WorldCard; TitlePlacement (with ExplorerCanvas's
// --globe-r and data-keep-clear) only if it's `state` or `moon`.
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

/** The ways into the world card a reader can try. */
export const titleStyles = [
  {
    id: 'current',
    group: 'title',
    label: 'Pill',
    tip: 'A "Details ›" pill beside the name',
  },
  {
    id: 'name',
    group: 'title',
    label: 'Name',
    tip: 'The name is the button: an underline that grows, and a chevron',
  },
  {
    id: 'line',
    group: 'title',
    label: 'Line',
    tip: '"State of the world ›" under the name',
  },
  {
    id: 'icon',
    group: 'title',
    label: 'Icon',
    tip: 'A round info button beside the name',
  },
  {
    id: 'chip',
    group: 'title',
    label: 'Icon + label',
    tip: 'A planet icon and "Overview" beside the name',
  },
  {
    id: 'hover',
    group: 'title',
    label: 'Hover hint',
    tip: '"See the state of …" on hover or focus (always shown on touch)',
  },
  {
    id: 'state',
    group: 'elsewhere',
    label: 'State chip',
    tip: "The world's state on a chip beside the globe (under the name on phones)",
  },
  {
    id: 'moon',
    group: 'elsewhere',
    label: 'Orbiting node',
    tip: 'A small node on a gold orbit around the globe',
  },
] as const

export const titleGroups = [
  { id: 'title', label: 'In the title' },
  { id: 'elsewhere', label: 'Elsewhere' },
] as const

export type TitleStyle = (typeof titleStyles)[number]['id']

/** The styles where the title is just the name, the way in elsewhere. */
export const placedElsewhere = (s: TitleStyle) =>
  titleStyles.find((t) => t.id === s)?.group === 'elsewhere'

const TITLE_STYLE_KEY = 'cosmere-guide:world-title-style'

const isStyle = (s: string | null): s is TitleStyle =>
  titleStyles.some((t) => t.id === s)

/**
 * The style in use: `?title=<id>` (so a link can share one), else the last
 * pick, else the state chip. Its setter puts the pick in the URL too.
 */
export function useTitleStyle() {
  const [params, setParams] = useSearchParams()
  const asked = params.get('title')
  const kept = localStorage.getItem(TITLE_STYLE_KEY)
  const style: TitleStyle = isStyle(asked)
    ? asked
    : isStyle(kept)
      ? kept
      : 'state'
  useEffect(() => {
    if (isStyle(asked)) localStorage.setItem(TITLE_STYLE_KEY, asked)
  }, [asked])
  const pick = (s: TitleStyle) => {
    localStorage.setItem(TITLE_STYLE_KEY, s)
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        next.set('title', s)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }
  return [style, pick] as const
}

export const PHONE = '(max-width: 639px)'

/** Whether a media query matches (never, where there's no matchMedia). */
export function useMedia(query: string) {
  const match = () =>
    typeof matchMedia === 'function' && matchMedia(query).matches
  const [on, setOn] = useState(match)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const m = matchMedia(query)
    const change = () => setOn(m.matches)
    change()
    m.addEventListener('change', change)
    return () => m.removeEventListener('change', change)
  }, [query])
  return on
}
