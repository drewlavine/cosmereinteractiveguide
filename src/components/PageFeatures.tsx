import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type {
  FoundFeature,
  PageFeature,
  PageFeatureId,
} from '../data/pageFeatures'

/** One icon per feature, drawn on a 24px grid in the stroke style of SearchIcon. */
const paths: Record<PageFeatureId, ReactNode> = {
  // A folded map.
  map: (
    <>
      <path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2Z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  // A dotted route from one world to another.
  travels: (
    <>
      <circle cx="5.5" cy="18.5" r="2.5" />
      <path d="M8.3 16.6c3.6-1.6 2.4-5.6 5.6-7.4" strokeDasharray="0 3.2" />
      <circle cx="17.5" cy="6.5" r="3.8" />
      <path d="M13.7 6.6c2.4 1.2 5.2 1.2 7.6 0" />
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
