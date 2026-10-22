import { worldColour, worldNames, type World } from '../../data/timelineMock'

export type WorldFilter = World | 'all'

/** Buttons that filter a timeline to one world. */
export function WorldChips({
  filter,
  onChange,
}: {
  filter: WorldFilter
  onChange: (filter: WorldFilter) => void
}) {
  return (
    <div className="tl-chips" role="group" aria-label="Filter by world">
      <button
        type="button"
        className="tl-chip"
        aria-pressed={filter === 'all'}
        onClick={() => onChange('all')}
      >
        All worlds
      </button>
      {(Object.keys(worldNames) as World[]).map((w) => (
        <button
          key={w}
          type="button"
          className="tl-chip"
          style={worldColour(w)}
          aria-pressed={filter === w}
          onClick={() => onChange(w)}
        >
          <i aria-hidden />
          {worldNames[w]}
        </button>
      ))}
    </div>
  )
}
