import { Icon } from './crm/ui'
import { gradient, tone } from './crm/theme'
import { useOperationsT } from './supportTranslation'

export function SupportHeader() {
  const t = useOperationsT()
  return <section className="flex min-h-[60px] flex-col justify-center gap-1">
    <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">{t('support.title')}</h1>
    <p className="text-[13px] text-[#9694A6]">{t('support.subtitle')}</p>
  </section>
}

export function TicketSuccess({ email, ticketId, onReset }: {
  email?: string; ticketId: number | string; onReset: () => void
}) {
  const t = useOperationsT()
  return <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-full" style={tone('green')}>
      <Icon name="circle-check" size={28} />
    </span>
    <h3 className="text-xl font-extrabold text-[var(--dash-text)]">{t('support.sent')}</h3>
    <p className="max-w-[440px] text-sm font-medium text-[var(--dash-text2)]">
      {ticketId && <>{t('support.registered')} <span className="font-bold text-[var(--dash-text)]">#{ticketId}</span>. </>}
      {t('support.replyTo')} <span className="font-bold text-[var(--dash-text)]">{email}</span>.
    </p>
    <button
      type="button"
      onClick={onReset}
      className={`mt-2 flex h-10 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}
    >
      <Icon name="plus" size={16} /> {t('support.openAnother')}
    </button>
  </div>
}
