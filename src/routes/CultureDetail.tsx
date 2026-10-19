import { useParams } from 'react-router'
import { EntryPage } from '../components/EntryPage'
import { cultureKindNames, cultureList } from '../data/culture'
import { NotFound } from './NotFound'

/** A Culture entry's page, e.g. a people, house or organization. */
export function CultureDetail() {
  const { cultureId } = useParams()
  const entry = cultureList.find((c) => c.id === cultureId)
  if (!entry) return <NotFound />
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
