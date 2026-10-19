import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { BookList } from './BookList'
import { PageContents, PageSection, PageSubsection } from './PageSections'
import { slugs } from './pageSlugs'
import { SourceMark } from './SourceMark'
import { SpoilerNotice } from './SpoilerNotice'
import {
  cachedEntryStory,
  entryBooks,
  entryRevealedIn,
  hasEntryStory,
  loadEntryStory,
  type EntryKind,
} from '../data/entryStories'
import { findListed, placeHref, placeRevealedIn } from '../data/listedLocations'
import { findPerson } from '../data/people'
import { revealEntry, type ShownEntry } from '../data/reveal'
import type { Reveal } from '../data/types'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'

const coppermindUrl = (page: string) =>
  `https://coppermind.net/wiki/${encodeURIComponent(page.replaceAll(' ', '_'))}`

/** An entry's page, loaded on demand; `loading` until it arrives. */
function useEntryStory(kind: EntryKind, id: string) {
  const [, setLoaded] = useState<string>()
  const story = cachedEntryStory(kind, id)
  useEffect(() => {
    let live = true
    if (!cachedEntryStory(kind, id))
      void loadEntryStory(kind, id).then(() => live && setLoaded(id))
    return () => {
      live = false
    }
  }, [kind, id])
  return { story, loading: hasEntryStory(kind, id) && !story }
}

export interface EntryPageProps {
  kind: EntryKind
  entry: {
    id: string
    name: string
    world?: string
    revealedIn: Reveal
    books: string[]
    coppermindPage: string
  }
  /** The list it belongs to, e.g. Culture. */
  list: { name: string; href: string }
  /** e.g. "Organizations"; shown as Key facts' Type row. */
  typeLabel: string
  /** More Key facts rows (dt/dd pairs). */
  extraFacts?: ReactNode
}

/**
 * A Culture or Abilities entry's page: Key facts beside its intro, about,
 * history and people, each trimmed to the reader's books. Hidden entirely
 * until the entry is revealed, like everything else.
 */
export function EntryPage({
  kind,
  entry,
  list,
  typeLabel,
  extraFacts,
}: EntryPageProps) {
  const canSee = useCanSee()
  const systems = useShownSystems()
  const { viewAnyway } = useBooksRead()
  const prose = useEntryStory(kind, entry.id)
  const [factsOpen, setFactsOpen] = useState(false)
  const scope = `${kind}:${entry.id}`
  const showAll = viewAnyway.has(scope)

  if (!showAll && !canSee(entryRevealedIn(kind, entry)))
    return (
      <section className="message-page" aria-labelledby="hidden-title">
        <h1 id="hidden-title">Not reached yet</h1>
        <p>Your Books Read don’t reach this yet.</p>
        <SpoilerNotice scope={scope} spoilers />
        <Link to={list.href}>Back to {list.name}</Link>
      </section>
    )
  if (prose.loading)
    return <article className="character-detail entry-page" aria-busy="true" />

  const planetShown = (planetId: string) =>
    systems.some((s) => s.planets.some((p) => p.id === planetId))
  const placeShown = (placeId: string) => {
    const l = findListed(placeId)
    return !!l && canSee(placeRevealedIn(l))
  }
  const shown: ShownEntry = revealEntry(
    prose.story,
    canSee,
    placeShown,
    showAll,
  )
  const books = showAll ? entry.books : entryBooks(kind, entry, canSee)
  const planet = systems
    .flatMap((s) => s.planets.map((p) => ({ ...p, systemId: s.id })))
    .find((p) => p.id === entry.world)

  const value = (v: ShownEntry['facts'][number]['values'][number]) => {
    const place = findListed(v.placeId)
    if (place && (showAll || placeShown(place.id)))
      return <Link to={placeHref(place, planetShown)}>{v.name}</Link>
    if (v.characterId && findPerson(v.characterId))
      return <Link to={`/characters/${v.characterId}`}>{v.name}</Link>
    return v.name
  }
  const historyIds = slugs(
    'history',
    shown.history.map((h) => h.title ?? ''),
  )
  const people = shown.people
    .map((p) => ({ ...p, name: findPerson(p.characterId)?.name }))
    .filter((p): p is typeof p & { name: string } => !!p.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <article
      className="character-detail entry-page"
      aria-labelledby="entry-title"
    >
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to={list.href}>{list.name}</Link> /{' '}
        <span aria-current="page">{entry.name}</span>
      </nav>
      <SpoilerNotice
        scope={scope}
        spoilers={shown.spoilers || books.length < entry.books.length}
      />
      <div className="character-body">
        <header className="character-header">
          <h1 id="entry-title">{entry.name}</h1>
          {shown.intro && <p className="character-intro">{shown.intro}</p>}
        </header>
        <div className="character-side">
          <aside
            className={`character-infobox${factsOpen ? '' : ' collapsed'}`}
            aria-label="Key facts"
          >
            <button
              type="button"
              className="character-infobox-toggle"
              aria-expanded={factsOpen}
              onClick={() => setFactsOpen((open) => !open)}
            >
              Key facts
            </button>
            <dl>
              <dt>Type</dt>
              <dd>{typeLabel}</dd>
              {planet && (
                <>
                  <dt>World</dt>
                  <dd>
                    <Link
                      to={`/systems/${planet.systemId}/planets/${planet.id}`}
                    >
                      {planet.name}
                    </Link>
                  </dd>
                </>
              )}
              {shown.facts.map(({ label, values }) => (
                <Fragment key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {values.map((v, i) => (
                      <Fragment key={v.name}>
                        {i > 0 && ', '}
                        {value(v)}
                      </Fragment>
                    ))}
                  </dd>
                </Fragment>
              ))}
              {extraFacts}
              <BookList label="Appears in" bookIds={books} />
            </dl>
            <p className="character-infobox-source">
              <a
                href={coppermindUrl(entry.coppermindPage)}
                target="_blank"
                rel="noreferrer"
              >
                {entry.name} on the Coppermind
              </a>
              <span className="spoiler-warning">
                {' '}
                (covers every book, so expect spoilers)
              </span>
            </p>
          </aside>
        </div>
        <div className="character-main character-story">
          {shown.description.length > 0 && (
            <PageSection id="about" title="About">
              {shown.description.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </PageSection>
          )}
          {shown.history.length > 0 && (
            <PageSection id="history" title="History">
              {shown.history.map(({ title, items }, i) => {
                const paragraphs = items.map(({ text, books }) => (
                  <p key={text}>
                    {text}
                    <SourceMark books={books} />
                  </p>
                ))
                return title ? (
                  <PageSubsection
                    key={historyIds[i]}
                    id={historyIds[i]}
                    title={title}
                  >
                    {paragraphs}
                  </PageSubsection>
                ) : (
                  <Fragment key={`untitled-${i}`}>{paragraphs}</Fragment>
                )
              })}
            </PageSection>
          )}
          {people.length > 0 && (
            <PageSection id="people" title="People">
              <ul className="place-people">
                {people.map((p) => (
                  <li key={p.characterId}>
                    <Link to={`/characters/${p.characterId}`}>{p.name}</Link>{' '}
                    <span className="place-people-tie">
                      {p.roles.join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
            </PageSection>
          )}
        </div>
        <PageContents />
      </div>
    </article>
  )
}
