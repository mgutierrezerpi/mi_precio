import type { PlanId, PlanInfo, Tenant } from '../../types'
import type { ApiClient } from './client'

export const billingMethods = {
  getPlan(this: ApiClient, tenantId: string) { return this.request<PlanInfo>(`/tenants/${tenantId}/plan`) },
  updatePlan(this: ApiClient, tenantId: string, plan: PlanId) {
    return this.request<Tenant>(`/tenants/${tenantId}/plan`, { method: 'PATCH', body: JSON.stringify({ plan }) })
  },
  createCheckout(this: ApiClient, tenantId: string, plan: PlanId, redirectUrl?: string) {
    return this.request<{ url: string }>('/billing/checkouts', {
      method: 'POST', body: JSON.stringify({ tenant_id: tenantId, plan, redirect_url: redirectUrl }),
    })
  },
  reconcileCheckout(this: ApiClient, tenantId: string, orderId: string) {
    return this.request<{ status: string; subscriptionId?: string }>('/billing/reconcile-checkout', {
      method: 'POST', body: JSON.stringify({ tenant_id: tenantId, order_id: orderId }),
    })
  },
  cancelSubscription(this: ApiClient, tenantId: string) {
    return this.request<Tenant>('/billing/cancellations', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) })
  },
  resumeSubscription(this: ApiClient, tenantId: string) {
    return this.request<Tenant>('/billing/resumptions', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) })
  },
  createSupportTicket(this: ApiClient, subject: string, description: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    return this.request<{ id: number | string; status: string }>('/support/tickets', {
      method: 'POST', body: JSON.stringify({ subject, description, priority }),
    })
  },
}
