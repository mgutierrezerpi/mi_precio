import type { ChangeEvent, RefObject } from 'react'
import type { ListContent } from '../../types'
import { Field, inputClass, textareaClass } from './ListCustomizeShared'
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

export function ListCustomizeEditorialSection({
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
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[var(--dash-text)]">
            Contenido editorial
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            Esta plantilla tiene imagen, promoción y textos de pie propios.
          </p>
        </div>
        <button
          type="button"
          disabled={!canEdit || uploading}
          onClick={() => imageRef.current?.click()}
          className="btn btn-sm inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] disabled:opacity-50"
        >
          <Icon name="upload" size={14} />{' '}
          {uploading ? 'Subiendo…' : 'Subir imagen'}
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
        <Field wide label="Imagen editorial">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('image')}
            onChange={(event) => onChange('image', event.target.value)}
            placeholder="https://…"
          />
        </Field>
        {template?.image && (
          <img
            src={template.image}
            alt="Vista previa editorial"
            className="h-44 w-full rounded-xl object-cover sm:col-span-2"
          />
        )}
        <Field label="Etiqueta de imagen">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('imageLabel')}
            onChange={(event) => onChange('imageLabel', event.target.value)}
          />
        </Field>
        <Field label="Título de imagen">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('imageTitle')}
            onChange={(event) => onChange('imageTitle', event.target.value)}
          />
        </Field>
        <Field label="Antetítulo de promoción">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('promoEyebrow')}
            onChange={(event) => onChange('promoEyebrow', event.target.value)}
          />
        </Field>
        <Field label="Título de promoción">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('promoTitle')}
            onChange={(event) => onChange('promoTitle', event.target.value)}
          />
        </Field>
        <Field wide label="Texto de promoción">
          <textarea
            disabled={!canEdit}
            className={textareaClass}
            value={field('promoBody')}
            onChange={(event) => onChange('promoBody', event.target.value)}
          />
        </Field>
        <Field label="Precio o llamada">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('promoPrice')}
            onChange={(event) => onChange('promoPrice', event.target.value)}
          />
        </Field>
        <Field label="Nota de promoción">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('promoNote')}
            onChange={(event) => onChange('promoNote', event.target.value)}
          />
        </Field>
        <Field label="Pie izquierdo">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('footerLeft')}
            onChange={(event) => onChange('footerLeft', event.target.value)}
          />
        </Field>
        <Field label="Pie derecho">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={field('footerRight')}
            onChange={(event) => onChange('footerRight', event.target.value)}
          />
        </Field>
      </div>
    </article>
  )
}
