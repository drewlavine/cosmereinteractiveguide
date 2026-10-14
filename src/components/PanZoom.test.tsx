import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PanZoom } from './PanZoom'

const setup = () => {
  const onClick = vi.fn()
  render(
    <PanZoom label="Test map">
      <button type="button" onClick={onClick}>
        Target
      </button>
    </PanZoom>,
  )
  const viewport = screen.getByRole('region', { name: 'Test map' })
  const content = viewport.firstElementChild as HTMLElement
  const scale = () =>
    Number(/scale\(([\d.]+)\)/.exec(content.style.transform)?.[1])
  return { onClick, viewport, content, scale }
}

describe('PanZoom', () => {
  it('zooms in, out and resets with the buttons', async () => {
    const { scale } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(scale()).toBeCloseTo(1.5)
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(scale()).toBeCloseTo(1 / 1.5)
    await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))
    expect(scale()).toBe(1)
  })

  it('zooms with the mouse wheel', () => {
    const { viewport, scale } = setup()
    fireEvent.wheel(viewport, { deltaY: -200 })
    expect(scale()).toBeGreaterThan(1)
    fireEvent.wheel(viewport, { deltaY: 400 })
    expect(scale()).toBeLessThan(1)
  })

  it('pans on drag without triggering a click', () => {
    const { viewport, content, onClick } = setup()
    viewport.setPointerCapture = vi.fn()
    const target = screen.getByRole('button', { name: 'Target' })

    fireEvent.pointerDown(target, {
      pointerId: 1,
      button: 0,
      clientX: 0,
      clientY: 0,
    })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 30, clientY: 20 })
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 30, clientY: 20 })
    fireEvent.click(target)

    expect(content.style.transform).toContain('translate(30px, 20px)')
    expect(onClick).not.toHaveBeenCalled()

    fireEvent.click(target)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
