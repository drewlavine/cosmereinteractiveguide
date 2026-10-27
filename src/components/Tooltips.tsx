import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Tip {
  el: HTMLElement | SVGElement
  text: string
}

const GAP = 8

const tipAt = (target: EventTarget | null): Tip | undefined => {
  const el =
    target instanceof Element
      ? target.closest<HTMLElement | SVGElement>('[data-tooltip]')
      : null
  const text = el?.dataset.tooltip
  return el && text ? { el, text } : undefined
}

const focusVisible = (el: Element) => {
  try {
    return el.matches(':focus-visible')
  } catch {
    return false
  }
}

/**
 * The site's tooltips: any element with `data-tooltip` shows that text on
 * mouse hover or keyboard focus (never on touch). Drawn once, fixed to the
 * screen, so maps and scrolling strips never clip it.
 */
export function Tooltips() {
  const [tip, setTip] = useState<Tip>()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const same = (a?: Tip, b?: Tip) => a?.el === b?.el && a?.text === b?.text
    const show = (next?: Tip) => setTip((t) => (same(t, next) ? t : next))
    const hide = () => setTip(undefined)
    const over = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') show(tipAt(e.target))
    }
    const out = (e: PointerEvent) => {
      if (!e.relatedTarget) hide()
    }
    const focus = (e: FocusEvent) => {
      if (e.target instanceof Element && focusVisible(e.target))
        show(tipAt(e.target))
    }
    // A click can change the text (Play → Pause) or remove the control.
    const click = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const next = tipAt(e.target)
        show(next?.el.isConnected ? next : undefined)
      })
    }
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)
    document.addEventListener('focusin', focus)
    document.addEventListener('focusout', hide)
    document.addEventListener('click', click)
    document.addEventListener('scroll', hide, true)
    window.addEventListener('blur', hide)
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('click', click)
      document.removeEventListener('scroll', hide, true)
      window.removeEventListener('blur', hide)
    }
  }, [])

  // Above the control, or below it near the top of the window; kept on screen.
  useLayoutEffect(() => {
    const t = box.current
    if (!tip || !t) return
    const r = tip.el.getBoundingClientRect()
    const above = r.top - t.offsetHeight - GAP
    const x = Math.min(
      Math.max(GAP, r.left + r.width / 2 - t.offsetWidth / 2),
      window.innerWidth - t.offsetWidth - GAP,
    )
    t.style.left = `${x}px`
    t.style.top = `${above < GAP ? r.bottom + GAP : above}px`
  }, [tip])

  return tip
    ? createPortal(
        <div ref={box} className="tooltip" aria-hidden="true">
          {tip.text}
        </div>,
        // In real full screen only that element is drawn.
        document.fullscreenElement ?? document.body,
      )
    : null
}
