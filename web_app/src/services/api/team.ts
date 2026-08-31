import type { FeatureFlag, Invitation, MemberStats, Role, TeamMember, User, LinkTree } from '../../types'
import type { ApiClient } from './client'

export const teamMethods = {
  getMembers(this: ApiClient, tenantId: string) { return this.request<TeamMember[]>(`/tenants/${tenantId}/members`) },
  getMemberStats(this: ApiClient, tenantId: string) { return this.request<MemberStats>(`/tenants/${tenantId}/members/stats`) },
  getInvitations(this: ApiClient, tenantId: string) { return this.request<Invitation[]>(`/tenants/${tenantId}/invitations`) },
  inviteMember(this: ApiClient, tenantId: string, email: string, role: Role) {
    return this.request<Invitation>(`/tenants/${tenantId}/members`, { method: 'POST', body: JSON.stringify({ email, role }) })
  },
  getPublicLinkTree(this: ApiClient, subdomain: string) {
    return this.request<{ tenant: { name: string; subdomain: string }; linktree: LinkTree }>(`/public/${encodeURIComponent(subdomain)}/linktree`)
  },
  getDeveloperAccess(this: ApiClient) { return this.request<{ enabled: boolean; userId: string }>('/developer/access') },
  getDeveloperFeatureFlags(this: ApiClient) { return this.request<FeatureFlag[]>('/developer/feature-flags') },
  setDeveloperFeatureFlag(this: ApiClient, key: string, tenantId: string, enabled: boolean) {
    const path = `/developer/feature-flags/${encodeURIComponent(key)}/tenants/${encodeURIComponent(tenantId)}`
    return this.request<{ key: string; tenantId: string; enabled: boolean }>(path, { method: 'PUT', body: JSON.stringify({ enabled }) })
  },
  getCurrentUser(this: ApiClient) { return this.request<User>('/users/me') },
  updateMember(this: ApiClient, tenantId: string, userId: string, data: { role?: Role; name?: string; email?: string }) {
    return this.request<TeamMember>(`/tenants/${tenantId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
  updateMemberRole(this: ApiClient, tenantId: string, userId: string, role: Role) {
    return this.request<TeamMember>(`/tenants/${tenantId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) })
  },
  removeMember(this: ApiClient, tenantId: string, userId: string) {
    return this.request<{ deleted: boolean }>(`/tenants/${tenantId}/members/${userId}`, { method: 'DELETE' })
  },
  cancelInvitation(this: ApiClient, tenantId: string, invitationId: string) {
    return this.request<{ deleted: boolean }>(`/tenants/${tenantId}/invitations/${invitationId}`, { method: 'DELETE' })
  },
}
