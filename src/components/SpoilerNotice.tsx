import { useBooksRead } from '../state/booksRead'

/**
 * Says that spoilers are hidden, with a button that shows the hidden details
 * anyway or hides them again. `scope` is what the button covers: a system id
 * (for its planets and places too) or e.g. `character:kaladin`. Never names
 * the books doing the hiding, since that alone can be a spoiler. Renders
 * nothing when nothing is hidden.
 */
export function SpoilerNotice({
  scope,
  spoilers,
}: {
  scope: string
  spoilers: boolean
}) {
  const { viewAnyway, setViewAnyway } = useBooksRead()
  if (!spoilers) return null
  const showing = viewAnyway.has(scope)

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
      <button type="button" onClick={() => setViewAnyway(scope, !showing)}>
        {showing ? 'Hide again' : 'Show anyway'}
      </button>
    </aside>
  )
}
