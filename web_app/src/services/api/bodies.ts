import type { LinkTree, ListVersion } from '../../types'

export function productBody<T extends {
  imageUrl?: string | null
  imageThumbUrl?: string | null
  priceListIds?: string[]
}>(data: T) {
  const { imageUrl, imageThumbUrl, priceListIds, ...rest } = data
  return {
    ...rest,
    ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
    ...(imageThumbUrl !== undefined ? { image_thumb_url: imageThumbUrl } : {}),
    ...(priceListIds !== undefined ? { price_list_ids: priceListIds } : {}),
  }
}

export function listContentBody(content: NonNullable<ListVersion['content']>) {
  const template = content.template
  const map: Record<string, unknown> = {}
  if (template) {
    const keys = {
      font: 'font', checkoutChannel: 'checkout_channel', instagramHandle: 'instagram_handle',
      priceFormat: 'price_format', image: 'image', logo: 'logo', profileName: 'profile_name',
      profileImage: 'profile_image', storyVideos: 'story_videos', storyMetrics: 'story_metrics',
      filmImages: 'film_images', collaborationHeading: 'collaboration_heading',
      storiesHeading: 'stories_heading', imageLabel: 'image_label', imageTitle: 'image_title',
      promoEyebrow: 'promo_eyebrow', promoTitle: 'promo_title', promoBody: 'promo_body',
      promoPrice: 'promo_price', promoNote: 'promo_note', footerLeft: 'footer_left', footerRight: 'footer_right',
    }
    for (const [key, apiKey] of Object.entries(keys)) {
      if (template[key as keyof typeof template] !== undefined) map[apiKey] = template[key as keyof typeof template]
    }
  }
  return {
    schema_version: content.schemaVersion,
    ...(content.hero ? { hero: content.hero } : {}),
    ...(template ? { template: map } : {}),
    blocks: content.blocks.map((block) => {
      if (block.type !== 'contact') return block
      const { showWhatsapp, ...rest } = block
      return { ...rest, ...(showWhatsapp === undefined ? {} : { show_whatsapp: showWhatsapp }) }
    }),
  }
}

export function magazinePageBody(data: {
  position?: number; pageType?: string; title?: string | null
  imageUrl?: string | null; content?: Record<string, unknown> | null
}) {
  const { pageType, imageUrl, ...rest } = data
  return {
    ...rest,
    ...(pageType === undefined ? {} : { page_type: pageType }),
    ...(imageUrl === undefined ? {} : { image_url: imageUrl }),
  }
}

export function linkTreeBody(data: Partial<LinkTree>) {
  const body = { ...data }
  delete body.tenantId; delete body.id; delete body.createdAt; delete body.updatedAt
  const map: Record<string, string> = {
    publicSlug: 'public_slug', displayName: 'display_name', avatarUrl: 'avatar_url',
    accentColor: 'accent_color', backgroundColor: 'background_color', instagramUrl: 'instagram_url',
    tiktokUrl: 'tiktok_url', emailUrl: 'email_url', whatsappUrl: 'whatsapp_url', websiteUrl: 'website_url',
    locationUrl: 'location_url',
  }
  return Object.fromEntries(Object.entries(body).map(([key, value]) => [map[key] ?? key, value]))
}
