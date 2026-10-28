import { useMemo, type CSSProperties, type Ref } from 'react'
import styles from './ShatteringBurst.module.css'

/** Sixteen Shards, as Secret History tells it. */
export const SHARDS = 16
const CRACKS = 9

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** A jagged line out from the centre, in a 200-unit box. */
function crack(r: () => number, angle: number) {
  const pts: string[] = ['0,0']
  let a = angle
  for (let d = 0; d < 100;) {
    d += 8 + r() * 16
    a += (r() - 0.5) * 0.6
    pts.push(`${(Math.cos(a) * d).toFixed(1)},${(Math.sin(a) * d).toFixed(1)}`)
  }
  return pts.join(' ')
}

export interface ShatteringBurstProps {
  /**
   * `world`: from the event's world, once the reader knows where it
   * happened. `space`: from the middle of the view, pointing nowhere.
   */
  at: 'world' | 'space'
  /** A still glow that fades in, for prefers-reduced-motion. */
  reduced: boolean
  /** The explorer moves it to the burst's origin and starts it. */
  ref?: Ref<HTMLDivElement>
}

/**
 * The Shattering of Adonalsium on the map: a burst of light, sixteen
 * Shards streaking out, and the view cracking around it. After the 17th
 * Shard Roshar map's Shattering effect (its idea, not its code or art).
 * It waits, `data-phase="wait"`, until the explorer sets `data-phase` to
 * `play` as the camera arrives.
 */
export function ShatteringBurst({ at, reduced, ref }: ShatteringBurstProps) {
  const { streaks, cracks } = useMemo(() => {
    const r = rng(16)
    return {
      streaks: Array.from({ length: SHARDS }, (_, i) => ({
        angle: (i * 360) / SHARDS + (r() - 0.5) * 14,
        len: 38 + r() * 30,
        delay: r() * 0.35,
        hue: 36 + r() * 30,
      })),
      cracks: Array.from({ length: CRACKS }, (_, i) =>
        crack(r, ((i + r() * 0.6) * 2 * Math.PI) / CRACKS),
      ),
    }
  }, [])
  return (
    <div
      ref={ref}
      className={styles.burst}
      data-at={at}
      data-reduced={reduced || undefined}
      data-phase={reduced ? 'play' : 'wait'}
      aria-hidden="true"
    >
      {/* On a world, the world's globe cracks instead. */}
      {at === 'space' && (
        <svg className={styles.cracks} viewBox="-100 -100 200 200">
          {cracks.map((points, i) => (
            <g
              key={i}
              style={{ '--d': `${0.25 + i * 0.05}s` } as CSSProperties}
            >
              <polyline
                points={points}
                pathLength={1}
                className={styles.dark}
              />
              <polyline points={points} pathLength={1} className={styles.lit} />
            </g>
          ))}
        </svg>
      )}
      <span className={styles.flash} />
      <span className={styles.ring} />
      {streaks.map((s, i) => (
        <span
          key={i}
          className={styles.streak}
          data-streak=""
          style={
            {
              '--a': `${s.angle.toFixed(1)}deg`,
              '--len': `${s.len.toFixed(1)}vmax`,
              '--d': `${(0.15 + s.delay).toFixed(2)}s`,
              '--c': `hsl(${s.hue.toFixed(0)} 90% 78%)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
