import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PlanetGlobe } from '../PlanetGlobe'
import { plural } from '../../routes/listHelpers'
import type { CardArt } from './types'
import styles from './GroupCard.module.css'

/**
 * A group's picture: its art, or else a symbol on a painted panel. The panel
 * depends only on the group, so a group whose art is hidden looks just like
 * one that has none.
 */
export function GroupMedia({
  art,
  symbol,
  tone,
  decorative = false,
  className,
}: {
  art?: CardArt
  symbol: ReactNode
  /** Which hue the panel takes, from `toneOf`. */
  tone: number
  /** The card's link names it, so the picture needs no text of its own. */
  decorative?: boolean
  className?: string
}) {
  const frame = `${styles.media} ${className ?? ''}`
  if (art?.type === 'planet')
    return (
      <span className={`${frame} ${styles.space}`}>
        <svg viewBox="-100 -100 200 200" aria-hidden>
          <PlanetGlobe
            planet={art.planet}
            cx={0}
            cy={0}
            r={art.planet.rings ? 44 : 58}
          />
        </svg>
      </span>
    )
  if (art?.type === 'image')
    return (
      <span
        className={`${frame} ${art.contain ? styles.contain : ''}`}
        data-art
      >
        <img
          src={art.src}
          alt={decorative ? '' : art.alt}
          loading="lazy"
          decoding="async"
        />
      </span>
    )
  return (
    <span className={`${frame} ${styles.panel} ${styles[`tone${tone}`]}`}>
      <span className={styles.symbol}>{symbol}</span>
    </span>
  )
}

/** A card for one group: its picture, name and how many it holds. */
export function GroupCard({
  to,
  name,
  count,
  noun,
  art,
  symbol,
  tone,
}: {
  to: string
  name: string
  count: number
  noun: { one: string; many: string }
  art?: CardArt
  symbol: ReactNode
  tone: number
}) {
  const size = plural(count, noun.one, noun.many)
  const credit = art?.type === 'image' ? art.credit : undefined
  return (
    <Link to={to} className={styles.card} aria-label={`${name}, ${size}`}>
      <GroupMedia art={art} symbol={symbol} tone={tone} decorative />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        <span className={styles.count}>{size}</span>
        {credit && <span className={styles.credit}>Art: {credit.text}</span>}
      </span>
    </Link>
  )
}

/** A big number as a group's symbol, e.g. how many books. */
export function Monogram({ children }: { children: ReactNode }) {
  return <span className={styles.monogram}>{children}</span>
}

/** The symbol on the "Not sorted yet" card. */
export function Ellipsis() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </svg>
  )
}
