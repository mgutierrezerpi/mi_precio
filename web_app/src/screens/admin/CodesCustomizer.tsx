import type { TFn } from '../../lib/i18n'
import { downloadQrPng, downloadQrSvg } from '../../lib/qrRender'
import { QrCode } from './crm/QrCode'
import { Icon } from './crm/ui'
import { gradient } from './crm/theme'

interface QrColor { key: string; value: string }

interface CodesCustomizerProps {
  color: string
  colors: QrColor[]
  hasLists: boolean
  logoUrl: string | null
  previewUrl: string
  subdomain: string
  t: TFn
  withLogo: boolean
  onChooseColor: (color: string) => void
  onToggleLogo: () => void
}

export function CodesCustomizer({
  color, colors, hasLists, logoUrl, previewUrl, subdomain, t, withLogo, onChooseColor, onToggleLogo,
}: CodesCustomizerProps) {
  const panelClassName = [
    'flex w-full shrink-0 flex-col gap-4 self-start rounded-xl border border-[var(--dash-border)]',
    'bg-[var(--dash-surface)] p-4 xl:mt-0 xl:sticky xl:top-6 xl:w-[300px]',
  ].join(' ')
  const disabledMessage = hasLists ? '' : t('codes.downloadDisabled')
  const selectedColorClassName =
    'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)] ring-[var(--dash-link)]'
  const logoControlClassName = [
    'flex items-center justify-between overflow-hidden rounded-[12px] border',
    'border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 py-3',
  ].join(' ')
  return <div className={panelClassName}>
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{t('codes.customize')}</h3>
      <p className="text-xs font-medium text-[var(--dash-muted)]">{t('codes.customizeHelp')}</p>
    </div>
    <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-white p-1">
      <QrCode value={previewUrl} size={128} margin={2} fg={color} logoUrl={logoUrl} className="!h-full !w-full rounded-lg object-contain" />
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">{t('codes.color')}</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((option) => <button
          key={option.value}
          type="button"
          onClick={() => onChooseColor(option.value)}
          aria-label={t(`codes.color.${option.key}`)}
          title={t(`codes.color.${option.key}`)}
          className={`h-7 w-7 rounded-lg ${
            color === option.value ? selectedColorClassName : ''
          }`}
          style={{ backgroundColor: option.value }}
        />)}
      </div>
    </div>
    <div className={logoControlClassName}>
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">{t('codes.logoCenter')}</span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">{t('codes.logoHelp')}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={withLogo}
        onClick={onToggleLogo}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          withLogo ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${withLogo ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
    <DownloadButton
      disabled={!hasLists}
      tooltip={disabledMessage}
      className={`text-white ${gradient}`}
      onClick={() => void downloadQrPng(previewUrl, `qr-${subdomain}.png`, { fg: color, logoUrl })}
      label={t('codes.downloadPng')}
    />
    <DownloadButton
      disabled={!hasLists}
      tooltip={disabledMessage}
      className="border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      onClick={() => void downloadQrSvg(previewUrl, `qr-${subdomain}.svg`, { fg: color })}
      label={t('codes.downloadSvg')}
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
