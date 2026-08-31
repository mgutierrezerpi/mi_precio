import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../../lib/i18n'
import api from '../../services/api'
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

const CONFIRM_POLL_MS = 3000
const CONFIRM_POLL_TRIES = 20

export function useChoosePlan() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const needsPlan = useAppSelector(selectNeedsPlan)
  const isOwner = useAppSelector(selectIsOwner)
  const [info, setInfo] = useState<PlanInfo | null>(null)
  const [choosing, setChoosing] = useState<PlanId | null>(null)
  const [confirming, setConfirming] = useState(() =>
    new URLSearchParams(window.location.search).has('checkout_plan')
  )
  const [checking, setChecking] = useState(false)
  const [noPaymentYet, setNoPaymentYet] = useState(false)
  const [returnedOrderId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('checkout_plan') ? params.get('order_id') : null
  })
  const [error, setError] = useState<string | null>(null)
  const tenantId = tenant?.id
  const pollsLeft = useRef(CONFIRM_POLL_TRIES)

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

  const recheck = async () => {
    setChecking(true)
    setNoPaymentYet(false)
    setConfirming(false)
    const unlocked = await check()
    setChecking(false)
    if (!unlocked) setNoPaymentYet(true)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get('checkout_plan')) return
    params.delete('checkout_plan')
    params.delete('order_id')
    const qs = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }, [])

  useEffect(() => {
    if (!tenantId || !returnedOrderId) return
    void api.reconcileCheckout(tenantId, returnedOrderId).then(() => check())
  }, [check, returnedOrderId, tenantId])

  useEffect(() => {
    void Promise.resolve().then(check)
  }, [check])

  useEffect(() => {
    if (!confirming) return
    pollsLeft.current = CONFIRM_POLL_TRIES
    const id = setInterval(() => {
      pollsLeft.current -= 1
      if (pollsLeft.current <= 0) return setConfirming(false)
      void check()
    }, CONFIRM_POLL_MS)
    return () => clearInterval(id)
  }, [check, confirming])

  const choosePlan = async (plan: PlanId) => {
    if (!tenantId) return
    setChoosing(plan)
    setError(null)
    if (!info?.billingEnabled) {
      const res = await api.updatePlan(tenantId, plan)
      setChoosing(null)
      if (!res.data) return setError(res.error || 'No se pudo activar el plan.')
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

  return {
    choosing, checking, confirming, error, handleLogout, isAuthenticated,
    isOwner, needsPlan, noPaymentYet, choosePlan, recheck, t,
    tenant, expired: Boolean(info?.billing?.status),
  }
}
