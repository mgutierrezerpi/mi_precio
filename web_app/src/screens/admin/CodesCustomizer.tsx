import type { TFn } from '../../lib/i18n'
import type { PriceList } from '../../types'
import { QrCode } from './crm/QrCode'
import { Icon } from './crm/ui'
import { gradient } from './crm/theme'

interface QrColor { key: string; value: string }

interface CodesCustomizerProps {
  color: string
  colors: QrColor[]
  busy: 'png' | 'svg' | null
  hasLists: boolean
  previewList: PriceList | null
  previewUrl: string
  t: TFn
  onChooseColor: (color: string) => void
  onDownload: (list: PriceList | null, as: 'png' | 'svg') => void
}

export function CodesCustomizer({
  color, colors, busy, hasLists, previewList, previewUrl, t, onChooseColor, onDownload,
}: CodesCustomizerProps) {
  const panelClassName = [
    'flex w-full shrink-0 flex-col gap-4 self-start rounded-xl border border-[var(--dash-border)]',
    'bg-[var(--dash-surface)] p-4 xl:mt-0 xl:sticky xl:top-6 xl:w-[300px]',
  ].join(' ')
  const disabledMessage = hasLists ? '' : t('codes.downloadDisabled')
  const selectedColorClassName =
    'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)] ring-[var(--dash-link)]'
  return <div className={panelClassName}>
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{t('codes.posterTitle')}</h3>
      <p className="text-xs font-medium text-[var(--dash-muted)]">{t('codes.posterHelp')}</p>
    </div>
    <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-white p-1">
      <QrCode value={previewUrl} size={128} margin={2} fg={color} className="!h-full !w-full rounded-lg object-contain" />
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">{t('codes.color')}</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((option) => <button
          key={option.value}
          type="button"
          onClick={() => onChooseColor(option.value)}
          aria-label={t(`codes.color.${option.key}`)}
          aria-pressed={color === option.value}
          title={t(`codes.color.${option.key}`)}
          className={`h-7 w-7 rounded-lg ${
            color === option.value ? selectedColorClassName : ''
          }`}
          style={{ backgroundColor: option.value }}
        />)}
      </div>
      <span className="text-[11px] font-medium text-[var(--dash-muted)]">{t('codes.colorHelp')}</span>
    </div>
    <DownloadButton
      disabled={!hasLists || busy !== null}
      tooltip={disabledMessage}
      className={`text-white ${gradient}`}
      onClick={() => onDownload(previewList, 'png')}
      label={busy === 'png' ? t('codes.posterWorking') : t('codes.downloadPng')}
    />
    <DownloadButton
      disabled={!hasLists || busy !== null}
      tooltip={disabledMessage}
      className="border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      onClick={() => onDownload(previewList, 'svg')}
      label={busy === 'svg' ? t('codes.posterWorking') : t('codes.downloadSvg')}
    />
  </div>
}

function DownloadButton({ disabled, tooltip, className, onClick, label }: {
  disabled: boolean; tooltip: string; className: string; onClick: () => void; label: string
}) {
  const buttonClassName = [
    'flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold',
    'disabled:cursor-not-allowed disabled:opacity-40',
    className,
  ].join(' ')
  return <span className="dash-tooltip block" data-tooltip={tooltip}>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      <Icon name="download" size={16} /> {label}
    </button>
  </span>
}
