import { PLANS } from '../../lib/plans'
import type { PlanId, Tenant } from '../../types'
import type { TFn } from '../../lib/i18n'

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
)

interface ChoosePlanContentProps {
  choosing: PlanId | null
  checking: boolean
  confirming: boolean
  error: string | null
  expired: boolean
  isOwner: boolean
  noPaymentYet: boolean
  tenant: Tenant | null
  t: TFn
  onChoosePlan: (plan: PlanId) => void
  onLogout: () => void
  onRecheck: () => void
}

export function ChoosePlanContent({
  choosing, checking, confirming, error, expired, isOwner, noPaymentYet, tenant,
  t, onChoosePlan, onLogout, onRecheck,
}: ChoosePlanContentProps) {
  const confirmingClassName = [
    'mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-2xl border',
    'border-[#DDD6FE] bg-white px-4 py-3 text-sm font-semibold text-[#5B21B6]',
  ].join(' ')
  const errorClassName = [
    'mx-auto w-full max-w-xl rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-center',
    'text-sm font-medium text-[#DC2626]',
  ].join(' ')
  const ownerOnlyClassName = [
    'mx-auto w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4',
    'text-center text-sm font-semibold text-[#475569]',
  ].join(' ')
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-white px-4 py-10 font-sans sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <img src="/miprecio-logo-pencil.webp" alt="Mi Precio" className="h-9 w-auto" />
          <button type="button" onClick={onLogout} className="text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0F172A]">
            {t('gate.logout')}
          </button>
        </header>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[#0F172A] sm:text-[34px]">
            {t('gate.title')}
          </h1>
          <p className="text-[15px] font-medium text-[#64748B]">
            {expired ? t('gate.expired') : t('gate.subtitle', { name: tenant?.name || '' })}
          </p>
        </div>
        {confirming && <div className={confirmingClassName}>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DDD6FE] border-t-[#7C3AED]" />
          {t('gate.confirming')}
        </div>}
        {error && <p className={errorClassName}>{error}</p>}
        {!isOwner ? <p className={ownerOnlyClassName}>{t('gate.ownerOnly')}</p> : <>
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                choosing={choosing}
                t={t}
                onChoosePlan={onChoosePlan}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-[12px] font-medium text-[#94A3B8]">{t('gate.trialNote')}</p>
            <button
              type="button"
              disabled={checking}
              onClick={onRecheck}
              className="text-[13px] font-bold text-[#7C3AED] hover:underline disabled:opacity-60 disabled:no-underline"
            >
              {checking ? t('gate.rechecking') : t('gate.recheck')}
            </button>
            {noPaymentYet && <p className="max-w-md text-center text-[12px] font-semibold text-[#B45309]">{t('gate.recheckEmpty')}</p>}
          </div>
        </>}
      </div>
    </div>
  )
}

type PlanCardProps = Pick<ChoosePlanContentProps, 'choosing' | 't' | 'onChoosePlan'> & {
  plan: (typeof PLANS)[number]
}

function PlanCard({ plan, choosing, t, onChoosePlan }: PlanCardProps) {
  const cardClassName = [
    'flex flex-col gap-3 rounded-3xl border bg-white p-6 shadow-[0_18px_50px_-30px_rgba(30,27,75,0.4)]',
    plan.popular ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/15' : 'border-[#E2E8F0]',
  ].join(' ')
  const chooseButtonClassName = [
    'mt-auto flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED]',
    'to-[#A855F7] text-[14px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(124,58,237,0.5)]',
    'transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' ')
  return <div className={cardClassName}>
    <div className="flex items-center justify-between gap-2">
      <span className="text-[17px] font-extrabold text-[#0F172A]">{plan.name}</span>
      {plan.popular && (
        <span className="shrink-0 rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
          {t('bill.recommended')}
        </span>
      )}
    </div>
    <p className="text-[12px] font-medium leading-relaxed text-[#64748B]">{plan.description}</p>
    <div className="flex items-end gap-1.5">
      <span className="text-[30px] font-black leading-none text-[#0F172A]">{plan.price}</span>
      <span className="pb-0.5 text-[12px] font-semibold text-[#94A3B8]">{plan.cadence}</span>
    </div>
    {plan.trialLabel && <span className="w-fit rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#047857]">{plan.trialLabel}</span>}
    <ul className="flex flex-col gap-2 border-t border-[#F1F5F9] pt-4">
      {plan.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-[13px]">
        <span className="text-[#10B981]"><CheckIcon /></span>
        <span className="font-medium text-[#475569]">{feature}</span>
      </li>)}
    </ul>
    <button
      type="button"
      disabled={choosing !== null}
      onClick={() => onChoosePlan(plan.id)}
      className={chooseButtonClassName}
    >
      {choosing === plan.id ? t('gate.opening') : t('gate.choose')}
    </button>
  </div>
}
