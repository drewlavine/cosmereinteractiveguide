import { useEffect, useState } from 'react'
import { EntryCard } from './EntryCards'
import { slugs } from './pageSlugs'
import { SourceMark } from './SourceMark'
import type { LinkTextFn } from './LinkedText'
import { characterPortraits } from '../data/characterPortraits'
import { cachedStory, hasStory, loadStory } from '../data/characterStories'
import {
  findPersona,
  revealPortrait,
  revealStory,
  type CanSee,
  type ShownEntry,
} from '../data/reveal'

/** The character behind a persona, whose story holds the persona's intro. */
const storyId = (id: string) => findPersona(id)?.characterId ?? id

/** Loads the stories of members the group's page says nothing about. */
function useIntros(ids: string[]) {
  const [, setLoaded] = useState(0)
  const key = ids.join(' ')
  useEffect(() => {
    let live = true
    for (const id of key ? key.split(' ') : [])
      if (hasStory(storyId(id)) && !cachedStory(storyId(id)))
        void loadStory(storyId(id)).then(() => live && setLoaded((n) => n + 1))
    return () => {
      live = false
    }
  }, [key])
}

export type ShownMember = ShownEntry['members'][number] & { name: string }

/**
 * A group's members in the page's order, each a card with their portrait (or
 * a placeholder), name linked to their page, and what the group's page says
 * about them (or, if nothing, their own page's intro).
 */
export function MemberList({
  members,
  canSee,
  viewAnyway,
  link,
}: {
  members: ShownMember[]
  canSee: CanSee
  viewAnyway: boolean
  link: LinkTextFn
}) {
  useIntros(members.filter((m) => !m.items.length).map((m) => m.characterId))
  const ids = slugs(
    'member',
    members.map((m) => m.name),
  )

  const body = (m: ShownMember) => {
    const linked = new Set<string>([`character:${storyId(m.characterId)}`])
    if (m.items.length)
      return m.items.map(({ text, books }) => (
        <p key={text}>
          {link(text, linked)}
          <SourceMark books={books} />
        </p>
      ))
    const intro = revealStory(
      m.characterId,
      cachedStory(storyId(m.characterId)),
      canSee,
      viewAnyway,
    ).intro
    return intro ? <p>{link(intro, linked)}</p> : null
  }

  return (
    <div className="entry-cards">
      {members.map((m, i) => (
        <EntryCard
          key={m.characterId}
          id={ids[i]}
          title={m.name}
          href={`/characters/${m.characterId}`}
          art={
            revealPortrait(
              characterPortraits[m.characterId],
              canSee,
              viewAnyway,
            ).portrait
          }
          icon="character"
        >
          {body(m)}
        </EntryCard>
      ))}
    </div>
  )
}
