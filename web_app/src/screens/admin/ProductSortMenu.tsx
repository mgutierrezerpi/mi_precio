import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { Menu, MenuRow } from './ProductMenu'
import { SORT_OPTIONS, type SortKey } from './productScreenTypes'

export function ProductSortMenu({
  sort,
  onSort,
}: {
  sort: SortKey
  onSort: (value: SortKey) => void
}) {
  const t = useCatalogT()
  return (
    <Menu icon="arrow-up-down" label={t('products.sort')} width="w-60">
      {(close) =>
        SORT_OPTIONS.map((option) => (
          <MenuRow
            key={option.key}
            active={sort === option.key}
            onClick={() => {
              onSort(option.key)
              close()
            }}
          >
            {t(option.labelKey)}
          </MenuRow>
        ))
      }
    </Menu>
  )
}
