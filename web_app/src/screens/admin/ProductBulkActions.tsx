import { Icon } from './crm/ui'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'

export function ProductBulkActions({
  count,
  canEdit,
  onDelete,
  onClear,
}: {
  count: number
  canEdit: boolean
  onDelete: () => void
  onClear: () => void
}) {
  const t = useCatalogT()
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3">
      <Icon name="circle-check" size={18} className="text-[var(--dash-link)]" />
      <span className="text-[13px] font-bold text-[var(--dash-text2)]">
        {t('products.selected', { count, plural: count === 1 ? '' : 's' })}
      </span>
      <div className="flex-1" />
      {canEdit && (
        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold text-[#F87171] hover:bg-white/10"
        >
          <Icon name="circle-x" size={15} /> {t('products.delete')}
        </button>
      )}
      <button
        type="button"
        onClick={onClear}
        className="flex h-8 items-center rounded-lg px-3 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-white/10"
      >
        {t('products.clear')}
      </button>
    </div>
  )
}
