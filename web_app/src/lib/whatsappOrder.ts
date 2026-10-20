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
    const digits = phoneDigits(raw || '')
    if (digits.length >= 6 && digits.length <= 15) return digits
  }
  return null
}

/** The number inside a typed phone or a WhatsApp link.
 *
 *  A link is read by its parts — the `phone` parameter, or the wa.me path —
 *  because taking every digit glued the message onto the number:
 *  `wa.me/59899123456?text=Hola%2025` became 598991234562025. */
function phoneDigits(raw: string): string {
  const value = raw.trim()
  if (!/^(https?:|whatsapp:|wa\.me\/|api\.whatsapp\.com|www\.)/i.test(value)) {
    return value.replace(/\D/g, '').replace(/^00/, '')
  }
  let url: URL
  try {
    url = new URL(/^[a-z]+:/i.test(value) ? value : `https://${value}`)
  } catch {
    return ''
  }
  const param = url.searchParams.get('phone')
  if (param) return param.replace(/\D/g, '').replace(/^00/, '')
  const segment = url.pathname.split('/').filter(Boolean)[0] || ''
  return /^\+?\d+$/.test(segment) ? segment.replace(/\D/g, '') : ''
}

/** The link that sends `message` to the shop's chat.
 *
 *  Without a number wa.me only opens the chat picker, so the order reaches
 *  whoever the customer chooses — keep that only as the last resort. */
export function whatsappOrderHref(phone: string | null, message: string) {
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(message)}`
}
