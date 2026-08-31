import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { Checkbox } from './ProductTableParts'

export function ProductTableHeader({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
}) {
  const t = useCatalogT()
  const box = (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onChange={onChange}
    />
  )
  return (
    <>
      <div className="flex items-center gap-3 bg-[var(--dash-table-head)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)] lg:hidden">
        {box}
        <span>{t('products.product')}</span>
      </div>
      <div className="hidden min-w-[720px] items-center gap-2 bg-[var(--dash-table-head)] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)] lg:flex">
        <span className="w-9">{box}</span>
        <span className="flex-1">{t('products.product')}</span>
        <span className="w-[90px]">SKU</span>
        <span className="w-[115px]">{t('products.category')}</span>
        <span className="w-[100px]">{t('products.price')}</span>
        <span className="w-[145px]">{t('products.availability')}</span>
        <span className="w-[105px]">{t('products.updated')}</span>
        <span className="w-8" />
      </div>
    </>
  )
}
