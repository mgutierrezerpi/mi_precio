import { useEffect, useMemo, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { CustomerStats, Tenant } from '../../types'
import api, { type VisitStats } from '../../services/api'
import { QR_COLOR_STORAGE_PREFIX } from '../../lib/qrRender'
import { useStoredQrColor } from '../../hooks/useStoredQrColor'
import { localeOf, normalizeLang, useT, type TFn } from '../../lib/i18n'
import { DICT_ANALYTICS } from '../../lib/i18nDictionaryAnalytics'

export function useAnalyticsI18n() {
  const baseT = useT()
  const tenant = useAppSelector(selectTenant)
  const lang = normalizeLang(tenant?.language)
  const t: TFn = (key, vars) => {
    let value = DICT_ANALYTICS[key]?.[lang] ?? baseT(key)
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, String(replacement))
      }
    }
    return value
  }
  return { locale: localeOf(tenant?.language), t }
}

export function useDashboardData(navigate: NavigateFunction) {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const [visits, setVisits] = useState<VisitStats | null>(null)
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)
  const [search, setSearch] = useState('')
  const { copied, copyUrl, qrColor } = usePublicListUrls(tenant)

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getVisitStats(tenant.id).then((res) => {
      if (!cancelled && res.data) setVisits(res.data)
    })
    api.getCustomerStats(tenant.id).then((res) => {
      if (!cancelled && res.data) setCustomerStats(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [tenant?.id])

  const principalList = useMemo(
    () => lists.find((list) => list.showOnIndex) || null,
    [lists]
  )
  const qrList =
    principalList || lists.find((list) => list.published) || lists[0] || null
  const listPath = principalList
    ? `/p/${tenant?.subdomain || 'mi-negocio'}/${principalList.slug || principalList.id}`
    : ''
  const publicUrlDisplay = principalList ? `miprecio.app${listPath}` : ''
  const qrUrl = qrList
    ? `${window.location.origin}/p/${tenant?.subdomain || 'mi-negocio'}/${qrList.slug || qrList.id}?src=qr`
    : window.location.origin

  void customerStats
  return {
    copied,
    copyUrl: () =>
      copyUrl(principalList ? `${window.location.origin}${listPath}` : ''),
    goCreateList: () => navigate('/admin/lists?new=1'),
    goProducts: () => navigate('/admin/items'),
    goQr: () => navigate('/admin/qr'),
    metrics: dashboardMetrics(visits),
    principalList,
    publicUrlDisplay,
    qrColor,
    qrList,
    qrUrl,
    search,
    setSearch,
    tenant,
    visits,
  }
}

function usePublicListUrls(tenant: Tenant | null) {
  const [qrColor] = useStoredQrColor(
    tenant?.id ? `${QR_COLOR_STORAGE_PREFIX}${tenant.id}` : null
  )
  const [copied, setCopied] = useState(false)
  const copyUrl = (url: string) => {
    if (!url) return
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return { copied, copyUrl, qrColor }
}

function dashboardMetrics(visits: VisitStats | null) {
  const listViews = visits?.total ?? 0
  const qrScans = visits?.qr.total ?? 0
  return {
    engagement:
      listViews > 0 ? `${((qrScans / listViews) * 100).toFixed(1)}%` : '0.0%',
    listViews,
    productClicks: 0,
    qrScans,
  }
}
