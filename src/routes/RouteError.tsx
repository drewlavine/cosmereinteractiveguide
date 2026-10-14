import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <section className="message-page">
      <h1>Something went wrong</h1>
      <p>{message}</p>
      <Link to="/">Back to the star map</Link>
    </section>
  )
}
