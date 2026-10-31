import { useEffect, useState } from 'react'
import { stepsOf, toneStyle, type HistoryProps } from './helpers'
import { MomentText, Stage } from './parts'
import s from './history.module.css'

/** How long Play lingers on each moment. */
const DWELL = 5000

/**
 * The history as a dial: a ribbon of eras and a slider through every moment,
 * with Play to let it run, and one moment at a time on a big card.
 */
export function Scrubber(props: HistoryProps) {
  const steps = stepsOf(props.eras)
  const [at, setAt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const i = Math.min(at, steps.length - 1)
  const last = i === steps.length - 1
  const running = playing && !last
  const step = steps[i]

  useEffect(() => {
    if (!running) return
    const next = setTimeout(() => setAt((n) => n + 1), DWELL)
    return () => clearTimeout(next)
  }, [running, i])

  const go = (n: number) => {
    setAt(Math.max(0, Math.min(n, steps.length - 1)))
    setPlaying(false)
  }

  return (
    <div className={s.scrubber}>
      <div className={s.ribbon} role="group" aria-label="Jump to an era">
        {props.eras.map((era) => (
          <button
            key={era.id}
            type="button"
            className={s.ribbonEra}
            style={{ ...toneStyle(era.tone), flexGrow: era.moments.length }}
            aria-pressed={era === step.era}
            onClick={() => go(steps.findIndex((x) => x.era === era))}
          >
            {era.title}
          </button>
        ))}
      </div>

      <input
        type="range"
        className={s.range}
        min={0}
        max={steps.length - 1}
        value={i}
        aria-label="Moment in history"
        aria-valuetext={`${step.era.title}: ${step.moment.title}`}
        onChange={(e) => go(Number(e.target.value))}
      />
      <div className={s.ticks} aria-hidden>
        {steps.map((x, n) => (
          <span
            key={x.moment.id}
            style={toneStyle(x.era.tone)}
            data-past={n <= i || undefined}
          />
        ))}
      </div>

      <div className={s.controls}>
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0}>
          ‹ Earlier
        </button>
        <button
          type="button"
          onClick={() => {
            if (last) setAt(0)
            setPlaying(!running)
          }}
        >
          {running ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button type="button" onClick={() => go(i + 1)} disabled={last}>
          Later ›
        </button>
        <span className={s.count}>
          {i + 1} of {steps.length}
        </span>
      </div>

      <div className={s.scrubCard} style={toneStyle(step.era.tone)}>
        <Stage step={step} props={props} />
        <div aria-live="polite">
          <div key={step.moment.id} className={s.fadeIn}>
            <MomentText step={step} props={props} heading="h3" />
          </div>
        </div>
      </div>
    </div>
  )
}
