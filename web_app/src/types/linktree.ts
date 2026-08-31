

export type LinkTreeLinkStyle = 'featured' | 'dark' | 'light'
export type LinkTreeTemplate = 'botanical' | 'editorial' | 'atelier'
export type LinkTreeFont = 'sans' | 'editorial' | 'mono' | 'code-pro'

export interface LinkTreeLink {
  id: string | null
  title: string
  description: string | null
  url: string
  icon: string
  style: LinkTreeLinkStyle
  enabled: boolean
}

export interface LinkTree {
  id: string
  tenantId: string
  publicSlug: string
  displayName: string
  handle: string | null
  bio: string | null
  avatarUrl: string | null
  accentColor: string
  backgroundColor: string
  template: LinkTreeTemplate
  font: LinkTreeFont
  tags: string[]
  links: LinkTreeLink[]
  instagramUrl: string | null
  tiktokUrl: string | null
  emailUrl: string | null
  whatsappUrl: string | null
  websiteUrl: string | null
  locationUrl: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}
