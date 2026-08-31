import type { ListContent } from '../../types'
import { Field, inputClass } from './ListCustomizeShared'

export function ListCustomizePriceSection({
  content,
  canEdit,
  onChange,
}: {
  content: ListContent
  canEdit: boolean
  onChange: (value: string) => void
}) {
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <h2 className="text-base font-extrabold text-[var(--dash-text)]">
        Formato de precios
      </h2>
      <p className="mt-1 text-xs text-[var(--dash-muted)]">
        Elegí cómo se muestra el símbolo delante de cada precio.
      </p>
      <div className="mt-4 max-w-xs">
        <Field label="Formato">
          <select
            disabled={!canEdit}
            className={inputClass}
            value={content.template?.priceFormat || '$'}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="$">$</option>
            <option value="U$D">U$D</option>
            <option value="USD">USD</option>
          </select>
        </Field>
      </div>
    </article>
  )
}
