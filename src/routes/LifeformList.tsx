import { lifeformKindLabels, lifeformList } from '../data/lifeforms'
import { EntryList } from './EntryList'

export function LifeformList() {
  return (
    <EntryList
      kind="lifeform"
      list={lifeformList}
      kindLabels={lifeformKindLabels}
      title="Lifeforms"
      path="lifeforms"
      noun="lifeforms"
    />
  )
}
