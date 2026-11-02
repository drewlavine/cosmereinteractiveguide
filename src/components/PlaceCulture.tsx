import type { CultureArt, ShownLocationStory } from '../data/reveal'
import { PortraitArt } from './ArtViewer'
import { PageSection, PageSubsection } from './PageSections'
import { slugs } from './pageSlugs'
import { SourceMark } from './SourceMark'
import { useLinkText } from './LinkedText'
import styles from './PlaceCulture.module.css'

/**
 * A place's Culture section: a subsection per topic, each with its pictures
 * (already trimmed by revealPlaceCultureArt) beside it.
 */
export function PlaceCulture({
  id,
  culture,
  art,
}: {
  id: string
  culture: ShownLocationStory['culture']
  art: CultureArt[]
}) {
  const link = useLinkText(`place:${id}`)
  if (culture.length === 0) return null
  const ids = slugs(
    'culture',
    culture.map((c) => c.title ?? ''),
  )
  return (
    <PageSection id="culture" title="Culture">
      {culture.map(({ title, topic, items }, i) => {
        const linked = new Set<string>()
        const body = (
          <>
            {art
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
            {items.map(({ text, books }) => (
              <p key={text}>
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
            className={styles.topic}
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
