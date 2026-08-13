import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EXPORT_ASSET_TIMEOUT_MS,
  useExportPdfWhenReady,
} from './useExportPdfWhenReady'

const exportListPdf = vi.hoisted(() => vi.fn())
vi.mock('../lib/exportListPdf', () => ({ exportListPdf }))

/** happy-dom never fires load on an <img>, so tests drive it by hand. */
function addImage({ complete }: { complete: boolean }) {
  const img = document.createElement('img')
  Object.defineProperty(img, 'complete', { value: complete })
  document.body.appendChild(img)
  return img
}

function addList() {
  const node = document.createElement('div')
  node.className = 'mp-public'
  document.body.appendChild(node)
  return node
}

const run = () => renderHook(() => useExportPdfWhenReady(true, '.mp-public', 'carta'))

beforeEach(() => {
  document.body.innerHTML = ''
  exportListPdf.mockReset().mockResolvedValue(undefined)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('useExportPdfWhenReady', () => {
  it('does not export while the list is still loading', async () => {
    addList()
    renderHook(() => useExportPdfWhenReady(false, '.mp-public', 'carta'))
    await new Promise((r) => setTimeout(r, 20))
    expect(exportListPdf).not.toHaveBeenCalled()
  })

  it('exports the list node under the given file name', async () => {
    const node = addList()
    addImage({ complete: true })

    const { result } = run()
    await waitFor(() => expect(exportListPdf).toHaveBeenCalledTimes(1))

    expect(exportListPdf).toHaveBeenCalledWith({ node, fileName: 'carta' })
    await waitFor(() => expect(result.current).toBe('done'))
  })

  it('waits for a photo that has not decoded yet', async () => {
    addList()
    const img = addImage({ complete: false })
    run()

    await new Promise((r) => setTimeout(r, 20))
    // A blank box where the product should be is worse than a slower export.
    expect(exportListPdf).not.toHaveBeenCalled()

    img.dispatchEvent(new Event('load'))
    await waitFor(() => expect(exportListPdf).toHaveBeenCalledTimes(1))
  })

  it('treats a broken image as settled rather than hanging on it', async () => {
    addList()
    const img = addImage({ complete: false })
    run()

    img.dispatchEvent(new Event('error'))
    await waitFor(() => expect(exportListPdf).toHaveBeenCalledTimes(1))
  })

  it('exports anyway once the deadline passes, so one stuck asset cannot block it', async () => {
    vi.useFakeTimers()
    addList()
    addImage({ complete: false }) // never loads, never errors
    run()

    await vi.advanceTimersByTimeAsync(EXPORT_ASSET_TIMEOUT_MS + 50)
    expect(exportListPdf).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('exports only once, so a re-render cannot download a duplicate', async () => {
    addList()
    addImage({ complete: true })
    const { rerender } = run()
    await waitFor(() => expect(exportListPdf).toHaveBeenCalledTimes(1))

    rerender()
    rerender()
    await new Promise((r) => setTimeout(r, 20))
    expect(exportListPdf).toHaveBeenCalledTimes(1)
  })

  it('reports an error instead of leaving the tab claiming success', async () => {
    addList()
    exportListPdf.mockRejectedValue(new Error('canvas exploded'))

    const { result } = run()
    await waitFor(() => expect(result.current).toBe('error'))
  })

  it('errors when there is no list to capture, rather than exporting a blank sheet', async () => {
    const { result } = run() // no .mp-public in the document
    await waitFor(() => expect(result.current).toBe('error'))
    expect(exportListPdf).not.toHaveBeenCalled()
  })
})
