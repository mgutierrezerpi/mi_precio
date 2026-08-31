export interface ListVersion {
  id: string
  listId: string
  versionNumber: number
  name: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  /** Authored public-list copy and layout. Null keeps legacy category rendering. */
  content: ListContent | null
  contentRevision: number
  items?: Item[]
}

export interface ListContent {
  schemaVersion: 1
  hero?: {
    eyebrow?: string
    title?: string
    body?: string
    stats?: { value: string; label: string }[]
  }
  /** Copy and media that only templates with editorial regions consume. */
  template?: {
    font?: 'sans' | 'editorial' | 'serif' | 'mono' | 'code-pro'
    checkoutChannel?: 'whatsapp' | 'instagram'
    instagramHandle?: string
    priceFormat?: '$' | 'U$D' | 'USD'
    image?: string
    /** Optional identity and story media for the stories-style collaboration template. */
    logo?: string
    profileName?: string
    profileImage?: string
    storyVideos?: string[]
    storyMetrics?: { views: string; likes: string; comments: string }[]
    filmImages?: string[]
    collaborationHeading?: string
    storiesHeading?: string
    imageLabel?: string
    imageTitle?: string
    promoEyebrow?: string
    promoTitle?: string
    promoBody?: string
    promoPrice?: string
    promoNote?: string
    footerLeft?: string
    footerRight?: string
  }
  blocks: ListContentBlock[]
}

export type ListContentBlock =
  | {
      id: string
      type: 'catalog'
      sections: {
        id: string
        title: string
        body?: string
        source: { kind: 'category'; value: string }
      }[]
    }
  | { id: string; type: 'promotion_strip'; items: string[] }
  | {
      id: string
      type: 'contact'
      showWhatsapp?: boolean
      hours?: { days: string; hours: string }[]
    }

export interface Item {
  id: string
  listVersionId: string
  name: string
  price: string
  currency: string
  description: string | null
  position: number
  imageUrl: string | null
  imageThumbUrl: string | null
  category: string | null
  /** The catalog product this item came from, when applicable (null for manual/imported items). */
  productId: string | null
  createdAt: string
  updatedAt: string
}
