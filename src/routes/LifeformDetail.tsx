import { useParams } from 'react-router'
import { EntryPage } from '../components/EntryPage'
import { lifeformKindNames, lifeformList } from '../data/lifeforms'
import { NotFound } from './NotFound'

/** A Lifeforms entry's page, e.g. a spren, species, creature or plant. */
export function LifeformDetail() {
  const { lifeformId } = useParams()
  const entry = lifeformList.find((e) => e.id === lifeformId)
  if (!entry) return <NotFound />
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
