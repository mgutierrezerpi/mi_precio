import { Navigate } from 'react-router-dom'
import { ChoosePlanContent } from './ChoosePlanContent'
import { useChoosePlan } from './useChoosePlan'

/** Blocks CRM access until the tenant selects an active paid plan. */
export function ChoosePlanScreen() {
  const plan = useChoosePlan()
  if (!plan.isAuthenticated) return <Navigate to="/" replace />
  if (!plan.isPlanStatusKnown) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#F5F3FF] px-4 text-[#0F172A]"
        role="status"
      >
        <p className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold shadow-sm">
          Verificando el estado de tu cuenta…
        </p>
      </div>
    )
  }
  if (!plan.needsPlan && !plan.isPlanRequired)
    return <Navigate to="/admin" replace />
  return (
    <ChoosePlanContent
      choosing={plan.choosing}
      checking={plan.checking}
      confirming={plan.confirming}
      error={plan.error}
      expired={plan.expired}
      isOwner={plan.isOwner}
      noPaymentYet={plan.noPaymentYet}
      tenant={plan.tenant}
      t={plan.t}
      onChoosePlan={plan.choosePlan}
      onLogout={plan.handleLogout}
      onRecheck={plan.recheck}
    />
  )
}

export default ChoosePlanScreen
