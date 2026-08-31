import type { Tenant } from '../../types'
import type { TFn } from '../../lib/i18n'

export function BrandPreview({
  color,
  description,
  tenant,
  t,
}: {
  color: string
  description: string
  tenant: Tenant | null
  t: TFn
}) {
  return (
    <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
        {t('set.brand.preview')}
      </p>
      <div className="flex items-center gap-3">
        {tenant?.logoUrl ? (
          <img
            src={tenant.logoUrl}
            alt=""
            className="h-10 w-10 rounded-lg object-contain"
          />
        ) : (
          <span
            className="h-10 w-10 rounded-lg"
            style={{ backgroundColor: color }}
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-[var(--dash-text)]">
            {tenant?.name || t('set.brand.previewBiz')}
          </span>
          <span className="text-xs font-medium" style={{ color }}>
            {description || t('set.brand.previewCat')}
          </span>
        </div>
      </div>
    </div>
  )
}
