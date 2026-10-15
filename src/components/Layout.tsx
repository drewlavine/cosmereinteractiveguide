import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Link, useLocation, useOutlet } from 'react-router'
import { pageKey } from '../navigation'
import { BooksReadProvider } from './BooksReadProvider'
import { BooksReadSettings } from './BooksReadSettings'
import { MainTabs } from './MainTabs'
import { Search } from './Search'

export function Layout() {
  const location = useLocation()
  // While a page's exit animation plays, AnimatePresence keeps rendering the
  // children it last had, so the old page stays put.
  const outlet = useOutlet()

  return (
    <MotionConfig reducedMotion="user">
      <BooksReadProvider>
        <div className="app">
          <header className="app-header">
            <Link to="/" className="app-title">
              Cosmere Interactive Guide
            </Link>
            <MainTabs />
            <Search />
            <BooksReadSettings />
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={pageKey(location.pathname)}
              className="app-main"
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              {outlet}
            </motion.main>
          </AnimatePresence>

          <footer className="app-footer">
            Content adapted from{' '}
            <a href="https://coppermind.net" target="_blank" rel="noreferrer">
              the Coppermind
            </a>{' '}
            under{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-NC-SA 4.0
            </a>
            . Unofficial fan project, not affiliated with Dragonsteel.
          </footer>
        </div>
      </BooksReadProvider>
    </MotionConfig>
  )
}
