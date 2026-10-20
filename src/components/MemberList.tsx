import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PageSubsection } from './PageSections'
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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

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
 * A group's members in the page's order, each with what the page says about
 * them (or, if nothing, their own page's intro), each a titled section like
 * the Coppermind's.
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

  const face = (m: ShownMember) => {
    const art = revealPortrait(
      characterPortraits[m.characterId],
      canSee,
    ).portrait
    return art ? (
      <img
        className="people-card-face"
        src={art.src}
        alt=""
        loading="lazy"
        decoding="async"
      />
    ) : (
      <span className="people-card-face" aria-hidden="true">
        {initials(m.name)}
      </span>
    )
  }
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

  return members.map((m, i) => (
    <PageSubsection
      key={m.characterId}
      id={ids[i]}
      title={m.name}
      className="member-entry"
    >
      <Link
        to={`/characters/${m.characterId}`}
        className="member-entry-face"
        aria-label={`${m.name}’s page`}
      >
        {face(m)}
      </Link>
      <div className="member-entry-text">{body(m)}</div>
    </PageSubsection>
  ))
}
