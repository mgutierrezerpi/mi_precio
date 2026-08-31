import type { PlanId, PlanInfo, Tenant } from '../../types'
import { PLANS, planById } from '../../lib/plans'
import { type TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { gradient, tone } from './crm/theme'

type Props = {
  t: TFn
  info: PlanInfo | null
  tenant: Tenant | null
  current: PlanId
  visiblePlan: PlanId
  pendingPlan: PlanId | null
  changing: PlanId | null
  isOwner: boolean
  onChoose: (plan: PlanId) => void
}

const LIMIT_KEYS = [
  ['products', 'bill.products'],
  ['lists', 'bill.lists'],
  ['members', 'bill.members'],
] as const

function limitLabel(t: TFn, value: number | null) {
  return value === null ? t('bill.unlimited') : String(value)
}

function Usage({ t, info, visiblePlan }: Pick<Props, 't' | 'info' | 'visiblePlan'>) {
  if (!info) return null
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] p-4">
      <span className="text-[13px] font-extrabold text-[var(--dash-text)]">{t('bill.usageTitle')}</span>
      {LIMIT_KEYS.map(([key, label]) => {
        const used = info.usage[key]
        const limit = planById(visiblePlan).limits[key]
        const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
        const full = limit !== null && used >= limit
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--dash-text2)]">{t(label)}</span>
              <span className={`font-bold ${full ? 'text-[#EF4444]' : 'text-[var(--dash-muted)]'}`}>
                {used} / {limitLabel(t, limit)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-soft)]">
              <div className="h-full rounded-full" style={{ width: limit ? `${percent}%` : '100%', background: full ? '#EF4444' : 'var(--tone-violet-fg)', opacity: limit ? 1 : 0.35 }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PlanCard({ t, plan, current, pendingPlan, changing, isOwner, onChoose }: Pick<Props, 't' | 'current' | 'pendingPlan' | 'changing' | 'isOwner' | 'onChoose'> & { plan: (typeof PLANS)[number] }) {
  const isCurrent = plan.id === current
  const isPending = plan.id === pendingPlan && !isCurrent
  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl border p-4 ${isCurrent || isPending ? 'border-[var(--dash-link)] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)]'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-extrabold text-[var(--dash-text)]">{plan.name}</span>
        {plan.popular && <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={tone('violet')}>{t('bill.recommended')}</span>}
      </div>
      <p className="text-[11px] font-medium text-[var(--dash-muted)]">{plan.description}</p>
      <div className="flex items-end gap-1"><span className="text-2xl font-black text-[var(--dash-text)]">{plan.price}</span><span className="pb-1 text-[11px] font-semibold text-[var(--dash-muted)]">{plan.cadence}</span></div>
      <ul className="flex flex-col gap-1.5 border-t border-[var(--dash-divider)] pt-3">
        {plan.features.map((feature) => <li key={feature} className="flex items-center gap-1.5 text-[12px]"><Icon name="circle-check" size={13} className="shrink-0 text-[var(--tone-green-fg)]" /><span className="font-medium text-[var(--dash-text2)]">{feature}</span></li>)}
      </ul>
      {isCurrent || isPending ? <span className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold" style={tone('violet')}><Icon name={isCurrent ? 'circle-check' : 'tags'} size={15} /> {t(isCurrent ? 'bill.current' : 'bill.pendingShort')}</span> : <button type="button" disabled={!isOwner || changing !== null} onClick={() => onChoose(plan.id)} className={`mt-auto flex h-9 items-center justify-center rounded-xl text-[13px] font-bold text-white disabled:opacity-50 ${gradient}`}>{changing === plan.id ? t('bill.changing') : t('bill.choose')}</button>}
    </div>
  )
}

export function BillingContent(props: Props) {
  const { t, info, visiblePlan, isOwner } = props
  return (
    <>
      <Usage t={t} info={info} visiblePlan={visiblePlan} />
      {info?.billing?.portalUrl && <a href={info.billing.portalUrl} target="_blank" rel="noreferrer" className="flex h-11 w-fit items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="tags" size={16} /> {t('bill.managePortal')}</a>}
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">{PLANS.map((plan) => <PlanCard key={plan.id} {...props} plan={plan} />)}</div>
      {!isOwner && <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]"><Icon name="alert-triangle" size={15} /> {t('bill.ownerOnly')}</div>}
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]"><Icon name="tags" size={15} /> {t('bill.paymentNote')}</div>
    </>
  )
}
