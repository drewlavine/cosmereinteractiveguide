import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import styles from './Browse.module.css'
import { GroupCard } from './GroupCard'
import cards from './GroupCard.module.css'
import type { CardStyle } from './listLook'
import type { Built } from './types'
import { listHref, sectionId } from './urls'

const jump = (path: string, grouping: string) =>
  document
    .getElementById(sectionId(path, grouping))
    ?.scrollIntoView?.({ block: 'start' })

/**
 * One grouping's cards at a time, with chips that switch between groupings.
 * Groupings with no group the reader may see are left out before they get here.
 */
export function CardsView<T>({
  built,
  current,
  look,
  path,
  noun,
}: {
  built: Built<T>[]
  /** The grouping the chips mark: the URL's, else the first. */
  current: string
  look: CardStyle
  path: string
  noun: { one: string; many: string }
}) {
  const hasChips = built.length > 1
  const page = useRef<HTMLDivElement>(null)
  const chips = useRef<HTMLElement>(null)
  const mounted = useRef(false)

  // The sticky chips can wrap to a second row; sections and cards scroll to
  // clear however tall they are right now.
  useLayoutEffect(() => {
    const bar = chips.current
    const box = page.current
    if (!hasChips || !bar || !box) return
    const measure = () =>
      box.style.setProperty('--chips-h', `${bar.offsetHeight}px`)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(measure)
    watch.observe(bar)
    return () => watch.disconnect()
  }, [hasChips])

  // On a phone the chips scroll sideways: keep the marked one in view.
  useLayoutEffect(() => {
    const row = chips.current?.querySelector('ul')
    const active = row?.querySelector<HTMLElement>('[aria-current]')
    if (!row || !active || row.scrollWidth <= row.clientWidth) return
    const left =
      active.getBoundingClientRect().left -
      row.getBoundingClientRect().left +
      row.scrollLeft
    row.scrollLeft = left - (row.clientWidth - active.offsetWidth) / 2
  }, [current, hasChips])

  // Switching tabs from far down a long grouping: start the new one in view.
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const top = document
      .getElementById(sectionId(path, current))
      ?.getBoundingClientRect().top
    const bar = chips.current?.getBoundingClientRect().bottom
    if (top !== undefined && bar !== undefined && top < bar) jump(path, current)
  }, [current, path])

  return (
    <div ref={page}>
      {hasChips && (
        <nav ref={chips} className={styles.chips} aria-label="Browse by">
          <ul>
            {built.map(({ grouping }) => (
              <li key={grouping.id}>
                <Link
                  to={listHref(path, { group: grouping.id })}
                  replace
                  preventScrollReset
                  className={styles.chip}
                  aria-current={grouping.id === current ? 'true' : undefined}
                >
                  {grouping.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {built
        .filter(({ grouping }) => grouping.id === current)
        .map(({ grouping, cards: list }) => {
          const id = sectionId(path, grouping.id)
          return (
            <section
              key={grouping.id}
              id={id}
              className={styles.section}
              aria-labelledby={`${id}-title`}
            >
              <h2 id={`${id}-title`} className="visually-hidden" tabIndex={-1}>
                {grouping.label}
              </h2>
              <ul
                className={cards.grid}
                data-card={look}
                data-compact={list.every((c) => !c.art) || undefined}
              >
                {list.map((card) => (
                  <li key={card.id}>
                    <GroupCard
                      to={listHref(path, { group: grouping.id, of: card.id })}
                      name={card.name}
                      count={card.count}
                      noun={noun}
                      art={card.art}
                      symbol={card.symbol}
                      tone={card.tone}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
    </div>
  )
}
