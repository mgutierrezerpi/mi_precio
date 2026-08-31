import { useState, type ChangeEvent, type ReactNode } from 'react'
import type { TFn } from '../../lib/i18n'
import { fileToDataUrl } from '../../lib/image'
import { Icon } from '../../screens/admin/crm/ui'
import type { SaveStatus } from './magazineEditorTypes'

export const inputClass =
  'w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2.5 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-violet-400'

export const IMAGE_POSITIONS = [
  ['center', 'magazines.imagePositionCenter'],
  ['top', 'magazines.imagePositionTop'],
  ['bottom', 'magazines.imagePositionBottom'],
  ['left', 'magazines.imagePositionLeft'],
  ['right', 'magazines.imagePositionRight'],
  ['top left', 'magazines.imagePositionTopLeft'],
  ['top right', 'magazines.imagePositionTopRight'],
  ['bottom left', 'magazines.imagePositionBottomLeft'],
  ['bottom right', 'magazines.imagePositionBottomRight'],
] as const

export function SaveStatus({ status, t }: { status: SaveStatus; t: TFn }) {
  const label =
    status === 'saving'
      ? t('magazines.autosaveSaving')
      : status === 'dirty'
        ? t('magazines.autosaveUnsaved')
        : status === 'error'
          ? t('magazines.autosaveError')
          : status === 'saved'
            ? t('magazines.autosaveSaved')
            : t('magazines.autosaveManual')
  const color =
    status === 'error'
      ? 'text-red-300'
      : status === 'saving'
        ? 'text-amber-300'
        : status === 'dirty'
          ? 'text-violet-300'
          : 'text-emerald-300'
  return (
    <p className={`mt-1 flex items-center gap-1.5 text-[11px] font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </p>
  )
}

export function ImageField({
  value,
  onChange,
  t,
}: {
  value: string
  onChange: (value: string) => void
  t: TFn
}) {
  const [reading, setReading] = useState(false)
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReading(true)
    try {
      onChange(await fileToDataUrl(file, 1600))
    } finally {
      setReading(false)
      event.target.value = ''
    }
  }
  return (
    <div className="flex flex-col gap-1.5">
      <input
        value={value.startsWith('/pencil/') ? '' : value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder="https://…"
      />
      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[var(--dash-link)] hover:underline">
        <Icon name="upload" size={13} />{' '}
        {reading ? t('magazines.loadingImage') : t('magazines.uploadImage')}
        <input type="file" accept="image/*" onChange={(event) => void handleFile(event)} className="sr-only" />
      </label>
    </div>
  )
}

export function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--dash-text2)]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-violet-500" />
      {children}
    </label>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--dash-text2)]">
      {label}
      {children}
    </label>
  )
}
