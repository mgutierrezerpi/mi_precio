import type { PriceList } from '../../types'
import type { VisitStats } from '../../services/api'
import type { TFn } from '../../lib/i18n'
import { QrCode } from './crm/QrCode'
import { Icon } from './crm/ui'
import { gradient, tone } from './crm/theme'

export function DashboardHero({
  copied,
  goCreateList,
  goQr,
  onCopy,
  principalList,
  publicUrlDisplay,
  qrColor,
  qrList,
  qrUrl,
  visits,
  t,
}: {
  copied: boolean
  goCreateList: () => void
  goQr: () => void
  onCopy: () => void
  principalList: PriceList | null
  publicUrlDisplay: string
  qrColor: string
  qrList: PriceList | null
  qrUrl: string
  visits: VisitStats | null
  t: TFn
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row">
      <QrHeroCard goQr={goQr} qrColor={qrColor} qrList={qrList} qrUrl={qrUrl} t={t} />
      {principalList ? (
        <PublicListCard urlDisplay={publicUrlDisplay} onCopy={onCopy} copied={copied} visits={visits} />
      ) : (
        <CreateListCard onCreate={goCreateList} />
      )}
    </section>
  )
}

function QrHeroCard({
  goQr,
  qrColor,
  qrList,
  qrUrl,
  t,
}: {
  goQr: () => void
  qrColor: string
  qrList: PriceList | null
  qrUrl: string
  t: TFn
}) {
  return (
    <div className={`flex min-h-[208px] flex-1 flex-col justify-center gap-4 rounded-xl p-5 text-white sm:flex-row sm:items-center sm:justify-between ${gradient}`}>
      <div className="flex max-w-[420px] flex-col gap-2">
        <p className="text-[13px] font-semibold text-[#E9D5FF]">{t('analytics.shareCatalog')}</p>
        <h3 className="text-[26px] font-bold leading-tight">{t('analytics.shareCatalogTitle')}</h3>
        <p className="text-sm leading-relaxed text-[#E9D5FF]">{qrList ? t('analytics.qrReady') : t('analytics.createQrDescription')}</p>
        <button type="button" onClick={goQr} className="btn btn-sm mt-1 flex h-10 w-fit items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-[#7C3AED]">
          <Icon name="qr-code" size={16} /> {qrList ? t('analytics.downloadQrCode') : t('analytics.createQr')}
        </button>
      </div>
      <button type="button" onClick={goQr} title={t('analytics.viewQrs')} className="flex h-[180px] w-[180px] shrink-0 items-center justify-center self-center rounded-[14px] bg-white p-1">
        <QrCode value={qrUrl} size={176} margin={1} fg={qrColor} className="h-full w-full object-contain" />
      </button>
    </div>
  )
}

function CreateListCard({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[208px] w-full shrink-0 flex-col justify-center gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 xl:w-[292px]">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white ${gradient}`}><Icon name="list-plus" size={19} /></span>
        <div className="flex min-w-0 flex-col gap-1"><p className="text-lg font-bold text-[var(--dash-text)]">Tu lista pública</p><p className="text-[13px] leading-relaxed text-[var(--dash-muted)]">Creá una lista principal para compartir tu catálogo.</p></div>
      </div>
      <button type="button" onClick={onCreate} className={`flex h-10 w-full items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-bold text-white ${gradient}`}><Icon name="plus" size={16} /> Crear lista</button>
    </div>
  )
}

function PublicListCard({
  urlDisplay,
  onCopy,
  copied,
  visits,
}: {
  urlDisplay: string
  onCopy: () => void
  copied: boolean
  visits: VisitStats | null
}) {
  return (
    <div className="flex w-full shrink-0 flex-col justify-evenly gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 xl:w-[292px] xl:gap-0">
      <p className="text-xl font-extrabold text-[var(--dash-text)]">Tu lista pública</p>
      <button type="button" onClick={onCopy} title="Copiar enlace" className="flex h-10 items-center gap-2 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-left text-[var(--dash-link)] hover:opacity-90"><Icon name="link-2" size={16} /><span className="flex-1 truncate text-sm font-semibold">{urlDisplay}</span><Icon name={copied ? 'circle-check' : 'copy'} size={16} /></button>
      <div className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-[var(--dash-text2)]"><Icon name="eye" size={14} className="text-[var(--dash-link)]" /><span className="text-[13px] font-bold">Hoy: {visits?.today ?? 0}</span></div>
      <div className="flex h-10 w-full items-center gap-2 rounded-[10px] px-3" style={tone((visits?.changePct ?? 0) >= 0 ? 'green' : 'red')}><Icon name="trending-up" size={14} className={(visits?.changePct ?? 0) < 0 ? 'scale-y-[-1]' : ''} /><span className="text-[13px] font-bold">{(visits?.changePct ?? 0) >= 0 ? '+' : ''}{visits?.changePct ?? 0}% vs ayer</span></div>
    </div>
  )
}
