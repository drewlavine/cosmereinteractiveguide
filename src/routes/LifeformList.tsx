import { lifeformKindLabels, listedLifeforms } from '../data/lifeforms'
import { EntryList } from './EntryList'

export function LifeformList() {
  return (
    <EntryList
      kind="lifeform"
      list={listedLifeforms}
      kindLabels={lifeformKindLabels}
      title="Lifeforms"
      path="lifeforms"
      noun="lifeforms"
    />
  )
}
