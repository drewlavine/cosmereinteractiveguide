export const SIDE_NAV_PINNED_KEY = 'cosmere-guide:side-nav-pinned'

export function loadPinned(): boolean {
  try {
    return localStorage.getItem(SIDE_NAV_PINNED_KEY) === 'true'
  } catch {
    return false
  }
}

export function savePinned(pinned: boolean) {
  try {
    if (pinned) localStorage.setItem(SIDE_NAV_PINNED_KEY, 'true')
    else localStorage.removeItem(SIDE_NAV_PINNED_KEY)
  } catch {
    // Private browsing or full storage: the choice lasts for this visit.
  }
}

/** Phones get a drawer; wider screens a rail the menu button pins open. */
export const isPhone = () =>
  window.matchMedia?.('(max-width: 760px)').matches ?? true
