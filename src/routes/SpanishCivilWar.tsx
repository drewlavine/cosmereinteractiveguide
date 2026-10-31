import { useEffect, useState } from 'react'
import { PortraitArt } from '../components/ArtViewer'
import { toneStyle } from '../components/history/helpers'
import { ScrubControls } from '../components/history/Scrubber'
import { MetroStrip } from '../components/history/ScrubLooks'
import { useScrub } from '../components/history/useScrub'
import h from '../components/history/history.module.css'
import { assetUrl } from '../data/assetUrl'
import s from './SpanishCivilWar.module.css'

type Data = typeof import('../data/spanishCivilWar')

const W = 900
const H = 725
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))
const commons = 'https://commons.wikimedia.org/wiki/File:'
const wikipedia = (title: string) =>
  `https://en.wikipedia.org/wiki/${encodeURI(title.replaceAll(' ', '_'))}`

/**
 * Wikipedia's Spanish Civil War as a Metro-line timeline, on a map of the
 * front lines that zooms to each place. A secret Drew asked for (`>>`, or
 * three taps on the site title); not Cosmere, so not gated or linked.
 */
export function SpanishCivilWar() {
  const [data, setData] = useState<Data>()
  useEffect(() => {
    void import('../data/spanishCivilWar').then(setData)
  }, [])
  return (
    <article className="character-list">
      <h1>The Spanish Civil War</h1>
      <p className="character-count">
        From the Second Republic to Franco’s death, 1931–1975.
      </p>
      {data && <Timeline data={data} />}
      <p className={s.credits}>
        Text summarised in our own words from Wikipedia’s{' '}
        <a
          href={wikipedia('Spanish Civil War')}
          target="_blank"
          rel="noreferrer"
        >
          Spanish Civil War
        </a>{' '}
        and the articles it links (CC BY-SA 4.0). Maps by NordNordWest, Sting
        and Grandiose (CC BY-SA 3.0); the pre- and post-war ones recoloured.
        Photos from Wikimedia Commons, credited under each.
      </p>
    </article>
  )
}

function Timeline({
  data: { scwEras, scwMaps, scwMapFor, scwCredits, scwKinds },
}: {
  data: Data
}) {
  const scrub = useScrub(scwEras)
  const { era, moment } = scrub.step
  const map = scwMapFor(moment.iso)
  const n = scwMaps.indexOf(map)
  const { x, y } = moment.place ?? {}
  const pin = x !== undefined && y !== undefined ? { x, y } : undefined
  // Zoom in twice on the place, kept off the map's edges.
  const k = pin ? 2 : 1
  const tx = pin ? clamp(W / 2 - k * pin.x, W - W * k, 0) : 0
  const ty = pin ? clamp(H / 2 - k * pin.y, H - H * k, 0) : 0
  // The pin stays its size, drawn where the place lands; the legend names it.
  const at = pin && { x: tx + k * pin.x, y: ty + k * pin.y }
  const unit = H / 100
  const credit = scwCredits[moment.id]
  return (
    <>
      <MetroStrip eras={scwEras} scrub={scrub} />
      <ScrubControls scrub={scrub} />
      <div className={`${h.scrubCard} ${s.card}`} style={toneStyle(era.tone)}>
        <figure className={s.map}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Map of Spain: ${map.label}${pin ? `, marking ${moment.place!.name}` : ''}`}
          >
            <g
              className={h.zoom}
              style={{ transform: `translate(${tx}px, ${ty}px) scale(${k})` }}
            >
              {scwMaps.map((m) => (
                <image
                  key={m.file}
                  className={s.layer}
                  href={assetUrl(`/spanish-civil-war/${m.file}.webp`)}
                  width={W}
                  height={H}
                  style={{ opacity: m === map ? 1 : 0 }}
                />
              ))}
            </g>
            {at && (
              <g key={moment.id} className={h.marks}>
                <circle
                  className={h.pulse}
                  cx={at.x}
                  cy={at.y}
                  r={unit * 3.2}
                />
                <circle className={h.pin} cx={at.x} cy={at.y} r={unit * 1.9} />
              </g>
            )}
          </svg>
          <figcaption className={s.legend}>
            {moment.place && (
              <span data-side="place">
                {moment.place.name}
                {!pin && ' (off the map)'}
              </span>
            )}
            {n > 0 && <span data-side="nationalist">Nationalist</span>}
            {n > 0 && n < scwMaps.length - 1 && (
              <span data-side="republican">Republican</span>
            )}
            <a
              href={`${commons}Map_of_the_Spanish_Civil_War_in_${map.from.replace(' ', '_')}.png`}
              target="_blank"
              rel="noreferrer"
            >
              {map.label}
            </a>
          </figcaption>
        </figure>
        <div aria-live="polite">
          <div key={moment.id} className={h.fadeIn}>
            <PortraitArt
              className={s.photo}
              src={`/spanish-civil-war/${moment.id}.webp`}
              alt={moment.photo.alt}
              caption={moment.photo.caption}
              by="Image:"
              artist={`${credit.by}, ${credit.licence}`}
              artistUrl={credit.page}
            />
            <p className={h.kicker}>
              <span className={h.kind} data-kind={moment.kind}>
                {scwKinds[moment.kind]}
              </span>
              <span>
                {era.title} · {moment.date}
              </span>
            </p>
            <h2 className={h.title}>{moment.title}</h2>
            <p className={h.text}>{moment.text}</p>
            {moment.facts && (
              <dl className={s.facts}>
                {moment.facts.map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a href={wikipedia(moment.wiki)} target="_blank" rel="noreferrer">
              Read more on Wikipedia ↗
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
