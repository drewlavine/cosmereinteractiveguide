import { Link } from 'react-router'
import { characterPortraits } from '../data/characterPortraits'
import { revealPortrait } from '../data/reveal'
import { useCanSee } from '../state/reveal'

export interface GridPerson {
  characterId: string
  name: string
  /** Short ties shown under the name, e.g. 'Coinshot' or 'born here'. */
  roles: string[]
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/**
 * People as cards: the latest portrait the reader may see (or initials),
 * the name and their roles. Used by place, culture and magic pages.
 */
export function PeopleGrid({ people }: { people: GridPerson[] }) {
  const canSee = useCanSee()
  return (
    <ul className="people-grid">
      {people.map((p) => {
        const art = revealPortrait(
          characterPortraits[p.characterId],
          canSee,
        ).portrait
        return (
          <li key={p.characterId}>
            <Link to={`/characters/${p.characterId}`} className="people-card">
              {art ? (
                <img
                  className="people-card-face"
                  src={art.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="people-card-face" aria-hidden="true">
                  {initials(p.name)}
                </span>
              )}
              <span className="people-card-text">
                <span className="people-card-name">{p.name}</span>
                {p.roles.length > 0 && (
                  <span className="people-card-role">
                    {p.roles.join(' · ')}
                  </span>
                )}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
