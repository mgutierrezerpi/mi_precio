import type { ReactNode } from 'react'
import type { Tenant } from '../../types'
import { type TFn } from '../../lib/i18n'
import api from '../../services/api'
import { gradient } from './crm/theme'

export type SettingsContext = {
  tenant: Tenant | null
  canManage: boolean
  save: (
    patch: Parameters<typeof api.updateTenant>[1],
    key: string
  ) => Promise<void>
  savingKey: string | null
  savedKey: string | null
  t: TFn
}

export const inputClass =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

export function SectionHeader({
  t,
  title,
  subtitle,
  onSave,
  saving,
  saved,
  canManage,
  autosave,
}: {
  t: TFn
  title: string
  subtitle: string
  onSave?: () => void
  saving?: boolean
  saved?: boolean
  canManage: boolean
  autosave?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="text-[20px] font-extrabold text-[var(--dash-text)]">
          {title}
        </h3>
        <p className="text-xs font-medium text-[var(--dash-muted)]">
          {subtitle}
        </p>
      </div>
      {autosave && canManage && (saving || saved) && (
        <span
          className={`shrink-0 text-xs font-bold ${saving ? 'text-[var(--dash-muted)]' : 'text-[var(--tone-green-fg)]'}`}
        >
          {saving ? t('common.saving') : t('common.saved')}
        </span>
      )}
      {onSave && canManage && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`flex h-10 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
        >
          {saving
            ? t('common.saving')
            : saved
              ? t('common.saved')
              : t('common.save')}
        </button>
      )}
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </span>
      <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
        {value}
      </span>
    </div>
  )
}
