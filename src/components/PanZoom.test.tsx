import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PanZoom, type PanZoomHandle } from './PanZoom'

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

  it('eases into the mouse wheel’s zoom', async () => {
    const { viewport, scale } = setup()
    fireEvent.wheel(viewport, { deltaY: -200 })
    await waitFor(() => expect(scale()).toBeCloseTo(Math.exp(0.4)))
    fireEvent.wheel(viewport, { deltaY: 400 })
    await waitFor(() => expect(scale()).toBeCloseTo(Math.exp(-0.4)))
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

  it('flies to a box through its ref, animated unless asked not to', () => {
    const ref = createRef<PanZoomHandle>()
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 400,
      height: 200,
    } as DOMRect)
    render(
      <PanZoom label="Fly map" ref={ref}>
        <div />
      </PanZoom>,
    )
    const content = screen.getByRole('region', { name: 'Fly map' })
      .firstElementChild as HTMLElement
    act(() =>
      ref.current!.flyTo(
        { x: 100, y: 50, width: 50, height: 25 },
        { padding: 0 },
      ),
    )
    expect(content.style.transform).toBe('translate(-800px, -400px) scale(8)')
    expect(content).toHaveClass('is-flying')
    act(() => ref.current!.reset({ animate: false }))
    expect(content.style.transform).toBe('translate(0px, 0px) scale(1)')
    expect(content).not.toHaveClass('is-animating')
    vi.restoreAllMocks()
  })
})
