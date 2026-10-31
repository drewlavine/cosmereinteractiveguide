import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  chronoKinds,
  chronoTiers,
  revealChronology,
  type ChronoEvent,
  type ChronoKind,
  type ChronoTier,
} from '../data/chronology'
import { formatYear } from '../data/timeline'
import { useCanSee } from '../state/reveal'
import styles from './Chronology.module.css'

const tierLabels: Record<ChronoTier, string> = {
  headline: 'Headline',
  major: 'Major',
  minor: 'Minor',
}

/**
 * The researched chronology, for Drew to review (`??`, or five taps on the
 * site title; not linked anywhere). Gated by Books Read like every page.
 */
export function Chronology() {
  const canSee = useCanSee()
  const [events, setEvents] = useState<ChronoEvent[]>()
  const [tiers, setTiers] = useState<ReadonlySet<ChronoTier>>(
    () => new Set(chronoTiers),
  )
  const [kind, setKind] = useState<ChronoKind | ''>('')
  const [world, setWorld] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    void import('../data/chronology.json').then((m) =>
      setEvents(m.default as unknown as ChronoEvent[]),
    )
  }, [])

  const shown = useMemo(
    () => (events ? revealChronology(events, canSee) : []),
    [events, canSee],
  )
  const worlds = [...new Map(shown.map((e) => [e.world.id, e.world])).values()]
  const q = query.trim().toLowerCase()
  const list = shown.filter(
    (e) =>
      tiers.has(e.tier) &&
      (!kind || e.kind === kind) &&
      (!world || e.world.id === world) &&
      (!q ||
        [e.id, e.title, ...e.summary].some((t) => t.toLowerCase().includes(q))),
  )
  const toggle = (tier: ChronoTier) => {
    const next = new Set(tiers)
    if (!next.delete(tier)) next.add(tier)
    setTiers(next)
  }

  return (
    <article className="character-list" aria-labelledby="chronology-title">
      <h1 id="chronology-title">Chronology</h1>
      <p className="character-count">
        Research draft, as far as you’ve read
        {events && ` · ${list.length} of ${shown.length} events`}
      </p>

      <div className={styles.filters} role="group" aria-label="Filters">
        {chronoTiers.map((tier) => (
          <label key={tier} className={styles.chip}>
            <input
              type="checkbox"
              checked={tiers.has(tier)}
              onChange={() => toggle(tier)}
            />
            {tierLabels[tier]}
          </label>
        ))}
        <select
          aria-label="Kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as ChronoKind | '')}
        >
          <option value="">Every kind</option>
          {Object.entries(chronoKinds).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="World"
          value={world}
          onChange={(e) => setWorld(e.target.value)}
        >
          <option value="">Every world</option>
          {worlds.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          aria-label="Find"
          placeholder="Find text or id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {events && !list.length && <p>Nothing to show yet.</p>}
      <ol className={styles.list}>
        {list.map((e) => (
          <li key={e.id} className={styles.event} data-tier={e.tier}>
            <div className={styles.when}>
              {e.year !== undefined && (
                <span
                  className={styles.year}
                  title={
                    e.range &&
                    `Between ${formatYear({ year: e.range[0] })} and ${formatYear({ year: e.range[1] })}`
                  }
                >
                  {formatYear({
                    year: e.year,
                    circa: e.certainty === 'estimate',
                  })}
                </span>
              )}
              {e.local && <span className={styles.local}>{e.local}</span>}
            </div>
            <div>
              <h2 className={styles.title}>
                {e.title}
                <span className={styles.badge}>{tierLabels[e.tier]}</span>
                <span className={styles.badge}>{chronoKinds[e.kind]}</span>
                {e.wob && <span className={styles.badge}>Word of Brandon</span>}
              </h2>
              {e.summary.map((s) => (
                <p key={s} className={styles.summary}>
                  {s}
                </p>
              ))}
              <p className={styles.meta}>
                <span>{e.world.name}</span>
                {e.inBook && <span>{e.inBook}</span>}
                {!!e.characters.length && (
                  <span>
                    {e.characters.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ', '}
                        <Link to={`/characters/${c.id}`}>{c.name}</Link>
                      </span>
                    ))}
                  </span>
                )}
                <span>
                  Dated by {e.basis === 'wob' ? 'Word of Brandon' : e.basis}
                  {e.certainty !== 'exact' && ` (${e.certainty})`}
                </span>
                {e.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
                <code className={styles.id}>{e.id}</code>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}
