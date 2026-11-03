import type { CultureArt, ShownLocationStory } from '../../data/reveal'
import { PortraitArt } from '../ArtViewer'
import { PageSection, PageSubsection } from '../PageSections'
import { cultureIds } from './placeTopics'
import { SourceMark } from '../SourceMark'
import { TopicIcon } from './TopicIcon'
import { useLinkText } from '../LinkedText'
import styles from './PlaceCulture.module.css'

/**
 * A place's Culture section: a subsection per topic, each opening with a
 * lead note. Its pictures (already trimmed by revealPlaceCultureArt) sit at
 * the top of their topic, unless the page shows them on its plate instead.
 * The page navigation names the topic being read.
 */
export function PlaceCulture({
  id,
  culture,
  art,
  plate,
}: {
  id: string
  culture: ShownLocationStory['culture']
  art: CultureArt[]
  /** Whether a plate beside the text shows the pictures and topics. */
  plate: boolean
}) {
  const link = useLinkText(`place:${id}`)
  if (culture.length === 0) return null
  const ids = cultureIds(culture)
  return (
    <PageSection id="culture" title="Culture">
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
