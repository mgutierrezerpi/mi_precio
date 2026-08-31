import type { ListDesign } from './lists'

export type PlanId = 'free' | 'micro' | 'plus' | 'pro'

/** Lemon Squeezy subscription states we surface. `cancelled` still has access
 *  until `endsAt`; `expired` is when the plan actually drops back to free. */
export type BillingStatus =
  | 'on_trial'
  | 'active'
  | 'paid'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired'
  | 'paused'

export interface PlanInfo {
  plan: PlanId
  limits: {
    products: number | null
    lists: number | null
    members: number | null
  }
  usage: { products: number; lists: number; members: number }
  features?: string[]
  /** When false there is no payment gateway, so plan changes apply immediately. */
  billingEnabled?: boolean
  /** True while the tenant still has to pick a plan before the CRM opens up. */
  planRequired?: boolean
  /** camelCase: `api.request` camelizes every response key. Declaring these in
   *  snake_case used to silently break every read (the portal link never
   *  rendered) because the type lied and TS could not catch it. */
  billing?: {
    provider: string | null
    customerId: string | null
    subscriptionId: string | null
    variantId: string | null
    status: BillingStatus | null
    renewsAt: string | null
    endsAt: string | null
    trialEndsAt: string | null
    portalUrl: string | null
    updatePaymentUrl: string | null
    cardBrand: string | null
    cardLastFour: string | null
  }
}

export interface MarketplaceBusiness {
  name: string
  subdomain: string
  logoUrl: string | null
  description: string | null
  address: string | null
  businessCategory: string | null
  whatsappUrl: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  emailUrl: string | null
  distanceKm: number | null
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  currency: string
  plan: PlanId
  /** Signed up after paid onboarding shipped: no plan, no CRM. Absent on
   *  sessions stored before this field existed (treated as not gated). */
  planGate?: boolean
  logoUrl: string | null
  brandColor: string | null
  linktreeAccentColor?: string | null
  description: string | null
  listDesign: ListDesign | null
  listBgUrl: string | null
  listBgOverlay: boolean
  listHeroColor: string | null
  socialInstagram: string | null
  socialFacebook: string | null
  socialTiktok: string | null
  socialWebsite: string | null
  socialWhatsapp: string | null
  leadsEnabled: boolean
  language: string
  timezone: string
  deliveryEnabled: boolean
  marketplaceEnabled: boolean
  marketplaceLatitude: number | null
  marketplaceLongitude: number | null
  businessCategory: string | null
  whatsappUrl: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  legalName: string | null
  taxId: string | null
  address: string | null
  features?: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface FeatureFlagTenant {
  id: string
  name: string
  subdomain: string
  enabled: boolean
  hasOverride: boolean
}

export interface FeatureFlag {
  key: string
  description: string | null
  defaultEnabled: boolean
  tenants: FeatureFlagTenant[]
}

/** Visual template for the public price list. */
