import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  artSrc,
  spineEras,
  spineEvents,
  worldColour,
  worldNames,
  type SpineEvent,
} from '../../data/timelineMock'
import { WorldChips, type WorldFilter } from './WorldChips'

/** A scalloped gold badge with points up, down and to each side. */
const badge = (() => {
  const cx = 66
  const cy = 75
  const points: string[] = []
  for (let i = 0; i <= 360; i++) {
    const a = (i * Math.PI) / 180
    const r = 40 + 4.2 * Math.cos(12 * a)
    points.push(
      `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`,
    )
  }
  return {
    flower: `M${points.join('L')}Z`,
    spikes:
      `M${cx},2 L${cx + 6},${cy - 30} L${cx - 6},${cy - 30}Z ` +
      `M${cx},148 L${cx + 6},${cy + 30} L${cx - 6},${cy + 30}Z ` +
      `M2,${cy} L${cx - 30},${cy - 7} L${cx - 30},${cy + 7}Z ` +
      `M130,${cy} L${cx + 30},${cy - 7} L${cx + 30},${cy + 7}Z`,
  }
})()

function Badge({ event: e }: { event: SpineEvent }) {
  return (
    <div className="tl-badge">
      <div className="tl-badge-date">
        <b className={e.d.length > 5 ? 'sm' : undefined}>{e.d}</b>
        {e.c && <small>{e.c}</small>}
      </div>
      <svg viewBox="0 0 132 150" aria-hidden>
        <path d={badge.spikes} fill="#d4a540" />
        <path
          d={badge.flower}
          fill="url(#tl-badge-gold)"
          stroke="#8a6a22"
          strokeWidth=".8"
        />
      </svg>
    </div>
  )
}

function Picture({ event: e }: { event: SpineEvent }) {
  return e.img ? (
    <img src={artSrc(e.img)} alt="" />
  ) : (
    <span className="tl-noart">
      <b>{worldNames[e.w]}</b>
      <small>No art yet</small>
    </span>
  )
}

const Estimated = ({ event }: { event: SpineEvent }) =>
  event.est ? <em>Estimated</em> : null

