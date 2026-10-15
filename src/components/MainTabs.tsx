import { Link, useLocation } from 'react-router'
import { mainTabs } from '../navigation'

export function MainTabs() {
  const { pathname } = useLocation()

  return (
    <nav className="main-tabs" aria-label="Main">
      <ul>
        {mainTabs.map((tab) => {
          const active = tab.isActive(pathname)
          return (
            <li key={tab.id}>
              <Link
                to={tab.path}
                className={active ? 'main-tab is-active' : 'main-tab'}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
