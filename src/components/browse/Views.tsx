import type { ReactNode } from 'react'
import { LetterJump } from '../ListJump'
import { anchorFor, byLetter } from '../../routes/listHelpers'
import type { Listed } from './types'

type Row<T> = (item: T, needle: string) => ReactNode

/** One group's names, as a plain list. */
export function MemberView<T extends Listed>({
  items,
  row,
  legend,
}: {
  items: readonly T[]
  row: Row<T>
  legend?: ReactNode
}) {
  return (
    <>
      {legend}
      <div className="character-group">
        <ul>
          {items.map((item) => (
            <li key={item.id}>{row(item, '')}</li>
          ))}
        </ul>
      </div>
    </>
  )
}

/** Every name, A–Z, under its letter. */
export function AzView<T extends Listed>({
  matches,
  needle,
  slug,
  row,
  legend,
  noMatch,
}: {
  matches: readonly T[]
  /** What was typed, folded; empty when listing everything. */
  needle: string
  slug: string
  row: Row<T>
  legend?: ReactNode
  noMatch: string
}) {
  const letters = byLetter([...matches]).map(({ letter, items }) => ({
    id: letter,
    name: letter,
    items,
  }))
  const anchor = (id: string) => anchorFor(slug, id)
  return (
    <>
      {legend}
      <LetterJump groups={letters} anchor={anchor} />
      {matches.length === 0 && <p>{noMatch}</p>}
      {letters.map(({ id, name, items }) => (
        <section
          key={id}
          className="character-group"
          aria-labelledby={anchor(id)}
        >
          <h2 id={anchor(id)}>{name}</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>{row(item, needle)}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
