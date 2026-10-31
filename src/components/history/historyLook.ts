// ponytail: temporary, to compare ways of telling a planet's history. Once
// Drew picks, delete this file and the switcher in PlanetHistory.tsx, and
// keep only the chosen view.
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
  {
    id: 'codex',
    label: 'Codex',
    tip: 'Cards by era, with causes and consequences',
  },
  {
    id: 'retold',
    label: 'As you read it',
    tip: 'Replay how the history grew as you read',
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
