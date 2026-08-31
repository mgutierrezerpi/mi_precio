import type { RefObject } from 'react'
import type { PriceList } from '../../types'
import type { TFn } from '../../lib/i18n'
import { gradient } from './crm/theme'
import { ProductImageField } from './ProductImageField'
import { ProductPriceLists } from './ProductPriceLists'

export const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export function ProductModalFields({
  t,
  fileRef,
  imageUrl,
  imageThumbUrl,
  imgLoading,
  onPickImage,
  onRemoveImage,
  name,
  setName,
  sku,
  setSku,
  category,
  setCategory,
  price,
  setPrice,
  available,
  setAvailable,
  description,
  setDescription,
  priceChanged,
  lists,
  selectedLists,
  onToggleList,
  onSelectAll,
  onClearLists,
}: {
  t: TFn
  fileRef: RefObject<HTMLInputElement | null>
  imageUrl: string
  imageThumbUrl: string
  imgLoading: boolean
  onPickImage: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
  name: string
  setName: (value: string) => void
  sku: string
  setSku: (value: string) => void
  category: string
  setCategory: (value: string) => void
  price: string
  setPrice: (value: string) => void
  available: boolean
  setAvailable: (value: boolean) => void
  description: string
  setDescription: (value: string) => void
  priceChanged: boolean
  lists: PriceList[]
  selectedLists: Set<string>
  onToggleList: (id: string) => void
  onSelectAll: () => void
  onClearLists: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <ProductImageField
        imageUrl={imageUrl}
        imageThumbUrl={imageThumbUrl}
        loading={imgLoading}
        fileRef={fileRef}
        onPick={onPickImage}
        onRemove={onRemoveImage}
        t={t}
      />
      <Field label={t('products.name')}>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('products.namePlaceholder')}
          className={inputCls}
          required
        />
      </Field>
      <div className="flex gap-3">
        <Field label="SKU">
          <input
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            placeholder="TOR-001"
            className={inputCls}
          />
        </Field>
        <Field label={t('products.category')}>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={t('products.categoryPlaceholder')}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="flex gap-3">
        <Field label={t('products.price')}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
        <Field label={t('products.availability')}>
          <div className="flex h-11 items-center gap-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-1">
            <button
              type="button"
              onClick={() => setAvailable(true)}
              className={`h-full flex-1 rounded-lg text-xs font-bold transition ${available ? `text-white ${gradient}` : 'text-[var(--dash-text2)]'}`}
            >
              {t('products.available')}
            </button>
            <button
              type="button"
              onClick={() => setAvailable(false)}
              className={`h-full flex-1 rounded-lg text-xs font-bold transition ${!available ? 'bg-[#EF4444] text-white' : 'text-[var(--dash-text2)]'}`}
            >
              {t('products.unavailable')}
            </button>
          </div>
        </Field>
      </div>
      <Field label={t('products.description')}>
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('products.descriptionPlaceholder')}
          className={inputCls}
        />
      </Field>
      {priceChanged && (
        <ProductPriceLists
          lists={lists}
          selected={selectedLists}
          onToggle={onToggleList}
          onSelectAll={onSelectAll}
          onClear={onClearLists}
          t={t}
        />
      )}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}
