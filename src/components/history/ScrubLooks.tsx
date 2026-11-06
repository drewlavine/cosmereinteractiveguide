// ponytail: temporary, four looks for the Time scrubber to compare in the
// "Try a style" switcher (historyLook.ts). Each shares useScrub and differs
// only in its strip; delete the ones Drew doesn't pick, with their blocks in
// scrubLooks.module.css. Keep MetroStrip and its mo* styles either way: the
// hidden Spanish Civil War page uses them.
import {
  useEffect,
  useImperativeHandle,
  type CSSProperties,
  type Ref,
} from 'react'
import type { MomentKind } from '../../data/planetHistory'
import {
  kindLabels,
  toneStyle,
  type HistoryProps,
  type ScrubEra,
  type Step,
} from './helpers'
import { ScrubCard, ScrubControls } from './Scrubber'
import { useFollow, useScrub, type Scrub } from './useScrub'
import s from './history.module.css'
import x from './scrubLooks.module.css'

/** Where a moment falls in its era, for drawing breaks between eras. */
const edges = ({ era, moment }: Step<ScrubEra>) => ({
  'data-first': moment === era.moments[0] || undefined,
  'data-end': moment === era.moments.at(-1) || undefined,
})

/**
 * Chapters: a media player's seek bar cut into one segment per era, filled
 * up to a playhead that glides along it, and the era and moment playing
 * named beside the transport buttons.
 */
export function Chapters(props: HistoryProps) {
  const scrub = useScrub(props.eras)
  const strip = useFollow(scrub.i)
  const { step } = scrub
  return (
    <div>
      <div ref={strip} className={`${s.strip} ${x.chStrip}`}>
        <div className={x.chTrack} style={scrub.track}>
          <div className={x.chLabels} role="group" aria-label="Jump to an era">
            {props.eras.map((era) => (
              <button
                key={era.id}
                className={x.chLabel}
                {...scrub.eraButton(era)}
              >
                <span>{era.title}</span>
              </button>
            ))}
          </div>
          <div className={x.chBar} {...scrub.slider}>
            {scrub.steps.map((st, n) => (
              <span key={st.moment.id} {...scrub.dot(n)} {...edges(st)} />
            ))}
            <span className={x.chHead} aria-hidden />
          </div>
        </div>
      </div>
      <ScrubControls scrub={scrub} className={x.chControls}>
        <p className={x.chNow} style={toneStyle(step.era.tone)}>
          <span>{step.era.title}</span> {step.moment.title}
        </p>
      </ScrubControls>
      <ScrubCard scrub={scrub} props={props} />
    </div>
  )
}

/**
 * Metro line: the history as a line diagram, every moment a stop evenly
 * spaced along it and named, each era a stretch of line in its colour, the
 * line travelled so far solid and the stop you're at marked.
 */
export interface MetroHandle {
  /** Select the first visible moment in an era. */
  selectEra: (index: number) => void
}

export function Metro(
  props: HistoryProps & {
    navigationRef?: Ref<MetroHandle>
    onEraChange?: (index: number) => void
  },
) {
  const { eras, navigationRef, onEraChange } = props
  const scrub = useScrub(eras)
  const eraIndex = eras.indexOf(scrub.step.era)
  useImperativeHandle(navigationRef, () => ({
    selectEra: (index) => {
      const era = eras[index]
      if (era) scrub.go(scrub.steps.findIndex((step) => step.era === era))
    },
  }))
  useEffect(() => {
    onEraChange?.(eraIndex)
  }, [eraIndex, onEraChange])
  return (
    <div>
      <MetroStrip eras={props.eras} scrub={scrub} />
      <ScrubControls scrub={scrub} className={x.moControls} />
      <ScrubCard scrub={scrub} props={props} />
    </div>
  )
}

