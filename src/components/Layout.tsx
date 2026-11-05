import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router'
import { pageKey } from '../navigation'
import { isPhone, loadPinned, savePinned } from '../state/sideNav'
import { BooksReadProvider } from './BooksReadProvider'
import { BooksReadSettings } from './BooksReadSettings'
import { isTyping } from '../state/keys'
import { Search } from './Search'
import { SearchIcon } from './SearchIcon'
import { SideNav } from './SideNav'
import { Tooltips } from './Tooltips'
import { ThemeSwitch } from './ThemeSwitch'

/** Secret pages, never linked: press the key twice to open. */
const secretKeys: Record<string, string> = {
  '?': '/chronology',
  '>': '/spanish-civil-war',
}

export function Layout() {
  const location = useLocation()
  // While a page's exit animation plays, AnimatePresence keeps rendering the
  // children it last had, so the old page stays put.
  const outlet = useOutlet()
  const [navOpen, setNavOpen] = useState(false)
  const [navPinned, setNavPinned] = useState(loadPinned)
  const menuRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const navigate = useNavigate()
  const titleTaps = useRef<number[]>([])

  const tapPause = useRef<ReturnType<typeof setTimeout>>(undefined)

  // The secret pages: a key pressed twice on a keyboard...
  useEffect(() => {
    let last = { key: '', at: 0 }
    const onKey = (event: KeyboardEvent) => {
      const to = secretKeys[event.key]
      if (
        !to ||
        isTyping(event.target) ||
        document.querySelector('dialog[open]')
      )
        return
      if (event.key === last.key && Date.now() - last.at < 800) {
        last = { key: '', at: 0 }
        void navigate(to)
      } else last = { key: event.key, at: Date.now() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // ...or quick taps on the site title, for phones: three and a pause for
  // the Spanish Civil War, five for the chronology.
  useEffect(() => () => clearTimeout(tapPause.current), [])
  const tapTitle = (event: React.MouseEvent) => {
    const now = Date.now()
    titleTaps.current = [
      ...titleTaps.current.filter((t) => now - t < 2500),
      now,
    ]
    clearTimeout(tapPause.current)
    if (titleTaps.current.length >= 5) {
      titleTaps.current = []
      event.preventDefault()
      void navigate('/chronology')
    } else if (titleTaps.current.length === 3)
      tapPause.current = setTimeout(() => {
        titleTaps.current = []
        void navigate('/spanish-civil-war')
      }, 600)
  }

  // Closing the phone drawer hands focus back to the button that opened it.
  useEffect(() => {
    if (wasOpen.current && !navOpen) menuRef.current?.focus()
    wasOpen.current = navOpen
  }, [navOpen])

  // The drawer only exists on phones; growing past that closes it.
  useEffect(() => {
    const phone = window.matchMedia?.('(max-width: 760px)')
    const close = () => setNavOpen(false)
    phone?.addEventListener('change', close)
    return () => phone?.removeEventListener('change', close)
  }, [])

  const toggleNav = () => {
    if (isPhone()) setNavOpen((open) => !open)
    else {
      savePinned(!navPinned)
      setNavPinned(!navPinned)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <BooksReadProvider>
        <div className="app">
          <header className="app-header" inert={navOpen}>
            <button
              ref={menuRef}
              type="button"
              className="side-nav-toggle"
              aria-label="Menu"
              aria-expanded={isPhone() ? navOpen : navPinned}
              aria-controls="side-nav"
              onClick={toggleNav}
            >
              <SearchIcon name="menu" />
            </button>
            <Link to="/" className="app-title" onClick={tapTitle}>
              Cosmere Interactive Guide
            </Link>
            <Search />
            <BooksReadSettings />
            <ThemeSwitch />
          </header>

          <SideNav
            open={navOpen}
            pinned={navPinned}
            onClose={() => setNavOpen(false)}
          />

          <AnimatePresence mode="wait">
            <motion.main
              key={pageKey(location.pathname)}
              className="app-main"
              inert={navOpen}
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(6px)' }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                // A leftover filter would trap full-screen overlays inside.
                transitionEnd: { filter: 'none' },
              }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              {outlet}
            </motion.main>
          </AnimatePresence>

          <footer className="app-footer" inert={navOpen}>
            Content based on{' '}
            <a href="https://coppermind.net" target="_blank" rel="noreferrer">
              the Coppermind
            </a>
            , whose text is licensed{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-NC-ND 4.0
            </a>
            . Journey data adapted from{' '}
            <a
              href="https://github.com/17thshard/roshar-map"
              target="_blank"
              rel="noreferrer"
            >
              the 17th Shard
            </a>{' '}
            (MIT); chapter routes from{' '}
            <a
              href="https://github.com/altonchaney/cosmere-maps"
              target="_blank"
              rel="noreferrer"
            >
              Alton Chaney&rsquo;s Cosmere Maps
            </a>{' '}
            (MIT). Private, unofficial fan project, not affiliated with
            Dragonsteel.
          </footer>
        </div>
        <Tooltips />
      </BooksReadProvider>
    </MotionConfig>
  )
}
