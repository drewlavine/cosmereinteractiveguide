import { useState } from 'react'
import type { CultureArt, ShownLocationStory } from '../../data/reveal'
import { PortraitArt } from '../ArtViewer'
import { PageSection, PageSubsection } from '../PageSections'
import { cultureIds, jumpTo, type ShownTopic } from './placeTopics'
import { SourceMark } from '../SourceMark'
import { TopicIcon } from './TopicIcon'
import { useLinkText } from '../LinkedText'
import styles from './PlaceCulture.module.css'

/**
 * A place's Culture section: a subsection per topic, each opening with a
 * lead note. Its pictures (already trimmed by revealPlaceCultureArt) sit at
 * the top of their topic, unless the page shows them on its plate instead.
 * On narrow screens a sticky jumper names the topic being read.
 */
export function PlaceCulture({
  id,
  culture,
  art,
  topics,
  plate,
  active,
  onJump,
}: {
  id: string
  culture: ShownLocationStory['culture']
  art: CultureArt[]
  /** The titled topics (see shownTopics). */
  topics: ShownTopic[]
  /** Whether a plate beside the text shows the pictures and topics. */
  plate: boolean
  /** The topic being read, if any. */
  active?: string
  onJump: (id: string) => void
}) {
  const link = useLinkText(`place:${id}`)
  if (culture.length === 0) return null
  const ids = cultureIds(culture)
  return (
    <PageSection id="culture" title="Culture">
      {!plate && topics.length > 1 && (
        <TopicJumper topics={topics} active={active} onJump={onJump} />
      )}
      {culture.map(({ title, topic, items }, i) => {
        const linked = new Set<string>()
        const body = (
          <>
            {!plate &&
              art
                .filter((a) => topic && a.topic === topic)
                .map((a) => (
                  <PortraitArt
                    key={a.src}
                    className={`character-portrait ${styles.art}`}
                    src={a.src}
                    alt={a.alt}
                    artist={a.artist}
                    artistUrl={a.artistUrl}
                    caption={a.caption}
                  />
                ))}
            {items.map(({ text, books }, n) => (
              <p key={text} className={n === 0 ? styles.lead : undefined}>
                {link(text, linked)}
                <SourceMark books={books} />
              </p>
            ))}
          </>
        )
        return title ? (
          <PageSubsection
            key={ids[i]}
            id={ids[i]}
            title={title}
            className={`${styles.topic}${topic ? ` ${styles.iconed}` : ''}`}
            lead={<TopicIcon topic={topic} className={styles.icon} />}
          >
            {body}
          </PageSubsection>
        ) : (
          <div key={`untitled-${i}`} className={styles.topic}>
            {body}
          </div>
        )
      })}
    </PageSection>
  )
}

/** Sticks to the top while Culture is read; opens a menu of its topics. */
function TopicJumper({
  topics,
  active,
  onJump,
}: {
  topics: ShownTopic[]
  active?: string
  onJump: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = topics.find((t) => t.id === active)
  return (
    <nav
      className={styles.jumper}
      aria-label="Culture topics"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
      }}
    >
      <button
        type="button"
        className={styles.jumperToggle}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <TopicIcon topic={current?.topic} className={styles.jumperIcon} />
        <span className={styles.jumperTitle}>{current?.title ?? 'Topics'}</span>
        <span className={styles.jumperCount}>{topics.length} topics</span>
      </button>
      {open && (
        <ol className={styles.jumperMenu}>
          {topics.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                aria-current={t.id === active ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  onJump(t.id)
                  jumpTo(t.id)
                }}
              >
                <TopicIcon topic={t.topic} className={styles.jumperIcon} />
                <span>{t.title}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}
