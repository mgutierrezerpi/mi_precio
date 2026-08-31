import type { ListContent } from '../../types'
import { Field, inputClass, textareaClass } from './ListCustomizeShared'

type Props = {
  content: ListContent
  canEdit: boolean
  onHeroChange: (key: 'eyebrow' | 'title' | 'body', value: string) => void
  onTemplateChange: (
    key: keyof NonNullable<ListContent['template']>,
    value: string
  ) => void
}

export function ListCustomizeHeroSection({
  content,
  canEdit,
  onHeroChange,
  onTemplateChange,
}: Props) {
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <div className="mb-4">
        <h2 className="text-base font-extrabold text-[var(--dash-text)]">
          Encabezado
        </h2>
        <p className="mt-1 text-xs text-[var(--dash-muted)]">
          La introducción que abre tu lista pública.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Antetítulo">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={content.hero?.eyebrow || ''}
            onChange={(event) => onHeroChange('eyebrow', event.target.value)}
            placeholder="NOVEDADES"
          />
        </Field>
        <Field label="Título">
          <input
            disabled={!canEdit}
            className={inputClass}
            value={content.hero?.title || ''}
            onChange={(event) => onHeroChange('title', event.target.value)}
          />
        </Field>
        <Field wide label="Descripción">
          <textarea
            disabled={!canEdit}
            className={textareaClass}
            value={content.hero?.body || ''}
            onChange={(event) => onHeroChange('body', event.target.value)}
            placeholder="Una breve introducción a la lista."
          />
        </Field>
        <Field label="Tipografía">
          <select
            disabled={!canEdit}
            className={inputClass}
            value={content.template?.font || 'sans'}
            onChange={(event) => onTemplateChange('font', event.target.value)}
          >
            <option value="sans">Sans · moderna</option>
            <option value="editorial">Editorial · serif</option>
            <option value="serif">Serif · clásica</option>
            <option value="mono">Mono · técnica</option>
            <option value="code-pro">Code Pro</option>
          </select>
        </Field>
        <Field label="Canal para pedidos">
          <select
            disabled={!canEdit}
            className={inputClass}
            value={content.template?.checkoutChannel || 'whatsapp'}
            onChange={(event) =>
              onTemplateChange('checkoutChannel', event.target.value)
            }
          >
            <option value="whatsapp">WhatsApp · mensaje con pedido</option>
            <option value="instagram">
              Instagram · copiar pedido y abrir DM
            </option>
          </select>
        </Field>
        {content.template?.checkoutChannel === 'instagram' && (
          <Field label="Usuario de Instagram">
            <input
              disabled={!canEdit}
              className={inputClass}
              value={content.template.instagramHandle || ''}
              onChange={(event) =>
                onTemplateChange(
                  'instagramHandle',
                  event.target.value
                    .replace(/^@/, '')
                    .replace(/[^a-zA-Z0-9._]/g, '')
                )
              }
              placeholder="tu.perfil"
            />
            <span className="mt-1 block text-[11px] font-medium text-[var(--dash-muted)]">
              Abrimos el DM y copiamos el pedido para que lo peguen.
            </span>
          </Field>
        )}
      </div>
    </article>
  )
}
