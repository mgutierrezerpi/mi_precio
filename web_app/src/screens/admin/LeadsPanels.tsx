import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { gradient, tone } from './crm/theme'

export function EmptyLeads({ t }: { t: TFn }) {
  const emptyClassName = [
    'flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border',
    'border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-center',
  ].join(' ')
  return <div className={emptyClassName}>
    <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={tone('violet')}>
      <Icon name="users" size={24} />
    </span>
    <p className="text-sm font-bold text-[var(--dash-text)]">{t('leads.empty')}</p>
    <p className="max-w-[42ch] text-xs font-medium text-[var(--dash-muted)]">{t('leads.emptyHelp')}</p>
  </div>
}

export function LeadsUpsell({ onSeePlans, t }: { onSeePlans: () => void; t: TFn }) {
  return <div className={`flex flex-col items-start gap-3 rounded-xl p-6 text-white ${gradient}`}>
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
      <Icon name="users" size={22} />
    </span>
    <p className="text-lg font-extrabold">{t('leads.upsellTitle')}</p>
    <p className="max-w-[52ch] text-sm font-medium text-white/85">{t('leads.upsellBody')}</p>
    <button type="button" onClick={onSeePlans} className="mt-1 flex h-10 items-center rounded-lg bg-white px-4 text-[13px] font-bold text-[#7C3AED]">
      {t('leads.upsellCta')}
    </button>
  </div>
}
