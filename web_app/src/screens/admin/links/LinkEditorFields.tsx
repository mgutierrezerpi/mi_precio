import type { LinkTreeLink } from '../../../types'
import { Field } from './Field'
import { inputClass } from './linksConstants'

export function LinkEditorFields({
  link,
  onChange,
  disabled,
}: {
  link: LinkTreeLink
  onChange: (link: LinkTreeLink) => void
  disabled: boolean
}) {
  const set = <K extends keyof LinkTreeLink>(key: K, value: LinkTreeLink[K]) =>
    onChange({ ...link, [key]: value })
  return (
    <div className="border-t border-[var(--dash-border)] p-4 pt-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título">
          <input
            disabled={disabled}
            className={inputClass}
            value={link.title}
            onChange={(event) => set('title', event.target.value)}
          />
        </Field>
        <Field label="URL">
          <input
            disabled={disabled}
            className={inputClass}
            placeholder="https://… o /p/tu-negocio"
            value={link.url}
            onChange={(event) => set('url', event.target.value)}
          />
        </Field>
        <Field label="Descripción">
          <input
            disabled={disabled}
            className={inputClass}
            value={link.description || ''}
            onChange={(event) => set('description', event.target.value || null)}
          />
        </Field>
        <Field label="Estilo">
          <select
            disabled={disabled}
            className={inputClass}
            value={link.style}
            onChange={(event) =>
              set('style', event.target.value as LinkTreeLink['style'])
            }
          >
            <option value="featured">Destacado</option>
            <option value="dark">Oscuro</option>
            <option value="light">Claro</option>
          </select>
        </Field>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--dash-text2)]">
        <input
          disabled={disabled}
          type="checkbox"
          checked={link.enabled}
          onChange={(event) => set('enabled', event.target.checked)}
          className="checkbox checkbox-sm"
        />{' '}
        Mostrar este link
      </label>
    </div>
  )
}
