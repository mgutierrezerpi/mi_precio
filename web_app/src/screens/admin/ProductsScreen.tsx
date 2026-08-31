import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import {
  deleteProduct,
  selectProducts,
  selectProductsLoading,
  updateProduct,
} from '../../store/slices/productsSlice'
import { selectLists } from '../../store/slices/menuSlice'
import type { Product } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { localeOf } from '../../lib/i18n'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { ProductToolbar } from './ProductToolbar'
import { ProductBulkActions } from './ProductBulkActions'
import { ProductPagination } from './ProductPagination'
import { ProductTable } from './ProductTable'
import { useProductFilters } from './useProductFilters'
import { useProductSelection } from './useProductSelection'
import { useProductActions } from './useProductActions'
import { ProductScreenHeading } from './ProductScreenHeading'
import { ProductModalHost } from './ProductModalHost'
import { useProductLoading } from './useProductLoading'

export function ProductsScreen() {
  const t = useCatalogT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const products = useAppSelector(selectProducts)
  const lists = useAppSelector(selectLists)
  const loading = useAppSelector(selectProductsLoading)
  const locale = localeOf(tenant?.language)
  const filters = useProductFilters(products, tenant?.id)
  const selection = useProductSelection(products, filters.visible)
  const [modal, setModal] = useState<{
    open: boolean
    product: Product | null
  }>(() => ({ open: false, product: null }))
  useProductLoading(tenant?.id)
  const actions = useProductActions({
    t,
    locale,
    currency: tenant?.currency,
    tenantName: tenant?.name,
    visible: filters.visible,
    selected: selection.selected,
    selectedProducts: selection.selectedProducts,
    deleteProduct: (id) => dispatch(deleteProduct(id)),
    clearSelection: selection.clearSelection,
  })
  const closeModal = () => setModal({ open: false, product: null })
  return (
    <CrmLayout
      active={t('products.title')}
      title={t('products.title')}
      subtitle={t('products.subtitle')}
      hideContext
      searchPlaceholder={t('products.search')}
      searchValue={filters.search}
      onSearchChange={(value) =>
        filters.resetTo(() => filters.setSearch(value))
      }
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[980px]">
        <ProductScreenHeading t={t} />
        <div className="flex flex-col gap-4">
          <ProductToolbar
            status={filters.status}
            category={filters.category}
            categories={filters.categories}
            sort={filters.sort}
            priceMin={filters.priceMin}
            priceMax={filters.priceMax}
            canEdit={canEdit}
            count={
              selection.someSelected
                ? selection.selected.size
                : filters.visible.length
            }
            scoped={selection.someSelected}
            onStatus={filters.setStatus}
            onCategory={filters.setCategory}
            onSort={filters.setSort}
            onPriceMin={filters.setPriceMin}
            onPriceMax={filters.setPriceMax}
            onClear={filters.clearFilters}
            onExcel={actions.exportExcel}
            onPdf={actions.exportPdf}
            onNew={() => setModal({ open: true, product: null })}
            reset={filters.resetTo}
          />
          {selection.someSelected && (
            <ProductBulkActions
              count={selection.selected.size}
              canEdit={canEdit}
              onDelete={actions.bulkDelete}
              onClear={selection.clearSelection}
            />
          )}
          <ProductTable
            products={filters.pageItems}
            loading={loading}
            hasProducts={products.length > 0}
            selected={selection.selected}
            allSelected={selection.allSelected}
            someSelected={selection.someSelected}
            canEdit={canEdit}
            locale={locale}
            formatPrice={actions.formatPrice}
            onSelectAll={selection.toggleSelectAll}
            onSelect={selection.toggleSelect}
            onToggle={(product) =>
              dispatch(
                updateProduct({
                  productId: product.id,
                  data: { available: !product.available },
                })
              )
            }
            onEdit={(product) => setModal({ open: true, product })}
            onDelete={actions.handleDelete}
            t={t}
          />
          <ProductPagination
            page={filters.safePage}
            totalPages={filters.totalPages}
            pageSize={filters.pageSize}
            shown={filters.pageItems.length}
            total={filters.visible.length}
            onPage={filters.setPage}
            onPageSize={filters.setPageSize}
            t={t}
          />
        </div>
      </main>
      <ProductModalHost
        open={modal.open}
        product={modal.product}
        tenantId={tenant?.id}
        lists={lists}
        onClose={closeModal}
      />
    </CrmLayout>
  )
}
export { ProductModal } from './ProductModal'
export default ProductsScreen
