import { Icon } from '../crm/ui'

export function LinksPreviewToggle({
  open,
  toggle,
}: {
  open: boolean
  toggle: () => void
}) {
  return (
    <button
      type="button"
      aria-controls="links-preview"
      aria-expanded={open}
      onClick={toggle}
      className="fixed right-6 top-1/2 z-30 inline-flex h-[112px] w-10 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] py-3 text-xs font-bold text-[var(--dash-text)] shadow-[0_8px_22px_rgba(0,0,0,.12)] transition-colors hover:bg-[var(--dash-soft)] max-sm:hidden"
      aria-label={open ? 'Ocultar vista previa' : 'Mostrar vista previa'}
    >
      <Icon name={open ? 'chevron-right' : 'eye'} size={15} />
      <span className="[writing-mode:vertical-rl]">
        {open ? 'Ocultar preview' : 'Abrir preview'}
      </span>
    </button>
  )
}
