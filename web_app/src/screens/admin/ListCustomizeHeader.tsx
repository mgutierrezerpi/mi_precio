import { Link } from 'react-router-dom'
import { Icon } from './crm/ui'

type Props = {
  listName?: string
  publicUrl: string
  dirty: boolean
  saving: boolean
  onOpenPreview: () => void
  onSave: () => void
}

export function ListCustomizeHeader({
  listName,
  publicUrl,
  dirty,
  saving,
  onOpenPreview,
  onSave,
}: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          to="/admin/lists"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--dash-link)] hover:underline"
        >
          <Icon name="chevron-left" size={14} /> Volver a listas
        </Link>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-link)]">
          Diseño de lista
        </p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight text-[var(--dash-text)]">
          {listName || 'Personalizar lista'}
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-text2)]">
          Editá los detalles de tu plantilla y mirá el resultado al instante.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)]"
            title="Abrir página pública"
          >
            <Icon name="external-link" size={15} />
          </a>
        )}
        <button
          type="button"
          onClick={onOpenPreview}
          className="btn btn-sm inline-flex h-9 items-center gap-1 rounded-lg bg-[var(--dash-text)] px-3 text-xs font-bold text-[var(--dash-surface)] sm:hidden"
        >
          <Icon name="eye" size={14} /> Preview
        </button>
        {(dirty || saving) && (
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="btn btn-sm h-9 rounded-lg bg-[var(--dash-text)] px-3 text-xs font-bold text-[var(--dash-surface)] disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar ahora'}
          </button>
        )}
      </div>
    </header>
  )
}
