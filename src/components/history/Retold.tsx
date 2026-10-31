import { useState } from 'react'
import type { Since } from '../../data/planetHistory'
import { retellings, toneStyle, type HistoryProps } from './helpers'
import s from './history.module.css'

const by = (since: Since) =>
  since.chapter ? `${since.book}, ${since.chapter}` : `the end of ${since.book}`

/**
 * The history as the reader learned it: a slider through each point in their
 * books that added to it, showing what they knew by then, with what was new
 * and what was retold marked.
 */
export function Retold(props: HistoryProps) {
  // Every point that told something new, in reading order.
  const points = [
    ...new Map(
      props.eras
        .flatMap((era) => [
          ...era.titles.flatMap((t) => (t.since ? [t.since] : [])),
          ...era.moments.flatMap((m) => retellings(m).map((v) => v.since)),
        ])
        .sort((a, b) => a.order - b.order)
        .map((since) => [since.order, since]),
    ).values(),
  ]
  const [at, setAt] = useState<number>()
  const i = Math.min(at ?? points.length - 1, points.length - 1)
  const now = points[i]
  const go = (n: number) => setAt(Math.max(0, Math.min(n, points.length - 1)))

  const known = props.eras.flatMap((era) => {
    const titles = era.titles.filter(
      (t) => !t.since || t.since.order <= now.order,
    )
    const moments = era.moments.flatMap((moment) => {
      const told = retellings(moment).filter((v) => v.since.order <= now.order)
      if (!told.length) return []
      const latest = told.at(-1)!
      const status =
        told[0].since.order === now.order
          ? 'new'
          : latest.since.order === now.order
            ? 'retold'
            : 'known'
      return [{ moment, latest, before: told.at(-2), status }]
    })
    const title = titles.at(-1)
    return title && moments.length
      ? [
          {
            era,
            title: title.text,
            before:
              title.since?.order === now.order
                ? titles.at(-2)?.text
                : undefined,
            moments,
          },
        ]
      : []
  })
  const all = known.flatMap((e) => e.moments)
  const fresh = all.filter((m) => m.status === 'new').length
  const retold = all.filter((m) => m.status === 'retold').length
  // Each book's share of the slider.
  const books = [...new Set(points.map((p) => p.book))].map((book) => ({
    book,
    count: points.filter((p) => p.book === book).length,
  }))

  return (
    <div className={s.retold}>
      <div className={s.retoldHead}>
        <p className={s.retoldNow} aria-live="polite">
          What you knew by <strong>{by(now)}</strong>
          <span>
            {[fresh && `${fresh} new`, retold && `${retold} retold`]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </p>
        <div className={s.controls}>
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0}>
            ‹ Earlier
          </button>
          <button
            type="button"
            onClick={() => go(i + 1)}
            disabled={i === points.length - 1}
          >
            Later ›
          </button>
        </div>
      </div>
      <input
        type="range"
        className={s.range}
        min={0}
        max={points.length - 1}
        value={i}
        aria-label="Point in your reading"
        aria-valuetext={by(now)}
        onChange={(e) => go(Number(e.target.value))}
      />
      <div className={s.books} aria-hidden>
        {books.map((b) => (
          <span key={b.book} style={{ flexGrow: b.count }}>
            {b.book}
          </span>
        ))}
      </div>

      {known.map(({ era, title, before, moments }) => (
        <section
          key={era.id}
          className={s.era}
          style={toneStyle(era.tone)}
          aria-labelledby={`history-era-${era.id}`}
        >
          <h3 id={`history-era-${era.id}`} className={s.eraTitle}>
            {title}
            {before && <span className={s.was}> once “{before}”</span>}
          </h3>
          <ul className={s.retoldList}>
            {moments.map(({ moment, latest, before, status }) => (
              <li key={moment.id} className={s.retoldItem} data-status={status}>
                {status !== 'known' && (
                  <span className={s.badge}>
                    {status === 'new' ? 'New' : 'Retold'}
                  </span>
                )}
                <h4 className={s.title}>{latest.title}</h4>
                <p className={s.text}>{props.link(latest.text)}</p>
                {status === 'retold' && before && (
                  <p className={s.before}>
                    <span>Before</span> {before.text}
                  </p>
                )}
                {status === 'known' && (
                  <p className={s.source}>Since {by(latest.since)}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
