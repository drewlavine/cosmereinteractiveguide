import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { assetUrl } from '../../data/assetUrl'
import type { MomentKind } from '../../data/planetHistory'
import { PortraitArt } from '../ArtViewer'
import {
  kindLabels,
  placePath,
  reducedMotion,
  sourceLine,
  stepsOf,
  toneStyle,
  type HistoryProps,
} from './helpers'
import s from './history.module.css'

const cardId = (momentId: string) => `history-card-${momentId}`

/**
 * The history as a codex: a card for each moment, by era, filtered by kind,
 * each linked to what caused it and what it led to.
 */
export function Codex(props: HistoryProps) {
  const steps = stepsOf(props.eras)
  const [kind, setKind] = useState<MomentKind>()
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  const [flash, setFlash] = useState<string>()
  const kinds = (Object.keys(kindLabels) as MomentKind[]).flatMap((k) => {
    const count = steps.filter((x) => x.moment.kind === k).length
    return count ? [{ kind: k, count }] : []
  })
  const titleOf = (id: string) =>
    steps.find((x) => x.moment.id === id)?.moment.title

  // Follow a cause or consequence: open its card, bring it into view, light
  // it up for a moment, and put focus on it.
  useEffect(() => {
    if (!flash) return
    const card = document.getElementById(cardId(flash))
    card
      ?.querySelector<HTMLElement>('h4 button')
      ?.focus({ preventScroll: true })
    card?.scrollIntoView?.({
      block: 'center',
      behavior: reducedMotion() ? 'auto' : 'smooth',
    })
    const done = setTimeout(() => setFlash(undefined), 1600)
    return () => clearTimeout(done)
  }, [flash])

  const toggle = (id: string) =>
    setOpen((was) => {
      const now = new Set(was)
      if (!now.delete(id)) now.add(id)
      return now
    })
  const follow = (id: string) => {
    if (kind && steps.find((x) => x.moment.id === id)?.moment.kind !== kind)
      setKind(undefined)
    setOpen((was) => new Set(was).add(id))
    setFlash(id)
  }
  const chips = (label: string, ids: string[]) =>
    ids.length > 0 && (
      <p className={s.links}>
        <span>{label}</span>
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            className={s.linkChip}
            onClick={() => follow(id)}
          >
            {titleOf(id)}
          </button>
        ))}
      </p>
    )

  return (
    <div className={s.codex}>
      <div className={s.filters} role="group" aria-label="Show moments of kind">
        {[{ kind: undefined, count: steps.length }, ...kinds].map((k) => (
          <button
            key={k.kind ?? 'all'}
            type="button"
            className={s.filter}
            data-kind={k.kind}
            aria-pressed={kind === k.kind}
            onClick={() => setKind(k.kind)}
          >
            {k.kind ? kindLabels[k.kind] : 'All'} <span>{k.count}</span>
          </button>
        ))}
      </div>

      {props.eras.map((era) => {
        const moments = era.moments.filter((m) => !kind || m.kind === kind)
        if (!moments.length) return null
        return (
          <section
            key={era.id}
            className={s.era}
            style={toneStyle(era.tone)}
            aria-labelledby={`history-era-${era.id}`}
          >
            <h3 id={`history-era-${era.id}`} className={s.eraTitle}>
              {era.title}
            </h3>
            {era.when && <p className={s.when}>{era.when}</p>}
            <ul className={s.cards}>
              {moments.map((moment) => {
                const isOpen = open.has(moment.id)
                const ledTo = steps
                  .filter((x) => x.moment.after.includes(moment.id))
                  .map((x) => x.moment.id)
                return (
                  <li
                    key={moment.id}
                    id={cardId(moment.id)}
                    className={s.card}
                    data-open={isOpen || undefined}
                    data-flash={flash === moment.id || undefined}
                  >
                    {moment.art &&
                      (isOpen ? (
                        <PortraitArt
                          className={s.cardArt}
                          src={moment.art.src}
                          alt={moment.art.alt}
                          artist={moment.art.artist}
                          artistUrl={moment.art.artistUrl}
                        />
                      ) : (
                        <img
                          className={s.thumb}
                          src={assetUrl(moment.art.src)}
                          alt=""
                          loading="lazy"
                        />
                      ))}
                    <p className={s.kicker}>
                      <span className={s.kind} data-kind={moment.kind}>
                        {kindLabels[moment.kind]}
                      </span>
                    </p>
                    <h4 className={s.title}>
                      <button
                        type="button"
                        className={s.cardToggle}
                        aria-expanded={isOpen}
                        aria-controls={`${cardId(moment.id)}-more`}
                        onClick={() => toggle(moment.id)}
                      >
                        {moment.title}
                      </button>
                    </h4>
                    <p className={isOpen ? s.text : `${s.text} ${s.teaser}`}>
                      {props.link(moment.text)}
                    </p>
                    <div id={`${cardId(moment.id)}-more`} hidden={!isOpen}>
                      {moment.places.length > 0 && (
                        <ul className={s.places} aria-label="Where it happened">
                          {moment.places.map((place) => (
                            <li key={place.id}>
                              <Link to={placePath(props, place.id)}>
                                {place.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className={s.source}>{sourceLine(moment)}</p>
                    </div>
                    {chips('Because of', moment.after)}
                    {chips('Led to', ledTo)}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
