import type { ExportState } from '../../hooks/useExportPdfWhenReady'
import type { TFn } from '../../lib/i18n'

/** What the shop reads in the tab that exists only to produce its PDF.
 *
 *  `data-no-export` keeps it out of the capture: otherwise the notice would be
 *  baked into the PDF it is announcing. */
export function ExportOverlay({
  state,
  accent,
  t,
}: {
  state: ExportState
  accent: string
  t: TFn
}) {
  const message =
    state === 'error'
      ? t('pub.pdf.error')
      : state === 'done'
        ? t('pub.pdf.done')
        : t('pub.pdf.working')

  return (
    <div
      data-no-export
      role="status"
      className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-3 px-5 py-3 text-[13px] font-bold text-white"
      style={{ background: state === 'error' ? '#B91C1C' : accent }}
    >
      {(state === 'idle' || state === 'working') && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      <span>{message}</span>
    </div>
  )
}
