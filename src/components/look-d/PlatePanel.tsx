import type { ReactNode } from 'react'
import type { CultureArt } from '../../data/reveal'
import type { Portrait } from '../../data/characterPortraits'
import { PortraitArt } from '../ArtViewer'
import type { ShownTopic } from './placeTopics'
import { TopicIcon } from './TopicIcon'
import styles from './PlatePanel.module.css'

/**
 * The sticky panel beside a place's text on wide screens. It follows the
 * part being read: the place's own picture and more facts near the top; a
 * Culture topic's picture while that topic is read, or its icon when it has
 * none. The navigation leads, so it stays put while the picture under it
 * changes. Everything comes from revealed data.
 */
export function PlatePanel({
  topics,
  art,
  placeArt,
  active,
  moreFacts,
  navigation,
}: {
  topics: ShownTopic[]
  /** Culture pictures, already trimmed. */
  art: CultureArt[]
  /** The place's own picture, already trimmed. */
  placeArt?: Portrait
  /** The part of the page being read (see useReadingPart). */
  active?: string
  /** dt/dd rows too long for the fact strip. */
  moreFacts: ReactNode
  navigation: ReactNode
}) {
  const topic =
    topics.find((t) => t.id === active) ??
    (active === 'culture' ? topics[0] : undefined)
  const pictures = topic?.topic
    ? art.filter((a) => a.topic === topic.topic)
    : []
  const inCulture = active === 'culture' || active?.startsWith('culture-')
  const upper = !active || active === 'about' || inCulture
  // Keep the existing topic illustration or emblem behavior.
  const showTopic = topic && (pictures.length > 0 || topics.length > 1)

  return (
    <aside className={styles.plate} aria-label="Plate">
      <div className={styles.inner}>
        {navigation}
        {showTopic ? (
          <div key={topic.id} className={styles.stage}>
            <p className={styles.title}>
              <TopicIcon topic={topic.topic} className={styles.titleIcon} />
              {topic.title}
            </p>
            {pictures.length > 0 ? (
              pictures.map((a) => (
                <PortraitArt
                  key={a.src}
                  className={`character-portrait ${styles.figure}`}
                  src={a.src}
                  alt={a.alt}
                  artist={a.artist}
                  artistUrl={a.artistUrl}
                  caption={a.caption}
                />
              ))
            ) : (
              <div className={styles.medallion} aria-hidden>
                <TopicIcon topic={topic.topic} />
              </div>
            )}
          </div>
        ) : (
          upper &&
          placeArt && (
            <div key="place" className={styles.stage}>
              <PortraitArt
                className={`character-portrait ${styles.figure} ${styles.placeFigure}`}
                src={placeArt.src}
                alt={placeArt.alt}
                artist={placeArt.artist}
                artistUrl={placeArt.artistUrl}
              />
            </div>
          )
        )}
        {!inCulture && upper && (
          <dl className={styles.more} aria-label="More facts">
            {moreFacts}
          </dl>
        )}
      </div>
    </aside>
  )
}
