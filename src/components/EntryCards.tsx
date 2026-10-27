import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'
import { PortraitArt } from './ArtViewer'
import { PageSubsection } from './PageSections'
import { SearchIcon } from './SearchIcon'
import type { Portrait } from '../data/characterPortraits'
import type { SearchIconName } from '../search/types'
import styles from './EntryCards.module.css'

/**
 * A card for one entry, e.g. a kind of spren or a group's member: its art (or
 * a placeholder the same whether there's no art or it's not reached yet)
 * beside its name and text.
 */
export function EntryCard({
  id,
  title,
  href,
  art,
  icon = 'lifeform',
  children,
}: {
  id: string
  title: string
  /** Its own page, if it has one. */
  href?: string
  art?: Portrait
  /** Shown on the placeholder. */
  icon?: SearchIconName
  children: ReactNode
}) {
  const lead = art ? (
    <PortraitArt
      src={art.src}
      alt={art.alt}
      artist={art.artist}
      artistUrl={art.artistUrl}
      className={`character-portrait ${styles.art}`}
    />
  ) : (
    <div className={`character-portrait ${styles.art} ${styles.noArt}`}>
      <span>
        <SearchIcon name={icon} />
        No art yet
      </span>
    </div>
  )
  return (
    <PageSubsection
      id={id}
      title={title}
      href={href}
      className={styles.card}
      lead={lead}
    >
      <div className={styles.text}>{children}</div>
    </PageSubsection>
  )
}

/** The cards of one section, stacked. */
export function EntryCardList({ children }: { children: ReactNode }) {
  return <div className={styles.list}>{children}</div>
}

/** "Characters: A, B" under a card, each linked to their page. */
export function CardPeople({
  people,
}: {
  people: { id: string; name: string }[]
}) {
  if (!people.length) return null
  return (
    <p className={styles.people}>
      Characters:{' '}
      {people.map((p, i) => (
        <Fragment key={p.id}>
          {i > 0 && ', '}
          <Link to={`/characters/${p.id}`}>{p.name}</Link>
        </Fragment>
      ))}
    </p>
  )
}
