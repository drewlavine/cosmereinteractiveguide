import { Link } from 'react-router'
import { assetUrl } from '../data/assetUrl'
import type { Portrait } from '../data/characterPortraits'
import { initials } from './bookMap/markers'
import styles from './CharacterTiles.module.css'

export interface CharacterTile {
  /** Their page; without one, the tile doesn't link. */
  id?: string
  name: string
  /** Already trimmed to what the reader may see; else their initials. */
  portrait?: Portrait
}

/** Characters as round, gold-ringed art tiles with their names. */
export function CharacterTiles({
  characters,
}: {
  characters: CharacterTile[]
}) {
  return (
    <ul className={styles.tiles}>
      {characters.map((c) => {
        const tile = (
          <>
            <span className={styles.art}>
              {c.portrait ? (
                <img src={assetUrl(c.portrait.src)} alt="" decoding="async" />
              ) : (
                <span aria-hidden>{initials(c.name)}</span>
              )}
            </span>
            {c.name}
          </>
        )
        return (
          <li key={c.id ?? c.name}>
            {c.id ? (
              <Link to={`/characters/${c.id}`} className={styles.tile}>
                {tile}
              </Link>
            ) : (
              <span className={styles.tile}>{tile}</span>
            )}
            {c.portrait && (
              <small className={styles.credit}>Art: {c.portrait.artist}</small>
            )}
          </li>
        )
      })}
    </ul>
  )
}
