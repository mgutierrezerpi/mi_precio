import type { ListVersion } from './listContent'

export type ListDesign =
  | 'store'
  | 'classic'
  | 'nordic'
  | 'fine'
  | 'modern'
  | 'photo'
  | 'cards'
  | 'catalog'
  | 'tech'
  | 'pencil-bakery'
  | 'pencil-garden'
  | 'pencil-market'
  | 'pencil-evening'
  | 'pencil-workshop'
  | 'pencil-cheese'
  | 'pencil-flower'
  | 'pencil-flower-summer'
  | 'pencil-flower-winter'
  | 'pencil-flower-spring'
  | 'pencil-wine'
  | 'pencil-cheese-alternating'
  | 'pencil-hardware-alternating'
  | 'pencil-hardware-weekend'
  | 'pencil-hardware-shelf'
  | 'pencil-casa-ritual'
  | 'pencil-casa-bath'
  | 'pencil-casa-signature'
  | 'pencil-casa-services'
  | 'pencil-auto-detail'
  | 'pencil-blush-bloom'
  | 'pencil-nova'
  | 'pencil-beardy'
  | 'pencil-calm-spa'
  | 'pencil-union-barber'
  | 'pencil-studio-mono'
  | 'pencil-beauty-issue'
  | 'pencil-obsidian-quarterly'
  | 'pencil-cafecitos'
  | 'pencil-journal'

export type ListTemplateField =
  | 'hero.eyebrow'
  | 'hero.title'
  | 'hero.body'
  | 'template.font'
  | 'template.checkout_channel'
  | 'template.instagram_handle'
  | 'template.price_format'
  | 'template.divider_icon'
  | 'template.background_color'
  | 'template.text_color'
  | 'template.muted_color'
  | 'template.accent_color'
  | 'template.dark_panel_color'
  | 'template.image'
  | 'template.logo'
  | 'template.profile_name'
  | 'template.profile_image'
  | 'template.story_videos'
  | 'template.story_metrics'
  | 'template.film_images'
  | 'template.collaboration_heading'
  | 'template.stories_heading'
  | 'template.masthead'
  | 'template.brand_label'
  | 'template.edition_label'
  | 'template.uncategorized_label'
  | 'template.image_label'
  | 'template.image_title'
  | 'template.promo_eyebrow'
  | 'template.promo_title'
  | 'template.promo_body'
  | 'template.promo_price'
  | 'template.promo_note'
  | 'template.footer_left'
  | 'template.footer_right'

export interface ListDesignDefinition {
  id: ListDesign
  schemaVersion: 1
  blocks: string[]
  fields: ListTemplateField[]
}

export type ListKind = 'product' | 'service'
export type PriceListVariantType =
  | 'customer'
  | 'promotion'
  | 'seasonal'
  | 'custom'

export interface PriceList {
  id: string
  tenantId: string
  publicSlug?: string
  name: string
  slug: string | null
  published: boolean
  showOnIndex: boolean
  kind: ListKind
  /** Null for a root list; variants are child lists with their own item snapshot. */
  parentListId?: string | null
  variantType?: PriceListVariantType | null
  customerId?: string | null
  startsAt?: string | null
  endsAt?: string | null
  /** Per-list appearance. `null` inherits the tenant's `list*` defaults. */
  design: ListDesign | null
  heroColor: string | null
  bgUrl: string | null
  bgOverlay: boolean | null
  captureViewerInfo?: boolean
  isPrivate?: boolean
  itemCount: number
  /** `published` is intent; `live` is what the plan actually serves. A published
   *  list goes `live: false` when the plan allows fewer lists than are published
   *  (downgrade) or the subscription expired. Nothing is unpublished: paying
   *  again brings it back on its own. */
  live: boolean
  createdAt: string
  updatedAt: string
  versions?: ListVersion[]
}