/** The Metro look's strip on its own, for any eras. */
export function MetroStrip<E extends ScrubEra>({
  eras,
  scrub,
}: {
  eras: E[]
  scrub: Scrub<E>
}) {
  const strip = useFollow(scrub.i)
  return (
    <div ref={strip} className={`${s.strip} ${x.moStrip}`}>
      <div className={x.moTrack} style={scrub.track}>
        <div className={x.moLines} role="group" aria-label="Jump to an era">
          {eras.map((era) => (
            <button
              key={era.title}
              className={x.moLine}
              {...scrub.eraButton(era)}
            >
              <span>{era.title}</span>
            </button>
          ))}
        </div>
        <div className={x.moStops} {...scrub.slider}>
          {scrub.steps.map((st, n) => (
            <span key={st.moment.id} {...scrub.dot(n)} {...edges(st)}>
              <span className={x.moName}>{st.moment.title}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The star chart's lanes, highest first. */
const lanes: MomentKind[] = ['legend', 'magic', 'realm', 'war']

/**
 * Star chart: each era a constellation across a night sky, its moments
 * stars set high or low by kind and joined by a line, lit up to the one
 * you're on. Even spacing still runs left to right; height is the kind.
 */
export function StarChart(props: HistoryProps) {
  const scrub = useScrub(props.eras)
  const strip = useFollow(scrub.i)
  const { steps, i } = scrub
  // The first column holds the lane names; moment n sits in column n + 2.
  const starts = props.eras.map(
    (era) => steps.findIndex((st) => st.era === era) + 2,
  )
  const points = steps.map(
    (st, n) => `${n + 0.5},${lanes.indexOf(st.moment.kind) + 0.5}`,
  )
  return (
    <div>
      <div ref={strip} className={`${s.strip} ${x.skStrip}`}>
        <div className={x.skTrack} style={scrub.track}>
          <div className={x.skNames} role="group" aria-label="Jump to an era">
            <span aria-hidden />
            {props.eras.map((era) => (
              <button
                key={era.id}
                className={x.skName}
                {...scrub.eraButton(era)}
              >
                <span>{era.title}</span>
              </button>
            ))}
          </div>
          <div className={x.skSky} {...scrub.slider}>
            <span className={x.skLanes} aria-hidden>
              {lanes.map((kind) => (
                <span key={kind} data-kind={kind}>
                  {kindLabels[kind]}
                </span>
              ))}
            </span>
            {props.eras.map((era, k) => (
              <span
                key={era.id}
                className={x.skBand}
                style={{
                  ...toneStyle(era.tone),
                  gridColumn: `${starts[k]} / span ${era.moments.length}`,
                }}
              />
            ))}
            <svg
              className={x.skLines}
              viewBox={`0 0 ${steps.length} ${lanes.length}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <polyline points={points.slice(i).join(' ')} />
              <polyline data-past points={points.slice(0, i + 1).join(' ')} />
            </svg>
            {steps.map((st, n) => {
              const dot = scrub.dot(n)
              return (
                <span
                  key={st.moment.id}
                  {...dot}
                  data-kind={st.moment.kind}
                  style={
                    {
                      ...dot.style,
                      gridColumn: n + 2,
                      '--lane': lanes.indexOf(st.moment.kind),
                    } as CSSProperties
                  }
                />
              )
            })}
          </div>
        </div>
      </div>
      <ScrubControls scrub={scrub} className={x.skControls} />
      <ScrubCard scrub={scrub} props={props} />
    </div>
  )
}

/**
 * Tuning dial: an old radio's backlit glass, the eras printed along it over
 * an engraved scale, one numbered mark per moment, and a needle that glides
 * to the moment while the dial keeps it in the middle.
 */
export function Dial(props: HistoryProps) {
  const scrub = useScrub(props.eras)
  const strip = useFollow(scrub.i, { centre: true })
  return (
    <div>
      <div className={x.dlBezel}>
        <div ref={strip} className={`${s.strip} ${x.dlStrip}`}>
          <div className={x.dlTrack} style={scrub.track}>
            <div className={x.dlBands} role="group" aria-label="Jump to an era">
              {props.eras.map((era) => (
                <button
                  key={era.id}
                  className={x.dlBand}
                  {...scrub.eraButton(era)}
                >
                  <span>{era.title}</span>
                </button>
              ))}
            </div>
            <div className={x.dlScale} {...scrub.slider}>
              {scrub.steps.map((st, n) => (
                <span key={st.moment.id} {...scrub.dot(n)} {...edges(st)}>
                  {n + 1}
                </span>
              ))}
            </div>
            <span className={x.dlNeedle} aria-hidden />
          </div>
        </div>
      </div>
      <ScrubControls scrub={scrub} className={x.dlControls} />
      <ScrubCard scrub={scrub} props={props} />
    </div>
  )
}
