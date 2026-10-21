import { Navigate, useParams } from 'react-router'
import { EntryPage } from '../components/EntryPage'
import {
  lesserSprenEntry,
  lifeformHref,
  lifeformKindNames,
  lifeformList,
  trueSprenEntry,
  uniqueSprenEntry,
} from '../data/lifeforms'
import { LesserSprenPage } from './LesserSprenPage'
import { NotFound } from './NotFound'
import { TrueSprenPage } from './TrueSprenPage'
import { UniqueSprenPage } from './UniqueSprenPage'

/** A Lifeforms entry's page, e.g. a spren, species, creature or plant. */
export function LifeformDetail() {
  const { lifeformId } = useParams()
  if (lifeformId === lesserSprenEntry.id) return <LesserSprenPage />
  if (lifeformId === trueSprenEntry.id) return <TrueSprenPage />
  if (lifeformId === uniqueSprenEntry.id) return <UniqueSprenPage />
  const entry = lifeformList.find((e) => e.id === lifeformId)
  if (!entry) return <NotFound />
  if (entry.kind === 'lesser-spren')
    return <Navigate to={lifeformHref(entry)} replace />
  return (
    <EntryPage
      key={entry.id}
      kind="lifeform"
      entry={entry}
      list={{ name: 'Lifeforms', href: '/lifeforms' }}
      typeLabel={lifeformKindNames[entry.kind]}
    />
  )
}
