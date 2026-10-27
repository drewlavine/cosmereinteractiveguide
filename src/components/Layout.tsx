import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useOutlet } from 'react-router'
import { pageKey } from '../navigation'
import { isPhone, loadPinned, savePinned } from '../state/sideNav'
import { BooksReadProvider } from './BooksReadProvider'
import { BooksReadSettings } from './BooksReadSettings'
import { Search } from './Search'
import { SearchIcon } from './SearchIcon'
import { SideNav } from './SideNav'
import { Tooltips } from './Tooltips'

export function Layout() {
  const location = useLocation()
  // While a page's exit animation plays, AnimatePresence keeps rendering the
  // children it last had, so the old page stays put.
  const outlet = useOutlet()
  const [navOpen, setNavOpen] = useState(false)
  const [navPinned, setNavPinned] = useState(loadPinned)
  const menuRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

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
            <Link to="/" className="app-title">
              Cosmere Interactive Guide
            </Link>
            <Search />
            <BooksReadSettings />
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
