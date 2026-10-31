// ponytail: temporary, to gather opinions on how the group cards are drawn
// (see listLook.ts); remove once Drew picks.
import { useState } from 'react'
import { cardStyles, useCardStyle } from './listLook'
import styles from './TryLayout.module.css'

/** A floating control to try each card style on the card page. */
export function TryLayout() {
  const [style, pickStyle] = useCardStyle()
  const [open, setOpen] = useState(false)
  const now = cardStyles.find((c) => c.id === style)?.label
  return (
    <div className={styles.dock}>
      <div
        className={styles.switcher}
        role="group"
        aria-label="Try a style"
        data-open={open || undefined}
      >
        <button
          type="button"
          className={styles.head}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
          </svg>
          <span className={styles.text}>Try a style</span>
          {!open && <span className={styles.now}>{now}</span>}
          <svg className={styles.caret} viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 14 5-5 5 5" />
          </svg>
        </button>
        {open && (
          <div className={styles.groups}>
            <Options
              label="Cards"
              options={cardStyles}
              value={style}
              pick={pickStyle}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Options<T extends string>({
  label,
  options,
  value,
  pick,
}: {
  label: string
  options: readonly { id: T; label: string; tip: string }[]
  value: T
  pick: (id: T) => void
}) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <p className={styles.label} aria-hidden="true">
        {label}
      </p>
      <ul className={styles.list}>
        {options.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              className={styles.option}
              aria-pressed={o.id === value}
              title={o.tip}
              onClick={() => pick(o.id)}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
