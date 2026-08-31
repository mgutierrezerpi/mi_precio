import type { Customer, CustomerDetail, CustomerStats, Lead, LeadStatus, Order } from '../../types'
import type { ApiClient } from './client'
import type { CustomerInput, OrderInput, OrderPatch } from './types'

export const crmMethods = {
  getLeads(this: ApiClient, tenantId: string, status?: LeadStatus) {
    return this.request<Lead[]>(`/tenants/${tenantId}/leads${status ? `?status=${status}` : ''}`)
  },
  setLeadStatus(this: ApiClient, tenantId: string, leadId: string, status: LeadStatus) {
    return this.request<Lead>(`/tenants/${tenantId}/leads/${leadId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },
  convertLead(this: ApiClient, tenantId: string, leadId: string) {
    return this.request<Customer>(`/tenants/${tenantId}/leads/${leadId}/convert`, { method: 'POST' })
  },
  getCustomers(this: ApiClient, tenantId: string) { return this.request<Customer[]>(`/tenants/${tenantId}/customers`) },
  getCustomerStats(this: ApiClient, tenantId: string) { return this.request<CustomerStats>(`/tenants/${tenantId}/customers/stats`) },
  createCustomer(this: ApiClient, tenantId: string, data: CustomerInput) {
    return this.request<Customer>(`/tenants/${tenantId}/customers`, { method: 'POST', body: JSON.stringify(data) })
  },
  getCustomerDetail(this: ApiClient, customerId: string) { return this.request<CustomerDetail>(`/customers/${customerId}`) },
  updateCustomer(this: ApiClient, customerId: string, data: Partial<CustomerInput>) {
    return this.request<Customer>(`/customers/${customerId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
  deleteCustomer(this: ApiClient, customerId: string) { return this.request<{ deleted: boolean }>(`/customers/${customerId}`, { method: 'DELETE' }) },
  createOrder(this: ApiClient, customerId: string, data: OrderInput) {
    return this.request<Order>(`/customers/${customerId}/orders`, { method: 'POST', body: JSON.stringify(data) })
  },
  updateOrder(this: ApiClient, orderId: string, data: OrderPatch) {
    return this.request<Order>(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
  deleteOrder(this: ApiClient, orderId: string) { return this.request<{ deleted: boolean }>(`/orders/${orderId}`, { method: 'DELETE' }) },
}
