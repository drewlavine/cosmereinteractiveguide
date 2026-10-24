import { EntryPage } from '../components/EntryPage'
import { PageSection } from '../components/PageSections'
import { useLinkText } from '../components/LinkedText'
import { CardPeople, EntryCard } from '../components/EntryCards'
import { entryArt } from '../data/entryArt'
import {
  cachedEntryStory,
  entryRevealedIn,
  hasEntryStory,
  loadEntryStory,
} from '../data/entryStories'
import {
  lesserSpren,
  lesserSprenEntry,
  lesserSprenGroups,
} from '../data/lifeforms'
import { findListed, placeRevealedIn } from '../data/listedLocations'
import { findPerson } from '../data/people'
import { revealEntry, revealPortrait } from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useLoadAll } from '../state/loadAll'
import { useCanSee } from '../state/reveal'

const scope = `lifeform:${lesserSprenEntry.id}`

/** Every lesser spren's page not loaded yet. */
const missing = () =>
  lesserSpren
    .filter(
      (e) =>
        hasEntryStory('lifeform', e.id) && !cachedEntryStory('lifeform', e.id),
    )
    .map((e) => () => loadEntryStory('lifeform', e.id))

const grouped = new Set(lesserSprenGroups.flatMap((g) => g.ids ?? []))

/**
 * The lesser spren's shared page: what they are, then a card for each kind
 * the reader has met, grouped by what draws them, with its art, what it's
 * like and who has been seen with it.
 */
export function LesserSprenPage() {
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
  const met = lesserSpren.filter(
    (e) => showAll || canSee(entryRevealedIn('lifeform', e)),
  )
  const kinds = met.map((e) => {
    const shown = revealEntry(
      cachedEntryStory('lifeform', e.id),
      canSee,
      placeShown,
      showAll,
    )
    const art = revealPortrait(entryArt[`lifeform:${e.id}`], canSee, showAll)
    const people = shown.people
      .map((p) => ({
        id: p.characterId,
        name: findPerson(p.characterId)?.name,
      }))
      .filter((p): p is { id: string; name: string } => !!p.name)
      .sort((a, b) => a.name.localeCompare(b.name))
    return {
      ...e,
      shown,
      people,
      spoilers: shown.spoilers || art.spoilers,
      art: art.portrait,
    }
  })
  const spoilers =
    met.length < lesserSpren.length || kinds.some((k) => k.spoilers)
  const groups = lesserSprenGroups
    .map((g) => ({
      ...g,
      kinds: kinds.filter((k) =>
        g.ids ? g.ids.includes(k.id) : !grouped.has(k.id),
      ),
    }))
    .filter((g) => g.kinds.length > 0)

  return (
    <EntryPage
      kind="lifeform"
      entry={lesserSprenEntry}
      list={{ name: 'Lifeforms', href: '/lifeforms' }}
      typeLabel="Spren"
      intro="The many kinds of spren drawn to feelings, forces of nature and living things. Each kind is described below."
      extraSpoilers={spoilers}
    >
      {groups.map((g) => (
        <PageSection key={g.id} id={g.id} title={g.title}>
          <div className="entry-cards">
            {g.kinds.map((k) => {
              const linked = new Set([`lifeform:${k.id}`])
              const text = [
                ...(k.shown.intro ? [k.shown.intro] : []),
                ...k.shown.description,
              ]
              return (
                <EntryCard key={k.id} id={k.id} title={k.name} art={k.art}>
                  {text.map((t) => (
                    <p key={t}>{link(t, linked)}</p>
                  ))}
                  <CardPeople people={k.people} />
                </EntryCard>
              )
            })}
          </div>
        </PageSection>
      ))}
    </EntryPage>
  )
}
