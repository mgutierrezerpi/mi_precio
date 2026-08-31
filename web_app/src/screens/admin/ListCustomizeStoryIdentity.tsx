import type { ChangeEvent, RefObject } from 'react'
import type { ListContent } from '../../types'
import { Field, inputClass } from './ListCustomizeShared'
import { Icon } from './crm/ui'

type Props = {
  content: ListContent
  canEdit: boolean
  uploading: boolean
  imageRef: RefObject<HTMLInputElement | null>
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onChange: (
    key: keyof NonNullable<ListContent['template']>,
    value: string
  ) => void
}

export function ListCustomizeStoryIdentity({
  content,
  canEdit,
  uploading,
  imageRef,
  onUpload,
  onChange,
}: Props) {
  const template = content.template
  const field = (key: keyof NonNullable<ListContent['template']>) =>
    (template?.[key] as string) || ''
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[var(--dash-text)]">
            Contenido de historias
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            Editá la identidad y administrá cada historia como un elemento
            independiente.
          </p>
        </div>
        <button
          type="button"
          disabled={!canEdit || uploading}
          onClick={() => imageRef.current?.click()}
          className="btn btn-sm inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] disabled:opacity-50"
        >
          <Icon name="upload" size={14} />{' '}
          {uploading ? 'Subiendo…' : 'Subir portada'}
        </button>
        <input
          ref={imageRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={onUpload}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del perfil">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('profileName')}
            onChange={(event) => onChange('profileName', event.target.value)}
            placeholder="Dani"
          />
        </Field>
        <Field label="Logo (URL opcional)">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('logo')}
            onChange={(event) => onChange('logo', event.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field wide label="Foto de perfil y portada">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('profileImage')}
            onChange={(event) => onChange('profileImage', event.target.value)}
            placeholder="https://…"
          />
        </Field>
        {template?.profileImage && (
          <img
            src={template.profileImage}
            alt="Vista previa de portada"
            className="h-44 w-full rounded-xl object-cover sm:col-span-2"
          />
        )}
        <Field label="Título de opciones">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('collaborationHeading')}
            onChange={(event) =>
              onChange('collaborationHeading', event.target.value)
            }
            placeholder="Promocioná tu marca conmigo"
          />
        </Field>
        <Field label="Título de historias">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('storiesHeading')}
            onChange={(event) => onChange('storiesHeading', event.target.value)}
            placeholder="Historias destacadas"
          />
        </Field>
      </div>
    </>
  )
}
