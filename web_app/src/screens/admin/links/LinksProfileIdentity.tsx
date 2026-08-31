import type { RefObject } from 'react'
import type { LinkTree } from '../../../types'
import { Icon } from '../crm/ui'
import { Field } from './Field'
import { inputClass, textareaClass } from './linksConstants'
import type { UpdateTree } from './linksTypes'

export function LinksProfileIdentity({
  tree,
  tenantLogo,
  canEdit,
  update,
  avatarInputRef,
  uploading,
  selectLogo,
  uploadAvatar,
}: {
  tree: LinkTree
  tenantLogo?: string | null
  canEdit: boolean
  update: UpdateTree
  avatarInputRef: RefObject<HTMLInputElement | null>
  uploading: boolean
  selectLogo: (logo: string) => void
  uploadAvatar: (file?: File) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre público">
        <input
          disabled={!canEdit}
          className={inputClass}
          value={tree.displayName}
          onChange={(event) => update('displayName', event.target.value)}
        />
      </Field>
      <Field label="Usuario o handle">
        <input
          className={inputClass}
          placeholder="@tu_negocio"
          value={tree.handle || ''}
          onChange={(event) => update('handle', event.target.value || null)}
        />
      </Field>
      <Field label="Link público">
        <div className="mt-1 flex h-10 overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] focus-within:border-[var(--dash-link)] focus-within:ring-2 focus-within:ring-[var(--dash-link)]/20">
          <span className="flex items-center border-r border-[var(--dash-border)] px-2 text-xs font-bold text-[var(--dash-muted)]">
            /l/
          </span>
          <input
            disabled={!canEdit}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--dash-text)] outline-none"
            value={tree.publicSlug}
            onChange={(event) =>
              update(
                'publicSlug',
                event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
              )
            }
          />
        </div>
        <p className="mt-1 text-[11px] font-medium text-[var(--dash-muted)]">
          Este es el link que vas a compartir.
        </p>
      </Field>
      <Field label="Descripción">
        <textarea
          className={textareaClass}
          value={tree.bio || ''}
          onChange={(event) => update('bio', event.target.value || null)}
        />
      </Field>
      <Field label="Imagen de perfil">
        <div className="mt-1 flex items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--dash-border)] bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)]">
            {tree.avatarUrl || tenantLogo ? (
              <img
                src={tree.avatarUrl || tenantLogo || ''}
                alt="Logo del negocio"
                className="h-full w-full object-contain"
              />
            ) : (
              tree.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex min-w-0 flex-1 gap-2">
            <button
              type="button"
              disabled={!canEdit || !tenantLogo || uploading}
              onClick={() => selectLogo(tenantLogo || '')}
              aria-label="Usar logo del negocio"
              title="Usar logo del negocio"
              className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)] disabled:opacity-40"
              data-tip="Usar logo del negocio"
            >
              <Icon name="package" size={15} />
            </button>
            <button
              type="button"
              disabled={!canEdit || uploading}
              onClick={() => avatarInputRef.current?.click()}
              aria-label={uploading ? 'Subiendo imagen' : 'Subir imagen'}
              title={uploading ? 'Subiendo imagen' : 'Subir imagen'}
              className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-text)] !p-0 text-[var(--dash-surface)] disabled:opacity-40"
              data-tip={uploading ? 'Subiendo imagen' : 'Subir imagen'}
            >
              <Icon name="upload" size={15} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                uploadAvatar(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] font-medium text-[var(--dash-muted)]">
          Las imágenes se optimizan y guardan de forma segura. Al elegir una,
          tomamos su color dominante para la página.
        </p>
      </Field>
    </div>
  )
}
