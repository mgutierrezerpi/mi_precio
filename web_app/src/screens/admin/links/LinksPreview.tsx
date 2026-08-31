import type { LinkTree } from '../../../types'
import { LinkTreeView } from '../../../components/linktree/LinkTreeView'
import { Icon } from '../crm/ui'

export function LinksPreview({
  tree,
  tenantLogo,
  publicUrl,
  open,
  close,
}: {
  tree: LinkTree
  tenantLogo?: string | null
  publicUrl: string
  open: boolean
  close: () => void
}) {
  return (
    <aside
      id="links-preview"
      className={`order-first min-w-0 xl:sticky xl:top-5 xl:order-none ${open ? 'max-sm:fixed max-sm:inset-0 max-sm:z-40 max-sm:overflow-y-auto max-sm:bg-[var(--dash-bg)]' : 'hidden'}`}
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-sm max-sm:min-h-full max-sm:rounded-none max-sm:border-0">
        <div className="flex items-center justify-between border-b border-[var(--dash-border)] px-4 py-3">
          <div>
            <h2 className="text-sm font-extrabold text-[var(--dash-text)]">
              Vista previa
            </h2>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Actualización en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--dash-link)]"
              >
                Abrir <Icon name="external-link" size={13} />
              </a>
            )}
            <button
              type="button"
              onClick={close}
              className="hidden rounded-lg border border-[var(--dash-border)] p-1.5 text-[var(--dash-text2)] max-sm:inline-flex"
              aria-label="Cerrar preview"
            >
              <Icon name="circle-x" size={16} />
            </button>
          </div>
        </div>
        <div className="bg-[radial-gradient(circle_at_top,#eceae2,#d8d6ce)] px-5 py-6 max-sm:p-0">
          <div className="mx-auto w-full max-w-[350px] overflow-hidden rounded-[28px] border-[7px] border-[#272924] bg-[var(--dash-surface)] shadow-[0_20px_42px_rgba(25,30,23,.22)] max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:shadow-none">
            <div className="flex h-5 items-center justify-center bg-[#272924] max-sm:hidden">
              <span className="h-1 w-14 rounded-full bg-white/25" />
            </div>
            <LinkTreeView
              data={tree}
              preview
              publicUrl={publicUrl}
              fallbackAvatarUrl={tenantLogo}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
