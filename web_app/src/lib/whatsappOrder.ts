/** The shop's WhatsApp number as wa.me wants it (digits only), or null.
 *
 *  `socialWhatsapp` is what shops fill in Settings; `whatsappUrl` is the older
 *  marketplace link and may hold a full wa.me URL. Anything that does not look
 *  like a phone (a wa.me/message/… short link, a typo) counts as no number:
 *  a wrong recipient is worse than letting the customer pick the chat. */
export function whatsappPhone(tenant: {
  socialWhatsapp?: string | null
  whatsappUrl?: string | null
}): string | null {
  for (const raw of [tenant.socialWhatsapp, tenant.whatsappUrl]) {
    const digits = (raw || '').replace(/\D/g, '').replace(/^00/, '')
    if (digits.length >= 6 && digits.length <= 15) return digits
  }
  return null
}

/** The link that sends `message` to the shop's chat.
 *
 *  Without a number wa.me only opens the chat picker, so the order reaches
 *  whoever the customer chooses — keep that only as the last resort. */
export function whatsappOrderHref(phone: string | null, message: string) {
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(message)}`
}
