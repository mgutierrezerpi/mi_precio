import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { refreshCurrentUser, selectIsAuthenticated, selectNeedsPlan } from '../store/slices/authSlice'

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

  return <Outlet />
}

export default AdminExperienceLayout
