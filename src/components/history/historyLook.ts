// ponytail: temporary, to compare ways of telling a planet's history. Once
// Drew picks, delete this file and the switcher in PlanetHistory.tsx, and
// keep only the chosen view. An old pick that's gone (`codex`, `retold`)
// falls back to the Chronicle.
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

export const historyStyles = [
  {
    id: 'chronicle',
    label: 'Chronicle',
    tip: 'Scroll the story; the map and art follow along',
  },
  {
    id: 'scrubber',
    label: 'Time scrubber',
    tip: 'Drag through the ages one moment at a time',
  },
  // The scrubber's four alternative looks (ScrubLooks.tsx).
  {
    id: 'chapters',
    label: 'Chapters',
    tip: 'A video player’s chapter bar, one segment per era',
  },
  {
    id: 'metro',
    label: 'Metro line',
    tip: 'Ride the line: every moment is a stop, named on the map',
  },
  {
    id: 'stars',
    label: 'Star chart',
    tip: 'Moments as stars, set high or low by kind',
  },
  {
    id: 'dial',
    label: 'Tuning dial',
    tip: 'Tune a glowing dial through the ages',
  },
] as const

export type HistoryStyle = (typeof historyStyles)[number]['id']

const KEY = 'cosmere-guide:history-style'

// Blocked or full storage must never break the page.
const recall = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

const keep = (value: string) => {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    // The pick then lasts only as long as `?history=` does.
  }
}

const valid = (s: string | null): s is HistoryStyle =>
  historyStyles.some((o) => o.id === s)

/** `?history=<id>`, else the last pick, else the Chronicle. */
export function useHistoryStyle() {
  const [params, setParams] = useSearchParams()
  const asked = params.get('history')
  const kept = recall()
  const value: HistoryStyle = valid(asked)
    ? asked
    : valid(kept)
      ? kept
      : 'chronicle'
  useEffect(() => {
    if (valid(asked)) keep(asked)
  }, [asked])
  const pick = (id: HistoryStyle) => {
    keep(id)
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        next.set('history', id)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }
  return [value, pick] as const
}
