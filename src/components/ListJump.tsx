/** A list's groups, as the browsable lists (Characters, Locations...) show them. */
interface JumpGroup {
  id: string
  name: string
}

/**
 * A–Z links above a list sorted by name. Grouped lists use GroupJump instead:
 * group names are too long to sit in a row.
 */
export function LetterJump({
  groups,
  anchor,
}: {
  groups: JumpGroup[]
  anchor: (id: string) => string
}) {
  if (groups.length === 0) return null
  return (
    <nav aria-label="Jump to letter" className="letter-index">
      {groups.map(({ id, name }) => (
        <a key={id} href={`#${anchor(id)}`}>
          {name}
        </a>
      ))}
    </nav>
  )
}

/** A "Jump to" menu beside Group by, scrolling to the chosen group. */
export function GroupJump({
  groups,
  anchor,
  label,
}: {
  groups: JumpGroup[]
  anchor: (id: string) => string
  /** What the list is grouped by, lower case, e.g. 'series'. */
  label: string
}) {
  if (groups.length < 2) return null
  return (
    <label className="character-group-by">
      Jump to
      <select
        aria-label={`Jump to ${label}`}
        value=""
        onChange={(event) => {
          document
            .getElementById(anchor(event.target.value))
            ?.scrollIntoView({ block: 'start' })
        }}
      >
        <option value="" disabled>
          Choose…
        </option>
        {groups.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
