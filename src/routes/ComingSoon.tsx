import { Link } from 'react-router'
import type { MainTab } from '../navigation'

/** Placeholder page for a main tab whose section isn't built yet. */
export function ComingSoon({ tab }: { tab: MainTab }) {
  return (
    <section className="message-page" aria-labelledby="coming-soon-title">
      <h1 id="coming-soon-title">{tab.label}</h1>
      <p>{tab.comingSoon}</p>
      <p>
        <span className="coming-soon-badge">Coming soon</span>
      </p>
      <Link to="/">Back to the star map</Link>
    </section>
  )
}
