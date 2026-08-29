import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  logout,
  selectIsAuthenticated,
  selectIsOwner,
  selectNeedsPlan,
  selectTenant,
  setTenant,
} from '../../store/slices/authSlice'
import type { PlanId, PlanInfo } from '../../types'
import api from '../../services/api'
import { useT } from '../../lib/i18n'
import { PLANS } from '../../lib/plans'

/** How long we keep polling for the Lemon Squeezy webhook after the checkout
 *  sends the user back here (20 × 3s ≈ 1 minute). */
const CONFIRM_POLL_MS = 3000
const CONFIRM_POLL_TRIES = 20

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
)

/**
 * Blocking plan screen: a new signup lands here instead of the CRM and only
 * gets out once the tenant has a paid plan (see `selectNeedsPlan` and, on the
 * API side, `plans_context.plan_required`).
 */
export function ChoosePlanScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const needsPlan = useAppSelector(selectNeedsPlan)
  const isOwner = useAppSelector(selectIsOwner)

  const [info, setInfo] = useState<PlanInfo | null>(null)
  const [choosing, setChoosing] = useState<PlanId | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [checking, setChecking] = useState(false)
  const [noPaymentYet, setNoPaymentYet] = useState(false)
  const [returnedOrderId, setReturnedOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const tenantId = tenant?.id
  const pollsLeft = useRef(CONFIRM_POLL_TRIES)

  /** Re-read the plan; when the gate is lifted, refresh the stored tenant so
   *  the route guard lets the user through. Returns whether the gate lifted. */
  const check = useCallback(async () => {
    if (!tenantId) return false
    const res = await api.getPlan(tenantId)
    if (!res.data) return false
    setInfo(res.data)
    if (res.data.planRequired !== false) return false
    const fresh = await api.getTenant(tenantId)
    if (fresh.data) dispatch(setTenant(fresh.data))
    return true
  }, [dispatch, tenantId])

  /** "Ya pagué": ask the API again, and say so when the payment still isn't
   *  there — otherwise the button looks broken. */
  const recheck = async () => {
    setChecking(true)
    setNoPaymentYet(false)
    setConfirming(false)
    const unlocked = await check()
    setChecking(false)
    if (!unlocked) setNoPaymentYet(true)
  }

  // Coming back from the checkout: LemonSqueezy redirects here with the plan.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const { checkout_plan: returned, order_id: orderId } =
      Object.fromEntries(params)
    if (!returned) return
    setReturnedOrderId(orderId ?? null)
    setConfirming(true)
    params.delete('checkout_plan')
    params.delete('order_id')
    const qs = params.toString()
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${qs ? `?${qs}` : ''}`
    )
  }, [])

  useEffect(() => {
    if (!tenantId || !returnedOrderId) return
    void api.reconcileCheckout(tenantId, returnedOrderId).then(() => check())
  }, [check, returnedOrderId, tenantId])

  useEffect(() => {
    void check()
  }, [check])

  // While confirming, poll until the webhook lands (or we give up and let the
  // user retry by hand).
  useEffect(() => {
    if (!confirming) return
    pollsLeft.current = CONFIRM_POLL_TRIES
    const id = setInterval(() => {
      pollsLeft.current -= 1
      if (pollsLeft.current <= 0) {
        setConfirming(false)
        return
      }
      void check()
    }, CONFIRM_POLL_MS)
    return () => clearInterval(id)
  }, [check, confirming])

  if (!isAuthenticated) return <Navigate to="/" replace />
  // Plan already active (or this tenant predates the gate): nothing to do here.
  if (!needsPlan) return <Navigate to="/admin" replace />

  const choosePlan = async (plan: PlanId) => {
    if (!tenantId) return
    setChoosing(plan)
    setError(null)

    // No payment gateway configured (local dev): activate the plan right away
    // so the whole flow is testable without Lemon Squeezy credentials.
    if (!info?.billingEnabled) {
      const res = await api.updatePlan(tenantId, plan)
      setChoosing(null)
      if (!res.data) {
        setError(res.error || 'No se pudo activar el plan.')
        return
      }
      await check()
      return
    }

    const redirectUrl = `${window.location.origin}/plans?checkout_plan=${plan}&order_id=[order_id]`
    const res = await api.createCheckout(tenantId, plan, redirectUrl)
    setChoosing(null)
    if (res.data?.url) window.location.assign(res.data.url)
    else setError(res.error || 'No se pudo abrir el checkout.')
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  // A tenant that already had a subscription is here because it ended, not
  // because it never picked a plan.
  const expired = !!info?.billing?.status

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-white px-4 py-10 font-sans sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <img
            src="/miprecio-logo-pencil.webp"
            alt="Mi Precio"
            className="h-9 w-auto"
          />
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0F172A]"
          >
            {t('gate.logout')}
          </button>
        </header>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[#0F172A] sm:text-[34px]">
            {t('gate.title')}
          </h1>
          <p className="text-[15px] font-medium text-[#64748B]">
            {expired
              ? t('gate.expired')
              : t('gate.subtitle', { name: tenant?.name || '' })}
          </p>
        </div>

        {confirming && (
          <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-2xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm font-semibold text-[#5B21B6]">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DDD6FE] border-t-[#7C3AED]" />
            {t('gate.confirming')}
          </div>
        )}

        {error && (
          <p className="mx-auto w-full max-w-xl rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-center text-sm font-medium text-[#DC2626]">
            {error}
          </p>
        )}

        {!isOwner ? (
          <p className="mx-auto w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 text-center text-sm font-semibold text-[#475569]">
            {t('gate.ownerOnly')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex flex-col gap-3 rounded-3xl border bg-white p-6 shadow-[0_18px_50px_-30px_rgba(30,27,75,0.4)] ${plan.popular ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/15' : 'border-[#E2E8F0]'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[17px] font-extrabold text-[#0F172A]">
                      {plan.name}
                    </span>
                    {plan.popular && (
                      <span className="shrink-0 rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
                        {t('bill.recommended')}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-medium leading-relaxed text-[#64748B]">
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[30px] font-black leading-none text-[#0F172A]">
                      {plan.price}
                    </span>
                    <span className="pb-0.5 text-[12px] font-semibold text-[#94A3B8]">
                      {plan.cadence}
                    </span>
                  </div>
                  {plan.trialLabel && (
                    <span className="w-fit rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#047857]">
                      {plan.trialLabel}
                    </span>
                  )}
                  <ul className="flex flex-col gap-2 border-t border-[#F1F5F9] pt-4">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-[13px]"
                      >
                        <span className="text-[#10B981]">
                          <CheckIcon />
                        </span>
                        <span className="font-medium text-[#475569]">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={choosing !== null}
                    onClick={() => choosePlan(plan.id)}
                    className="mt-auto flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-[14px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(124,58,237,0.5)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {choosing === plan.id
                      ? t('gate.opening')
                      : t('gate.choose')}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-[12px] font-medium text-[#94A3B8]">
                {t('gate.trialNote')}
              </p>
              <button
                type="button"
                disabled={checking}
                onClick={recheck}
                className="text-[13px] font-bold text-[#7C3AED] hover:underline disabled:opacity-60 disabled:no-underline"
              >
                {checking ? t('gate.rechecking') : t('gate.recheck')}
              </button>
              {noPaymentYet && (
                <p className="max-w-md text-center text-[12px] font-semibold text-[#B45309]">
                  {t('gate.recheckEmpty')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChoosePlanScreen
