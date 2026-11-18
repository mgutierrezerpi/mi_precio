/** Which privacy notice the cart shows under the send button.
 *
 *  It has to match what `rememberCartContact` does with the form: a shop taking
 *  leads keeps these details, any other shop never receives them outside the
 *  message itself. `leadsEnabled` comes from the public tenant, where the API
 *  already accounts for the shop's plan. */
export const cartTrustKey = (
  leadsEnabled: boolean | undefined,
  channel: 'whatsapp' | 'instagram'
) => {
  if (leadsEnabled) return 'store.cartTrustLeads'
  return channel === 'instagram'
    ? 'store.cartTrustInstagram'
    : 'store.cartTrustWhatsapp'
}
