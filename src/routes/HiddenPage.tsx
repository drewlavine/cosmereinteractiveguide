import { Link } from 'react-router'
import { SpoilerNotice } from '../components/SpoilerNotice'

/** Stands in for a system or world the reader's books haven't reached. */
export function HiddenPage({ systemId }: { systemId: string }) {
  return (
    <section className="message-page" aria-labelledby="hidden-title">
      <h1 id="hidden-title">Not yet charted</h1>
      <p>Your Books Read don’t reach this part of the Cosmere yet.</p>
      <SpoilerNotice systemId={systemId} spoilers />
      <Link to="/">Back to the star map</Link>
    </section>
  )
}
