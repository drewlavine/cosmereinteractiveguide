import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router'
import { fold, plural } from '../../routes/listHelpers'
import type { SearchIconName } from '../../search/types'
import { SearchIcon } from '../SearchIcon'
import styles from './Browse.module.css'
import { CardsView } from './CardsView'
import { Ellipsis, GroupMedia } from './GroupCard'
import { buildGroups, toneOf, UNSORTED } from './groups'
import { useCardStyle } from './listLook'
import { TryLayout } from './TryLayout'
import type { BrowseProps, Built, Card, Grouping, Listed } from './types'
import { AZ, listHref, readView } from './urls'
import { AzView, MemberView } from './Views'

/** Where each page of a list was scrolled to, and the link that left it, by history entry. */
const scrolls = new Map<string, { top: number; link: string | null }>()

/** Each grouping's groups and their cards; a grouping with none is left out. */
function buildBrowse<T>(
  items: readonly T[],
  groupings: readonly Grouping<T>[],
  icon: SearchIconName,
): Built<T>[] {
  return groupings.flatMap((grouping) => {
    const { groups, unsorted } = buildGroups(
      items,
      grouping.categories,
      grouping.biggestFirst,
    )
    if (groups.length === 0) return []
    const cards: Card[] = groups.map((g, i) => ({
      id: g.id,
      name: g.name,
      count: g.items.length,
      art: grouping.art?.(g),
      symbol: grouping.symbol?.(g) ?? <SearchIcon name={icon} />,
      tone: toneOf(grouping.id, i),
    }))
    if (unsorted.length > 0)
      cards.push({
        id: UNSORTED,
        name: 'Not sorted yet',
        count: unsorted.length,
        symbol: <Ellipsis />,
        tone: toneOf(grouping.id, cards.length),
      })
    return [{ grouping, groups, unsorted, cards }]
  })
}

/**
 * A browsable list as cards for the selected grouping, each opening that
 * group's names; a button for every name A–Z; a filter that swaps the cards
 * for matching names. Which page shows is in the URL:
 * `?group=<grouping>` that grouping's cards,
 * `&of=<group>` that group's names, `?group=name` or `?q=` the A–Z list.
 */
