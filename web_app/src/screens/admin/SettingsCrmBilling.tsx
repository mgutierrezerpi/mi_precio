import { useEffect, useState } from 'react'
import type { PlanId, PlanInfo, Tenant } from '../../types'
import { useAppDispatch } from '../../store/hooks'
import { setTenant } from '../../store/slices/authSlice'
import api from '../../services/api'
import { PLANS, planById } from '../../lib/plans'
import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { BillingContent } from './SettingsCrmBillingContent'
import { SectionHeader } from './SettingsCrmShared'

function validPlan(value: string | null): PlanId | null {
  return value && PLANS.some((plan) => plan.id === value)
    ? (value as PlanId)
    : null
}

function checkoutReturnPlan(): PlanId | null {
  return validPlan(
    new URLSearchParams(window.location.search).get('checkout_plan')
  )
}

function storedPendingPlan(key: string | null): PlanId | null {
  return key ? validPlan(sessionStorage.getItem(key)) : null
}

export function BillingSection({
  t,
  tenant,
  isOwner,
}: {
  t: TFn
  tenant: Tenant | null
  isOwner: boolean
}) {
  const dispatch = useAppDispatch()
  const [info, setInfo] = useState<PlanInfo | null>(null)
  const [changing, setChanging] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const tenantId = tenant?.id
  const pendingKey = tenantId ? `billing_pending_plan_${tenantId}` : null
  const returnedPlan = checkoutReturnPlan()
  const [pendingPlan] = useState<PlanId | null>(
    () => returnedPlan ?? storedPendingPlan(pendingKey)
  )

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    api.getPlan(tenantId).then((res) => {
      if (!cancelled && res.data) setInfo(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [tenantId])

  useEffect(() => {
    if (!pendingKey) return
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('order_id')
    if (orderId && tenantId) {
      void api.reconcileCheckout(tenantId, orderId).then(() =>
        api.getPlan(tenantId).then((res) => {
          if (res.data) setInfo(res.data)
        })
      )
      params.delete('order_id')
    }
    if (returnedPlan) {
      sessionStorage.setItem(pendingKey, returnedPlan)
      params.delete('checkout_plan')
      const qs = params.toString()
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${qs ? `?${qs}` : ''}`
      )
    }
  }, [pendingKey, returnedPlan, tenantId])

  const current = info?.plan ?? tenant?.plan ?? 'free'
  const visiblePlan =
    pendingPlan && current !== pendingPlan ? pendingPlan : current

  useEffect(() => {
    if (!pendingKey || current !== pendingPlan) return
    sessionStorage.removeItem(pendingKey)
  }, [current, pendingKey, pendingPlan])

  const choosePlan = async (plan: PlanId) => {
    if (!tenant?.id || plan === current) return
    setChanging(plan)
    setError(null)
    if (!info?.billingEnabled) {
      const res = await api.updatePlan(tenant.id, plan)
      setChanging(null)
      if (res.data) {
        const refreshed = await api.getPlan(tenant.id)
        if (refreshed.data) setInfo(refreshed.data)
        dispatch(setTenant({ ...tenant, plan: refreshed.data?.plan ?? plan }))
      } else setError(res.error || 'No se pudo cambiar el plan.')
      return
    }
    const redirectUrl = `${window.location.origin}/admin/settings?section=billing&checkout_plan=${plan}&order_id=[order_id]`
    const res = await api.createCheckout(tenant.id, plan, redirectUrl)
    setChanging(null)
    if (res.data?.url) {
      if (pendingKey) sessionStorage.setItem(pendingKey, plan)
      window.location.assign(res.data.url)
    } else setError(res.error || 'No se pudo abrir el checkout.')
  }

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.billing')}
        subtitle={t('set.billing.subtitle')}
        canManage={false}
      />
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--tone-red-fg)]/40 bg-[var(--tone-red-bg)] px-4 py-3 text-sm font-semibold text-[var(--tone-red-fg)]">
          <Icon name="alert-triangle" size={16} /> {error}
        </div>
      )}
      {pendingPlan && current !== pendingPlan && (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-sm font-semibold text-[var(--dash-text2)]">
          <Icon name="tags" size={16} />{' '}
          {t('bill.pending', { plan: planById(pendingPlan).name })}
        </div>
      )}
      <BillingContent
        t={t}
        info={info}
        tenant={tenant}
        current={current}
        visiblePlan={visiblePlan}
        pendingPlan={pendingPlan}
        changing={changing}
        isOwner={isOwner}
        onChoose={choosePlan}
      />
    </>
  )
}
