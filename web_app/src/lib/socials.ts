/** The shop's social links: one definition shared by the Settings form that
 *  captures them and the public footer that renders them.
 *
 *  `socialWhatsapp` holds digits, not a URL — shops know their phone number,
 *  not their wa.me link — so `hrefOf` builds the link at render time. */

export type SocialId =
  | 'socialInstagram'
  | 'socialFacebook'
  | 'socialWhatsapp'
  | 'socialTiktok'
  | 'socialWebsite'

export interface SocialDef {
  id: SocialId
  /** i18n key for the field label. */
  tKey: string
  /** Shown in the empty input. These spell out the full URL on purpose: the
   *  shop is meant to paste the link straight from its profile, which is the
   *  one thing it can always do without knowing how we build URLs. A pasted
   *  handle still works — the API normalises it — but we do not ask for one. */
  placeholder: string
}

export const SOCIALS: SocialDef[] = [
  {
    id: 'socialInstagram',
    tKey: 'social.instagram',
    placeholder: 'https://instagram.com/minegocio',
  },
  {
    id: 'socialFacebook',
    tKey: 'social.facebook',
    placeholder: 'https://facebook.com/minegocio',
  },
  { id: 'socialWhatsapp', tKey: 'social.whatsapp', placeholder: '+598 99 123 456' },
  {
    id: 'socialTiktok',
    tKey: 'social.tiktok',
    placeholder: 'https://tiktok.com/@minegocio',
  },
  {
    id: 'socialWebsite',
    tKey: 'social.website',
    placeholder: 'https://minegocio.uy',
  },
]

/** Values as held on the tenant. Kept loose so both the saved tenant and the
 *  in-progress Settings form can be passed in. */
export type SocialValues = Partial<Record<SocialId, string | null | undefined>>

/** The URL to open, or null when the shop left this network empty.
 *
 *  WhatsApp is the only one built here: everything else was already normalised
 *  to a full URL by the API (controllers/input_types/socials.py). */
export function hrefOf(id: SocialId, value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (id === 'socialWhatsapp') {
    const digits = trimmed.replace(/\D/g, '')
    return digits ? `https://wa.me/${digits}` : null
  }
  // Defensive: a tenant row written before the API normalised these could
  // still hold a scheme-less value, and a link with no scheme resolves as a
  // relative path — which would trap the customer inside the public page.
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** i18n key for what is wrong with this value, or null when it is fine.
 *
 *  Mirrors only the *rejection* rules of the API's normaliser
 *  (controllers/input_types/socials.py) — never its rewriting, which stays
 *  server-side so there is one canonical form. This exists because a rejected
 *  PATCH surfaces as a bare "Error 422": FastAPI sends validation detail as a
 *  list, which the client cannot turn into a sentence a shop can act on. */
export function socialError(id: SocialId, raw: string): string | null {
  const value = raw.trim().replace(/^@+/, '').trim()
  if (!value) return null

  if (id === 'socialWhatsapp') {
    const digits = value.replace(/\D/g, '').replace(/^00/, '')
    return digits.length >= 6 && digits.length <= 15 ? null : 'social.error.phone'
  }

  // A bare handle is valid on the networks whose profile URL we can build.
  const isHandle = /^[A-Za-z0-9._-]+$/.test(value) && !value.includes('.')
  if (isHandle) {
    return id === 'socialWebsite' ? 'social.error.link' : null
  }
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`
  if (url.length > 500) return 'social.error.long'
  return /^https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}(\/[^\s]*)?$/.test(url)
    ? null
    : 'social.error.link'
}

/** Only the networks this shop actually filled in, in display order. */
export function activeSocials(values: SocialValues) {
  return SOCIALS.map((social) => ({
    ...social,
    href: hrefOf(social.id, values[social.id]),
  })).filter((social): social is SocialDef & { href: string } => social.href !== null)
}
