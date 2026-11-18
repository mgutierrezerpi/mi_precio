import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectTenant } from '../store/slices/authSlice'
import { fetchPlanInfo } from '../store/slices/planSlice'
import type { PlanId } from '../types'
import { planHasFeature, type PlanFeature } from './plans'

/** What the account can do right now, as the API decides it.
 *
 *  `tenant.plan` is only what was paid for: it stays "free" during the trial,
 *  when the account runs on Pro. Anything that unlocks or labels a feature reads
 *  from here. `settled` is false until the API answers, so a screen does not
 *  flash a locked state first; if the request fails it falls back to `tenant.plan`. */
export function usePlanInfo() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const state = useAppSelector((root) => root.plan)
  const tenantId = tenant?.id
  const storedPlan: PlanId = tenant?.plan ?? 'free'

  useEffect(() => {
    if (tenantId) void dispatch(fetchPlanInfo({ tenantId, storedPlan }))
  }, [dispatch, storedPlan, tenantId])

  const refresh = useCallback(async () => {
    if (!tenantId) return null
    const result = await dispatch(fetchPlanInfo({ tenantId, force: true }))
    return fetchPlanInfo.fulfilled.match(result) ? result.payload : null
  }, [dispatch, tenantId])

  const info = state.tenantId === tenantId ? state.info : null
  const failed = state.tenantId === tenantId && state.status === 'failed'
  const plan = info?.plan ?? storedPlan
  const hasFeature = (feature: PlanFeature) =>
    info?.features
      ? info.features.includes(feature)
      : planHasFeature(plan, feature)

  return {
    info,
    plan,
    hasFeature,
    refresh,
    settled: info !== null || failed,
    onTrial: info?.trialActive === true,
  }
}