export function BrowseList<T extends Listed>({
  path,
  title,
  noun,
  icon,
  items,
  hidden,
  groupings,
  match,
  row,
  legend,
  filterLabel,
  noMatch,
}: BrowseProps<T>) {
  const slug = path.slice(1)
  const location = useLocation()
  const navType = useNavigationType()
  const [live, setParams] = useSearchParams()
  // While the page animates out for another, it keeps showing what it showed.
  const here = location.pathname.replace(/\/+$/, '') === path
  const [seen, setSeen] = useState(live)
  if (here && seen !== live) setSeen(live)
  const params = here ? live : seen

  const [look] = useCardStyle()
  const ids = useMemo(() => groupings.map((g) => g.id), [groupings])
  const view = readView(params, ids)
  const built = useMemo(
    () => buildBrowse(items, groupings, icon),
    [items, groupings, icon],
  )

  const q = params.get('q') ?? ''
  const needle = fold(q).trim()
  const matches = needle ? items.filter((i) => match(i, needle)) : items
  const asked = view.name === 'cards' ? view.group : null
  const current =
    built.find((b) => b.grouping.id === asked)?.grouping.id ??
    built[0]?.grouping.id ??
    ''
  const member =
    view.name === 'members'
      ? built
          .filter((b) => b.grouping.id === view.group)
          .flatMap((b) => {
            const card = b.cards.find((c) => c.id === view.of)
            const group = b.groups.find((g) => g.id === view.of)
            const list = view.of === UNSORTED ? b.unsorted : group?.items
            return card && list ? [{ grouping: b.grouping, card, list }] : []
          })[0]
      : undefined

  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const shown = useRef<string | null>(null)
  const { search, key } = location
  // A new page of the list starts at its top, and
  // Back returns to where the reader was, with focus on the link they left
  // by. Page and name filter changes (a replace) and #letter jumps keep their
  // place.
  useLayoutEffect(() => {
    if (!here || shown.current === search) return
    const arrived = shown.current === null
    shown.current = search
    if (navType === 'REPLACE' && !arrived) return
    const main = root.current?.closest('.app-main')
    const saved = scrolls.get(key)
    if (navType === 'POP' && saved) {
      if (main) main.scrollTop = saved.top
      Array.from(root.current?.querySelectorAll('a') ?? [])
        .find((a) => saved.link && a.getAttribute('href') === saved.link)
        ?.focus({ preventScroll: true })
      return
    }
    if (main) main.scrollTop = 0
    if (!arrived) heading.current?.focus({ preventScroll: true })
  }, [here, search, key, navType])

  const remember = (event: { target: EventTarget }) => {
    const main = root.current?.closest('.app-main')
    const link =
      event.target instanceof Element ? event.target.closest('a') : null
    if (main)
      scrolls.set(key, {
        top: main.scrollTop,
        link: link?.getAttribute('href') ?? null,
      })
  }
  const setQuery = (value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  const everyone = plural(items.length, noun.one, noun.many)
  const pageLink =
    view.name === 'cards'
      ? { to: listHref(path, { group: AZ }), text: 'List all A–Z' }
      : view.name === 'az' || !member
        ? { to: path, text: 'Browse by group' }
        : undefined
  const credit =
    member?.card.art?.type === 'image' ? member.card.art.credit : undefined

  return (
    <article
      ref={root}
      className={`character-list ${slug}-list ${styles.page}`}
      aria-labelledby={`${slug}-title`}
      onClickCapture={remember}
    >
      {member && (
        <Link
          className={styles.back}
          to={listHref(path, { group: member.grouping.id })}
        >
          <span aria-hidden>←</span> {member.grouping.all}
        </Link>
      )}
      <header className={member ? styles.memberHead : styles.head}>
        {member && (
          <GroupMedia
            art={member.card.art}
            symbol={member.card.symbol}
            tone={member.card.tone}
            className={styles.memberArt}
          />
        )}
        <div>
          {member && <p className={styles.eyebrow}>{member.grouping.label}</p>}
          <h1 id={`${slug}-title`} ref={heading} tabIndex={-1}>
            {member ? member.card.name : title}
          </h1>
          {member ? (
            <p className="character-count">
              {plural(member.list.length, noun.one, noun.many)}
            </p>
          ) : (
            view.name !== 'members' && (
              <p className="character-count">
                {view.name === 'az' && matches.length < items.length
                  ? `${matches.length} of ${everyone}`
                  : everyone}
                {hidden > 0 &&
                  ` · ${hidden} hidden based on what you've read so far`}
              </p>
            )
          )}
          {credit && (
            <p className={styles.credit}>
              Art:{' '}
              {credit.href ? (
                <a href={credit.href} target="_blank" rel="noreferrer">
                  {credit.text}
                </a>
              ) : (
                credit.text
              )}
            </p>
          )}
        </div>
        {pageLink && (
          <Link className={styles.pageLink} to={pageLink.to}>
            {pageLink.text}
          </Link>
        )}
      </header>

      {view.name !== 'members' && (
        <div className={`character-filters ${styles.filters}`}>
          <input
            type="search"
            className="character-filter-input"
            placeholder="Filter by name…"
            aria-label={filterLabel}
            value={q}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}

      {view.name === 'members' &&
        (member ? (
          <MemberView items={member.list} row={row} legend={legend} />
        ) : (
          <p>{noMatch}</p>
        ))}
      {view.name === 'az' && (
        <AzView
          matches={matches}
          needle={needle}
          slug={slug}
          row={row}
          legend={legend}
          noMatch={noMatch}
        />
      )}
      {view.name === 'cards' && (
        <>
          {built.length === 0 && <p>{noMatch}</p>}
          <CardsView
            built={built}
            current={current}
            look={look}
            path={path}
            noun={noun}
          />
          <TryLayout />
        </>
      )}
    </article>
  )
}
