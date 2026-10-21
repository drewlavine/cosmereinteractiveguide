import { eventKindLabels, eventList } from '../data/events'
import { EntryList } from './EntryList'

export function EventList() {
  return (
    <EntryList
      kind="event"
      list={eventList}
      kindLabels={eventKindLabels}
      title="Events"
      path="events"
      noun="events"
    />
  )
}
