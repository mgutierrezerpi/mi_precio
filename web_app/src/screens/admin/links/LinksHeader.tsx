import { Icon } from '../crm/ui'

export function LinksHeader({
  publicUrl,
  copied,
  dirty,
  saving,
  tree,
  canEdit,
  copy,
  save,
  openPreview,
}: {
  publicUrl: string
  copied: boolean
  dirty: boolean
  saving: boolean
  tree: boolean
  canEdit: boolean
  copy: () => void
  save: () => void
  openPreview: () => void
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-link)]">
          Tu presencia digital
        </p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight text-[var(--dash-text)]">
          Tu página de links
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-text2)]">
          Compartí catálogo, contacto y redes con un solo link.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {publicUrl && (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Link copiado' : 'Copiar link'}
            title={copied ? 'Link copiado' : 'Copiar link'}
            className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)]"
            data-tip={copied ? 'Link copiado' : 'Copiar link'}
          >
            <Icon name="copy" size={15} />
          </button>
        )}
        {publicUrl && (
          <div className="flex items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Ver página pública"
              title="Ver página pública"
              className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)]"
              data-tip="Ver página pública"
            >
              <Icon name="eye" size={15} />
            </a>
            <button
              type="button"
              onClick={openPreview}
              className="btn btn-sm hidden rounded-lg bg-[var(--dash-text)] px-3 py-2 text-xs font-bold text-[var(--dash-surface)] sm:hidden"
            >
              <Icon name="eye" size={14} /> Abrir preview
            </button>
          </div>
        )}
        {(dirty || saving) && (
          <button
            type="button"
            disabled={!tree || saving || !canEdit || !dirty}
            onClick={save}
            className="btn btn-sm rounded-lg bg-[var(--dash-text)] px-4 py-2 text-xs font-bold text-[var(--dash-surface)] disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar ahora'}
          </button>
        )}
      </div>
    </header>
  )
}
