import type { TFn } from '../../lib/i18n'
import { BRAND_SWATCHES } from '../../lib/listAppearance'
import { Field, inputCls } from './SettingsCrmShared'

export function BrandIdentityFields({
  canManage,
  changeColor,
  changeDescription,
  color,
  description,
  t,
}: {
  canManage: boolean
  changeColor: (value: string) => void
  changeDescription: (value: string) => void
  color: string
  description: string
  t: TFn
}) {
  return (
    <>
      <BrandColorField
        canManage={canManage}
        color={color}
        onChange={changeColor}
        t={t}
      />
      <Field label={t('set.brand.desc')}>
        <textarea
          value={description}
          onChange={(e) => changeDescription(e.target.value)}
          disabled={!canManage}
          rows={3}
          placeholder={t('set.brand.descPlaceholder')}
          className={`${inputCls} h-auto py-2.5`}
        />
      </Field>
    </>
  )
}

function BrandColorField({
  canManage,
  color,
  onChange,
  t,
}: {
  canManage: boolean
  color: string
  onChange: (value: string) => void
  t: TFn
}) {
  const selected = color.toUpperCase()
  return (
    <Field label={t('set.brand.color')}>
      <span className="-mt-1 block text-[11px] font-medium leading-snug text-[var(--dash-muted)]">
        {t('set.brand.colorSub')}
      </span>
      <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
        {BRAND_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            disabled={!canManage}
            onClick={() => onChange(swatch)}
            title={swatch}
            className={`h-8 w-8 shrink-0 rounded-full transition ${
              selected === swatch
                ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)]'
                : ''
            }`}
            style={{
              backgroundColor: swatch,
              boxShadow:
                selected === swatch ? `0 0 0 2px ${swatch}` : undefined,
            }}
          />
        ))}
        <span className="mx-1 h-6 w-px bg-[var(--dash-border)]" />
        <input
          type="color"
          value={color}
          disabled={!canManage}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-8 w-10 cursor-pointer rounded border
            border-[var(--dash-border)] bg-transparent disabled:opacity-60"
        />
        <input
          value={color}
          disabled={!canManage}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className={`${inputCls} h-8 w-28 font-mono`}
        />
      </div>
    </Field>
  )
}
