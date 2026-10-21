import { useParams } from 'react-router'
import { EntryPage } from '../components/EntryPage'
import { eventKindNames, eventList } from '../data/events'
import { NotFound } from './NotFound'

/** An event's page, e.g. a battle, Desolation or era. */
export function EventDetail() {
  const { eventId } = useParams()
  const entry = eventList.find((e) => e.id === eventId)
  if (!entry) return <NotFound />
  return (
    <EntryPage
      key={entry.id}
      kind="event"
      entry={entry}
      list={{ name: 'Events', href: '/events' }}
      typeLabel={eventKindNames[entry.kind]}
    />
  )
}
