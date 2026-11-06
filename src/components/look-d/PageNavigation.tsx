import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { TopicIcon } from './TopicIcon'
import type { NavPart, NavSection, PageNavigation } from './usePageNavigation'
import styles from './PageNavigation.module.css'

interface NavigationProps {
  nav: PageNavigation
}

function Progress({ nav }: { nav: PageNavigation }) {
  return (
    <div className={styles.progress} aria-hidden>
      <span style={{ width: `${nav.progress * 100}%` }} />
    </div>
  )
}

/** The current name is made from the same visible entries as the list. */
function currentLabel(nav: PageNavigation) {
  const section = nav.sections.find((s) => s.id === nav.current.section)
  const part = section?.parts.find((p) =>
    p.era === undefined ? p.id === nav.current.part : p.era === nav.current.era,
  )
  return part ? `${section?.title} › ${part.title}` : (section?.title ?? 'Top')
}

function SectionList({
  nav,
  onJump,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
}) {
  const [opened, setOpened] = useState<Record<string, boolean>>({})
  const uid = useId()
  return (
    <ol className={styles.sections}>
      {nav.sections.map((section) => {
        const active = nav.current.section === section.id
        const expanded = opened[section.id] ?? active
        const listId = `${uid}-${section.id}`
        const countLabel =
          section.id === 'culture'
            ? 'topics'
            : section.parts.some((p) => p.era !== undefined)
              ? 'eras'
              : 'parts'
        return (
          <li key={section.id}>
            <div
              className={styles.sectionRow}
              data-active={active || undefined}
            >
              <a
                href={`#${section.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  setOpened((old) => ({ ...old, [section.id]: true }))
                  onJump(section)
                }}
              >
                <span className={styles.sectionIcon} aria-hidden>
                  {section.id === 'top' ? '↑' : '✦'}
                </span>
                {section.title}
              </a>
              {section.parts.length > 0 && (
                <button
                  type="button"
                  className={styles.disclose}
                  aria-label={`${expanded ? 'Hide' : 'Show'} ${section.title} ${countLabel}`}
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() =>
                    setOpened((old) => ({
                      ...old,
                      [section.id]: !expanded,
                    }))
                  }
                >
                  <span>
                    {section.parts.length} {countLabel}
                  </span>
                  <span aria-hidden>{expanded ? '▾' : '▸'}</span>
                </button>
              )}
            </div>
            {section.parts.length > 0 && (
              <ol id={listId} className={styles.parts} hidden={!expanded}>
                {section.parts.map((part) => {
                  const partActive =
                    active &&
                    (part.era === undefined
                      ? part.id === nav.current.part
                      : part.era === nav.current.era)
                  const contents = (
                    <>
                      <TopicIcon
                        topic={part.topic}
                        className={styles.partIcon}
                      />
                      <span>{part.title}</span>
                      {part.count !== undefined && (
                        <span className={styles.partCount}>{part.count}</span>
                      )}
                    </>
                  )
                  return (
                    <li key={part.id ?? `era-${part.era}`}>
                      <a
                        href={part.href ?? `#${part.id}`}
                        aria-current={partActive ? 'location' : undefined}
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return
                          event.preventDefault()
                          onJump(section, part)
                        }}
                      >
                        {contents}
                      </a>
                    </li>
                  )
                })}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Contents({
  nav,
  onJump,
}: {
  nav: PageNavigation
  onJump: (section: NavSection, part?: NavPart) => void
}) {
  return (
    <nav aria-label="On this page">
      <div className={styles.cardHeading}>
        <span>On this page</span>
        <span>{currentLabel(nav)}</span>
      </div>
      <Progress nav={nav} />
      <SectionList nav={nav} onJump={onJump} />
    </nav>
  )
}

/** Desktop: Contents at the top of the existing plate. */
export function NavigationPanel({ nav }: NavigationProps) {
  return (
    <div className={styles.panel} data-place-nav>
      <Contents nav={nav} onJump={nav.jump} />
    </div>
  )
}

/** The sticky context bar and a native, focus-trapping bottom sheet. */
export function MobileNavigation({ nav }: NavigationProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const titleId = useId()

  const show = (trigger: HTMLButtonElement) => {
    const sheet = dialog.current
    if (!sheet || sheet.hasAttribute('open')) return
    returnTo.current = trigger
    if (sheet.showModal) sheet.showModal()
    else sheet.setAttribute('open', '')
    setOpen(true)
    closeButton.current?.focus()
  }
  const restore = () => {
    setOpen(false)
    returnTo.current?.focus({ preventScroll: true })
  }
  const close = () => {
    const sheet = dialog.current
    if (!sheet?.hasAttribute('open')) return
    if (sheet.close) sheet.close()
    else {
      sheet.removeAttribute('open')
      restore()
    }
  }
  const jump = (section: NavSection, part?: NavPart) => {
    close()
    nav.jump(section, part)
  }
  const trapKeys = (event: KeyboardEvent<HTMLDialogElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter(
      (el) =>
        !el.closest('[hidden]') &&
        (!el.closest('details:not([open])') || el.matches('summary')),
    )
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <div className={styles.mobile} data-place-nav>
      <button
        type="button"
        className={styles.context}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => show(event.currentTarget)}
      >
        <span>Contents</span>
        <strong>{currentLabel(nav)}</strong>
        <span aria-hidden>▾</span>
      </button>
      <Progress nav={nav} />
      <dialog
        ref={dialog}
        className={styles.sheet}
        aria-labelledby={titleId}
        aria-modal="true"
        onClose={restore}
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onKeyDown={trapKeys}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className={styles.sheetHead}>
          <h2 id={titleId}>On this page</h2>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close navigation"
            onClick={close}
          >
            ×
          </button>
        </div>
        <Contents nav={nav} onJump={jump} />
      </dialog>
    </div>
  )
}
