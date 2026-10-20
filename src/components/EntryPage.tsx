import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { BookList } from './BookList'
import { PeopleGrid, type GridPerson } from './PeopleGrid'
import { PageContents, PageSection, PageSubsection } from './PageSections'
import { slugs } from './pageSlugs'
import { SourceMark } from './SourceMark'
import { SpoilerNotice } from './SpoilerNotice'
import { useLinkText, type LinkTextFn } from './LinkedText'
import {
  cachedEntryStory,
  entryBooks,
  entryRevealedIn,
  hasEntryStory,
  loadEntryStory,
  shownAliases,
  type EntryKind,
} from '../data/entryStories'
import { abilityList } from '../data/abilities'
import { entryAliases } from '../data/entryAliases'
import { entryArt } from '../data/entryArt'
import { findListed, placeHref, placeRevealedIn } from '../data/listedLocations'
import { findPerson } from '../data/people'
import { revealEntry, revealPortrait, type ShownEntry } from '../data/reveal'
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
  const link = useLinkText(scope)
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
  const art = revealPortrait(entryArt[scope], canSee, showAll)
  const shownArt = art.portrait as (typeof entryArt)[string][number] | undefined
  const planet = systems
    .flatMap((s) => s.planets.map((p) => ({ ...p, systemId: s.id })))
    .find((p) => p.id === entry.world)

  const value = (v: ShownEntry['facts'][number]['values'][number]) => {
    const place = findListed(v.placeId)
    if (place && (showAll || placeShown(place.id)))
      return <Link to={placeHref(place, planetShown)}>{v.name}</Link>
    if (v.characterId && findPerson(v.characterId))
      return <Link to={`/characters/${v.characterId}`}>{v.name}</Link>
    return link(v.name)
  }
  const aliasFacts: [string, string[]][] = []
  for (const a of showAll
    ? (entryAliases[kind][entry.id] ?? [])
    : shownAliases(kind, entry, canSee)) {
    const row = aliasFacts.find(([role]) => role === a.role)
    if (row) row[1].push(a.name)
    else aliasFacts.push([a.role, [a.name]])
  }
  const historyIds = slugs(
    'history',
    shown.history.map((h) => h.title ?? ''),
  )
  const levelIds = slugs('people', shown.levels)
  const mechanicsIds = slugs(
    'how',
    shown.mechanics.map((h) => h.title ?? ''),
  )
  const tableIds = slugs(
    'table',
    shown.tables.map((t) => t.title),
  )
  const entryLink = (id: string | undefined, text: string) => {
    const e = id && abilityList.find((a) => a.id === id)
    return e && (showAll || canSee(entryRevealedIn('ability', e))) ? (
      <Link to={`/magic/${e.id}`}>{text}</Link>
    ) : (
      text
    )
  }
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
        spoilers={
          shown.spoilers || art.spoilers || books.length < entry.books.length
        }
      />
      <div className="character-body">
        <header className="character-header">
          <h1 id="entry-title">{entry.name}</h1>
          {shown.intro && (
            <p className="character-intro">{link(shown.intro)}</p>
          )}
        </header>
        <div className="character-side">
          {shownArt && (
            <figure
              className={`character-portrait${shownArt.glyph ? ' entry-glyph' : ''}`}
            >
              <img src={shownArt.src} alt={shownArt.alt} />
              <figcaption>
                Art by{' '}
                {shownArt.artistUrl ? (
                  <a href={shownArt.artistUrl} target="_blank" rel="noreferrer">
                    {shownArt.artist}
                  </a>
                ) : (
                  shownArt.artist
                )}
              </figcaption>
            </figure>
          )}
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
              {aliasFacts.map(([role, names]) => (
                <Fragment key={`alias-${role}`}>
                  <dt>{role}</dt>
                  <dd>{names.join(', ')}</dd>
                </Fragment>
              ))}
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
              {(() => {
                const linked = new Set<string>()
                return shown.description.map((text) => (
                  <p key={text}>{link(text, linked)}</p>
                ))
              })()}
            </PageSection>
          )}
          {shown.mechanics.length > 0 && (
            <PageSection id="how" title="How it works">
              <Sections
                sections={shown.mechanics}
                ids={mechanicsIds}
                link={link}
              />
            </PageSection>
          )}
          {shown.tables.map((t, i) => (
            <PageSection key={tableIds[i]} id={tableIds[i]} title={t.title}>
              <div className="entry-table-wrap">
                <table className="entry-table">
                  <thead>
                    <tr>
                      {t.columns.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row) => (
                      <tr key={row.key}>
                        {row.cells.map((cell, j) =>
                          j === 0 ? (
                            <th key={j} scope="row">
                              {entryLink(row.entry, cell)}
                            </th>
                          ) : (
                            <td key={j}>
                              {cell}
                              {j === row.cells.length - 1 && (
                                <SourceMark books={row.books} />
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageSection>
          ))}
          {shown.history.length > 0 && (
            <PageSection id="history" title="History">
              <Sections sections={shown.history} ids={historyIds} link={link} />
            </PageSection>
          )}
          {people.length > 0 && (
            <PageSection
              id="people"
              title={kind === 'ability' ? 'Users' : 'People'}
            >
              {shown.levels.length > 0 ? (
                <>
                  {shown.levels.map((level, i) => (
                    <PageSubsection key={level} id={levelIds[i]} title={level}>
                      <PeopleList
                        people={people.filter((p) => p.level === level)}
                        level={level}
                      />
                    </PageSubsection>
                  ))}
                  {people.some((p) => !p.level) && (
                    <PageSubsection id="people-other" title="Other users">
                      <PeopleList people={people.filter((p) => !p.level)} />
                    </PageSubsection>
                  )}
                </>
              ) : (
                <PeopleList people={people} />
              )}
            </PageSection>
          )}
        </div>
        <PageContents />
      </div>
    </article>
  )
}

/** Titled sections of dated paragraphs, e.g. How it works. */
function Sections({
  sections,
  ids,
  link,
}: {
  sections: ShownEntry['mechanics']
  ids: string[]
  link: LinkTextFn
}) {
  return sections.map(({ title, items }, i) => {
    const linked = new Set<string>()
    const paragraphs = items.map(({ text, books }) => (
      <p key={text}>
        {link(text, linked)}
        <SourceMark books={books} />
      </p>
    ))
    return title ? (
      <PageSubsection key={ids[i]} id={ids[i]} title={title}>
        {paragraphs}
      </PageSubsection>
    ) : (
      <Fragment key={`untitled-${i}`}>{paragraphs}</Fragment>
    )
  })
}

/** Users at one level; a role that just repeats the level is left out. */
function PeopleList({
  people,
  level,
}: {
  people: GridPerson[]
  level?: string
}) {
  return (
    <PeopleGrid
      people={people.map((p) => ({
        ...p,
        roles: p.roles.filter((r) => r.toLowerCase() !== level?.toLowerCase()),
      }))}
    />
  )
}
