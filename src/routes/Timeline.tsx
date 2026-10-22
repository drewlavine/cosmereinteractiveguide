import { useSearchParams } from 'react-router'
import { TimelineCards } from '../components/timeline/TimelineCards'
import { TimelineSpine } from '../components/timeline/TimelineSpine'

const views = [
  { id: 'cards', label: 'Mockup 1: Cards' },
  { id: 'spine', label: 'Mockup 2: Spine' },
] as const

/** The Timeline tab: two static mockups to compare, picked with a toggle. */
export function Timeline() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'spine' ? 'spine' : 'cards'

  return (
    <article
      className="character-list timeline-page"
      aria-labelledby="timeline-title"
    >
      <h1 id="timeline-title">Timeline</h1>
      <p className="timeline-lede">
        The Cosmere's history in the order it happened, across every world.
      </p>
      <div className="timeline-views" role="group" aria-label="Choose a mockup">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            className="timeline-view"
            aria-pressed={v.id === view}
            onClick={() =>
              setParams(v.id === 'cards' ? {} : { view: v.id }, {
                replace: true,
                preventScrollReset: true,
              })
            }
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="timeline-mock-note">
        Mockup with sample data, picked for where you are in the books. Not
        spoiler-checked yet.
      </p>
      {view === 'spine' ? <TimelineSpine /> : <TimelineCards />}
    </article>
  )
}
