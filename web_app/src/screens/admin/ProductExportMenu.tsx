import { Icon } from './crm/ui'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { Menu, MenuRow } from './ProductMenu'

export function ProductExportMenu({
  count,
  scoped,
  onExcel,
  onPdf,
}: {
  count: number
  scoped: boolean
  onExcel: () => void
  onPdf: () => void
}) {
  const t = useCatalogT()
  return (
    <Menu icon="download" label={t('products.export')} width="w-60">
      {(close) => (
        <>
          <p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--dash-muted)]">
            {t('products.exportScope', {
              count,
              plural: count === 1 ? '' : 's',
              scope: scoped
                ? t('products.selection')
                : t('products.currentFilter'),
            })}
          </p>
          <MenuRow
            active={false}
            onClick={() => {
              if (count) onExcel()
              close()
            }}
          >
            <span className="flex items-center gap-2">
              <Icon
                name="file-spreadsheet"
                size={15}
                className="text-[#16A34A]"
              />{' '}
              Excel (.xls)
            </span>
          </MenuRow>
          <MenuRow
            active={false}
            onClick={() => {
              if (count) onPdf()
              close()
            }}
          >
            <span className="flex items-center gap-2">
              <Icon
                name="file-spreadsheet"
                size={15}
                className="text-[#DC2626]"
              />{' '}
              PDF
            </span>
          </MenuRow>
        </>
      )}
    </Menu>
  )
}
