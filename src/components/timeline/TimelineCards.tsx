import { useState } from 'react'
import {
  artSrc,
  cardsEras,
  cardsItems,
  cardsScale,
  worldColour,
  worldNames,
  type CardsItem,
  type World,
} from '../../data/timelineMock'
import { WorldChips, type WorldFilter } from './WorldChips'

type CardsEvent = Exclude<CardsItem, { gap: string }>

/** Where a point on the shared order sits on the folded glance strip, in %. */
const position = (y: number) => {
  for (const [from, to, start, end] of cardsScale)
    if (y <= to)
      return start + ((Math.max(y, from) - from) / (to - from)) * (end - start)
  return 100
}

const axis: [string, number][] = [
  ['Ancient', 0],
  ['Elantris', 23],
  ['Final Empire', 41],
  ['Present day', 63],
  ['Future', 94],
]

const jumps: [string, string][] = [
  ['Ancient', 'ancient'],
  ['Elantris', 'sel'],
  ['Final Empire', 'fe'],
  ['Present day', 'now'],
]

const initials = (title: string) =>
  title
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 3)

/** Era sections and gaps, in order, with the events in each. */
const sections = (() => {
  const out: { era: string; events: CardsEvent[]; gapAfter?: string }[] = []
  for (const item of cardsItems) {
    if ('gap' in item) {
      out[out.length - 1].gapAfter = item.gap
      continue
    }
    if (out.at(-1)?.era !== item.era) out.push({ era: item.era, events: [] })
    out[out.length - 1].events.push(item)
  }
  return out
})()

const events = cardsItems.filter((i): i is CardsEvent => !('gap' in i))

/** Mockup 1: cards grouped by era, with an "at a glance" strip on top. */
export function TimelineCards() {
  const [filter, setFilter] = useState<WorldFilter>('all')

  return (
    <div className="tl-cards">
      <div className="tl-controls">
        <WorldChips filter={filter} onChange={setFilter} />
        <nav className="tl-jump" aria-label="Jump to an era">
          Jump to
          {jumps.map(([label, era]) => (
            <a key={era} href={`#tl-${era}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>

      <section className="tl-overview" aria-label="At a glance">
        <div className="tl-overview-head">
          <span className="tl-label">At a glance</span>
          <span>Not to scale: long quiet stretches are folded</span>
        </div>
        <div className="tl-strip">
          <div className="tl-lanes">
            {(Object.keys(worldNames) as World[]).map((w) => (
              <div key={w} className="tl-lane">
                <b>{worldNames[w]}</b>
                <div className="tl-track">
                  {events
                    .filter((e) => e.w === w)
                    .map((e) =>
                      e.book ? (
                        <span
                          key={e.t}
                          className="tl-bookbar"
                          title={e.t}
                          style={{ left: `${position(e.y) - 0.6}%` }}
                        />
                      ) : (
                        <span
                          key={e.t}
                          className={`tl-dot${e.est ? ' est' : ''}`}
                          title={e.t}
                          style={{
                            ...worldColour(w),
                            left: `${position(e.y)}%`,
                          }}
                        />
                      ),
                    )}
                </div>
              </div>
            ))}
            <div className="tl-axis">
              <span />
              <div className="tl-segs">
                {axis.map(([label, left], i) => (
                  <span
                    key={label}
                    className={`tl-seg${i ? ' brk' : ''}`}
                    style={{ left: `${left}%` }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="tl-legend">
          <span>
            <i className="k1" />
            Event
          </span>
          <span>
            <i className="k2" />
            Date estimated
          </span>
          <span>
            <i className="k3" />A book you've read happens here
          </span>
        </div>
      </section>

      {sections.map(({ era, events, gapAfter }) => {
        const shown = events.filter((e) => filter === 'all' || e.w === filter)
        return (
          <div key={era}>
            {shown.length > 0 && (
              <section className="tl-era" id={`tl-${era}`}>
                <h2>
                  {cardsEras[era][0]} <small>{cardsEras[era][1]}</small>
                </h2>
                {shown.map((e) => (
                  <CardsRow key={e.t} event={e} />
                ))}
              </section>
            )}
            {gapAfter && filter === 'all' && (
              <div className="tl-gap">{gapAfter}</div>
            )}
          </div>
        )
      })}
      <p className="tl-foot">
        Mockup 1 · dates cross-checked between a fan spreadsheet and the
        Coppermind's chronology · every entry dated by the book that tells you
        about it
      </p>
    </div>
  )
}

function CardsRow({ event: e }: { event: CardsEvent }) {
  const when = (
    <div className="tl-when">
      <b>{e.when}</b>
      {e.cal && <span>{e.cal}</span>}
      {e.est ? (
        <>
          <br />
          <em>Estimated</em>
        </>
      ) : null}
    </div>
  )
  if (e.book)
    return (
      <>
        {when}
        <div className="tl-ev book" style={worldColour(e.w)}>
          <div className="tl-card">
            <div className="tl-cover">{initials(e.t)}</div>
            <div>
              <div className="tl-w">{worldNames[e.w]} · book</div>
              <h3>{e.t}</h3>
              <p>{e.p}</p>
            </div>
            <span className="tl-tick">✓ Read</span>
          </div>
        </div>
      </>
    )
  return (
    <>
      {when}
      <div className={`tl-ev${e.est ? ' est' : ''}`} style={worldColour(e.w)}>
        <div className="tl-card">
          <div className="tl-w">{worldNames[e.w]}</div>
          <h3>{e.t}</h3>
          <p>{e.p}</p>
          <div className="tl-meta">
            {e.faces && (
              <span className="tl-faces">
                {e.faces.map((f) => (
                  <img key={f} src={artSrc(f)} alt="" />
                ))}
              </span>
            )}
            {e.src && (
              <span className="tl-src">
                From <i>{e.src}</i>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
