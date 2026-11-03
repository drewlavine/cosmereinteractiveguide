import type { CultureArt, ShownLocationStory } from '../../data/reveal'
import { PortraitArt } from '../ArtViewer'
import { PageSection } from '../PageSections'
import { slugs } from '../pageSlugs'
import { SourceMark } from '../SourceMark'
import { TopicIcon } from './TopicIcon'
import { useLinkText } from '../LinkedText'
import styles from './PlaceCulture.module.css'

/** Notes shown before a long topic's "Show all". */
const PREVIEW = 3

/**
 * A place's Culture section: an index of its topics, then a block per topic
 * with its pictures (already trimmed by revealPlaceCultureArt) beside it.
 * Long topics show their first few notes and fold the rest away. Everything
 * here, the index and counts included, comes from the trimmed culture, so
 * nothing hints at what the reader hasn't reached.
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
  const titled = culture.flatMap((c, i) =>
    c.title ? [{ ...c, title: c.title, id: ids[i] }] : [],
  )
  return (
    <PageSection id="culture" title="Culture">
      {titled.length >= 3 && (
        <nav className={styles.index} aria-label="Culture topics">
          <ul>
            {titled.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`}>
                  <TopicIcon topic={c.topic} className={styles.icon} />
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {culture.map(({ title, topic, items }, i) => {
        const linked = new Set<string>()
        const notes = items.map(({ text, books }) => (
          <p key={text}>
            {link(text, linked)}
            <SourceMark books={books} />
          </p>
        ))
        // Folding away a single note saves nothing.
        const fold = notes.length > PREVIEW + 1
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
            {fold ? notes.slice(0, PREVIEW) : notes}
            {fold && (
              <details className={styles.rest}>
                <summary>
                  <span className={styles.closed}>
                    Show all {notes.length} notes
                    {title && (
                      <span className="visually-hidden"> on {title}</span>
                    )}
                  </span>
                  <span className={styles.opened}>Show fewer</span>
                </summary>
                {notes.slice(PREVIEW)}
              </details>
            )}
          </>
        )
        return title ? (
          <section
            key={ids[i]}
            id={ids[i]}
            className={`page-subsection ${styles.topic}`}
            aria-labelledby={`${ids[i]}-title`}
            data-toc-sub={title}
          >
            <h3 id={`${ids[i]}-title`} className={styles.title}>
              <TopicIcon topic={topic} className={styles.icon} />
              {title}
            </h3>
            {body}
          </section>
        ) : (
          <div key={`untitled-${i}`} className={styles.topic}>
            {body}
          </div>
        )
      })}
    </PageSection>
  )
}
