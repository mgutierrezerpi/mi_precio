import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  refreshCurrentUser,
  selectIsAuthenticated,
  selectNeedsPlan,
  selectTenant,
} from '../store/slices/authSlice'

export function AdminExperienceLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const needsPlan = useAppSelector(selectNeedsPlan)
  const tenant = useAppSelector(selectTenant)
  const [renderedAt] = useState(() => Date.now())

  useEffect(() => {
    if (isAuthenticated) dispatch(refreshCurrentUser())
  }, [dispatch, isAuthenticated])

  // No plan, no CRM. The API enforces the same rule (require_active_plan), this
  // just keeps the user on the plan screen instead of an empty panel.
  if (needsPlan) return <Navigate to="/plans" replace />

  const trialEnd = tenant?.trialEndsAt ? new Date(tenant.trialEndsAt).getTime() : 0
  const trialDays = trialEnd > renderedAt
    ? Math.max(1, Math.ceil((trialEnd - renderedAt) / 86_400_000))
    : 0

  return <>
    {trialDays > 0 && (tenant?.plan ?? 'free') === 'free' && (
      <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-[#4C1D95] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        <span>Prueba Pro: te quedan {trialDays} {trialDays === 1 ? 'día' : 'días'}. No necesitás tarjeta.</span>
        <button
          type="button"
          onClick={() => navigate('/admin/settings?section=billing')}
          className="shrink-0 rounded-lg bg-white px-3 py-1 font-bold text-[#5B21B6]"
        >
          Elegir plan
        </button>
      </div>
    )}
    <Outlet />
  </>
}

export default AdminExperienceLayout
