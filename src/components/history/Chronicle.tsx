import { useEffect, useRef, useState } from 'react'
import { stepsOf, toneStyle, type HistoryProps } from './helpers'
import { MomentText, Stage } from './parts'
import s from './history.module.css'

/**
 * The history as a scrolled story: moments pass by era while a sticky stage
 * beside them flies the map to each place, or shows its art or the world.
 */
export function Chronicle(props: HistoryProps) {
  const steps = stepsOf(props.eras)
  const [active, setActive] = useState(0)
  const list = useRef<HTMLDivElement>(null)
  const ids = steps.map((step) => step.moment.id).join()

  // The step crossing the middle of the window is the one on stage.
  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLElement>('[data-step]')
    if (!items || typeof IntersectionObserver === 'undefined') return
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.step))
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )
    items.forEach((item) => watch.observe(item))
    return () => watch.disconnect()
  }, [ids])

  const current = steps[Math.min(active, steps.length - 1)]
  return (
    <div className={s.chronicle}>
      <div className={s.chronicleStage}>
        <Stage step={current} props={props} />
        <p className={s.stageCaption} aria-hidden>
          <span style={toneStyle(current.era.tone)}>{current.era.title}</span>
          {current.moment.title}
        </p>
      </div>
      <div ref={list} className={s.chronicleSteps}>
        {props.eras.map((era) => (
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
            <ol className={s.stepList}>
              {era.moments.map((moment) => {
                const i = steps.findIndex((step) => step.moment === moment)
                return (
                  <li
                    key={moment.id}
                    data-step={i}
                    className={s.step}
                    // Tab walks the story too, moving the stage along.
                    tabIndex={0}
                    aria-current={i === active ? 'step' : undefined}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                  >
                    <MomentText
                      step={{ era, moment }}
                      props={props}
                      showEra={false}
                    />
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
