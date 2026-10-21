import { Navigate, useParams } from 'react-router'
import { EntryPage } from '../components/EntryPage'
import { cultureKindNames, cultureList } from '../data/culture'
import { lifeformList } from '../data/lifeforms'
import { NotFound } from './NotFound'

/** A Culture entry's page, e.g. a people, house or organization. */
export function CultureDetail() {
  const { cultureId } = useParams()
  const entry = cultureList.find((c) => c.id === cultureId)
  if (!entry) {
    // Spren, species, creatures and plants moved to the Lifeforms tab.
    if (lifeformList.some((e) => e.id === cultureId))
      return <Navigate to={`/lifeforms/${cultureId}`} replace />
    return <NotFound />
  }
  return (
    <EntryPage
      key={entry.id}
      kind="culture"
      entry={entry}
      list={{ name: 'Culture', href: '/culture' }}
      typeLabel={cultureKindNames[entry.kind]}
    />
  )
}
