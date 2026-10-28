import { CosmereTimeline } from '../components/timeline/CosmereTimeline'

/**
 * The Timeline tab: the Cosmere's history on a map of the whole Cosmere,
 * filling the page, with a time bar of events along the bottom (a proof of
 * concept; see docs/cosmere-timeline.md).
 */
export function Timeline() {
  return (
    <article
      className="character-list timeline-page"
      aria-labelledby="timeline-title"
    >
      <h1 id="timeline-title">Timeline</h1>
      <p className="character-count timeline-intro">
        The Cosmere’s history, as far as you’ve read.
      </p>
      <CosmereTimeline />
      <p className="timeline-credit">
        Timeline design after the 17th Shard's{' '}
        <a href="https://roshar.17thshard.com/">Roshar map</a>.
      </p>
    </article>
  )
}
