// ponytail: temporary, to gather opinions on the way into the world card
// (see worldTitleStyle.ts); remove once a style is chosen.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import timeline from './CosmereTimeline.module.css'
import styles from './TitleStyleSwitcher.module.css'
import {
  PHONE,
  titleGroups,
  titleStyles,
  useMedia,
  useTitleStyle,
} from './worldTitleStyle'

/**
 * A small switcher over the globe's view to try each way into the world
 * card: bottom right, or on phones a round button at the foot of the
 * toolbar (under its Back, when that shows). Put away while `hidden`.
 */
export function TitleStyleSwitcher({ hidden }: { hidden?: boolean }) {
  const [style, pick] = useTitleStyle()
  const phone = useMedia(PHONE)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const toolbar = anchor?.parentElement?.querySelector(`.${timeline.toolbar}`)
  const now = titleStyles.find((t) => t.id === style)!
  const box = (
    <div
      className={styles.switcher}
      role="group"
      aria-label="Try a style for the world's title"
      data-open={open || undefined}
    >
      <button
        type="button"
        className={styles.head}
        aria-expanded={open}
        data-tooltip={
          open ? 'Hide the styles' : "Try other ways into the world's details"
        }
        onClick={() => setOpen(!open)}
      >
        <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5 13.9 10l6.6 2-6.6 2L12 20.5 10.1 14l-6.6-2 6.6-2Z" />
        </svg>
        <span className={styles.text}>Try a style</span>
        {!open && <span className={styles.now}>{now.label}</span>}
        <svg className={styles.caret} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 14 5-5 5 5" />
        </svg>
      </button>
      {open && (
        <div className={styles.groups}>
          {titleGroups.map((g) => (
            <div
              key={g.id}
              className={styles.group}
              role="group"
              aria-labelledby={`title-style-${g.id}`}
            >
              <p id={`title-style-${g.id}`} className={styles.label}>
                {g.label}
              </p>
              <ul className={styles.list}>
                {titleStyles.map((t, i) =>
                  t.group !== g.id ? null : (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={styles.option}
                        aria-pressed={t.id === style}
                        data-tooltip={t.tip}
                        onClick={() => {
                          pick(t.id)
                          if (phone) setOpen(false)
                        }}
                      >
                        <span className={styles.num}>{i + 1}</span>
                        {t.label}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
  return (
    <>
      <span ref={setAnchor} hidden />
      {hidden ? null : phone && toolbar ? createPortal(box, toolbar) : box}
    </>
  )
}
