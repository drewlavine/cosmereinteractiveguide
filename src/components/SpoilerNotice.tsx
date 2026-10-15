import { useBooksRead } from '../state/booksRead'

/**
 * Says that spoilers are hidden, with a button that shows a system's hidden
 * details anyway or hides them again. Never names the books doing the hiding,
 * since that alone can be a spoiler. Renders nothing when nothing is hidden.
 */
export function SpoilerNotice({
  systemId,
  spoilers,
}: {
  systemId: string
  spoilers: boolean
}) {
  const { viewAnyway, setViewAnyway } = useBooksRead()
  if (!spoilers) return null
  const showing = viewAnyway.has(systemId)

  return (
    <aside
      className={`spoiler-notice${showing ? ' is-showing' : ''}`}
      aria-label="Spoilers"
    >
      <p>
        {showing
          ? 'Showing information hidden due to spoilers.'
          : 'Some information hidden due to spoilers.'}
      </p>
      <button type="button" onClick={() => setViewAnyway(systemId, !showing)}>
        {showing ? 'Hide again' : 'Show anyway'}
      </button>
    </aside>
  )
}
