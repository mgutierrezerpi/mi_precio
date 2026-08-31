import type { PriceList, Product } from '../../types'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { gradient } from './crm/theme'
import { Icon } from './crm/ui'
import { ProductModalFields } from './ProductModalFields'
import { useProductForm } from './useProductForm'

export function ProductModal({
  product,
  tenantId,
  lists,
  onClose,
  onCreated,
}: {
  product: Product | null
  tenantId?: string
  lists: PriceList[]
  onClose: () => void
  onCreated?: (product: Product) => void
}) {
  const t = useCatalogT()
  const form = useProductForm({ product, tenantId, lists, onClose, onCreated })
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={form.submit}
        className="max-h-[calc(100vh-32px)] w-full max-w-[460px] animate-scale-in overflow-auto rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
            {product ? t('products.editTitle') : t('products.new')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
          >
            ✕
          </button>
        </div>
        <ProductModalFields
          t={t}
          fileRef={form.fileRef}
          imageUrl={form.imageUrl}
          imageThumbUrl={form.imageThumbUrl}
          imgLoading={form.imgLoading}
          onPickImage={form.onPickImage}
          onRemoveImage={() => {
            form.setImageUrl('')
            form.setImageThumbUrl('')
          }}
          name={form.name}
          setName={form.setName}
          sku={form.sku}
          setSku={form.setSku}
          category={form.category}
          setCategory={form.setCategory}
          price={form.price}
          setPrice={form.setPrice}
          available={form.available}
          setAvailable={form.setAvailable}
          description={form.description}
          setDescription={form.setDescription}
          priceChanged={form.priceChanged}
          lists={lists}
          selectedLists={form.selectedLists}
          onToggleList={form.toggleList}
          onSelectAll={() =>
            form.setSelectedLists(new Set(lists.map((list) => list.id)))
          }
          onClearLists={() => form.setSelectedLists(new Set())}
        />
        {form.error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] font-semibold text-[#B91C1C]">
            <Icon name="alert-triangle" size={15} className="mt-0.5 shrink-0" />{' '}
            {form.error}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            {t('products.cancel')}
          </button>
          <button
            type="submit"
            disabled={form.saving}
            className={`flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
          >
            {form.saving
              ? t('products.saving')
              : product
                ? t('products.saveChanges')
                : t('products.create')}
          </button>
        </div>
      </form>
    </div>
  )
}
