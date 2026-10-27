import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type {
  FoundFeature,
  PageFeature,
  PageFeatureId,
} from '../data/pageFeatures'

/** One icon per feature, drawn on a 24px grid in the stroke style of SearchIcon. */
const paths: Record<PageFeatureId, ReactNode> = {
  // A winding trail from a start point to a map pin.
  journey: (
    <>
      <circle cx="5" cy="19" r="1.6" />
      <path d="M6.6 18.4c4.4-.8 7.6-2.6 4.6-5.4s1-4.6 3.6-4.8" />
      <path d="M18 3.5a3.5 3.5 0 0 1 3.5 3.5c0 2.6-3.5 6-3.5 6s-3.5-3.4-3.5-6A3.5 3.5 0 0 1 18 3.5Z" />
      <circle cx="18" cy="7" r="1" />
    </>
  ),
  // A folded map.
  map: (
    <>
      <path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2Z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
}

export function FeatureIcon({ id }: { id: PageFeatureId }) {
  return (
    <svg
      className="feature-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[id]}
    </svg>
  )
}

/**
 * Icons after a list entry's name, each linking to that part of its page.
 * The tooltip is drawn from `data-tip` so it adds no text to the entry.
 */
export function FeatureLinks({
  name,
  href,
  features,
}: {
  name: string
  href: string
  features: FoundFeature[]
}) {
  if (!features.length) return null
  return (
    <span className="feature-links">
      {features.map(({ feature, section }) => (
        <Link
          key={feature.id}
          to={`${href}#${section}`}
          className="feature-link"
          aria-label={`${name}: ${feature.label}`}
          data-tip={feature.label}
        >
          <FeatureIcon id={feature.id} />
        </Link>
      ))}
    </span>
  )
}

/** What the icons on a list mean. */
export function FeatureLegend({
  features,
}: {
  features: readonly (PageFeature & { id: PageFeatureId })[]
}) {
  if (!features.length) return null
  return (
    <div className="feature-legend" role="group" aria-label="Icon legend">
      <dl>
        {features.map((f) => (
          <div key={f.id} className="feature-legend-item">
            <dt>
              <FeatureIcon id={f.id} />
              {f.label}
            </dt>
            <dd>{f.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
