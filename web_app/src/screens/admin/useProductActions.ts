import type { Product } from '../../types'
import type { TFn } from '../../lib/i18n'
import { downloadExcel, printPdf } from './productExports'

export function useProductActions({
  t,
  locale,
  currency,
  tenantName,
  visible,
  selected,
  selectedProducts,
  deleteProduct,
  clearSelection,
}: {
  t: TFn
  locale: string
  currency?: string
  tenantName?: string
  visible: Product[]
  selected: Set<string>
  selectedProducts: Product[]
  deleteProduct: (id: string) => void
  clearSelection: () => void
}) {
  const someSelected = selected.size > 0
  const exportScope = someSelected ? selectedProducts : visible
  const handleDelete = (product: Product) => {
    if (window.confirm(t('products.deleteConfirm', { name: product.name })))
      deleteProduct(product.id)
  }
  const bulkDelete = () => {
    if (
      !someSelected ||
      !window.confirm(
        t('products.bulkDeleteConfirm', {
          count: selected.size,
          plural: selected.size === 1 ? '' : 's',
        })
      )
    )
      return
    selectedProducts.forEach((product) => deleteProduct(product.id))
    clearSelection()
  }
  const formatPrice = (value: string) => {
    const number = parseFloat(value)
    return Number.isNaN(number)
      ? value
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency || 'UYU',
          maximumFractionDigits: 0,
        }).format(number)
  }
  return {
    handleDelete,
    bulkDelete,
    formatPrice,
    exportExcel: () => downloadExcel(exportScope, currency || 'UYU', t),
    exportPdf: () =>
      printPdf(
        exportScope,
        tenantName || t('products.catalog'),
        currency || 'UYU',
        t,
        locale
      ),
  }
}
