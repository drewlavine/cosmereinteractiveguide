import { Fragment } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { EntryPage } from '../components/EntryPage'
import { abilityKindNames, abilityList } from '../data/abilities'
import { findCharacter } from '../data/characters'
import { cultureList } from '../data/culture'
import { entryRevealedIn } from '../data/entryStories'
import { eventList } from '../data/events'
import { useCanSee } from '../state/reveal'
import { NotFound } from './NotFound'

/** A magic system's or ability's page, e.g. Allomancy or Windrunner. */
export function AbilityDetail() {
  const { abilityId } = useParams()
  const canSee = useCanSee()
  const entry = abilityList.find((a) => a.id === abilityId)
  if (!entry) {
    // Entries moved to another list (Reod is an event).
    const to = eventList.some((e) => e.id === abilityId)
      ? 'events'
      : cultureList.some((c) => c.id === abilityId)
        ? 'culture'
        : findCharacter(abilityId)
          ? 'characters'
          : undefined
    return to ? <Navigate to={`/${to}/${abilityId}`} replace /> : <NotFound />
  }
  const systems = (entry.systems ?? [])
    .filter((t) => canSee(t.revealedIn))
    .map((t) => abilityList.find((a) => a.id === t.id))
    .filter((a) => a && canSee(entryRevealedIn('ability', a)))
  const shards = (entry.shards ?? []).filter((s) => canSee(s.revealedIn))
  return (
    <EntryPage
      key={entry.id}
      kind="ability"
      entry={entry}
      list={{ name: 'Magic', href: '/magic' }}
      typeLabel={abilityKindNames[entry.kind]}
      extraFacts={
        <>
          {systems.length > 0 && (
            <>
              <dt>Magic system</dt>
              <dd>
                {systems.map((s, i) => (
                  <Fragment key={s!.id}>
                    {i > 0 && ', '}
                    <Link to={`/magic/${s!.id}`}>{s!.name}</Link>
                  </Fragment>
                ))}
              </dd>
            </>
          )}
          {shards.length > 0 && (
            <>
              <dt>{shards.length > 1 ? 'Shards' : 'Shard'}</dt>
              <dd>{shards.map((s) => s.name).join(', ')}</dd>
            </>
          )}
        </>
      }
    />
  )
}
