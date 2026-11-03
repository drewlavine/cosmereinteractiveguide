import type { ReactNode } from 'react'
import type { CultureArt } from '../../data/reveal'
import type { Portrait } from '../../data/characterPortraits'
import { PortraitArt } from '../ArtViewer'
import { jumpTo, type ShownTopic } from './placeTopics'
import { TopicIcon } from './TopicIcon'
import styles from './PlatePanel.module.css'

/**
 * The sticky panel beside a place's text on wide screens. It follows the
 * part being read: the place's own picture and more facts near the top; a
 * Culture topic's picture while that topic is read, or its icon when it has
 * none; a compass of the Culture topics; and the page's Contents. Everything
 * comes from revealed data, so it never shows more than the text does.
 * The compass leads, so it stays put while the picture under it changes.
 */
export function PlatePanel({
  topics,
  art,
  placeArt,
  active,
  moreFacts,
  contents,
  onJump,
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
  contents: ReactNode
  onJump: (id: string) => void
}) {
  const topic =
    topics.find((t) => t.id === active) ??
    (active === 'culture' ? topics[0] : undefined)
  const pictures = topic?.topic
    ? art.filter((a) => a.topic === topic.topic)
    : []
  const compass = topics.length > 1
  const inCulture = active === 'culture' || active?.startsWith('culture-')
  const upper = !active || active === 'about' || inCulture
  // A topic takes the plate when it has a picture or there's a compass to
  // light; otherwise the place's own picture stays.
  const showTopic = topic && (pictures.length > 0 || compass)

  return (
    <aside className={styles.plate} aria-label="Plate">
      <div
        className={`${styles.inner}${compass ? ` ${styles.hasCompass}` : ''}`}
      >
        {compass && upper && (
          <nav className={styles.compass} aria-label="Culture topics">
            <p className={styles.compassTitle}>
              Culture <span>{topics.length} topics</span>
            </p>
            <ol>
              {topics.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    aria-current={t.id === topic?.id ? 'location' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      onJump(t.id)
                      jumpTo(t.id)
                    }}
                  >
                    <TopicIcon topic={t.topic} className={styles.chipIcon} />
                    <span className={styles.chipTitle}>{t.title}</span>
                    <span className={styles.chipCount}>{t.count}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
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
        {contents}
      </div>
    </aside>
  )
}