/** Mockup 2: a horizontal gold spine; each title opens a details modal. */
export function TimelineSpine() {
  const [filter, setFilter] = useState<WorldFilter>('all')
  const [open, setOpen] = useState<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const visible = spineEvents.flatMap((e, i) =>
    filter === 'all' || e.w === filter ? [i] : [],
  )
  const eras = [...new Set(visible.map((i) => spineEvents[i].era))]

  const scrollBy = (direction: number) => {
    const el = scroller.current
    el?.scrollBy?.({
      left: direction * el.clientWidth * 0.8,
      behavior: 'smooth',
    })
  }
  const jumpTo = (era: string) => {
    const el = scroller.current
    const target = el?.querySelector<HTMLElement>(`[data-era="${era}"]`)
    if (el && target)
      el.scrollTo?.({ left: target.offsetLeft - 16, behavior: 'smooth' })
  }

  const items: ReactNode[] = []
  let era = ''
  visible.forEach((i, k) => {
    const e = spineEvents[i]
    if (e.era !== era) {
      era = e.era
      const firstOfEra = spineEvents.find((x) => x.era === era)
      items.push(
        <div key={`era-${era}`} className="tl-h-era" data-era={era}>
          {filter === 'all' && firstOfEra?.gap && (
            <span className="tl-h-gap">{firstOfEra.gap}</span>
          )}
          <h2>{spineEras[era]}</h2>
        </div>,
      )
    }
    items.push(
      <div
        key={i}
        className={`tl-h-item ${k % 2 ? 'down' : 'up'}${e.est ? ' est' : ''}${e.book ? ' book' : ''}`}
        style={worldColour(e.w)}
      >
        <div className="tl-h-pic-side">
          <button
            type="button"
            className="tl-pic"
            tabIndex={-1}
            aria-label={`More about ${e.t}`}
            onClick={() => setOpen(i)}
          >
            <Picture event={e} />
          </button>
          <div className="tl-ttl">
            <span className="tl-w">
              {worldNames[e.w]}
              {e.book ? (
                <>
                  {' · Book · '}
                  <span className="tl-rd">✓ Read</span>
                </>
              ) : null}
            </span>
            <button type="button" onClick={() => setOpen(i)}>
              {e.t}
            </button>
          </div>
        </div>
        <Badge event={e} />
        <div className="tl-h-txt-side">
          <p>
            <span className="tl-spine-when">
              {e.when}
              <Estimated event={e} />
            </span>
            {e.s}
          </p>
        </div>
      </div>,
    )
  })

  return (
    <div className="tl-spine-view">
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="tl-badge-gold" cx="40%" cy="35%">
            <stop offset="0" stopColor="#f6db84" />
            <stop offset=".6" stopColor="#d9b13d" />
            <stop offset="1" stopColor="#b48a26" />
          </radialGradient>
        </defs>
      </svg>
      <WorldChips filter={filter} onChange={setFilter} />
      <div className="tl-h-nav">
        <nav className="tl-h-jump" aria-label="Jump to an era">
          {eras.map((era) => (
            <button key={era} type="button" onClick={() => jumpTo(era)}>
              {spineEras[era]}
            </button>
          ))}
        </nav>
        <div className="tl-h-arrows">
          <button
            type="button"
            aria-label="Earlier"
            onClick={() => scrollBy(-1)}
          >
            ←
          </button>
          <button type="button" aria-label="Later" onClick={() => scrollBy(1)}>
            →
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="tl-h-scroll"
        role="region"
        aria-label="Events, earliest first"
        tabIndex={0}
      >
        <div className="tl-h-track">{items}</div>
      </div>
      <p className="tl-foot">
        Mockup 2 · {spineEvents.length} events · dates from a fan spreadsheet,
        cross-checked with the Coppermind's chronology · each entry dated by the
        book that tells you about it
      </p>
      {open !== null && (
        <SpineModal
          index={open}
          visible={visible}
          onGo={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  )
}

const dateSource = (ds: string) =>
  /Word of Brandon/.test(ds) ? (
    <b className="tl-wob">Word of Brandon</b>
  ) : /:/.test(ds) ? (
    ds
  ) : (
    `Date from ${ds}`
  )

function SpineModal({
  index,
  visible,
  onGo,
  onClose,
}: {
  index: number
  visible: number[]
  onGo: (index: number) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current
    if (!el || el.open) return
    if (el.showModal) el.showModal()
    else el.setAttribute('open', '')
  }, [])

  const e = spineEvents[index]
  const k = visible.indexOf(index)
  const prev = visible[k - 1]
  const next = visible[k + 1]

  return (
    <dialog
      ref={dialog}
      className="tl-modal"
      aria-labelledby="tl-modal-title"
      style={worldColour(e.w)}
      onClose={onClose}
      onCancel={onClose}
      onKeyDown={(ev) => {
        if (ev.key === 'ArrowRight' && next !== undefined) onGo(next)
        if (ev.key === 'ArrowLeft' && prev !== undefined) onGo(prev)
      }}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose()
      }}
    >
      <div className="tl-m-head">
        <div className="tl-pic">
          <Picture event={e} />
        </div>
        <div>
          <div className="tl-w">
            {worldNames[e.w]}
            {e.book ? ' · Book' : ''}
          </div>
          <h2 id="tl-modal-title">{e.t}</h2>
          <div className="tl-m-when">
            {e.when}
            {e.cal && <span>{e.cal}</span>}
            <Estimated event={e} />
          </div>
        </div>
        <button
          type="button"
          className="tl-x"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="tl-m-body">
        <p>{e.more}</p>
        {e.credit && <p className="tl-credit">Art by {e.credit}</p>}
        {e.who && (
          <div className="tl-m-sec">
            <h3>Who’s involved</h3>
            <div className="tl-people">
              {e.who.map(([name, img]) => (
                <span key={name} className="tl-person">
                  {img ? (
                    <img src={artSrc(img)} alt="" />
                  ) : (
                    <span className="tl-ini">
                      {name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  )}
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
        {e.where && (
          <div className="tl-m-sec">
            <h3>Where</h3>
            <div className="tl-tags">
              {e.where.map((w) => (
                <span key={w} className="tl-tag">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="tl-m-sec">
          <h3>When it happened</h3>
          <p className="tl-ds">
            {e.when}
            {e.ds && (
              <>
                {' · '}
                <span>{dateSource(e.ds)}</span>
              </>
            )}
          </p>
        </div>
        <div className="tl-m-sec">
          <h3>Where you learn this</h3>
          <ul className="tl-learn">
            {e.learn.map(([book, note]) => (
              <li key={book}>
                <i>{book}</i>
                {note && <span>{note}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="tl-m-sec">
          <h3>Explore</h3>
          <div className="tl-explore">
            {e.book ? <span>Book page →</span> : null}
            {e.ev ? <span>Event page →</span> : null}
            <span>See on the Star Map →</span>
            <a
              className="ext"
              href={`https://coppermind.net/wiki/${encodeURIComponent(e.cm.replace(/ /g, '_'))}`}
              target="_blank"
              rel="noreferrer"
            >
              Coppermind ↗<small>may spoil later books</small>
            </a>
          </div>
        </div>
      </div>
      <div className="tl-m-foot">
        <button
          type="button"
          disabled={prev === undefined}
          onClick={() => onGo(prev)}
        >
          {prev !== undefined && `← ${spineEvents[prev].t}`}
        </button>
        <span className="tl-ct">
          {k + 1} of {visible.length}
        </span>
        <button
          type="button"
          disabled={next === undefined}
          onClick={() => onGo(next)}
        >
          {next !== undefined && `${spineEvents[next].t} →`}
        </button>
      </div>
    </dialog>
  )
}
