import type { RefObject } from 'react'
import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'

export function ProductImageField({
  imageUrl,
  imageThumbUrl,
  loading,
  fileRef,
  onPick,
  onRemove,
  t,
}: {
  imageUrl: string
  imageThumbUrl: string
  loading: boolean
  fileRef: RefObject<HTMLInputElement | null>
  onPick: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  t: TFn
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {t('products.photo')}
      </span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] text-[var(--dash-muted)] hover:opacity-90"
        >
          {imageUrl ? (
            <img
              src={imageThumbUrl || imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon name="package" size={26} />
          )}
        </button>
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name="upload" size={15} />{' '}
            {loading
              ? t('products.loadingImage')
              : imageUrl
                ? t('products.changePhoto')
                : t('products.uploadPhoto')}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[12px] font-semibold text-[#EF4444] hover:underline"
            >
              {t('products.removePhoto')}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPick}
          className="hidden"
        />
      </div>
    </div>
  )
}
