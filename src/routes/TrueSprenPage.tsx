import { EntryPage } from '../components/EntryPage'
import { PageSection } from '../components/PageSections'
import { useLinkText } from '../components/LinkedText'
import { EntryCard } from '../components/EntryCards'
import { entryArt } from '../data/entryArt'
import {
  cachedEntryStory,
  entryRevealedIn,
  hasEntryStory,
  loadEntryStory,
} from '../data/entryStories'
import { lifeformHref, trueSpren, trueSprenEntry } from '../data/lifeforms'
import { findListed, placeRevealedIn } from '../data/listedLocations'
import { revealEntry, revealPortrait } from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useLoadAll } from '../state/loadAll'
import { useCanSee } from '../state/reveal'

const scope = `lifeform:${trueSprenEntry.id}`

/** Every true spren's page not loaded yet. */
const missing = () =>
  trueSpren
    .filter(
      (e) =>
        hasEntryStory('lifeform', e.id) && !cachedEntryStory('lifeform', e.id),
    )
    .map((e) => () => loadEntryStory('lifeform', e.id))

/**
 * The true spren: what they are, then a card for each kind the reader has
 * met, with its art and intro, leading to its own page.
 */
export function TrueSprenPage() {
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
  const met = trueSpren.filter(
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
    return {
      ...e,
      intro: shown.intro,
      art: art.portrait,
      spoilers: art.spoilers,
    }
  })

  return (
    <EntryPage
      kind="lifeform"
      entry={trueSprenEntry}
      list={{ name: 'Lifeforms', href: '/lifeforms' }}
      typeLabel="Spren"
      intro="Spren that think and speak for themselves. Each kind is summed up below."
      extraSpoilers={
        met.length < trueSpren.length || kinds.some((k) => k.spoilers)
      }
    >
      {kinds.length > 0 && (
        <PageSection id="kinds" title="Kinds">
          <div className="entry-cards">
            {kinds.map((k) => (
              <EntryCard
                key={k.id}
                id={k.id}
                title={k.name}
                href={lifeformHref(k)}
                art={k.art}
              >
                {k.intro && (
                  <p>{link(k.intro, new Set([`lifeform:${k.id}`]))}</p>
                )}
              </EntryCard>
            ))}
          </div>
        </PageSection>
      )}
    </EntryPage>
  )
}
