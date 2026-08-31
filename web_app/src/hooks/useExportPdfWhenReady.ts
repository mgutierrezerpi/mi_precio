import { useEffect, useRef, useState } from 'react'
import { exportListPdf } from '../lib/exportListPdf'

/** Longest we wait for photos before capturing anyway. A shop with one broken
 *  image should still get its PDF, just without that picture. */
export const EXPORT_ASSET_TIMEOUT_MS = 6000

export type ExportState = 'idle' | 'working' | 'done' | 'error'

/** Drives the PDF export on the public list's export route.
 *
 *  Waits until the sheet would actually look right — fonts settled, every
 *  photo decoded — then captures and downloads. Capturing the moment React
 *  commits gives a PDF with blank boxes where the products should be.
 *
 *  Runs at most once per mount: a second capture would download a duplicate.
 */
export function useExportPdfWhenReady(
  ready: boolean,
  selector: string,
  fileName: string
) {
  const started = useRef(false)
  const [state, setState] = useState<ExportState>('idle')

  useEffect(() => {
    if (!ready || started.current) return
    started.current = true
    let cancelled = false

    const decoded = Array.from(document.querySelectorAll('img')).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })
    )
    const settled = Promise.all([document.fonts?.ready, ...decoded])
    const deadline = new Promise((resolve) =>
      setTimeout(resolve, EXPORT_ASSET_TIMEOUT_MS)
    )

    setState('working')
    void Promise.race([settled, deadline])
      .then(async () => {
        if (cancelled) return
        const node = document.querySelector<HTMLElement>(selector)
        if (!node) throw new Error(`nothing to export at ${selector}`)
        await exportListPdf({ node, fileName })
        if (!cancelled) setState('done')
      })
      .catch((err) => {
        // The shop is looking at a tab that exists only to produce a file, so
        // the state drives what it reads there instead of a silent dead end.
        console.error('[pdf] export failed', err)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [ready, selector, fileName])

  return state
}

export default useExportPdfWhenReady
