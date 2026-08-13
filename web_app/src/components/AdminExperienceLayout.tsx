import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  refreshCurrentUser,
  selectIsAuthenticated,
  selectNeedsPlan,
} from '../store/slices/authSlice'
import { OnboardingTour } from '../screens/admin/crm/OnboardingTour'

export function AdminExperienceLayout() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const needsPlan = useAppSelector(selectNeedsPlan)

  useEffect(() => {
    if (isAuthenticated) dispatch(refreshCurrentUser())
  }, [dispatch, isAuthenticated])

  // No plan, no CRM. The API enforces the same rule (require_active_plan), this
  // just keeps the user on the plan screen instead of an empty panel.
  if (needsPlan) return <Navigate to="/planes" replace />

  // The tour is mounted here, past the plan gate: it teaches the CRM, so it
  // must not run over the plan screen — and never over the public list, which
  // is not part of this layout at all.
  return (
    <>
      <Outlet />
      <OnboardingTour />
    </>
  )
}

export default AdminExperienceLayout
