import { fireEvent, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEscapeToClose } from './useEscapeToClose'

describe('useEscapeToClose (B14)', () => {
  it('closes an open menu on Escape and ignores other keys', () => {
    const close = vi.fn()
    renderHook(() => useEscapeToClose(true, close))
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(close).not.toHaveBeenCalled()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does nothing while the menu is closed', () => {
    const close = vi.fn()
    renderHook(() => useEscapeToClose(false, close))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).not.toHaveBeenCalled()
  })
})
