// Two place page designs side by side while we gather opinions; the
// switch remembers the reader's pick.
import { useState } from 'react'
import { PlacePage as A, type PlacePageProps } from './look-a/PlacePage'
import { PlacePage as D } from './look-d/PlacePage'

export { PlaceBreadcrumb } from './look-a/PlacePage'
export type { Crumb, PlacePageProps } from './look-a/PlacePage'

const looks = {
  a: ['Design A', A],
  d: ['Design D', D],
} as const
type Look = keyof typeof looks

export function PlacePage(props: PlacePageProps) {
  const [look, setLook] = useState<Look>(() => {
    const saved = localStorage.getItem('placeLook')
    return saved && saved in looks ? (saved as Look) : 'a'
  })
  const Page = looks[look][1]
  return (
    <>
      <Page key={look} {...props} />
      <div
        role="group"
        aria-label="Page design"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 56,
          zIndex: 1000,
          display: 'flex',
          gap: 4,
          padding: 6,
          borderRadius: 999,
          background: 'var(--surface, #0b1620ee)',
          border: '1px solid var(--line, #c9a24a)',
          boxShadow: '0 4px 16px var(--shadow, #0008)',
        }}
      >
        {(Object.keys(looks) as Look[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={look === k}
            onClick={() => {
              localStorage.setItem('placeLook', k)
              setLook(k)
            }}
            style={{
              border: 0,
              borderRadius: 999,
              minWidth: 44,
              minHeight: 44,
              padding: '6px 12px',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 13,
              background:
                look === k ? 'var(--accent-ink, #c9a24a)' : 'transparent',
              color:
                look === k
                  ? 'var(--on-accent, #0b1620)'
                  : 'var(--foreground, #e8dcc0)',
            }}
          >
            {looks[k][0]}
          </button>
        ))}
      </div>
    </>
  )
}
