import type { Activity, NotifPrefs, NotificationsData } from '../../types'
import type { ApiClient } from './client'
import type { ReportData, VisitStats } from './types'

export const insightMethods = {
  getVisitStats(this: ApiClient, tenantId: string) { return this.request<VisitStats>(`/tenants/${tenantId}/stats/visits`) },
  getActivity(this: ApiClient, tenantId: string, limit = 20, offset = 0) {
    return this.request<Activity[]>(`/tenants/${tenantId}/activity?limit=${limit}&offset=${offset}`)
  },
  getReports(this: ApiClient, tenantId: string, days = 30, listId?: string) {
    const filter = listId ? `&list_id=${encodeURIComponent(listId)}` : ''
    return this.request<ReportData>(`/tenants/${tenantId}/stats/reports?days=${days}${filter}`)
  },
  getNotifications(this: ApiClient, tenantId: string) { return this.request<NotificationsData>(`/tenants/${tenantId}/notifications`) },
  updateNotifPrefs(this: ApiClient, tenantId: string, prefs: Partial<NotifPrefs>) {
    return this.request<{ prefs: NotifPrefs }>(`/tenants/${tenantId}/notifications/prefs`, { method: 'PATCH', body: JSON.stringify(prefs) })
  },
  markNotificationsSeen(this: ApiClient, tenantId: string) {
    return this.request<{ ok: boolean }>(`/tenants/${tenantId}/notifications/seen`, { method: 'POST' })
  },
  getPushPublicKey(this: ApiClient) { return this.request<{ key: string; enabled: boolean }>('/push/public-key') },
  subscribePush(this: ApiClient, tenantId: string, subscription: PushSubscriptionJSON) {
    return this.request<{ ok: boolean }>(`/tenants/${tenantId}/push/subscribe`, { method: 'POST', body: JSON.stringify(subscription) })
  },
  unsubscribePush(this: ApiClient, tenantId: string, endpoint: string) {
    return this.request<{ ok: boolean }>(`/tenants/${tenantId}/push/unsubscribe`, { method: 'POST', body: JSON.stringify({ endpoint }) })
  },
}
