import type { RefObject } from 'react'
import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { tone } from './crm/theme'
import { Field } from './SettingsCrmShared'

export function InfoLogoField({
  canManage,
  fileRef,
  logo,
  onPick,
  onRemove,
  t,
}: {
  canManage: boolean
  fileRef: RefObject<HTMLInputElement | null>
  logo: string | null
  onPick: (file?: File) => void
  onRemove: () => void
  t: TFn
}) {
  return (
    <Field label={t('set.info.logo')}>
      <div className="flex items-center gap-4">
        <LogoPreview logo={logo} />
        {canManage && (
          <LogoControls
            fileRef={fileRef}
            logo={logo}
            onPick={onPick}
            onRemove={onRemove}
            t={t}
          />
        )}
      </div>
    </Field>
  )
}

function LogoPreview({ logo }: { logo: string | null }) {
  const previewClass =
    'flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden ' +
    'rounded-2xl border border-[var(--dash-border)]'
  return (
    <span
      className={previewClass}
      style={logo ? undefined : tone('violet')}
    >
      {logo ? (
        <img src={logo} alt="logo" className="h-full w-full object-contain" />
      ) : (
        <Icon name="package" size={28} />
      )}
    </span>
  )
}

function LogoControls({
  fileRef,
  logo,
  onPick,
  onRemove,
  t,
}: {
  fileRef: RefObject<HTMLInputElement | null>
  logo: string | null
  onPick: (file?: File) => void
  onRemove: () => void
  t: TFn
}) {
  const controlsClass =
    'flex h-9 items-center gap-2 rounded-[10px] border ' +
    'border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 ' +
    'text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'
  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={controlsClass}
      >
        <Icon name="upload" size={15} />{' '}
        {logo ? t('set.info.changeLogo') : t('set.info.uploadLogo')}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="text-[13px] font-bold text-[#EF4444] hover:underline"
      >
        {t('common.remove')}
      </button>
    </div>
  )
}
