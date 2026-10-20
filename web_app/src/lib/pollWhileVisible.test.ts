import { afterEach, describe, expect, it, vi } from 'vitest'
import { pollWhileVisible } from './pollWhileVisible'

const setHidden = (hidden: boolean) =>
  Object.defineProperty(document, 'hidden', {
    value: hidden,
    configurable: true,
  })

describe('pollWhileVisible (B22)', () => {
  afterEach(() => {
    vi.useRealTimers()
    setHidden(false)
  })

  it('skips the ticks of a hidden tab and catches up when it returns', () => {
    vi.useFakeTimers()
    const load = vi.fn()
    const stop = pollWhileVisible(load, 1000)

    vi.advanceTimersByTime(2000)
    expect(load).toHaveBeenCalledTimes(2)

    setHidden(true)
    vi.advanceTimersByTime(5000)
    expect(load).toHaveBeenCalledTimes(2)

    setHidden(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(load).toHaveBeenCalledTimes(3)

    stop()
    vi.advanceTimersByTime(5000)
    expect(load).toHaveBeenCalledTimes(3)
  })
})
