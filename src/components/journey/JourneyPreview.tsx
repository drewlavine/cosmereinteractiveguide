import { lazy, Suspense, useState } from 'react'
import type { ShownJourney, ShownJourneyStop } from '../../data/reveal'
import { rootOf } from './journeyGeometry'
import { assetUrl } from '../../data/assetUrl'

const JourneyMap = lazy(() => import('./JourneyMap'))

/**
 * A character page's Journey section: a blurred still of the map with one
 * "Explore journey" button, which loads the interactive map (its own chunk)
 * in its place.
 */
export function JourneyPreview({
  name,
  journey,
  selfKey,
  more,
}: {
  name: string
  journey: ShownJourney
  /** The page it's on, never linked from the events. */
  selfKey?: string
  /** The id of the part of the page telling more about an event, if any. */
  more?: (where: ShownJourneyStop['where']) => string | undefined
}) {
  const [open, setOpen] = useState(false)
  const { stops, maps } = journey
  // The whole map the journey starts on (or the one holding it, if it starts
  // in a city), zoomed out, with no event marked.
  const map =
    stops[0] && maps.find((m) => m.id === rootOf(maps, stops[0].mapId))
  if (!map) return null

  if (open)
    return (
      <Suspense
        fallback={<p className="journey-loading">Loading the journey map…</p>}
      >
        <JourneyMap
          name={name}
          journey={journey}
          onClose={() => setOpen(false)}
          selfKey={selfKey}
          more={more}
        />
      </Suspense>
    )

  const { width: W, height: H } = map.image

  const summary = `${stops.length === 1 ? '1 event' : `${stops.length} events`} on the map of ${map.title}`

  return (
    <div className="journey-preview">
      <button
        type="button"
        className="journey-preview-map"
        onClick={() => setOpen(true)}
        aria-label={`Explore journey: ${summary}`}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <image
            href={assetUrl(map.image.thumb ?? map.image.src)}
            width={W}
            height={H}
            preserveAspectRatio="none"
          />
        </svg>
        <span className="journey-button journey-explore" aria-hidden>
          Explore journey
        </span>
      </button>
    </div>
  )
}
