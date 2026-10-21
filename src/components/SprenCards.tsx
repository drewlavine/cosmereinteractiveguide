import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'
import { PortraitArt } from './ArtViewer'
import { PageSubsection } from './PageSections'
import { SearchIcon } from './SearchIcon'
import type { Portrait } from '../data/characterPortraits'

/**
 * A card for one kind of spren: its art (or a placeholder the same whether
 * there's no art or it's not reached yet) beside its name and text.
 */
export function SprenCard({
  id,
  title,
  href,
  art,
  children,
}: {
  id: string
  title: string
  /** Its own page, if it has one. */
  href?: string
  art?: Portrait
  children: ReactNode
}) {
  const lead = art ? (
    <PortraitArt
      src={art.src}
      alt={art.alt}
      artist={art.artist}
      artistUrl={art.artistUrl}
      className="character-portrait spren-card-art"
    />
  ) : (
    <div className="character-portrait spren-card-art spren-card-no-art">
      <span>
        <SearchIcon name="lifeform" />
        No art yet
      </span>
    </div>
  )
  return (
    <PageSubsection
      id={id}
      title={title}
      href={href}
      className="spren-card"
      lead={lead}
    >
      <div className="spren-card-text">{children}</div>
    </PageSubsection>
  )
}

/** "Characters: A, B" under a card, each linked to their page. */
export function CardPeople({
  people,
}: {
  people: { id: string; name: string }[]
}) {
  if (!people.length) return null
  return (
    <p className="spren-card-people">
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
