import type { CSSProperties } from 'react'
import type {
  MomentKind,
  ShownEra,
  ShownMoment,
} from '../../data/planetHistory'
import { sinceLabel } from '../../data/planetHistory'
import type { ShownPlanet } from '../../data/reveal'
import type { LinkTextFn } from '../LinkedText'

/** What the views share: the trimmed history and where it belongs. */
export interface HistoryProps {
  eras: ShownEra[]
  /** The world it happened on, for the stage's maps and globe. */
  planet?: ShownPlanet
  /** The reader chose to view spoilers: maps unlock as if read. */
  showAll: boolean
  link: LinkTextFn
  /** The page a moment's place links to. */
  placeHref: (placeId: string) => string
}

/** What the scrubber needs of an era (the Spanish Civil War page has its own). */
export interface ScrubEra {
  title: string
  tone: string
  moments: { id: string; title: string }[]
}

export interface Step<E extends ScrubEra = ShownEra> {
  era: E
  moment: E['moments'][number]
}

export const kindLabels: Record<MomentKind, string> = {
  legend: 'Legend',
  magic: 'Magic',
  war: 'War',
  realm: 'Realm',
}

/** Every moment in order, with its era. */
export const stepsOf = <E extends ScrubEra>(eras: E[]): Step<E>[] =>
  eras.flatMap((era) =>
    era.moments.map((moment) => ({
      era,
      moment: moment as E['moments'][number],
    })),
  )

/** The tellings that changed what a moment says, oldest first. */
export const retellings = (moment: ShownMoment) =>
  moment.versions.filter(
    (v, i, all) =>
      i === 0 || v.title !== all[i - 1].title || v.text !== all[i - 1].text,
  )

/** "From Warbreaker, Chapter 15 · updated in Chapter 58". */
export function sourceLine(moment: ShownMoment) {
  const told = retellings(moment)
  const first = told[0].since
  const last = told.at(-1)!.since
  if (told.length === 1) return `From ${sinceLabel(first)}`
  const later =
    last.book === first.book && last.chapter ? last.chapter : sinceLabel(last)
  return `From ${sinceLabel(first)} · updated in ${later}`
}

/** An era's colour, for CSS to use as `var(--tone)`. */
export const toneStyle = (tone: string) => ({ '--tone': tone }) as CSSProperties
