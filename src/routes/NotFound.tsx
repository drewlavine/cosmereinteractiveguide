import { Link } from 'react-router'

export function NotFound() {
  return (
    <section className="message-page">
      <h1>Lost in the Cognitive Realm</h1>
      <p>We couldn't find that system or planet.</p>
      <Link to="/">Back to the star map</Link>
    </section>
  )
}
