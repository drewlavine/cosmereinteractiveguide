/** A list's groups, as the browsable lists (Characters, Locations...) show them. */
interface JumpGroup {
  id: string
  name: string
}

/** A–Z links above a list sorted by name. */
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
