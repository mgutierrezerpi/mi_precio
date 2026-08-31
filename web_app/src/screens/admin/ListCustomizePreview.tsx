import { Icon } from './crm/ui'

type Props = {
  publicUrl: string
  open: boolean
  revision: number
  onClose: () => void
}

export function ListCustomizePreview({
  publicUrl,
  open,
  revision,
  onClose,
}: Props) {
  return (
    <aside
      className={`order-first min-w-0 xl:sticky xl:top-5 xl:order-none ${open ? 'max-sm:fixed max-sm:inset-0 max-sm:z-40 max-sm:overflow-y-auto max-sm:bg-[var(--dash-bg)]' : 'hidden'}`}
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-sm max-sm:min-h-full max-sm:rounded-none max-sm:border-0">
        <div className="flex items-center justify-between border-b border-[var(--dash-border)] px-4 py-3">
          <div>
            <h2 className="text-sm font-extrabold text-[var(--dash-text)]">
              Vista previa
            </h2>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Se actualiza al guardar
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hidden rounded-lg border border-[var(--dash-border)] p-1.5 text-[var(--dash-text2)] max-sm:inline-flex"
            aria-label="Cerrar preview"
          >
            <Icon name="circle-x" size={16} />
          </button>
        </div>
        <div className="bg-[radial-gradient(circle_at_top,#eceae2,#d8d6ce)] p-5 max-sm:p-0">
          <div className="mx-auto aspect-[9/18] w-full max-w-[350px] overflow-hidden rounded-[28px] border-[7px] border-[#272924] bg-white shadow-[0_20px_42px_rgba(25,30,23,.22)] max-sm:aspect-auto max-sm:max-w-none max-sm:rounded-none max-sm:border-0">
            <iframe
              key={revision}
              title="Vista previa de la lista"
              src={publicUrl ? `${publicUrl}?preview=editor` : ''}
              className="block h-[117.647%] w-[117.647%] origin-top-left scale-[.85] border-0 max-sm:h-[100dvh] max-sm:w-full max-sm:scale-100"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
