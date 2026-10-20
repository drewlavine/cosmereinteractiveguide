/** Sent to a section to open it, e.g. when its Contents link is followed. */
export const OPEN = 'page-section-open'

/**
 * Scrolls to a part of the page (opening its section if folded away) and
 * briefly highlights it.
 */
export function showOnPage(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.closest('.page-section')?.dispatchEvent(new Event(OPEN))
  requestAnimationFrame(() =>
    el.scrollIntoView?.({ block: 'center', behavior: 'smooth' }),
  )
  el.classList.remove('page-flash')
  void el.offsetWidth
  el.classList.add('page-flash')
}
