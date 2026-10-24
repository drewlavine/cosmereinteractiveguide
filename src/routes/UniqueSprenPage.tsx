import { EntryPage } from '../components/EntryPage'
import { PageSection } from '../components/PageSections'
import { useLinkText } from '../components/LinkedText'
import { EntryCard } from '../components/EntryCards'
import { characterPortraits } from '../data/characterPortraits'
import { cachedStory, hasStory, loadStory } from '../data/characterStories'
import { entryArt } from '../data/entryArt'
import {
  cachedEntryStory,
  entryRevealedIn,
  hasEntryStory,
  loadEntryStory,
} from '../data/entryStories'
import { lifeformList, uniqueSprenEntry } from '../data/lifeforms'
import { findListed, placeRevealedIn } from '../data/listedLocations'
import { findPerson } from '../data/people'
import {
  hasMet,
  revealEntry,
  revealPortrait,
  revealStory,
} from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useLoadAll } from '../state/loadAll'
import { useCanSee } from '../state/reveal'

const scope = `lifeform:${uniqueSprenEntry.id}`

/** The unique spren with pages, in the Coppermind's order. */
const characterIds = ['nightwatcher', 'stormfather', 'sibling']
const lifeformIds = ['unmade']

/** Their pages not loaded yet. */
const missing = () => [
  ...characterIds
    .filter((id) => hasStory(id) && !cachedStory(id))
    .map((id) => () => loadStory(id)),
  ...lifeformIds
    .filter(
      (id) =>
        hasEntryStory('lifeform', id) && !cachedEntryStory('lifeform', id),
    )
    .map((id) => () => loadEntryStory('lifeform', id)),
]

/**
 * The one-of-a-kind spren: what they are, then a card for each the reader
 * has met, with its art and intro, leading to its own page.
 */
export function UniqueSprenPage() {
  const canSee = useCanSee()
  const { viewAnyway } = useBooksRead()
  const link = useLinkText(scope)
  const ready = useLoadAll(missing)
  const showAll = viewAnyway.has(scope)

  if (!ready)
    return <article className="character-detail entry-page" aria-busy="true" />

  const placeShown = (placeId: string) => {
    const l = findListed(placeId)
    return !!l && canSee(placeRevealedIn(l))
  }
  const characters = characterIds.flatMap((id) => {
    const name = findPerson(id)?.name
    if (!name || !(showAll || hasMet(id, canSee))) return []
    const art = revealPortrait(characterPortraits[id], canSee, showAll)
    const { intro } = revealStory(id, cachedStory(id), canSee, showAll)
    return [
      {
        key: `character:${id}`,
        id,
        name,
        href: `/characters/${id}`,
        intro,
        art: art.portrait,
        spoilers: art.spoilers,
      },
    ]
  })
  const lifeforms = lifeformIds.flatMap((id) => {
    const e = lifeformList.find((l) => l.id === id)
    if (!e || !(showAll || canSee(entryRevealedIn('lifeform', e)))) return []
    const { intro } = revealEntry(
      cachedEntryStory('lifeform', id),
      canSee,
      placeShown,
      showAll,
    )
    const art = revealPortrait(entryArt[`lifeform:${id}`], canSee, showAll)
    return [
      {
        key: `lifeform:${id}`,
        id,
        name: e.name,
        href: `/lifeforms/${id}`,
        intro,
        art: art.portrait,
        spoilers: art.spoilers,
      },
    ]
  })
  const cards = [...characters, ...lifeforms]
  const all = characterIds.length + lifeformIds.length

  return (
    <EntryPage
      kind="lifeform"
      entry={uniqueSprenEntry}
      list={{ name: 'Lifeforms', href: '/lifeforms' }}
      typeLabel="Spren"
      extraSpoilers={cards.length < all || cards.some((c) => c.spoilers)}
    >
      {cards.length > 0 && (
        <PageSection id="known" title="Known unique spren">
          <div className="entry-cards">
            {cards.map((c) => (
              <EntryCard
                key={c.key}
                id={c.id}
                title={c.name}
                href={c.href}
                art={c.art}
              >
                {c.intro && <p>{link(c.intro, new Set([c.key]))}</p>}
              </EntryCard>
            ))}
          </div>
        </PageSection>
      )}
    </EntryPage>
  )
}
