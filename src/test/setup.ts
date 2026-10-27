import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { BOOKS_READ_KEY } from '../state/booksRead'

// Pages load lazily; under a full parallel run (or a slow CI machine) the
// default 1s wait for findBy* isn't always enough.
configure({ asyncUtilTimeout: 5000 })

// jsdom has no modal dialogs yet; open and close them by attribute.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  if (!this.open) return
  this.open = false
  this.dispatchEvent(new Event('close'))
}

// Most tests act as a returning reader so the first-visit prompt stays shut.
beforeEach(() => localStorage.setItem(BOOKS_READ_KEY, '[]'))
afterEach(() => {
  cleanup()
  localStorage.clear()
})
