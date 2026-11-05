export type Theme = 'illuminated' | 'classic'
export const THEME_KEY = 'cosmere-guide:theme'

export function loadTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'classic'
      ? 'classic'
      : 'illuminated'
  } catch {
    console.warn('Theme preference unavailable; using Illuminated.')
    return 'illuminated'
  }
}

/** Synchronizes the entry and header with the pre-paint bootstrap in index.html. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function saveTheme(theme: Theme) {
  const scroller = document.querySelector<HTMLElement>('.app-main')
  const top = scroller?.scrollTop ?? 0
  // Changing type metrics must not let native scroll anchoring move the reader.
  if (scroller) scroller.style.overflowAnchor = 'none'
  applyTheme(theme)
  if (scroller) {
    scroller.scrollTop = top
    requestAnimationFrame(() => {
      scroller.style.removeProperty('overflow-anchor')
    })
  }
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    console.warn(
      'Theme preference could not be saved; using it for this visit.',
    )
  }
}
