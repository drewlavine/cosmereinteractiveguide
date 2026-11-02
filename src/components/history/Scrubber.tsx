import type { ReactNode } from 'react'
import { toneStyle, type HistoryProps, type ScrubEra } from './helpers'
import { MomentText, Stage } from './parts'
import { useFollow, useScrub, type Scrub } from './useScrub'
import s from './history.module.css'

/** ‹ Earlier, Play, Later › and "N of M", with room for a look's extras. */
export function ScrubControls({
  scrub: { i, last, running, steps, go, play },
  className = '',
  children,
}: {
  scrub: Pick<
    Scrub<ScrubEra>,
    'i' | 'last' | 'running' | 'steps' | 'go' | 'play'
  >
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={`${s.controls} ${className}`}>
      <button type="button" onClick={() => go(i - 1)} disabled={i === 0}>
        ‹ Earlier
      </button>
      <button type="button" data-play onClick={play}>
        {running ? '❚❚ Pause' : '▶ Play'}
      </button>
      <button type="button" onClick={() => go(i + 1)} disabled={last}>
        Later ›
      </button>
      {children}
      <span className={s.count}>
        {i + 1} of {steps.length}
      </span>
    </div>
  )
}

/** The current moment on one big card: its stage and its words. */
export function ScrubCard({
  scrub: { step },
  props,
  className = '',
}: {
  scrub: Scrub
  props: HistoryProps
  className?: string
}) {
  return (
    <div
      className={`${s.scrubCard} ${className}`}
      style={toneStyle(step.era.tone)}
      data-bare={!props.planet || undefined}
    >
      <Stage step={step} props={props} />
      <div aria-live="polite">
        <div key={step.moment.id} className={s.fadeIn}>
          <MomentText step={step} props={props} heading="h3" />
        </div>
      </div>
    </div>
  )
}

/**
 * The history as a dial: a ribbon of eras and a slider through every moment,
 * with Play to let it run, and one moment at a time on a big card.
 */
export function Scrubber(props: HistoryProps) {
  const scrub = useScrub(props.eras)
  const strip = useFollow(scrub.i)
  return (
    <div>
      <div ref={strip} className={s.strip}>
        <div className={s.track} style={scrub.track}>
          <div className={s.ribbon} role="group" aria-label="Jump to an era">
            {props.eras.map((era) => (
              <button
                key={era.id}
                className={s.ribbonEra}
                {...scrub.eraButton(era)}
              >
                {era.title}
              </button>
            ))}
          </div>
          <div className={s.ticks} {...scrub.slider}>
            {scrub.steps.map((x, n) => (
              <span key={x.moment.id} {...scrub.dot(n)} />
            ))}
          </div>
        </div>
      </div>
      <ScrubControls scrub={scrub} />
      <ScrubCard scrub={scrub} props={props} />
    </div>
  )
}
