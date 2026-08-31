import type { TFn } from '../../lib/i18n'
import type { PriceList } from '../../types'
import { QrCode } from './crm/QrCode'
import { Icon } from './crm/ui'

interface CodesGridProps {
  allCount: number
  color: string
  copied: string | null
  filtered: PriceList[]
  t: TFn
  urlOf: (list: PriceList) => string
  qrUrlOf: (list: PriceList) => string
  onCopy: (list: PriceList) => void
  onDownload: (list: PriceList) => void
}

export function CodesGrid({
  allCount, color, copied, filtered, t, urlOf, qrUrlOf, onCopy, onDownload,
}: CodesGridProps) {
  if (!filtered.length) return <EmptyCodes hasLists={allCount > 0} t={t} />
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {filtered.map((list) => <QrCard
      key={list.id}
      list={list}
      color={color}
      copied={copied === list.id}
      t={t}
      urlOf={urlOf}
      qrUrlOf={qrUrlOf}
      onCopy={onCopy}
      onDownload={onDownload}
    />)}
  </div>
}

function EmptyCodes({ hasLists, t }: { hasLists: boolean; t: TFn }) {
  const emptyClassName = [
    'flex min-h-[208px] flex-col items-center justify-center gap-3 rounded-xl border',
    'border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-center',
  ].join(' ')
  return <div className={emptyClassName}>
    <span
      className="flex h-12 w-12 items-center justify-center rounded-xl text-[var(--dash-link)]"
      style={{ backgroundColor: 'var(--tone-violet-bg)' }}
    >
      <Icon name="qr-code" size={24} />
    </span>
    <p className="text-sm font-semibold text-[var(--dash-text)]">
      {hasLists ? t('codes.noResults') : t('codes.createList')}
    </p>
  </div>
}

interface QrCardProps extends Omit<CodesGridProps, 'allCount' | 'copied' | 'filtered'> {
  copied: boolean
  list: PriceList
}

function QrCard({
  list, color, copied, t, urlOf, qrUrlOf, onCopy, onDownload,
}: QrCardProps) {
  return <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
    <div className="flex min-w-0 items-center justify-center text-center">
      <span className="block w-full whitespace-normal break-words text-[14px] font-bold leading-snug text-[var(--dash-text)]">{list.name}</span>
    </div>
    <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-white p-1">
      <QrCode value={qrUrlOf(list)} size={128} margin={2} fg={color} className="!h-full !w-full rounded-lg object-contain" />
    </div>
    <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{
          backgroundColor: list.published ? 'var(--tone-green-bg)' : 'var(--tone-amber-bg)',
          color: list.published ? 'var(--tone-green-fg)' : 'var(--tone-amber-fg)',
        }}
      >
        {list.published ? t('codes.active') : t('codes.draft')}
      </span>
    </div>
    <div className="flex items-center justify-center gap-2">
      <CardButton icon="download" title={t('codes.downloadPng')} onClick={() => onDownload(list)} />
      <CardButton icon="share-2" title={t('codes.openList')} onClick={() => window.open(urlOf(list), '_blank')} />
      <CardButton icon={copied ? 'circle-check' : 'copy'} title={t('codes.copyLink')} onClick={() => onCopy(list)} />
    </div>
  </div>
}

function CardButton({ icon, title, onClick }: {
  icon: Parameters<typeof Icon>[0]['name']; title: string; onClick: () => void
}) {
  const className = [
    'flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)]',
    'bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
  ].join(' ')
  return <button type="button" title={title} onClick={onClick} className={className}>
    <Icon name={icon} size={16} />
  </button>
}
