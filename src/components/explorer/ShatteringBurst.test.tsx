import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SHARDS, ShatteringBurst } from './ShatteringBurst'

afterEach(cleanup)

const burst = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-at]')!

describe('Shattering burst', () => {
  it('streaks sixteen Shards out, waiting for the camera to arrive', () => {
    const { container } = render(<ShatteringBurst at="space" reduced={false} />)
    const el = burst(container)
    expect(el.dataset.at).toBe('space')
    expect(el.dataset.phase).toBe('wait')
    expect(el).not.toHaveAttribute('data-reduced')
    expect(el.querySelectorAll('[data-streak]')).toHaveLength(SHARDS)
    // Decoration only: it names nothing, and screen readers skip it.
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.textContent).toBe('')
    expect(el.querySelector('svg')).toBeInTheDocument()
  })

  it('shows a still version at once for reduced motion', () => {
    const { container } = render(<ShatteringBurst at="world" reduced />)
    const el = burst(container)
    expect(el.dataset.at).toBe('world')
    expect(el).toHaveAttribute('data-reduced')
    expect(el.dataset.phase).toBe('play')
    // The world's globe cracks, not the view.
    expect(el.querySelector('svg')).toBeNull()
  })
})
