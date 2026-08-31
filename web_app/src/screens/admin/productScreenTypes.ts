export type Status = 'all' | 'available' | 'unavailable' | 'nophoto' | 'recent'

export type SortKey =
  'recent' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

export const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
  { key: 'recent', labelKey: 'products.sortRecent' },
  { key: 'name-asc', labelKey: 'products.sortNameAsc' },
  { key: 'name-desc', labelKey: 'products.sortNameDesc' },
  { key: 'price-asc', labelKey: 'products.sortPriceAsc' },
  { key: 'price-desc', labelKey: 'products.sortPriceDesc' },
]
