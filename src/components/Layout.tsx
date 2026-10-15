import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useLocation, useOutlet } from 'react-router'
import { BooksReadProvider } from './BooksReadProvider'
import { BooksReadSettings } from './BooksReadSettings'
import { MainTabs } from './MainTabs'
import { Search } from './Search'

// Keeps the previous route rendered while its exit animation plays.
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

export function Layout() {
  const location = useLocation()

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
              key={location.pathname}
              className="app-main"
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              <FrozenOutlet />
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
